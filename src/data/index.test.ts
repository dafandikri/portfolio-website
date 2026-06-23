import { describe, it, expect } from 'vitest'
import { projects, experiences, techStack, skills, parseOrThrow } from './index'
import { projectSchema, experienceEntrySchema } from './schema'

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
