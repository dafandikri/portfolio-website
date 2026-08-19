import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import VisitorCenterScene from './VisitorCenterScene'
import { awards } from '../../data'

afterEach(cleanup)

describe('VisitorCenterScene', () => {
  it('titles the scene as the awards section', () => {
    render(<VisitorCenterScene />)

    expect(screen.getByRole('heading', { level: 2, name: 'Awards' })).toBeInTheDocument()
  })

  it('shows one case per award, with the competition it was won at', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.rotunda__case')).toHaveLength(awards.length)
    expect(screen.getByRole('heading', { level: 3, name: 'Best Presentation' })).toBeInTheDocument()
    // Scoped: the event name also appears inside a highlight, and an unscoped
    // query would match both and fail on ambiguity rather than on substance.
    expect(container.querySelector('.rotunda__event')).toHaveTextContent('RISTEK Hackathon 2026')
  })

  it('names the team and every member', () => {
    const { container } = render(<VisitorCenterScene />)

    const team = container.querySelector('.rotunda__team') as HTMLElement
    expect(team).toHaveTextContent('Team FAM')
    for (const member of awards[0]!.members) {
      expect(team).toHaveTextContent(member)
    }
  })

  it('lists every highlight of the award', () => {
    const { container } = render(<VisitorCenterScene />)

    expect(container.querySelectorAll('.rotunda__highlights li')).toHaveLength(
      awards[0]!.highlights.length,
    )
  })

  it('references the project it was won with, linked and safely targeted', () => {
    const { container } = render(<VisitorCenterScene />)

    const link = within(container.querySelector('.rotunda__case') as HTMLElement)
      .getByRole('link', { name: /Talk-Active/ })
    expect(link).toHaveAttribute('href', 'https://talk-active-id.vercel.app')
    expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
