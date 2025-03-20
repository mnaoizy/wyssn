"use client";

import React from "react";
import { SubscriptionPlanCard } from "@/components/ui/subscription-plan-card";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/subscription-service";
import { Subscription } from "@prisma/client";

interface PlansProps {
    userSubscription?: Subscription | null;
}

const PRO_PLAN_FEATURES = [
    { title: "Unlimited usage", included: true },
    { title: "Priority support", included: true },
    { title: "Advanced features", included: true },
    { title: "Team collaboration", included: true },
];

const FREE_PLAN_FEATURES = [
    { title: "Limited usage", included: true },
    { title: "Basic support", included: true },
    { title: "Basic features", included: true },
    { title: "Single user only", included: true },
];

export function PlansSection({ userSubscription }: PlansProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const isSubscribed = !!userSubscription &&
        ['active', 'trialing'].includes(userSubscription.status);

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
        try {
            setIsLoading(true);
            await createCustomerPortalSession();
        } catch (error) {
            console.error("Failed to create customer portal session:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Choose the plan that&apos;s right for you
                </h2>
                <p className="mt-3 text-xl text-muted-foreground">
                    Get started with our flexible pricing options
                </p>
            </div>
            {JSON.stringify(isSubscribed)}
            <div className="mt-10 grid gap-8 md:grid-cols-2">
                <SubscriptionPlanCard
                    title="Free Plan"
                    description="Perfect for getting started with basic features"
                    price="¥0"
                    interval="month"
                    features={FREE_PLAN_FEATURES}
                    buttonText="Current Plan"
                    onSelect={() => { }}
                    isCurrentPlan={!isSubscribed}
                    disabled={true}
                />
                <SubscriptionPlanCard
                    title="Pro Plan"
                    description="Everything you need for professional usage"
                    price="¥980"
                    interval="month"
                    features={PRO_PLAN_FEATURES}
                    buttonText={isSubscribed ? "Manage Subscription" : "Subscribe"}
                    onSelect={isSubscribed ? handleManageSubscription : handleSubscribe}
                    isPopular={true}
                    isCurrentPlan={isSubscribed}
                    disabled={isLoading}
                />
            </div>
            {isSubscribed && userSubscription && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Your subscription will {userSubscription.cancelAtPeriodEnd ? 'end' : 'renew'} on {' '}
                        {new Date(userSubscription.currentPeriodEnd).toISOString().split('T')[0]}
                    </p>
                </div>
            )}
        </div>
    );
}
