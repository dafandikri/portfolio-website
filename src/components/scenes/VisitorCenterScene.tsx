import { useState } from 'react'
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
  const visible = paged
    ? awardsData.slice(spread * PER_SPREAD, spread * PER_SPREAD + PER_SPREAD)
    : awardsData

  return (
    <section
      className="scene scene--archive"
      aria-labelledby="awards-heading"
      aria-hidden={!interactive}
    >
      <div className="x-archive">
        <div
          className="x-archive__shell"
          data-reveal-layer="award"
          inert={!interactive}
        >
          {/*
            The file's own cover, hinged at the spine. Purely scenery: the
            record beneath is in the document whether or not this ever swings,
            so a browser without view() timelines, or a visitor who asked for
            reduced motion, simply reads an open file.
          */}
          <span className="x-file__cover" aria-hidden="true">
            {/*
              Six gouges, two passes of three, matching the cut the paddock
              takes. Drawn rather than tiled: a repeating gradient crossed with
              itself into a diamond lattice, which read as chain-link fence.
            */}
            <svg className="x-file__cover-mark" viewBox="0 0 200 200" aria-hidden="true">
              <g strokeLinecap="round" fill="none">
                {/* Two families of three, crossing at the centre: the same X
                    the paddock takes, at the same handedness. */}
                {SCRATCHES.map((n) => (
                  <line
                    key={`fall-${n}`}
                    x1={26}
                    y1={34 + (n - 1) * 24}
                    x2={174}
                    y2={112 + (n - 1) * 24}
                    strokeWidth={4.6 - (n - 1) * 0.9}
                    opacity={0.92 - (n - 1) * 0.14}
                  />
                ))}
                {SCRATCHES.map((n) => (
                  <line
                    key={`rise-${n}`}
                    x1={26}
                    y1={166 - (n - 1) * 24}
                    x2={174}
                    y2={88 - (n - 1) * 24}
                    strokeWidth={4.2 - (n - 1) * 0.8}
                    opacity={0.8 - (n - 1) * 0.12}
                  />
                ))}
              </g>
            </svg>
            <span className="x-file__cover-stamp">Class X</span>
            <span className="x-file__cover-edge" />
          </span>

          <header className="x-archive__header">
            <div>
              <p className="x-archive__kicker">Field file · Class X</p>
              <h2 id="awards-heading" className="x-archive__heading" aria-label="Awards">
                Awards{' '}
                <span aria-hidden="true">/ {String(awardsData.length).padStart(2, '0')}</span>
              </h2>
            </div>
            <p className="x-archive__deck">
              The product was ready. The business case wasn&rsquo;t.
            </p>
          </header>

          <ul className="x-archive__records" aria-label="Awards">
            {visible.map((award, index) => {
              const project = projectsData.find((candidate) => candidate.title === award.projectTitle)
              const lessonId = `award-lesson-${index}`

              return (
                <li key={`${award.event}-${award.title}`} className="x-archive__record">
                  {award.photo ? (
                    <figure className="x-archive__evidence">
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

                  <article className="x-archive__brief">
                    <div className="x-archive__identity">
                      <img src={AWARD_LOGOS[award.logo]} alt="" />
                      <div>
                        <p className="x-archive__event">{award.event} · {award.stage}</p>
                        <h3>{award.title}</h3>
                        <p className="x-archive__meta">{award.host} · {award.date}</p>
                      </div>
                    </div>

                    <p className="x-archive__story">{award.story}</p>

                    {award.lesson ? (
                      <aside className="x-archive__lesson" aria-labelledby={lessonId}>
                        <p>Pitch lesson</p>
                        <h4 id={lessonId}>{award.lesson.title}</h4>
                        <p>{award.lesson.body}</p>
                      </aside>
                    ) : null}

                    <ul className="x-archive__facts" aria-label="Pitch facts">
                      {award.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>

                    <footer className="x-archive__footer">
                      {project ? (
                        <a
                          className="x-archive__link"
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`View ${project.title} (opens in a new tab)`}
                        >
                          View {project.title}
                        </a>
                      ) : null}

                      {award.members ? (
                        <details className="x-archive__credits">
                          <summary>{award.team} · {award.members.length} members</summary>
                          <p>{award.members.join(' · ')}</p>
                        </details>
                      ) : (
                        <p className="x-archive__credits x-archive__credits--count">
                          {award.team} · {award.teamSize} members
                        </p>
                      )}
                    </footer>
                  </article>
                </li>
              )
            })}
          </ul>

          {paged ? (
            <nav className="x-file__turn" aria-label="Award pages">
              <button
                type="button"
                className="x-file__leaf"
                onClick={() => setSpread((n) => Math.max(0, n - 1))}
                disabled={spread === 0}
              >
                <span aria-hidden="true">&larr;</span> Previous
              </button>
              <p className="x-file__folio" aria-live="polite">
                Spread {spread + 1} of {spreads}
              </p>
              <button
                type="button"
                className="x-file__leaf"
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
