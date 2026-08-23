import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import VisitorCenterScene, {
  PaddockSurfaceTransition,
} from './VisitorCenterScene'
import { awards } from '../../data'

afterEach(cleanup)

describe('VisitorCenterScene', () => {
  it('titles the scene as the awards section', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 2, name: 'Awards' })).toBeInTheDocument()
    expect(screen.getByText('Field file · Class X')).toBeInTheDocument()
  })

  it('paperizes the real paddock only after two passes cross six physical gouges', () => {
    const { container } = render(
      <div className="gate__project-frame">
        <PaddockSurfaceTransition />
      </div>,
    )

    expect(container.querySelector('.x-archive__curtain')).toBeNull()
    expect(container.querySelector('.x-transition__surface')?.parentElement)
      .toHaveClass('gate__project-frame')
    expect(container.querySelectorAll('.x-transition__scar-field')).toHaveLength(2)
    expect(container.querySelectorAll('[data-gouge]')).toHaveLength(6)
    expect(container.querySelectorAll('[data-halftone]')).toHaveLength(1)

    expect(container.querySelector('.x-transition__strike')).toBeNull()
  })

  it('keeps the award spread inert until the shared camera reaches it', () => {
    const { container } = render(<VisitorCenterScene interactive={false} />)

    expect(container.querySelector('.scene--archive')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.x-book')).toHaveAttribute('inert')
  })

  it('shows one case per award, with the competition it was won at', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-book__leaf')).toHaveLength(awards.length)
    expect(screen.getByRole('heading', { level: 3, name: 'Best Presentation' })).toBeInTheDocument()
    expect(container.querySelector('.x-leaf__event')).toHaveTextContent('RISTEK Hackathon 2026')
  })

  it('names the team and every member', () => {
    const { container } = render(<VisitorCenterScene />)

    const team = container.querySelector('.x-leaf__team') as HTMLElement
    expect(team).toHaveTextContent('Team FAM')
    const members = awards[0]!.members ?? []
    expect(members.length).toBeGreaterThan(0)
    for (const member of members) {
      expect(team).toHaveTextContent(member)
    }
  })

  it('lists every highlight of every award', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-leaf__facts li')).toHaveLength(
      awards.reduce((total, award) => total + award.highlights.length, 0),
    )
  })

  it('counts a team too large to name instead of listing it', () => {
    const { container } = render(<VisitorCenterScene />)

    const counted = container.querySelector('.x-leaf__team--count')
    expect(counted).toHaveTextContent('Kelompok C2 · 9 members')
    // A plain line, not a <details> promising a roster it cannot open.
    expect(counted?.tagName).toBe('P')
  })

  it('counts the awards in the heading instead of hardcoding one', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelector('.x-archive__heading')).toHaveTextContent(
      `/ ${String(awards.length).padStart(2, '0')}`,
    )
  })

  it('labels each award with the stage that was actually judged', () => {
    const { container } = render(<VisitorCenterScene />)

    const events = [...container.querySelectorAll('.x-leaf__event')].map((n) => n.textContent)
    expect(events).toContain('RISTEK Hackathon 2026 · Final pitch')
    // The PPL award went to the delivered system, not to a pitch.
    expect(events).toContain('PPL x Propensi 2026 · Project exhibition')
  })

  it('mounts the Tech Wizard award won on the PPL course project', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 3, name: 'Tech Wizard Award' })).toBeInTheDocument()
    expect(screen.getByText(/software engineering project course at Fasilkom UI/)).toBeInTheDocument()
  })

  it('mounts the real team photograph as evidence with intrinsic dimensions', () => {
    render(<VisitorCenterScene />)

    const photo = screen.getByRole('img', {
      name: 'Five members of Team FAM holding the Best Presentation board after the RISTEK Hackathon 2026 finals',
    })
    expect(photo).toHaveAttribute('width', '720')
    expect(photo).toHaveAttribute('height', '960')
    expect(screen.getByText('Talk-Active · Team FAM · 14 August 2026')).toBeInTheDocument()
  })

  it('records the business-model lesson as a personal field note', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 4, name: 'What we missed' })).toBeInTheDocument()
    expect(screen.getByText(/TAM, SAM and SOM/)).toBeInTheDocument()
  })

  it('says what RISTEK is before saying what the team won there', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByText(/student tech collective at Fasilkom UI/)).toBeInTheDocument()
    expect(screen.getByText(/against 37 teams/)).toBeInTheDocument()
    expect(screen.getByText(/came out with Best Presentation/)).toBeInTheDocument()
  })

  it('references the project it was won with, linked and safely targeted', () => {
    const { container } = render(<VisitorCenterScene />)

    const link = within(container.querySelector('.x-book__leaf') as HTMLElement)
      .getByRole('link', { name: /Talk-Active/ })
    expect(link).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('keeps the file cover as scenery the content does not depend on', () => {
    const { container } = render(<VisitorCenterScene />)

    const cover = container.querySelector('.x-book__cover')
    expect(cover).toHaveAttribute('aria-hidden', 'true')
    // The cover swings over the spread. If the record lived inside it, a
    // browser without view() timelines would leave the awards shut in the file.
    expect(cover?.querySelector('.x-book__leaf')).toBeNull()
    expect(container.querySelectorAll('.x-book__leaf').length).toBeGreaterThan(0)
  })

  it('shows no page controls while every award fits one spread', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(awards.length).toBeLessThanOrEqual(2)
    expect(container.querySelector('.x-book__turn')).toBeNull()
  })
})
