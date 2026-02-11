import { User, DEPARTMENT_LABELS } from '../lib/supabase';
import { AvatarWithPreview } from './AvatarWithPreview';
import { PointsBadge } from './ui/PointsBadge';
import { Button } from './ui/Button';

interface ColabCardProps {
  user: User;
  onViewProfile?: () => void;
}

export function ColabCard({ user, onViewProfile }: ColabCardProps) {
  return (
    <div className="bg-white rounded-lab p-16 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex flex-col items-center text-center gap-4">
        <AvatarWithPreview
          src={user.avatar_url}
          alt={user.nome}
          size="lg"
          fallbackText={user.nome}
          user={{
            id: user.id,
            nome: user.nome,
            avatar_url: user.avatar_url,
            lab_points: user.lab_points,
            department: user.department,
            role: user.role,
            created_at: user.created_at,
          }}
        />

        <div className="flex-1">
          <h3 className="text-xl font-ranade font-bold text-gray mb-1">
            {user.nome}
          </h3>
          <p className="text-sm font-dm-sans text-gray mb-3">
            {user.department ? DEPARTMENT_LABELS[user.department] : 'Colaborador'}
          </p>

          <PointsBadge points={user.lab_points} size="md" />
        </div>

        {onViewProfile && (
          <Button
            variant="secondary"
            onClick={onViewProfile}
            className="w-full"
            aria-label={`Ver perfil de ${user.nome}`}
          >
            Ver Perfil
          </Button>
        )}
      </div>
    </div>
  );
}
