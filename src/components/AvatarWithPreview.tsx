import { useCallback } from 'react';
import { Avatar } from './ui/Avatar';
import { useHoverDelay } from '../hooks/useHoverDelay';
import { useProfilePreview, PreviewUser } from './UserProfilePreviewModal';

interface AvatarWithPreviewProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  user: PreviewUser;
  hoverDelay?: number;
  showProgressRing?: boolean;
  disabled?: boolean;
}

export function AvatarWithPreview({
  src,
  alt,
  size = 'md',
  fallbackText,
  user,
  hoverDelay = 3000,
  showProgressRing = true,
  disabled = false,
}: AvatarWithPreviewProps) {
  const { openPreview } = useProfilePreview();

  const handleTrigger = useCallback(() => {
    if (!disabled) {
      openPreview(user);
    }
  }, [openPreview, user, disabled]);

  const { isHovering, progress, handlers } = useHoverDelay({
    delay: hoverDelay,
    onTrigger: handleTrigger,
  });

  // Progress ring size based on avatar size
  const ringSize = {
    xs: 44,
    sm: 52,
    md: 64,
    lg: 72,
    xl: 136,
  };

  const strokeWidth = size === 'xl' ? 3 : 2;
  const radius = (ringSize[size] - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="relative cursor-pointer group"
      {...(disabled ? {} : handlers)}
    >
      <Avatar
        src={src}
        alt={alt}
        size={size}
        fallbackText={fallbackText}
      />
      
      {/* Progress Ring */}
      {showProgressRing && isHovering && !disabled && (
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width={ringSize[size]}
          height={ringSize[size]}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
          }}
        >
          {/* Background circle */}
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            fill="none"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100 ease-linear"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Hover tooltip */}
      {isHovering && !disabled && (
        <div 
          className="
            absolute -bottom-8 left-1/2 -translate-x-1/2
            px-2 py-1 rounded-md bg-gray-900 text-white text-[10px]
            whitespace-nowrap font-dm-sans
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none z-10
          "
        >
          {Math.ceil((100 - progress) / 100 * (hoverDelay / 1000))}s para ver perfil
        </div>
      )}
    </div>
  );
}
