import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Gift, Star, Award, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { RedeemModal } from './RedeemModal';
import type { Reward } from '../lib/supabase';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    id: string;
    name: string;
    points: number;
    descricao?: string;
    imagem_url?: string;
    categoria?: string;
  };
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  loading?: boolean;
}

export function RewardDetailModal({
  isOpen,
  onClose,
  reward,
  userPoints,
  onRedeem,
  loading
}: RewardDetailModalProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnlocked = userPoints >= reward.points;
  const pointsNeeded = reward.points - userPoints;
  const progressPercentage = Math.min((userPoints / reward.points) * 100, 100);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />
      
      {/* Modal Container - centered */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
        {/* Modal */}
        <div 
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/50 transition-all duration-500 ease-out animate-scale-in hover:shadow-indigo-500/20 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} className="text-white" />
        </button>

        {/* Image Section with gradient header */}
        <div className="relative h-52 sm:h-60 bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/15 rounded-full blur-xl" />
          </div>

          {reward.imagem_url ? (
            <>
              <img 
                src={reward.imagem_url} 
                alt={reward.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            </>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center shadow-2xl transition-all duration-700 hover:scale-110 hover:rotate-3 backdrop-blur-sm">
                <Gift size={48} strokeWidth={2} className="text-white drop-shadow-lg" />
              </div>
            </div>
          )}
          
          {/* Overlay gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />

          {/* Tags Container - with margin from edge */}
          <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
            {/* Category Badge - smaller */}
            {reward.categoria && (
              <div className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex-shrink-0 w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  {reward.categoria?.toLowerCase().includes('experiência') || reward.categoria?.toLowerCase().includes('experiencia') ? (
                    <Star size={10} className="text-white" strokeWidth={2.5} />
                  ) : reward.categoria?.toLowerCase().includes('prêmio') || reward.categoria?.toLowerCase().includes('premio') ? (
                    <Award size={10} className="text-white" strokeWidth={2.5} />
                  ) : (
                    <Gift size={10} className="text-white" strokeWidth={2.5} />
                  )}
                </div>
                <span className="text-xs font-dm-sans font-semibold text-slate-700">
                  {reward.categoria}
                </span>
              </div>
            )}

            {/* Status Badge - smaller */}
            <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isUnlocked 
                ? 'bg-emerald-500/95' 
                : 'bg-slate-400/95'
            }`}>
              <div className="flex-shrink-0 w-5 h-5 rounded-md bg-white/30 flex items-center justify-center">
                {isUnlocked ? (
                  <CheckCircle size={10} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Clock size={10} className="text-white" strokeWidth={2.5} />
                )}
              </div>
              <span className="text-xs font-dm-sans font-semibold text-white">
                {isUnlocked ? 'Desbloqueado' : 'Em progresso'}
              </span>
            </div>
          </div>

          {/* Sparkle decoration */}
          <div className="absolute bottom-5 right-5">
            <Sparkles size={18} className="text-white/40 animate-pulse" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-ranade font-bold text-slate-900 mb-2">
              {reward.name}
            </h2>
            {/* Points Badge */}
            <PointsBadge points={reward.points} size="lg" animated={isUnlocked} />
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
            <p className="text-slate-700 font-dm-sans leading-relaxed text-sm">
              {reward.descricao || 'Uma recompensa exclusiva aguarda por você! Continue acumulando pontos para desbloquear.'}
            </p>
          </div>

          {/* Progress Section (if not unlocked) */}
          {!isUnlocked && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-dm-sans text-slate-700 font-semibold">Seu progresso</span>
                <span className="text-sm font-dm-sans font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg shadow-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner border border-blue-200">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #2563eb 70%, #1e40af 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3 font-dm-sans">
                Faltam <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded">{pointsNeeded}</span> pontos para desbloquear
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1 transition-all duration-300 hover:scale-105"
            >
              Fechar
            </Button>
            {isUnlocked && (
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={loading}
                className="relative flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-lab-primary via-indigo-500 to-purple-600 text-white font-ranade font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <Gift size={20} />
                  Resgatar Agora
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Modal de Confirmação de Resgate */}
        <RedeemModal
          reward={{
            id: reward.id,
            titulo: reward.name,
            descricao: reward.descricao || '',
            custo_points: reward.points,
            categoria: reward.categoria || '',
            ativo: true,
            created_at: '',
            updated_at: '',
            imagem_url: reward.imagem_url || null
          } as Reward}
          userPoints={userPoints}
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            onRedeem(reward.id);
            setIsConfirmModalOpen(false);
            onClose();
          }}
          loading={loading}
        />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
