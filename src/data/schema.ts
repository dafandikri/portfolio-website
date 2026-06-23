import { z } from 'zod'

/**
 * Single source of truth for portfolio content shapes.
 * Types are inferred from these Zod schemas (z.infer) so the runtime
 * validation and the compile-time types can never drift.
 */

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projectSchema = z.object({
  title: z.string().min(1),
  year: z.string().min(1),
  description: z.string().min(1),
  // Empty string is allowed and means "no screenshot yet" (renders a placeholder).
  image: z.string(),
  features: z.array(z.string().min(1)).min(1),
  techStack: z.array(z.string().min(1)).min(1),
  // Links may be a full URL, a relative route ("/blog/..."), or "#" (none yet).
  liveLink: z.string().min(1),
  repoLink: z.string().min(1),
})
export type Project = z.infer<typeof projectSchema>

export const projectsSchema = z.array(projectSchema).min(1)

// ---------------------------------------------------------------------------
// Experiences (grouped by year)
// ---------------------------------------------------------------------------
export const experienceEntrySchema = z.object({
  id: z.string().min(1),
  monthLabel: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().min(1),
  achievements: z.array(z.string().min(1)).min(1),
  logo: z.string().min(1),
})
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>

export const experienceYearSchema = z.object({
  entries: z.array(experienceEntrySchema).min(1),
})
export type ExperienceYear = z.infer<typeof experienceYearSchema>

export const experiencesSchema = z.record(z.string(), experienceYearSchema)
export type Experiences = z.infer<typeof experiencesSchema>
