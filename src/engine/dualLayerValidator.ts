import { ValidationResult } from './coeTypes';

/**
 * Mesin validasi ganda — Sub-Modul 2 (esai hal. 20).
 * Layer 1: Length Checker  · rangkuman minimal 20 kata
 * Layer 2: Semantic Similarity · kemiripan dengan respons mentah maksimal 80%
 *
 * Di produksi, Layer 2 memakai embedding sentence-transformer. Di prototipe ini
 * kemiripan dihitung dari irisan n-gram + panjang frasa identik terpanjang,
 * yang berperilaku serupa untuk kasus copy-paste langsung maupun parafrase tipis.
 */

export const MIN_WORDS = 20;
export const MAX_SIMILARITY = 80;

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Perkiraan kasar jumlah token, ~4 karakter per token. Hanya dipakai untuk
 * telemetri panel — angkanya harus ikut respons yang benar-benar tampil,
 * bukan konstanta yang menjadi bohong begitu jawabannya live.
 */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.trim().length / 4));
}

/** Unigram + bigram ternormalisasi, membuang kata sangat pendek. */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const tokens = new Set<string>(words);
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

/** Skor 0..1. Semakin tinggi, semakin mirip respons mentah AI. */
export function calculateSemanticSimilarity(
  summary: string,
  rawResponse: string
): number {
  if (!summary.trim() || !rawResponse.trim()) return 0;

  const userTokens = tokenize(summary);
  const aiTokens = tokenize(rawResponse);
  if (userTokens.size === 0 || aiTokens.size === 0) return 0;

  let overlap = 0;
  userTokens.forEach((t) => {
    if (aiTokens.has(t)) overlap++;
  });
  const overlapRatio = overlap / userTokens.size;

  // Frasa identik terpanjang — penanda copy-paste langsung.
  const cleanUser = summary.toLowerCase().replace(/\s+/g, ' ').trim();
  const cleanAi = rawResponse.toLowerCase().replace(/\s+/g, ' ').trim();
  const userWords = cleanUser.split(' ');

  let longestMatch = 0;
  for (let size = 4; size <= userWords.length; size++) {
    let foundAtThisSize = false;
    for (let i = 0; i + size <= userWords.length; i++) {
      const phrase = userWords.slice(i, i + size).join(' ');
      if (cleanAi.includes(phrase)) {
        foundAtThisSize = true;
        longestMatch = Math.max(longestMatch, phrase.length);
      }
    }
    // Tidak ada frasa sepanjang ini yang cocok — yang lebih panjang pasti juga tidak.
    if (!foundAtThisSize) break;
  }

  const phraseRatio = longestMatch / Math.max(cleanUser.length, 1);

  return Math.min(Math.max(overlapRatio * 0.6 + phraseRatio * 0.4, 0), 1);
}

export function validateUserSummary(
  summary: string,
  rawResponse: string
): ValidationResult {
  const wordCount = countWords(summary);
  const isLengthValid = wordCount >= MIN_WORDS;

  const similarityScore = calculateSemanticSimilarity(summary, rawResponse);
  const similarityPercentage = Math.round(similarityScore * 100);
  const isSimilarityValid = similarityPercentage < MAX_SIMILARITY;

  let errorMessage: string | undefined;
  if (!isLengthValid) {
    errorMessage = `Rangkuman baru ${wordCount} kata. Butuh minimal ${MIN_WORDS} kata agar elaborasinya cukup dalam untuk dinilai.`;
  } else if (!isSimilarityValid) {
    errorMessage = `Kemiripan dengan respons AI ${similarityPercentage}% — di atas ambang ${MAX_SIMILARITY}%. Ini menandakan penyalinan tidak langsung. Susun ulang dengan kalimat dan penalaranmu sendiri.`;
  }

  return {
    isValid: isLengthValid && isSimilarityValid,
    wordCount,
    isLengthValid,
    similarityScore,
    isSimilarityValid,
    errorMessage,
  };
}
