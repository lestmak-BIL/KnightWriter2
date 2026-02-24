import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light' })
  })

  it('setTheme switches theme', () => {
    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
    useUIStore.getState().setTheme('light')
    expect(useUIStore.getState().theme).toBe('light')
  })
})
