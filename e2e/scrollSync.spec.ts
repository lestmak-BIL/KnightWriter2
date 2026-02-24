import { test, expect } from '@playwright/test'

const selectAll = async (page: import('@playwright/test').Page) => {
  const mod = process.platform === 'darwin' ? 'Meta+a' : 'Control+a'
  await page.keyboard.press(mod)
}

test.describe('Scroll sync', () => {
  test('scrolling source scrolls visual proportionally', async ({ page }) => {
    await page.goto('/')

    const sourceEditor = page.locator('[data-testid="source-editor"]')
    await sourceEditor.click()
    await selectAll(page)

    const block = '# Heading\n\nParagraph\n\n'
    const lines = Array(50)
      .fill(block)
      .map((_, i) => block.replace('# Heading', `# Heading ${i}`))
    const longDoc = lines.join('')

    await page.keyboard.type(longDoc, { delay: 0 })
    await page.waitForTimeout(500)

    const sourceScrollable = sourceEditor.locator('.cm-scroller').first()
    const sourceEl = (await sourceScrollable.count()) > 0 ? sourceScrollable : sourceEditor

    await sourceEl.evaluate((el) => {
      const scrollHeight = el.scrollHeight - el.clientHeight
      if (scrollHeight > 0) el.scrollTop = scrollHeight / 2
    })

    await page.waitForTimeout(300)

    const visualEditor = page.locator('[data-testid="visual-editor"]')
    const visualProps = await visualEditor.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))
    const maxScroll = visualProps.scrollHeight - visualProps.clientHeight
    const proportion = maxScroll > 0 ? visualProps.scrollTop / maxScroll : 0

    expect(proportion).toBeGreaterThanOrEqual(0.35)
    expect(proportion).toBeLessThanOrEqual(0.65)
  })
})
