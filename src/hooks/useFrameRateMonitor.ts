import { useEffect, useRef, useState } from "react";

interface FrameRateStats {
  fps: number;
  dropsPerMinute: number;
  isDropping: boolean;
}

export function useFrameRateMonitor(enabled: boolean) {
  const [stats, setStats] = useState<FrameRateStats>({
    fps: 60,
    dropsPerMinute: 0,
    isDropping: false,
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef<number>(performance.now());
  const dropCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let animationId: number;

    const measureFrame = (time: number) => {
      frameCountRef.current++;
      const delta = time - lastTimeRef.current;

      // Detect frame drop (more than 2 frames at 60fps = ~33.3ms)
      if (delta > 33.3 * 2) {
        dropCountRef.current++;
      }

      lastTimeRef.current = time;
      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);

    // Calculate stats every second
    intervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - lastTimeRef.current) / 1000;
      const fps = elapsed > 0 ? Math.round(frameCountRef.current / elapsed) : 60;
      const dropsPerMinute = Math.round((dropCountRef.current / elapsed) * 60);
      const isDropping = dropCountRef.current > 5; // 5+ drops in sampling period

      setStats({ fps, dropsPerMinute, isDropping });

      // Reset counters
      frameCountRef.current = 0;
      dropCountRef.current = 0;
      lastTimeRef.current = performance.now();
    }, 1000);

    return () => {
      cancelAnimationFrame(animationId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  return stats;
}
