/**
 * Cognitive Orchestration Engine — tipe inti.
 * Mengacu pada esai CORE AI (Psyfic 2026), Sub-Modul 1–3.
 */

/** Tahapan sesi. Bukan "halaman" — ini state dari satu sesi percakapan. */
export type Stage =
  | 'idle'
  | 'goal'
  | 'normal'
  | 'intercept'
  | 'socratic'
  | 'reflective'
  | 'comparison'
  | 'scaffold'
  | 'rating';

/** Mode kognitif yang punya identitas warna + glyph di panel. */
export type ModeKey =
  | 'intercept'
  | 'socratic'
  | 'reflective'
  | 'comparison'
  | 'scaffold';

export type UserGoal = 'instrumental' | 'trivia' | 'interaksional' | 'other';

export interface GoalOption {
  id: UserGoal;
  label: string;
  sub: string;
  /** Hanya tujuan instrumental yang mengaktifkan alur kognitif COE. */
  activatesCoe: boolean;
}

/** Sub-modul COE yang sedang bekerja — ditampilkan di telemetri panel. */
export type SubModule = 'idle' | 'interceptor' | 'validator' | 'orchestrator';

export interface Turn {
  id: string;
  role: 'user' | 'gemini' | 'core';
  text: string;
  /** Teks Gemini yang dikunci anti copy-paste selama Reflective Mode. */
  locked?: boolean;
  /** Ditahan oleh DOM Interceptor, belum sampai ke Gemini. */
  held?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  wordCount: number;
  isLengthValid: boolean;
  similarityScore: number;
  isSimilarityValid: boolean;
  errorMessage?: string;
}

export interface StepMeta {
  stage: Stage;
  /** Nomor tahap yang tampil di dock presenter. */
  index: number;
  label: string;
  /** Satu kalimat: apa yang terjadi di layar. */
  what: string;
  /** Landasan teori + sitasi dari esai. */
  theory: string;
  cite: string;
  /** Sub-modul COE yang aktif di tahap ini. */
  module: SubModule;
  mode: ModeKey | null;
}

export const MODE_COLOR: Record<ModeKey, string> = {
  intercept: 'var(--color-mode-intercept)',
  socratic: 'var(--color-mode-socratic)',
  reflective: 'var(--color-mode-reflective)',
  comparison: 'var(--color-mode-comparison)',
  scaffold: 'var(--color-mode-scaffold)',
};

export const MODE_LABEL: Record<ModeKey, string> = {
  intercept: 'Interception',
  socratic: 'Socratic Mode',
  reflective: 'Reflective Mode',
  comparison: 'Komparasi',
  scaffold: 'Scaffolding Mode',
};

export const SUBMODULE_LABEL: Record<SubModule, string> = {
  idle: 'COE Standby',
  interceptor: 'Sub-Modul 1 · DOM Interceptor',
  validator: 'Sub-Modul 2 · Dual-Layer Validator',
  orchestrator: 'Sub-Modul 3 · Prompt Orchestrator',
};

export const STEPS: StepMeta[] = [
  {
    stage: 'goal',
    index: 1,
    label: 'Welcome Prompt',
    what: 'Ekstensi menanyakan tujuan pengguna lewat popup toolbar.',
    theory:
      'Penyaringan tujuan. CORE AI hanya memfasilitasi penggunaan instrumental — belajar, mengerjakan tugas, menjawab pertanyaan kompleks. Tujuan trivia atau interaksional menonaktifkan ekstensi agar tidak menambah beban kognitif tanpa manfaat.',
    cite: 'Esai §2.2 — Normal Mode',
    module: 'idle',
    mode: null,
  },
  {
    stage: 'normal',
    index: 2,
    label: 'Normal Mode',
    what: 'Pengguna bertanya, Gemini menjawab seperti biasa. Ekstensi hanya mengamati.',
    theory:
      'Tanpa intervensi. DOM Interceptor menginisialisasi MutationObserver untuk memantau perubahan DOM, lalu mengekstrak teks jawaban dan menyimpannya sebagai respons mentah — bahan pembanding untuk validasi nanti.',
    cite: 'Esai Sub-Modul 1 — MutationObserver',
    module: 'interceptor',
    mode: null,
  },
  {
    stage: 'intercept',
    index: 3,
    label: 'DOM Interception',
    what: 'Pertanyaan lanjutan ditahan sebelum terkirim ke Gemini.',
    theory:
      'Session Manager mendeteksi pertanyaan lanjutan. Di titik inilah offloading biasanya terjadi: pengguna menumpuk pertanyaan tanpa mengolah jawaban sebelumnya. Sistem interception mencegah pengiriman baru dan mengalihkan ke Socratic Mode.',
    cite: 'Esai Sub-Modul 1 — Session Manager',
    module: 'interceptor',
    mode: 'intercept',
  },
  {
    stage: 'socratic',
    index: 4,
    label: 'Socratic Mode',
    what: 'Pengguna wajib menjawab pertanyaan pemantik sebelum lanjut.',
    theory:
      'Socratic method menggunakan pertanyaan untuk merangsang pemikiran kritis dan menggali asumsi yang mendasarinya. Menghasilkan retrieval practice dasar: pengguna berhenti menerima jawaban secara pasif dan mulai terlibat secara kognitif.',
    cite: 'Fischer (2019); Bjork (1994)',
    module: 'orchestrator',
    mode: 'socratic',
  },
  {
    stage: 'reflective',
    index: 5,
    label: 'Reflective Mode',
    what: 'Pengguna merangkum jawaban AI dengan kata-katanya sendiri. Teks AI dikunci.',
    theory:
      'Retrieval practice memaksa otak mengaktifkan skema memori dan melakukan elaborasi tingkat tinggi. Validasi berlapis ganda memastikan ini bukan copy-paste: Layer 1 Length Checker (min. 20 kata), Layer 2 Semantic Similarity via sentence-transformer (maks. 80%). CSS user-select:none memblokir seleksi teks AI.',
    cite: 'Karpicke & Roediger (2008); Esai Sub-Modul 2',
    module: 'validator',
    mode: 'reflective',
  },
  {
    stage: 'comparison',
    index: 6,
    label: 'Komparasi & Counterargument',
    what: 'AI membandingkan pemahaman pengguna dengan jawaban aslinya.',
    theory:
      'Evaluasi metakognitif — kemampuan menilai dan membandingkan kualitas argumen yang berbeda. Mencegah illusion of certainty, yaitu keyakinan memahami materi tanpa konstruk pengetahuan yang mendalam.',
    cite: 'Kazemitabaar dkk. (2025); Tankelevitch dkk. (2024)',
    module: 'orchestrator',
    mode: 'comparison',
  },
  {
    stage: 'scaffold',
    index: 7,
    label: 'Scaffolding Mode',
    what: 'Jawaban diberikan bertahap dan rumpang, bukan utuh.',
    theory:
      'Scaffolding memberi bantuan sementara agar pengguna menyelesaikan masalah yang belum bisa dikerjakan mandiri. CORE AI bertindak sebagai fasilitator: petunjuk bertahap dan jawaban parsial memaksa pengguna membaca ulang, menghubungkan, dan mencerna informasi tahap sebelumnya.',
    cite: 'Wood, Bruner & Ross (1976)',
    module: 'orchestrator',
    mode: 'scaffold',
  },
  {
    stage: 'rating',
    index: 8,
    label: 'Rating & Sinkronisasi',
    what: 'Sesi ditutup dengan rating dan sinkronisasi ke akun pengguna.',
    theory:
      'Indikator keberhasilan implementasi: jumlah pengguna, umpan balik kualitatif, dan Net Promoter Score untuk mengukur loyalitas serta kemungkinan pengguna merekomendasikan ekstensi.',
    cite: 'Reichheld (2003); Brooke (1996) — SUS',
    module: 'idle',
    mode: null,
  },
];

export const STAGE_ORDER: Stage[] = STEPS.map((s) => s.stage);

export function stepOf(stage: Stage): StepMeta | undefined {
  return STEPS.find((s) => s.stage === stage);
}
