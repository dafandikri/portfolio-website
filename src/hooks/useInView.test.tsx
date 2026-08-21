import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubIntersectionObserver } from '../test/setup'
import { useInView } from './useInView'

function Probe({ once = false }: { once?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>('120px', once)
  return <div ref={ref}>{inView ? 'visible' : 'hidden'}</div>
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useInView', () => {
  it('tracks whether its element intersects', () => {
    const observers = stubIntersectionObserver()
    render(<Probe />)
    const node = screen.getByText('hidden')

    expect(observers[0]?.rootMargin).toBe('120px')
    act(() => observers[0]?.trigger(node, true, 1))
    expect(screen.getByText('visible')).toBeInTheDocument()

    act(() => observers[0]?.trigger(node, false, 0))
    expect(screen.getByText('hidden')).toBeInTheDocument()
  })

  it('can stay mounted after its first intersection', () => {
    const observers = stubIntersectionObserver()
    render(<Probe once />)
    const node = screen.getByText('hidden')

    act(() => observers[0]?.trigger(node, true, 1))
    expect(screen.getByText('visible')).toBeInTheDocument()
    expect(observers[0]?.observed.size).toBe(0)
  })

  it('fails open when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByText('visible')).toBeInTheDocument()
  })
})
