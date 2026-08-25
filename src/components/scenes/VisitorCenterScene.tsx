import { useEffect, useRef, useState } from 'react'
import { awardsData } from '../../data/awards'
import { projectsData } from '../../data/projects'
import type { AwardBrand } from '../../data/schema'
import { useInView } from '../../hooks/useInView'
import nashtaLogo from '../../assets/img/favicon/nashta.png'
import ristekLogo from '../../assets/img/favicon/ristek.png'
import siraLogo from '../../assets/img/favicon/sira.png'
import talkActiveLogo from '../../assets/img/favicon/talkactive.png'
import teamFamPhoto from '../../assets/img/awards/team-fam-best-presentation.webp'
import teamSiraPhoto from '../../assets/img/awards/team-sira-tech-wizard.webp'
import wolverineDance from '../../assets/img/awards/wolverine-dance.gif'
import './VisitorCenterScene.css'

const WOLVERINE_REVEAL_DELAY_MS = 2400
export const WOLVERINE_EXIT_MS = 520

const BRAND_LOGOS: Readonly<Partial<Record<string, string>>> = {
  'nashta-group': nashtaLogo,
  ristek: ristekLogo,
  sira: siraLogo,
  'talk-active': talkActiveLogo,
}

const AWARD_PHOTOS: Readonly<Record<string, string>> = {
  'team-fam-best-presentation': teamFamPhoto,
  'team-sira-tech-wizard': teamSiraPhoto,
}

const SCRATCHES = [1, 2, 3] as const

function BrandMark({ brand, placement }: {
  brand: AwardBrand
  placement: 'partner' | 'product'
}) {
  const logo = BRAND_LOGOS[brand.asset]
  const content = (
    <span
      className="x-brand__mark"
      data-brand-asset={brand.asset}
      data-asset-state={logo ? 'ready' : 'placeholder'}
    >
      {logo ? <img src={logo} alt={brand.href ? '' : brand.label} /> : null}
    </span>
  )
  const className = `x-brand x-brand--${placement} ${
    brand.href ? 'x-brand--linked' : 'x-brand--static'
  }`

  if (!brand.href) return <span className={className} title={brand.label}>{content}</span>

  return (
    <a
      className={className}
      href={brand.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Visit ${brand.label} (opens in a new tab)`}
      title={brand.label}
    >
      {content}
    </a>
  )
}

/** An original registration-stamp mark drawn in the page itself. */
function MutantFileMark() {
  return (
    <svg
      className="x-book__mark"
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="x-book__mark-ring x-book__mark-ring--outer" cx="120" cy="120" r="92" />
      <circle className="x-book__mark-ring x-book__mark-ring--inner" cx="120" cy="120" r="76" />
      <g className="x-book__mark-cross">
        <path d="M72 68 168 172" />
        <path d="M168 68 72 172" />
      </g>
      <g className="x-book__mark-register">
        <path d="M120 13v19M120 208v19M13 120h19M208 120h19" />
        <circle cx="120" cy="120" r="4" />
      </g>
    </svg>
  )
}

function ScarField({ direction }: { direction: 'rise' | 'fall' }) {
  return (
    <span className={`x-transition__scar-field x-transition__scar-field--${direction}`}>
      {SCRATCHES.map((scar) => (
        <span
          key={scar}
          className={`x-transition__scar x-transition__scar--${scar}`}
          data-gouge={scar}
        />
      ))}
    </span>
  )
}

/**
 * Printed directly over the live paddock DOM. Keeping the wash, dots and
 * gouges inside the project frame is what makes that scene become the comic
 * page instead of cutting to a look-alike background.
 */
export function PaddockSurfaceTransition() {
  return (
    <div className="x-transition__surface" aria-hidden="true">
      <span className="x-transition__paper-wash" />
      <span className="x-transition__halftone" data-halftone="paddock" />
      <ScarField direction="rise" />
      <ScarField direction="fall" />
    </div>
  )
}

/**
 * The printed achievement spread revealed behind the scratched paddock.
 *
 * GateScene owns the shared scroll clock so this layer can sit behind the live
 * project frame throughout the strike instead of entering as a second scene.
 */
/** A spread holds two pages, so anything beyond that has to be turned to. */
const PER_SPREAD = 2
/** One award, printed on one side of one leaf. */
function AwardLeaf({ award, side, id }: {
  award: (typeof awardsData)[number]
  side: 'verso' | 'recto'
  id: string
}) {
  const project = projectsData.find((c) => c.title === award.projectTitle)

  return (
    <article className={`x-book__leaf x-book__leaf--${side}`}>
      <div className="x-leaf">
        <div className="x-leaf__head">
          <BrandMark brand={award.partner} placement="partner" />
          <div>
            <p className="x-leaf__event">{award.event} · {award.stage}</p>
            <h3 className="x-leaf__title">{award.title}</h3>
            <p className="x-leaf__meta">{award.host} · {award.date}</p>
          </div>
        </div>

        <div className="x-leaf__evidence">
          {award.photo ? (
            <figure className="x-leaf__plate">
              <img
                src={AWARD_PHOTOS[award.photo.asset]}
                alt={award.photo.alt}
                width={award.photo.width}
                height={award.photo.height}
                decoding="async"
                style={{ objectPosition: `50% ${award.photo.focusY ?? 42}%` }}
              />
              <figcaption>{award.photo.caption}</figcaption>
            </figure>
          ) : null}
          <BrandMark brand={award.productMark} placement="product" />
        </div>

        <div
          className={`x-leaf__insert x-leaf__insert--${award.presentation}`}
          data-paper-reveal={award.presentation}
        >
          <p className="x-leaf__story">{award.story}</p>

          {award.lesson ? (
            <aside className="x-leaf__lesson" aria-labelledby={id}>
              <h4 id={id}>{award.lesson.title}</h4>
              <p>{award.lesson.body}</p>
            </aside>
          ) : null}

          <ul className="x-leaf__facts" aria-label="Award facts">
            {award.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>

          <footer className="x-leaf__foot">
            {project && project.liveLink !== '#' ? (
              <a
                className="x-leaf__link"
                href={project.liveLink}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`View ${project.title} (opens in a new tab)`}
              >
                View {project.title}
              </a>
            ) : null}
            {!award.members ? (
              <p className="x-leaf__team x-leaf__team--count">
                {award.team} · {award.teamSize} members
              </p>
            ) : null}
          </footer>
        </div>
      </div>

      {award.members ? (
        <details className="x-leaf__roster">
          <summary>
            <span>{award.team} roster</span>
            <small>{award.members.length} Team Members</small>
          </summary>
          <div className="x-leaf__roster-sheet">
            <p>{award.event} // {award.team}</p>
            <ol>
              {award.members.map((member) => <li key={member}>{member}</li>)}
            </ol>
          </div>
        </details>
      ) : null}
    </article>
  )
}

export default function VisitorCenterScene({ interactive = true }: { interactive?: boolean }) {
  const [sceneRef, isReading] = useInView<HTMLElement>('0px 0px -18%', false)
  const spreads = Math.ceil(awardsData.length / PER_SPREAD)
  const [spread, setSpread] = useState(0)
  const [wolverinePhase, setWolverinePhase] = useState<'hidden' | 'visible' | 'exiting'>('hidden')
  const wolverineOutRef = useRef(false)
  const paged = spreads > 1
  const visible = awardsData.slice(spread * PER_SPREAD, spread * PER_SPREAD + PER_SPREAD)
  const [verso, recto] = visible

  /* This is deliberately a reading-time surprise, not another scroll scrub.
     The shared camera first declares the folder fully interactive; only while
     the open spread is actually on screen do we start a short ordinary timer.
     Leaving or closing the scene resets it so Wolverine never dances over a
     different chapter. */
  useEffect(() => {
    if (interactive && isReading) {
      if (wolverineOutRef.current) return
      const timer = window.setTimeout(() => {
        wolverineOutRef.current = true
        setWolverinePhase('visible')
      }, WOLVERINE_REVEAL_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    if (!wolverineOutRef.current) {
      setWolverinePhase('hidden')
      return
    }

    wolverineOutRef.current = false
    setWolverinePhase('exiting')
    const timer = window.setTimeout(() => setWolverinePhase('hidden'), WOLVERINE_EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [interactive, isReading])

  /*
   * No clock of its own. The folder is inside the gate's sticky stage and rides
   * --archive-progress, the same value that paperizes the paddock and cuts the
   * X across it, so the tear and the arrival are one continuous move.
   */

  return (
    <section
      id="awards"
      ref={sceneRef}
      className="scene scene--archive"
      aria-labelledby="awards-heading"
      aria-hidden={!interactive}
    >
      <div className="x-stage">
        <div className="x-archive">
          <span
            className={`x-archive__wolverine${
              wolverinePhase === 'visible'
                ? ' is-visible'
                : wolverinePhase === 'exiting'
                  ? ' is-exiting'
                  : ''
            }`}
            aria-hidden="true"
          >
            <img
              src={wolverineDance}
              alt=""
              width="341"
              height="364"
              decoding="async"
              draggable="false"
            />
          </span>

          <header className="x-archive__header">
            <h2 id="awards-heading">Achievements</h2>
          </header>

          <div className="x-book" inert={!interactive}>
            <div className="x-book__spread">
              {/*
                The front board, and award one printed on the inside of it.
                They are one object: opening a folder does not leave its cover
                behind, it lays the cover down and what was inside it is now
                facing you. Rotating the pair through a full half-turn is what
                makes the left page arrive rather than merely fade up.
              */}
              {verso ? (
                <div className="x-book__flap">
                  <span className="x-book__cover" aria-hidden="true">
                    <span className="x-book__tab">Achievements</span>
                    <MutantFileMark />
                  </span>
                  <AwardLeaf award={verso} side="verso" id={`award-lesson-${spread}-0`} />
                </div>
              ) : null}

              {recto ? (
                <AwardLeaf award={recto} side="recto" id={`award-lesson-${spread}-1`} />
              ) : null}

              <span className="x-book__spine" aria-hidden="true" />
            </div>
          </div>

          {paged ? (
            <nav className="x-book__turn" aria-label="Award pages">
              <button
                type="button"
                className="x-book__leaf-btn"
                onClick={() => setSpread((n) => Math.max(0, n - 1))}
                disabled={spread === 0}
              >
                <span aria-hidden="true">&larr;</span> Previous
              </button>
              <p className="x-book__folio" aria-live="polite">
                Spread {spread + 1} of {spreads}
              </p>
              <button
                type="button"
                className="x-book__leaf-btn"
                onClick={() => setSpread((n) => Math.min(spreads - 1, n + 1))}
                disabled={spread === spreads - 1}
              >
                Next <span aria-hidden="true">&rarr;</span>
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  )
}
