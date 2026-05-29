import type { Booking } from './api';
import { PriceBreakdownView } from './PriceBreakdownView';

interface BookingConfirmationProps {
  booking: Booking;
  onBookAnother: () => void;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BookingConfirmation({ booking, onBookAnother }: BookingConfirmationProps) {
  const roomName = booking.room?.name ?? 'Your room';

  return (
    <section className="confirmation-panel">
      <div className="confirmation-icon" aria-hidden>
        ✓
      </div>
      <h2>Reservation confirmed</h2>
      <p className="confirmation-lead">
        Thanks, {booking.guestName}. We look forward to welcoming you to Harmony Hotel.
      </p>

      <div className="confirmation-reference">
        <span className="confirmation-reference-label">Confirmation reference</span>
        <span className="confirmation-reference-code">{booking.reference}</span>
        <span className="confirmation-reference-hint">Save this reference for your records</span>
      </div>

      <dl className="confirmation-details">
        <div>
          <dt>Room</dt>
          <dd>{roomName}</dd>
        </div>
        <div>
          <dt>Check-in</dt>
          <dd>{formatDisplayDate(booking.checkIn)}</dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>{formatDisplayDate(booking.checkOut)}</dd>
        </div>
        <div>
          <dt>Guest</dt>
          <dd>{booking.guestName}</dd>
        </div>
      </dl>

      <div className="confirmed-pricing">
        <h3>Price breakdown</h3>
        <PriceBreakdownView pricing={booking.pricing} />
      </div>

      <button type="button" className="btn primary full-width" onClick={onBookAnother}>
        Book another room
      </button>
    </section>
  );
}
