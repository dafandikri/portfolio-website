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
  featured: z.boolean(),
  context: z.string().min(1),
  description: z.string().min(1),
  // Empty string is allowed and means "no screenshot yet" (renders a placeholder).
  image: z.string(),
  features: z.array(z.string().min(1)).min(1),
  techStack: z.array(z.string().min(1)).min(1),
  // Links may be a full URL, a relative route ("/blog/..."), or "#" (none yet).
  liveLink: z.string().min(1),
  liveLabel: z.string().min(1),
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
   * string. They are read in different places — the card face names the role,
   * the linked plaque names the organisation, and the readout repeats the active
   * position at full size — so storing the
   * joined line would mean splitting it back apart at every use.
   *
   * `org` is the short display name, not the legal one: it has to fit on a
   * compact timeline enclosure without wrapping.
   */
  role: z.string().min(1),
  org: z.string().min(1).max(14),
  date: z.string().min(1),
  description: z.string().min(1),
  achievements: z.array(z.string().min(1)).min(1),
  logo: z.string().min(1),
  /**
   * The organisation behind this role, when its public profile is linked from
   * the experience card. `name` is the full accessible name; `label` is the
   * compact wordmark-sized copy that still fits the physical card.
   */
  company: z.object({
    name: z.string().min(1),
    label: z.string().min(1).max(28),
    /** Destination brand when it differs from the visible employer name. */
    linkName: z.string().min(1).optional(),
    href: z.string().url(),
  }).optional(),
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
  linkedin: cardFieldSchema,
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
  /**
   * Bottom rule — the modern descendant of "address · fax · telex".
   *
   * An array of *columns*, each holding one or more stacked lines. A flat list
   * could only ever be one row, which left the layout leaning on `:first-child`
   * and `:last-child` to mean "outer column" — positional CSS that silently
   * breaks the moment the data is reordered.
   */
  footer: z.array(z.array(cardFieldSchema).min(1)).min(1),
})
export type Card = z.infer<typeof cardSchema>

// ---------------------------------------------------------------------------
// Awards
// ---------------------------------------------------------------------------

/**
 * A mark printed on an award dossier.
 *
 * `asset` is deliberately a semantic key rather than an imported file path:
 * the view can use the real brand art when it exists and retain a labelled,
 * accessible wordmark while an asset is still pending. `href: null` means the
 * mark is identification only, never a disguised or dead link.
 */
export const awardBrandSchema = z.object({
  asset: z.string().min(1),
  label: z.string().min(1),
  href: z.string().url().nullable(),
})
export type AwardBrand = z.infer<typeof awardBrandSchema>

/**
 * A competition result.
 *
 * Awards are held apart from projects on purpose. A project's copy describes
 * the product; anything it went on to win is recorded here and points back at
 * it by title. The reference runs one way only, so a reader who wants to know
 * what a product does never has to read around a placing to find out.
 */
export const awardSchema = z.object({
  title: z.string().min(1),
  event: z.string().min(1),
  host: z.string().min(1),
  date: z.string().min(1),
  team: z.string().min(1),
  /**
   * What was actually judged. Hardcoding "Final pitch" in the view was wrong
   * the moment a second award arrived: the PPL award went to the delivered
   * system at an exhibition, and its own lesson says so explicitly.
   */
  stage: z.string().min(1),
  /**
   * Named credits, when the roster is small enough to print. A large team is
   * recorded as `teamSize` instead: listing nine names in a card that shows
   * one line of credits buries the award under its own footnote, and a
   * half-named roster is worse than an honest count.
   */
  members: z.array(z.string().min(1)).min(1).optional(),
  /** Head count, for a team too large to name. */
  teamSize: z.number().int().positive().optional(),
  /**
   * Title of the project this was won with, matching a `projectSchema` title
   * exactly. `null` for an award that belongs to no project on the site.
   * The match itself is enforced in ./index.ts — Zod validates each collection
   * in isolation and cannot see across them.
   */
  projectTitle: z.string().min(1).nullable(),
  story: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  /** A real field photograph mounted with the award, when one exists. */
  photo: z.object({
    asset: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    /**
     * Where the subject sits vertically, as a percentage down the source image,
     * used as the crop's object-position. A group shot with headroom needs a
     * different centre than one framed tight, and a single value tuned for one
     * photograph quietly mis-crops the next one added.
     */
    focusY: z.number().min(0).max(100).optional(),
  }).optional(),
  /** A first-person lesson kept distinct from the factual award record. */
  lesson: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }).optional(),
  /** The organisation credited beside the award heading. */
  partner: awardBrandSchema,
  /** The product identity mounted separately on the evidence photograph. */
  productMark: awardBrandSchema,
  /** Whether the written record physically pulls out from behind its plate. */
  presentation: z.enum(['pull-sheet', 'static']),
}).refine(
  (award) => award.members !== undefined || award.teamSize !== undefined,
  { message: 'an award needs either named members or a teamSize', path: ['members'] },
)
export type Award = z.infer<typeof awardSchema>

export const awardsSchema = z.array(awardSchema)

// Contact

/**
 * One line of the end-credit block. `role` is the credit itself — what this
 * route is for — so it is content rather than a decorative label above a value.
 */
export const contactSchema = z.object({
  role: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  /** Opens a new tab, and says so to a screen reader. */
  external: z.boolean(),
})
export type Contact = z.infer<typeof contactSchema>

export const contactsSchema = z.array(contactSchema).min(1)
