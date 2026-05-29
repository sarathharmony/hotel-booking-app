export type RoomType = 'standard' | 'deluxe' | 'suite';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  photoUrl: string;
}

export interface Booking {
  id: string;
  reference: string;
  roomId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  pricing: PriceBreakdown;
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

export interface BookingDetail extends Booking {
  room: Room;
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
