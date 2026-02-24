import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Link from '@tiptap/extension-link'
import { createLowlight } from 'lowlight'

const lowlight = createLowlight()
import { useDocumentStore } from '../../store/documentStore'
import { syncEngine } from '../../lib/sync/syncEngine'
import { markdownToHtml } from '../../lib/markdown/markdownToHtml'
import type { Editor } from '@tiptap/core'

interface VisualPaneProps {
  onSourceUpdate: (markdown: string) => void
  onEditorReady: (element: HTMLElement) => void
  pendingVisualHtml: string | null
  onVisualApplied: () => void
  onVisualEditorReady?: (editor: Editor) => void
}

export function VisualPane({
  onSourceUpdate,
  onEditorReady,
  pendingVisualHtml,
  onVisualApplied,
  onVisualEditorReady,
}: VisualPaneProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const markdown = useDocumentStore((s) => s.markdown)
  const activeEditor = useDocumentStore((s) => s.activeEditor)
  const isSyncing = useDocumentStore((s) => s.isSyncing)
  const setActiveEditor = useDocumentStore((s) => s.setActiveEditor)
  const updateCurrentFormats = useDocumentStore((s) => s.updateCurrentFormats)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: markdownToHtml(markdown),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-full',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isSyncing || activeEditor !== 'visual') return
      const html = ed.getHTML()
      syncEngine.syncVisualToSource(html, (newMarkdown) => {
        onSourceUpdate(newMarkdown)
      })
    },
    onFocus: () => setActiveEditor('visual'),
    onSelectionUpdate: ({ editor: ed }) => {
      const formats = new Set<string>()
      if (ed.isActive('bold')) formats.add('bold')
      if (ed.isActive('italic')) formats.add('italic')
      if (ed.isActive('strike')) formats.add('strike')
      if (ed.isActive('code')) formats.add('code')
      if (ed.isActive('heading', { level: 1 })) formats.add('h1')
      if (ed.isActive('heading', { level: 2 })) formats.add('h2')
      if (ed.isActive('heading', { level: 3 })) formats.add('h3')
      if (ed.isActive('bulletList')) formats.add('list')
      if (ed.isActive('orderedList')) formats.add('orderedList')
      if (ed.isActive('taskList')) formats.add('taskList')
      if (ed.isActive('link')) formats.add('link')
      updateCurrentFormats(formats)
    },
  })

  useEffect(() => {
    if (editor) onVisualEditorReady?.(editor)
  }, [editor, onVisualEditorReady])

  useEffect(() => {
    const el = editorContainerRef.current
    if (el) onEditorReady(el)
  }, [onEditorReady])

  useEffect(() => {
    if (editor && pendingVisualHtml !== null) {
      editor.commands.setContent(pendingVisualHtml, false)
      onVisualApplied()
    }
  }, [editor, pendingVisualHtml, onVisualApplied])

  // --- SMOKE TEST FIX (v1.0): New document must clear the preview pane. Do not remove. ---
  // useEditor’s content is initial-only; when store markdown becomes '' (e.g. New doc), the visual
  // would otherwise keep showing old content until the user typed in source. This effect clears it.
  // See docs/AUDIT_TRAIL.md Iteration 5.
  useEffect(() => {
    if (markdown === '' && editor) {
      editor.commands.setContent(markdownToHtml(''), false)
    }
  }, [markdown, editor])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span
          className={`text-sm font-medium ${
            activeEditor === 'visual' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          Formatted Preview {activeEditor === 'visual' && '●'}
        </span>
      </div>
      <div
        ref={editorContainerRef}
        className="flex-1 overflow-auto bg-white min-h-0"
        data-testid="visual-editor"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
