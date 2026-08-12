import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

/** Tipe modul handler. Posisi tipe saja — tidak ada impor nyata di sini. */
type CoeModule = typeof import('./api/_coe');

/**
 * Menyediakan /api/gemini saat `npm run dev`.
 *
 * Fungsi di folder api/ hanya hidup di Vercel, jadi tanpa ini pengembangan
 * lokal harus lewat `vercel dev`. Middleware ini memanggil handler yang persis
 * sama, sehingga jalur dev dan jalur produksi tidak pernah menyimpang.
 *
 * Handler-nya dimuat lewat ssrLoadModule, bukan impor statis. Impor statis akan
 * menjadikan api/_coe.ts sebagai dependensi berkas konfigurasi, sehingga tiap
 * penyuntingan prompt merestart seluruh dev server dan membuang state demo yang
 * sedang berjalan. Dengan ssrLoadModule, perubahan cukup terbaca di permintaan
 * berikutnya.
 */
function coeDevApi(apiKey: string | undefined): Plugin {
  return {
    name: 'coe-dev-api',
    configureServer(server) {
      server.middlewares.use(
        '/api/gemini',
        (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Allow', 'POST');
            res.end(JSON.stringify({ error: 'method_not_allowed' }));
            return;
          }

          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', async () => {
            res.setHeader('content-type', 'application/json');

            let body: unknown;
            try {
              body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid_json' }));
              return;
            }

            const ip = req.socket.remoteAddress ?? 'dev';
            const { handleCoe } = (await server.ssrLoadModule(
              '/api/_coe.ts',
            )) as CoeModule;

            const result = await handleCoe(body, apiKey, ip);
            res.statusCode = result.status;
            res.end(JSON.stringify(result.body));
          });
        },
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  // Awalan kosong: ambil variabel tanpa VITE_ juga. Nilainya tetap di sisi
  // Node — hanya diteruskan ke middleware, tidak pernah ke kode klien.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), coeDevApi(env.GEMINI_API_KEY)],
    server: {
      port: 5190,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
