import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt, { JwtHeader } from "jsonwebtoken";

// Define types for Kinde events and payload
type KindeEventType = 'user.created' | 'user.updated' | 'organization.created' | 'user.deleted';

interface KindeUserData {
    id: string;
    given_name?: string;
    family_name?: string;
    email?: string;
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

        // Cast the verified token to our KindeEvent type - need to handle the typing correctly
        const event = jwt.verify(token, signingKey) as unknown as KindeEvent;

        // Handle various events with type safety
        switch (event.type) {
            case "user.updated":
                // handle user updated event
                // e.g update database with event.data
                console.log('User updated:', event.data);
                break;
            case "user.created":
                // handle user created event
                // e.g add user to database with event.data
                console.log('User created:', event.data);
                break;
            case "user.deleted":
                // Handle user deleted event
                console.log('User deleted:', event.data);
                break;
            case "organization.created":
                // Handle organization created event
                console.log('Organization created:', event.data);
                break;
            default:
                // Exhaustiveness checking - this will cause a compile-time error if we add new event types
                // but forget to handle them
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