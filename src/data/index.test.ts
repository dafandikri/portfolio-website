import { describe, it, expect } from 'vitest'
import { projects, experiences, techStack, skills, awards, parseOrThrow, assertAwardProjectsExist } from './index'
import { projectSchema, experienceEntrySchema, awardSchema } from './schema'

describe('parseOrThrow', () => {
  it('returns data on success', () => {
    expect(parseOrThrow('ok', { success: true, data: 42 })).toBe(42)
  })

  it('throws with the label on failure', () => {
    expect(() => parseOrThrow('widgets', { success: false, error: 'bad' })).toThrow(/widgets/)
  })
})

describe('content data integrity', () => {
  it('exposes at least one project, all schema-valid', () => {
    expect(projects.length).toBeGreaterThan(0)
    for (const project of projects) {
      expect(projectSchema.safeParse(project).success).toBe(true)
    }
  })

  it('exposes experiences grouped by year, all entries schema-valid', () => {
    const years = Object.keys(experiences)
    expect(years.length).toBeGreaterThan(0)
    for (const year of years) {
      const group = experiences[year]
      expect(group).toBeDefined()
      for (const entry of group!.entries) {
        expect(experienceEntrySchema.safeParse(entry).success).toBe(true)
      }
    }
  })

  it('uses unique experience entry ids', () => {
    const ids = Object.values(experiences).flatMap((y) => y.entries.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('exposes non-empty tech stack rows and skills', () => {
    expect(techStack.row1.length).toBeGreaterThan(0)
    expect(techStack.row2.length).toBeGreaterThan(0)
    expect(skills.length).toBeGreaterThan(0)
  })
})

describe('awards', () => {
  it('exposes awards that are all schema-valid', () => {
    expect(awards.length).toBeGreaterThan(0)
    for (const award of awards) {
      expect(awardSchema.safeParse(award).success).toBe(true)
    }
  })

  it('points every award at a project that exists', () => {
    const titles = new Set(projects.map((project) => project.title))
    for (const award of awards) {
      if (award.projectTitle === null) continue
      expect(titles).toContain(award.projectTitle)
    }
  })

  it('rejects an award pointing at a project that does not exist', () => {
    // Zod validates each collection alone, so a dangling cross-reference is
    // only catchable here. Without this check, renaming a project would ship a
    // broken link rather than failing the build.
    expect(() =>
      assertAwardProjectsExist([{ ...awards[0]!, projectTitle: 'No Such Project' }], projects),
    ).toThrow(/No Such Project/)
  })

  it('keeps competition language out of every project description', () => {
    // The separation this site is built on: a project describes the product,
    // an award describes the competition. Enforced, not just intended.
    for (const project of projects) {
      const copy = `${project.description} ${project.context} ${project.features.join(' ')}`
      expect(copy).not.toMatch(/hackathon|RISTEK|best presentation/i)
    }
  })
})
