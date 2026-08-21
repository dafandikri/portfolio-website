import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import KatoPerch from './KatoPerch'

afterEach(cleanup)

describe('KatoPerch', () => {
  it('renders a decorative perch that assistive technology ignores', () => {
    const { container } = render(<KatoPerch />)

    const kato = container.querySelector('.kato')
    expect(kato).toBeInTheDocument()
    expect(kato).toHaveAttribute('aria-hidden', 'true')
  })

  it('adds no accessible name or role of its own', () => {
    render(<KatoPerch />)

    // A mascot is decoration. The paddock beneath it already carries the
    // accessible name; a second one here would only add noise.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
