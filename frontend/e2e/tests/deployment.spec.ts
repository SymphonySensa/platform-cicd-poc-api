import { test, expect } from '@playwright/test'

test.describe('Deployment Patterns', () => {
  test('can create and view blue-green deployment', async ({ page }) => {
    await page.goto('/deployments')

    // Click New Deployment button
    await page.click('button:has-text("New Deployment")')

    // Fill form
    await page.fill('input[placeholder*="version"]', '1.2.0')
    await page.selectOption('select', 'blue_green')

    // Create deployment
    await page.click('button:has-text("Create Deployment")')

    // Verify deployment appears in table
    await expect(page.locator('table')).toContainText('1.2.0')
    await expect(page.locator('table')).toContainText('blue-green')
  })

  test('can create canary deployment with progress tracking', async ({ page }) => {
    await page.goto('/deployments')

    // Create canary deployment
    await page.click('button:has-text("New Deployment")')
    await page.fill('input[placeholder*="version"]', '1.3.0')
    await page.selectOption('select', 'canary')
    await page.click('button:has-text("Create Deployment")')

    // Verify canary deployment
    await expect(page.locator('table')).toContainText('1.3.0')
    await expect(page.locator('table')).toContainText('canary')
  })

  test('can rollback deployment', async ({ page }) => {
    await page.goto('/deployments')

    // Create deployment
    await page.click('button:has-text("New Deployment")')
    await page.fill('input[placeholder*="version"]', '1.4.0')
    await page.selectOption('select', 'blue_green')
    await page.click('button:has-text("Create Deployment")')

    // Wait for deployment to appear
    await page.waitForSelector('text=1.4.0')

    // Rollback
    await page.click('button:has-text("Rollback")')

    // Verify rollback status
    await expect(page.locator('table')).toContainText('rolled_back')
  })
})
