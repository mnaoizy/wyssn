import { Stripe } from 'stripe';

if (!process.env.STRIPE_SECRET_API_KEY) {
    throw new Error('Missing STRIPE_SECRET_API_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
});
