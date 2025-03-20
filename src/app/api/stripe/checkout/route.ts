import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma-client";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST() {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user from database
        const dbUser = await db.user.findUnique({
            where: { kindeId: user.id },
            select: { stripeCustomerId: true, email: true }
        });

        if (!dbUser || !dbUser.stripeCustomerId) {
            return NextResponse.json(
                { error: "User not found or Stripe customer ID is missing" },
                { status: 404 }
            );
        }

        // You can add more options like price ID from request body if needed
        const priceId = process.env.STRIPE_PRICE_ID

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: dbUser.stripeCustomerId,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?canceled=true`,
            locale: 'auto',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Failed to create checkout session:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
