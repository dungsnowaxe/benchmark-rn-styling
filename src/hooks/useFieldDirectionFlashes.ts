import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { FLASH_ANIMATION_MS } from "../constants/flashAnimation";
import type { LiveRow } from "../data/liveRows";

export type Direction = "up" | "down";

/**
 * Tracks previous price / changePct per row and exposes short-lived directional
 * flash state when a value strictly increases or decreases vs the last render.
 */
export function useFieldDirectionFlashes(item: LiveRow) {
  const prev = useRef<{
    id?: string;
    price?: number;
    changePct?: number;
  }>({});

  const [priceDir, setPriceDir] = useState<Direction | null>(null);
  const [changeDir, setChangeDir] = useState<Direction | null>(null);
  const [priceFlashGen, setPriceFlashGen] = useState(0);
  const [changeFlashGen, setChangeFlashGen] = useState(0);

  useLayoutEffect(() => {
    const pr = prev.current;
    if (pr.id !== undefined && pr.id !== item.id) {
      prev.current = {
        id: item.id,
        price: item.price,
        changePct: item.changePct,
      };
      setPriceDir(null);
      setChangeDir(null);
      return;
    }

    if (pr.price !== undefined) {
      if (item.price > pr.price) {
        setPriceDir("up");
        setPriceFlashGen((g) => g + 1);
      } else if (item.price < pr.price) {
        setPriceDir("down");
        setPriceFlashGen((g) => g + 1);
      }
    }
    if (pr.changePct !== undefined) {
      if (item.changePct > pr.changePct) {
        setChangeDir("up");
        setChangeFlashGen((g) => g + 1);
      } else if (item.changePct < pr.changePct) {
        setChangeDir("down");
        setChangeFlashGen((g) => g + 1);
      }
    }

    prev.current = {
      id: item.id,
      price: item.price,
      changePct: item.changePct,
    };
  }, [item.id, item.price, item.changePct]);

  useEffect(() => {
    if (priceDir === null) return;
    const t = setTimeout(() => setPriceDir(null), FLASH_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [priceDir, priceFlashGen]);

  useEffect(() => {
    if (changeDir === null) return;
    const t = setTimeout(() => setChangeDir(null), FLASH_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [changeDir, changeFlashGen]);

  return {
    priceDir,
    changeDir,
    priceFlashGen,
    changeFlashGen,
  };
}
