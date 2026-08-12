import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, GraduationCap, Plus, Quote } from 'lucide-react';
import { SiteView } from '../engine/siteTypes';
import { Chip } from '../components/ui/primitives';

interface Props {
  onNavigate: (view: SiteView) => void;
}

interface Member {
  slug: string;
  name: string;
  /* TODO: peran, ringkas, bio, dan tag di bawah masih isian sementara —
     ganti dengan keterangan sebenarnya. Nama dan foto sudah final. */
  role: string;
  ringkas: string;
  bio: string;
  tags: string[];
  tint: string;
  tint2: string;
}

/** Foto ada di public/team — sudah dipotong 3:4, jadi aman untuk object-cover. */
const TEAM: Member[] = [
  {
    slug: 'zefania-priscila',
    name: 'Zefania Priscila',
    role: 'Riset & Naskah',
    ringkas: 'Menyusun kerangka teori cognitive offloading yang menjadi dasar produk.',
    bio: 'Menerjemahkan temuan riset soal ketergantungan jawaban instan menjadi aturan main yang bisa dieksekusi produk — kapan jawaban ditahan, seberapa lama, dan apa gantinya.',
    tags: ['Kajian literatur', 'Naskah esai'],
    tint: 'var(--color-core-500)',
    tint2: 'var(--color-mode-comparison)',
  },
  {
    slug: 'risyah-eka-setyaningrum',
    name: 'Risyah Eka Setyaningrum',
    role: 'Rekayasa Prototipe',
    ringkas: 'Membangun alur simulasi dan lapisan validasi ganda.',
    bio: 'Menyatukan mesin alur kognitif dengan antarmuka: interception, pertanyaan Socratic, sampai validator dua lapis yang mengecek jawaban sebelum sampai ke pengguna.',
    tags: ['Alur kognitif', 'Integrasi API'],
    tint: 'var(--color-mode-reflective)',
    tint2: 'var(--color-core-400)',
  },
  {
    slug: 'sarah-putri-nashira',
    name: 'Sarah Putri Nashira',
    role: 'Desain & Pengalaman',
    ringkas: 'Merancang dua permukaan yang sengaja dibenturkan: kertas dan kaca.',
    bio: 'Menjaga jarak visual antara halaman jawaban instan dan panel CORE AI, supaya perpindahan mode berpikir terasa oleh pengguna, bukan cuma terbaca.',
    tags: ['Sistem desain', 'Alur pengguna'],
    tint: 'var(--color-mode-socratic)',
    tint2: 'var(--color-mode-comparison)',
  },
];

/**
 * Pembimbing. Dipisah dari TEAM, bukan dijadikan anggota keempat: perannya
 * berbeda, dan menaruhnya sebagai kartu keempat akan memecah barisan tiga.
 */
const MENTOR = {
  slug: 'satriyo-priyo-adi',
  name: 'Satriyo Priyo Adi, S.Psi., M.Sc.',
  kampus: 'Universitas Gadjah Mada',
  /* TODO: kalimat pendampingan di bawah masih isian sementara — ganti dengan
     keterangan sebenarnya. Nama, gelar, dan foto sudah sesuai sampul esai. */
  ringkas:
    'Mendampingi arah kajian dan menjaga tiap klaim dalam esai tetap berpijak pada bukti.',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */

/**
 * Kartu profil. Tiga lapis gerak dipisah supaya transform-nya tidak saling
 * menimpa: pembungkus luar mengayun, lapis tengah mengangkat kartu saat
 * disentuh kursor, lapis dalam memiringkannya.
 *
 * Urutannya tidak sembarangan. Tombol berada di antara ayunan dan dua lapis
 * sisanya, jadi satu-satunya transform di atas kotak sentuh adalah ayunan
 * (dan itu pun dibekukan saat kursor masuk). Angkat dan miring bekerja di
 * bawahnya, sehingga kartu boleh bergerak tanpa kotak sentuhnya ikut bergeser.
 * Tanpa pemisahan ini kartu menghindari kursornya sendiri: begitu terangkat,
 * kursor jatuh di luar tombol, hover batal, kartu turun lagi — berulang.
 */
const MemberCard: React.FC<{
  member: Member;
  index: number;
  open: boolean;
  onToggle: () => void;
}> = ({ member, index, open, onToggle }) => {
  const frameRef = useRef<HTMLDivElement>(null);

  /* Kemiringan kartu dan posisi sorot tidak disimpan sebagai state React.
     Nilai tujuan dikejar tiap frame dengan interpolasi, lalu ditulis langsung
     ke gaya elemen. Dua alasan: mousemove tidak lagi memicu render ulang, dan
     gerakannya tidak lagi bergantung pada transisi CSS — transisi selalu
     dimulai ulang tiap kali nilainya berubah, sehingga kursor yang bergerak
     terus membuatnya tersendat. Interpolasi per frame tidak punya masalah itu. */
  const target = useRef({ x: 0, y: 0, mx: 50, my: 50 });
  const shown = useRef({ x: 0, y: 0, mx: 50, my: 50 });
  const raf = useRef<number | null>(null);

  const tick = useCallback(() => {
    const t = target.current;
    const s = shown.current;
    const k = 0.14;

    s.x += (t.x - s.x) * k;
    s.y += (t.y - s.y) * k;
    s.mx += (t.mx - s.mx) * k;
    s.my += (t.my - s.my) * k;

    const el = frameRef.current;
    if (el) {
      el.style.transform = `perspective(1100px) rotateX(${s.x.toFixed(3)}deg) rotateY(${s.y.toFixed(3)}deg)`;
      el.style.setProperty('--mx', `${s.mx.toFixed(2)}%`);
      el.style.setProperty('--my', `${s.my.toFixed(2)}%`);
    }

    const settled =
      Math.abs(t.x - s.x) < 0.005 &&
      Math.abs(t.y - s.y) < 0.005 &&
      Math.abs(t.mx - s.mx) < 0.05 &&
      Math.abs(t.my - s.my) < 0.05;

    raf.current = settled ? null : requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (raf.current === null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion()) return;
      const r = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      target.current = {
        x: -py * 6,
        y: px * 8,
        mx: (px + 0.5) * 100,
        my: (py + 0.5) * 100,
      };
      start();
    },
    [start],
  );

  const onLeave = useCallback(() => {
    target.current = { ...target.current, x: 0, y: 0 };
    start();
  }, [start]);

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return (
    <div
      /* Ayunan dibekukan selama kursor di dalam kartu — sasaran yang diam jauh
         lebih enak dimiringkan dan diklik daripada sasaran yang hanyut. */
      className="anim-bob anim-bob-hold"
      style={{
        /* Fase ayunan digeser per kartu supaya barisnya tidak naik-turun serempak. */
        animationDelay: `${index * -2.1}s`,
        animationDuration: `${6.4 + index * 0.7}s`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        aria-expanded={open}
        style={
          {
            '--tint': member.tint,
            '--tint2': member.tint2,
          } as React.CSSProperties
        }
        /* Bantalan 8px yang dibatalkan margin negatif: kotak sentuh melar ke
           atas tanpa mengubah tata letak, jadi kartu yang terangkat tetap
           berada di dalamnya. Hanya ke atas — angkatnya juga hanya ke atas,
           dan melar ke bawah malah membuat kotak sentuh kartu bertumpuk
           dengan kartu di bawahnya pada susunan satu kolom. */
        className="group block w-full text-left pt-2 -mt-2 rounded-[30px]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-core-500/60"
      >
        <div
          /* Yang dianimasikan `translate` dan `scale`, bukan `transform` —
             Tailwind v4 memakai properti terpisah itu untuk util -translate-y
             dan scale, jadi menuliskan `transform` di sini tidak mengenai apa
             pun dan angkatnya akan meloncat tanpa easing. */
          className={`transition-[translate,scale,box-shadow] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]
            rounded-[28px] group-hover:-translate-y-2 group-active:scale-[.99]
            group-hover:shadow-[0_30px_60px_-24px_rgba(16,24,60,.34)]
            ${open ? '-translate-y-2' : ''}`}
        >
          <div
            ref={frameRef}
            className="relative rounded-[28px] overflow-hidden glass p-3.5
              will-change-transform [transform:perspective(1100px)]"
          >
            {/* Cahaya berwarna di balik kaca — ikut warna anggota */}
            <div className="aurora opacity-70" />

            {/* Sorot yang mengikuti kursor */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
              style={{
                background:
                  'radial-gradient(240px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, var(--tint) 20%, transparent), transparent 70%)',
              }}
            />

            <div className="relative z-10">
              {/* ---- Bingkai foto ----
                  Latar studio pada foto asli sudah dilepas, jadi bidang di balik
                  siluet ini yang menentukan warnanya. Itu sebabnya foto berlatar
                  merah dan berlatar putih kini terbaca sebagai satu set. */}
              <div
                className="relative rounded-[20px] overflow-hidden aspect-[4/5] shadow-[inset_0_0_0_1px_rgba(16,24,60,.07)]"
                style={{
                  background:
                    'linear-gradient(165deg, color-mix(in srgb, var(--tint) 15%, white), color-mix(in srgb, var(--tint2) 9%, white) 55%, white)',
                }}
              >
                {/* Lingkaran cahaya di belakang kepala */}
                <div
                  className="absolute inset-x-0 top-[6%] h-[62%] pointer-events-none
                    transition-opacity duration-500 opacity-70 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(closest-side, color-mix(in srgb, var(--tint) 34%, transparent), transparent)',
                  }}
                />

                <img
                  src={`/team/${member.slug}.webp`}
                  alt={member.name}
                  width={640}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="relative w-full h-full object-contain object-bottom select-none
                    origin-bottom transition-transform duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)]
                    group-hover:scale-[1.045]"
                />

                {/* Nomor urut, mengambang dengan fase sendiri */}
                <div
                  className="absolute top-3 left-3 anim-bob"
                  style={{ animationDelay: `${index * -1.4 - 0.6}s`, animationDuration: '5.2s' }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center
                      text-[11px] font-mono font-medium text-white backdrop-blur-md"
                    style={{
                      background: 'color-mix(in srgb, var(--tint) 72%, transparent)',
                      boxShadow:
                        'inset 0 0 0 1px rgba(255,255,255,.35), 0 6px 16px -6px rgba(16,24,60,.5)',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Peran, menempel di kaki foto */}
                <div className="absolute left-3 right-3 bottom-3">
                  <span
                    className="inline-flex items-center h-7 px-3 rounded-full backdrop-blur-md
                      text-[11.5px] font-medium text-white"
                    style={{
                      background: 'rgba(16,24,60,.42)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.28)',
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {/* ---- Keterangan ---- */}
              <div className="px-1.5 pt-4 pb-1">
                <div className="flex items-start gap-2">
                  <h3 className="font-display text-[17px] font-bold -tracking-[.015em] text-hi leading-tight flex-1">
                    {member.name}
                  </h3>

                  {/* Penanda buka-tutup */}
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                      transition-all duration-300 ${open ? 'rotate-45' : ''}`}
                    style={{
                      background: 'color-mix(in srgb, var(--tint) 12%, transparent)',
                      color: 'var(--tint)',
                      boxShadow:
                        'inset 0 0 0 1px color-mix(in srgb, var(--tint) 26%, transparent)',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] leading-[1.6] text-mid">
                  {member.ringkas}
                </p>

                {/* Rincian — tinggi dianimasikan lewat grid 0fr → 1fr, jadi tidak
                    perlu mengukur tinggi isinya. */}
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="pt-3">
                      <div className="rounded-2xl glass-soft p-3">
                        <Quote
                          className="w-3.5 h-3.5 mb-1.5"
                          style={{ color: 'var(--tint)' }}
                        />
                        <p className="text-[12.5px] leading-[1.65] text-mid">
                          {member.bio}
                        </p>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {member.tags.map((t) => (
                          <Chip key={t} tone={member.tint}>
                            {t}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
          </div>
        </div>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */

/**
 * Tiga garis dari kaki tiap kartu yang menyatu ke satu titik di kartu
 * pembimbing — silsilah, bukan hiasan: warnanya diambil dari tint tiap anggota
 * sehingga jelas garis mana milik siapa.
 *
 * `preserveAspectRatio="none"` membuat kotaknya ikut melar mengikuti lebar
 * kolom, jadi ujung atas tiap garis tetap jatuh di tengah kartunya berapa pun
 * lebar layar. Konsekuensinya goresan ikut melar juga, dan itu ditolak lewat
 * `vector-effect` supaya tebalnya tetap satu piksel.
 */
const Lineage: React.FC = () => (
  <div className="hidden md:block" aria-hidden="true">
    <svg
      viewBox="0 0 900 96"
      preserveAspectRatio="none"
      className="w-full h-[74px] overflow-visible"
    >
      {TEAM.map((m, i) => {
        const x = 150 + i * 300;
        return (
          <path
            key={m.slug}
            d={`M${x} 0 C${x} 58, 450 40, 450 96`}
            fill="none"
            stroke={m.tint}
            strokeWidth={1.25}
            strokeOpacity={0.42}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="anim-draw"
            style={
              {
                '--len': 340,
                animationDelay: `${0.3 + i * 0.12}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </svg>
  </div>
);

/**
 * Kartu pembimbing. Bentuknya sengaja melintang, kebalikan dari tiga kartu
 * tegak di atasnya — satu baris yang menampung ketiganya, bukan kartu keempat
 * yang sejajar. Cahaya di balik kacanya campuran tiga tint anggota, jadi
 * hubungannya terbaca dari warna saja tanpa perlu ditulis.
 */
const MentorCard: React.FC = () => (
  <div
    className="group relative rounded-[28px] overflow-hidden glass p-3.5 md:p-4
      transition-[translate,box-shadow] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]
      hover:-translate-y-1 hover:shadow-[0_30px_60px_-26px_rgba(16,24,60,.3)]"
    style={
      {
        '--tint': TEAM[0].tint,
        '--tint2': TEAM[2].tint,
      } as React.CSSProperties
    }
  >
    <div className="aurora opacity-50" />

    {/* Sapuan tint anggota tengah — dua lainnya sudah dibawa .aurora */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[.13]"
      style={{
        background: `radial-gradient(70% 120% at 50% 0%, ${TEAM[1].tint}, transparent 70%)`,
      }}
    />

    {/* Bertumpuk di layar sempit. Bersisian di lebar 320px menyisakan kolom
        teks ~150px: namanya patah tiga baris dan chip-nya berjatuhan. */}
    <div className="relative z-10 flex flex-col items-start gap-3.5 md:flex-row md:items-center md:gap-6">
      {/* Potret, dibingkai sama seperti kartu anggota supaya satu keluarga */}
      <div
        className="relative shrink-0 w-[120px] md:w-[132px] aspect-[4/5] rounded-[20px] overflow-hidden
          shadow-[inset_0_0_0_1px_rgba(16,24,60,.07)]"
        style={{
          background:
            'linear-gradient(165deg, color-mix(in srgb, var(--tint) 15%, white), color-mix(in srgb, var(--tint2) 9%, white) 55%, white)',
        }}
      >
        <div
          className="absolute inset-x-0 top-[6%] h-[62%] pointer-events-none
            transition-opacity duration-500 opacity-70 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--tint) 32%, transparent), transparent)',
          }}
        />
        <img
          src={`/team/${MENTOR.slug}.webp`}
          alt={MENTOR.name}
          width={640}
          height={800}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="relative w-full h-full object-contain object-bottom select-none
            origin-bottom transition-transform duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)]
            group-hover:scale-[1.04]"
        />
      </div>

      {/* Keterangan */}
      <div className="min-w-0">
        <span
          className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-[11px] font-medium
            tracking-wide backdrop-blur-md"
          style={{
            color: 'var(--color-core-600)',
            background: 'color-mix(in srgb, var(--color-core-500) 11%, transparent)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-core-500) 24%, transparent)',
          }}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Dosen Pembimbing
        </span>

        <h3 className="mt-2.5 font-display text-[18px] md:text-[21px] font-bold -tracking-[.02em] text-hi leading-tight">
          {MENTOR.name}
        </h3>

        <p className="mt-1 font-mono text-[11px] tracking-wide text-lo">
          {MENTOR.kampus}
        </p>

        <p className="mt-2.5 text-[13px] md:text-[13.5px] leading-[1.65] text-mid max-w-[46ch]">
          {MENTOR.ringkas}
        </p>

        {/* Nama ketiganya, memakai warna kartu masing-masing — pasangan dari
            garis silsilah di atas, dan satu-satunya penanda arah bimbingan
            yang tetap terbaca saat garis itu disembunyikan di layar sempit. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] text-lo mr-0.5">Membimbing</span>
          {TEAM.map((m) => (
            <Chip key={m.slug} tone={m.tint}>
              {m.name.split(' ')[0]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Sisi kanan — naskah yang dibimbing. Baru muncul di layar lebar; di
          bawah itu ruangnya habis dipakai potret dan nama, dan menyempitkan
          keduanya demi keterangan ini jelas rugi. */}
      <div className="hidden lg:block ml-auto pl-6 self-stretch border-l border-black/[.08] shrink-0 max-w-[210px]">
        <p className="font-mono text-[10.5px] tracking-wide text-lo">Naskah</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-mid">
          CORE AI — structured prompting sebagai penahan cognitive offloading.
        </p>
        <p className="mt-2 text-[11.5px] text-lo">Lomba Esai Ilmiah PSYFIC 2026</p>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */

/**
 * Halaman Tentang Kami — tiga kartu profil di atas panggung yang sama dengan
 * halaman muka. Berbeda dari halaman lain, isinya boleh menggulir ke dalam
 * supaya kartu tidak terpotong di layar pendek.
 */
export const AboutView: React.FC<Props> = ({ onNavigate }) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main className="relative z-10 flex-1 min-h-0 flex flex-col">
      {/* Bola cahaya latar, mengambang pelan di belakang kartu. Diletakkan di
          luar area gulir supaya tidak ikut bergeser saat halaman digulir.

          Kotak pemotongnya dinaikkan melewati kepala halaman. Bola atas melar
          jauh ke atas dan blurnya masih pekat di ketinggian itu, jadi memotong
          tepat di bawah header menampakkan garis mendatar yang tegas — bukan
          gradien yang memudar, melainkan potongan penampang. Dinaikkan 96px,
          potongannya jatuh di luar layar dan yang tersisa hanya peralihan
          halus. Tetap dipotong, supaya bola bawah tidak melebarkan halaman. */}
      <div className="absolute -top-24 inset-x-0 bottom-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-[6%] w-[340px] h-[340px] rounded-full anim-bob-orb"
          style={{
            background: 'var(--color-core-500)',
            opacity: 0.1,
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute bottom-[-120px] right-[4%] w-[380px] h-[380px] rounded-full anim-bob-orb"
          style={{
            background: 'var(--color-mode-socratic)',
            opacity: 0.09,
            filter: 'blur(100px)',
            animationDelay: '-7s',
            animationDirection: 'reverse',
          }}
        />
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto scroll-ink">
        <div className="max-w-[980px] mx-auto px-6 pb-14">
        {/* ---- Kepala halaman ---- */}
        <div className="text-center pt-2 md:pt-6">
          <div className="inline-flex items-center h-8 px-3.5 rounded-full glass anim-rise">
            <span className="text-[11.5px] font-medium tracking-wide text-mid">
              Tim penyusun CORE AI
            </span>
          </div>

          <h1
            className="mt-5 font-display font-extrabold -tracking-[.03em] leading-[1.06]
              text-[clamp(34px,5.2vw,62px)] text-hi anim-rise delay-1"
          >
            Tentang <span className="text-core-500">Kami</span>
          </h1>

          <p className="mt-4 mx-auto max-w-[560px] text-[14.5px] md:text-[15px] leading-[1.7] text-mid anim-rise delay-2">
            Tiga orang di balik prototipe yang menahan jawaban instan dan
            mengembalikan prosesnya. Ketuk satu kartu untuk membuka rinciannya.
          </p>
        </div>

        {/* ---- Kartu ---- */}
        {/* Jarak antarbaris lebih lega daripada antarkolom: pada susunan satu
            kolom tiap kartu mengayun dengan fase sendiri, jadi butuh ruang
            supaya kotak sentuh dua kartu bertetangga tidak saling menindih. */}
        <div className="mt-9 grid gap-x-5 gap-y-9 md:grid-cols-3 max-w-[320px] md:max-w-none mx-auto">
          {TEAM.map((m, i) => (
            <div
              key={m.slug}
              className="anim-rise"
              style={{ animationDelay: `${0.12 + i * 0.09}s` }}
            >
              <MemberCard
                member={m}
                index={i}
                open={active === m.slug}
                onToggle={() => setActive((v) => (v === m.slug ? null : m.slug))}
              />
            </div>
          ))}
        </div>

        {/* ---- Pembimbing ---- */}
        <div className="mt-8 md:mt-3">
          <Lineage />

          {/* Pengganti garis silsilah di layar sempit: kartunya bertumpuk satu
              kolom, jadi tiga garis yang menyatu tidak punya arti apa-apa. */}
          <div className="md:hidden mx-auto w-px h-8 bg-gradient-to-b from-transparent to-black/[.14]" />

          <div className="anim-rise delay-4 max-w-[320px] md:max-w-none mx-auto">
            <MentorCard />
          </div>
        </div>

        {/* ---- Kaki ---- */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => onNavigate('landing')}
            className="h-11 px-5 rounded-full text-[13.5px] font-medium text-mid bg-white/85 backdrop-blur-sm
              shadow-[inset_0_0_0_1px_rgba(16,24,60,.13)] inline-flex items-center gap-2
              hover:text-hi hover:bg-white active:scale-[.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke beranda
          </button>
        </div>
        </div>
      </div>
    </main>
  );
};
