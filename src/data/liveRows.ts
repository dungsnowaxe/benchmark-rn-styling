import type { StaticRowVariant } from "./staticRows";

export type LiveRow = {
  id: string;
  symbol: string;
  price: number;
  changePct: number;
  variant: StaticRowVariant;
};

const SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "AVAX",
  "DOT",
  "MATIC",
  "LINK",
  "UNI",
  "ATOM",
  "XRP",
  "ADA",
  "DOGE",
  "LTC",
  "BCH",
  "NEAR",
  "APT",
  "ARB",
  "OP",
  "SUI",
  "INJ",
];

function seedPrice(i: number) {
  return 20 + (i % 7) * 173.42 + (i % 3) * 11.11;
}

export function makeLiveRows(count: number): LiveRow[] {
  const variants: StaticRowVariant[] = ["a", "b", "c"];
  const rows: LiveRow[] = [];
  for (let i = 0; i < count; i++) {
    const sym = SYMBOLS[i % SYMBOLS.length];
    const base = seedPrice(i);
    rows.push({
      id: `l-${i}`,
      symbol: `${sym}/USD`,
      price: base,
      changePct: ((i % 5) - 2) * 0.15,
      variant: variants[i % 3],
    });
  }
  return rows;
}

export function jitterRows(prev: LiveRow[]): LiveRow[] {
  return prev.map((r) => {
    const wiggle = 1 + (Math.random() - 0.5) * 0.004;
    const nextPrice = Math.max(0.01, r.price * wiggle);
    const d = (Math.random() - 0.5) * 0.08;
    return {
      ...r,
      price: nextPrice,
      changePct: r.changePct + d,
    };
  });
}
