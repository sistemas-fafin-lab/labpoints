import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Award, 
  Gift, 
  User,
  Sparkles,
  Check,
  Trophy,
  MapPin,
  Menu
} from 'lucide-react';

// Tutorial steps configuration
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  locationHint?: string; // Where to find this feature
  locationIcon?: React.ReactNode;
  highlightColor?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Lab Points! 🎉',
    description: 'Este é o sistema de recompensas da empresa. Aqui você acumula pontos por suas conquistas e pode trocá-los por prêmios incríveis. Vamos fazer um tour rápido?',
    icon: <Sparkles style={{ width: '32px', height: '32px' }} className="text-yellow-500" />,
    highlightColor: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Principal',
    description: 'Esta é sua central de informações. Logo ao entrar você vê seu saldo de pontos no card azul, o ranking dos top colaboradores e as recompensas disponíveis para resgate.',
    icon: <LayoutDashboard style={{ width: '32px', height: '32px' }} className="text-lab-primary" />,
    locationHint: 'É a primeira página após o login',
    locationIcon: <LayoutDashboard style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-lab-primary to-indigo-500',
  },
  {
    id: 'ranking',
    title: 'Ranking de Colaboradores',
    description: 'Veja os 5 colaboradores mais pontuados no ranking! Clique em qualquer usuário para ver o perfil completo. Será que você consegue chegar ao topo? 🏆',
    icon: <Trophy style={{ width: '32px', height: '32px' }} className="text-yellow-500" />,
    locationHint: 'Logo abaixo dos cards de pontuação no Dashboard',
    locationIcon: <LayoutDashboard style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'points',
    title: 'Seus Pontos',
    description: 'Acompanhe sua pontuação em tempo real no card azul "Seu Saldo". Você ganha pontos quando um gestor reconhece suas contribuições e comportamentos alinhados aos valores da empresa.',
    icon: <Award style={{ width: '32px', height: '32px' }} className="text-emerald-500" />,
    locationHint: 'Card azul destacado no topo do Dashboard',
    locationIcon: <LayoutDashboard style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'rewards',
    title: 'Recompensas',
    description: 'Explore todos os prêmios disponíveis na página de Recompensas. Quando tiver pontos suficientes, clique em "Resgatar" e aguarde a aprovação do seu gestor!',
    icon: <Gift style={{ width: '32px', height: '32px' }} className="text-purple-500" />,
    locationHint: 'Menu superior → "Recompensas"',
    locationIcon: <Menu style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-purple-500 to-pink-500',
  },
  {
    id: 'profile',
    title: 'Seu Perfil',
    description: 'Clique na sua foto ou iniciais no canto superior direito para acessar seu perfil. Lá você pode editar seus dados, adicionar uma foto e ver todo seu histórico de transações e resgates.',
    icon: <User style={{ width: '32px', height: '32px' }} className="text-indigo-500" />,
    locationHint: 'Clique no avatar no canto superior direito',
    locationIcon: <User style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'complete',
    title: 'Pronto para começar! 🚀',
    description: 'Agora você já conhece as principais áreas do sistema. Explore, acumule pontos e aproveite suas recompensas! Se precisar rever este tutorial, acesse seu Perfil.',
    icon: <Check style={{ width: '32px', height: '32px' }} className="text-green-500" />,
    locationHint: 'Tutorial disponível em Perfil → "Rever tutorial"',
    locationIcon: <User style={{ width: '16px', height: '16px' }} />,
    highlightColor: 'from-green-500 to-emerald-500',
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ isOpen, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  // Reset step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
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

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsAnimating(true);
      }, 150);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsAnimating(true);
      }, 150);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop - same as AssignPointsModal */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />

      {/* Modal Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8 px-4">
        {/* Tutorial Card - same styling as AssignPointsModal */}
        <div
          className={`
            relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-lg min-w-[320px] sm:min-w-[480px] overflow-hidden border border-white/50 animate-scale-in my-auto
            transform transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
          `}
        >
          {/* Header with dynamic gradient - same structure as AssignPointsModal */}
          <div className={`relative bg-gradient-to-br ${currentStep.highlightColor || 'from-lab-primary via-indigo-500 to-purple-600'} p-7 text-white overflow-hidden`}>
            {/* Background decorations - same as AssignPointsModal */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Skip button - same style as close button in AssignPointsModal */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSkip();
              }}
              className="absolute top-5 right-5 z-20 px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm cursor-pointer"
              aria-label="Pular tutorial"
            >
              <span className="text-sm font-dm-sans font-medium text-white">Pular</span>
              <X style={{ width: '14px', height: '14px' }} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Header content */}
            <div className="relative flex items-center gap-5 pr-28">
              <div 
                className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg transition-all duration-500"
                style={{ width: '64px', height: '64px' }}
              >
                <div className="[&>svg]:text-white [&>svg]:drop-shadow-lg transition-transform duration-500">
                  {currentStep.icon}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white">
                  {currentStep.title}
                </h2>
                <p className="text-white/90 text-sm font-dm-sans mt-0.5">
                  Passo {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
                </p>
              </div>
            </div>

            {/* Step indicator - same style as AssignPointsModal */}
            <div className="flex items-center gap-2 mt-6">
              {TUTORIAL_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsAnimating(false);
                    setTimeout(() => {
                      setCurrentStepIndex(index);
                      setIsAnimating(true);
                    }, 150);
                  }}
                  className={`
                    h-2 rounded-full transition-all duration-300 cursor-pointer
                    ${index === currentStepIndex 
                      ? 'w-8 bg-white shadow-lg' 
                      : index < currentStepIndex 
                        ? 'w-2 bg-white/80 hover:bg-white' 
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }
                  `}
                  aria-label={`Ir para passo ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Content - same padding as AssignPointsModal */}
          <div className="p-6">
            {/* Animated content wrapper for smooth transitions */}
            <div 
              key={currentStep.id}
              className="animate-slide-in-right"
              style={{ animation: isAnimating ? 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'slideOutLeft 0.2s ease-out forwards' }}
            >
            {/* Location hint badge */}
            {currentStep.locationHint && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200/50 mb-5">
                <div className="w-10 h-10 rounded-xl bg-lab-light flex items-center justify-center flex-shrink-0">
                  <MapPin style={{ width: '18px', height: '18px' }} className="text-lab-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-900 font-dm-sans font-semibold">Onde encontrar</p>
                  <p className="text-sm text-slate-600 font-dm-sans mt-0.5">
                    {currentStep.locationHint}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-[15px] text-slate-600 font-dm-sans leading-relaxed mb-6">
              {currentStep.description}
            </p>

            {/* Navigation - same button styles as AssignPointsModal */}
            <div className="flex gap-3 pt-3">
              {/* Back button */}
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                  font-dm-sans font-semibold text-sm
                  transition-all duration-300
                  ${isFirstStep 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }
                `}
              >
                <ChevronLeft style={{ width: '18px', height: '18px' }} />
                <span>Voltar</span>
              </button>

              {/* Next button - same gradient style as AssignPointsModal */}
              <button
                onClick={handleNext}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                  bg-gradient-to-r ${currentStep.highlightColor || 'from-lab-primary to-indigo-500'}
                  font-dm-sans font-semibold text-sm
                  shadow-lg hover:shadow-xl hover:brightness-110
                  transition-all duration-300 hover:scale-[1.01]
                `}
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>{isLastStep ? 'Começar a usar' : 'Próximo'}</span>
                {isLastStep ? <Sparkles style={{ width: '18px', height: '18px' }} className="text-white" /> : <ChevronRight style={{ width: '18px', height: '18px' }} className="text-white" />}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
