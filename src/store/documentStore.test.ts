import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentStore } from './documentStore'

describe('documentStore', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      markdown: '',
      isDirty: false,
      currentFormats: new Set(),
      activeEditor: 'source',
      scrollSyncEnabled: true,
    })
  })

  it('setMarkdown updates content and marks dirty', () => {
    useDocumentStore.getState().setMarkdown('# New content')
    expect(useDocumentStore.getState().markdown).toBe('# New content')
    expect(useDocumentStore.getState().isDirty).toBe(true)
  })

  it('updateCurrentFormats sets formats', () => {
    useDocumentStore.getState().updateCurrentFormats(new Set(['bold', 'italic']))
    expect(useDocumentStore.getState().currentFormats.has('bold')).toBe(true)
    expect(useDocumentStore.getState().currentFormats.has('italic')).toBe(true)
    useDocumentStore.getState().updateCurrentFormats(new Set())
    expect(useDocumentStore.getState().currentFormats.size).toBe(0)
  })

  it('setDirty updates dirty state', () => {
    useDocumentStore.getState().setDirty(true)
    expect(useDocumentStore.getState().isDirty).toBe(true)
    useDocumentStore.getState().setDirty(false)
    expect(useDocumentStore.getState().isDirty).toBe(false)
  })

  it('setActiveEditor switches active pane', () => {
    useDocumentStore.getState().setActiveEditor('source')
    expect(useDocumentStore.getState().activeEditor).toBe('source')
    useDocumentStore.getState().setActiveEditor('visual')
    expect(useDocumentStore.getState().activeEditor).toBe('visual')
  })

  it('setScrollSyncEnabled toggles scroll sync', () => {
    useDocumentStore.getState().setScrollSyncEnabled(false)
    expect(useDocumentStore.getState().scrollSyncEnabled).toBe(false)
    useDocumentStore.getState().setScrollSyncEnabled(true)
    expect(useDocumentStore.getState().scrollSyncEnabled).toBe(true)
  })

  it('markSaved clears dirty and sets lastSaved', () => {
    useDocumentStore.getState().setMarkdown('# Changed')
    expect(useDocumentStore.getState().isDirty).toBe(true)
    useDocumentStore.getState().markSaved()
    expect(useDocumentStore.getState().isDirty).toBe(false)
    expect(useDocumentStore.getState().lastSaved).toBeInstanceOf(Date)
  })

  it('newDocument resets document state', () => {
    useDocumentStore.getState().setMarkdown('# Content')
    useDocumentStore.getState().setFileName('test.md')
    useDocumentStore.getState().newDocument()
    expect(useDocumentStore.getState().markdown).toBe('')
    expect(useDocumentStore.getState().isDirty).toBe(false)
    expect(useDocumentStore.getState().fileName).toBe(null)
  })
})
