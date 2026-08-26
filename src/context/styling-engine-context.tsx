import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type StylingEngine = 'stylesheet' | 'unistyles' | 'uniwind';

type StylingEngineContextValue = {
  engine: StylingEngine;
  setEngine: (engine: StylingEngine) => void;
};

const StylingEngineContext = createContext<StylingEngineContextValue | null>(null);

export function StylingEngineProvider({ children }: { children: ReactNode }) {
  const [engine, setEngineState] = useState<StylingEngine>('stylesheet');

  const setEngine = useCallback((next: StylingEngine) => {
    setEngineState(next);
  }, []);

  const value = useMemo(() => ({ engine, setEngine }), [engine, setEngine]);

  return <StylingEngineContext.Provider value={value}>{children}</StylingEngineContext.Provider>;
}

export function useStylingEngine() {
  const ctx = useContext(StylingEngineContext);
  if (!ctx) {
    throw new Error('useStylingEngine must be used within StylingEngineProvider');
  }
  return ctx;
}
