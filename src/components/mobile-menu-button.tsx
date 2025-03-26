'use client'

import { Menu } from 'lucide-react'
import { useMobileNavigation } from '@/components/mobile-navigation'

export function MobileMenuButton() {
    const { toggleMenu } = useMobileNavigation()

    return (
        <button
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Menu"
            onClick={toggleMenu}
        >
            <Menu className="h-6 w-6" />
        </button>
    )
}
