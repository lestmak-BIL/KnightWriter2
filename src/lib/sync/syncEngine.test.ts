import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SyncEngine } from './syncEngine'
import { useDocumentStore } from '../../store/documentStore'

describe('SyncEngine', () => {
  let engine: SyncEngine
  const initialStoreState = {
    activeEditor: 'source' as const,
    isSyncing: false,
    pendingSyncCancelled: false,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new SyncEngine()
    useDocumentStore.setState(initialStoreState)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls callback with HTML when source is active and not syncing', () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'source', isSyncing: false })
    engine.syncSourceToVisual('# Test', callback)
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(350)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.stringContaining('Test'))
  })

  it('does not call callback when already syncing', () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'source', isSyncing: true })
    engine.syncSourceToVisual('# Test', callback)
    vi.advanceTimersByTime(350)
    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback when visual editor is active', () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'visual' })
    engine.syncSourceToVisual('# Test', callback)
    vi.advanceTimersByTime(350)
    expect(callback).not.toHaveBeenCalled()
  })

  it('sets and unsets isSyncing flag', async () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'source', isSyncing: false })
    engine.syncSourceToVisual('# Test', callback)
    vi.advanceTimersByTime(300)
    expect(useDocumentStore.getState().isSyncing).toBe(true)
    vi.advanceTimersByTime(50)
    expect(useDocumentStore.getState().isSyncing).toBe(false)
  })

  it('cancels pending sync when new one arrives (only last callback runs)', () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'source' })
    engine.syncSourceToVisual('# First', callback)
    engine.syncSourceToVisual('# Second', callback)
    vi.advanceTimersByTime(350)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.stringContaining('Second'))
  })

  it('debounces rapid changes', () => {
    const callback = vi.fn()
    useDocumentStore.setState({ activeEditor: 'source' })
    engine.syncSourceToVisual('# 1', callback)
    engine.syncSourceToVisual('# 2', callback)
    engine.syncSourceToVisual('# 3', callback)
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(350)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.stringContaining('3'))
  })
})
