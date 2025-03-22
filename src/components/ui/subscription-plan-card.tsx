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
    priceLoading?: boolean;
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
    priceLoading = false,
}: PlanProps) {
    return (
        <div className={`flex flex-col h-full rounded-lg border p-6 shadow-sm bg-white transition-all hover:shadow-md 
      ${isPopular ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}
    `}>
            {/* Reserve space for the badge to prevent layout shift */}
            <div className="h-[28px] mb-2">
                {isPopular && (
                    <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Popular
                    </div>
                )}
            </div>

            {/* Plan title and description */}
            <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Price section with optional loading effect */}
            <div className="mt-5 flex items-baseline">
                <span className={`text-3xl font-bold ${priceLoading ? 'opacity-40' : ''}`}>{price}</span>
                <span className="ml-1 text-sm font-medium text-muted-foreground">/{interval}</span>
            </div>

            {/* Features list that grows to fill available space */}
            <ul className="mt-5 mb-6 space-y-3 text-sm flex-grow">
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

            {/* Action button pinned to the bottom */}
            <div className="mt-auto">
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
