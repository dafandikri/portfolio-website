import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import VisitorCenterScene, {
  PaddockSurfaceTransition,
  WOLVERINE_EXIT_MS,
} from './VisitorCenterScene'
import { awards } from '../../data'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('VisitorCenterScene', () => {
  it('makes the achievements section explicit', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 2, name: 'Achievements' })).toBeInTheDocument()
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

  it('waits after the open spread becomes readable before Wolverine pops out', () => {
    vi.useFakeTimers()
    const { container } = render(<VisitorCenterScene />)
    const wolverine = container.querySelector('.x-archive__wolverine')

    expect(wolverine).not.toHaveClass('is-visible')
    act(() => vi.advanceTimersByTime(2399))
    expect(wolverine).not.toHaveClass('is-visible')
    act(() => vi.advanceTimersByTime(1))
    expect(wolverine).toHaveClass('is-visible')
    expect(wolverine?.querySelector('img')).toHaveAttribute('src', expect.stringContaining('wolverine-dance.gif'))
  })

  it('returns Wolverine behind the folder before hiding him', () => {
    vi.useFakeTimers()
    const { container, rerender } = render(<VisitorCenterScene />)
    const wolverine = container.querySelector('.x-archive__wolverine')

    act(() => vi.advanceTimersByTime(2400))
    expect(wolverine).toHaveClass('is-visible')

    rerender(<VisitorCenterScene interactive={false} />)
    expect(wolverine).toHaveClass('is-exiting')
    expect(wolverine).not.toHaveClass('is-visible')

    act(() => vi.advanceTimersByTime(WOLVERINE_EXIT_MS - 1))
    expect(wolverine).toHaveClass('is-exiting')
    act(() => vi.advanceTimersByTime(1))
    expect(wolverine).not.toHaveClass('is-exiting')
  })

  it('shows one case per award, with the competition it was won at', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-book__leaf')).toHaveLength(awards.length)
    expect(screen.getByRole('heading', { level: 3, name: 'Best Presentation' })).toBeInTheDocument()
    expect(container.querySelector('.x-leaf__event')).toHaveTextContent('RISTEK Hackathon 2026')
  })

  it('names the team and every member', () => {
    const { container } = render(<VisitorCenterScene />)

    const team = container.querySelector('.x-leaf__roster') as HTMLElement
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

  it('keeps a heading for the landmark without printing one on the folder', () => {
    const { container } = render(<VisitorCenterScene />)

    // The folder's own tab and stamp identify it; a title above them said the
    // same thing again in a second voice. The heading stays for the landmark.
    const heading = screen.getByRole('heading', { level: 2, name: 'Achievements' })
    expect(heading).toBeInTheDocument()
    expect(container.querySelector('.x-archive__header')).toContainElement(heading)
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
      .getByRole('link', { name: 'View Talk-Active (opens in a new tab)' })
    expect(link).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('prints linked RISTEK, NashTa and Talk-Active brand marks as obvious actions', () => {
    const { container } = render(<VisitorCenterScene />)

    const ristek = screen.getByRole('link', {
      name: 'Visit RISTEK (opens in a new tab)',
    })
    const nashta = screen.getByRole('link', {
      name: 'Visit NashTa Group (opens in a new tab)',
    })
    const talkActive = screen.getByRole('link', {
      name: 'Visit Talk-Active (opens in a new tab)',
    })

    expect(ristek).toHaveAttribute('href', 'https://ristek.cs.ui.ac.id/')
    expect(nashta).toHaveAttribute('href', 'https://nashtagroup.co.id/')
    expect(talkActive).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    for (const link of [ristek, nashta, talkActive]) {
      expect(link).toHaveClass('x-brand--linked')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    }

    expect(ristek).toHaveClass('x-brand--partner')
    expect(nashta).toHaveClass('x-brand--partner')
    expect(talkActive).toHaveClass('x-brand--product')
    expect(container.querySelector('[data-brand-asset="ristek"]')).toHaveAttribute(
      'data-asset-state',
      'ready',
    )
    expect(container.querySelector('[data-brand-asset="nashta-group"]')).toHaveAttribute(
      'data-asset-state',
      'ready',
    )
    expect(container.querySelector('[data-brand-asset="talk-active"]')).toHaveAttribute(
      'data-asset-state',
      'ready',
    )
  })

  it('keeps SIRA as a separate, intentionally non-clickable product mark', () => {
    const { container } = render(<VisitorCenterScene />)

    const sira = container.querySelector('[data-brand-asset="sira"]')?.closest('.x-brand')
    expect(sira).toHaveClass('x-brand--product', 'x-brand--static')
    expect(sira?.tagName).toBe('SPAN')
    expect(within(sira as HTMLElement).getByRole('img', { name: 'SIRA' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Visit SIRA/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View SIRA/i })).not.toBeInTheDocument()
  })

  it('uses image-only brand marks inside the award file', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelector('.x-brand__label')).toBeNull()
    expect(container.querySelector('.x-brand__external')).toBeNull()
    expect(container.querySelectorAll('.x-brand__mark img')).toHaveLength(4)
  })

  it('keeps the RISTEK record still and unfolds Team FAM names on a separate roster slip', () => {
    const { container } = render(<VisitorCenterScene />)

    const record = container.querySelector('[data-paper-reveal="pull-sheet"]')
    const roster = container.querySelector('.x-leaf__roster')
    const rosterSheet = container.querySelector('.x-leaf__roster-sheet')
    expect(record).toHaveClass('x-leaf__insert--pull-sheet')
    expect(record?.previousElementSibling).toHaveClass('x-leaf__evidence')
    expect(record).toContainElement(screen.getByText(/against 37 teams/))
    expect(record).toContainElement(screen.getByRole('heading', { name: 'What we missed' }))
    expect(record?.querySelector('.x-leaf__facts')).toBeInTheDocument()
    expect(record?.querySelector('.x-leaf__foot')).toBeInTheDocument()
    expect(record).not.toContainElement(roster as HTMLElement)
    expect(roster?.parentElement).toHaveClass('x-book__leaf--verso')
    expect(within(roster as HTMLElement).getByText('Team FAM roster')).toBeInTheDocument()
    expect(within(roster as HTMLElement).getByText('5 Team Members')).toBeInTheDocument()
    expect(roster).not.toHaveTextContent(/unfold|names/i)
    expect(rosterSheet).toHaveTextContent('RISTEK Hackathon 2026 // Team FAM')
    for (const member of awards[0]!.members ?? []) expect(rosterSheet).toHaveTextContent(member)
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

  it('stamps the cover with an original code-native circled X', () => {
    const { container } = render(<VisitorCenterScene />)

    const cover = container.querySelector('.x-book__cover')
    expect(cover).toHaveTextContent('Achievements')
    expect(cover).not.toHaveTextContent('Class X')
    expect(cover?.querySelector('.x-book__mark')).toBeInTheDocument()
    expect(cover?.querySelectorAll('.x-book__mark-ring')).toHaveLength(2)
    expect(cover?.querySelectorAll('.x-book__mark-cross path')).toHaveLength(2)
    expect(cover?.querySelector('.x-book__mark-register')).toBeInTheDocument()
    expect(cover?.querySelectorAll('line')).toHaveLength(0)
  })

  it('shows no page controls while every award fits one spread', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(awards.length).toBeLessThanOrEqual(2)
    expect(container.querySelector('.x-book__turn')).toBeNull()
  })
})
