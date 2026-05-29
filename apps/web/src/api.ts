export type RoomType = 'standard' | 'deluxe' | 'suite';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  photoUrl: string;
}

export interface PriceAdjustment {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  base: number;
  adjustments: PriceAdjustment[];
  total: number;
  nights: number;
  promoCode?: string;
}

export interface RoomAvailability extends Room {
  available: boolean;
  pricing: PriceBreakdown;
}

export interface Booking {
  id: string;
  reference: string;
  roomId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  pricing: PriceBreakdown;
  room?: Room;
}

export interface CalendarDay {
  date: string;
  booked: boolean;
}

export interface RoomCalendar {
  roomId: string;
  month: string;
  days: CalendarDay[];
}

export interface TypeOccupancy {
  type: RoomType;
  occupancyPercent: number;
  roomsCount: number;
  bookedRoomNights: number;
  totalRoomNights: number;
}

export interface UpcomingCheckIn {
  reference: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  roomType: RoomType;
  revenue: number;
}

export interface AdminDashboard {
  periodFrom: string;
  periodTo: string;
  occupancyByType: TypeOccupancy[];
  projectedRevenue: number;
  upcomingCheckIns: UpcomingCheckIn[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.error === 'string' ? body.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchRooms(): Promise<Room[]> {
  return request<Room[]>('/api/rooms');
}

export function fetchRoomCalendar(roomId: string, month: string): Promise<RoomCalendar> {
  const params = new URLSearchParams({ month });
  return request<RoomCalendar>(`/api/rooms/${roomId}/calendar?${params}`);
}

export function fetchAvailability(
  from: string,
  to: string,
  promoCode?: string,
): Promise<RoomAvailability[]> {
  const params = new URLSearchParams({ from, to });
  const promo = promoCode?.trim();
  if (promo) params.set('promo', promo);
  return request<RoomAvailability[]>(`/api/availability?${params}`);
}

export function createBooking(payload: {
  roomId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  promoCode?: string;
}): Promise<Booking> {
  return request<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchBookingByReference(reference: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${encodeURIComponent(reference)}`);
}

export function fetchAdminDashboard(): Promise<AdminDashboard> {
  return request<AdminDashboard>('/api/admin/dashboard');
}
