import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test('can view transaction list', async ({ page }) => {
    await page.goto('/')

    // Wait for transactions table
    await page.waitForSelector('table')

    // Verify table headers
    await expect(page.locator('th')).toContainText('Transaction ID')
    await expect(page.locator('th')).toContainText('Amount')
    await expect(page.locator('th')).toContainText('Risk Level')
  })

  test('can flag a transaction', async ({ page }) => {
    await page.goto('/')

    // Wait for table and flag button
    await page.waitForSelector('button:has-text("Flag")')

    // Click flag button on first unflagged transaction
    const flagButton = page.locator('button:has-text("Flag")').first()
    await flagButton.click()

    // Verify modal opened
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('text=Flag Transaction')).toBeVisible()

    // Fill reason
    await page.fill('textarea[placeholder*="reason"]', 'Suspicious pattern detected')

    // Submit
    await page.click('button:has-text("Flag Transaction")')

    // Verify modal closed
    await expect(page.locator('.modal')).not.toBeVisible()

    // Verify flagged badge appears
    await expect(page.locator('.badge:has-text("Flagged")')).toBeVisible()
  })

  test('can filter transactions by risk level', async ({ page }) => {
    await page.goto('/')

    // Wait for table
    await page.waitForSelector('table')

    // Verify risk level badges visible
    const riskBadges = page.locator('.badge:has-text("high"), .badge:has-text("medium"), .badge:has-text("low")')
    await expect(riskBadges.first()).toBeVisible()
  })

  test('dashboard shows deployment status', async ({ page }) => {
    await page.goto('/')

    // Verify deployment status card present
    await expect(page.locator('text=Latest Deployment')).toBeVisible()
    await expect(page.locator('text=Current Version')).toBeVisible()
  })

  test('dashboard shows feature flags', async ({ page }) => {
    await page.goto('/')

    // Verify feature flags section
    await expect(page.locator('text=Active Feature Flags')).toBeVisible()
  })
})
