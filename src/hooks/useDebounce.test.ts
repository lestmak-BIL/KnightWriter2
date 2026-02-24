import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes callback after wait ms', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 300))
    act(() => {
      result.current('arg')
    })
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg')
  })

  it('cancels previous invocation on rapid calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(
      ({ wait }) => useDebounce(callback, wait),
      { initialProps: { wait: 300 } }
    )
    act(() => {
      result.current('first')
    })
    act(() => {
      result.current('second')
    })
    act(() => {
      result.current('third')
    })
    vi.advanceTimersByTime(300)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('third')
  })

  it('uses updated wait when delay changes', () => {
    const callback = vi.fn()
    const { result, rerender } = renderHook(
      ({ wait }) => useDebounce(callback, wait),
      { initialProps: { wait: 300 } }
    )
    act(() => {
      result.current()
    })
    rerender({ wait: 100 })
    act(() => {
      result.current()
    })
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
