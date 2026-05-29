import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRoomCalendar, type CalendarDay } from './api';
import {
  addDays,
  calendarCells,
  isDateInRange,
  monthFromDate,
  monthLabel,
  shiftMonth,
  todayIso,
} from './dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RoomCalendarProps {
  roomId: string;
  checkIn: string;
  checkOut: string;
  refreshKey?: number;
  onSelectRange: (roomId: string, checkIn: string, checkOut: string) => void;
}

export function RoomCalendar({
  roomId,
  checkIn,
  checkOut,
  refreshKey = 0,
  onSelectRange,
}: RoomCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => monthFromDate(checkIn));
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);

  const today = todayIso();
  const bookedSet = useMemo(() => new Set(days.filter((d) => d.booked).map((d) => d.date)), [days]);
  const cells = useMemo(() => calendarCells(viewMonth), [viewMonth]);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoomCalendar(roomId, viewMonth);
      setDays(data.days);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [roomId, viewMonth]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar, refreshKey]);

  useEffect(() => {
    setViewMonth(monthFromDate(checkIn));
  }, [checkIn]);

  function isSelectable(date: string): boolean {
    return date >= today && !bookedSet.has(date);
  }

  function rangeHasBooked(from: string, to: string): boolean {
    let cursor = from;
    while (cursor < to) {
      if (bookedSet.has(cursor)) return true;
      cursor = addDays(cursor, 1);
    }
    return false;
  }

  function handleDayClick(date: string) {
    if (!isSelectable(date)) return;

    if (!anchorDate) {
      setAnchorDate(date);
      onSelectRange(roomId, date, addDays(date, 1));
      return;
    }

    if (date === anchorDate) {
      setAnchorDate(null);
      return;
    }

    let from = anchorDate;
    let to = date;
    if (to < from) {
      [from, to] = [to, from];
    }

    const checkOutDate = addDays(to, 1);
    if (from === to) {
      onSelectRange(roomId, from, checkOutDate);
      setAnchorDate(null);
      return;
    }

    if (rangeHasBooked(from, checkOutDate)) {
      setAnchorDate(date);
      onSelectRange(roomId, date, addDays(date, 1));
      return;
    }

    onSelectRange(roomId, from, checkOutDate);
    setAnchorDate(null);
  }

  return (
    <div className="room-calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          aria-label="Previous month"
          onClick={() => setViewMonth((m) => shiftMonth(m, -1))}
        >
          ‹
        </button>
        <span className="calendar-title">{monthLabel(viewMonth)}</span>
        <button
          type="button"
          className="calendar-nav"
          aria-label="Next month"
          onClick={() => setViewMonth((m) => shiftMonth(m, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar-weekday">
            {day}
          </span>
        ))}
      </div>

      {loading && <p className="calendar-status">Loading…</p>}
      {error && <p className="calendar-status error-text">{error}</p>}

      {!loading && !error && (
        <div className="calendar-grid" role="grid" aria-label="Room availability">
          {cells.map((date, index) => {
            if (!date) {
              return <span key={`empty-${index}`} className="calendar-cell empty" />;
            }

            const booked = bookedSet.has(date);
            const past = date < today;
            const inRange = isDateInRange(date, checkIn, checkOut);
            const isStart = date === checkIn;
            const isEnd = date === addDays(checkOut, -1);
            const isAnchor = date === anchorDate;
            const selectable = isSelectable(date);

            let state: 'free' | 'booked' | 'past' = 'free';
            if (past) state = 'past';
            else if (booked) state = 'booked';

            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                disabled={!selectable}
                className={[
                  'calendar-cell',
                  state,
                  inRange ? 'in-range' : '',
                  isStart ? 'range-start' : '',
                  isEnd ? 'range-end' : '',
                  isAnchor ? 'anchor' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleDayClick(date)}
                title={
                  past
                    ? 'Past date'
                    : booked
                      ? 'Booked'
                      : `Available — ${date}`
                }
              >
                <span className="calendar-day-num">{Number(date.slice(8, 10))}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-swatch free" /> Free
        </span>
        <span className="legend-item">
          <span className="legend-swatch booked" /> Booked
        </span>
        <span className="legend-item">
          <span className="legend-swatch selected" /> Selected
        </span>
      </div>
      <p className="calendar-hint">Click a check-in date, then a check-out date.</p>
    </div>
  );
}
