// Dates travel as "YYYY-MM-DD" strings in the user's local calendar.

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return parseISODate(iso).toLocaleDateString('en-US', options);
}

export function formatMonth(month: string): string {
  return parseISODate(`${month}-01`).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}
