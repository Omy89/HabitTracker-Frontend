import type { StreakUnit } from '@/lib/types';

export function formatCount(count: number, unit: StreakUnit): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}
