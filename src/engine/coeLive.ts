/**
 * Jembatan ke Cognitive Orchestration Engine di sisi server.
 *
 * Klien tidak pernah memegang API key dan tidak pernah menyusun prompt — ia
 * hanya menyebut nama tugas COE dan mengirim datanya ke /api/gemini.
 */

import { CoeTask } from './coeTypes';

export interface SocraticPayload {
  questions: string[];
}

export interface ComparisonPayload {
  hit: string[];
  miss: { title: string; body: string }[];
  takeaway: string;
}

export interface ScaffoldPayload {
  hints: string[];
  partial: string;
}

/**
 * Memanggil satu tugas COE. Sengaja tidak pernah melempar: setiap kegagalan —
 * key belum dipasang, kuota habis, jaringan mati di ruang presentasi —
 * mengembalikan null supaya pemanggil jatuh ke naskah cadangan tanpa
 * mematahkan demo di depan juri.
 */
export async function callCoe<T>(
  task: CoeTask,
  payload: Record<string, string>,
): Promise<T | null> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task, payload }),
    });

    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      console.warn(`[coe] ${task} gagal (${res.status}): ${error ?? 'unknown'}`);
      return null;
    }

    const { data } = (await res.json()) as { data?: T };
    return data ?? null;
  } catch (err) {
    console.warn(`[coe] ${task} tidak terjangkau:`, err);
    return null;
  }
}
