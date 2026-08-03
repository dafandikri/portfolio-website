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
  /**
   * The job, and who it was for, held apart rather than as one "Role - Org"
   * string. They are read in different places — the card face shows only the
   * organisation and the readout below it names the role — so storing the
   * joined line would mean splitting it back apart at every use.
   *
   * `org` is the short display name, not the legal one: it has to fit on a
   * playing card without wrapping.
   */
  role: z.string().min(1),
  org: z.string().min(1).max(14),
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

// ---------------------------------------------------------------------------
// Tech stack (two marquee rows) + professional skillsets
// ---------------------------------------------------------------------------
const namedIconSchema = z.object({
  name: z.string().min(1),
  // asset key resolved via getIcon() / getSkill().
  icon: z.string().min(1),
})

export const techItemSchema = namedIconSchema
export type TechItem = z.infer<typeof techItemSchema>

export const techStackSchema = z.object({
  row1: z.array(techItemSchema).min(1),
  row2: z.array(techItemSchema).min(1),
})
export type TechStack = z.infer<typeof techStackSchema>

export const skillSchema = namedIconSchema
export type Skill = z.infer<typeof skillSchema>

export const skillsSchema = z.array(skillSchema).min(1)

// ---------------------------------------------------------------------------
// Business card (the whole site, as of v2)
// ---------------------------------------------------------------------------

/**
 * A field printed on the card. `label` is what the paper says; `href` is where it
 * goes. `href: null` means the field is ink only and not interactive — the
 * location in the footer rule is the case that needs it.
 */
export const cardFieldSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1).nullable(),
})
export type CardField = z.infer<typeof cardFieldSchema>

export const cardSchema = z.object({
  /** Top left, first line. */
  phone: cardFieldSchema,
  /** Top left, second line. */
  email: cardFieldSchema,
  /**
   * Top right. The film's cards carry the firm on one line with its trade set
   * beneath it — "PIERCE & PIERCE" over "MERGERS AND ACQUISITIONS" — and the
   * institution/field pair sits in that slot the same way.
   */
  affiliation: z.object({
    name: z.string().min(1),
    detail: z.string().min(1),
  }),
  /** Centre of the card, set widest. */
  name: z.string().min(1),
  /** Directly beneath the name; the only line not set in small caps. */
  role: z.string().min(1),
  /** Bottom rule — the modern descendant of "address · fax · telex". */
  footer: z.array(cardFieldSchema).min(1),
})
export type Card = z.infer<typeof cardSchema>
