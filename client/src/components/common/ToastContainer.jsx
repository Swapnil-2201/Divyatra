import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-[#102A56] text-white border-slate-700';
        let Icon = Info;
        let iconColor = 'text-[#D5A63A]';

        if (toast.type === 'success') {
          bg = 'bg-[#0D8259] text-white border-emerald-600';
          Icon = CheckCircle2;
          iconColor = 'text-white';
        } else if (toast.type === 'error' || toast.type === 'danger') {
          bg = 'bg-[#DC2626] text-white border-red-600';
          Icon = AlertCircle;
          iconColor = 'text-white';
        } else if (toast.type === 'warning') {
          bg = 'bg-[#E97820] text-white border-amber-600';
          Icon = AlertCircle;
          iconColor = 'text-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border ${bg} transition-all transform translate-y-0 duration-300 ease-out`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
