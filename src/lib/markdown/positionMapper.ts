/**
 * Maps positions between markdown source and rendered HTML.
 * Used for scroll synchronization.
 */

export class PositionMapper {
  getMarkdownLineMap(markdown: string): Map<number, number> {
    const lines = markdown.split('\n')
    const totalLines = lines.length
    const map = new Map<number, number>()
    for (let i = 0; i < totalLines; i++) {
      map.set(i, i / totalLines)
    }
    return map
  }

  findHTMLElementForMarkdownLine(
    container: HTMLElement,
    lineNumber: number,
    _markdown: string
  ): HTMLElement | null {
    const allElements = container.querySelectorAll('[data-line]')
    let closestElement: HTMLElement | null = null
    let closestDistance = Infinity
    allElements.forEach((el) => {
      const elLine = parseInt(el.getAttribute('data-line') ?? '0', 10)
      const distance = Math.abs(elLine - lineNumber)
      if (distance < closestDistance) {
        closestDistance = distance
        closestElement = el as HTMLElement
      }
    })
    return closestElement
  }

  getScrollPercentageForElement(
    container: HTMLElement,
    element: HTMLElement
  ): number {
    const containerHeight = container.scrollHeight - container.clientHeight
    const elementTop = element.offsetTop
    if (containerHeight === 0) return 0
    return Math.min(1, Math.max(0, elementTop / containerHeight))
  }

  markdownLineToScrollPercentage(
    lineNumber: number,
    totalLines: number
  ): number {
    return Math.min(1, Math.max(0, lineNumber / totalLines))
  }
}

export const positionMapper = new PositionMapper()
