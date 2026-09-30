import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        };

        const borderColors = {
          success: 'border-emerald-200 bg-white',
          info: 'border-blue-200 bg-white',
          warning: 'border-amber-200 bg-white',
          error: 'border-red-200 bg-white'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border ${borderColors[toast.type]} transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            {icons[toast.type]}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#0F172A]">{toast.title}</h4>
              <p className="text-xs text-[#334155] mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
