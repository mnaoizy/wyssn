import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt, { JwtHeader } from "jsonwebtoken";
import { db } from "@/lib/prisma-client";

// Define types for Kinde events and payload
type KindeEventType = 'user.created' | 'user.updated' | 'organization.created' | 'user.deleted';

interface KindeUserData {
    id: string;
    first_name?: string;  // first_nameフィールドを追加
    last_name?: string;
    email: string;
    is_suspended?: boolean;
    is_password_reset_requested?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    organizations?: Array<any>;
    phone?: string | null;
    username?: string | null;
    picture?: string;
    [key: string]: unknown;
}

interface KindeEvent {
    type: KindeEventType;
    data: KindeUserData;
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
    try {
        // Get the token from the request
        const token = await req.text();

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

        console.log(`Event type: ${event.type}`);
        console.log('Event data:', event.data);

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
            console.error('Webhook error:', err.message);
            return NextResponse.json({ message: err.message }, { status: 400 });
        }
        // Handle unknown errors
        console.error('Unknown webhook error:', err);
        return NextResponse.json({ message: 'Unknown error occurred' }, { status: 500 });
    }

    return NextResponse.json({ status: 200, statusText: "success" });
}

// 個々のイベント処理を分離して管理しやすくする
async function handleUserCreated(userData: KindeUserData) {
    console.log('User created:', userData);

    try {
        // 名前を正しく組み立てる
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        // ユーザーをデータベースに作成
        const user = await db.user.create({
            data: {
                name: fullName || 'Unknown Name',  // 名前が空の場合のフォールバック
                email: userData.email,
                kindeId: userData.id,  // KindeのIDも保存しておく
            }
        });

        console.log('User created in database:', user);
    } catch (error) {
        console.error('Failed to create user in database:', error);
        throw error;
    }
}

async function handleUserUpdated(userData: KindeUserData) {
    console.log('User updated:', userData);

    try {
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

async function handleUserDeleted(userData: KindeUserData) {
    console.log('User deleted:', userData);

    try {
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