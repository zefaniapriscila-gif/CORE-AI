/**
 * Sumber isi sesi COE.
 *
 * Tiap tahap yang butuh model memanggil `ensure*` miliknya. Fungsi itu bersifat
 * idempoten — promisenya disimpan di ref, jadi presenter boleh melompat
 * maju-mundur tanpa memicu panggilan ganda.
 *
 * Setiap tugas punya padanan di naskah demo. Kalau jalur live gagal karena
 * alasan apa pun, isinya diganti naskah dan sesi tetap berjalan utuh; badge
 * telemetri di panel yang memberi tahu mana yang sedang tampil.
 */

import { useCallback, useRef, useState } from 'react';
import { CoeSource } from './coeTypes';
import {
  callCoe,
  ComparisonPayload,
  ScaffoldPayload,
  SocraticPayload,
} from './coeLive';
import {
  COMPARISON,
  FOLLOW_UP,
  GEMINI_ANSWER,
  QUESTION,
  SCAFFOLD_HINTS,
  SCAFFOLD_PARTIAL,
  SOCRATIC_QUESTIONS,
} from './coeScript';

export interface CoeContent {
  answer: string;
  socratic: string[];
  comparison: ComparisonPayload;
  scaffold: ScaffoldPayload;
}

const SCRIPT: CoeContent = {
  answer: GEMINI_ANSWER,
  socratic: SOCRATIC_QUESTIONS,
  comparison: COMPARISON,
  scaffold: { hints: SCAFFOLD_HINTS, partial: SCAFFOLD_PARTIAL },
};

type Key = keyof CoeContent;

const KEYS: Key[] = ['answer', 'socratic', 'comparison', 'scaffold'];

const allPending = () =>
  Object.fromEntries(KEYS.map((k) => [k, 'pending'])) as Record<Key, CoeSource>;

export function useCoe() {
  const [content, setContent] = useState<CoeContent>(SCRIPT);
  const [source, setSource] = useState<Record<Key, CoeSource>>(allPending);
  const [loading, setLoading] = useState<Record<Key, boolean>>({
    answer: false,
    socratic: false,
    comparison: false,
    scaffold: false,
  });

  /** Promise per tugas — penjaga agar satu tugas hanya dijalankan sekali. */
  const inflight = useRef<Partial<Record<Key, Promise<unknown>>>>({});

  const run = useCallback(
    <K extends Key>(key: K, fetcher: () => Promise<CoeContent[K] | null>) => {
      const existing = inflight.current[key] as Promise<CoeContent[K]> | undefined;
      if (existing) return existing;

      const task = (async () => {
        setLoading((l) => ({ ...l, [key]: true }));
        const live = await fetcher();
        const value = live ?? SCRIPT[key];
        setContent((c) => ({ ...c, [key]: value }));
        setSource((s) => ({ ...s, [key]: live ? 'live' : 'script' }));
        setLoading((l) => ({ ...l, [key]: false }));
        return value;
      })();

      inflight.current[key] = task;
      return task;
    },
    [],
  );

  const ensureAnswer = useCallback(
    () =>
      run('answer', async () => {
        const r = await callCoe<{ text: string }>('answer', {
          question: QUESTION,
        });
        return r?.text ?? null;
      }),
    [run],
  );

  const ensureSocratic = useCallback(async () => {
    const answer = await ensureAnswer();
    return run('socratic', async () => {
      const r = await callCoe<SocraticPayload>('socratic', {
        question: QUESTION,
        answer,
      });
      return r?.questions?.length ? r.questions : null;
    });
  }, [ensureAnswer, run]);

  /**
   * Komparasi bergantung pada rangkuman pengguna, jadi hasilnya tidak boleh
   * dipakai ulang saat rangkumannya berubah. Ref di bawah membatalkan cache
   * begitu teksnya berbeda dari panggilan sebelumnya.
   */
  const comparedFor = useRef<string | null>(null);

  const ensureComparison = useCallback(
    async (summary: string) => {
      if (comparedFor.current !== summary) {
        comparedFor.current = summary;
        delete inflight.current.comparison;
      }
      const answer = await ensureAnswer();
      return run('comparison', async () =>
        callCoe<ComparisonPayload>('comparison', { answer, summary }),
      );
    },
    [ensureAnswer, run],
  );

  const ensureScaffold = useCallback(async () => {
    const answer = await ensureAnswer();
    return run('scaffold', async () =>
      callCoe<ScaffoldPayload>('scaffold', { question: FOLLOW_UP, answer }),
    );
  }, [ensureAnswer, run]);

  const resetCoe = useCallback(() => {
    inflight.current = {};
    comparedFor.current = null;
    setContent(SCRIPT);
    setSource(allPending());
    setLoading({
      answer: false,
      socratic: false,
      comparison: false,
      scaffold: false,
    });
  }, []);

  return {
    content,
    source,
    loading,
    ensureAnswer,
    ensureSocratic,
    ensureComparison,
    ensureScaffold,
    resetCoe,
  };
}
