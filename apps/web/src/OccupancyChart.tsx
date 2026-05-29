import type { TypeOccupancy } from './api';

const TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
};

const BAR_COLORS: Record<string, string> = {
  standard: '#5b8fd4',
  deluxe: '#c9a227',
  suite: '#9b6ed4',
};

interface OccupancyChartProps {
  data: TypeOccupancy[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const width = 360;
  const height = 220;
  const padding = { top: 24, right: 16, bottom: 48, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 24;
  const barWidth = (chartW - barGap * (data.length - 1)) / Math.max(data.length, 1);
  const maxY = 100;

  return (
    <svg
      className="occupancy-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Occupancy by room type for the next 30 days"
    >
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padding.top + chartH - (tick / maxY) * chartH;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="var(--border)"
              strokeDasharray={tick === 0 ? undefined : '4 4'}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize="11"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {data.map((row, i) => {
        const x = padding.left + i * (barWidth + barGap);
        const barH = (row.occupancyPercent / maxY) * chartH;
        const y = padding.top + chartH - barH;
        const color = BAR_COLORS[row.type] ?? '#888';

        return (
          <g key={row.type}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, row.occupancyPercent > 0 ? 2 : 0)}
              rx={4}
              fill={color}
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fill="var(--text)"
              fontSize="12"
              fontWeight="600"
            >
              {row.occupancyPercent}%
            </text>
            <text
              x={x + barWidth / 2}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="12"
            >
              {TYPE_LABELS[row.type] ?? row.type}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
