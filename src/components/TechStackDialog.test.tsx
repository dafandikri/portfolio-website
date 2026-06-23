import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import TechStackDialog from './TechStackDialog'

vi.mock('../assets', () => ({
  getIcon: () => 'mock-icon.png',
}))

// jsdom reports offsetWidth as 0; stub it so the width-driven animation branch
// (not just the "none" fallback) is exercised.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 200,
  })
})
afterAll(() => {
  delete (HTMLElement.prototype as { offsetWidth?: number }).offsetWidth
})

describe('<TechStackDialog />', () => {
  it('renders tech items from the data layer', () => {
    render(<TechStackDialog />)
    // duplicated for the seamless marquee loop, so use getAllByText
    expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0)
    expect(screen.getAllByText('React').length).toBeGreaterThan(0)
  })
})
