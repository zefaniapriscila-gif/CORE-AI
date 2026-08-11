export type CognitiveMode = 'landing' | 'welcome' | 'normal' | 'intercept' | 'socratic' | 'reflective' | 'comparison' | 'post_reflection' | 'scaffold' | 'rating' | 'summary';

export type UserGoal = 'instrumental' | 'trivia' | 'interaksional' | 'other';

export interface UserGoalOption {
  id: UserGoal;
  label: string;
  sublabel: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'core_system';
  content: string;
  timestamp: string;
  modeAtCreation: CognitiveMode;
  isProtectedFromCopy?: boolean;
}

export interface DualLayerValidationResult {
  isValid: boolean;
  wordCount: number;
  isLengthValid: boolean;
  similarityScore: number;
  isSimilarityValid: boolean;
  errorMessage?: string;
}

export interface SessionMetrics {
  userGoal: UserGoal;
  goalLabel: string;
  totalQuestions: number;
  socraticAnswered: number;
  reflectionsCompleted: number;
  counterargumentsExplored: number;
  userRating: number; // 1-5 stars
}

export interface DemoStep {
  id: CognitiveMode;
  label: string;
  description: string;
  theory: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'welcome',
    label: 'Welcome Prompt',
    description: 'Ekstensi menanyakan tujuan penggunaan AI',
    theory: 'Identifikasi tujuan instrumental vs non-instrumental',
  },
  {
    id: 'normal',
    label: 'Normal Mode',
    description: 'Pengguna bertanya, AI menjawab seperti biasa',
    theory: 'Respons GenAI tanpa intervensi kognitif',
  },
  {
    id: 'intercept',
    label: 'DOM Interception',
    description: 'Pertanyaan lanjutan ditahan oleh sistem',
    theory: 'Sub-Modul 1: DOM Interceptor & Session Manager',
  },
  {
    id: 'socratic',
    label: 'Socratic Mode',
    description: 'AI memberikan pertanyaan pemantik, pengguna wajib menjawab',
    theory: 'Socratic Method (Fischer, 2019) — Retrieval practice dasar',
  },
  {
    id: 'reflective',
    label: 'Reflective Mode',
    description: 'Pengguna menulis rangkuman dengan kata-kata sendiri',
    theory: 'Retrieval Practice (Karpicke & Roediger, 2008) + Dual-Layer Validation',
  },
  {
    id: 'comparison',
    label: 'Komparasi & Counterargument',
    description: 'AI memaparkan perbandingan pemahaman pengguna',
    theory: 'Evaluasi metakognitif — mencegah Illusion of Certainty',
  },
  {
    id: 'scaffold',
    label: 'Scaffolding Mode',
    description: 'AI memberi petunjuk bertahap, jawaban parsial/rumpang',
    theory: 'Scaffolding (Wood et al., 1976) — bantuan sementara',
  },
  {
    id: 'rating',
    label: 'Rating & Akhir Sesi',
    description: 'Pengguna memberi rating pengalaman sesi',
    theory: 'Feedback loop & sinkronisasi ke akun pengguna',
  },
];
