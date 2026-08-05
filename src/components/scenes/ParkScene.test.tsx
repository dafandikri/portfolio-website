import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { projectsData } from '../../data/projects'
import ParkScene, { ProjectMediaView } from './ParkScene'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function projectButton(index: number) {
  const project = projectsData[index]!
  return screen.getByRole('button', {
    name: `${project.title}, paddock ${String(index + 1).padStart(2, '0')}`,
  })
}

describe('ParkScene', () => {
  it('deploys one accessible closed containment cell per project', () => {
    const { container } = render(<ParkScene />)

    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByText('Paddocks')).toBeInTheDocument()
    expect(container.querySelectorAll('.park__containment')).toHaveLength(projectsData.length)
    expect(container.querySelectorAll('.park__hazard')).toHaveLength(projectsData.length)
    expect(container.querySelectorAll('.park__fence')).toHaveLength(projectsData.length)
    expect(container.querySelectorAll('.park__fence i')).toHaveLength(projectsData.length * 7)
    expect(container.querySelectorAll('.park__pylons')).toHaveLength(projectsData.length)
    expect(container.querySelectorAll('.park__pylons i')).toHaveLength(projectsData.length * 2)
    expect(screen.getAllByText('Secure')).toHaveLength(projectsData.length)

    projectsData.forEach((_, index) => expect(projectButton(index)).toBeVisible())
    expect(projectButton(0)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('enters a cell and opens its project dossier', () => {
    const { container } = render(<ParkScene />)
    const index = 1
    const project = projectsData[index]!

    act(() => projectButton(index).click())

    expect(projectButton(0)).toHaveAttribute('aria-expanded', 'false')
    expect(projectButton(index)).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument()
    expect(screen.getByText(project.description)).toBeInTheDocument()
    expect(container.querySelectorAll('.park__chip')).toHaveLength(project.techStack.length)
    expect(screen.getByRole('button', { name: 'Return to paddocks' })).toBeInTheDocument()
  })

  it('returns from the dossier to the complete paddock hand', () => {
    render(<ParkScene />)

    act(() => projectButton(0).click())
    act(() => screen.getByRole('button', { name: 'Return to paddocks' }).click())

    projectsData.forEach((_, index) =>
      expect(projectButton(index)).toHaveAttribute('aria-expanded', 'false'),
    )
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('renders existing stills and honest placeholders for projects without media', () => {
    const { container } = render(<ParkScene />)
    const mediaCount = projectsData.filter(({ image }) => image.length > 0).length

    expect(container.querySelectorAll('.park__media-file')).toHaveLength(mediaCount)
    expect(screen.getAllByLabelText('Project media not added yet')).toHaveLength(
      projectsData.length - mediaCount,
    )
  })

  it('prints links only where the selected project has real destinations', () => {
    render(<ParkScene />)
    const withoutLinksIndex = projectsData.findIndex(
      (project) => project.liveLink === '#' && project.repoLink === '#',
    )
    const withRepoIndex = projectsData.findIndex((project) => project.repoLink !== '#')

    if (withoutLinksIndex >= 0) {
      act(() => projectButton(withoutLinksIndex).click())
      expect(screen.queryByRole('link', { name: 'Visit' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Source' })).toBeNull()
    }

    if (withRepoIndex >= 0) {
      act(() => projectButton(withRepoIndex).click())
      const source = screen.getByRole('link', { name: 'Source' })
      expect(source).toHaveAttribute('href', projectsData[withRepoIndex]!.repoLink)
      expect(source).toHaveAttribute('target', '_blank')
      expect(source.getAttribute('rel')).toContain('noopener')
    }
  })

  it('keeps routed visits in-page and opens external visits in a new tab', () => {
    render(<ParkScene />)
    const externalIndex = projectsData.findIndex((project) => project.liveLink.startsWith('http'))
    const routedIndex = projectsData.findIndex(
      (project) => project.liveLink !== '#' && !project.liveLink.startsWith('http'),
    )

    if (externalIndex >= 0) {
      act(() => projectButton(externalIndex).click())
      expect(screen.getByRole('link', { name: 'Visit' })).toHaveAttribute('target', '_blank')
    }

    if (routedIndex >= 0) {
      act(() => projectButton(routedIndex).click())
      expect(screen.getByRole('link', { name: 'Visit' })).not.toHaveAttribute('target')
    }
  })

  it('supports a muted looping video without changing project records', () => {
    render(
      <ProjectMediaView
        media={{ kind: 'video', src: '/test-project.webm', label: 'Test project preview' }}
      />,
    )

    const video = screen.getByLabelText('Test project preview') as HTMLVideoElement
    expect(video).toHaveAttribute('src', '/test-project.webm')
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect(video.muted).toBe(true)
  })

  it('renders a null-media placeholder directly', () => {
    render(<ProjectMediaView media={null} />)
    expect(screen.getByLabelText('Project media not added yet')).toHaveTextContent('Media locked')
  })
})
