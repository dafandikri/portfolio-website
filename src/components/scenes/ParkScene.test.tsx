import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { projectsData } from '../../data/projects'
import ParkScene, { PADDOCK_OPEN_MS, ProjectMediaView } from './ParkScene'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const featured = projectsData.filter((project) => project.featured)
const archived = projectsData.filter((project) => !project.featured)

describe('ParkScene', () => {
  it('shows five complete containment paddocks and a quieter earlier-work archive', () => {
    const { container } = render(<ParkScene />)

    // Pinned rather than implied: the rest of this test derives its counts from
    // featured.length, which would keep passing if a project silently vanished.
    expect(featured).toHaveLength(5)
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
    expect(container.querySelectorAll('.park__containment')).toHaveLength(featured.length)
    expect(container.querySelectorAll('.park__hazard')).toHaveLength(featured.length)
    expect(container.querySelectorAll('.park__fence')).toHaveLength(featured.length)
    expect(container.querySelectorAll('.park__fence i')).toHaveLength(featured.length * 9)
    expect(container.querySelectorAll('.park__pylons i')).toHaveLength(featured.length * 2)
    expect(screen.getAllByText('Secure')).toHaveLength(featured.length)
    expect(screen.getByText('Archive enclosures', { exact: false })).toBeInTheDocument()
    archived.forEach((project) => expect(screen.getByText(project.title)).toBeInTheDocument())
  })

  it('opens the physical paddock before mounting its complete walkthrough', () => {
    render(<ParkScene />)
    const boulder = featured.find((project) => project.title === 'Boulder Coach')!

    act(() => screen.getByRole('button', { name: /Boulder Coach/i }).click())

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: /Boulder Coach/i })).toHaveAttribute('aria-busy', 'true')

    act(() => vi.advanceTimersByTime(PADDOCK_OPEN_MS))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { level: 3, name: boulder.title })).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Boulder Coach complete product walkthrough')).toHaveAttribute(
      'src',
      '/boulder-coach-walkthrough.mp4',
    )
    expect(within(dialog).getByText(boulder.description)).toBeInTheDocument()
  })

  it('opens a focused dossier with outcomes, technology and honest destinations', () => {
    const { container } = render(<ParkScene />)
    const boulder = featured.find((project) => project.title === 'Boulder Coach')!

    act(() => screen.getByRole('button', { name: /Boulder Coach/i }).click())
    act(() => vi.advanceTimersByTime(PADDOCK_OPEN_MS))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveFocus()
    expect(within(dialog).getByRole('heading', { level: 3, name: boulder.title })).toBeInTheDocument()
    expect(container.querySelectorAll('.park__features li')).toHaveLength(boulder.features.length)
    expect(container.querySelectorAll('.park__chip')).toHaveLength(boulder.techStack.length)
    expect(within(dialog).getByRole('link', { name: boulder.liveLabel })).toHaveAttribute('target', '_blank')
    expect(within(dialog).getByRole('link', { name: 'Source' })).toHaveAttribute('href', boulder.repoLink)
  })

  it('closes the dossier and returns to all paddocks', () => {
    render(<ParkScene />)

    act(() => screen.getByRole('button', { name: /SIRA/i }).click())
    act(() => vi.advanceTimersByTime(PADDOCK_OPEN_MS))
    act(() => screen.getByRole('button', { name: 'Return to paddocks' }).click())

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('list', { name: 'Featured project paddocks' })).toBeVisible()
  })

  it('closes the dossier when the space outside its container is pressed', () => {
    render(<ParkScene />)

    act(() => screen.getByRole('button', { name: /SIRA/i }).click())
    act(() => vi.advanceTimersByTime(PADDOCK_OPEN_MS))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    act(() => screen.getByRole('button', { name: 'Close project details' }).click())

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('list', { name: 'Featured project paddocks' })).toBeVisible()
  })

  it('supports a muted looping video and adds controls in the dossier', () => {
    const { rerender } = render(
      <ProjectMediaView
        media={{ kind: 'video', src: '/test-project.webm', label: 'Test project preview' }}
        mode="preview"
      />,
    )

    const showcaseVideo = screen.getByLabelText('Test project preview') as HTMLVideoElement
    expect(showcaseVideo).toHaveAttribute('autoplay')
    expect(showcaseVideo).toHaveAttribute('loop')
    expect(showcaseVideo).toHaveAttribute('playsinline')
    expect(showcaseVideo).not.toHaveAttribute('controls')
    expect(showcaseVideo.muted).toBe(true)

    rerender(
      <ProjectMediaView
        media={{ kind: 'video', src: '/test-project.webm', label: 'Detailed project preview' }}
        mode="detail"
      />,
    )
    const detailVideo = screen.getByLabelText('Detailed project preview')
    expect(detailVideo).toHaveAttribute('controls')
    expect(detailVideo).toHaveAttribute('controlslist', 'nofullscreen noremoteplayback')
    expect(detailVideo).toHaveAttribute('disablepictureinpicture')
    expect(detailVideo).toHaveAttribute('disableremoteplayback')
  })

  it('renders a null-media placeholder directly', () => {
    render(<ProjectMediaView media={null} />)
    expect(screen.getByLabelText('Project media not added yet')).toHaveTextContent('Feed unavailable')
  })
})

describe('Kato', () => {
  it('perches on the Talk-Active paddock and no other', () => {
    const { container } = render(<ParkScene />)

    const perches = container.querySelectorAll('.kato')
    expect(perches).toHaveLength(1)

    const host = perches[0]!.closest('.park__containment')
    expect(within(host as HTMLElement).getByText('Talk-Active')).toBeInTheDocument()
  })

  it('stays out of the accessibility tree', () => {
    const { container } = render(<ParkScene />)

    expect(container.querySelector('.kato')).toHaveAttribute('aria-hidden', 'true')
  })

  it('sits after the paddock button, which the pose-swap selector depends on', () => {
    const { container } = render(<ParkScene />)

    const host = container.querySelector('.kato')!.closest('.park__containment')!
    const children = Array.from(host.children).map((child) => child.className)
    expect(children.indexOf('kato')).toBeGreaterThan(
      children.findIndex((name) => name.includes('park__containment-unit')),
    )
  })
})
