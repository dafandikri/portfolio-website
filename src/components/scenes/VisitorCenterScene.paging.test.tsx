import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { awardsData } from '../../data/awards'

/**
 * Paging only exists past a full spread, which the real data does not reach.
 * Stubbing the module is the only way to exercise the branch that visitors will
 * hit the moment a third award is added.
 */
vi.mock('../../data/awards', async () => {
  const actual = await vi.importActual<typeof import('../../data/awards')>('../../data/awards')
  const first = actual.awardsData[0]!
  const second = actual.awardsData[1]!
  return {
    awardsData: [
      first,
      second,
      { ...first, title: 'Third Award', event: 'Third Event 2026' },
    ],
  }
})

const VisitorCenterScene = (await import('./VisitorCenterScene')).default

afterEach(cleanup)

describe('VisitorCenterScene paging', () => {
  it('offers controls once the awards outgrow a single spread', () => {
    expect(awardsData).toHaveLength(3)
    render(<VisitorCenterScene />)

    expect(screen.getByRole('navigation', { name: 'Award pages' })).toBeInTheDocument()
    expect(screen.getByText('Spread 1 of 2')).toBeInTheDocument()
  })

  it('shows one spread at a time and turns to the next', async () => {
    const user = userEvent.setup()
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-book__leaf')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Next/ }))

    expect(screen.getByText('Spread 2 of 2')).toBeInTheDocument()
    expect(container.querySelectorAll('.x-book__leaf')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Previous/ })).toBeEnabled()
  })

  it('keeps both controls mounted so the row does not jump as you turn', () => {
    render(<VisitorCenterScene />)

    // Disabled rather than removed at the ends.
    expect(screen.getByRole('button', { name: /Previous/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument()
  })
})
