import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-xs sm:max-w-md">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              group relative flex items-center gap-4 p-4 pr-14 rounded-2xl shadow-2xl backdrop-blur-md animate-slide-in overflow-hidden
              ${toast.type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
            role="alert"
            aria-live="polite"
          >
            {/* Decorative glow effect */}
            <div className={`absolute inset-0 opacity-30 blur-xl ${
              toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'
            }`} />
            
            {/* Icon container */}
            <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'success' 
                ? 'bg-white/20 ring-1 ring-white/30' 
                : 'bg-white/20 ring-1 ring-white/30'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle size={22} className="text-white drop-shadow-md" strokeWidth={2.5} />
              ) : (
                <AlertCircle size={22} className="text-white drop-shadow-md" strokeWidth={2.5} />
              )}
            </div>
            
            {/* Message */}
            <div className="relative flex-1 min-w-0">
              <p className="font-dm-sans text-sm font-semibold text-white leading-snug drop-shadow-sm">
                {toast.message}
              </p>
              <p className="font-dm-sans text-xs text-white/70 mt-0.5">
                {toast.type === 'success' ? 'Sucesso' : 'Erro'}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition-all duration-200 hover:scale-110"
              aria-label="Fechar notificação"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className={`h-full ${toast.type === 'success' ? 'bg-white/60' : 'bg-white/60'} animate-toast-progress`}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
