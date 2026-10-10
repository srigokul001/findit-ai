import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, title = '') => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toast = {
    success: (msg, title) => addToast('success', msg, title || 'Success'),
    error: (msg, title) => addToast('error', msg, title || 'Error'),
    info: (msg, title) => addToast('info', msg, title || 'Notice'),
    warning: (msg, title) => addToast('warning', msg, title || 'Warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const config = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              border: 'border-emerald-200 bg-white/95',
              shadow: 'shadow-emerald-500/10',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              border: 'border-rose-200 bg-white/95',
              shadow: 'shadow-rose-500/10',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
              border: 'border-amber-200 bg-white/95',
              shadow: 'shadow-amber-500/10',
            },
            info: {
              icon: <Info className="w-5 h-5 text-cyan-500 shrink-0" />,
              border: 'border-cyan-200 bg-white/95',
              shadow: 'shadow-cyan-500/10',
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${config.border} ${config.shadow} transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-sm font-semibold text-slate-900">{t.title}</h4>}
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
