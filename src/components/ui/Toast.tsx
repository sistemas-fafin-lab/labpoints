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
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-xs sm:max-w-md">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lab shadow-lab-lg backdrop-blur-sm animate-slide-in border
              ${toast.type === 'success' 
                ? 'bg-green-600 text-white border-green-700' 
                : 'bg-red-600 text-white border-red-700'}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
            role="alert"
            aria-live="polite"
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5 drop-shadow" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 drop-shadow" />
            )}
            <p className="flex-1 font-dm-sans text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded transition-all p-1"
              aria-label="Fechar notificação"
            >
              <X size={18} />
            </button>
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
