'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/spinner';

export default function CustomerPortalPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const redirectToPortal = async () => {
            try {
                // For client components, we don't need to check auth state
                // The API will handle auth checks for us and return appropriate errors

                // Use the API route we already have instead of duplicating logic
                const response = await fetch('/api/stripe/customer-portal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create portal session');
                }

                // Get the Stripe portal URL and redirect to it
                const { url } = await response.json();
                window.location.href = url; // Direct browser redirect
            } catch (error) {
                console.error('Error redirecting to customer portal:', error);
                setError('Failed to access the customer portal. Redirecting to account page...');

                // Redirect back to account page after a short delay
                setTimeout(() => {
                    const locale = window.location.pathname.split('/')[1] || 'en-US';
                    router.push(`/${locale}/account?error=portal-failed`);
                }, 2000);
            }
        };

        redirectToPortal();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to Customer Portal</h1>
                {error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <div className="flex flex-col items-center">
                        <Spinner />
                        <p className='mt-3'>Please wait while we redirect you to the customer portal...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
