import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-skeleton-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
});

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100/80 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="rounded" className="h-8 w-16" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// Stats Cards Grid Skeleton
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
          <StatsCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Redemption Card Skeleton
export function RedemptionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Skeleton variant="rounded" className="h-5 w-24" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" className="h-4 w-32" />
            <Skeleton variant="text" className="h-3 w-20" />
          </div>
        </div>
        
        {/* Reward info */}
        <div className="bg-gray-50/50 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Skeleton variant="rounded" className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-full" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton variant="rounded" className="h-6 w-16" />
          </div>
        </div>
        
        {/* Actions */}
        <Skeleton variant="rounded" className="h-10 w-full" />
      </div>
    </div>
  );
}

// Redemptions Grid Skeleton
export function RedemptionsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(i * 75, 300)}ms` }}
        >
          <RedemptionCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Filters Skeleton
export function FiltersSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100/80 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Skeleton variant="rounded" className="flex-1 h-12" />
        <Skeleton variant="rounded" className="h-12 w-full sm:w-44" />
      </div>
    </div>
  );
}
