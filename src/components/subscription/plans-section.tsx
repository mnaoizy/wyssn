"use client";

import React, { useEffect } from "react";
import { SubscriptionPlanCard } from "@/components/ui/subscription-plan-card";
import { createCheckoutSession } from "@/lib/subscription-service";
import { Subscription } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/locale/client";
import { ContactDialog } from "@/components/ui/contact-dialog";

interface PlansProps {
    userSubscription?: Subscription & { usageCount?: number } | null;
    subscriptionManagementUrl: string | null;
    showHeading?: boolean;
}

interface PriceDetails {
    unitAmount: number | null;
    currency: string;
    interval: string;
    loading: boolean;
    error: boolean;
}

// Plan features are defined inside the component to use translations

// Default Stripe price ID - this should be provided from an environment variable in a real app
const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

// Format currency based on locale and currency
function formatCurrency(amount: number | null, currency: string, locale: string): string {
    if (amount === null) return '';

    // Convert from cents to dollars/etc
    const value = amount / 100;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export function PlansSection({ userSubscription, subscriptionManagementUrl, showHeading = true }: PlansProps) {
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
                    interval: t("plans.pricing.month"),
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
        setIsContactFormOpen(true);
    };

    // Format the price with proper currency
    const formattedPrice = formatCurrency(
        priceDetails.unitAmount,
        priceDetails.currency,
        locale
    );

    // Create feature lists with translations
    const FREE_PLAN_FEATURES = [
        { title: t("plans.features.core_features"), included: true },
        { title: t("plans.features.requests_free_daily"), included: true },
        { title: t("plans.features.requests_free_monthly"), included: true },
        { title: t("plans.features.standard_support"), included: true },
    ];

    const PRO_PLAN_FEATURES = [
        { title: t("plans.features.core_features"), included: true },
        { title: t("plans.features.requests_pro_daily"), included: true },
        { title: t("plans.features.requests_pro_monthly"), included: true },
        { title: t("plans.features.priority_support"), included: true },
    ];

    const ENTERPRISE_PLAN_FEATURES = [
        { title: t("plans.features.core_features"), included: true },
        { title: t("plans.features.custom_limits"), included: true },
        { title: t("plans.features.team_management"), included: true },
        { title: t("plans.features.dedicated_support"), included: true },
        { title: t("plans.features.custom_billing"), included: true },
    ];

    return (
        <div>
            {showHeading && (
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                        {t("plans.heading")}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                        {t("plans.subheading")}
                    </p>
                </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
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
            {/* Contact Dialog */}
            <ContactDialog
                open={isContactFormOpen}
                onOpenChange={setIsContactFormOpen}
                subject="Enterprise plan inquiry"
            />
        </div>
    );
}
