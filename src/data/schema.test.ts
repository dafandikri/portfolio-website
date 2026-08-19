import { describe, it, expect } from 'vitest'
import {
  projectSchema,
  experienceEntrySchema,
  experienceYearSchema,
  experiencesSchema,
  techStackSchema,
  skillsSchema,
  awardSchema,
} from './schema'

const validProject = {
  title: 'Mock Project',
  year: '2025',
  featured: true,
  context: 'Independent build',
  description: 'A mock project used for testing.',
  image: '',
  features: ['mock feature one'],
  techStack: ['react'],
  liveLink: '#',
  liveLabel: 'Unavailable',
  repoLink: '#',
}

const validEntry = {
  id: '2025-01',
  monthLabel: 'January 2025',
  role: 'Mock Role',
  org: 'Test Co',
  date: 'January 2025 - Present',
  description: 'A mock experience entry used for testing.',
  achievements: ['did a mock thing'],
  logo: 'github',
}

const validAward = {
  title: 'Mock Award',
  event: 'Mock Competition 2025',
  host: 'Test University',
  date: '1 January 2025',
  team: 'Team Mock',
  members: ['Mock Person'],
  projectTitle: 'Mock Project',
  story: 'A mock award used for testing.',
  highlights: ['won a mock thing'],
  logo: 'github',
}

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true)
  })

  it('rejects a project with an empty title', () => {
    expect(projectSchema.safeParse({ ...validProject, title: '' }).success).toBe(false)
  })

  it('rejects a project with no features', () => {
    expect(projectSchema.safeParse({ ...validProject, features: [] }).success).toBe(false)
  })

  it('rejects a project with no techStack', () => {
    expect(projectSchema.safeParse({ ...validProject, techStack: [] }).success).toBe(false)
  })

  it('rejects a project missing a required field', () => {
    const { description: _omitted, ...withoutDescription } = validProject
    void _omitted
    expect(projectSchema.safeParse(withoutDescription).success).toBe(false)
  })
})

describe('experienceEntrySchema', () => {
  it('accepts a valid entry', () => {
    expect(experienceEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('rejects an entry with no achievements', () => {
    expect(experienceEntrySchema.safeParse({ ...validEntry, achievements: [] }).success).toBe(false)
  })

  it('rejects an entry with an empty id', () => {
    expect(experienceEntrySchema.safeParse({ ...validEntry, id: '' }).success).toBe(false)
  })
})

describe('experienceYearSchema / experiencesSchema', () => {
  it('accepts a year group with at least one entry', () => {
    expect(experienceYearSchema.safeParse({ entries: [validEntry] }).success).toBe(true)
  })

  it('rejects a year group with no entries', () => {
    expect(experienceYearSchema.safeParse({ entries: [] }).success).toBe(false)
  })

  it('accepts a record of years', () => {
    expect(experiencesSchema.safeParse({ '2025': { entries: [validEntry] } }).success).toBe(true)
  })
})

describe('techStackSchema / skillsSchema', () => {
  const item = { name: 'React', icon: 'react' }

  it('accepts a two-row tech stack', () => {
    expect(techStackSchema.safeParse({ row1: [item], row2: [item] }).success).toBe(true)
  })

  it('rejects a tech stack with an empty row', () => {
    expect(techStackSchema.safeParse({ row1: [], row2: [item] }).success).toBe(false)
  })

  it('rejects a tech item missing an icon', () => {
    expect(techStackSchema.safeParse({ row1: [{ name: 'React' }], row2: [item] }).success).toBe(false)
  })

  it('accepts a non-empty skills list and rejects an empty one', () => {
    expect(skillsSchema.safeParse([item]).success).toBe(true)
    expect(skillsSchema.safeParse([]).success).toBe(false)
  })
})

describe('awardSchema', () => {
  it('accepts a valid award', () => {
    expect(awardSchema.safeParse(validAward).success).toBe(true)
  })

  it('accepts an award not tied to any project', () => {
    expect(awardSchema.safeParse({ ...validAward, projectTitle: null }).success).toBe(true)
  })

  it('rejects an award with no members', () => {
    expect(awardSchema.safeParse({ ...validAward, members: [] }).success).toBe(false)
  })

  it('rejects an award with no highlights', () => {
    expect(awardSchema.safeParse({ ...validAward, highlights: [] }).success).toBe(false)
  })

  it('rejects an award with an empty title', () => {
    expect(awardSchema.safeParse({ ...validAward, title: '' }).success).toBe(false)
  })
})
