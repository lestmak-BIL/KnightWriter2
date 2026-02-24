import { test, expect } from '@playwright/test'

test.describe('Stress tests', () => {
  test('rapid editor switching (100x)', async ({ page }) => {
    await page.goto('/')

    for (let i = 0; i < 100; i++) {
      await page.locator('[data-testid="source-editor"]').click()
      await page.locator('[data-testid="visual-editor"]').click()
    }

    await page.locator('[data-testid="source-editor"]').click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('# Still works')

    await expect(
      page.locator('[data-testid="visual-editor"]')
    ).toContainText('Still works', { timeout: 5000 })
  })
})
