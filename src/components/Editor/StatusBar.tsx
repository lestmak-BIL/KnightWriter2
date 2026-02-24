import { useDocumentStore } from '../../store/documentStore'
import { Link2, Link2Off, Clock } from 'lucide-react'

function formatLastSaved(date: Date | null): string {
  if (!date) return 'Never'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  return date.toLocaleTimeString()
}

export function StatusBar() {
  const markdown = useDocumentStore((s) => s.markdown)
  const activeEditor = useDocumentStore((s) => s.activeEditor)
  const isSyncing = useDocumentStore((s) => s.isSyncing)
  const isDirty = useDocumentStore((s) => s.isDirty)
  const scrollSyncEnabled = useDocumentStore((s) => s.scrollSyncEnabled)
  const setScrollSyncEnabled = useDocumentStore((s) => s.setScrollSyncEnabled)
  const lastSaved = useDocumentStore((s) => s.lastSaved)
  const fileName = useDocumentStore((s) => s.fileName)

  const wordCount = markdown.split(/\s+/).filter(Boolean).length
  const charCount = markdown.length
  const lineCount = markdown.split('\n').length

  return (
    <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-xs text-gray-600 shrink-0">
      <div className="flex items-center gap-4">
        <span>
          Active: <span className="font-semibold capitalize">{activeEditor}</span>
        </span>
        {isSyncing && (
          <span className="text-blue-600 font-medium animate-pulse">
            ● Syncing...
          </span>
        )}
        {isDirty && (
          <span className="text-orange-600 font-medium">● Unsaved</span>
        )}
        {!isDirty && lastSaved && (
          <span className="text-green-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Saved {formatLastSaved(lastSaved)}</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setScrollSyncEnabled(!scrollSyncEnabled)}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            scrollSyncEnabled
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'hover:bg-gray-200'
          }`}
          title={scrollSyncEnabled ? 'Disable scroll sync' : 'Enable scroll sync'}
        >
          {scrollSyncEnabled ? (
            <>
              <Link2 className="w-3 h-3" />
              <span>Scroll sync</span>
            </>
          ) : (
            <>
              <Link2Off className="w-3 h-3" />
              <span>Independent</span>
            </>
          )}
        </button>
      </div>
      <div className="flex items-center gap-4">
        {fileName && (
          <span className="text-gray-500">{fileName}</span>
        )}
        <span>
          Words: <span className="font-semibold">{wordCount}</span>
        </span>
        <span>
          Chars: <span className="font-semibold">{charCount}</span>
        </span>
        <span>
          Lines: <span className="font-semibold">{lineCount}</span>
        </span>
      </div>
    </div>
  )
}
