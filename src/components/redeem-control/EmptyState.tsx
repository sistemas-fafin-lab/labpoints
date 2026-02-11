import { Package, Search, Filter } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden animate-fade-in-up">
      <div className="flex flex-col items-center justify-center py-20 px-6">
        {/* Icon Container */}
        <div className="relative mb-8 animate-float-gentle">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gray-100/80 rounded-full blur-2xl scale-[2] opacity-50" />
          
          {/* Main icon */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 flex items-center justify-center border border-gray-200/40 shadow-sm">
            {hasFilters ? (
              <Search size={40} className="text-gray-300" strokeWidth={1.5} />
            ) : (
              <Package size={40} className="text-gray-300" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-xs">
          <h3 className="text-lg font-ranade font-semibold text-gray-800 mb-2">
            {hasFilters ? 'Nenhum resgate encontrado' : 'Nenhum resgate registrado'}
          </h3>
          <p className="text-gray-400 font-dm-sans text-sm leading-relaxed">
            {hasFilters
              ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
              : 'Os resgates realizados pelos colaboradores aparecerão aqui assim que forem solicitados.'}
          </p>
        </div>

        {/* Clear filters button */}
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="
              mt-8 px-5 py-2.5 rounded-xl
              bg-gray-100/80 text-gray-600 
              font-dm-sans text-sm font-medium
              hover:bg-gray-200/80 hover:text-gray-700
              transition-all duration-150 ease-out
              flex items-center gap-2
              hover:shadow-sm
              active:scale-[0.98]
            "
          >
            <Filter size={15} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
