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
    expect(screen.getByText('The product was ready. The business case wasn’t.')).toBeInTheDocument()
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
    expect(container.querySelector('.x-archive__shell')).toHaveAttribute('inert')
  })

  it('shows one case per award, with the competition it was won at', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-archive__record')).toHaveLength(awards.length)
    expect(screen.getByRole('heading', { level: 3, name: 'Best Presentation' })).toBeInTheDocument()
    expect(container.querySelector('.x-archive__event')).toHaveTextContent('RISTEK Hackathon 2026')
  })

  it('names the team and every member', () => {
    const { container } = render(<VisitorCenterScene />)

    const team = container.querySelector('.x-archive__credits') as HTMLElement
    expect(team).toHaveTextContent('Team FAM')
    for (const member of awards[0]!.members) {
      expect(team).toHaveTextContent(member)
    }
  })

  it('lists every highlight of the award', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.x-archive__facts li')).toHaveLength(
      awards[0]!.highlights.length,
    )
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

  it('credits the six-gouge motif in a margin note rather than in artwork', () => {
    const { container } = render(<VisitorCenterScene />)

    const note = container.querySelector('.x-archive__marginalia') as HTMLElement
    expect(note).toHaveTextContent('Margin note')
    expect(note).toHaveTextContent(/Wolverine.s work, hence Class X/)
    expect(container.querySelector('.x-archive__marginalia img')).toBeNull()
  })

  it('references the project it was won with, linked and safely targeted', () => {
    const { container } = render(<VisitorCenterScene />)

    const link = within(container.querySelector('.x-archive__record') as HTMLElement)
      .getByRole('link', { name: /Talk-Active/ })
    expect(link).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
