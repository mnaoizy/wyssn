import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/prisma-client'
import { checkAdminPermission } from '@/lib/admin-utils';

export async function GET(request: Request) {
    try {
        await checkAdminPermission()

        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get('page')) || 1
        const perPage = Number(searchParams.get('perPage')) || 10

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip: (page - 1) * perPage,
                take: perPage,
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
            }),
            prisma.user.count()
        ])

        // Format response data
        const formattedUsers = users.map(user => ({
            ...user,
            apiUsageCount: user._count.apiUsage,
        }))

        return NextResponse.json({
            users: formattedUsers,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        })
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
