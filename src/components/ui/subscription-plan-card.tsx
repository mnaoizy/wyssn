"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface PlanFeature {
    title: string;
    included: boolean;
}

export interface PlanProps {
    title: string;
    description: string;
    price: string;
    interval: string;
    features: PlanFeature[];
    isPopular?: boolean;
    buttonText: string;
    onSelect: () => void;
    disabled?: boolean;
    isCurrentPlan?: boolean;
}

export function SubscriptionPlanCard({
    title,
    description,
    price,
    interval,
    features,
    isPopular = false,
    buttonText,
    onSelect,
    disabled = false,
    isCurrentPlan = false,
}: PlanProps) {
    return (
        <div className={`flex flex-col rounded-lg border p-6 shadow-sm ${isPopular ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
            {isPopular && (
                <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Popular
                </div>
            )}
            <div className="mt-4">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">{price}</span>
                <span className="ml-1 text-sm font-medium text-muted-foreground">/{interval}</span>
            </div>
            <ul className="mt-6 space-y-4 text-sm">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        {feature.included ? (
                            <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                            <div className="mr-2 h-5 w-5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.title}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-6">
                <Button
                    onClick={onSelect}
                    className="w-full"
                    disabled={disabled || isCurrentPlan}
                    variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                >
                    {isCurrentPlan ? "Current Plan" : buttonText}
                </Button>
            </div>
        </div>
    );
}
