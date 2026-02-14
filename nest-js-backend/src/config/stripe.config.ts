export const STRIPE_PRICES = {
  pro: {
    monthly: process.env['STRIPE_PRICE_PRO_MONTHLY'] ?? 'price_pro_monthly',
    yearly: process.env['STRIPE_PRICE_PRO_YEARLY'] ?? 'price_pro_yearly',
  },
  elite: {
    monthly: process.env['STRIPE_PRICE_ELITE_MONTHLY'] ?? 'price_elite_monthly',
    yearly: process.env['STRIPE_PRICE_ELITE_YEARLY'] ?? 'price_elite_yearly',
  },
} as const;

export type StripeTier = keyof typeof STRIPE_PRICES;
export type StripeInterval = 'monthly' | 'yearly';
