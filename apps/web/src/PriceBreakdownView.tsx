import type { PriceBreakdown } from './api';

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function PriceBreakdownView({ pricing }: { pricing: PriceBreakdown }) {
  return (
    <div className="price-breakdown">
      <div className="price-line">
        <span>Base ({pricing.nights} night{pricing.nights !== 1 ? 's' : ''})</span>
        <span>${formatMoney(pricing.base)}</span>
      </div>
      {pricing.adjustments.map((adj) => (
        <div
          key={adj.label}
          className={`price-line ${adj.amount < 0 ? 'discount' : 'surcharge'}`}
        >
          <span>{adj.label}</span>
          <span>
            {adj.amount < 0 ? '−' : '+'}${formatMoney(Math.abs(adj.amount))}
          </span>
        </div>
      ))}
      <div className="price-line total-line">
        <span>Total</span>
        <span>${formatMoney(pricing.total)}</span>
      </div>
    </div>
  );
}
