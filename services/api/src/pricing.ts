import { roundMoney } from './money.js';
import { applyPromoToBreakdown } from './promo.js';
import { rooms, isRoomAvailable } from './store.js';
import type { PriceBreakdown, Room, RoomType } from './types.js';

const OCCUPANCY_SURGE_THRESHOLD = 0.7;
const OCCUPANCY_SURGE_RATE = 0.25;
const WEEKEND_SURGE_RATE = 0.2;
const LENGTH_OF_STAY_NIGHTS = 7;
const LENGTH_OF_STAY_DISCOUNT = 0.1;

function enumerateNights(checkIn: string, checkOut: string): Date[] {
  const nights: Date[] = [];
  const cur = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  while (cur < end) {
    nights.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return nights;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6;
}

export function getTypeOccupancy(
  roomType: RoomType,
  checkIn: string,
  checkOut: string,
): number {
  const typeRooms = rooms.filter((r) => r.type === roomType);
  if (typeRooms.length === 0) return 0;
  const booked = typeRooms.filter(
    (r) => !isRoomAvailable(r.id, checkIn, checkOut),
  ).length;
  return booked / typeRooms.length;
}

export function calculatePrice(
  room: Room,
  checkIn: string,
  checkOut: string,
  promoCode?: string,
): PriceBreakdown {
  const nightDates = enumerateNights(checkIn, checkOut);
  const nights = nightDates.length;

  let base = 0;
  let weekendAmount = 0;

  for (const date of nightDates) {
    base += room.pricePerNight;
    if (isWeekend(date)) {
      weekendAmount += room.pricePerNight * WEEKEND_SURGE_RATE;
    }
  }

  const adjustments: PriceBreakdown['adjustments'] = [];
  let subtotal = base;

  if (getTypeOccupancy(room.type, checkIn, checkOut) > OCCUPANCY_SURGE_THRESHOLD) {
    const surge = roundMoney(base * OCCUPANCY_SURGE_RATE);
    adjustments.push({ label: 'High demand (+25%)', amount: surge });
    subtotal += surge;
  }

  if (weekendAmount > 0) {
    const weekend = roundMoney(weekendAmount);
    adjustments.push({ label: 'Weekend nights (+20%)', amount: weekend });
    subtotal += weekend;
  }

  if (nights >= LENGTH_OF_STAY_NIGHTS) {
    const discount = roundMoney(subtotal * LENGTH_OF_STAY_DISCOUNT);
    adjustments.push({
      label: 'Length of stay (7+ nights, -10%)',
      amount: -discount,
    });
    subtotal -= discount;
  }

  const breakdown: PriceBreakdown = {
    base: roundMoney(base),
    adjustments,
    total: roundMoney(subtotal),
    nights,
  };

  return applyPromoToBreakdown(breakdown, promoCode);
}
