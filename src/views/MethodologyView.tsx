import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Check,
  CircleHelp,
  Eye,
  Hand,
  PenLine,
  Quote,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Workflow,
} from 'lucide-react';
import { SiteView } from '../engine/siteTypes';
import { Chip, Meter } from '../components/ui/primitives';
import { GEMINI_ANSWER, REFLECTIVE_SAMPLE_SUMMARY } from '../engine/coeScript';
import {
  MAX_SIMILARITY,
  MIN_WORDS,
  validateUserSummary,
} from '../engine/dualLayerValidator';

interface Props {
  onNavigate: (view: SiteView) => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */
/* Isi halaman                                                                 */

/** Tiga sub-modul COE. Nama tekniknya sengaja ditampilkan apa adanya. */
const SUBMODULES = [
  {
    n: '01',
    icon: Hand,
    name: 'DOM Interceptor',
    tint: 'var(--color-mode-intercept)',
    body: 'Memantau perubahan DOM halaman AI lewat MutationObserver, menyimpan respons mentah, lalu menahan pertanyaan lanjutan sebelum sempat terkirim.',
    mark: 'MutationObserver',
  },
  {
    n: '02',
    icon: ShieldCheck,
    name: 'Dual-Layer Validator',
    tint: 'var(--color-mode-reflective)',
    body: 'Menguji rangkuman pengguna di dua lapis terpisah: panjang elaborasi, lalu kemiripan semantik dengan jawaban asli AI.',
    mark: 'min. 20 kata · maks. 80%',
  },
  {
    n: '03',
    icon: Workflow,
    name: 'Prompt Orchestrator',
    tint: 'var(--color-mode-socratic)',
    body: 'Merakit pertanyaan Socratic, komparasi, dan petunjuk bertahap sesuai kebutuhan kognitif yang terbaca saat itu.',
    mark: 'structured prompting',
  },
];

/** Empat mode kognitif, urut sesuai perjalanan satu sesi. */
const MODES = [
  {
    key: 'normal',
    n: '01',
    icon: Eye,
    name: 'Normal Mode',
    tag: 'Sistem mengamati, belum masuk',
    tint: 'var(--color-core-500)',
    tint2: 'var(--color-mode-comparison)',
    lead: 'AI menjawab seperti biasa. CORE AI hanya membaca konteksnya.',
    body: 'AI merespons pertanyaan sebagaimana interaksi pada umumnya. Pada tahap ini CORE AI mengidentifikasi konteks dan tujuan penggunaan untuk menentukan apakah interaksi berkaitan dengan pembelajaran, pencarian informasi, atau diskusi.',
    marks: ['Respons mentah disimpan', 'Tujuan pengguna dibaca'],
  },
  {
    key: 'socratic',
    n: '02',
    icon: CircleHelp,
    name: 'Socratic Mode',
    tag: 'Pertanyaan dibalik ke pengguna',
    tint: 'var(--color-mode-socratic)',
    tint2: 'var(--color-core-400)',
    lead: 'Pertanyaan lanjutan ditahan. Kamu yang ditanya lebih dulu.',
    body: 'Ketika pertanyaan lanjutan diajukan, CORE AI tidak langsung memberikan jawaban. Sistem menghadirkan pertanyaan Socratic yang mendorong pengguna mengaktifkan pengetahuan awal, menguji pemahaman, dan menemukan arah jawaban secara mandiri.',
    marks: ['Pengiriman ditahan', 'Pertanyaan pemantik'],
  },
  {
    key: 'reflective',
    n: '03',
    icon: PenLine,
    name: 'Reflective Mode',
    tag: 'Rangkum ulang dengan bahasa sendiri',
    tint: 'var(--color-mode-reflective)',
    tint2: 'var(--color-mode-comparison)',
    lead: 'Teks AI dikunci. Rangkumanmu diuji dua lapis sebelum lolos.',
    body: 'Pengguna merumuskan kembali pemahamannya tanpa menyalin jawaban AI. Rangkuman itu lalu dibandingkan dengan jawaban asli dan perspektif alternatif, supaya pengguna bisa menilai sendiri pemahaman yang sudah terbentuk.',
    marks: ['Teks AI tidak bisa disalin', 'Validasi berlapis'],
  },
  {
    key: 'scaffold',
    n: '04',
    icon: Blocks,
    name: 'Scaffolding Mode',
    tag: 'Bantuan bertahap, bukan jawaban utuh',
    tint: 'var(--color-mode-scaffold)',
    tint2: 'var(--color-mode-reflective)',
    lead: 'Petunjuk diberi sepotong demi sepotong, sisanya kamu yang isi.',
    body: 'Ketika pertanyaan lanjutan menunjukkan kebutuhan bantuan lebih jauh, CORE AI menyesuaikan dukungan dengan kemampuan pengguna. Alih-alih menyerahkan jawaban utuh, sistem menyajikan petunjuk bertahap agar pengguna membangun penalarannya sendiri.',
    marks: ['AI menyesuaikan bantuan berdasarkan kemampuan dan kebutuhan kognitif pengguna'],
  },
];

/** Rujukan yang dipakai esai, dipasangkan dengan bagian produk yang memakainya. */
const REFERENCES = [
  {
    topic: 'Retrieval practice',
    cite: 'Karpicke & Roediger (2008)',
    body: 'Memanggil kembali informasi menguatkan memori jauh lebih baik daripada membacanya ulang. Reflective Mode memaksa proses itu benar-benar terjadi.',
    tint: 'var(--color-mode-reflective)',
  },
  {
    topic: 'Socratic questioning',
    cite: 'Fischer (2019); Bjork (1994)',
    body: 'Pertanyaan yang menggali asumsi merangsang pemikiran kritis dan menghadirkan kesulitan yang justru diinginkan dalam belajar.',
    tint: 'var(--color-mode-socratic)',
  },
  {
    topic: 'Scaffolding',
    cite: 'Wood, Bruner & Ross (1976)',
    body: 'Bantuan sementara memungkinkan seseorang menyelesaikan hal yang belum bisa dikerjakan sendiri, lalu ditarik pelan-pelan seiring kemampuannya naik.',
    tint: 'var(--color-mode-scaffold)',
  },
  {
    topic: 'Evaluasi metakognitif',
    cite: 'Kazemitabaar dkk. (2025); Tankelevitch dkk. (2024)',
    body: 'Membandingkan pemahaman sendiri dengan jawaban AI menahan illusion of certainty, yaitu rasa paham tanpa konstruk pengetahuan yang dalam.',
    tint: 'var(--color-mode-comparison)',
  },
];

/** Dua kalimat pertama jawaban AI. Bahan uji tombol "salin jawaban AI". */
const PASTED_EXCERPT = `${GEMINI_ANSWER.split('\n')[0].split('. ').slice(0, 2).join('. ')}.`;

/** Paragraf pembuka jawaban AI, dipakai sebagai teks pembanding di lab. */
const RAW_EXCERPT = GEMINI_ANSWER.split('\n')[0];

/* -------------------------------------------------------------------------- */
/* Potongan tampilan                                                           */

/**
 * Muncul saat masuk layar. Halaman ini panjang, jadi memutar seluruh animasi
 * sekaligus saat mount berarti sebagian besar gerakannya habis di luar
 * pandangan.
 *
 * Keadaan awalnya tampak, bukan tersembunyi. Isi yang baru terlihat setelah
 * JavaScript mengizinkan adalah isi yang hilang begitu pengamatnya tidak
 * bekerja, dan itu bukan kasus hipotetis: di tab yang tidak dilukis, browser
 * berhenti mengirim entri sama sekali. Karena panggilan pertama selalu datang
 * untuk tiap sasaran yang diamati, kedatangannya sendiri sudah menjadi bukti
 * pengamatnya hidup. Baru setelah itu elemen boleh disembunyikan, dan hanya
 * yang memang sedang di luar pandangan.
 *
 * Yang dianimasikan `translate`, bukan `transform`: util Tailwind v4 memakai
 * properti terpisah itu, jadi menulis `transform` di sini tidak mengenai apa
 * pun.
 */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'awal' | 'sembunyi' | 'tampil'>('awal');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase('tampil');
          io.disconnect();
        } else {
          setPhase((p) => (p === 'awal' ? 'sembunyi' : p));
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motion =
    phase === 'awal'
      ? undefined
      : phase === 'sembunyi'
        ? { opacity: 0, translate: '0 18px' }
        : {
            opacity: 1,
            translate: '0 0',
            transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}ms, translate .6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
          };

  return (
    <div ref={ref} className={className} style={motion}>
      {children}
    </div>
  );
};

/** Kepala seksi: label kecil bertinta, judul display, satu kalimat pengantar. */
const SectionHead: React.FC<{
  kicker: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  tone: string;
  maxWidthClass?: string;
}> = ({ kicker, title, lead, tone, maxWidthClass = 'w-full' }) => (
  <div className={maxWidthClass}>
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: tone, boxShadow: `0 0 12px ${tone}` }}
      />
      <span className="font-mono text-[11px] tracking-[.12em] uppercase text-lo">
        {kicker}
      </span>
    </div>

    <h2 className="mt-3 font-display text-[clamp(23px,3.4vw,33px)] font-extrabold -tracking-[.025em] leading-[1.15] text-hi">
      {title}
    </h2>

    <p className="mt-2.5 text-[14px] md:text-[14.5px] leading-[1.72] text-mid text-justify w-full">
      {lead}
    </p>
  </div>
);

/** Angka besar di ujung rel alur. */
const RailNode: React.FC<{ n: string; tint: string }> = ({ n, tint }) => (
  <span
    aria-hidden="true"
    className="absolute left-0 top-1 w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-2xl
      flex items-center justify-center font-mono text-[14px] md:text-[15px] font-semibold text-white"
    style={{
      background: `linear-gradient(160deg, color-mix(in srgb, ${tint} 82%, white), ${tint})`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), 0 12px 26px -12px color-mix(in srgb, ${tint} 90%, transparent)`,
    }}
  >
    {n}
  </span>
);

/* -------------------------------------------------------------------------- */

/**
 * Lab validasi. Memanggil validator yang sama persis dengan yang dipakai
 * simulasi, bukan tiruannya, jadi angka yang muncul di sini adalah angka yang
 * benar-benar menentukan lolos atau tidaknya sebuah rangkuman.
 */
const ValidatorLab: React.FC = () => {
  const [text, setText] = useState('');

  const result = useMemo(
    () => validateUserSummary(text, GEMINI_ANSWER),
    [text],
  );

  const empty = text.trim().length === 0;
  const pct = Math.round(result.similarityScore * 100);

  /* Pesan ditulis ulang di sini, tidak memakai errorMessage bawaan validator:
     yang di mesin ditujukan ke pengguna yang sedang tertahan di tengah sesi,
     sedangkan yang di halaman ini menerangkan cara kerjanya. */
  const verdict = empty
    ? {
        tone: 'var(--color-lo)',
        icon: ShieldCheck,
        text: 'Ketik rangkuman, atau pakai salah satu contoh di atas untuk melihat kedua lapis bekerja.',
      }
    : !result.isLengthValid
      ? {
          tone: 'var(--color-mode-intercept)',
          icon: TriangleAlert,
          text: `Tertahan di lapis 1. Baru ${result.wordCount} kata, sedangkan elaborasi minimal ${MIN_WORDS} kata.`,
        }
      : !result.isSimilarityValid
        ? {
            tone: 'var(--color-mode-intercept)',
            icon: TriangleAlert,
            text: `Tertahan di lapis 2. Kemiripan ${pct}% melewati ambang ${MAX_SIMILARITY}%, jadi sistem membacanya sebagai penyalinan.`,
          }
        : {
            tone: 'var(--color-mode-reflective)',
            icon: Check,
            text: `Lolos dua lapis. ${result.wordCount} kata dengan kemiripan ${pct}%, sesi boleh lanjut ke komparasi.`,
          };

  const VerdictIcon = verdict.icon;

  const preset = (label: string, value: string, tone: string) => (
    <button
      key={label}
      onClick={() => setText(value)}
      className="h-8 px-3 rounded-full text-[11.5px] font-medium transition-all
        hover:brightness-[.97] active:scale-[.97]"
      style={{
        color: tone,
        background: `color-mix(in srgb, ${tone} 12%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 26%, transparent)`,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="relative rounded-[26px] overflow-hidden glass p-4 md:p-5">
      <div
        className="aurora opacity-50"
        style={
          {
            '--tint': 'var(--color-mode-reflective)',
            '--tint2': 'var(--color-mode-intercept)',
          } as React.CSSProperties
        }
      />

      <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Kiri: teks pembanding, dikunci persis seperti di Reflective Mode */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-wide text-lo">
              Respons mentah AI
            </span>
            <Chip tone="var(--color-mode-intercept)">tidak bisa disalin</Chip>
          </div>

          <div className="mt-2.5 rounded-2xl glass-soft p-3.5">
            <div className="core-no-copy core-locked">
              <p className="text-[12.5px] leading-[1.72] text-mid text-justify w-full">
                {RAW_EXCERPT}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[12px] leading-[1.65] text-lo text-justify w-full">
            Coba seleksi paragraf di atas. Selama Reflective Mode, teks AI
            dikunci lewat <span className="font-mono">user-select: none</span>{' '}
            supaya rangkuman benar-benar disusun ulang, bukan dipindahkan.
          </p>
        </div>

        {/* Kanan: input pengguna dan hasil kedua lapis */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            {preset(
              'Salin jawaban AI',
              PASTED_EXCERPT,
              'var(--color-mode-intercept)',
            )}
            {preset(
              'Tulis versi sendiri',
              REFLECTIVE_SAMPLE_SUMMARY,
              'var(--color-mode-reflective)',
            )}
            {text.length > 0 && (
              <button
                onClick={() => setText('')}
                className="h-8 px-2.5 rounded-full text-[11.5px] font-medium text-lo
                  inline-flex items-center gap-1.5 hover:text-hi hover:bg-black/[.05]
                  active:scale-[.97] transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Kosongkan
              </button>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            spellCheck={false}
            placeholder="Tulis ulang inti jawaban AI dengan kalimatmu sendiri."
            className="mt-2.5 w-full rounded-2xl glass-soft p-3.5 text-[13px] leading-[1.7] text-hi
              placeholder:text-lo resize-none outline-none
              focus:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-mode-reflective)_45%,transparent)]
              transition-shadow"
          />

          {/* Lapis 1 */}
          <div className="mt-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] font-medium text-mid">
                Lapis 1 · Panjang elaborasi
              </span>
              <span className="font-mono text-[11.5px] text-lo">
                {result.wordCount} / {MIN_WORDS} kata
              </span>
            </div>
            <div className="mt-1.5">
              <Meter
                value={result.wordCount}
                max={MIN_WORDS}
                tone="var(--color-mode-reflective)"
                danger={!empty && !result.isLengthValid}
              />
            </div>
          </div>

          {/* Lapis 2, dengan penanda ambang di posisi 80% */}
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] font-medium text-mid">
                Lapis 2 · Kemiripan dengan respons AI
              </span>
              <span className="font-mono text-[11.5px] text-lo">
                {pct}% / maks. {MAX_SIMILARITY}%
              </span>
            </div>
            <div className="mt-1.5 relative">
              <Meter
                value={pct}
                max={100}
                tone="var(--color-mode-reflective)"
                danger={!empty && !result.isSimilarityValid}
              />
              <span
                aria-hidden="true"
                className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-black/25"
                style={{ left: `${MAX_SIMILARITY}%` }}
              />
            </div>
          </div>

          {/* Putusan */}
          <div
            className="mt-3.5 rounded-2xl p-3 flex items-start gap-2.5 transition-colors duration-300"
            style={{
              background: `color-mix(in srgb, ${verdict.tone} 9%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${verdict.tone} 22%, transparent)`,
            }}
          >
            <VerdictIcon
              className="w-4 h-4 shrink-0 mt-px"
              style={{ color: verdict.tone }}
            />
            <p className="text-[12.5px] leading-[1.6] text-mid text-justify flex-1">{verdict.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */

/**
 * Halaman Metodologi. Sama seperti Tentang Kami, isinya boleh menggulir ke
 * dalam: materinya panjang dan memaksanya muat satu layar hanya akan
 * mengecilkan teks sampai tidak terbaca.
 */
export const MethodologyView: React.FC<Props> = ({ onNavigate }) => (
  <main className="relative z-10 flex-1 min-h-0 flex flex-col">
    {/* Bola cahaya latar. Di luar area gulir supaya tidak ikut bergeser. */}
    <div className="absolute -top-24 inset-x-0 bottom-0 pointer-events-none overflow-hidden">
      <div
        className="absolute top-0 left-[8%] w-[340px] h-[340px] rounded-full anim-bob-orb"
        style={{
          background: 'var(--color-core-500)',
          opacity: 0.1,
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute bottom-[-140px] right-[6%] w-[380px] h-[380px] rounded-full anim-bob-orb"
        style={{
          background: 'var(--color-mode-reflective)',
          opacity: 0.09,
          filter: 'blur(100px)',
          animationDelay: '-8s',
          animationDirection: 'reverse',
        }}
      />
    </div>

    <div className="relative flex-1 min-h-0 overflow-y-auto scroll-ink">
      <div className="max-w-[980px] mx-auto px-6 pb-16">
        {/* ---- Kepala halaman ---- */}
        <div className="text-center pt-2 md:pt-6">
          <div className="inline-flex items-center h-8 px-3.5 rounded-full glass anim-rise">
            <span className="text-[11.5px] font-medium tracking-wide text-mid">
              Cognitive Orchestration Engine
            </span>
          </div>

          {/* Batas bawah clamp lebih rendah daripada halaman statis lain: judul
              di sini satu kata panjang yang tidak bisa dipatah, jadi di layar
              375px ia melewati tepi kalau ukurannya disamakan. */}
          <h1
            className="mt-5 font-display font-extrabold -tracking-[.03em] leading-[1.06]
              text-[clamp(28px,5.2vw,62px)] text-hi anim-rise delay-1"
          >
            Metodologi<span className="text-core-500">.</span>
          </h1>

          <p className="mt-4 mx-auto max-w-[600px] text-[14.5px] md:text-[15px] leading-[1.7] text-mid anim-rise delay-2">
            Empat lapis alur kognitif yang bekerja di balik setiap interaksi kamu
            dengan Generative AI, dari menahan jawaban instan sampai memastikan
            pemahamannya benar-benar terbentuk.
          </p>

          {/* Tiga angka yang merangkum seluruh halaman */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 anim-rise delay-3">
            {[
              ['3', 'sub-modul'],
              ['4', 'mode kognitif'],
              ['2', 'lapis validasi'],
            ].map(([num, label]) => (
              <span
                key={label}
                className="inline-flex items-baseline gap-1.5 h-9 px-3.5 rounded-full glass"
              >
                <span className="font-mono text-[15px] font-semibold text-core-500">
                  {num}
                </span>
                <span className="text-[12px] text-mid">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ---- Mesin ---- */}
        <section className="mt-14 md:mt-16">
          <Reveal>
            <SectionHead
              kicker="Mesin"
              tone="var(--color-core-500)"
              maxWidthClass="max-w-[980px]"
              title={
                <>
                  Structured Prompting: <span className="text-core-500">Menata Alur Interaksi</span>
                </>
              }
              lead={
                <>
                  COE mengembangkan <strong>structured prompting</strong> dari sekadar instruksi manual menjadi alur interaksi kognitif yang berlangsung secara adaptif dan otomatis. Ketiga submodulnya bekerja secara berurutan untuk memahami konteks pengguna, menguji tingkat pemahamannya, serta menentukan mode berpikir yang paling sesuai dengan kebutuhan kognitif pengguna.
                </>
              }
            />
          </Reveal>

          <div className="mt-7 grid gap-3.5 md:grid-cols-3">
            {SUBMODULES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.n} delay={i * 90}>
                  <article
                    className="group relative h-full rounded-[24px] overflow-hidden glass p-4
                      transition-[translate,box-shadow] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]
                      hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-26px_rgba(16,24,60,.32)]"
                    style={{ '--tint': s.tint, '--tint2': s.tint } as React.CSSProperties}
                  >
                    <div className="aurora opacity-40 transition-opacity duration-500 group-hover:opacity-70" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            color: s.tint,
                            background: `color-mix(in srgb, ${s.tint} 12%, transparent)`,
                            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${s.tint} 24%, transparent)`,
                          }}
                        >
                          <Icon className="w-[17px] h-[17px]" />
                        </span>
                        <span
                          className="font-mono text-[19px] font-bold -tracking-[.02em]"
                          style={{
                            color: `color-mix(in srgb, ${s.tint} 26%, transparent)`,
                          }}
                        >
                          {s.n}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-[15.5px] font-bold -tracking-[.015em] text-hi">
                        {s.name}
                      </h3>

                      <p className="mt-1.5 text-[12.5px] leading-[1.7] text-mid text-justify w-full">
                        {s.body}
                      </p>

                      <div className="mt-3">
                        <Chip tone={s.tint}>{s.mark}</Chip>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ---- Empat mode ---- */}
        <section className="mt-14 md:mt-20">
          <Reveal>
            <SectionHead
              kicker="Alur"
              tone="var(--color-mode-socratic)"
              title={
                <>
                  Empat mode,{' '}
                  <span className="text-mode-socratic">satu alur berpikir</span>
                </>
              }
              lead="Setiap mode menjalankan satu tujuan: memastikan kamu tidak berhenti pada jawaban, tetapi turut membangun pemahamanmu. Keempat mode tersusun secara progresif mengikuti alur interaksi, mulai dari pertanyaan pemantik hingga pemberian bantuan yang semakin adaptif."
            />
          </Reveal>

          <ol className="mt-8 relative">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              const next = MODES[i + 1];
              return (
                <li
                  key={m.key}
                  className="relative pl-[58px] md:pl-[70px] pb-4 last:pb-0"
                >
                  {/* Ruas rel menuju mode berikutnya, warnanya luntur ke tint tetangga */}
                  {next && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[21px] md:left-[25px] top-[52px] md:top-[60px] bottom-0 w-[2px] rounded-full"
                      style={{
                        background: `linear-gradient(180deg, color-mix(in srgb, ${m.tint} 45%, transparent), color-mix(in srgb, ${next.tint} 22%, transparent))`,
                      }}
                    />
                  )}

                  <RailNode n={m.n} tint={m.tint} />

                  <Reveal delay={40}>
                    <article
                      className="group relative rounded-[24px] overflow-hidden glass p-4 md:p-[18px]
                        transition-[translate,box-shadow] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]
                        hover:-translate-y-1 hover:shadow-[0_28px_56px_-26px_rgba(16,24,60,.3)]"
                      style={
                        {
                          '--tint': m.tint,
                          '--tint2': m.tint2,
                        } as React.CSSProperties
                      }
                    >
                      <div className="aurora opacity-45 transition-opacity duration-500 group-hover:opacity-75" />

                      <div className="relative z-10 w-full">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-px"
                            style={{
                              color: m.tint,
                              background: `color-mix(in srgb, ${m.tint} 12%, transparent)`,
                              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${m.tint} 24%, transparent)`,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </span>

                          <div className="min-w-0">
                            <h3
                              className="font-display text-[16px] md:text-[17.5px] font-bold -tracking-[.02em] leading-tight"
                              style={{ color: m.tint }}
                            >
                              {m.name}
                            </h3>
                            <p className="mt-0.5 font-mono text-[11px] tracking-wide text-lo">
                              {m.tag}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-[13.5px] md:text-[14px] font-medium leading-[1.6] text-hi w-full text-justify">
                          {m.lead}
                        </p>

                        <p className="mt-1.5 text-[12.5px] md:text-[13px] leading-[1.72] text-mid w-full text-justify">
                          {m.body}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.marks.map((mark) => (
                            <Chip key={mark} tone={m.tint}>
                              {mark}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---- Validasi ---- */}
        <section className="mt-14 md:mt-20">
          <Reveal>
            <SectionHead
              kicker="Validasi"
              tone="var(--color-mode-reflective)"
              title={
                <>
                  Dua lapis penjaga{' '}
                  <span className="text-mode-reflective">rangkuman</span>
                </>
              }
              lead="Setiap rangkuman dalam Reflective Mode melalui dua tahap pemeriksaan. Tahap pertama menilai kedalaman elaborasi, sedangkan tahap kedua mengukur kemiripan semantik antara rangkuman dan jawaban asli AI. Jika kemiripan melampaui ambang yang ditetapkan, sistem mengidentifikasi bahwa rangkuman tersebut tidak mencerminkan pemahaman mandiri pengguna."
            />
          </Reveal>

          <Reveal delay={80} className="mt-7">
            <ValidatorLab />
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-3 text-[12px] leading-[1.65] text-lo w-full text-justify">
              Kotak di atas memanggil validator yang sama dengan yang dipakai
              simulasi, jadi angkanya bukan ilustrasi. Di produksi, lapis kedua
              memakai embedding sentence-transformer.
            </p>
          </Reveal>
        </section>

        {/* ---- Landasan ---- */}
        <section className="mt-14 md:mt-20">
          <Reveal>
            <SectionHead
              kicker="Landasan"
              tone="var(--color-mode-comparison)"
              title={
                <>
                  Setiap mode berpijak pada{' '}
                  <span className="text-mode-comparison">temuan yang sudah ada</span>
                </>
              }
              lead="Perancangannya berangkat dari kajian cognitive offloading dan keterlibatan korteks prefrontal dalam mempertahankan proses kognitif. Berdasarkan landasan tersebut, setiap mekanisme dirancang dengan mengadaptasi prinsip-prinsip pembelajaran yang telah memperoleh dukungan empiris."
            />
          </Reveal>

          <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
            {REFERENCES.map((r, i) => (
              <Reveal key={r.topic} delay={(i % 2) * 80}>
                <article
                  className="group relative h-full rounded-[22px] overflow-hidden glass-soft p-4
                    transition-[translate,box-shadow] duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)]
                    hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(16,24,60,.28)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                    style={{ background: r.tint, opacity: 0.55 }}
                  />

                  <Quote
                    className="w-3.5 h-3.5"
                    style={{ color: r.tint }}
                  />

                  <h3 className="mt-2 font-display text-[14.5px] font-bold -tracking-[.015em] text-hi">
                    {r.topic}
                  </h3>

                  <p className="mt-1.5 text-[12.5px] leading-[1.7] text-mid text-justify w-full">
                    {r.body}
                  </p>

                  <p className="mt-2.5 font-mono text-[11px] tracking-wide text-lo">
                    {r.cite}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---- Ajakan ---- */}
        <Reveal className="mt-14 md:mt-16">
          <div className="relative rounded-[26px] overflow-hidden glass p-6 md:p-8 text-center">
            <div
              className="aurora opacity-55"
              style={
                {
                  '--tint': 'var(--color-core-500)',
                  '--tint2': 'var(--color-mode-reflective)',
                } as React.CSSProperties
              }
            />

            <div className="relative z-10">
              <h2 className="font-display text-[clamp(20px,3vw,28px)] font-extrabold -tracking-[.025em] text-hi">
                Empat mode ini bisa kamu jalani sendiri
              </h2>

              <p className="mt-2.5 mx-auto max-w-[480px] text-[13.5px] leading-[1.7] text-mid">
                Simulasi memutar satu sesi utuh, dari pertanyaan pertama sampai
                jawaban yang sengaja dibiarkan rumpang.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => onNavigate('simulasi')}
                  className="h-12 px-6 rounded-full text-[14px] font-semibold text-white
                    bg-gradient-to-r from-core-500 to-core-600
                    shadow-[0_14px_40px_-14px_rgba(16,24,60,.45)] inline-flex items-center gap-2.5
                    hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(16,24,60,.5)]
                    active:scale-[.99] transition-all"
                >
                  Buka Simulasi
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="h-12 px-5 rounded-full text-[13.5px] font-medium text-mid bg-white/85 backdrop-blur-sm
                    shadow-[inset_0_0_0_1px_rgba(16,24,60,.13)] inline-flex items-center gap-2
                    hover:text-hi hover:bg-white active:scale-[.98] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke beranda
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </main>
);
