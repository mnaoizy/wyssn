"use client";

import React, { useEffect } from "react";
import { SubscriptionPlanCard } from "@/components/ui/subscription-plan-card";
import { createCheckoutSession } from "@/lib/subscription-service";
import { Subscription } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/locale/client";

interface PlansProps {
    userSubscription?: Subscription & { usageCount?: number } | null;
    subscriptionManagementUrl: string | null;
}

interface PriceDetails {
    unitAmount: number | null;
    currency: string;
    interval: string;
    loading: boolean;
    error: boolean;
}

// Free plan features - limited requests
const FREE_PLAN_FEATURES = [
    { title: "All core features included", included: true },
    { title: "Limited to 50 requests per day", included: true },
    { title: "Limited to 500 requests per month", included: true },
    { title: "Standard support", included: true },
];

// Pro plan features - more requests, same features
const PRO_PLAN_FEATURES = [
    { title: "All core features included", included: true },
    { title: "Limited to 500 requests per day", included: true },
    { title: "Limited to 10,000 requests per month", included: true },
    { title: "Priority support", included: true },
];

// Enterprise plan features - for teams
const ENTERPRISE_PLAN_FEATURES = [
    { title: "All core features included", included: true },
    { title: "Custom request limits", included: true },
    { title: "Team management features", included: true },
    { title: "Dedicated support", included: true },
    { title: "Custom billing options", included: true },
];

// Default Stripe price ID - this should be provided from an environment variable in a real app
const STRIPE_PRICE_ID = 'price_1R4hlq03WstOAJXK9oirzXBH';

// Format currency based on locale and currency
function formatCurrency(amount: number | null, currency: string, locale: string): string {
    if (amount === null) return '';

    // Convert from cents to dollars/etc
    const value = amount / 100;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

export function PlansSection({ userSubscription, subscriptionManagementUrl }: PlansProps) {
    const params = useParams();
    const router = useRouter();
    const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale || 'en-US';
    const t = useI18n();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isContactFormOpen, setIsContactFormOpen] = React.useState(false);
    const [priceDetails, setPriceDetails] = React.useState<PriceDetails>({
        unitAmount: null,
        currency: 'jpy',
        interval: 'month',
        loading: true,
        error: false
    });

    const isSubscribed = !!userSubscription &&
        ['active', 'trialing'].includes(userSubscription.status);

    useEffect(() => {
        const fetchPriceDetails = async () => {
            try {
                const response = await fetch(`/api/stripe/price?priceId=${STRIPE_PRICE_ID}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch price details');
                }

                const data = await response.json();

                setPriceDetails({
                    unitAmount: data.unitAmount,
                    currency: data.currency,
                    interval: data.recurring?.interval || 'month',
                    loading: false,
                    error: false
                });
            } catch (error) {
                console.error('Failed to fetch price details:', error);
                setPriceDetails(prev => ({
                    ...prev,
                    loading: false,
                    error: true
                }));
            }
        };

        fetchPriceDetails();
    }, []);

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);
            await createCheckoutSession();
        } catch (error) {
            console.error("Failed to create checkout session:", error);
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        router.push(subscriptionManagementUrl || '/account');
    };

    const handleOpenContactForm = () => {
        // In a real implementation, this would open a contact form or redirect to a contact page
        setIsContactFormOpen(true);
        // For now, we'll just simulate opening a contact form with an alert
        alert("Enterprise plan inquiry: Please contact our sales team at sales@example.com");
        setIsContactFormOpen(false);
    };

    // Format the price with proper currency
    const formattedPrice = formatCurrency(
        priceDetails.unitAmount,
        priceDetails.currency,
        locale
    );

    // Get current usage limits based on plan
    const getCurrentUsageText = () => {
        const usageCount = userSubscription?.usageCount || 0;
        const limit = isSubscribed ? 10000 : 500;
        return t("account.current_usage", {
            count: usageCount,
            limit: limit
        });
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {t("plans.heading")}
                </h3>
                <p className="mt-2 text-muted-foreground">
                    {t("plans.subheading")}
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {/* Free Plan */}
                <SubscriptionPlanCard
                    title={t("plans.free.title")}
                    description={t("plans.free.description")}
                    price="¥0"
                    interval={t("plans.pricing.month")}
                    features={FREE_PLAN_FEATURES}
                    buttonText={!isSubscribed ? t("plans.pricing.current_plan") : t("plans.free.downgrade")}
                    onSelect={isSubscribed ? handleManageSubscription : handleSubscribe}
                    isCurrentPlan={!isSubscribed}
                    disabled={!isSubscribed || isLoading}
                />

                {/* Pro Plan */}
                <SubscriptionPlanCard
                    title={t("plans.pro.title")}
                    description={t("plans.pro.description")}
                    price={priceDetails.loading ? "$--" : (priceDetails.error ? "$--" : formattedPrice)}
                    interval={priceDetails.interval}
                    priceLoading={priceDetails.loading}
                    features={PRO_PLAN_FEATURES}
                    buttonText={isSubscribed ? t("account.manage_subscription_button") : t("plans.pro.subscribe")}
                    onSelect={isSubscribed ? handleManageSubscription : handleSubscribe}
                    isPopular={true}
                    isCurrentPlan={isSubscribed}
                    disabled={isLoading || priceDetails.loading}
                />

                {/* Enterprise Plan */}
                <SubscriptionPlanCard
                    title={t("plans.enterprise.title")}
                    description={t("plans.enterprise.description")}
                    price={t("plans.pricing.custom_pricing")}
                    interval={t("plans.pricing.pricing")}
                    features={ENTERPRISE_PLAN_FEATURES}
                    buttonText={t("plans.enterprise.contact_sales")}
                    onSelect={handleOpenContactForm}
                    disabled={isContactFormOpen}
                />
            </div>
            {userSubscription && (
                <div className="mt-6 text-center">
                    <div className="inline-block rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-muted-foreground">
                        {isSubscribed ? (
                            <>
                                {userSubscription.cancelAtPeriodEnd
                                    ? t("account.subscription_renewal", {
                                        action: t("account.subscription_end"),
                                        date: new Date(userSubscription.currentPeriodEnd).toISOString().split('T')[0]
                                    })
                                    : t("account.subscription_renewal", {
                                        action: t("account.subscription_renew"),
                                        date: new Date(userSubscription.currentPeriodEnd).toISOString().split('T')[0]
                                    })
                                }
                            </>
                        ) : (
                            t("account.free_plan_status")
                        )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        {getCurrentUsageText()}
                    </div>
                </div>
            )}
        </div>
    );
}
