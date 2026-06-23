import { projectsSchema, experiencesSchema } from './schema'
import { projectsData } from './projects'
import { experiencesData } from './experiences'

export type {
  Project,
  ExperienceEntry,
  ExperienceYear,
  Experiences,
} from './schema'

/**
 * Validate all content against its schema at module load.
 * Because this module is imported by the app (and by scripts/validate-data.ts),
 * any malformed/incomplete data fails the build with a clear Zod error rather
 * than rendering broken or shipping silently.
 */
export function parseOrThrow<T>(label: string, result: { success: boolean; data?: T; error?: unknown }): T {
  if (!result.success) {
    throw new Error(`Invalid content in "${label}":\n${String(result.error)}`)
  }
  return result.data as T
}

export const projects = parseOrThrow('projects', projectsSchema.safeParse(projectsData))
export const experiences = parseOrThrow('experiences', experiencesSchema.safeParse(experiencesData))
