/**
 * Adapter Vercel Serverless Function.
 *
 * Satu-satunya tempat GEMINI_API_KEY dibaca saat produksi. Variabelnya sengaja
 * tanpa awalan VITE_ agar Vite tidak pernah menyalinnya ke bundle browser.
 */

import { handleCoe } from './_coe';

/** Bentuk minimal req/res Vercel yang kita pakai — menghindari dependensi tipe. */
interface VercelRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return raw?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  // Vercel sudah mengurai body JSON; string tersisa saat content-type meleset.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'invalid_json' });
      return;
    }
  }

  const result = await handleCoe(body, process.env.GEMINI_API_KEY, clientIp(req));
  res.status(result.status).json(result.body);
}
