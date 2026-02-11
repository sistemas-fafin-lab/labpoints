import { useState, useRef, useCallback } from 'react';

interface UseHoverDelayOptions {
  delay?: number;
  onTrigger: () => void;
}

export function useHoverDelay({ delay = 3000, onTrigger }: UseHoverDelayOptions) {
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Update progress every 50ms for smooth animation
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / delay) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Trigger action after delay
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setProgress(100);
      onTrigger();
      setIsHovering(false);
      setProgress(0);
    }, delay);
  }, [delay, onTrigger, clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    setIsHovering(false);
    setProgress(0);
  }, [clearTimers]);

  return {
    isHovering,
    progress,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
