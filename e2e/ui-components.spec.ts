import { test, expect } from '@playwright/test'

test.describe('UI Components', () => {
    test('language selector should be functional', async ({ page }) => {
        // Navigate to the homepage with default locale
        await page.goto('/en-US')

        // Wait for page to load
        await page.waitForTimeout(1000)

        // Find language selector
        const languageSelector = page.getByRole('combobox', { name: 'language-selector' }).first()
        await expect(languageSelector).toBeVisible()

        // Take screenshot before changing language
        await page.screenshot({ path: 'test-results/before-language-change.png' })

        // Click on language selector to open dropdown
        await languageSelector.click()

        // Wait for dropdown content to be visible
        const selectContent = page.locator('[data-slot="select-content"], [role="listbox"]').first()
        await expect(selectContent).toBeVisible()

        // Use exact text matching to find the Spanish option
        const spanishOption = page.getByText('Español', { exact: true })

        // Alternative method: get all items and find the one with Spanish text
        if (await spanishOption.count() === 0) {
            // Fallback approach using all select items
            const allItems = page.locator('[data-slot="select-item"]')
            const count = await allItems.count()

            // Loop through all items to find the Spanish one
            for (let i = 0; i < count; i++) {
                const itemText = await allItems.nth(i).textContent()
                if (itemText?.includes('Español')) {
                    // Found Spanish, click it
                    await allItems.nth(i).click()
                    break
                }
            }
        } else {
            // Click the Spanish option if found directly
            await spanishOption.click()
        }

        // Verify URL changed to Spanish locale
        await page.waitForURL('**/es-ES', { timeout: 10000 })
        await expect(page).toHaveURL(/.*\/es-ES/)

        // Take screenshot after changing language
        await page.screenshot({ path: 'test-results/after-language-change.png' })
    })
})