import type { StreakUnit } from '@/lib/types';

/** "1 day", "3 days", "2 weeks"... */
export function formatCount(count: number, unit: StreakUnit): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}
