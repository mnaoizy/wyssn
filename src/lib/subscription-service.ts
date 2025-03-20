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
 */
export async function createCustomerPortalSession(): Promise<void> {
    try {
        const response = await fetch('/api/stripe/customer-portal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create customer portal session');
        }

        const { url } = await response.json();
        window.location.href = url;
    } catch (error) {
        console.error('Failed to create customer portal session:', error);
        throw error;
    }
}
