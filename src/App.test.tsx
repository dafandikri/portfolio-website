import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('keeps the card as scene one and exposes the experience scene to navigation', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<App />)

    expect(screen.getByRole('region', { name: 'Business card introduction' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
  })
})
