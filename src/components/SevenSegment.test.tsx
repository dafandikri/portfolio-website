import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SevenSegment, { SegmentGroup } from './SevenSegment'

describe('SevenSegment', () => {
  it('keeps all seven physical segments visible behind a digit', () => {
    const { container } = render(<SevenSegment value="8" />)
    expect(container.querySelectorAll('polygon')).toHaveLength(7)
    expect(container.querySelectorAll('.segment__on')).toHaveLength(7)
  })

  it('renders an empty position as wholly unlit hardware', () => {
    const { container } = render(<SevenSegment value={null} />)
    expect(container.querySelectorAll('.segment__on')).toHaveLength(0)
    expect(container.querySelectorAll('.segment__off')).toHaveLength(7)
  })

  it('pads a display to its physical width and exposes its source value', () => {
    const { container } = render(<SegmentGroup value="23" length={4} />)
    expect(container.querySelector('.segment-group')).toHaveAttribute('data-display', '23')
    expect(container.querySelectorAll('.segment')).toHaveLength(4)
  })
})
