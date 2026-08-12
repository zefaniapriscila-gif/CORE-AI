import React from 'react';
import { Eye, Radio } from 'lucide-react';
import { PanelBody } from '../CorePanel';
import { SectionLabel } from '../../ui/primitives';
import { estimateTokens } from '../../../engine/dualLayerValidator';

/** Sebelum tujuan dipilih — ekstensi terpasang tapi belum berwenang. */
export const IdleStep: React.FC = () => (
  <PanelBody
    eyebrow="Standby"
    title={<>Menunggu deklarasi tujuan</>}
    lede={
      <>
        Content script sudah disuntikkan ke halaman Gemini, tapi belum melakukan
        apa pun. Pilih tujuan di popup toolbar untuk menyalakan Cognitive
        Orchestration Engine.
      </>
    }
  >
    <div className="rounded-2xl glass-soft p-4 flex items-start gap-3">
      <Radio className="w-4 h-4 text-lo mt-0.5 shrink-0" />
      <p className="text-[12.5px] text-lo leading-relaxed">
        Tujuan trivia dan interaksional tidak memicu intervensi. Menambah friksi
        pada percakapan ringan hanya membuang beban kognitif tanpa manfaat
        belajar.
      </p>
    </div>
  </PanelBody>
);

/* -------------------------------------------------------------------------- */

interface NormalProps {
  extracted: string;
  tokens?: number;
}

/** Normal Mode — Gemini menjawab bebas, interceptor hanya merekam. */
export const NormalStep: React.FC<NormalProps> = ({
  extracted,
  tokens = estimateTokens(extracted),
}) => (
  <PanelBody
    eyebrow="Normal Mode · tanpa intervensi"
    title={<>Ia menjawab. Kami hanya mencatat.</>}
    lede={
      <>
        MutationObserver memantau perubahan DOM. Begitu Gemini selesai menjawab,
        teksnya diekstrak dan disimpan sebagai <em>respons mentah</em> — nanti
        dipakai sebagai pembanding saat memvalidasi rangkumanmu.
      </>
    }
  >
    <SectionLabel>Respons mentah tersimpan</SectionLabel>

    <div className="rounded-2xl glass-soft overflow-hidden">
      <div className="px-3.5 py-2.5 hairline flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-lo" />
        <span className="font-mono text-[10.5px] text-lo">raw_response</span>
        <span className="font-mono text-[10.5px] text-ink-500 ml-auto">
          {tokens} token
        </span>
      </div>
      <p className="px-3.5 py-3 text-[12px] leading-[1.6] text-lo line-clamp-4">
        {extracted.slice(0, 190)}…
      </p>
    </div>

    <p className="text-[12.5px] text-lo leading-relaxed">
      Intervensi baru muncul ketika kamu mengirim pertanyaan lanjutan — titik di
      mana offloading biasanya terjadi. Coba ketik pertanyaan berikutnya di
      Gemini.
    </p>
  </PanelBody>
);
