import { describe, expect, it } from 'vitest'
import { projectCardTitle, projectMedia } from './projectMedia'

describe('project media registry', () => {
  it('uses a product video for SIRA and full walkthrough GIFs for the other featured work', () => {
    const sira = projectMedia('sira_project')
    const boulder = projectMedia('boulder_project')
    const portfolio = projectMedia('portfolio_project')
    const interbio = projectMedia('interbio_project')

    expect(sira?.kind).toBe('video')
    expect(sira?.src).toBe('/sira-promo-2k-60fps.mp4')
    expect(boulder?.src).toContain('14.13.53.gif')
    expect(portfolio?.src).toContain('14.00.45.gif')
    expect(interbio?.src).toContain('15.08.58.gif')
    expect(boulder).not.toHaveProperty('previewSrc')
    expect(portfolio).not.toHaveProperty('previewSrc')
    expect(interbio).not.toHaveProperty('previewSrc')
    expect(projectMedia('')).toBeNull()
    expect(projectMedia('not-added')).toBeNull()
  })

  it('keeps concise names for the project index', () => {
    expect(projectCardTitle('SIRA — Smart Invoice Reminder AI')).toBe('SIRA')
    expect(projectCardTitle('GeoBikunAlert')).toBe('GeoBikun')
    expect(projectCardTitle('Unmapped Project')).toBe('Unmapped Project')
  })
})
