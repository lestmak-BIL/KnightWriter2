import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Quote,
} from 'lucide-react'
import { useDocumentStore } from '../../store/documentStore'
import { ToolbarButton } from './ToolbarButton'
import type { EditorView } from '@codemirror/view'
import type { Editor } from '@tiptap/core'

interface FormatToolbarProps {
  sourceEditorRef: RefObject<EditorView | null>
  visualEditorRef: RefObject<Editor | null>
}

export function FormatToolbar({
  sourceEditorRef,
  visualEditorRef,
}: FormatToolbarProps) {
  const activeEditor = useDocumentStore((s) => s.activeEditor)
  const currentFormats = useDocumentStore((s) => s.currentFormats)

  const applyFormat = (format: string) => {
    const sourceEditor = sourceEditorRef.current
    const visualEditor = visualEditorRef.current

    if (activeEditor === 'source' && sourceEditor) {
      const state = sourceEditor.state
      const selection = state.selection.main
      const selectedText = state.doc.sliceString(selection.from, selection.to)

      let newText = ''
      let cursorOffset = 0
      switch (format) {
        case 'bold':
          newText = `**${selectedText}**`
          cursorOffset = 2
          break
        case 'italic':
          newText = `*${selectedText}*`
          cursorOffset = 1
          break
        case 'strike':
          newText = `~~${selectedText}~~`
          cursorOffset = 2
          break
        case 'code':
          newText = `\`${selectedText}\``
          cursorOffset = 1
          break
        case 'h1':
          newText = `# ${selectedText}`
          cursorOffset = 2
          break
        case 'h2':
          newText = `## ${selectedText}`
          cursorOffset = 3
          break
        case 'h3':
          newText = `### ${selectedText}`
          cursorOffset = 4
          break
        case 'list':
          newText = `* ${selectedText}`
          cursorOffset = 2
          break
        case 'orderedList':
          newText = `1. ${selectedText}`
          cursorOffset = 3
          break
        case 'taskList':
          newText = `- [ ] ${selectedText}`
          cursorOffset = 6
          break
        case 'link':
          newText = `[${selectedText}](url)`
          cursorOffset = 1
          break
        case 'quote':
          newText = `> ${selectedText}`
          cursorOffset = 2
          break
        default:
          return
      }

      sourceEditor.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: newText,
        },
        selection: {
          anchor: selection.from + cursorOffset,
          head: selection.from + cursorOffset + selectedText.length,
        },
      })
      sourceEditor.focus()
    } else if (activeEditor === 'visual' && visualEditor) {
      switch (format) {
        case 'bold':
          visualEditor.chain().focus().toggleBold().run()
          break
        case 'italic':
          visualEditor.chain().focus().toggleItalic().run()
          break
        case 'strike':
          visualEditor.chain().focus().toggleStrike().run()
          break
        case 'code':
          visualEditor.chain().focus().toggleCode().run()
          break
        case 'h1':
          visualEditor.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'h2':
          visualEditor.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'h3':
          visualEditor.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 'list':
          visualEditor.chain().focus().toggleBulletList().run()
          break
        case 'orderedList':
          visualEditor.chain().focus().toggleOrderedList().run()
          break
        case 'taskList':
          visualEditor.chain().focus().toggleTaskList().run()
          break
        case 'link': {
          const url = window.prompt('Enter URL:')
          if (url) {
            visualEditor.chain().focus().setLink({ href: url }).run()
          }
          break
        }
        case 'quote':
          visualEditor.chain().focus().toggleBlockquote().run()
          break
      }
    }
  }

  // --- SMOKE TEST FIX (v1.0): Keyboard shortcuts in both panes. Do not remove. ---
  // Ref so the keydown handler always calls the latest applyFormat (depends on activeEditor and refs).
  const applyFormatRef = useRef(applyFormat)
  applyFormatRef.current = applyFormat

  // Global Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic), Cmd/Ctrl+S (save). Added because shortcuts
  // did not work in the preview pane; capture phase (true) + stopPropagation ensures we run before
  // TipTap/ProseMirror and handle the key for both source and visual. Cmd+S: preventDefault only
  // (Save not implemented). See docs/AUDIT_TRAIL.md Iteration 5.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        e.stopPropagation()
        applyFormatRef.current('bold')
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        e.stopPropagation()
        applyFormatRef.current('italic')
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        return
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [])

  const isActive = (format: string) => currentFormats.has(format)

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto shrink-0">
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Bold className="w-4 h-4" />}
          label="Bold (Ctrl+B)"
          onClick={() => applyFormat('bold')}
          isActive={isActive('bold')}
          data-testid="bold-button"
        />
        <ToolbarButton
          icon={<Italic className="w-4 h-4" />}
          label="Italic (Ctrl+I)"
          onClick={() => applyFormat('italic')}
          isActive={isActive('italic')}
        />
        <ToolbarButton
          icon={<Strikethrough className="w-4 h-4" />}
          label="Strikethrough"
          onClick={() => applyFormat('strike')}
          isActive={isActive('strike')}
        />
        <ToolbarButton
          icon={<Code className="w-4 h-4" />}
          label="Inline Code"
          onClick={() => applyFormat('code')}
          isActive={isActive('code')}
        />
      </div>
      <div className="w-px h-6 bg-gray-300 mx-2" />
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Heading1 className="w-4 h-4" />}
          label="Heading 1"
          onClick={() => applyFormat('h1')}
          isActive={isActive('h1')}
        />
        <ToolbarButton
          icon={<Heading2 className="w-4 h-4" />}
          label="Heading 2"
          onClick={() => applyFormat('h2')}
          isActive={isActive('h2')}
        />
        <ToolbarButton
          icon={<Heading3 className="w-4 h-4" />}
          label="Heading 3"
          onClick={() => applyFormat('h3')}
          isActive={isActive('h3')}
        />
      </div>
      <div className="w-px h-6 bg-gray-300 mx-2" />
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<List className="w-4 h-4" />}
          label="Bullet List"
          onClick={() => applyFormat('list')}
          isActive={isActive('list')}
        />
        <ToolbarButton
          icon={<ListOrdered className="w-4 h-4" />}
          label="Numbered List"
          onClick={() => applyFormat('orderedList')}
          isActive={isActive('orderedList')}
        />
        <ToolbarButton
          icon={<CheckSquare className="w-4 h-4" />}
          label="Task List"
          onClick={() => applyFormat('taskList')}
          isActive={isActive('taskList')}
        />
      </div>
      <div className="w-px h-6 bg-gray-300 mx-2" />
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={<Link className="w-4 h-4" />}
          label="Insert Link"
          onClick={() => applyFormat('link')}
          isActive={isActive('link')}
        />
        <ToolbarButton
          icon={<Quote className="w-4 h-4" />}
          label="Quote"
          onClick={() => applyFormat('quote')}
          isActive={isActive('quote')}
        />
        <ToolbarButton
          icon={<Image className="w-4 h-4" />}
          label="Insert Image (Phase 2)"
          onClick={() => {}}
          disabled
        />
      </div>
    </div>
  )
}
