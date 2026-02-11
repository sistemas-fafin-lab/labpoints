import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

// Easing functions
const easings = {
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
};

export function useCountUp({
  start = 0,
  end,
  duration = 800,
  delay = 0,
  easing = easings.easeOutQuart,
}: UseCountUpOptions): number {
  const [count, setCount] = useState(start);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Don't animate if end is 0 or same as start
    if (end === 0 || end === start) {
      setCount(end);
      return;
    }

    // Reset for new end value
    hasStartedRef.current = false;
    setCount(start);

    const startAnimation = () => {
      hasStartedRef.current = true;
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        const currentValue = Math.round(start + (end - start) * easedProgress);
        setCount(currentValue);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    // Start with delay if specified
    const timeoutId = delay > 0 
      ? setTimeout(startAnimation, delay) 
      : (startAnimation(), undefined);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, start, duration, delay, easing]);

  return count;
}

// Export easings for custom use
export { easings };
