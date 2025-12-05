import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

export function Avatar({ src, alt, size = 'md', fallbackText }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-48 h-48',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-5xl',
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
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-lab-gradient flex items-center justify-center font-ranade font-bold shadow-lab-md ring-4 ring-white transition-transform hover:scale-105 flex-shrink-0`}
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
