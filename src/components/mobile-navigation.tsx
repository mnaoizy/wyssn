'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { XIcon } from 'lucide-react'
import { useCurrentLocale, useI18n } from '@/locale/client'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { AdminLink } from './admin-link'
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components'
import { Button } from '@/components/ui/button'

type MobileNavigationContextType = {
  isOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
}

// Create context for mobile navigation state
const MobileNavigationContext = createContext<MobileNavigationContextType>({
  isOpen: false,
  toggleMenu: () => { },
  closeMenu: () => { },
})

// Hook to access the mobile navigation context
export const useMobileNavigation = () => useContext(MobileNavigationContext)

export function MobileNavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Close the menu when changing routes
  useEffect(() => {
    closeMenu()
  }, [pathname])

  // Close menu when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const value = {
    isOpen,
    toggleMenu,
    closeMenu,
  }

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  )
}

export function MobileNavigationPanel() {
  const { isOpen, closeMenu } = useMobileNavigation()
  const locale = useCurrentLocale()
  const pathname = usePathname()
  const t = useI18n()
  const { isAuthenticated } = useKindeBrowserClient()

  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } shadow-xl flex flex-col p-6 md:hidden`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold uppercase">Wyssn</h2>
          <Button
            aria-label="Close menu"
            onClick={closeMenu}
            variant="ghost"
            size="icon"
            className='rounded-full'
          >
            <XIcon className="size-6" />
          </Button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}`}
                className={`block py-2 px-4 rounded-md ${pathname === `/${locale}`
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
                  }`}
              >
                Home
              </Link>
            </li>
            {/* <li>
              <Link
                href="#"
                className="block py-2 px-4 rounded-md hover:bg-gray-50"
              >
                {t('nav.about')}
              </Link>
            </li> */}
            <li>
              <Link
                href={`/${locale}/changelog`}
                className={`block py-2 px-4 rounded-md ${pathname === `/${locale}/changelog`
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
                  }`}
              >
                {t('nav.changelog')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/pricing`}
                className={`block py-2 px-4 rounded-md ${pathname === `/${locale}/pricing`
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
                  }`}
              >
                {t('nav.pricing')}
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href={`/${locale}/account`}
                    className={`block py-2 px-4 rounded-md ${pathname === `/${locale}/account`
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    {t('nav.account')}
                  </Link>
                </li>
                <li>
                  <AdminLink />
                </li>
                <li className="pt-2 border-t border-gray-100">
                  <LogoutLink
                    postLogoutRedirectURL={`/${locale}`}
                    className={`block py-2 px-4 rounded-md hover:bg-gray-50`}
                  >
                    {t('nav.signout')}
                  </LogoutLink>
                </li>
              </>
            ) : (
              <>
                <li className="pt-2 border-t border-gray-100">
                  <LoginLink
                    authUrlParams={{ lang: locale }}
                    postLoginRedirectURL={`/${locale}`}
                    className={`block py-2 px-4 rounded-md hover:bg-gray-50`}
                  >
                    {t('nav.signin')}
                  </LoginLink>
                </li>
                <li>
                  <RegisterLink
                    authUrlParams={{ lang: locale }}
                    lang={locale}
                    postLoginRedirectURL={`/${locale}`}
                    className={`block py-2 px-4 rounded-md hover:bg-gray-50 font-medium`}
                  >
                    {t('nav.signup')}
                  </RegisterLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WYSSN
          </p>
        </div>
      </div>
    </>
  )
}
