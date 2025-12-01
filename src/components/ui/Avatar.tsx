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
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-48 h-48 text-5xl',
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
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-lab-gradient flex items-center justify-center font-ranade font-bold shadow-lab-md ring-4 ring-white transition-transform hover:scale-105`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-white" aria-hidden="false">{getInitials(fallbackText || alt)}</span>
      )}
    </div>
  );
}
