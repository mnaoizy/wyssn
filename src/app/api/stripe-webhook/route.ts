// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma-client";

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
});

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json({
            message: 'Missing stripe signature'
        }, {
            status: 400
        });
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
        });

        // イベントタイプに基づいて処理
        switch (event.type) {
            case 'customer.created':
            case 'customer.updated':
                await handleCustomerEvent(event);
                break;

            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event);
                break;

            case 'customer.subscription.updated':
            case 'customer.subscription.resumed':
                await handleSubscriptionUpdated(event);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({
            message: `Webhook processed successfully: ${event.type}`
        });
    } catch (err) {
        const errorMessage = `⚠️  Webhook signature verification failed. ${(err as Error).message}`;
        console.log(errorMessage);
        return new Response(errorMessage, {
            status: 400
        });
    }
}

// カスタマーイベントの処理
async function handleCustomerEvent(event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;

    // Kindeの認証を使用している場合はメールアドレスでユーザーを特定
    if (customer.email) {
        await db.user.updateMany({
            where: { email: customer.email },
            data: { stripeCustomerId: customer.id }
        });
        console.log(`Updated stripeCustomerId for user with email: ${customer.email}`);
    }
}

// チェックアウトセッション完了イベントの処理
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    // サブスクリプションが作成された場合
    if (session.mode === 'subscription' && session.subscription) {
        // サブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // ユーザーがまだstripeCustomerIdを持っていない場合は更新
        if (session.customer) {
            const customerId = typeof session.customer === 'string'
                ? session.customer
                : session.customer.id;

            // 顧客情報を更新
            if (session.customer_email) {
                await db.user.updateMany({
                    where: { email: session.customer_email },
                    data: { stripeCustomerId: customerId }
                });
            }

            // サブスクリプション作成処理
            await createSubscriptionRecord(subscription, customerId);
        }
    }
}

// サブスクリプション作成イベントの処理
async function handleSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await createSubscriptionRecord(subscription, customerId);
}

// サブスクリプションレコードの作成
async function createSubscriptionRecord(subscription: Stripe.Subscription, customerId: string) {
    try {
        // StripeカスタマーIDからユーザーを検索
        const user = await db.user.findFirst({
            where: { stripeCustomerId: customerId },
        });

        if (!user) {
            console.error(`No user found with Stripe customer ID: ${customerId}`);
            return;
        }

        // すでに同じサブスクリプションIDでレコードが存在するか確認
        const existingSubscription = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (existingSubscription) {
            console.log(`Subscription already exists: ${subscription.id}`);
            // 既存のレコードを更新する場合はここで処理
            return;
        }

        // サブスクリプション情報を保存
        await db.subscription.create({
            data: {
                userId: user.id,
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                productId: subscription.items.data[0]?.price.product as string,
                priceId: subscription.items.data[0]?.price.id as string,
            },
        });

        console.log(`Subscription created for user: ${user.id}`);
    } catch (error) {
        console.error('Failed to create subscription record:', error);
    }
}

// サブスクリプション更新イベントの処理
async function handleSubscriptionUpdated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    try {
        // データベース内の既存のサブスクリプションを検索
        const existingSubscription = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingSubscription) {
            console.error(`No subscription found with ID: ${subscription.id}`);

            // 既存のサブスクリプションがない場合は作成
            const customerId = typeof subscription.customer === 'string'
                ? subscription.customer
                : subscription.customer.id;

            await createSubscriptionRecord(subscription, customerId);
            return;
        }

        // サブスクリプション情報を更新
        await db.subscription.update({
            where: { id: existingSubscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                productId: subscription.items.data[0]?.price.product as string,
                priceId: subscription.items.data[0]?.price.id as string,
                canceledAt: subscription.canceled_at
                    ? new Date(subscription.canceled_at * 1000)
                    : null,
            },
        });

        console.log(`Subscription updated: ${existingSubscription.id}`);
    } catch (error) {
        console.error('Failed to update subscription:', error);
    }
}

// サブスクリプション削除イベントの処理
async function handleSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    try {
        // データベース内のサブスクリプションを検索して更新
        const result = await db.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: 'canceled',
                canceledAt: new Date(subscription.canceled_at || Date.now()),
            }
        });

        if (result.count === 0) {
            console.log(`No subscription record found to update for: ${subscription.id}`);
        } else {
            console.log(`Subscription marked as canceled: ${subscription.id}`);
        }
    } catch (error) {
        console.error('Failed to handle subscription deletion:', error);
    }
}

// 請求書支払い成功イベントの処理
async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    try {
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
            );

            // Webhookイベントを手動で作成するのではなく、取得したサブスクリプションを更新処理に渡す
            await updateSubscriptionData(subscription);
        }
    } catch (error) {
        console.error('Failed to handle invoice payment succeeded:', error);
    }
}

// 請求書支払い失敗イベントの処理
async function handleInvoicePaymentFailed(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;

    try {
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
            );

            // Webhookイベントを手動で作成するのではなく、取得したサブスクリプションを更新処理に渡す
            await updateSubscriptionData(subscription);

            // 支払い失敗の通知やその他のアクションをここに追加
            console.log(`Payment failed for subscription: ${subscription.id}`);
        }
    } catch (error) {
        console.error('Failed to handle invoice payment failed:', error);
    }
}

// サブスクリプションデータを更新する共通関数
async function updateSubscriptionData(subscription: Stripe.Subscription) {
    try {
        const existingSubscription = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (!existingSubscription) {
            console.error(`No subscription found with ID: ${subscription.id}`);

            // 既存のサブスクリプションがない場合は作成
            const customerId = typeof subscription.customer === 'string'
                ? subscription.customer
                : subscription.customer.id;

            await createSubscriptionRecord(subscription, customerId);
            return;
        }

        // サブスクリプション情報を更新
        await db.subscription.update({
            where: { id: existingSubscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                productId: subscription.items.data[0]?.price.product as string,
                priceId: subscription.items.data[0]?.price.id as string,
                canceledAt: subscription.canceled_at
                    ? new Date(subscription.canceled_at * 1000)
                    : null,
            },
        });

        console.log(`Subscription updated: ${existingSubscription.id}`);
    } catch (error) {
        console.error('Failed to update subscription data:', error);
    }
}