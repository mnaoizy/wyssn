import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/prisma-client'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAdminPermission() {
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
            where: {
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        // レスポンス用にデータを整形
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
