import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDocumentStore } from '../../src/store/documentStore'
import { SyncEngine } from '../../src/lib/sync/syncEngine'

describe('Regression tests', () => {
  let engine: SyncEngine

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new SyncEngine()
    useDocumentStore.setState({
      activeEditor: 'source',
      isSyncing: false,
      pendingSyncCancelled: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pending sync cancellation does not prevent next sync from running', () => {
    const callback = vi.fn()
    engine.syncSourceToVisual('# First', callback)
    engine.syncSourceToVisual('# Second', callback)
    vi.advanceTimersByTime(350)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.stringContaining('Second'))
  })
})
