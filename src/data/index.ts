import { projectsSchema, experiencesSchema, techStackSchema, skillsSchema, awardsSchema, contactsSchema } from './schema'
import type { Award, Project } from './schema'
import { projectsData } from './projects'
import { experiencesData } from './experiences'
import { techStackData, skillsData } from './skills'
import { awardsData } from './awards'
import { contact as contactData } from './contact'

export type {
  Project,
  ExperienceEntry,
  ExperienceYear,
  Experiences,
  TechItem,
  TechStack,
  Skill,
  Card,
  CardField,
  Award,
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
export const techStack = parseOrThrow('techStack', techStackSchema.safeParse(techStackData))
export const skills = parseOrThrow('skills', skillsSchema.safeParse(skillsData))

/**
 * Zod validates each collection in isolation, so it cannot know whether an
 * award names a project that exists. Renaming a project without updating its
 * award would otherwise ship a dangling reference; this turns that into a
 * build failure. Exported so it can be tested against inputs other than the
 * real data.
 */
export function assertAwardProjectsExist(
  awardList: readonly Award[],
  projectList: readonly Project[],
): void {
  const titles = new Set(projectList.map((project) => project.title))
  for (const award of awardList) {
    if (award.projectTitle !== null && !titles.has(award.projectTitle)) {
      throw new Error(
        `Award "${award.title}" references unknown project "${award.projectTitle}".`,
      )
    }
  }
}

export const awards = parseOrThrow('awards', awardsSchema.safeParse(awardsData))
export const contacts = parseOrThrow('contacts', contactsSchema.safeParse(contactData))
assertAwardProjectsExist(awards, projects)

// The card validates itself at its own module, so that rendering it does not
// drag the rest of the content into the bundle. Re-exported here for scripts.
export { card } from './card'
