export function RoomCardSkeleton() {
  return (
    <article className="room-card skeleton-card" aria-hidden>
      <div className="skeleton skeleton-photo" />
      <div className="room-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-meta" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-btn" />
      </div>
    </article>
  );
}

export function RoomGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="rooms-grid" aria-busy="true" aria-label="Loading rooms">
      {Array.from({ length: count }, (_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}
