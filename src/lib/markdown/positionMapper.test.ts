import { describe, it, expect } from 'vitest'
import { positionMapper } from './positionMapper'

describe('PositionMapper', () => {
  it('getMarkdownLineMap returns map of line to percentage', () => {
    const md = 'line0\nline1\nline2'
    const map = positionMapper.getMarkdownLineMap(md)
    expect(map.get(0)).toBe(0)
    expect(map.get(1)).toBeCloseTo(1 / 3)
    expect(map.get(2)).toBeCloseTo(2 / 3)
  })

  it('markdownLineToScrollPercentage clamps to 0-1', () => {
    expect(positionMapper.markdownLineToScrollPercentage(0, 10)).toBe(0)
    expect(positionMapper.markdownLineToScrollPercentage(5, 10)).toBe(0.5)
    expect(
      positionMapper.markdownLineToScrollPercentage(10, 10)
    ).toBeLessThanOrEqual(1)
  })

  it('getScrollPercentageForElement returns 0 when container has no scrollable height', () => {
    const container = document.createElement('div')
    const child = document.createElement('div')
    // Empty container: in jsdom scrollHeight and clientHeight are 0, so containerHeight is 0
    expect(positionMapper.getScrollPercentageForElement(container, child)).toBe(
      0
    )
  })

  it('findHTMLElementForMarkdownLine returns element with data-line', () => {
    const container = document.createElement('div')
    const el = document.createElement('p')
    el.setAttribute('data-line', '2')
    container.appendChild(el)
    const found = positionMapper.findHTMLElementForMarkdownLine(
      container,
      2,
      ''
    )
    expect(found).toBe(el)
  })
})
