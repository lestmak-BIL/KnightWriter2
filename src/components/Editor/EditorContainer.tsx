import { useState, useEffect, useRef, useCallback } from 'react'
import Split from 'react-split'
import { SourcePane } from './SourcePane'
import { VisualPane } from './VisualPane'
import { FormatToolbar } from '../Toolbar/FormatToolbar'
import { useDocumentStore } from '../../store/documentStore'
import { scrollSyncEngine } from '../../lib/sync/scrollSync'
import type { EditorView } from '@codemirror/view'
import type { Editor } from '@tiptap/core'

export function EditorContainer() {
  const [visualElement, setVisualElement] = useState<HTMLElement | null>(null)
  const [sourceElement, setSourceElement] = useState<HTMLElement | null>(null)
  const [pendingVisualHtml, setPendingVisualHtml] = useState<string | null>(null)

  const sourceViewRef = useRef<EditorView | null>(null)
  const visualEditorRef = useRef<Editor | null>(null)

  const setMarkdown = useDocumentStore((s) => s.setMarkdown)

  const handleVisualUpdate = useCallback((html: string) => {
    setPendingVisualHtml(html)
  }, [])

  const handleSourceUpdate = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }, [setMarkdown])

  const handleSourceViewReady = useCallback((view: EditorView) => {
    sourceViewRef.current = view
    setSourceElement(view.scrollDOM)
  }, [])

  const handleVisualEditorReady = useCallback((element: HTMLElement) => {
    setVisualElement(element)
  }, [])

  const handleVisualEditorRef = useCallback((editor: Editor) => {
    visualEditorRef.current = editor
  }, [])

  const handleVisualApplied = useCallback(() => {
    setPendingVisualHtml(null)
  }, [])

  useEffect(() => {
    if (sourceElement && visualElement) {
      scrollSyncEngine.initialize(
        sourceElement,
        visualElement,
        () => useDocumentStore.getState().markdown
      )
      return () => {
        scrollSyncEngine.cleanup(sourceElement, visualElement)
      }
    }
  }, [sourceElement, visualElement])

  return (
    <div className="flex flex-col h-full min-h-0">
      <FormatToolbar
        sourceEditorRef={sourceViewRef}
        visualEditorRef={visualEditorRef}
      />
      <Split
        className="flex flex-1 min-h-0 overflow-hidden"
        sizes={[50, 50]}
        minSize={300}
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        <div className="h-full min-h-0">
          <SourcePane
            onVisualUpdate={handleVisualUpdate}
            onSourceViewReady={handleSourceViewReady}
          />
        </div>
        <VisualPane
          onSourceUpdate={handleSourceUpdate}
          onEditorReady={handleVisualEditorReady}
          pendingVisualHtml={pendingVisualHtml}
          onVisualApplied={handleVisualApplied}
          onVisualEditorReady={handleVisualEditorRef}
        />
      </Split>
    </div>
  )
}
