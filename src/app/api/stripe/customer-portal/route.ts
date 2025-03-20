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
            select: { stripeCustomerId: true }
        });

        if (!dbUser || !dbUser.stripeCustomerId) {
            return NextResponse.json(
                { error: "User not found or Stripe customer ID is missing" },
                { status: 404 }
            );
        }

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("Failed to create customer portal session:", error);
        return NextResponse.json(
            { error: "Failed to create customer portal session" },
            { status: 500 }
        );
    }
}
