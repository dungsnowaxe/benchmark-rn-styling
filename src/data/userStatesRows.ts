export type UserStateRow = {
  id: string;
  username: string;
  avatar: string;
  isPremium: boolean;
  isVerified: boolean;
  isMuted: boolean;
  hasNotification: boolean;
  isNew: boolean;
};

const USERNAMES = [
  'alice_wonder',
  'bob_builder',
  'charlie_dev',
  'diana_designer',
  'evan_engineer',
  'fiona_frontend',
  'george_backend',
  'hannah_hacker',
  'ivan_ui',
  'julia_js',
  'kevin_kernel',
  'luna_ux',
  'mike_mobile',
  'nina_native',
  'oliver_ops',
  'petra_product',
  'quinn_qa',
  'rachel_react',
  'steve_scala',
  'tina_typescript',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeUserStatesRows(count: number): UserStateRow[] {
  const rows: UserStateRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 12345;
    rows.push({
      id: `user-${i}`,
      username: USERNAMES[i % USERNAMES.length],
      avatar: '👤',
      isPremium: seededRandom(seed) > 0.7,
      isVerified: seededRandom(seed + 1) > 0.8,
      isMuted: seededRandom(seed + 2) > 0.9,
      hasNotification: seededRandom(seed + 3) > 0.6,
      isNew: seededRandom(seed + 4) > 0.85,
    });
  }
  return rows;
}

export function toggleUserStates(
  prev: UserStateRow[],
  percentage: number,
  seed: number,
): UserStateRow[] {
  const countToToggle = Math.floor(prev.length * percentage);
  const indicesToToggle: number[] = [];

  for (let i = 0; i < prev.length; i++) {
    const rand = seededRandom(seed + i * 100);
    if (rand < percentage && indicesToToggle.length < countToToggle) {
      indicesToToggle.push(i);
    }
  }

  return prev.map((row, idx) => {
    if (!indicesToToggle.includes(idx)) return row;

    const toggleSeed = seed + idx * 200;
    return {
      ...row,
      isPremium: seededRandom(toggleSeed) > 0.5,
      isVerified: seededRandom(toggleSeed + 1) > 0.5,
      isMuted: seededRandom(toggleSeed + 2) > 0.5,
      hasNotification: seededRandom(toggleSeed + 3) > 0.5,
      isNew: seededRandom(toggleSeed + 4) > 0.5,
    };
  });
}
