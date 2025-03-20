import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma-client';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    const body = await req.json();

    const parseResult = waitlistSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json(
            { message: 'Invalid input', errors: parseResult.error.flatten() },
            { status: 400 }
        );
    }

    const { email } = parseResult.data;

    try {
        const entry = await db.waitlist.create({
            data: { email },
        });
        return NextResponse.json(entry, { status: 201 });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
