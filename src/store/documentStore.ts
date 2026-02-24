import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { EditorType, ScrollPosition } from '../types'

interface DocumentState {
  markdown: string
  isDirty: boolean
  fileName: string | null
  lastSaved: Date | null
  activeEditor: EditorType
  isSyncing: boolean
  pendingSyncCancelled: boolean
  scrollPosition: ScrollPosition
  scrollSyncEnabled: boolean
  isScrolling: boolean
  currentFormats: Set<string>
  setMarkdown: (markdown: string) => void
  updateFromSource: (markdown: string) => void
  updateFromVisual: (_html: string) => void
  setActiveEditor: (editor: EditorType) => void
  setIsSyncing: (syncing: boolean) => void
  setPendingSyncCancelled: (cancelled: boolean) => void
  setDirty: (dirty: boolean) => void
  setFileName: (name: string | null) => void
  setScrollPosition: (editor: EditorType, position: number) => void
  setScrollSyncEnabled: (enabled: boolean) => void
  setIsScrolling: (scrolling: boolean) => void
  updateCurrentFormats: (formats: Set<string>) => void
  newDocument: () => void
  markSaved: () => void
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set) => ({
        markdown: '# Welcome to KnightWriter\n\nStart typing in either pane...',
        isDirty: false,
        fileName: null,
        lastSaved: null,
        activeEditor: 'source',
        isSyncing: false,
        pendingSyncCancelled: false,
        scrollPosition: { source: 0, visual: 0 },
        scrollSyncEnabled: true,
        isScrolling: false,
        currentFormats: new Set(),

        setMarkdown: (markdown) => set({ markdown, isDirty: true }),

        updateFromSource: (markdown) =>
          set({
            markdown,
            isDirty: true,
            pendingSyncCancelled: false,
          }),

        updateFromVisual: () => {
          set({ isDirty: true, pendingSyncCancelled: false })
        },

        setActiveEditor: (editor) => set({ activeEditor: editor }),
        setIsSyncing: (syncing) => set({ isSyncing: syncing }),
        setPendingSyncCancelled: (cancelled) =>
          set({ pendingSyncCancelled: cancelled }),
        setDirty: (dirty) => set({ isDirty: dirty }),
        setFileName: (name) => set({ fileName: name }),

        setScrollPosition: (editor, position) =>
          set((state) => ({
            scrollPosition: {
              ...state.scrollPosition,
              [editor]: position,
            },
          })),

        setScrollSyncEnabled: (enabled) => set({ scrollSyncEnabled: enabled }),
        setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
        updateCurrentFormats: (formats) => set({ currentFormats: formats }),

        newDocument: () =>
          set({
            markdown: '',
            isDirty: false,
            fileName: null,
            lastSaved: null,
          }),

        markSaved: () =>
          set({
            isDirty: false,
            lastSaved: new Date(),
          }),
      }),
      {
        name: 'knightwriter-storage',
        partialize: (state) => ({
          markdown: state.markdown,
          scrollSyncEnabled: state.scrollSyncEnabled,
        }),
      }
    )
  )
)
