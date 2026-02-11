import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  X, 
  UserCircle
} from 'lucide-react';

interface ProfilePhotoPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: () => void;
}

export function ProfilePhotoPrompt({ isOpen, onClose, onAddPhoto }: ProfilePhotoPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // Animate in when opening
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Block body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddPhoto = useCallback(() => {
    onAddPhoto();
    navigate('/perfil');
  }, [onAddPhoto, navigate]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={handleClose}
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop - same as AssignPointsModal */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />

      {/* Modal Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8 px-4">
        {/* Modal Card - same styling as AssignPointsModal */}
        <div
          className={`
            relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-md min-w-[320px] sm:min-w-[400px] overflow-hidden border border-white/50 animate-scale-in my-auto
            transform transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - same structure as AssignPointsModal */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-7 text-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Close button - same style as AssignPointsModal */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
              aria-label="Fechar modal"
            >
              <X style={{ width: '18px', height: '18px' }} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Header content */}
            <div className="relative flex items-center gap-5 pr-16">
              <div 
                className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{ width: '64px', height: '64px' }}
              >
                <Camera style={{ width: '32px', height: '32px', color: 'white' }} strokeWidth={2} className="drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white">
                  Complete seu perfil
                </h2>
                <p className="text-white/90 text-sm font-dm-sans mt-0.5">
                  Adicione uma foto de perfil
                </p>
              </div>
            </div>
          </div>

          {/* Content - same padding as AssignPointsModal */}
          <div className="p-6">
            {/* Info Box - same style as AssignPointsModal */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200/50 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UserCircle style={{ width: '20px', height: '20px' }} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-900 font-dm-sans font-semibold">Por que adicionar uma foto?</p>
                <p className="text-sm text-purple-700 font-dm-sans mt-0.5">
                  Sua equipe poderá te reconhecer melhor dentro da plataforma.
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[14px] text-slate-600 font-dm-sans leading-relaxed mb-6 text-center">
              Uma foto de perfil ajuda a criar conexões mais pessoais e facilita a identificação no ranking e nas aprovações.
            </p>

            {/* Actions - same button styles as AssignPointsModal */}
            <div className="flex gap-3 pt-3">
              {/* Secondary action */}
              <button
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-dm-sans font-semibold text-sm transition-all duration-300"
              >
                Agora não
              </button>

              {/* Primary action */}
              <button
                onClick={handleAddPhoto}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-dm-sans font-semibold text-sm shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 hover:scale-[1.01]"
                style={{ color: 'white' }}
              >
                <Camera style={{ width: '18px', height: '18px', color: 'white' }} />
                <span style={{ color: 'white' }}>Adicionar foto</span>
              </button>
            </div>

            {/* Helper text */}
            <p className="mt-5 text-[11px] text-slate-400 font-dm-sans text-center">
              Você pode adicionar sua foto a qualquer momento em Perfil → Editar Perfil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
