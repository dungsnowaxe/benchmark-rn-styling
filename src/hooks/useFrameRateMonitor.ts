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
  const samplingStartRef = useRef(performance.now());
  const lastFrameTimeRef = useRef(0);
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

      // Detect frame drop on 2nd+ frames (skip first where lastFrameTime is 0)
      if (lastFrameTimeRef.current > 0) {
        const delta = time - lastFrameTimeRef.current;
        // A frame drop = gap > 2 frames at 60fps (~33.3ms)
        if (delta > 33.3 * 2) {
          dropCountRef.current++;
        }
      }

      lastFrameTimeRef.current = time;
      animationId = requestAnimationFrame(measureFrame);
    };

    // Start measuring
    samplingStartRef.current = performance.now();
    lastFrameTimeRef.current = 0;
    frameCountRef.current = 0;
    dropCountRef.current = 0;
    animationId = requestAnimationFrame(measureFrame);

    // Calculate stats every second
    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - samplingStartRef.current) / 1000;
      const fps = elapsed > 0 ? Math.round(frameCountRef.current / elapsed) : 60;
      const dropsPerMinute = elapsed > 0 ? Math.round((dropCountRef.current / elapsed) * 60) : 0;
      const isDropping = dropCountRef.current > 5;

      setStats({ fps, dropsPerMinute, isDropping });

      // Reset counters for next sampling period
      frameCountRef.current = 0;
      dropCountRef.current = 0;
      samplingStartRef.current = now;
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
