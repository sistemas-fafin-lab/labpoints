import { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, AlertCircle, ChevronDown, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { RedemptionPeriod } from '../../hooks/useRedemptionPeriod';

interface RedemptionPeriodControlProps {
  period: RedemptionPeriod | null;
  periodLoading: boolean;
  periodSaving: boolean;
  onSavePeriod: (startDay: number, endDay: number) => Promise<{ success: boolean; error?: string }>;
  onDeletePeriod: () => Promise<{ success: boolean; error?: string }>;
  showToast: (message: string, type: 'success' | 'error') => void;
  isAdmin: boolean;
}

export function RedemptionPeriodControl({
  period,
  periodLoading,
  periodSaving,
  onSavePeriod,
  onDeletePeriod,
  showToast,
  isAdmin,
}: RedemptionPeriodControlProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [startDay, setStartDay] = useState<number | ''>(period?.start_day || '');
  const [endDay, setEndDay] = useState<number | ''>(period?.end_day || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update form values when period loads
  useEffect(() => {
    if (!periodLoading && period) {
      setStartDay(period.start_day);
      setEndDay(period.end_day);
    }
  }, [period, periodLoading]);

  // Track changes
  useEffect(() => {
    if (period) {
      setHasChanges(startDay !== period.start_day || endDay !== period.end_day);
    } else {
      setHasChanges(startDay !== '' && endDay !== '');
    }
  }, [startDay, endDay, period]);

  const handleSavePeriod = async () => {
    if (!startDay || !endDay) {
      showToast('Preencha os dias de início e fim', 'error');
      return;
    }

    if (startDay > endDay) {
      showToast('O dia de início deve ser menor que o dia final', 'error');
      return;
    }

    const result = await onSavePeriod(startDay, endDay);

    if (result.success) {
      setShowSuccess(true);
      setHasChanges(false);
      showToast('Período de resgate salvo com sucesso!', 'success');
      
      // Hide success state after delay
      setTimeout(() => {
        setShowSuccess(false);
        setShowConfig(false);
      }, 1200);
    } else {
      showToast(result.error || 'Erro ao salvar período', 'error');
    }
  };

  const handleDeletePeriod = async () => {
    const result = await onDeletePeriod();

    if (result.success) {
      showToast('Período removido - resgates liberados o mês todo', 'success');
      setStartDay('');
      setEndDay('');
      setShowConfig(false);
      setHasChanges(false);
    } else {
      showToast(result.error || 'Erro ao remover período', 'error');
    }
  };

  // Non-admin view
  if (!isAdmin) {
    if (!period) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-5 mb-6 animate-fade-in-up backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/15">
            <Calendar size={32} className="text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="font-ranade font-semibold text-gray-900 mb-1">Período de Resgate Ativo</h3>
            <p className="text-sm text-gray-600 font-dm-sans leading-relaxed">
              Os colaboradores podem solicitar resgates entre os dias{' '}
              <span className="font-semibold text-blue-600">{period.start_day}</span>
              {' '}e{' '}
              <span className="font-semibold text-blue-600">{period.end_day}</span>
              {' '}de cada mês.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 mb-6 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="group w-full flex items-center justify-between p-5 hover:bg-gray-50/30 transition-colors duration-150"
        aria-expanded={showConfig}
        aria-controls="period-config-panel"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <Calendar size={28} className="text-purple-500" strokeWidth={2} />
          </div>
          <div className="text-left">
            <h3 className="font-ranade font-semibold text-gray-900">Período de Resgate</h3>
            <p className="text-sm text-gray-500 font-dm-sans">
              {period
                ? (
                  <span className="flex items-center gap-1.5">
                    Dia <span className="font-medium text-purple-600">{period.start_day}</span>
                    <ArrowRight size={12} className="text-gray-300" />
                    Dia <span className="font-medium text-purple-600">{period.end_day}</span>
                  </span>
                )
                : 'Sem restrição - resgates sempre liberados'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center
              transition-all duration-150 ease-out
              ${showConfig ? 'bg-purple-100 rotate-180' : 'bg-gray-100/80 group-hover:bg-gray-200/80'}
            `}
          >
            <ChevronDown size={16} className={showConfig ? 'text-purple-600' : 'text-gray-400'} />
          </div>
        </div>
      </button>

      {/* Expandable Config Panel */}
      <div
        id="period-config-panel"
        className={`
          grid transition-all duration-200 ease-out
          ${showConfig ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 p-5 bg-gray-50/20">
            {/* Range Input Group */}
            <div className="mb-5">
              <label className="block text-xs font-dm-sans font-medium text-gray-500 uppercase tracking-wide mb-3">
                Intervalo de dias permitidos
              </label>
            <div className="flex items-center gap-3">
                {/* Start Day Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={startDay}
                      onChange={(e) => setStartDay(Number(e.target.value) || '')}
                      min={1}
                      max={31}
                      placeholder="1"
                      className="
                        w-full px-4 py-3 rounded-xl 
                        border border-gray-200 bg-white
                        text-center text-xl font-ranade font-bold text-gray-900
                        placeholder:text-gray-300 placeholder:font-normal
                        transition-all duration-150
                        focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 focus:shadow-sm
                        hover:border-gray-300
                      "
                      aria-label="Dia de início do período"
                    />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-dm-sans uppercase tracking-wider">
                      Início
                    </span>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100/80 flex-shrink-0">
                  <ArrowRight size={14} className="text-gray-400" />
                </div>

                {/* End Day Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={endDay}
                      onChange={(e) => setEndDay(Number(e.target.value) || '')}
                      min={1}
                      max={31}
                      placeholder="15"
                      className="
                        w-full px-4 py-3 rounded-xl 
                        border border-gray-200 bg-white
                        text-center text-xl font-ranade font-bold text-gray-900
                        placeholder:text-gray-300 placeholder:font-normal
                        transition-all duration-150
                        focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 focus:shadow-sm
                        hover:border-gray-300
                      "
                      aria-label="Dia final do período"
                    />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-dm-sans uppercase tracking-wider">
                      Fim
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning for days > 28 */}
            {endDay && endDay > 28 && (
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 mb-5 animate-fade-in">
                <p className="text-xs text-amber-700 font-dm-sans flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 text-amber-500" />
                  <span>Atenção: Dias acima de 28 podem não funcionar em fevereiro.</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePeriod}
                loading={periodSaving && !showSuccess}
                disabled={!hasChanges || periodSaving || showSuccess}
                className={`
                  flex items-center gap-2 flex-1 sm:flex-none min-w-[140px]
                  transition-all duration-150
                  ${showSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-500' 
                    : !hasChanges ? 'opacity-60' : 'hover:shadow-md hover:shadow-lab-primary/15'
                  }
                `}
              >
                {showSuccess ? (
                  <>
                    <Check size={18} className="animate-bounce-subtle" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Período
                  </>
                )}
              </Button>
              
              {period && !showSuccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeletePeriod}
                  loading={periodSaving}
                  disabled={periodSaving}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Remover</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
