import { test, expect } from '@playwright/test'

test.describe('Advanced formatting', () => {
  test('can create and edit code blocks', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
    await page.keyboard.press(mod)
    await page.keyboard.type('```javascript\nconst x = 1;\n```')

    const visualEditor = page.locator('[data-testid="visual-editor"]')
    await expect(visualEditor.locator('pre code')).toContainText('const x = 1;', {
      timeout: 5000,
    })
    await expect(visualEditor.locator('.language-javascript')).toBeVisible({
      timeout: 2000,
    })
  })

  test('can create task lists', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
    await page.keyboard.press(mod)
    await page.keyboard.type('- [ ] Todo\n- [x] Done')

    const visualEditor = page.locator('[data-testid="visual-editor"]')
    await expect(visualEditor).toContainText('Todo', { timeout: 5000 })
    await expect(visualEditor).toContainText('Done', { timeout: 2000 })
  })

  test('task list checkbox toggle (deferred)', async ({ page }) => {
    test.skip(
      true,
      'TipTap setContent from markdown-it task list HTML may not preserve interactive checkboxes; enable when visual preserves them and syncs back to source'
    )
    await page.goto('/')
    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
    await page.keyboard.press(mod)
    await page.keyboard.type('- [ ] Task')
    await page.waitForTimeout(600)
    const visualEditor = page.locator('[data-testid="visual-editor"]')
    const checkbox = visualEditor.locator('input[type="checkbox"]').first()
    await expect(checkbox).toBeVisible({ timeout: 5000 })
    await checkbox.check()
    await page.waitForTimeout(700)
    await expect(sourceEditor).toContainText('- [x] Task', { timeout: 5000 })
  })
})
