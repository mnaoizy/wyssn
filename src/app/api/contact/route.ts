import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db as prisma } from '@/lib/prisma-client'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, '1 m'),
})

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    console.log('Contact form request from IP:', ip)
    const { success } = await ratelimit.limit(ip)

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        )
    }

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

        // Send to Slack with rich formatting
        const slackWebhookUrl = process.env.SLACK_CONTACT_WEBHOOK_URL
        if (slackWebhookUrl) {
            const payload = {
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: "📬 New Contact Form Submission",
                            emoji: true
                        }
                    },
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*From:*\n${email}`
                            },
                            {
                                type: "mrkdwn",
                                text: `*Status:*\n${dbUser ? "Logged in user" : "Guest user"}`
                            }
                        ]
                    },
                    {
                        type: "section",
                        fields: [
                            {
                                type: "mrkdwn",
                                text: `*Subject:*\n${subject}`
                            },
                            dbUser ? {
                                type: "mrkdwn",
                                text: `*User ID:*\n${dbUser.id}`
                            } : {
                                type: "mrkdwn",
                                text: "*User ID:*\nNot available"
                            }
                        ]
                    },
                    {
                        type: "divider"
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Message:*\n\`\`\`${message}\`\`\``
                        }
                    }
                ]
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
