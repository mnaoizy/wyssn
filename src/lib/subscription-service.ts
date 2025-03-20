/**
 * Client-side service for managing subscriptions
 */

/**
 * Create a checkout session and redirect to Stripe Checkout
 */
export async function createCheckoutSession(): Promise<void> {
    try {
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create checkout session');
        }

        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Failed to create checkout session:', error);
        throw error;
    }
}

/**
 * Create a customer portal session and redirect to Stripe Portal
 * Now uses the dedicated page route instead of the API endpoint
 */
export async function createCustomerPortalSession(): Promise<void> {
    try {
        // Get the current locale from the URL
        const locale = window.location.pathname.split('/')[1] || 'en-US';

        // Redirect to the dedicated customer portal page with proper locale
        // This page handles the Stripe portal session creation
        window.location.href = `/${locale}/customer-portal`;
    } catch (error) {
        console.error('Failed to redirect to customer portal page:', error);
        throw error;
    }
}
