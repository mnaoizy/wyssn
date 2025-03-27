'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button } from './button'
import { Textarea } from './textarea'
import { Input } from './input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export function ContactDialog({ children }: { children: React.ReactNode }) {
    const { user } = useKindeBrowserClient()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        message: ''
    })

    useEffect(() => {
        if (open && user?.email) {
            setFormData(prev => ({
                ...prev,
                email: user.email
            }))
        }
    }, [open, user?.email])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setOpen(false)
                setFormData({ email: user?.email || '', subject: '', message: '' })
                toast.success('Message sent successfully!')
            } else {
                throw new Error('Failed to send message')
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error('Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={!!user?.email}
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">
                            Subject
                        </label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">
                            Message
                        </label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={5}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
