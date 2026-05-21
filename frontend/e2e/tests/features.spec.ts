import { test, expect } from '@playwright/test'

test.describe('Feature Flags', () => {
  test('can create and toggle feature flag', async ({ page }) => {
    await page.goto('/flags')

    // Create flag
    await page.click('button:has-text("New Flag")')
    await page.fill('input[placeholder*="new-ui"]', 'new-checkout-flow')
    await page.fill('textarea', 'Improved checkout experience')
    await page.click('button:has-text("Create Flag")')

    // Verify flag created
    await expect(page.locator('text=new-checkout-flow')).toBeVisible()

    // Enable flag
    await page.click('button:has-text("Enable")')

    // Verify enabled
    await expect(page.locator('.badge')).toContainText('enabled')
  })

  test('can set flag rollout percentage', async ({ page }) => {
    await page.goto('/flags')

    // Create rolling-out flag
    await page.click('button:has-text("New Flag")')
    await page.fill('input[placeholder*="new-ui"]', 'gradient-ui')
    await page.selectOption('select', 'rolling_out')
    await page.click('button:has-text("Create Flag")')

    // Adjust rollout slider
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('50')

    // Verify rollout percentage
    await expect(page.locator('text=50%')).toBeVisible()
  })
})

test.describe('A/B Tests', () => {
  test('can create A/B test and view metrics', async ({ page }) => {
    await page.goto('/ab-tests')

    // Create test
    await page.click('button:has-text("New Test")')
    await page.fill('input[placeholder*="checkout"]', 'checkout-variant-test')
    await page.fill('textarea', 'Testing new checkout flow')
    await page.fill('input[value="Control"]', 'Original Flow')
    await page.fill('input[value="Variant"]', 'New Flow')
    await page.click('button:has-text("Create Test")')

    // Verify test created
    await expect(page.locator('text=checkout-variant-test')).toBeVisible()

    // Verify variant cards shown
    await expect(page.locator('text=Original Flow')).toBeVisible()
    await expect(page.locator('text=New Flow')).toBeVisible()
  })

  test('can view A/B test conversion rates', async ({ page }) => {
    await page.goto('/ab-tests')

    // Create test
    await page.click('button:has-text("New Test")')
    await page.fill('input[placeholder*="checkout"]', 'conversion-rate-test')
    await page.fill('input[value="Control"]', 'Control')
    await page.fill('input[value="Variant"]', 'Test Variant')
    await page.click('button:has-text("Create Test")')

    // Verify metrics display
    await expect(page.locator('text=Conversion Rate')).toBeVisible()
    await expect(page.locator('text=%')).toBeVisible()
  })
})
