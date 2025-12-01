import { Star } from 'lucide-react';

interface PointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PointsBadge({ points, size = 'md', showLabel = true }: PointsBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-lg gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} bg-lab-gradient text-white rounded-full font-ranade font-bold`}
      aria-label={`${points} Lab Points`}
    >
      <Star size={iconSizes[size]} fill="currentColor" />
      <span className="text-white opacity-90">{points.toLocaleString('pt-BR')}</span>
      {showLabel && size !== 'sm' && <span className="font-dm-sans font-normal text-xs opacity-90 text-white">pts</span>}
    </div>
  );
}
