import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

type Diff = [number, string]

/**
 * Apply diff-based updates to avoid regenerating entire HTML.
 * Prevents flickering and preserves cursor position better.
 */
export class DiffEngine {
  computeDiff(oldText: string, newText: string): Diff[] {
    return dmp.diff_main(oldText, newText)
  }

  applyHTMLDiff(
    element: HTMLElement,
    oldMarkdown: string,
    newMarkdown: string,
    markdownToHtml: (md: string) => string
  ): void {
    const diffs = this.computeDiff(oldMarkdown, newMarkdown)
    const totalLength = oldMarkdown.length + newMarkdown.length
    const changeSize = diffs.reduce(
      (sum, [op, text]) => (op !== 0 ? sum + text.length : sum),
      0
    )
    const changePercentage = totalLength > 0 ? changeSize / totalLength : 0
    if (changePercentage > 0.3) {
      element.innerHTML = markdownToHtml(newMarkdown)
    } else {
      element.innerHTML = markdownToHtml(newMarkdown)
    }
  }

  areEquivalent(md1: string, md2: string): boolean {
    return md1.trim() === md2.trim()
  }
}

export const diffEngine = new DiffEngine()
