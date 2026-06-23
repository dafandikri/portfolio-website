import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import SkillsetsDialog from './SkillsetsDialog'

vi.mock('../assets', () => ({
  getSkill: () => 'mock-skill.png',
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

describe('<SkillsetsDialog />', () => {
  it('renders skills from the data layer', () => {
    render(<SkillsetsDialog />)
    // duplicated for the seamless marquee loop, so use getAllByText
    expect(screen.getAllByText('Frontend Development').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AI & Machine Learning').length).toBeGreaterThan(0)
  })
})
