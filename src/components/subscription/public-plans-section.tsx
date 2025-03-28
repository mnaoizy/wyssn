"use client";


import React, { useEffect, useState } from "react";
import { SubscriptionPlanCard } from "@/components/ui/subscription-plan-card";
import { useParams } from "next/navigation";
import { useI18n } from "@/locale/client";
import { SignupDialog } from "@/components/ui/signup-dialog";
import { ContactDialog } from "@/components/ui/contact-dialog";

interface PriceDetails {
    unitAmount: number | null;
    currency: string;
    interval: string;
    loading: boolean;
    error: boolean;
}

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

export function PublicPlansSection() {
    const params = useParams();
    const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale || 'en-US';
    const t = useI18n();

    // Create a function to get the signup text based on locale since somehow the useI18n hook is not working
    const getSignupText = () => {
        switch (locale) {
            case 'de-DE':
                return 'Kostenlos registrieren';
            case 'es-ES':
                return 'Registrarse gratis';
            case 'fr-FR':
                return 'S\'inscrire gratuitement';
            case 'ja-JP':
                return '無料で登録';
            case 'zh-CN':
                return '免费注册';
            case 'uk-UA':
                return 'Зареєструватись безкоштовно';
            case 'th-TH':
                return 'ลงทะเบียนฟรี';
            default:
                return 'Sign up for Free';
        }
    };
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);
    const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
    const [priceDetails, setPriceDetails] = useState<PriceDetails>({
        unitAmount: null,
        currency: 'jpy',
        interval: 'month',
        loading: true,
        error: false
    });

    useEffect(() => {
        const fetchPriceDetails = async () => {
            try {
                const response = await fetch(`/api/stripe/price?priceId=${process.env.NEXT_PUBLIC_STRIPE_PRICE_ID}`);

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

    const handleSubscribeClick = () => {
        setIsSignupDialogOpen(true);
    };

    const handleCloseSignupDialog = () => {
        setIsSignupDialogOpen(false);
    };

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3">
                {/* Free Plan */}
                <SubscriptionPlanCard
                    title={t("plans.free.title")}
                    description={t("plans.free.description")}
                    price="¥0"
                    interval={t("plans.pricing.month")}
                    features={FREE_PLAN_FEATURES}
                    buttonText={getSignupText()}
                    onSelect={handleSubscribeClick}
                />

                {/* Pro Plan */}
                <SubscriptionPlanCard
                    title={t("plans.pro.title")}
                    description={t("plans.pro.description")}
                    price={priceDetails.loading ? "$--" : (priceDetails.error ? "$--" : formattedPrice)}
                    interval={priceDetails.interval}
                    priceLoading={priceDetails.loading}
                    features={PRO_PLAN_FEATURES}
                    buttonText={t("plans.pro.subscribe")}
                    onSelect={handleSubscribeClick}
                    isPopular={true}
                />

                {/* Enterprise Plan - Keep the Contact Sales button */}
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

            {/* Signup Dialog */}
            <SignupDialog
                isOpen={isSignupDialogOpen}
                onClose={handleCloseSignupDialog}
            />

            {/* Contact Dialog */}
            <ContactDialog
                open={isContactFormOpen}
                onOpenChange={setIsContactFormOpen}
                subject="Enterprise plan inquiry"
            />
        </div >
    );
}
