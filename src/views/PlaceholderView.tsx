import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SiteView } from '../engine/siteTypes';

interface Props {
  title: string;
  onNavigate: (view: SiteView) => void;
}

/**
 * Kerangka halaman statis (Metodologi, Tentang Kami).
 * Isinya sengaja dikosongkan — strukturnya sudah ada, tinggal diisi.
 */
export const PlaceholderView: React.FC<Props> = ({ title, onNavigate }) => (
  <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-6 pb-[76px] text-center">
    <h1 className="font-display font-extrabold -tracking-[.03em] leading-[1.08] text-[clamp(34px,5vw,60px)] text-hi anim-rise">
      {title}
    </h1>

    {title === 'Metodologi' ? (
      <div className="mt-4 text-left max-w-[760px] space-y-6 anim-rise delay-2 overflow-auto max-h-[60vh] pr-4">
        <div className="bg-white/5 p-6 rounded-xl shadow-md space-y-6">
          <p className="text-[16px] text-mid">Empat lapis alur kognitif yang bekerja di balik setiap interaksi kamu dengan Generative AI.</p>

          <div>
            <h2 className="text-[22px] font-extrabold text-core-500 flex items-center gap-3">
              Cognitive Orchestration Engine (COE)
              <span className="inline-block h-1 w-16 bg-core-500 rounded" />
            </h2>
            <blockquote className="mt-3 pl-4 border-l-4 border-core-500 text-[15px] text-lo">
              <strong>Cognitive Orchestration Engine (COE)</strong> merupakan sistem inti yang membedakan CORE AI dari ekstensi <em>prompt-enhancer</em> konvensional. Alih-alih sekadar menyempurnakan instruksi, COE mentransformasikan <em>structured prompting</em> dari perintah manual menjadi <strong>alur intervensi kognitif yang berlangsung secara adaptif</strong>. Sistem ini terdiri atas tiga submodul yang bekerja secara berurutan untuk mendeteksi konteks interaksi, menentukan kebutuhan kognitif, dan mengarahkan pengguna pada mode berpikir yang sesuai.
            </blockquote>
          </div>

          <div>
            <h3 className="text-[18px] font-semibold">Empat Mode, Satu Alur Berpikir</h3>
            <p className="text-[15px]">Setiap mode dirancang agar kamu tidak hanya mencari jawaban, tetapi juga membangun pemahamanmu sendiri.</p>

            <div className="mt-4 grid gap-3">
              <div className="flex gap-3 items-start p-3 rounded-md hover:bg-white/3 transition">
                <div className="flex-none h-8 w-8 rounded-full bg-core-500 text-white flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">01 · Normal Mode</h4>
                  <p className="text-lo">AI merespons pertanyaan sebagaimana interaksi pada umumnya. Pada tahap ini, CORE AI mengidentifikasi konteks dan tujuan penggunaan untuk menentukan apakah interaksi berkaitan dengan pembelajaran, pencarian informasi, atau diskusi.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-md hover:bg-white/3 transition">
                <div className="flex-none h-8 w-8 rounded-full bg-core-500 text-white flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">02 · Socratic Mode</h4>
                  <p className="text-lo">Ketika pertanyaan lanjutan diajukan, CORE AI tidak langsung memberikan jawaban. Sistem menghadirkan pertanyaan Socratic yang mendorong pengguna mengaktifkan pengetahuan awal, menguji pemahaman, dan menemukan arah jawaban secara mandiri.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-md hover:bg-white/3 transition">
                <div className="flex-none h-8 w-8 rounded-full bg-core-500 text-white flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">03 · Reflective Mode</h4>
                  <p className="text-lo">Pengguna merumuskan kembali pemahamannya dengan bahasa sendiri tanpa menyalin jawaban AI. Rangkuman kemudian dibandingkan dengan jawaban asli AI dan perspektif alternatif untuk membantu mengevaluasi pemahaman yang telah terbentuk.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-md hover:bg-white/3 transition">
                <div className="flex-none h-8 w-8 rounded-full bg-core-500 text-white flex items-center justify-center font-semibold">4</div>
                <div>
                  <h4 className="font-semibold">04 · Scaffolding Mode</h4>
                  <p className="text-lo">Ketika pertanyaan lanjutan menunjukkan kebutuhan akan bantuan lebih lanjut, CORE AI menyesuaikan dukungan dengan kemampuan pengguna. Alih-alih memberikan jawaban secara utuh, sistem menyajikan petunjuk secara bertahap agar pengguna dapat membangun penalarannya sendiri.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mt-6 text-[16px] font-semibold">Validasi Berlapis</h3>
            <p className="italic text-[15px]">Memastikan pemahaman terbentuk, bukan sekadar jawaban tersalin.</p>
            <blockquote className="pl-4 border-l-2 text-[15px] text-lo">Setiap rangkuman yang dihasilkan dalam <em>Reflective Mode</em> melalui <strong>dual-layer validation</strong> untuk memastikan bahwa respons merepresentasikan pemahaman pengguna. Lapisan pertama memeriksa panjang teks untuk memenuhi batas minimum, sedangkan lapisan kedua mengukur kemiripan semantik antara rangkuman pengguna dan respons asli AI. Apabila tingkat kemiripan melampaui ambang yang ditetapkan, sistem mengidentifikasinya sebagai indikasi reproduksi jawaban dan mengarahkan pengguna untuk merumuskan kembali pemahamannya dengan bahasa sendiri.</blockquote>
          </div>

          <div>
            <h3 className="mt-6 text-[16px] font-semibold">Landasan Ilmiah</h3>
            <blockquote className="pl-4 border-l-2 text-[15px] text-lo">Pendekatan CORE AI berangkat dari kajian mengenai <em>cognitive offloading</em> dan keterlibatannya dengan aktivitas korteks prefrontal, serta memanfaatkan prinsip <em>retrieval practice</em>, refleksi, dan <em>scaffolding</em> untuk mempertahankan keterlibatan kognitif dalam proses belajar.</blockquote>
          </div>
        </div>
      </div>
    ) : (
      <p className="mt-4 text-[14px] text-lo anim-rise delay-2">Konten halaman ini belum diisi.</p>
    )}

    <button
      onClick={() => onNavigate('landing')}
      className="mt-9 h-11 px-5 rounded-full text-[13.5px] font-medium text-mid bg-white/85 backdrop-blur-sm
        shadow-[inset_0_0_0_1px_rgba(16,24,60,.13)] inline-flex items-center gap-2
        hover:text-hi hover:bg-white active:scale-[.98] transition-all anim-rise delay-3"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali ke beranda
    </button>
  </main>
);
