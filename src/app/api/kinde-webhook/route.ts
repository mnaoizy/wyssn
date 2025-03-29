import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import { createRequestLogger } from '@/lib/logger';
import jwt, { JwtHeader } from "jsonwebtoken";
import { db } from "@/lib/prisma-client";
import { Stripe } from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!, {
    apiVersion: '2025-02-24.acacia'
});
// Define types for Kinde events and payload
type KindeEventType = 'user.created' | 'user.updated' | 'organization.created' | 'user.deleted';

interface KindeUserData {
    first_name?: string;
    last_name?: string;
    email: string;
    id: string;
    is_suspended?: boolean;
    is_password_reset_requested?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    organizations?: Array<any>;
    phone?: string | null;
    username?: string | null;
    picture?: string;
    [key: string]: unknown;
}

interface KindeEventData {
    user: KindeUserData;
    [key: string]: unknown;
}

interface KindeEvent {
    type: KindeEventType;
    data: KindeEventData;
    occurred_at: string;
    [key: string]: unknown;
}

interface KindeJwtPayload {
    iss: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
    azp?: string;
    scope?: string;
    [key: string]: unknown;
}

interface DecodedToken {
    header: JwtHeader & { kid: string };
    payload: KindeJwtPayload;
}

// Initialize the jwks client with proper typing
const client = jwksClient({
    jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const logger = createRequestLogger(ip || 'unknown');

    try {
        // Get the token from the request
        const token = await req.text();

        logger.info({
            message: "Kinde webhook received",
            eventType: "unknown", // will be updated after decoding
            ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown',
            path: req.url
        });

        // Decode the token with proper typing
        const decoded = jwt.decode(token, { complete: true }) as DecodedToken | null;

        if (!decoded || !decoded.header || !decoded.header.kid) {
            throw new Error('Invalid token structure');
        }

        const { kid } = decoded.header;

        // Verify the token with proper typing
        const key = await client.getSigningKey(kid);
        const signingKey = key.getPublicKey();

        // Cast the verified token to our KindeEvent type
        const event = jwt.verify(token, signingKey) as unknown as KindeEvent;

        logger.info({
            message: "Kinde webhook event",
            eventType: event.type,
            userId: event.data.user?.id,
            ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown'
        });

        // Handle various events with type safety
        switch (event.type) {
            case "user.updated":
                // handle user updated event
                await handleUserUpdated(event.data);
                break;
            case "user.created":
                // handle user created event
                await handleUserCreated(event.data);
                break;
            case "user.deleted":
                // Handle user deleted event
                await handleUserDeleted(event.data);
                break;
            case "organization.created":
                // Handle organization created event
                console.log('Organization created:', event.data);
                break;
            default:
                // Exhaustiveness checking
                const _exhaustiveCheck: never = event.type;
                console.log(`Unhandled event type: ${_exhaustiveCheck}`);
                break;
        }

    } catch (err) {
        if (err instanceof Error) {
            logger.error({
                message: "Webhook processing failed",
                error: err.message,
                stack: err.stack,
                ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown'
            });
            return NextResponse.json({ message: 'Webhook processing failed' }, { status: 400 });
        }
        // Handle unknown errors
        logger.error({
            message: "Unknown webhook error",
            error: String(err),
            ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown'
        });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ status: 200, statusText: "success" });
}

// 個々のイベント処理を分離して管理しやすくする
async function handleUserCreated(eventData: KindeEventData) {
    const logger = createRequestLogger(eventData.user?.id || 'unknown');
    logger.info({
        message: "Handling user creation",
        userId: eventData.user?.id,
        email: eventData.user?.email,
        hasName: !!(eventData.user?.first_name || eventData.user?.last_name)
    });

    try {
        // ユーザーデータはeventData.userに格納されている
        const userData = eventData.user;
        if (!userData) {
            throw new Error('User data is missing in the event');
        }

        // 名前を正しく組み立てる
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        // Stripeカスタマーを作成
        const stripeCustomer = await stripe.customers.create({
            email: userData.email,
            name: fullName || 'Unknown Name',
            metadata: {
                kindeId: userData.id // KindeのIDをメタデータに保存して連携を容易にする
            }
        });

        // ユーザーをデータベースに作成
        const user = await db.user.create({
            data: {
                name: fullName || 'Unknown Name',  // 名前が空の場合のフォールバック
                email: userData.email,
                kindeId: userData.id,  // KindeのIDも保存しておく
                stripeCustomerId: stripeCustomer.id  // StripeのカスタマーIDも保存しておく
            }
        });


        logger.info({
            message: "User created successfully",
            userId: user.id,
            stripeCustomerId: user.stripeCustomerId
        });
    } catch (error) {
        logger.error({
            message: "Failed to create user",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
}

async function handleUserUpdated(eventData: KindeEventData) {
    console.log('User updated:', eventData);

    try {
        // ユーザーデータはeventData.userに格納されている
        const userData = eventData.user;
        if (!userData) {
            throw new Error('User data is missing in the event');
        }

        // 名前を正しく組み立てる
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        // KindeIDでユーザーを検索し更新
        const user = await db.user.update({
            where: { kindeId: userData.id },
            data: {
                name: fullName || undefined,  // 空の場合は更新しない
                email: userData.email,
            }
        });

        console.log('User updated in database:', user);
    } catch (error) {
        console.error('Failed to update user in database:', error);
        throw error;
    }
}

async function handleUserDeleted(eventData: KindeEventData) {
    console.log('User deleted:', eventData);

    try {
        // ユーザーデータはeventData.userに格納されている
        const userData = eventData.user;
        if (!userData) {
            throw new Error('User data is missing in the event');
        }

        // ユーザーの削除処理
        // 完全に削除するか、削除フラグを立てるかはアプリケーションの要件による
        const user = await db.user.update({
            where: { kindeId: userData.id },
            data: {
                deletedAt: new Date()  // 論理削除: deletedAtフィールドに削除日時を設定
                // または物理削除: await db.user.delete({ where: { kindeId: userData.id } })
            }
        });

        console.log('User marked as deleted in database:', user);
    } catch (error) {
        console.error('Failed to delete user in database:', error);
        throw error;
    }
}
