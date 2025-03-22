import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully and display core elements', async ({
    page,
  }) => {
    // Navigate to the homepage (will be redirected to default locale)
    await page.goto('/')

    // The app should automatically redirect to a locale-specific URL
    // Wait for the route to stabilize
    await page.waitForURL('**/en-US')

    // Verify hero section is visible
    const heroTitle = page.locator('h1')
    await expect(heroTitle).toBeVisible()

    // Verify speech recognition container is present
    const speechContainer = page.locator(
      '.w-full.max-w-full.p-4.border.rounded-lg'
    )
    await expect(speechContainer).toBeVisible()

    // Take a screenshot of the page for visual reference
    await page.screenshot({ path: 'test-results/homepage.png' })
  })
})
