import { describe, it, expect } from 'vitest'
import { diffEngine } from './diffEngine'

describe('diffEngine', () => {
  it('computeDiff returns diffs', () => {
    const diffs = diffEngine.computeDiff('hello', 'world')
    expect(Array.isArray(diffs)).toBe(true)
    expect(diffs.length).toBeGreaterThan(0)
  })

  it('areEquivalent returns true for same trimmed content', () => {
    expect(diffEngine.areEquivalent('  foo  ', 'foo')).toBe(true)
    expect(diffEngine.areEquivalent('foo', 'foo')).toBe(true)
  })

  it('areEquivalent returns false for different content', () => {
    expect(diffEngine.areEquivalent('foo', 'bar')).toBe(false)
  })
})
