import { describe, it, expect } from 'vitest'
import { calculateProportionalScroll } from './scrollSync'

describe('calculateProportionalScroll', () => {
  it('calculates proportional scroll position', () => {
    const sourceScroll = 500
    const sourceHeight = 1000
    const visualHeight = 2000
    const result = calculateProportionalScroll(
      sourceScroll,
      sourceHeight,
      visualHeight
    )
    expect(result).toBe(1000)
  })

  it('handles zero height gracefully', () => {
    expect(calculateProportionalScroll(100, 0, 1000)).toBe(0)
  })

  it('clamps scroll to valid range', () => {
    expect(calculateProportionalScroll(2000, 1000, 1000)).toBe(1000)
    expect(calculateProportionalScroll(-100, 1000, 1000)).toBe(0)
  })
})
