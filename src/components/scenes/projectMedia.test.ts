import { describe, expect, it } from 'vitest'
import { projectCardTitle, projectMedia } from './projectMedia'

describe('project media registry', () => {
  it('maps known project keys to their media and leaves missing keys honest', () => {
    expect(projectMedia('sira_project')).toMatchObject({ kind: 'image' })
    expect(projectMedia('')).toBeNull()
    expect(projectMedia('not-added')).toBeNull()
  })

  it('shortens dense titles without changing unknown titles', () => {
    expect(projectCardTitle('SIRA — Smart Invoice Reminder AI')).toBe('SIRA')
    expect(projectCardTitle('GeoBikunAlert')).toBe('GeoBikun')
    expect(projectCardTitle('Unmapped Project')).toBe('Unmapped Project')
  })
})
