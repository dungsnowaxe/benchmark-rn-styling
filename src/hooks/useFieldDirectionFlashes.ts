import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FLASH_ANIMATION_MS } from '../constants/flashAnimation';
import type { LiveRow } from '../data/liveRows';

export type Direction = 'up' | 'down';

type FlashState = {
  priceDir: Direction | null;
  changeDir: Direction | null;
  priceFlashGen: number;
  changeFlashGen: number;
};

const INITIAL: FlashState = {
  priceDir: null,
  changeDir: null,
  priceFlashGen: 0,
  changeFlashGen: 0,
};

/**
 * Tracks previous price / changePct per row and exposes short-lived directional
 * flash state when a value strictly increases or decreases vs the last render.
 *
 * Batches all direction + gen updates into a single setState call per tick
 * to reduce React reconciliation overhead.
 */
export function useFieldDirectionFlashes(item: LiveRow) {
  const prev = useRef<{
    id?: string;
    price?: number;
    changePct?: number;
  }>({});

  const [flash, setFlash] = useState<FlashState>(INITIAL);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClearRef = useRef(false);

  useLayoutEffect(() => {
    const pr = prev.current;
    if (pr.id !== undefined && pr.id !== item.id) {
      prev.current = {
        id: item.id,
        price: item.price,
        changePct: item.changePct,
      };
      setFlash(INITIAL);
      return;
    }

    // Compute all changes in one pass, then batch into a single setState
    let priceDir: Direction | null = null;
    let changeDir: Direction | null = null;
    let priceFlashGen = 0;
    let changeFlashGen = 0;

    if (pr.price !== undefined) {
      if (item.price > pr.price) {
        priceDir = 'up';
        priceFlashGen = 1;
      } else if (item.price < pr.price) {
        priceDir = 'down';
        priceFlashGen = 1;
      }
    }
    if (pr.changePct !== undefined) {
      if (item.changePct > pr.changePct) {
        changeDir = 'up';
        changeFlashGen = 1;
      } else if (item.changePct < pr.changePct) {
        changeDir = 'down';
        changeFlashGen = 1;
      }
    }

    prev.current = {
      id: item.id,
      price: item.price,
      changePct: item.changePct,
    };

    if (priceDir === null && changeDir === null) return;

    // Single batched setState instead of 2-4 separate ones
    setFlash((curr) => ({
      priceDir,
      changeDir,
      priceFlashGen: curr.priceFlashGen + priceFlashGen,
      changeFlashGen: curr.changeFlashGen + changeFlashGen,
    }));

    // Schedule a single clear instead of two separate timeouts
    pendingClearRef.current = true;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      pendingClearRef.current = false;
      setFlash((curr) => ({
        priceDir: null,
        changeDir: null,
        priceFlashGen: curr.priceFlashGen,
        changeFlashGen: curr.changeFlashGen,
      }));
    }, FLASH_ANIMATION_MS);
  }, [item.id, item.price, item.changePct]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return flash;
}
