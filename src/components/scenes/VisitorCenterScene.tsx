import { useState } from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { awardsData } from '../../data/awards'
import { projectsData } from '../../data/projects'
import ristekLogo from '../../assets/img/favicon/ristek.png'
import siraLogo from '../../assets/img/favicon/sira.png'
import teamFamPhoto from '../../assets/img/awards/team-fam-best-presentation.webp'
import teamSiraPhoto from '../../assets/img/awards/team-sira-tech-wizard.webp'
import './VisitorCenterScene.css'

const AWARD_LOGOS: Readonly<Record<string, string>> = {
  ristek: ristekLogo,
  sira: siraLogo,
}

const AWARD_PHOTOS: Readonly<Record<string, string>> = {
  'team-fam-best-presentation': teamFamPhoto,
  'team-sira-tech-wizard': teamSiraPhoto,
}

const SCRATCHES = [1, 2, 3] as const

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
export default function VisitorCenterScene({ interactive = true }: { interactive?: boolean }) {
  const spreads = Math.ceil(awardsData.length / PER_SPREAD)
  const [spread, setSpread] = useState(0)
  // Two awards fill one spread. Controls for pages that do not exist are worse
  // than no controls, so they appear only once the file actually has leaves.
  const paged = spreads > 1
  const visible = awardsData.slice(spread * PER_SPREAD, spread * PER_SPREAD + PER_SPREAD)

  /*
   * The section is a tall runway holding a sticky, viewport-height stage, and
   * `pin` measures progress across exactly the span the stage stays stuck. So
   * the wheel drives the shot while the page itself does not move: the book
   * arrives by growing toward the reader rather than by sliding up into frame.
   *
   * Arriving by scroll was the whole complaint. In document flow the section
   * necessarily slides into view, and a scale layered on top of that slide is
   * invisible — the translation dominates. Holding the stage still is what makes
   * a zoom legible as a zoom.
   */
  const enterRef = useScrollProgress<HTMLElement>('--enter', 'pin')

  return (
    <section
      ref={enterRef}
      className="scene scene--archive"
      aria-labelledby="awards-heading"
      aria-hidden={!interactive}
    >
      <div className="x-stage">
        <div className="x-archive">
          <header className="x-archive__header">
            <p className="x-archive__kicker">Field file · Class X</p>
            <h2 id="awards-heading" className="x-archive__heading" aria-label="Awards">
              Awards{' '}
              <span aria-hidden="true">/ {String(awardsData.length).padStart(2, '0')}</span>
            </h2>
          </header>

          <div className="x-book" data-open={paged ? 'paged' : 'single'} inert={!interactive}>
            <ul className="x-book__spread" aria-label="Awards">
              {visible.map((award, index) => {
                const project = projectsData.find((c) => c.title === award.projectTitle)
                const lessonId = `award-lesson-${spread}-${index}`

                return (
                  <li
                    key={`${award.event}-${award.title}`}
                    className={`x-book__leaf x-book__leaf--${index === 0 ? 'verso' : 'recto'}`}
                  >
                    <article className="x-leaf">
                      <div className="x-leaf__head">
                        <img className="x-leaf__logo" src={AWARD_LOGOS[award.logo]} alt="" />
                        <div>
                          <p className="x-leaf__event">{award.event} · {award.stage}</p>
                          <h3 className="x-leaf__title">{award.title}</h3>
                          <p className="x-leaf__meta">{award.host} · {award.date}</p>
                        </div>
                      </div>

                      {award.photo ? (
                        <figure className="x-leaf__plate">
                          <img
                            src={AWARD_PHOTOS[award.photo.asset]}
                            alt={award.photo.alt}
                            width={award.photo.width}
                            height={award.photo.height}
                            decoding="async"
                          />
                          <figcaption>{award.photo.caption}</figcaption>
                        </figure>
                      ) : null}

                      <p className="x-leaf__story">{award.story}</p>

                      {award.lesson ? (
                        <aside className="x-leaf__lesson" aria-labelledby={lessonId}>
                          <h4 id={lessonId}>{award.lesson.title}</h4>
                          <p>{award.lesson.body}</p>
                        </aside>
                      ) : null}

                      <ul className="x-leaf__facts" aria-label="Award facts">
                        {award.highlights.map((h) => <li key={h}>{h}</li>)}
                      </ul>

                      <footer className="x-leaf__foot">
                        {project ? (
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
                        {award.members ? (
                          <details className="x-leaf__team x-leaf__team--named">
                            <summary>{award.team} · {award.members.length} members</summary>
                            <p>{award.members.join(' · ')}</p>
                          </details>
                        ) : (
                          <p className="x-leaf__team x-leaf__team--count">
                            {award.team} · {award.teamSize} members
                          </p>
                        )}
                      </footer>
                    </article>
                  </li>
                )
              })}
            </ul>

            {/* The spine: a real gutter between the leaves, not a drawn line. */}
            <span className="x-book__spine" aria-hidden="true" />

            {/*
              The front board, hinged on the spine. Scenery only — every record
              is in the document whether or not this ever swings, so a browser
              that never runs the animation still reads an open book.
            */}
            <span className="x-book__cover" aria-hidden="true">
              <svg className="x-book__mark" viewBox="0 0 200 200">
                <g stroke="currentColor" strokeLinecap="round" fill="none" strokeWidth="9">
                  {SCRATCHES.map((n) => (
                    <line key={`f-${n}`} x1={38 + n * 16} y1="30" x2={104 + n * 16} y2="170" />
                  ))}
                  {SCRATCHES.map((n) => (
                    <line key={`r-${n}`} x1={104 + n * 16} y1="30" x2={38 + n * 16} y2="170" />
                  ))}
                </g>
              </svg>
              <span className="x-book__stamp">Class X</span>
            </span>
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
