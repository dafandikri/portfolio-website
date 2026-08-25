import type { MouseEvent } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { contact } from '../data/contact'
import { card } from '../data/card'
import './SiteFooter.css'

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'awards', label: 'Awards' },
  { id: 'contact', label: 'Contact' },
] as const

type SectionId = (typeof sections)[number]['id']

let cancelNavigationScroll: (() => void) | null = null

/** A slower, interruptible camera move for the end-slate navigation. */
function scrollToSection(top: number) {
  cancelNavigationScroll?.()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top, behavior: 'auto' })
    return
  }

  const from = window.scrollY
  const distance = top - from
  if (Math.abs(distance) < 1) return

  const duration = Math.min(1900, Math.max(1050, 680 + Math.abs(distance) * 0.07))
  const startedAt = performance.now()
  let frame = 0

  const interrupt = () => cancelNavigationScroll?.()
  const finish = () => {
    if (frame) window.cancelAnimationFrame(frame)
    window.removeEventListener('wheel', interrupt)
    window.removeEventListener('touchstart', interrupt)
    window.removeEventListener('pointerdown', interrupt)
    window.removeEventListener('keydown', interrupt)
    cancelNavigationScroll = null
  }

  cancelNavigationScroll = finish
  window.addEventListener('wheel', interrupt, { passive: true })
  window.addEventListener('touchstart', interrupt, { passive: true })
  window.addEventListener('pointerdown', interrupt, { passive: true })
  window.addEventListener('keydown', interrupt)

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    window.scrollTo({ top: from + distance * eased, behavior: 'auto' })

    if (progress < 1) frame = window.requestAnimationFrame(tick)
    else finish()
  }

  frame = window.requestAnimationFrame(tick)
}

/**
 * Projects and Awards share one long pinned camera runway on wide screens, so
 * their DOM nodes occupy the same visual stage. Native hash navigation would
 * land at the closed gate for both. Keep real hrefs, then place those two
 * destinations on the correct frame of the runway when the stage is sticky.
 */
function navigateToSection(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) return

  const target = document.getElementById(id)
  if (!target) return

  event.preventDefault()
  let top = target.getBoundingClientRect().top + window.scrollY
  const gate = document.querySelector<HTMLElement>('.scene--gate')
  const stage = gate?.querySelector<HTMLElement>('.gate__stage')
  const pinned = gate && stage && window.getComputedStyle(stage).position === 'sticky'

  if (pinned && (id === 'projects' || id === 'awards')) {
    const gateTop = gate.getBoundingClientRect().top + window.scrollY
    const travel = Math.max(0, gate.offsetHeight - window.innerHeight)
    // 30% is the uninterrupted paddock hold; 96% is the fully opened file.
    top = gateTop + travel * (id === 'projects' ? 0.3 : 0.96)
  }

  window.history.pushState(null, '', `#${id}`)
  scrollToSection(top)
}

/**
 * The slate.
 *
 * The site is a sequence of film sets, so it closes on the object that marks a
 * take rather than on a paragraph about closing. This is built, not drawn: a
 * hinged clapper arm over a chalked board, with real geometry and a hinge that
 * swings once when the board comes into view.
 *
 * A slate is also, structurally, exactly what a contact block is — a column of
 * field names against values. That is why the object earns its place instead of
 * decorating one: the form already matches the content.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear()
  const linkedIn = contact.find((line) => line.role === 'LinkedIn')?.href
    ?? 'https://www.linkedin.com/in/dafandikri/'
  /* The strike is scrubbed from the slate's travel through the viewport. It was
     built on a view() timeline, which is unavailable in enough browsers that the
     board simply rendered shut and never clapped at all. */
  const enterRef = useScrollProgress<HTMLElement>('--enter', 'pass')

  return (
    <footer id="contact" ref={enterRef} className="slate" aria-labelledby="slate-heading">
      <div className="slate__board">
        {/*
          The clapper: two halves of one stick. The arm swings down onto the
          fixed jaw, and both carry the same stripe geometry so the teeth
          interlock when it closes rather than merely overlapping.
        */}
        <div className="slate__clap" aria-hidden="true">
          <div className="slate__arm">
            <span className="slate__teeth" />
          </div>
          <div className="slate__jaw">
            <span className="slate__teeth" />
          </div>
          <span className="slate__hinge" />
        </div>

        <div className="slate__face">
          <div className="slate__head">
            <p className="slate__field">Prod.</p>
            <h2 id="slate-heading" className="slate__production">
              {card.name}
            </h2>
            <p className="slate__field slate__field--right">Date</p>
            <p className="slate__stamp">{year}</p>
          </div>

          <section className="slate__cta" aria-labelledby="slate-cta-heading">
            <p className="slate__field">Next take</p>
            <h3 id="slate-cta-heading">Got a hard problem and a real deadline? Put me on the call sheet.</h3>
            <a
              className="slate__cta-link"
              href={linkedIn}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Start the next take on LinkedIn (opens in a new tab)"
            >
              Start the next take
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" />
              </svg>
              <span className="visually-hidden"> on LinkedIn (opens in a new tab)</span>
            </a>
          </section>

          <nav className="slate__nav" aria-label="Portfolio sections">
            <p className="slate__field">Scenes</p>
            <ul>
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => navigateToSection(event, section.id)}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <dl className="slate__rows">
            {contact.map((line) => (
              <div key={line.href} className="slate__row">
                <dt className="slate__field">{line.role}</dt>
                <dd className="slate__value">
                  <a
                    className="slate__link"
                    href={line.href}
                    {...(line.external
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                  >
                    {line.label}
                    {line.external ? (
                      <svg
                        className="slate__away"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3.2 8.8 8.8 3.2" />
                        <path d="M4.4 3.2h4.4v4.4" />
                      </svg>
                    ) : null}
                    {line.external ? (
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    ) : null}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <p className="slate__tail">
            <span className="slate__field">Loc.</span>
            <span>Jakarta, Indonesia</span>
          </p>

          <p className="slate__copyright">
            &copy; {year} {card.name} <span aria-hidden="true">·</span>{' '}
            <a
              href="https://github.com/dafandikri/portfolio-website"
              target="_blank"
              rel="noreferrer noopener"
            >
              Source code
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
