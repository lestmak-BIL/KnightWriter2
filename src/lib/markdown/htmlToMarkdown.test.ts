import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from './htmlToMarkdown'
import { markdownToHtml } from './markdownToHtml'

describe('htmlToMarkdown', () => {
  it('converts basic HTML to markdown', () => {
    expect(htmlToMarkdown('<h1>Hello</h1>')).toContain('# Hello')
    expect(htmlToMarkdown('<p><strong>bold</strong></p>')).toContain('**bold**')
  })

  it('converts paragraph', () => {
    expect(htmlToMarkdown('<p>Hello</p>')).toContain('Hello')
  })

  it('converts strong to **', () => {
    const md = htmlToMarkdown('<p><strong>bold</strong></p>')
    expect(md).toContain('**bold**')
  })

  it('handles nested structures', () => {
    const html = '<ul><li><strong>Bold</strong> item</li></ul>'
    expect(htmlToMarkdown(html)).toContain('**Bold**')
    expect(htmlToMarkdown(html)).toContain('item')
  })

  it('handles empty input', () => {
    expect(htmlToMarkdown('')).toBe('')
  })

  it('round-trip: markdown to html to markdown', () => {
    const original = '# Title\n\n**bold** and *italic*'
    const html = markdownToHtml(original)
    const back = htmlToMarkdown(html)
    expect(back).toContain('Title')
    expect(back).toContain('**bold**')
    expect(back).toContain('*italic*')
  })
})
