export type ListItemStateRow = {
  id: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  isDisabled: boolean;
  hasUnread: boolean;
  isHighlighted: boolean;
  isLoading: boolean;
  isNew: boolean;
};

const TITLES = [
  'Project Proposal',
  'Budget Review',
  'Team Meeting',
  'Client Feedback',
  'Design Mockups',
  'API Documentation',
  'Testing Plan',
  'Deployment Guide',
  'User Research',
  'Competitor Analysis',
  'Market Strategy',
  'Sales Report',
  'Inventory Check',
  'Quality Assurance',
  'Performance Metrics',
  'Security Audit',
  'Compliance Review',
  'Risk Assessment',
  'Resource Allocation',
  'Timeline Update',
  'Milestone Review',
  'Stakeholder Update',
  'Issue Tracker',
  'Bug Report',
  'Feature Request',
  'Change Request',
  'Incident Report',
  'Post-Mortem',
  'Retrospective',
  'Action Items',
  'Decision Log',
  'Knowledge Base',
  'Training Material',
  'Onboarding Guide',
  'Policy Document',
  'Process Update',
  'Sprint Planning',
  'Daily Standup',
  'Backlog Refinement',
  'Release Notes',
  'Version Control',
  'Code Review',
  'CI/CD Pipeline',
  'Database Schema',
  'API Endpoint',
  'Webhook Config',
  'Auth Flow',
  'Permission Matrix',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeListItemStatesRows(count: number): ListItemStateRow[] {
  const rows: ListItemStateRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 65432;
    rows.push({
      id: `list-${i}`,
      title: TITLES[i % TITLES.length],
      subtitle: `Last updated ${Math.abs(Math.floor(seededRandom(seed) * 30))} days ago`,
      isSelected: seededRandom(seed) > 0.85,
      isDisabled: seededRandom(seed + 1) > 0.9,
      hasUnread: seededRandom(seed + 2) > 0.7,
      isHighlighted: seededRandom(seed + 3) > 0.88,
      isLoading: seededRandom(seed + 4) > 0.92,
      isNew: seededRandom(seed + 5) > 0.8,
    });
  }
  return rows;
}

export function toggleListItemStates(
  prev: ListItemStateRow[],
  percentage: number,
  seed: number,
): ListItemStateRow[] {
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
      isSelected: seededRandom(toggleSeed) > 0.5,
      isDisabled: seededRandom(toggleSeed + 1) > 0.5,
      hasUnread: seededRandom(toggleSeed + 2) > 0.5,
      isHighlighted: seededRandom(toggleSeed + 3) > 0.5,
      isLoading: seededRandom(toggleSeed + 4) > 0.5,
      isNew: seededRandom(toggleSeed + 5) > 0.5,
    };
  });
}
