export function LoadingSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
