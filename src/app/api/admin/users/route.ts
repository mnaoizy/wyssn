import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/prisma-client'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function checkAdminPermission() {
    const { getPermission } = getKindeServerSession();
    const hasAdminPermission = await getPermission("admin");
    if (!hasAdminPermission?.isGranted) {
        throw new Error("Admin permission required");
    }
}

export async function GET() {
    try {
        await checkAdminPermission()

        const users = await prisma.user.findMany({
            include: {
                subscriptions: true,
                _count: {
                    select: {
                        apiUsage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        // Format response data
        const formattedUsers = users.map(user => ({
            ...user,
            apiUsageCount: user._count.apiUsage,
        }))

        return NextResponse.json(formattedUsers)
    } catch (error: unknown) {
        console.error('Failed to fetch users:', error)
        if (error instanceof Error && error.message === 'Admin permission required') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        await checkAdminPermission()

        const { userId, suspended } = await request.json()

        if (!userId || typeof suspended !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: suspended ? new Date() : null
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error: unknown) {
        console.error('Failed to update user:', error)
        if (error instanceof Error && error.message === 'Admin permission required') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}
