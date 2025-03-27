import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db as prisma } from '@/lib/prisma-client'

export async function POST(request: Request) {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        )
    }

    try {
        // Find DB user if logged in
        let dbUser = null
        if (user?.email) {
            dbUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true }
            })
        }

        // Save to database
        const contact = await prisma.contact.create({
            data: {
                email,
                subject,
                message,
                userId: dbUser?.id,
            },
        })

        // Send to Slack
        const slackWebhookUrl = process.env.SLACK_CONTACT_WEBHOOK_URL
        if (slackWebhookUrl) {
            const payload = {
                text: `New contact form submission\n\n*From:* ${email}${dbUser ? ` (DB User ID: ${dbUser.id})` : ''}\n*Subject:* ${subject}\n*Message:* ${message}`,
            }

            await fetch(slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
        }

        return NextResponse.json({ success: true, contact })
    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to submit contact form' },
            { status: 500 }
        )
    }
}
