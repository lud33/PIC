import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm animate-slide-up
            ${t.type === 'success' ? 'bg-gray-900 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}
        >
          {t.type === 'success' && <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-400" />}
          {t.type === 'error' && <XCircle size={16} className="shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="text-white/60 hover:text-white/90 transition-colors" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
