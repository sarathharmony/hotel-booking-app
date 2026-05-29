import { useEffect, useState } from 'react';
import { fetchAdminDashboard, type AdminDashboard } from './api';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import { OccupancyChart } from './OccupancyChart';
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

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminDashboard();
        if (!cancelled) setDashboard(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteLayout tagline="Admin occupancy dashboard" activeNav="admin">
      <div className="admin-main">
        {loading && (
          <div className="status-panel">
            <LoadingSpinner label="Loading dashboard" />
            <p>Loading dashboard…</p>
          </div>
        )}

        {error && (
          <div className="banner error" role="alert">
            {error}
          </div>
        )}

        {dashboard && !loading && (
          <>
            <section className="admin-summary">
              <div className="stat-card">
                <span className="stat-label">Forecast period</span>
                <span className="stat-value stat-value-sm">
                  {dashboard.periodFrom} → {dashboard.periodTo}
                </span>
                <span className="stat-hint">Next 30 days</span>
              </div>
              <div className="stat-card stat-card-highlight">
                <span className="stat-label">Projected revenue</span>
                <span className="stat-value">${formatMoney(dashboard.projectedRevenue)}</span>
                <span className="stat-hint">
                  {dashboard.upcomingCheckIns.length} upcoming check-in
                  {dashboard.upcomingCheckIns.length !== 1 ? 's' : ''}
                </span>
              </div>
            </section>

            <section className="admin-panel">
              <h2>Occupancy by room type</h2>
              <p className="panel-desc">
                Average nightly occupancy across all rooms of each type for the next 30 days.
              </p>
              <OccupancyChart data={dashboard.occupancyByType} />
              <ul className="occupancy-legend">
                {dashboard.occupancyByType.map((row) => (
                  <li key={row.type}>
                    <strong>{formatType(row.type)}</strong> — {row.occupancyPercent}% (
                    {row.bookedRoomNights} / {row.totalRoomNights} room-nights)
                  </li>
                ))}
              </ul>
            </section>

            <section className="admin-panel">
              <h2>Upcoming check-ins</h2>
              {dashboard.upcomingCheckIns.length === 0 ? (
                <EmptyState
                  icon="calendar"
                  title="No upcoming check-ins"
                  message="No check-ins are scheduled in the next 30 days. Bookings will appear here once guests reserve rooms."
                />
              ) : (
                <div className="checkins-table-wrap">
                  <table className="checkins-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th className="num">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.upcomingCheckIns.map((row) => (
                        <tr key={row.reference}>
                          <td>
                            <code className="ref-code">{row.reference}</code>
                          </td>
                          <td>{row.guestName}</td>
                          <td>
                            {row.roomName}
                            <span className={`room-type-pill type-${row.roomType}`}>
                              {formatType(row.roomType)}
                            </span>
                          </td>
                          <td>{row.checkIn}</td>
                          <td>{row.checkOut}</td>
                          <td className="num">${formatMoney(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
