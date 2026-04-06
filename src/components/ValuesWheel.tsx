import { useState, useRef, useEffect } from 'react';
import { X, Users, Target, Shield, Rocket, Heart, TrendingUp, HandHeart } from 'lucide-react';

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

const FAB_SIZE = 60;
const SNAP_PAD = 16;

export function ValuesWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('right');
  const [bottom, setBottom] = useState(24);
  // dragX is null when snapped to edge, or the live left-px during drag
  const [dragX, setDragX] = useState<number | null>(null);
  const isDragging = dragX !== null;
  const dragRef = useRef({ startClientX: 0, startClientY: 0, startX: 0, startBottom: 0, currentX: 0, moved: false });

  const handleValueClick = (valueId: number) => {
    setSelectedValue(selectedValue === valueId ? null : valueId);
  };

  const startDrag = (clientX: number, clientY: number) => {
    const initialX = snapSide === 'right'
      ? window.innerWidth - FAB_SIZE - SNAP_PAD
      : SNAP_PAD;
    dragRef.current = { startClientX: clientX, startClientY: clientY, startX: initialX, startBottom: bottom, currentX: initialX, moved: false };
    setDragX(initialX);
  };

  const handleFabMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleFabTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const dx = cx - dragRef.current.startClientX;
      const dy = cy - dragRef.current.startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
      const newX = Math.max(SNAP_PAD, Math.min(window.innerWidth - FAB_SIZE - SNAP_PAD, dragRef.current.startX + dx));
      const newBottom = Math.max(SNAP_PAD, Math.min(window.innerHeight - FAB_SIZE - SNAP_PAD, dragRef.current.startBottom - dy));
      dragRef.current.currentX = newX;
      setDragX(newX);
      setBottom(newBottom);
    };
    const onUp = () => {
      if (!dragRef.current.moved) {
        // tap: toggle open/close
        setIsOpen(prev => { if (prev) setSelectedValue(null); return !prev; });
        setDragX(null);
        return;
      }
      // magnetic snap: determine which edge is closer
      const midpoint = window.innerWidth / 2 - FAB_SIZE / 2;
      setSnapSide(dragRef.current.currentX < midpoint ? 'left' : 'right');
      setDragX(null); // clear → CSS transition animates to snapped position
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

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

      {/* Floating Container — snaps to left or right edge */}
      <div 
        style={{
          position: 'fixed',
          bottom: `${bottom}px`,
          // during drag: free left position; when snapped: left or right edge
          ...(dragX !== null
            ? { left: `${dragX}px` }
            : snapSide === 'right'
              ? { right: `${SNAP_PAD}px` }
              : { left: `${SNAP_PAD}px` }
          ),
          zIndex: 150,
          transition: isDragging ? 'none' : 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), right 0.4s cubic-bezier(0.34,1.56,0.64,1), bottom 0.35s ease-out',
        }}
      >
        
        {/* Expanded Panel — flips side based on snap edge */}
        {isOpen && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '80px',
              ...(snapSide === 'right' ? { right: 0 } : { left: 0 }),
              width: 'calc(100vw - 48px)',
              maxWidth: '360px'
            }}
          >
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden">
              {/* Header with gradient */}
              <div 
                className="relative bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700"
                style={{ padding: '20px 24px' }}
              >
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HandHeart style={{ width: '22px', height: '22px', color: 'white' }} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                      Nossos Valores
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                      O que nos define como Colabs
                    </p>
                  </div>
                </div>
              </div>

              {/* Values Grid */}
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {values.map((value) => (
                  <button
                    key={value.id}
                    onClick={() => handleValueClick(value.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 8px',
                      borderRadius: '16px',
                      backgroundColor: selectedValue === value.id ? '#f0f9ff' : '#f8fafc',
                      border: `2px solid ${selectedValue === value.id ? '#38bdf8' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Icon Container */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      background: selectedValue === value.id 
                        ? 'linear-gradient(135deg, #0ea5e9, #4f46e5)' 
                        : 'white',
                      border: selectedValue === value.id ? 'none' : '2px solid #bae6fd',
                      boxShadow: selectedValue === value.id ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none'
                    }}>
                      <span style={{ color: selectedValue === value.id ? 'white' : '#0284c7' }}>
                        {value.icon}
                      </span>
                    </div>
                    
                    {/* Name */}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      color: selectedValue === value.id ? '#0369a1' : '#475569',
                      maxWidth: '70px'
                    }}>
                      {value.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Value Description */}
              {selectedValue && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  <div style={{ 
                    padding: '16px', 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #f0f9ff, #eff6ff, #eef2ff)',
                    border: '2px solid #bae6fd'
                  }}>
                    <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: '#0369a1' }}>
                        {values.find(v => v.id === selectedValue)?.name}:
                      </span>{' '}
                      {values.find(v => v.id === selectedValue)?.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '0 20px 20px 20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px 0', 
                  borderTop: '2px solid #f1f5f9' 
                }}>
                  <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)' }} />
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', padding: '0 8px' }}>
                    Ser colab é ser lab
                  </p>
                  <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onMouseDown={handleFabMouseDown}
          onTouchStart={handleFabTouchStart}
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            boxShadow: isOpen ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(59, 130, 246, 0.5)',
            transition: isDragging ? 'none' : 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            background: isOpen ? 'white' : 'linear-gradient(135deg, #0ea5e9, #4f46e5)',
            border: isOpen ? '2px solid #cbd5e1' : 'none'
          }}
        >
          {/* Pulse animation when closed */}
          {!isOpen && (
            <div 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                borderRadius: '16px', 
                backgroundColor: '#38bdf8', 
                opacity: 0.3 
              }} 
              className="animate-ping" 
            />
          )}
          
          {/* Icon */}
          <span style={{ 
            position: 'relative', 
            zIndex: 10, 
            transition: 'all 0.3s',
            transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'rotate(0) scale(1)'
          }}>
            {isOpen ? (
              <X style={{ width: '28px', height: '28px', color: '#334155' }} strokeWidth={3} />
            ) : (
              <HandHeart style={{ width: '28px', height: '28px', color: 'white' }} strokeWidth={2.5} />
            )}
          </span>
        </button>
      </div>
    </>
  );
}
