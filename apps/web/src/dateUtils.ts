export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function monthFromDate(iso: string): string {
  return iso.slice(0, 7);
}

export function parseMonth(month: string): { year: number; monthIndex: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

export function monthLabel(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  const d = new Date(Date.UTC(parsed.year, parsed.monthIndex, 1));
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function shiftMonth(month: string, delta: number): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  const d = new Date(Date.UTC(parsed.year, parsed.monthIndex + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function calendarCells(month: string): (string | null)[] {
  const parsed = parseMonth(month);
  if (!parsed) return [];

  const { year, monthIndex } = parsed;
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(Date.UTC(year, monthIndex, day));
    cells.push(d.toISOString().slice(0, 10));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function isDateInRange(date: string, from: string, to: string): boolean {
  return date >= from && date < to;
}
