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

/**
 * Traduz mensagens de erro técnicas para linguagem natural em português
 */
function translateErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Erros de autenticação
  if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
    return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
  }
  if (lowerMessage.includes('email not confirmed')) {
    return 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.';
  }
  if (lowerMessage.includes('user already registered') || lowerMessage.includes('user already exists')) {
    return 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
  }
  if (lowerMessage.includes('invalid email')) {
    return 'Email inválido. Digite um endereço de email válido.';
  }
  if (lowerMessage.includes('password') && lowerMessage.includes('short')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (lowerMessage.includes('invalid refresh token') || lowerMessage.includes('refresh token not found')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  
  // Erros de banco de dados
  if (lowerMessage.includes('update requires a where clause')) {
    return 'Erro na atualização dos dados. Entre em contato com o suporte.';
  }
  if (lowerMessage.includes('foreign key violation') || lowerMessage.includes('violates foreign key')) {
    return 'Não é possível realizar esta ação pois existem dados relacionados.';
  }
  if (lowerMessage.includes('unique constraint') || lowerMessage.includes('duplicate key')) {
    return 'Este registro já existe no sistema.';
  }
  if (lowerMessage.includes('not null violation')) {
    return 'Preencha todos os campos obrigatórios.';
  }
  if (lowerMessage.includes('permission denied') || lowerMessage.includes('insufficient privileges')) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  if (lowerMessage.includes('row level security')) {
    return 'Acesso negado. Você não tem permissão para acessar este recurso.';
  }
  
  // Erros de rede
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed') || lowerMessage.includes('failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  if (lowerMessage.includes('timeout')) {
    return 'A operação demorou muito. Tente novamente.';
  }
  
  // Erros de validação
  if (lowerMessage.includes('invalid input') || lowerMessage.includes('validation error')) {
    return 'Dados inválidos. Verifique as informações e tente novamente.';
  }
  if (lowerMessage.includes('required field') || lowerMessage.includes('campo obrigatório')) {
    return 'Preencha todos os campos obrigatórios.';
  }
  
  // Erros de operação
  if (lowerMessage.includes('not found') || lowerMessage.includes('não encontrado')) {
    return 'Registro não encontrado.';
  }
  if (lowerMessage.includes('already exists') || lowerMessage.includes('já existe')) {
    return 'Este item já existe no sistema.';
  }
  if (lowerMessage.includes('insufficient') && lowerMessage.includes('points')) {
    return 'Você não possui pontos suficientes para esta ação.';
  }
  
  // Erros do sistema de aprovação
  if (lowerMessage.includes('approver') && lowerMessage.includes('not found')) {
    return 'Nenhum aprovador disponível. Entre em contato com um administrador.';
  }
  if (lowerMessage.includes('select_random_approver') || lowerMessage.includes('get_approval_settings')) {
    return 'Sistema de aprovação não configurado. Entre em contato com um administrador.';
  }
  
  // Erros de arquivo/upload
  if (lowerMessage.includes('file too large') || lowerMessage.includes('arquivo muito grande')) {
    return 'Arquivo muito grande. O tamanho máximo permitido é 2MB.';
  }
  if (lowerMessage.includes('invalid file type') || lowerMessage.includes('tipo de arquivo')) {
    return 'Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG).';
  }
  
  // Erros genéricos do Supabase
  if (lowerMessage.includes('jwt') && lowerMessage.includes('expired')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  if (lowerMessage.includes('function') && lowerMessage.includes('does not exist')) {
    return 'Funcionalidade não disponível. O sistema precisa ser atualizado.';
  }
  
  // Se a mensagem já está em português e clara, retorna ela mesma
  if (!lowerMessage.match(/[a-z]+\s*\([^)]*\)|code:|error:/i) && message.length < 100) {
    return message;
  }
  
  // Fallback: mensagem genérica
  return 'Ocorreu um erro. Tente novamente ou entre em contato com o suporte.';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    // Traduz mensagens de erro para português natural
    const translatedMessage = type === 'error' ? translateErrorMessage(message) : message;
    setToasts((prev) => [...prev, { id, message: translatedMessage, type }]);

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
