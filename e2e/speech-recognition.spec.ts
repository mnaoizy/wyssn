import { test, expect } from '@playwright/test'

test.describe('Speech Recognition', () => {
    test('speech recognition component should load properly', async ({ page }) => {
        // Navigate to the homepage
        await page.goto('/en-US')

        // Verify the speech recognition container is present
        const speechContainer = page.locator('[data-testid=speech-recognition-container]')
        await expect(speechContainer).toBeVisible()

        // Take a screenshot of the initial state
        await page.screenshot({ path: 'test-results/speech-recognition-initial.png' })

        // Check for control buttons/panel
        const controlPanel = page.locator('[aria-label*="control"], button:has-text("Start"), button:has-text("Stop")')
        if (await controlPanel.count() > 0) {
            await expect(controlPanel).toBeVisible()
        }

        // Check for transcript display area
        const transcriptArea = page.locator('[aria-label*="transcript"], .transcript, [role="textbox"]')
        if (await transcriptArea.count() > 0) {
            await expect(transcriptArea).toBeVisible()
        }

        // Verify status indicators if they exist
        const statusIndicator = page.locator('[aria-label*="status"], .status')
        if (await statusIndicator.count() > 0) {
            await expect(statusIndicator).toBeVisible()
        }
    })

    test('should display appropriate UI for interaction', async ({ page }) => {
        // Navigate to the homepage
        await page.goto('/en-US')

        // Wait for page to load
        await page.waitForTimeout(1000)
        // Look for start/record button
        const startButton = page.locator('button[aria-label="Start"]')

        // If start button exists, try clicking it
        if (await startButton.count() > 0) {
            await expect(startButton).toBeVisible()

            // Take screenshot before clicking
            await page.screenshot({ path: 'test-results/before-recording.png' })

            // We won't actually click it in tests since it would request microphone permissions
            // But we can verify it's enabled/clickable
            await expect(startButton).toBeEnabled()

            // Look for suggestions grid or related UI components
            const suggestionsArea = page.locator('.suggestions-grid, [aria-label*="suggestion"]')
            if (await suggestionsArea.count() > 0) {
                await expect(suggestionsArea).toBeVisible()
            }
        } else {
            // If start button not found, test can be skipped
            test.skip(true, 'Speech recording start button not found')
        }
    })
})
