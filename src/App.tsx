import { EditorContainer } from './components/Editor/EditorContainer'
import { StatusBar } from './components/Editor/StatusBar'
import { useDocumentStore } from './store/documentStore'
import { FileText, Save, FolderOpen, FilePlus } from 'lucide-react'

function App() {
  const fileName = useDocumentStore((s) => s.fileName)
  const isDirty = useDocumentStore((s) => s.isDirty)
  const newDocument = useDocumentStore((s) => s.newDocument)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">KnightWriter</h1>
            {fileName != null && (
              <span className="text-sm text-gray-600">{fileName}</span>
            )}
            {isDirty && (
              <span className="text-sm text-orange-600 font-medium">●</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newDocument}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="New Document"
            >
              <FilePlus className="w-4 h-4" />
              <span>New</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded opacity-50 cursor-not-allowed"
              title="Open (Phase 2)"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded opacity-50 cursor-not-allowed"
              title="Save (Phase 2)"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 flex flex-col">
        <EditorContainer />
      </main>
      <StatusBar />
    </div>
  )
}

export default App
