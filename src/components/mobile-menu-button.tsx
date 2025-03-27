'use client'

import { MenuIcon } from 'lucide-react'
import { useMobileNavigation } from '@/components/mobile-navigation'
import { Button } from '@/components/ui/button'

export function MobileMenuButton() {
    const { toggleMenu } = useMobileNavigation()

    return (
        <Button
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Menu"
            onClick={toggleMenu}
            variant="ghost"
            size="icon"
        >
            <MenuIcon className="size-6" />
        </Button>
    )
}
