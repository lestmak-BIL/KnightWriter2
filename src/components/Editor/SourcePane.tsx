import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown as markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useDocumentStore } from '../../store/documentStore'
import { syncEngine } from '../../lib/sync/syncEngine'

interface SourcePaneProps {
  onVisualUpdate: (html: string) => void
  onSourceViewReady?: (view: EditorView) => void
}

export function SourcePane({ onVisualUpdate, onSourceViewReady }: SourcePaneProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  const storeMarkdown = useDocumentStore((s) => s.markdown)
  const activeEditor = useDocumentStore((s) => s.activeEditor)
  const isSyncing = useDocumentStore((s) => s.isSyncing)
  const setActiveEditor = useDocumentStore((s) => s.setActiveEditor)
  const updateFromSource = useDocumentStore((s) => s.updateFromSource)

  useEffect(() => {
    const container = editorRef.current
    if (!container) return

    const initialMarkdown = useDocumentStore.getState().markdown
    const startState = EditorState.create({
      doc: initialMarkdown,
      extensions: [
        lineNumbers(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        markdownLanguage(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          const store = useDocumentStore.getState()
          if (store.isSyncing || store.activeEditor !== 'source') return
          const newMarkdown = update.state.doc.toString()
          updateFromSource(newMarkdown)
          syncEngine.syncSourceToVisual(newMarkdown, onVisualUpdate)
        }),
        EditorView.domEventHandlers({
          focus: () => setActiveEditor('source'),
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: container,
    })
    viewRef.current = view
    onSourceViewReady?.(view)

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [onVisualUpdate, onSourceViewReady, updateFromSource, setActiveEditor])

  useEffect(() => {
    const view = viewRef.current
    if (!view || activeEditor !== 'visual' || isSyncing) return
    const currentDoc = view.state.doc.toString()
    if (currentDoc !== storeMarkdown) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: storeMarkdown },
      })
    }
  }, [storeMarkdown, activeEditor, isSyncing])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span
          className={`text-sm font-medium ${
            activeEditor === 'source' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          Markdown Source {activeEditor === 'source' && '●'}
        </span>
      </div>
      <div
        ref={editorRef}
        className="flex-1 overflow-auto min-h-0"
        data-testid="source-editor"
      />
    </div>
  )
}
