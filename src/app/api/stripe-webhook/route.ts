// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma-client";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
});

// Prismaトランザクション用の型定義
type TransactionClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json({
            message: 'Missing stripe signature'
        }, {
            status: 400
        });
    }

    let event: Stripe.Event;

    try {
        const body = await request.arrayBuffer();
        event = stripe.webhooks.constructEvent(
            Buffer.from(body),
            signature,
            process.env.STRIPE_WEBHOOK_SECRET_KEY as string
        );
    } catch (err) {
        const errorMessage = `⚠️  Webhook signature verification failed. ${(err as Error).message}`;
        console.log(errorMessage);
        return new Response(errorMessage, {
            status: 400
        });
    }

    console.log({
        type: event.type,
        id: event.id,
    });

    try {
        // トランザクションを開始して、イベント処理の冪等性と一貫性を確保
        const result = await db.$transaction(async (tx: TransactionClient) => {
            // イベントが既に処理済みかチェック (冪等性確保のため)
            const existingEvent = await tx.stripeWebhookEvent.findUnique({
                where: { stripeEventId: event.id }
            });

            if (existingEvent) {
                console.log(`Event ${event.id} already processed at ${existingEvent.processedAt}, skipping`);
                return {
                    status: "skipped",
                    message: `Event ${event.id} was already processed at ${existingEvent.processedAt}`
                };
            }

            // イベントタイプに基づいて処理
            switch (event.type) {
                case 'customer.created':
                case 'customer.updated':
                    // ユーザーは既にstripeCustomerIdを持っているため、このイベントは無視
                    break;

                case 'checkout.session.completed':
                    await handleCheckoutSessionCompleted(event, tx);
                    break;

                case 'customer.subscription.created':
                    await handleSubscriptionCreated(event, tx);
                    break;

                case 'customer.subscription.updated':
                case 'customer.subscription.resumed':
                    await handleSubscriptionUpdated(event, tx);
                    break;

                case 'customer.subscription.deleted':
                    await handleSubscriptionDeleted(event, tx);
                    break;

                case 'invoice.payment_succeeded':
                    await handleInvoicePaymentSucceeded(event, tx);
                    break;

                case 'invoice.payment_failed':
                    await handleInvoicePaymentFailed(event, tx);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            // イベントを処理済みとしてマーク
            await tx.stripeWebhookEvent.create({
                data: {
                    stripeEventId: event.id,
                    eventType: event.type,
                    // データをJSON型に安全に変換
                    data: JSON.parse(JSON.stringify(event.data.object))
                }
            });

            return {
                status: "success",
                message: `Event ${event.id} processed successfully`
            };
        });

        console.log(`Webhook processing result:`, result);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Error processing webhook:', err);
        // 500エラーを返すとStripeは後でリトライします
        return NextResponse.json({
            status: "error",
            message: (err instanceof Error) ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}

// チェックアウトセッション完了イベントの処理
async function handleCheckoutSessionCompleted(event: Stripe.Event, tx: TransactionClient) {
    const session = event.data.object as Stripe.Checkout.Session;

    // サブスクリプションが作成された場合
    if (session.mode === 'subscription' && session.subscription) {
        // サブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // サブスクリプション作成処理
        await upsertSubscription(subscription, customerId, tx);
    }
}

// サブスクリプション作成イベントの処理
async function handleSubscriptionCreated(event: Stripe.Event, tx: TransactionClient) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await upsertSubscription(subscription, customerId, tx);
}

// サブスクリプションレコードの作成または更新 (upsert操作)
async function upsertSubscription(
    subscription: Stripe.Subscription,
    customerId: string,
    tx: TransactionClient
) {
    // StripeカスタマーIDからユーザーを検索 - 必ず存在するという前提
    const user = await tx.user.findUniqueOrThrow({
        where: { stripeCustomerId: customerId },
    });

    // サブスクリプションデータ
    const subscriptionData = {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        productId: subscription.items.data[0]?.price.product as string,
        priceId: subscription.items.data[0]?.price.id as string,
        canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
    };

    // upsert操作: 存在すれば更新、なければ作成
    const result = await tx.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: subscriptionData,
        create: subscriptionData,
    });

    console.log(`Subscription upserted for user: ${user.id}, subscription ID: ${result.id}`);
    return result;
}

// サブスクリプション更新イベントの処理
async function handleSubscriptionUpdated(event: Stripe.Event, tx: TransactionClient) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await upsertSubscription(subscription, customerId, tx);
}

// サブスクリプション削除イベントの処理
async function handleSubscriptionDeleted(event: Stripe.Event, tx: TransactionClient) {
    const subscription = event.data.object as Stripe.Subscription;

    // サブスクリプションの状態を更新
    const result = await tx.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: 'canceled',
            canceledAt: new Date(subscription.canceled_at || Date.now()),
        }
    });

    if (result.count === 0) {
        console.log(`No subscription record found to update for: ${subscription.id}`);
    } else {
        console.log(`Subscription marked as canceled: ${subscription.id}, updated records: ${result.count}`);
    }
}

// 請求書支払い成功イベントの処理
async function handleInvoicePaymentSucceeded(event: Stripe.Event, tx: TransactionClient) {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
        );

        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // サブスクリプションの更新
        await upsertSubscription(subscription, customerId, tx);
    }
}

// 請求書支払い失敗イベントの処理
async function handleInvoicePaymentFailed(event: Stripe.Event, tx: TransactionClient) {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
        );

        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // サブスクリプションの更新
        await upsertSubscription(subscription, customerId, tx);

        // 支払い失敗の通知やその他のアクションをここに追加
        console.log(`Payment failed for subscription: ${subscription.id}`);

        // TODO: ここでユーザーに支払い失敗の通知を送るなどの処理を追加できます
    }
}