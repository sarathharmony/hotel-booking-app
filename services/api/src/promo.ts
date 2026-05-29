import { roundMoney } from './money.js';
import type { PriceBreakdown } from './types.js';

export const PROMO_CODES = ['SUMMER10', 'STAY3'] as const;
export type PromoCode = (typeof PROMO_CODES)[number];

export function normalizePromoCode(
  code: string | undefined | null,
): string | undefined {
  if (code == null || typeof code !== 'string') return undefined;
  const trimmed = code.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isKnownPromoCode(code: string): code is PromoCode {
  return (PROMO_CODES as readonly string[]).includes(code);
}

export class PromoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromoValidationError';
  }
}

export function validatePromoForStay(
  promoCode: string | undefined,
  nights: number,
): void {
  if (!promoCode) return;
  if (!isKnownPromoCode(promoCode)) {
    throw new PromoValidationError(`Invalid promo code: ${promoCode}`);
  }
  if (promoCode === 'STAY3' && nights < 3) {
    throw new PromoValidationError(
      'Promo STAY3 requires a stay of 3 or more nights',
    );
  }
}

export function applyPromoToBreakdown(
  breakdown: PriceBreakdown,
  promoCode: string | undefined,
): PriceBreakdown {
  if (!promoCode) return breakdown;

  validatePromoForStay(promoCode, breakdown.nights);

  const adjustments = [...breakdown.adjustments];
  let total = breakdown.total;

  if (promoCode === 'STAY3') {
    const freeNight = roundMoney(total / breakdown.nights);
    adjustments.push({
      label: 'Promo STAY3 (1 free night)',
      amount: -freeNight,
    });
    total -= freeNight;
  } else if (promoCode === 'SUMMER10') {
    const discount = roundMoney(total * 0.1);
    adjustments.push({
      label: 'Promo SUMMER10 (-10%)',
      amount: -discount,
    });
    total -= discount;
  }

  return {
    ...breakdown,
    adjustments,
    total: roundMoney(Math.max(0, total)),
    promoCode,
  };
}
