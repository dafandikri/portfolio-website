import { describe, expect, it } from 'vitest'
import { projectCardTitle, projectMedia } from './projectMedia'

describe('project media registry', () => {
  it('uses lightweight video previews and full walkthrough videos for every project that has a recording', () => {
    const sira = projectMedia('sira_project')
    const boulder = projectMedia('boulder_project')
    const portfolio = projectMedia('portfolio_project')
    const interbio = projectMedia('interbio_project')

    expect(sira?.kind).toBe('video')
    expect(sira?.src).toBe('/sira-promo-2k-60fps.mp4')
    expect(sira).toHaveProperty('previewSrc', '/sira-preview.mp4')
    expect(boulder).toMatchObject({
      kind: 'video',
      src: '/boulder-coach-walkthrough.mp4',
      previewSrc: '/boulder-coach-preview.mp4',
    })
    expect(portfolio).toMatchObject({
      kind: 'video',
      src: '/portfolio-walkthrough.mp4',
      previewSrc: '/portfolio-preview.mp4',
    })
    expect(interbio).toMatchObject({
      kind: 'video',
      src: '/interbio-walkthrough.mp4',
      previewSrc: '/interbio-preview.mp4',
    })
    expect(projectMedia('')).toBeNull()
    expect(projectMedia('not-added')).toBeNull()
  })

  it('keeps concise names for the project index', () => {
    expect(projectCardTitle('SIRA — Smart Invoice Reminder AI')).toBe('SIRA')
    expect(projectCardTitle('GeoBikunAlert')).toBe('GeoBikun')
    expect(projectCardTitle('Unmapped Project')).toBe('Unmapped Project')
  })
})

describe('Talk-Active media', () => {
  it('resolves media for the Talk-Active paddock', () => {
    const media = projectMedia('talkactive_project')
    expect(media).not.toBeNull()
    expect(media?.kind).toBe('image')
  })

  it('gives Talk-Active a paddock plaque title', () => {
    expect(projectCardTitle('Talk-Active')).toBe('Talk-Active')
  })
})
