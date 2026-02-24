import { test, expect } from '@playwright/test'

const selectAll = async (page: import('@playwright/test').Page) => {
  const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
  await page.keyboard.press(mod)
}

test.describe('Basic editing workflow', () => {
  test('can create and edit document', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    await selectAll(page)
    await page.keyboard.type('# My Document\n\nThis is content.')

    const visualEditor = page.locator('[data-testid="visual-editor"]')
    await expect(visualEditor.getByRole('heading', { name: 'My Document' })).toBeVisible({
      timeout: 5000,
    })
    await expect(visualEditor.locator('p')).toContainText('This is content.', {
      timeout: 2000,
    })
  })

  test('can switch between editors', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    const visualEditor = page.locator('[data-testid="visual-editor"]')

    await sourceEditor.click()
    await selectAll(page)
    await page.keyboard.type('# Test')

    // Wait for source→visual sync
    await page.waitForTimeout(400)
    await visualEditor.click()
    await visualEditor.locator('.ProseMirror').click()
    await page.keyboard.type(' - visual edit')

    // Visual→source sync debounce is 500ms
    await page.waitForTimeout(600)
    await expect(visualEditor).toContainText('visual edit', { timeout: 2000 })
    await expect(sourceEditor).toContainText('visual edit', { timeout: 5000 })
  })

  test('preserves content on page reload', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    await selectAll(page)
    await page.keyboard.type('# Persistent Content')

    await page.reload()

    // Note: documentStore persist currently only saves scrollSyncEnabled; add markdown to partialize to persist content
    await expect(sourceEditor).toContainText('# Persistent Content', {
      timeout: 5000,
    })
  })
})
