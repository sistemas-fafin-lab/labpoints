import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

export function Avatar({ src, alt, size = 'md', fallbackText }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-9 h-9',
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32',
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-4xl',
  };

  const ringClasses = {
    xs: 'ring-2',
    sm: 'ring-2',
    md: 'ring-3',
    lg: 'ring-3',
    xl: 'ring-4',
  };

  const getInitials = (text?: string) => {
    if (!text) return '?';
    const words = text.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const showImage = Boolean(src) && !hasError;

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${sizeClasses[size]} ${ringClasses[size]} rounded-full overflow-hidden bg-lab-gradient flex items-center justify-center font-ranade font-bold shadow-md ring-white transition-transform hover:scale-105 flex-shrink-0`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={`text-white ${textSizeClasses[size]} leading-none`} aria-hidden="false">
          {getInitials(fallbackText || alt)}
        </span>
      )}
    </div>
  );
}
