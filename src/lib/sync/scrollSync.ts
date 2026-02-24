import throttle from 'lodash.throttle'
import { useDocumentStore } from '../../store/documentStore'

/**
 * Compute visual scroll position from source scroll position (proportional).
 * Used for scroll sync and testable in isolation.
 */
export function calculateProportionalScroll(
  sourceScroll: number,
  sourceScrollHeight: number,
  visualScrollHeight: number
): number {
  if (sourceScrollHeight <= 0) return 0
  const ratio = sourceScroll / sourceScrollHeight
  const target = ratio * visualScrollHeight
  return Math.max(0, Math.min(visualScrollHeight, target))
}

export class ScrollSyncEngine {
  private sourceScrollHandler: (() => void) | null = null
  private visualScrollHandler: (() => void) | null = null

  initialize(
    sourceElement: HTMLElement,
    visualElement: HTMLElement,
    _getMarkdown: () => string
  ): void {
    this.sourceScrollHandler = throttle(() => {
      const store = useDocumentStore.getState()
      if (
        !store.scrollSyncEnabled ||
        store.isScrolling ||
        store.activeEditor !== 'source'
      )
        return
      const denom =
        sourceElement.scrollHeight - sourceElement.clientHeight
      const scrollPercentage = denom > 0 ? sourceElement.scrollTop / denom : 0
      store.setScrollPosition('source', scrollPercentage)
      this.syncToVisual(visualElement, scrollPercentage)
    }, 16)

    this.visualScrollHandler = throttle(() => {
      const store = useDocumentStore.getState()
      if (
        !store.scrollSyncEnabled ||
        store.isScrolling ||
        store.activeEditor !== 'visual'
      )
        return
      const denom =
        visualElement.scrollHeight - visualElement.clientHeight
      const scrollPercentage = denom > 0 ? visualElement.scrollTop / denom : 0
      store.setScrollPosition('visual', scrollPercentage)
      this.syncToSource(sourceElement, scrollPercentage)
    }, 16)

    sourceElement.addEventListener('scroll', this.sourceScrollHandler)
    visualElement.addEventListener('scroll', this.visualScrollHandler)
  }

  private syncToVisual(
    visualElement: HTMLElement,
    sourcePercentage: number
  ): void {
    const store = useDocumentStore.getState()
    store.setIsScrolling(true)
    const visualScrollHeight =
      visualElement.scrollHeight - visualElement.clientHeight
    const targetScroll = sourcePercentage * visualScrollHeight
    visualElement.scrollTop = targetScroll
    setTimeout(() => store.setIsScrolling(false), 100)
  }

  private syncToSource(
    sourceElement: HTMLElement,
    visualPercentage: number
  ): void {
    const store = useDocumentStore.getState()
    store.setIsScrolling(true)
    const targetScroll =
      visualPercentage *
      (sourceElement.scrollHeight - sourceElement.clientHeight)
    sourceElement.scrollTop = targetScroll
    setTimeout(() => store.setIsScrolling(false), 100)
  }

  cleanup(sourceElement: HTMLElement, visualElement: HTMLElement): void {
    if (this.sourceScrollHandler) {
      sourceElement.removeEventListener('scroll', this.sourceScrollHandler)
      this.sourceScrollHandler = null
    }
    if (this.visualScrollHandler) {
      visualElement.removeEventListener('scroll', this.visualScrollHandler)
      this.visualScrollHandler = null
    }
  }
}

export const scrollSyncEngine = new ScrollSyncEngine()
