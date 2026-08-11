/**
 * Naskah sesi demo. Semua konten yang tampil di layar juri ada di sini,
 * terpisah dari komponen agar mudah disunting sebelum presentasi.
 *
 * Topik sengaja dipilih reflektif: pengguna bertanya tentang cognitive
 * offloading, lalu mengalaminya sendiri saat CORE AI menahan pertanyaannya.
 */

import { GoalOption } from './coeTypes';

export const GOALS: GoalOption[] = [
  {
    id: 'instrumental',
    label: 'Belajar atau memahami materi',
    sub: 'Tugas kuliah, konsep sulit, pertanyaan kompleks',
    activatesCoe: true,
  },
  {
    id: 'trivia',
    label: 'Cari info singkat',
    sub: 'Definisi, fakta cepat, konversi satuan',
    activatesCoe: false,
  },
  {
    id: 'interaksional',
    label: 'Ngobrol atau brainstorming',
    sub: 'Percakapan santai, cari ide, teman diskusi',
    activatesCoe: false,
  },
  {
    id: 'other',
    label: 'Lainnya',
    sub: 'Tujuan di luar tiga kategori di atas',
    activatesCoe: false,
  },
];

export const QUESTION =
  'Jelaskan apa itu cognitive offloading dan dampaknya terhadap working memory mahasiswa';

export const GEMINI_ANSWER = `Cognitive offloading adalah kecenderungan individu mengalihkan proses pengolahan informasi, penalaran, dan pengambilan keputusan kepada sistem eksternal seperti AI.

Dampaknya terhadap working memory mahasiswa:

1. Penurunan aktivasi DLPFC. Dorsolateral prefrontal cortex kanan bertanggung jawab mempertahankan, memperbarui, dan memanipulasi informasi dalam working memory. Ketika tuntutan itu dialihkan ke AI, aktivasinya menurun.

2. Degradasi information retrieval. Proses mengingat kembali menjadi lambat dan tidak akurat karena working memory jarang dilatih.

3. Risiko digital amnesia. Ketergantungan pada penyimpanan eksternal berpotensi memicu synaptic pruning dan mengurangi keterlibatan hipokampus dalam konsolidasi memori jangka panjang.

4. Illusion of learning. Mahasiswa merasa memahami materi padahal belum membangun konstruk pengetahuan yang mendalam.`;

/** Pertanyaan lanjutan — inilah yang ditahan DOM Interceptor. */
export const FOLLOW_UP =
  'Lalu bagaimana cara mencegah cognitive offloading saat menggunakan AI?';

export const SOCRATIC_QUESTIONS = [
  'Menurut pemahamanmu, apa bedanya cognitive offloading dengan retrieval practice?',
  'Kalau working memory tidak dilatih aktif, apa dampak jangka panjangnya?',
  'Beri satu contoh nyata mahasiswa mengalami illusion of learning saat memakai GenAI.',
];

/** Jawaban contoh Socratic — dipakai saat presenter melompati tahap. */
export const SOCRATIC_SAMPLE_ANSWER =
  'Offloading itu memindahkan proses berpikirnya ke luar, sedangkan retrieval practice justru menariknya kembali ke dalam kepala. Contohnya waktu aku baca rangkuman AI dan merasa paham, tapi pas ditanya teman aku tidak bisa jelaskan ulang.';

export const REFLECTIVE_SAMPLE_SUMMARY =
  'Cognitive offloading terjadi saat mahasiswa menyerahkan proses berpikirnya ke AI, sehingga bagian otak yang mengelola ingatan kerja jarang dipakai dan lama-lama melemah. Akibatnya kemampuan memanggil kembali informasi jadi lambat dan mereka merasa paham padahal belum benar-benar menguasai.';

export const COMPARISON = {
  hit: [
    'Menangkap inti pengalihan proses berpikir ke sistem eksternal.',
    'Mengaitkan pelemahan working memory dengan proses retrieval yang melambat.',
    'Menyebut kesenjangan antara rasa paham dan penguasaan sebenarnya.',
  ],
  miss: [
    {
      title: 'Mekanisme neurologisnya belum disebut',
      body: 'Yang menurun spesifik: aktivasi DLPFC kanan. Ini temuan terukur lewat fNIRS, bukan sekadar "working memory melemah" secara umum.',
    },
    {
      title: 'Illusion of learning bukan cuma penurunan performa',
      body: 'Mahasiswa secara aktif meyakini dirinya paham. Keyakinan keliru inilah yang membuat mereka berhenti belajar lebih dalam.',
    },
    {
      title: 'Dampaknya juga fisiologis',
      body: 'Synaptic pruning dan digital amnesia menunjukkan efeknya menjangkau struktur otak, tidak berhenti di level performa kognitif.',
    },
  ],
  takeaway:
    'Cognitive offloading bukan sekadar malas berpikir. Ia punya mekanisme neurologis yang terukur dan bersifat akumulatif — karena itu mitigasinya harus preventif, bukan korektif.',
};

/* Scaffolding menjawab pertanyaan yang tadi ditahan — bertahap, tidak utuh. */

export const SCAFFOLD_HINTS = [
  'Mulai dari titik masalahnya. Offloading terjadi saat proses berpikir dipindahkan keluar — jadi intervensinya harus masuk sebelum, saat, atau sesudah AI menjawab?',
  'Ingat lagi retrieval practice dari jawaban pertama tadi. Apa yang harus kamu lakukan pada jawaban AI supaya ia tidak berhenti jadi bahan bacaan?',
  'Pertimbangkan sisi praktisnya. Strategi yang menuntut pindah aplikasi atau menyusun prompt panjang justru menambah beban. Apa syarat agar intervensinya tidak jadi beban baru?',
];

export const SCAFFOLD_PARTIAL =
  'Pencegahan cognitive offloading perlu bekerja di lapisan ______ (kapan intervensinya masuk?), bukan setelah kebiasaannya terbentuk. Strategi intinya adalah ______ (metode yang memaksa working memory bekerja), yang bisa diwujudkan lewat ______ (sebutkan satu bentuk konkretnya). Syaratnya, intervensi itu harus ______ supaya tidak melahirkan beban kognitif baru. Lengkapi dari pemahamanmu.';

export const RATING_LABELS: Record<number, string> = {
  1: 'Kurang membantu',
  2: 'Cukup membantu',
  3: 'Lumayan membantu',
  4: 'Sangat membantu',
  5: 'Luar biasa membantu',
};

/** Log content-script yang berjalan di footer panel — memberi kesan sistem hidup. */
export const CONSOLE_LINES: Record<string, string[]> = {
  goal: ['content-script injected @ gemini.google.com', 'menunggu deklarasi tujuan pengguna'],
  normal: [
    'MutationObserver attached → div[role="main"]',
    // {tokens} diisi App dari respons yang benar-benar tampil.
    'respons Gemini diekstrak · {tokens} token',
    'raw_response disimpan ke session store',
  ],
  intercept: [
    'submit event tertangkap · preventDefault()',
    'session_manager: pertanyaan lanjutan terdeteksi',
    'pengiriman ditahan · alihkan ke Socratic',
  ],
  socratic: ['socratic_prompt_builder aktif', '3 pertanyaan pemantik dibangun'],
  reflective: [
    'user-select:none diterapkan ke node respons',
    'paste handler dipasang di textarea',
    'menunggu input untuk validasi berlapis',
  ],
  comparison: ['reflective_prompt_builder aktif', 'komparasi + counterargument dirakit'],
  scaffold: ['scaffold_prompt_builder aktif', 'respons dipecah jadi 3 petunjuk + 1 parsial'],
  rating: ['metrik sesi dikumpulkan', 'sinkronisasi ke akun pengguna'],
};
