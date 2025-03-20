import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const priceId = searchParams.get('priceId');

        if (!priceId) {
            return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
        }

        // Fetch price from Stripe
        const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
        });

        // Format response with essential details
        const response = {
            id: price.id,
            unitAmount: price.unit_amount,
            currency: price.currency,
            nickname: price.nickname,
            recurring: price.recurring ? {
                interval: price.recurring.interval,
                intervalCount: price.recurring.interval_count,
            } : null,
            productName: price.product && typeof price.product !== 'string' && 'name' in price.product ? price.product.name : null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to fetch price:", error);
        return NextResponse.json(
            { error: "Failed to fetch price details" },
            { status: 500 }
        );
    }
}
