import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Every class a scene renders must have a rule somewhere.
 *
 * The paddock tear was deleted by an over-broad dead-CSS sweep and nothing
 * failed: the markup still rendered the claw marks, the paper wash and the
 * halftone, and every test still passed, because jsdom performs no layout and
 * no assertion cared whether those elements had any appearance. The scene
 * shipped with the transition silently gone.
 *
 * This is a source-level check on purpose. The property it guards — that a
 * class in the markup is styled at all — is not observable in jsdom, and a
 * screenshot review is not something CI runs. It is cheap, and it fails loudly
 * on exactly the mistake that was made.
 */
const SCENES = [
  ['VisitorCenterScene', 'src/components/scenes/VisitorCenterScene'],
  ['GateScene', 'src/components/scenes/GateScene'],
] as const

/** Classes applied by JS at runtime rather than written in the markup. */
const RUNTIME_ONLY = new Set([
  'is-active', 'is-holding', 'is-open', 'is-visible', 'is-ready',
  'is-awards', 'is-projects',
])

describe.each(SCENES)('%s styles', (_name, base) => {
  const markup = readFileSync(`${base}.tsx`, 'utf8')
  const styles = readFileSync(`${base}.css`, 'utf8')

  /* Both the plain `className="a b"` form and the template-literal form the
     scenes use for state classes. */
  const used = new Set<string>()
  for (const m of markup.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    for (const token of (m[1] ?? m[2] ?? '').split(/[\s${}?:'"]+/)) {
      const cls = token.trim()
      /* Only real class tokens: a scene's classes are all block__element or
         block--modifier, which excludes the bare identifiers that appear inside
         template-literal expressions. */
      if (!/^[a-z][a-z0-9_-]*$/i.test(cls)) continue
      if (!cls.includes('-')) continue
      if (RUNTIME_ONLY.has(cls)) continue
      used.add(cls)
    }
  }

  it('renders at least one class', () => {
    expect(used.size).toBeGreaterThan(3)
  })

  it('styles every class it renders', () => {
    /* A modifier that only marks state, and adds no appearance of its own, is
       covered by its block. Requiring a rule per modifier would push empty
       rulesets into the stylesheet to satisfy a test. */
    const covered = (cls: string) =>
      styles.includes(`.${cls}`) || (cls.includes('--') && styles.includes(`.${cls.split('--')[0]}`))
    const unstyled = [...used].filter((cls) => !covered(cls))
    expect(unstyled).toEqual([])
  })
})

/**
 * The award file has to paint above the paddocks.
 *
 * `.gate__projects` is positioned with a z-index, so it opens a stacking
 * context and its whole subtree paints as one layer — including the tear, whose
 * own z-index only orders it *within* that subtree. While the file sat below
 * that number it zoomed in, opened and held entirely behind the projects, and
 * the right-hand leaf was never seen. Nothing else caught it: the file was
 * correct in isolation, and every harness that tested it lacked the very layer
 * that was covering it.
 */
describe('award file stacking', () => {
  /* Comments are stripped first: these rules explain their own stacking, and a
     `z-index: 20` quoted in prose would otherwise be read as the declaration. */
  const zOf = (css: string, selector: string) => {
    const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const block = bare.slice(bare.indexOf(`${selector} {`))
    const match = block.slice(0, block.indexOf('}')).match(/z-index:\s*(\d+)/)
    return match ? Number(match[1]) : Number.NaN
  }

  it('paints above the projects layer it is revealed through', () => {
    const gate = readFileSync('src/components/scenes/GateScene.css', 'utf8')
    const archive = readFileSync('src/components/scenes/VisitorCenterScene.css', 'utf8')

    const projects = zOf(gate, '.gate__projects')
    const file = zOf(archive, '.scene--archive')

    expect(Number.isNaN(projects)).toBe(false)
    expect(Number.isNaN(file)).toBe(false)
    expect(file).toBeGreaterThan(projects)
  })

  it('keeps the stationary Tech Wizard leaf above the turning flap', () => {
    const archive = readFileSync('src/components/scenes/VisitorCenterScene.css', 'utf8')

    const flap = zOf(archive, '.x-book__flap')
    const techWizardLeaf = zOf(archive, '.x-book__leaf--recto')

    expect(Number.isNaN(flap)).toBe(false)
    expect(Number.isNaN(techWizardLeaf)).toBe(false)
    expect(techWizardLeaf).toBeGreaterThan(flap)
  })
})
