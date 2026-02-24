import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('handles large documents (200 lines)', async ({ page }) => {
    await page.goto('/')

    const lines = Array(200)
      .fill('Line of text')
      .map((l, i) => `${i}. ${l}`)
    const largeDoc = lines.join('\n')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
    await page.keyboard.press(mod)
    await page.keyboard.type(largeDoc, { delay: 0 })

    const visualEditor = page.locator('[data-testid="visual-editor"]')
    await expect(visualEditor).toBeVisible({ timeout: 15000 })
    await expect(visualEditor).toContainText('Line of text', { timeout: 5000 })
  })
})
