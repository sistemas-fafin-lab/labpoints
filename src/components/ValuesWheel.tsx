import { useState } from 'react';
import { X, Users, Target, Shield, Rocket, Heart, TrendingUp, Sparkles } from 'lucide-react';

interface Value {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const values: Value[] = [
  {
    id: 1,
    name: 'Senso de Time',
    description: 'Trabalhamos juntos, celebramos juntos',
    icon: <Users size={22} />
  },
  {
    id: 2,
    name: 'Foco no Cliente',
    description: 'O cliente sempre no centro de tudo',
    icon: <Target size={22} />
  },
  {
    id: 3,
    name: 'Autorrespon- sabilidade',
    description: 'Donos do nosso próprio destino',
    icon: <Shield size={22} />
  },
  {
    id: 4,
    name: 'Espírito Empreendedor',
    description: 'Inovamos e criamos oportunidades',
    icon: <Rocket size={22} />
  },
  {
    id: 5,
    name: 'Empatia',
    description: 'Nos colocamos no lugar do outro',
    icon: <Heart size={22} />
  },
  {
    id: 6,
    name: 'Constante Evolução',
    description: 'Aprendemos e melhoramos sempre',
    icon: <TrendingUp size={22} />
  }
];

export function ValuesWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedValue(null);
    }
  };

  const handleValueClick = (valueId: number) => {
    setSelectedValue(selectedValue === valueId ? null : valueId);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={() => {
            setIsOpen(false);
            setSelectedValue(null);
          }}
        />
      )}

      {/* Floating Container */}
      <div className="fixed bottom-6 right-6 z-[150] sm:bottom-8 sm:right-8">
        
        {/* Expanded Panel */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 sm:bottom-24">
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden w-[340px] sm:w-[380px]">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 px-6 py-5">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                </div>
                
                <div className="relative flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/25 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-ranade font-bold text-white drop-shadow-sm">
                      Nossos Valores
                    </h3>
                    <p className="text-sm text-white/90 font-dm-sans drop-shadow-sm">
                      O que nos define como Colabs
                    </p>
                  </div>
                </div>
              </div>

              {/* Values Grid */}
              <div className="p-5 grid grid-cols-3 gap-4">
                {values.map((value) => (
                  <button
                    key={value.id}
                    onClick={() => handleValueClick(value.id)}
                    className="group relative flex flex-col items-center p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50/70 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Shimmer effect on hover - similar to RewardTimeline */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
                    
                    {/* Icon Container */}
                    <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 ${
                      selectedValue === value.id 
                        ? 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-xl shadow-blue-500/40 scale-105' 
                        : 'bg-white border-2 border-sky-200 group-hover:border-sky-400 group-hover:shadow-lg group-hover:scale-105'
                    }`}>
                      <span className={`relative z-10 transition-colors duration-300 ${
                        selectedValue === value.id ? 'text-white' : 'text-sky-600'
                      }`}>
                        {value.icon}
                      </span>
                    </div>
                    
                    {/* Name */}
                    <span className={`text-[10.5px] font-dm-sans font-bold text-center leading-tight transition-colors duration-300 max-w-[80px] ${
                      selectedValue === value.id ? 'text-sky-700' : 'text-slate-700 group-hover:text-sky-700'
                    }`}>
                      {value.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Value Description */}
              {selectedValue && (
                <div className="px-5 pb-5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-200 shadow-inner">
                    <p className="text-sm text-slate-700 font-dm-sans leading-relaxed">
                      <span className="font-bold text-sky-700">
                        {values.find(v => v.id === selectedValue)?.name}:
                      </span>{' '}
                      {values.find(v => v.id === selectedValue)?.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-center gap-2 py-3 border-t-2 border-slate-100">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  <p className="text-xs font-ranade font-bold text-slate-600 whitespace-nowrap px-2">
                    Ser colab é ser lab
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={toggleOpen}
          className={`relative w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl shadow-2xl transition-all duration-500 flex items-center justify-center cursor-pointer group overflow-hidden ${
            isOpen 
              ? 'bg-white border-2 border-slate-300 scale-100' 
              : 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 hover:shadow-blue-600/50 hover:scale-110'
          }`}
        >
          {/* Pulse animation when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-2xl bg-sky-400 animate-ping opacity-30" />
          )}
          
          {/* Shimmer effect */}
          {!isOpen && (
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
          
          {/* Icon */}
          <span className={`relative z-10 transition-all duration-500 ${isOpen ? 'rotate-180 scale-110' : 'rotate-0'}`}>
            {isOpen ? (
              <X size={28} className="text-slate-700" strokeWidth={3} />
            ) : (
              <Sparkles size={28} className="text-white drop-shadow-lg" strokeWidth={2.5} />
            )}
          </span>
        </button>

        {/* Label when closed */}
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
            <div className="bg-white rounded-xl px-4 py-2.5 shadow-xl border-2 border-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
              <p className="text-sm font-dm-sans font-semibold text-slate-700">
                Nossos Valores
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
