import { roundMoney } from './money.js';
import { bookings, findRoom, isRoomAvailable, rooms } from './store.js';
import type { AdminDashboard, RoomType, TypeOccupancy, UpcomingCheckIn } from './types.js';

const ROOM_TYPES: RoomType[] = ['standard', 'deluxe', 'suite'];
const FORECAST_DAYS = 30;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function enumerateDates(from: string, toInclusive: string): string[] {
  const dates: string[] = [];
  let cur = from;
  while (cur <= toInclusive) {
    dates.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return dates;
}

function isNightBooked(roomId: string, date: string): boolean {
  return !isRoomAvailable(roomId, date, addDaysIso(date, 1));
}

function computeOccupancyByType(from: string, to: string): TypeOccupancy[] {
  const dates = enumerateDates(from, to);

  return ROOM_TYPES.map((type) => {
    const typeRooms = rooms.filter((r) => r.type === type);
    const roomCount = typeRooms.length;
    const totalRoomNights = roomCount * dates.length;

    let bookedRoomNights = 0;
    for (const date of dates) {
      for (const room of typeRooms) {
        if (isNightBooked(room.id, date)) bookedRoomNights += 1;
      }
    }

    const occupancyPercent =
      totalRoomNights > 0
        ? roundMoney((bookedRoomNights / totalRoomNights) * 100)
        : 0;

    return {
      type,
      occupancyPercent,
      roomsCount: roomCount,
      bookedRoomNights,
      totalRoomNights,
    };
  });
}

export function buildAdminDashboard(): AdminDashboard {
  const periodFrom = todayIso();
  const periodTo = addDaysIso(periodFrom, FORECAST_DAYS - 1);

  const upcoming = bookings
    .filter((b) => b.checkIn >= periodFrom && b.checkIn <= periodTo)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const upcomingCheckIns: UpcomingCheckIn[] = upcoming.map((b) => {
    const room = findRoom(b.roomId);
    return {
      reference: b.reference,
      guestName: b.guestName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      roomName: room?.name ?? 'Unknown room',
      roomType: room?.type ?? 'standard',
      revenue: b.pricing.total,
    };
  });

  const projectedRevenue = roundMoney(
    upcomingCheckIns.reduce((sum, row) => sum + row.revenue, 0),
  );

  return {
    periodFrom,
    periodTo,
    occupancyByType: computeOccupancyByType(periodFrom, periodTo),
    projectedRevenue,
    upcomingCheckIns,
  };
}
