import { test, expect } from '@playwright/test'

test.describe('Account Page Authentication', () => {
  test('should redirect unauthenticated users from account page to homepage', async ({
    page,
  }) => {
    // Start with direct navigation to account page
    await page.goto('/account')

    // It should redirect to a locale-specific URL on the homepage
    // This verifies the auth protection mechanism works
    await page.waitForURL('**/en-US')

    // Verify we are on the homepage by checking for the hero section
    const heroTitle = page.locator('h1')
    await expect(heroTitle).toBeVisible()

    // Ensure we're not seeing account-specific content
    const accountTitle = page.locator('text=Account')
    await expect(accountTitle).not.toBeVisible()

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/account-redirect.png' })
  })

  test('should show correct navigation links in mobile navigation', async ({
    page,
  }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Wait for locale redirect
    await page.waitForURL('**/en-US')

    // Mobile navigation is likely hidden by default, so use a narrow viewport
    await page.setViewportSize({ width: 480, height: 720 })

    // Use a more specific selector to find the mobile menu button
    // Combining the aria-label with a class selector to be more specific
    const mobileMenuButton = page.locator(
      'button.text-neutral-500[aria-label="Menu"]'
    )

    // Verify the mobile menu button is visible
    await expect(mobileMenuButton).toBeVisible()

    // Click the mobile menu button to open the mobile navigation panel
    await mobileMenuButton.click()

    // Wait for the mobile navigation panel animation to complete
    await page.waitForTimeout(300)

    // For unauthenticated users, we should see sign in/sign up links instead of account
    // Check for the sign in link which should be visible for all users
    const signInLink = page.getByRole('link', {
      name: /sign in|signin|login|log in|ログイン/i,
    })
    await expect(signInLink).toBeVisible()

    // Also check for sign up link
    const signUpLink = page.getByRole('link', {
      name: /sign up|signup|register|新規登録/i,
    })
    await expect(signUpLink).toBeVisible()

    // Take a screenshot of the mobile navigation
    await page.screenshot({ path: 'test-results/mobile-navigation.png' })
  })
})
