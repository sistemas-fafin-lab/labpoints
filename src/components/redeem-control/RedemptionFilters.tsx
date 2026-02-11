import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { RedemptionStatus } from '../../hooks/useAllRedemptions';

type FilterStatus = 'all' | RedemptionStatus;

interface RedemptionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
}

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'resgatado', label: 'Resgatados' },
  { value: 'cancelado', label: 'Cancelados' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function RedemptionFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: RedemptionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced value with parent
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Sync local state with prop (for external changes)
  useEffect(() => {
    if (searchTerm !== localSearch && searchTerm !== debouncedSearch) {
      setLocalSearch(searchTerm);
    }
  }, [searchTerm]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100/80 mb-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <div 
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 
              transition-all duration-150
              ${isFocused ? 'text-lab-primary scale-105' : 'text-gray-400'}
            `}
          >
            <Search size={20} strokeWidth={isFocused ? 2.5 : 2} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por colaborador ou recompensa..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full pl-11 pr-10 py-3 rounded-xl 
              border bg-gray-50/30
              font-dm-sans text-sm text-gray-900
              placeholder:text-gray-400
              transition-all duration-150 ease-out
              ${isFocused 
                ? 'border-lab-primary/60 bg-white ring-[3px] ring-lab-primary/8 shadow-sm' 
                : 'border-gray-200/80 hover:border-gray-300 hover:bg-white'
              }
              focus:outline-none
            `}
            aria-label="Buscar resgates"
          />

          {/* Clear button */}
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                w-6 h-6 rounded-full bg-gray-100 
                flex items-center justify-center
                text-gray-400 hover:bg-gray-200 hover:text-gray-600
                transition-all duration-150
                animate-fade-in
                hover:scale-105 active:scale-95
              "
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="text-gray-400 hidden sm:block">
            <Filter size={20} strokeWidth={2} />
          </div>
          
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
              className="
                w-full sm:w-auto min-w-[160px]
                appearance-none
                px-4 py-3 pr-10 rounded-xl
                border border-gray-200/80 bg-white
                font-dm-sans text-sm text-gray-900
                cursor-pointer
                transition-all duration-150
                hover:border-gray-300
                focus:outline-none focus:border-lab-primary/60 focus:ring-[3px] focus:ring-lab-primary/8
              "
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                className="text-gray-400"
              >
                <path 
                  d="M3 4.5L6 7.5L9 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Active filter indicator */}
          {filterStatus !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="
                hidden sm:flex items-center gap-1.5
                px-2.5 py-1.5 rounded-lg
                bg-lab-primary/10 text-lab-primary text-xs font-medium
                hover:bg-lab-primary/20 transition-colors duration-150
                animate-fade-in
              "
              aria-label="Limpar filtro"
            >
              <span>{STATUS_OPTIONS.find(o => o.value === filterStatus)?.label}</span>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
