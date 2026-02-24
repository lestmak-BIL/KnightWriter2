import { markdownToHtml } from '../markdown/markdownToHtml'
import { htmlToMarkdown } from '../markdown/htmlToMarkdown'
import { diffEngine } from './diffEngine'
import { useDocumentStore } from '../../store/documentStore'

export class SyncEngine {
  private syncTimeout: ReturnType<typeof setTimeout> | null = null
  private lastMarkdown = ''

  private cancelPendingSync(): void {
    if (this.syncTimeout !== null) {
      clearTimeout(this.syncTimeout)
      this.syncTimeout = null
      useDocumentStore.getState().setPendingSyncCancelled(true)
    }
  }

  private debounce(callback: () => void, delay: number): void {
    this.cancelPendingSync()
    useDocumentStore.getState().setPendingSyncCancelled(false)
    this.syncTimeout = setTimeout(() => {
      const store = useDocumentStore.getState()
      if (!store.pendingSyncCancelled) {
        callback()
      }
      store.setPendingSyncCancelled(false)
      this.syncTimeout = null
    }, delay)
  }

  /**
   * Source → Visual sync. Callback receives HTML to set in TipTap.
   */
  syncSourceToVisual(
    markdown: string,
    callback: (html: string) => void
  ): void {
    this.debounce(() => {
      const store = useDocumentStore.getState()
      if (store.activeEditor !== 'source' || store.isSyncing) return
      if (diffEngine.areEquivalent(markdown, this.lastMarkdown)) return

      store.setIsSyncing(true)
      try {
        const html = markdownToHtml(markdown)
        this.lastMarkdown = markdown
        callback(html)
      } catch (error) {
        console.error('Markdown parse error:', error)
      } finally {
        setTimeout(() => store.setIsSyncing(false), 50)
      }
    }, 300)
  }

  /**
   * Visual → Source sync. Callback receives markdown to set in store/source pane.
   */
  syncVisualToSource(html: string, callback: (markdown: string) => void): void {
    this.debounce(() => {
      const store = useDocumentStore.getState()
      if (store.activeEditor !== 'visual' || store.isSyncing) return

      store.setIsSyncing(true)
      try {
        const markdown = htmlToMarkdown(html)
        if (!diffEngine.areEquivalent(markdown, this.lastMarkdown)) {
          this.lastMarkdown = markdown
          callback(markdown)
        }
      } catch (error) {
        console.error('HTML to markdown conversion error:', error)
      } finally {
        setTimeout(() => store.setIsSyncing(false), 50)
      }
    }, 500)
  }
}

export const syncEngine = new SyncEngine()
