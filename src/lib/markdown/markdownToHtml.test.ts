import { describe, it, expect } from 'vitest'
import { markdownToHtml } from './markdownToHtml'

describe('markdownToHtml', () => {
  it('converts basic markdown to HTML', () => {
    expect(markdownToHtml('# Hello')).toContain('<h1')
    expect(markdownToHtml('# Hello')).toContain('Hello</h1>')
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>')
  })

  it('renders heading', () => {
    expect(markdownToHtml('# Hello')).toContain('<h1')
    expect(markdownToHtml('# Hello')).toContain('Hello')
  })

  it('renders bold', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>')
  })

  it('renders italic', () => {
    expect(markdownToHtml('*italic*')).toContain('<em>')
  })

  it('renders paragraph', () => {
    const html = markdownToHtml('Hello world')
    expect(html).toMatch(/<p[\s>]/)
    expect(html).toContain('Hello world')
  })

  it('adds data-line for scroll sync', () => {
    const html = markdownToHtml('# Line 0\n\nPara')
    expect(html).toContain('data-line')
  })

  it('preserves code blocks with syntax', () => {
    const code = '```js\nconst x = 1;\n```'
    const html = markdownToHtml(code)
    expect(html).toContain('language-js')
    expect(html).toContain('const x = 1;')
  })

  it('handles empty input', () => {
    expect(markdownToHtml('')).toBe('')
  })

  it('handles malformed markdown gracefully', () => {
    expect(() => markdownToHtml('**unclosed bold')).not.toThrow()
  })

  it('handles raw HTML input without throwing', () => {
    const input = '<script>alert("xss")</script>'
    expect(() => markdownToHtml(input)).not.toThrow()
    // Note: markdown-it with html:true may pass through raw HTML; consider adding DOMPurify for sanitization
  })
})
