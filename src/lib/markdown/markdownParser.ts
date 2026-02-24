import { parseMarkdown } from './markdownToHtml'

/**
 * Thin wrapper around markdown-it parse for AST/position mapping.
 */
export function parse(markdown: string) {
  return parseMarkdown(markdown)
}
