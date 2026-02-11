import { memo } from 'react';
import { Clock, CheckCircle2, Package, XCircle, LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface StatsCardsProps {
  stats: {
    pendente: number;
    aprovado: number;
    entregue: number;
    cancelado: number;
  };
  loading?: boolean;
}

interface StatCardConfig {
  key: keyof StatsCardsProps['stats'];
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  glowColor: string;
}

const STATS_CONFIG: StatCardConfig[] = [
  {
    key: 'pendente',
    label: 'Pendentes',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    hoverBorder: 'hover:border-amber-200/80',
    glowColor: 'group-hover:shadow-amber-100/50',
  },
  {
    key: 'aprovado',
    label: 'Aprovados',
    icon: CheckCircle2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    hoverBorder: 'hover:border-blue-200/80',
    glowColor: 'group-hover:shadow-blue-100/50',
  },
  {
    key: 'entregue',
    label: 'Entregues',
    icon: Package,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    hoverBorder: 'hover:border-emerald-200/80',
    glowColor: 'group-hover:shadow-emerald-100/50',
  },
  {
    key: 'cancelado',
    label: 'Cancelados',
    icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
    hoverBorder: 'hover:border-red-200/80',
    glowColor: 'group-hover:shadow-red-100/50',
  },
];

// Individual stat card with count-up animation
const StatCard = memo(function StatCard({
  config,
  value,
  index,
}: {
  config: StatCardConfig;
  value: number;
  index: number;
}) {
  const Icon = config.icon;
  const animatedValue = useCountUp({
    end: value,
    duration: 600,
    delay: index * 80,
  });

  return (
    <div
      className={`
        group relative bg-white rounded-xl p-5 
        border border-gray-100/80 
        shadow-sm ${config.glowColor}
        ${config.hoverBorder}
        hover:shadow-md hover:-translate-y-0.5
        transition-all duration-150 ease-out
        cursor-default select-none
        animate-fade-in-up
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      role="status"
      aria-label={`${value} resgates ${config.label.toLowerCase()}`}
    >
      {/* Subtle top gradient line */}
      <div 
        className={`
          absolute top-0 left-4 right-4 h-[2px] rounded-full
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          ${config.iconBg.replace('bg-', 'bg-gradient-to-r from-transparent via-').replace('-50', '-300')} to-transparent
        `}
      />
      
      <div className="flex items-center gap-4">
        <div 
          className={`
            w-14 h-14 rounded-xl ${config.iconBg} 
            flex items-center justify-center
            transition-all duration-150 ease-out
            group-hover:scale-105
          `}
        >
          <Icon 
            size={28} 
            className={`${config.iconColor} transition-transform duration-150`} 
            strokeWidth={2}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900 leading-none tabular-nums">
            {animatedValue}
          </p>
          <p className="text-sm text-gray-400 font-dm-sans mt-1 truncate">
            {config.label}
          </p>
        </div>
      </div>
    </div>
  );
});

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 mt-6">
      {STATS_CONFIG.map((config, index) => (
        <StatCard
          key={config.key}
          config={config}
          value={stats[config.key]}
          index={index}
        />
      ))}
    </div>
  );
}

