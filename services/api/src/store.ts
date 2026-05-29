import { randomUUID } from 'node:crypto';
import { generateBookingReference } from './reference.js';
import type { Booking, PriceBreakdown, Room } from './types.js';

export const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Garden Queen',
    type: 'standard',
    pricePerNight: 129,
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1631049301164-da64af206605?w=800&q=80',
  },
  {
    id: 'room-2',
    name: 'City Twin',
    type: 'standard',
    pricePerNight: 119,
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  },
  {
    id: 'room-3',
    name: 'Harbor King',
    type: 'deluxe',
    pricePerNight: 189,
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  },
  {
    id: 'room-4',
    name: 'Executive Double',
    type: 'deluxe',
    pricePerNight: 209,
    capacity: 3,
    photoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  },
  {
    id: 'room-5',
    name: 'Presidential Suite',
    type: 'suite',
    pricePerNight: 399,
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  },
  {
    id: 'room-6',
    name: 'Ocean Panorama',
    type: 'suite',
    pricePerNight: 449,
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
  },
];

export const bookings: Booking[] = [];

export function findRoom(id: string): Room | undefined {
  return rooms.find((r) => r.id === id);
}

export function rangesOverlap(
  aIn: string,
  aOut: string,
  bIn: string,
  bOut: string,
): boolean {
  const aStart = new Date(aIn).getTime();
  const aEnd = new Date(aOut).getTime();
  const bStart = new Date(bIn).getTime();
  const bEnd = new Date(bOut).getTime();
  return aStart < bEnd && aEnd > bStart;
}

export function isRoomAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string,
): boolean {
  return !bookings.some(
    (b) =>
      b.roomId === roomId &&
      b.id !== excludeBookingId &&
      rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut),
  );
}

export function createBooking(
  roomId: string,
  guestName: string,
  checkIn: string,
  checkOut: string,
  pricing: PriceBreakdown,
): Booking {
  const booking: Booking = {
    id: randomUUID(),
    reference: generateBookingReference(bookings.map((b) => b.reference)),
    roomId,
    guestName,
    checkIn,
    checkOut,
    pricing,
  };
  bookings.push(booking);
  return booking;
}

export function findBookingByReference(reference: string): Booking | undefined {
  return bookings.find((b) => b.reference === reference.toUpperCase());
}

export function cancelBooking(id: string): boolean {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  bookings.splice(index, 1);
  return true;
}
