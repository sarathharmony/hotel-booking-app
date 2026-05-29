import { isRoomAvailable } from './store.js';

export interface CalendarDay {
  date: string;
  booked: boolean;
}

function parseMonth(month: string): { year: number; monthIndex: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

function isoDate(year: number, monthIndex: number, day: number): string {
  const d = new Date(Date.UTC(year, monthIndex, day));
  return d.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isNightBooked(roomId: string, date: string): boolean {
  return !isRoomAvailable(roomId, date, addDaysIso(date, 1));
}

export function buildRoomCalendar(roomId: string, month: string): CalendarDay[] | null {
  const parsed = parseMonth(month);
  if (!parsed) return null;

  const { year, monthIndex } = parsed;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = isoDate(year, monthIndex, day);
    days.push({
      date,
      booked: isNightBooked(roomId, date),
    });
  }

  return days;
}
