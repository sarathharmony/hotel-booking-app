interface EmptyStateProps {
  title: string;
  message: string;
  icon?: 'rooms' | 'calendar' | 'search';
}

export function EmptyState({ title, message, icon = 'rooms' }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden>
        {icon === 'rooms' && '🛏'}
        {icon === 'calendar' && '📅'}
        {icon === 'search' && '🔍'}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
