import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { stubIntersectionObserver } from './test/setup'

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('keeps the card as scene one and exposes the experience scene to navigation', async () => {
    // Keep below-fold scenes parked. The app test is about code-splitting and
    // navigation structure; WebGL itself is exercised in a real browser.
    const observers = stubIntersectionObserver()
    const { container } = render(<App />)

    // The card is in the first chunk, so it is present immediately.
    expect(screen.getByRole('region', { name: 'Business card introduction' })).toBeInTheDocument()

    expect(screen.queryByRole('heading', { level: 2, name: 'Experience' })).not.toBeInTheDocument()

    const scenePlaceholders = Array.from(container.querySelectorAll('[data-deferred-scene]'))
    act(() => {
      scenePlaceholders.forEach((placeholder) => {
        const observer = observers.find((candidate) => candidate.observed.has(placeholder))
        observer?.trigger(placeholder, true, 1)
      })
    })

    // Each scene is requested only when its own reserved viewport approaches.
    // Generous timeout: this is a real dynamic import, and under a loaded test
    // runner it resolves well past findBy's one-second default. The wait is the
    // point of the assertion, not incidental to it. The test's own budget has to
    // exceed the query's, or the runner gives up before the query does and
    // reports a timeout that says nothing about the import.
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Experience' }, { timeout: 10_000 }),
    ).toBeInTheDocument()
  }, 20_000)
})
