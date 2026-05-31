export type SkeletonRow =
  | { id: string; state: 'skeleton' }
  | {
      id: string;
      state: 'content';
      title: string;
      subtitle: string;
      height: number;
    };

const TITLES = [
  'Dashboard Overview',
  'User Profile',
  'Settings Panel',
  'Analytics Report',
  'Activity Feed',
  'Notification Center',
  'Message List',
  'Task Manager',
  'Calendar View',
  'File Explorer',
  'Search Results',
  'Help Center',
  'Documentation',
  'Support Chat',
  'Account Settings',
  'Privacy Controls',
  'Security Options',
  'Billing Info',
  'Subscription Details',
  'Payment Methods',
  'Invoice History',
  'Usage Stats',
  'API Keys',
  'Webhooks',
  'Integrations',
  'Connected Apps',
  'Team Members',
  'Permissions',
  'Audit Log',
  'Login History',
  'Loading content...',
  'Please wait...',
  'Fetching data...',
  'Almost there...',
  'Processing request...',
  'Retrieving information...',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeSkeletonRows(count: number): SkeletonRow[] {
  const rows: SkeletonRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `skeleton-${i}`,
      state: 'skeleton',
    });
  }
  return rows;
}

export function cycleSkeletonTransitions(
  prev: SkeletonRow[],
  percentage: number,
  seed: number,
): SkeletonRow[] {
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

    if (row.state === 'skeleton') {
      const heightSeed = seed + idx * 200;
      const height = 40 + Math.floor(seededRandom(heightSeed) * 60);
      const titleIndex = Math.floor(seededRandom(heightSeed + 1) * TITLES.length);
      return {
        id: row.id,
        state: 'content',
        title: TITLES[titleIndex],
        subtitle: `Additional details for item ${idx + 1}`,
        height,
      };
    } else {
      return {
        id: row.id,
        state: 'skeleton',
      };
    }
  });
}
