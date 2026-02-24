import { describe, it, expect } from 'vitest'
import { markdownToHtml } from './markdownToHtml'
import { htmlToMarkdown } from './htmlToMarkdown'

describe('Markdown round-trip fidelity', () => {
  const exactMatchCases = [
    '# Heading 1\n\n## Heading 2',
    '**bold** and *italic* and ***both***',
    '```javascript\nconst x = 1;\n```',
    '[Link](https://example.com)',
    '> Blockquote\n> Multiple lines',
    'Inline `code` text',
  ]

  exactMatchCases.forEach((markdown) => {
    it(`preserves: ${markdown.substring(0, 30)}...`, () => {
      const html = markdownToHtml(markdown)
      const result = htmlToMarkdown(html)
      expect(result.trim()).toBe(markdown.trim())
    })
  })

  it('preserves ordered list content (format may differ)', () => {
    const markdown = '1. Ordered\n2. List'
    const html = markdownToHtml(markdown)
    const result = htmlToMarkdown(html)
    expect(result).toContain('Ordered')
    expect(result).toContain('List')
  })

  it('preserves horizontal rule as thematic break', () => {
    const markdown = '---'
    const html = markdownToHtml(markdown)
    const result = htmlToMarkdown(html)
    expect(html).toMatch(/<hr|<\/hr>|\* \* \*/)
    expect(result.trim()).toMatch(/---|\* \* \*/)
  })

  it('handles complex nested document and preserves content', () => {
    const markdown = `
# Document Title

## Section 1

This is **bold** and *italic*.

- Item 1
- Item 2
  - Nested item

### Subsection

\`\`\`typescript
function test() {
  return true;
}
\`\`\`

> Quote here

[Link](https://example.com)
    `.trim()

    const html = markdownToHtml(markdown)
    const result = htmlToMarkdown(html)
    expect(result).toContain('# Document Title')
    expect(result).toContain('## Section 1')
    expect(result).toContain('**bold**')
    expect(result).toContain('*italic*')
    expect(result).toContain('Item 1')
    expect(result).toContain('Item 2')
    expect(result).toContain('Nested item')
    expect(result).toContain('```typescript')
    expect(result).toContain('Quote here')
    expect(result).toContain('https://example.com')
  })
})
