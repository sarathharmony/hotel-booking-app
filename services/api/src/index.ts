import cors from 'cors';
import express from 'express';
import { buildAdminDashboard } from './admin.js';
import { buildRoomCalendar } from './calendar.js';
import { normalizePromoCode, PromoValidationError } from './promo.js';
import { calculatePrice } from './pricing.js';
import {
  bookings,
  cancelBooking,
  createBooking,
  findBookingByReference,
  findRoom,
  isRoomAvailable,
  rooms,
} from './store.js';
import { isBookingReference } from './reference.js';
import type { BookingDetail, RoomAvailability } from './types.js';

const PORT = Number(process.env.PORT) || 4100;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', rooms: rooms.length, bookings: bookings.length });
});

app.get('/api/admin/dashboard', (_req, res) => {
  res.json(buildAdminDashboard());
});

app.get('/api/rooms', (_req, res) => {
  res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json(room);
});

app.get('/api/rooms/:id/calendar', (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const monthRaw = req.query.month;
  if (typeof monthRaw !== 'string' || !monthRaw) {
    res.status(400).json({ error: 'Query param month is required (YYYY-MM)' });
    return;
  }

  const days = buildRoomCalendar(room.id, monthRaw);
  if (!days) {
    res.status(400).json({ error: 'Invalid month format (use YYYY-MM)' });
    return;
  }

  res.json({
    roomId: room.id,
    month: monthRaw,
    days,
  });
});

function resolvePromoQuery(
  raw: unknown,
): { promo?: string; error?: string } {
  if (raw == null || raw === '') return {};
  if (typeof raw !== 'string') {
    return { error: 'promo must be a string' };
  }
  const promo = normalizePromoCode(raw);
  return promo ? { promo } : {};
}

app.get('/api/availability', (req, res) => {
  const { from, to, promo: promoRaw } = req.query;
  if (typeof from !== 'string' || typeof to !== 'string' || !from || !to) {
    res.status(400).json({ error: 'Query params from and to are required (YYYY-MM-DD)' });
    return;
  }
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }
  if (toDate <= fromDate) {
    res.status(400).json({ error: 'to must be after from' });
    return;
  }

  const promoResolved = resolvePromoQuery(promoRaw);
  if (promoResolved.error) {
    res.status(400).json({ error: promoResolved.error });
    return;
  }

  try {
    const result: RoomAvailability[] = rooms.map((room) => ({
      ...room,
      available: isRoomAvailable(room.id, from, to),
      pricing: calculatePrice(room, from, to, promoResolved.promo),
    }));
    res.json(result);
  } catch (e) {
    if (e instanceof PromoValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    throw e;
  }
});

app.post('/api/bookings', (req, res) => {
  const { roomId, guestName, checkIn, checkOut, promoCode: promoRaw } = req.body ?? {};
  if (!roomId || !guestName || !checkIn || !checkOut) {
    res.status(400).json({ error: 'roomId, guestName, checkIn, and checkOut are required' });
    return;
  }
  if (typeof guestName !== 'string' || guestName.trim().length === 0) {
    res.status(400).json({ error: 'guestName must be a non-empty string' });
    return;
  }
  const room = findRoom(roomId);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ error: 'checkOut must be after checkIn' });
    return;
  }
  if (!isRoomAvailable(roomId, checkIn, checkOut)) {
    res.status(409).json({ error: 'Room is not available for the selected dates' });
    return;
  }

  const promoCode = normalizePromoCode(
    typeof promoRaw === 'string' ? promoRaw : undefined,
  );

  let pricing;
  try {
    pricing = calculatePrice(room, checkIn, checkOut, promoCode);
  } catch (e) {
    if (e instanceof PromoValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    throw e;
  }

  const booking = createBooking(
    roomId,
    guestName.trim(),
    checkIn,
    checkOut,
    pricing,
  );
  const response: BookingDetail = {
    ...booking,
    room,
  };
  res.status(201).json(response);
});

app.get('/api/bookings/:reference', (req, res) => {
  const reference = req.params.reference.toUpperCase();
  if (!isBookingReference(reference)) {
    res.status(400).json({ error: 'Invalid booking reference (expected format HBK-XXXX)' });
    return;
  }

  const booking = findBookingByReference(reference);
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  const room = findRoom(booking.roomId);
  if (!room) {
    res.status(500).json({ error: 'Room data missing for booking' });
    return;
  }

  const response: BookingDetail = { ...booking, room };
  res.json(response);
});

app.delete('/api/bookings/:id', (req, res) => {
  const removed = cancelBooking(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Hotel booking API listening on http://localhost:${PORT}`);
});
