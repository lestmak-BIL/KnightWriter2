import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import multimdTable from 'markdown-it-multimd-table'
// @ts-expect-error no types
import markdownItTaskLists from 'markdown-it-task-lists'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})
  .use(multimdTable)
  .use(markdownItTaskLists, { enabled: true, label: true })
  .use(markdownItAnchor, {
    permalink: false,
    slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-'),
  })

// Custom renderers to add line number attributes for scroll sync
md.renderer.rules.heading_open = function (tokens, idx) {
  const token = tokens[idx]
  const line = token.map ? token.map[0] : 0
  return `<${token.tag} data-line="${line}">`
}

md.renderer.rules.paragraph_open = function (tokens, idx) {
  const token = tokens[idx]
  const line = token.map ? token.map[0] : 0
  return `<p data-line="${line}">`
}

md.renderer.rules.bullet_list_open = function (tokens, idx) {
  const token = tokens[idx]
  const line = token.map ? token.map[0] : 0
  return `<ul data-line="${line}">`
}

export function markdownToHtml(markdown: string): string {
  return md.render(markdown)
}

export function parseMarkdown(markdown: string) {
  return md.parse(markdown, {})
}
