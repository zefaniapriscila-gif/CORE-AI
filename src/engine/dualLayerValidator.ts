import { DualLayerValidationResult } from './coeTypes';

/**
 * Counts total words in a string, stripping whitespace and formatting.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Tokenizes text into normalized word n-grams (unigrams & bigrams) for similarity calculation.
 */
function getTokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 2); // filter out tiny stop words like 'di', 'ke', 'ya'
  
  const tokens = new Set<string>();
  
  // Unigrams
  words.forEach(w => tokens.add(w));
  
  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(`${words[i]}_${words[i + 1]}`);
  }
  
  return tokens;
}

/**
 * Calculates Jaccard / Cosine-like similarity between user summary and raw AI response.
 * Simulates sentence-transformer embedding cosine distance.
 */
export function calculateSemanticSimilarity(userSummary: string, rawAiResponse: string): number {
  if (!userSummary || !rawAiResponse) return 0;
  
  const userTokens = getTokens(userSummary);
  const aiTokens = getTokens(rawAiResponse);
  
  if (userTokens.size === 0 || aiTokens.size === 0) return 0;
  
  let intersectionCount = 0;
  userTokens.forEach(token => {
    if (aiTokens.has(token)) {
      intersectionCount++;
    }
  });
  
  // Similarity ratio relative to user's summary length
  const userRatio = intersectionCount / userTokens.size;
  
  // Substring check for exact copy paste chunks
  const cleanUser = userSummary.toLowerCase().replace(/\s+/g, ' ').trim();
  const cleanAi = rawAiResponse.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // Check substring overlap
  let longestSubstringMatch = 0;
  const userWords = cleanUser.split(' ');
  for (let window = 4; window <= userWords.length; window++) {
    for (let i = 0; i <= userWords.length - window; i++) {
      const phrase = userWords.slice(i, i + window).join(' ');
      if (cleanAi.includes(phrase)) {
        if (phrase.length > longestSubstringMatch) {
          longestSubstringMatch = phrase.length;
        }
      }
    }
  }
  
  const substringRatio = longestSubstringMatch / Math.max(cleanUser.length, 1);
  
  // Combined score normalized 0.0 - 1.0
  const finalScore = Math.min(Math.max(userRatio * 0.6 + substringRatio * 0.4, 0), 1);
  return finalScore;
}

/**
 * Dual-Layer Validation Engine (Psyfic Essay Sub-Modul 2)
 * Layer 1: Length Checker (>= 20 words)
 * Layer 2: Semantic Similarity Check (< 80% similarity threshold)
 */
export function validateUserSummary(
  userSummary: string,
  rawAiResponse: string
): DualLayerValidationResult {
  const wordCount = countWords(userSummary);
  const isLengthValid = wordCount >= 20;
  
  const similarityScore = calculateSemanticSimilarity(userSummary, rawAiResponse);
  const similarityPercentage = Math.round(similarityScore * 100);
  const isSimilarityValid = similarityPercentage < 80;
  
  let errorMessage: string | undefined = undefined;
  
  if (!isLengthValid) {
    errorMessage = `Rangkuman terlalu pendek (${wordCount} kata). Tuliskan minimal 20 kata dengan pemahamanmu sendiri.`;
  } else if (!isSimilarityValid) {
    errorMessage = `Terdeteksi indikasi copy-paste / kemiripan terlalu tinggi (${similarityPercentage}%). Mohon susun ulang rangkuman menggunakan kalimat dan penalaranmu sendiri!`;
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
