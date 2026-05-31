import { useEffect, useState } from 'react';

type Status = 'off' | 'connecting' | 'live' | 'error';

/**
 * Optional public Binance ticker stream; falls back silently on failure.
 */
export function useBinanceBtcTicker(enabled: boolean) {
  const [status, setStatus] = useState<Status>('off');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('off');
      setBtcPrice(null);
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

    ws.onopen = () => {
      setStatus('live');
    };

    ws.onmessage = (ev) => {
      try {
        const j = JSON.parse(String(ev.data)) as { c?: string };
        const p = parseFloat(j.c ?? '');
        if (!Number.isNaN(p)) setBtcPrice(p);
      } catch {
        /* ignore malformed */
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus((s) => (s === 'live' ? 'error' : s));
    };

    return () => {
      ws.close();
    };
  }, [enabled]);

  return { status, btcPrice };
}
