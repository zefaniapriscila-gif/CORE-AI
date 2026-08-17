import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-[360px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md text-paper-ink shadow-[0_12px_32px_-8px_rgba(16,24,60,.28)] ring-1 ring-black/[.08] anim-pop"
        >
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : toast.type === 'warning' ? (
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-50 text-core-500 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-1">
            <div className="text-[13px] font-semibold text-paper-ink leading-tight">
              {toast.title}
            </div>
            {toast.description && (
              <div className="text-[11.5px] text-paper-mid mt-0.5 leading-snug">
                {toast.description}
              </div>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-paper-mid hover:text-paper-ink p-0.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
