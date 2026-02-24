import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '*',
  emDelimiter: '*',
  strongDelimiter: '**',
})

turndownService.use(gfm)

turndownService.addRule('lineBreak', {
  filter: 'br',
  replacement: () => '\n',
})

turndownService.addRule('preserveCodeBlocks', {
  filter: (node) => {
    return node.nodeName === 'CODE' && node.parentNode?.nodeName === 'PRE'
  },
  replacement: (content) => content,
})

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}
