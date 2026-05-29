import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createBooking,
  fetchAvailability,
  type Booking,
  type RoomAvailability,
} from './api';
import { BookingConfirmation } from './BookingConfirmation';
import { addDays, nightsBetween, todayIso } from './dateUtils';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { PriceBreakdownView } from './PriceBreakdownView';
import { RoomCalendar } from './RoomCalendar';
import { RoomGridSkeleton } from './RoomCardSkeleton';
import { SiteLayout } from './SiteLayout';
import './App.css';

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function App() {
  const [checkIn, setCheckIn] = useState(todayIso());
  const [checkOut, setCheckOut] = useState(addDays(todayIso(), 2));
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoForPricing, setPromoForPricing] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const datesValid = nights > 0;
  const availableCount = useMemo(() => rooms.filter((r) => r.available).length, [rooms]);

  const loadAvailability = useCallback(async () => {
    if (!datesValid) {
      setRooms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAvailability(checkIn, checkOut, promoForPricing);
      setRooms(data);
      setCalendarRefresh((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load availability');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, datesValid, promoForPricing]);

  function applyPromoForPricing() {
    setPromoForPricing(promoCode.trim());
  }

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  useEffect(() => {
    if (selectedRoomId && !rooms.some((r) => r.id === selectedRoomId && r.available)) {
      setSelectedRoomId(null);
    }
  }, [rooms, selectedRoomId]);

  function handleCalendarSelectRange(roomId: string, from: string, to: string) {
    setCheckIn(from);
    setCheckOut(to);
    setSelectedRoomId(roomId);
  }

  function handleBookAnother() {
    setConfirmedBooking(null);
    setBookingError(null);
    setGuestName('');
    setSelectedRoomId(null);
    setPromoCode('');
    setPromoForPricing('');
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoomId || !guestName.trim() || !datesValid) return;
    const promo = promoCode.trim();
    if (promo !== promoForPricing) setPromoForPricing(promo);
    setSubmitting(true);
    setBookingError(null);
    try {
      const booking = await createBooking({
        roomId: selectedRoomId,
        guestName: guestName.trim(),
        checkIn,
        checkOut,
        promoCode: promoCode.trim() || undefined,
      });
      setConfirmedBooking(booking);
      setGuestName('');
      setSelectedRoomId(null);
      await loadAvailability();
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  const searchBar = (
    <div className="search-bar container">
      <div className="search-bar-inner">
        <div className="search-fields">
          <label className="field">
            <span className="field-label">Check-in</span>
            <input
              type="date"
              value={checkIn}
              min={todayIso()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  setCheckOut(addDays(e.target.value, 1));
                }
              }}
            />
          </label>
          <span className="date-separator" aria-hidden>
            →
          </span>
          <label className="field">
            <span className="field-label">Check-out</span>
            <input
              type="date"
              value={checkOut}
              min={addDays(checkIn, 1)}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
        </div>
        <div className="search-summary">
          {datesValid ? (
            <>
              <span className="search-nights">
                {nights} night{nights !== 1 ? 's' : ''}
              </span>
              <span className="search-dates">
                {formatDisplayDate(checkIn)} — {formatDisplayDate(checkOut)}
              </span>
              {!loading && rooms.length > 0 && (
                <span className="search-avail">
                  {availableCount} of {rooms.length} rooms available
                </span>
              )}
            </>
          ) : (
            <span className="error-text">Check-out must be after check-in</span>
          )}
        </div>
      </div>
    </div>
  );

  if (confirmedBooking) {
    return (
      <SiteLayout tagline="Your reservation is confirmed" activeNav="guest">
        <BookingConfirmation booking={confirmedBooking} onBookAnother={handleBookAnother} />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout tagline="Browse rooms, check availability, and reserve your stay." activeNav="guest" sticky={searchBar}>
      {error && (
        <div className="banner error" role="alert">
          {error}
        </div>
      )}

      <div className={`booking-layout ${selectedRoom ? 'has-selection' : ''}`}>
        <section className="rooms-section" aria-labelledby="rooms-heading">
          <div className="section-header">
            <h2 id="rooms-heading">Available rooms</h2>
            {loading && (
              <span className="section-status">
                <LoadingSpinner label="Loading availability" />
                Loading…
              </span>
            )}
          </div>

          {!datesValid && (
            <EmptyState
              icon="calendar"
              title="Choose valid dates"
              message="Select a check-out date that comes after your check-in to see room availability."
            />
          )}

          {datesValid && loading && <RoomGridSkeleton />}

          {datesValid && !loading && rooms.length === 0 && !error && (
            <EmptyState
              icon="search"
              title="No rooms found"
              message="We couldn't find any rooms for these dates. Try adjusting your stay dates."
            />
          )}

          {datesValid && !loading && rooms.length > 0 && availableCount === 0 && (
            <EmptyState
              icon="calendar"
              title="Fully booked"
              message="All rooms are booked for your selected dates. Try different dates or use the calendars below to find open nights."
            />
          )}

          {datesValid && !loading && rooms.length > 0 && (
            <div className="rooms-grid">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <article
                    key={room.id}
                    className={`room-card ${!room.available ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="room-photo">
                      <img src={room.photoUrl} alt={room.name} loading="lazy" />
                      <div className="room-photo-overlay" aria-hidden />
                      <span className={`badge type-${room.type}`}>{formatType(room.type)}</span>
                      <span className={`badge avail ${room.available ? 'yes' : 'no'}`}>
                        {room.available ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <div className="room-body">
                      <div className="room-header">
                        <h3>{room.name}</h3>
                        <p className="meta">
                          Up to {room.capacity} guests · ${room.pricePerNight}/night base
                        </p>
                      </div>
                      <div className="room-pricing">
                        <span className="total-label">Total for stay</span>
                        <span className="total">
                          ${formatMoney(room.pricing.total)}
                          {room.pricing.promoCode && (
                            <span className="price-tag promo">Promo</span>
                          )}
                          {!room.pricing.promoCode && room.pricing.adjustments.length > 0 && (
                            <span className="price-tag dynamic">Dynamic</span>
                          )}
                        </span>
                      </div>
                      {room.available && (
                        <button
                          type="button"
                          className={isSelected ? 'btn secondary full-width' : 'btn primary full-width'}
                          onClick={() => setSelectedRoomId(isSelected ? null : room.id)}
                        >
                          {isSelected ? 'Selected for booking' : 'Select room'}
                        </button>
                      )}
                      <RoomCalendar
                        roomId={room.id}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        refreshKey={calendarRefresh}
                        onSelectRange={handleCalendarSelectRange}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {selectedRoom && selectedRoom.available && (
          <aside className="booking-panel" aria-labelledby="booking-heading">
            <div className="booking-panel-inner">
              <h2 id="booking-heading">Complete booking</h2>
              <p className="booking-room-name">{selectedRoom.name}</p>
              <p className="booking-dates">
                {formatDisplayDate(checkIn)} → {formatDisplayDate(checkOut)} · {nights} night
                {nights !== 1 ? 's' : ''}
              </p>

              <PriceBreakdownView pricing={selectedRoom.pricing} />

              <form onSubmit={handleBook} className="booking-form">
                <label className="field promo-field">
                  <span className="field-label">Promo code</span>
                  <div className="promo-row">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onBlur={applyPromoForPricing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyPromoForPricing();
                        }
                      }}
                      placeholder="SUMMER10 or STAY3"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button type="button" className="btn secondary" onClick={applyPromoForPricing}>
                      Apply
                    </button>
                  </div>
                </label>
                <p className="promo-hint">
                  SUMMER10 — 10% off · STAY3 — one free night (3+ nights)
                </p>

                <label className="field">
                  <span className="field-label">Guest name</span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Full name"
                    required
                    autoFocus
                  />
                </label>

                <button type="submit" className="btn primary full-width" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoadingSpinner label="Booking" />
                      Booking…
                    </>
                  ) : (
                    'Confirm reservation'
                  )}
                </button>
              </form>

              {bookingError && (
                <p className="booking-msg error-text" role="alert">
                  {bookingError}
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </SiteLayout>
  );
}
