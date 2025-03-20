import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
})

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json({
            message: 'Bad request'
        }, {
            status: 400
        })
    }
    try {
        const body = await request.arrayBuffer();
        const event = stripe.webhooks.constructEvent(
            Buffer.from(body),
            signature,
            process.env.STRIPE_WEBHOOK_SECRET_KEY as string
        );
        console.log({
            type: event.type,
            id: event.id,
        })
        return NextResponse.json({
            message: `Hello Stripe webhook!`
        });
    } catch (err) {
        const errorMessage = `⚠️  Webhook signature verification failed. ${(err as Error).message}`
        console.log(errorMessage);
        return new Response(errorMessage, {
            status: 400
        })
    }
}
