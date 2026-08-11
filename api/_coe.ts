/**
 * Inti Cognitive Orchestration Engine yang memerlukan model bahasa.
 *
 * File ini berjalan HANYA di server (Vercel Serverless Function saat produksi,
 * middleware Vite saat pengembangan). API key tidak pernah menyentuh bundle
 * browser, dan prompt COE tidak ikut terkirim ke klien.
 *
 * Endpoint sengaja dibuat berbasis tugas (`task`), bukan proksi Gemini umum:
 * klien tidak bisa menitipkan prompt sembarang, hanya memilih satu dari empat
 * operasi COE dan mengirim datanya.
 */

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Batas panjang tiap field teks — mencegah endpoint dipakai sebagai proksi murah. */
const MAX_FIELD = 6000;
/** Jendela dan kuota rate limit per alamat IP. */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

export type CoeTask = 'answer' | 'socratic' | 'comparison' | 'scaffold';

const TASKS: CoeTask[] = ['answer', 'socratic', 'comparison', 'scaffold'];

export interface CoeResult {
  status: number;
  body: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* Skema keluaran                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Gemini menerima subset OpenAPI sebagai `responseSchema`. Dengan ini keluaran
 * dijamin JSON valid dengan bentuk yang persis dibutuhkan komponen panel —
 * tidak perlu parsing markdown atau regex yang rapuh di tengah presentasi.
 */
const SCHEMA_SOCRATIC = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      minItems: 3,
      maxItems: 3,
      items: { type: 'STRING' },
    },
  },
  required: ['questions'],
} as const;

const SCHEMA_COMPARISON = {
  type: 'OBJECT',
  properties: {
    hit: { type: 'ARRAY', minItems: 2, maxItems: 4, items: { type: 'STRING' } },
    miss: {
      type: 'ARRAY',
      minItems: 2,
      maxItems: 3,
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          body: { type: 'STRING' },
        },
        required: ['title', 'body'],
      },
    },
    takeaway: { type: 'STRING' },
  },
  required: ['hit', 'miss', 'takeaway'],
} as const;

const SCHEMA_SCAFFOLD = {
  type: 'OBJECT',
  properties: {
    hints: { type: 'ARRAY', minItems: 3, maxItems: 3, items: { type: 'STRING' } },
    partial: { type: 'STRING' },
  },
  required: ['hints', 'partial'],
} as const;

/* -------------------------------------------------------------------------- */
/* Prompt                                                                     */
/* -------------------------------------------------------------------------- */

/** Konteks yang sama dipasang di semua tugas agar nada COE konsisten. */
const PERSONA = `Kamu adalah CORE AI, ekstensi peramban yang bekerja di atas Gemini untuk
mencegah cognitive offloading pada mahasiswa. Kamu tidak menggantikan Gemini —
kamu mengatur cara jawabannya sampai ke pengguna.

Aturan gaya yang berlaku untuk semua keluaranmu:
- Bahasa Indonesia akademis yang mengalir, bukan terjemahan kaku.
- Sapa pengguna dengan "kamu".
- Tanpa markdown, tanpa tanda bintang, tanpa emoji.
- Padat. Tidak ada kalimat pembuka basa-basi.
- Istilah teknis (working memory, retrieval practice, DLPFC) dipertahankan
  dalam bentuk aslinya.`;

function promptAnswer(question: string): string {
  return `${PERSONA}

Kali ini kamu berperan sebagai Gemini yang menjawab normal — belum ada
intervensi. Jawab pertanyaan mahasiswa berikut secara informatif dan berbobot.

Pertanyaan: ${question}

Format jawaban:
- Satu paragraf pembuka yang mendefinisikan konsep intinya.
- Lalu daftar bernomor 1 sampai 4. Tiap butir dimulai dengan frasa nama
  dampaknya, diikuti titik, lalu penjelasannya dalam dua sampai tiga kalimat.
- Sebutkan mekanisme neurologis yang konkret dan dapat diverifikasi bila relevan.
- Total 180 sampai 260 kata. Jangan menutup dengan kesimpulan atau ajakan.`;
}

function promptSocratic(question: string, answer: string): string {
  return `${PERSONA}

Sub-Modul 3, Socratic Prompt Builder. Mahasiswa baru saja membaca jawaban di
bawah dan hendak melempar pertanyaan lanjutan tanpa mengolah apa pun. Pertanyaan
itu sudah ditahan. Susun tiga pertanyaan pemantik yang memaksa dia menarik
kembali isi jawaban dari ingatannya sendiri.

Pertanyaan awalnya: ${question}

Jawaban yang baru dia baca:
${answer}

Syarat tiap pertanyaan:
- Menuntut retrieval, bukan pengenalan. Tidak bisa dijawab "ya" atau "tidak",
  dan tidak bisa dijawab dengan menyalin satu frasa dari teks.
- Nomor satu menguji pembedaan konsep. Nomor dua menguji implikasi jangka
  panjang. Nomor tiga meminta contoh konkret dari pengalaman dia sendiri.
- Satu kalimat saja, maksimal 25 kata, diakhiri tanda tanya.`;
}

function promptComparison(answer: string, summary: string): string {
  return `${PERSONA}

Sub-Modul 3, Reflective Prompt Builder. Mahasiswa sudah merangkum jawaban AI
dengan kata-katanya sendiri. Bandingkan rangkumannya dengan jawaban aslinya,
lalu bangun counterargument yang menutup celah pemahamannya.

Jawaban asli:
${answer}

Rangkuman mahasiswa:
${summary}

Isi tiap bagian:
- hit: dua sampai empat hal yang benar-benar tertangkap di rangkumannya. Kutip
  gagasannya, bukan kata-katanya. Satu kalimat per butir. Jujur — kalau
  rangkumannya dangkal, sebutkan sedikit saja.
- miss: dua sampai tiga hal penting dari jawaban asli yang belum tercakup.
  "title" adalah frasa tajam maksimal 8 kata yang menamai celahnya. "body"
  adalah dua kalimat yang menjelaskan apa yang terlewat dan mengapa itu penting.
- takeaway: satu atau dua kalimat yang menaikkan diskusi ke tingkat prinsip —
  bukan mengulang butir di atas.`;
}

function promptScaffold(question: string, answer: string): string {
  return `${PERSONA}

Sub-Modul 3, Scaffold Prompt Builder. Pertanyaan lanjutan mahasiswa akhirnya
dilepas, tapi kamu TIDAK BOLEH menjawabnya utuh. Berikan bantuan sementara yang
cukup untuk membawanya ke wilayah yang belum bisa dia kerjakan sendiri.

Pertanyaan yang tadi ditahan: ${question}

Materi yang sudah dia baca sebelumnya:
${answer}

Isi tiap bagian:
- hints: tepat tiga petunjuk berurutan, masing-masing satu sampai dua kalimat.
  Setiap petunjuk mengarahkan cara berpikir dan ditutup dengan pertanyaan
  terbuka. Dilarang menyebut jawabannya. Petunjuk kedua harus merujuk kembali ke
  materi yang sudah dia baca.
- partial: satu paragraf jawaban rumpang, tiga sampai empat kalimat, dengan
  tepat empat bagian yang dikosongkan. Tulis tiap kekosongan sebagai enam garis
  bawah berturut-turut diikuti petunjuk dalam kurung, contoh:
  "______ (metode apa yang dimaksud?)". Tutup dengan kalimat yang meminta dia
  melengkapinya dari pemahamannya sendiri.`;
}

/* -------------------------------------------------------------------------- */
/* Panggilan model                                                            */
/* -------------------------------------------------------------------------- */

async function generate(
  apiKey: string,
  prompt: string,
  schema: unknown | null,
): Promise<string> {
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(28_000),
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 2048,
        // Demo dinilai langsung di depan juri: latensi lebih berharga daripada
        // penalaran internal yang tidak ikut tampil.
        thinkingConfig: { thinkingBudget: 0 },
        ...(schema
          ? { responseMimeType: 'application/json', responseSchema: schema }
          : {}),
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`gemini ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
  };

  if (data.promptFeedback?.blockReason) {
    throw new Error(`diblokir: ${data.promptFeedback.blockReason}`);
  }

  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error(`respons kosong (finishReason=${candidate?.finishReason})`);
  }
  return text;
}

/* -------------------------------------------------------------------------- */
/* Validasi masukan                                                           */
/* -------------------------------------------------------------------------- */

function readField(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const v = payload[key];
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_FIELD);
}

/* -------------------------------------------------------------------------- */
/* Rate limit                                                                 */
/* -------------------------------------------------------------------------- */

const hits = new Map<string, number[]>();

/**
 * Pembatas laju sederhana. Serverless bisa punya banyak instance sehingga
 * hitungannya tidak presisi lintas instance, tapi cukup untuk menahan
 * penyalahgunaan kasar tanpa menambah dependensi penyimpanan.
 */
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_MAX;
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Bentuk murni dari handler: masuk data, keluar status + body. Adapter Vercel
 * dan adapter Vite sama-sama memanggil ini, jadi jalur pengembangan dan jalur
 * produksi menjalankan kode yang identik.
 */
export async function handleCoe(
  input: unknown,
  apiKey: string | undefined,
  ip: string,
): Promise<CoeResult> {
  if (!apiKey) {
    return { status: 503, body: { error: 'no_key' } };
  }
  if (rateLimited(ip)) {
    return { status: 429, body: { error: 'rate_limited' } };
  }

  const req = input as { task?: unknown; payload?: unknown } | null;
  const task = req?.task;
  if (typeof task !== 'string' || !TASKS.includes(task as CoeTask)) {
    return { status: 400, body: { error: 'unknown_task' } };
  }

  const payload =
    req?.payload && typeof req.payload === 'object'
      ? (req.payload as Record<string, unknown>)
      : {};

  try {
    switch (task as CoeTask) {
      case 'answer': {
        const question = readField(payload, 'question');
        if (!question) return { status: 400, body: { error: 'missing_question' } };
        const text = await generate(apiKey, promptAnswer(question), null);
        return { status: 200, body: { data: { text } } };
      }

      case 'socratic': {
        const question = readField(payload, 'question');
        const answer = readField(payload, 'answer');
        if (!question || !answer) {
          return { status: 400, body: { error: 'missing_context' } };
        }
        const raw = await generate(
          apiKey,
          promptSocratic(question, answer),
          SCHEMA_SOCRATIC,
        );
        return { status: 200, body: { data: JSON.parse(raw) } };
      }

      case 'comparison': {
        const answer = readField(payload, 'answer');
        const summary = readField(payload, 'summary');
        if (!answer || !summary) {
          return { status: 400, body: { error: 'missing_context' } };
        }
        const raw = await generate(
          apiKey,
          promptComparison(answer, summary),
          SCHEMA_COMPARISON,
        );
        return { status: 200, body: { data: JSON.parse(raw) } };
      }

      case 'scaffold': {
        const question = readField(payload, 'question');
        const answer = readField(payload, 'answer');
        if (!question || !answer) {
          return { status: 400, body: { error: 'missing_context' } };
        }
        const raw = await generate(
          apiKey,
          promptScaffold(question, answer),
          SCHEMA_SCAFFOLD,
        );
        return { status: 200, body: { data: JSON.parse(raw) } };
      }
    }
  } catch (err) {
    // Detail kegagalan hanya untuk log server. Klien cukup tahu bahwa jalur
    // live gagal supaya bisa jatuh ke naskah cadangan.
    console.error('[coe]', task, err instanceof Error ? err.message : err);
    return { status: 502, body: { error: 'upstream_failed' } };
  }

  return { status: 400, body: { error: 'unknown_task' } };
}
