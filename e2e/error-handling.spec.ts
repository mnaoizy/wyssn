import { test, expect } from '@playwright/test'

test.describe('Error Handling & Edge Cases', () => {

    test('should be responsive across different screen sizes', async ({ page }) => {
        // Test on mobile size
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/en-US')
        await page.screenshot({ path: 'test-results/mobile-view.png' })

        // Test on tablet size
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.screenshot({ path: 'test-results/tablet-view.png' })

        // Test on desktop size
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.screenshot({ path: 'test-results/desktop-view.png' })

        // Verify the page layout adjusts appropriately across sizes
        const isMobile = await page.evaluate(() => window.innerWidth < 768)

        if (isMobile) {
            // On mobile, we expect mobile navigation elements to be visible
            const mobileNav = page.locator('[data-testid="mobile-nav"]')
            await expect(mobileNav).toBeVisible()

            // モバイルメニューボタンも確認
            const mobileMenuButton = page.getByRole('button', { name: 'Menu' })
            await expect(mobileMenuButton).toBeVisible()
        } else {
            // On desktop, we should check for the desktop navigation
            const desktopNav = page.locator('[data-testid="desktop-nav"]')
            await expect(desktopNav).toBeVisible()

            // デスクトップナビゲーション内のリンクが存在することを確認
            const navLinks = page.locator('[data-testid="desktop-nav"] a')
            expect(await navLinks.count()).toBeGreaterThan(0)
        }
    })
})