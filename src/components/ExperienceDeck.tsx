import { motion, AnimatePresence } from 'motion/react'
import { fullTitle, timeline } from '../data/timeline'
import totmTechnologiesCompanyLogo from '../assets/img/favicon/totm.png'
import systatumCompanyLogo from '../assets/img/favicon/systatum.png'
import kementransCompanyLogo from '../assets/img/favicon/kementrans.png'
import viciiCompanyLogo from '../assets/img/favicon/vicii-transparent.png'
import interbioCompanyLogo from '../assets/img/favicon/interbio.png'
import ristekCompanyLogo from '../assets/img/favicon/ristek.png'
import './ExperienceDeck.css'

/**
 * The roles, dealt as a hand of cards.
 *
 * Balatro's feel is springs, not easing curves. A bezier cannot overshoot and
 * settle — it has no memory of velocity — so the wobble that makes a card feel
 * like a physical object being picked up has to come from a real spring
 * simulation. That is the whole reason Motion is in the bundle.
 *
 * The hand fans out from the earliest role on the left to the current one on the
 * right, so reading left to right is reading forwards in time.
 */

/** Stiff and underdamped: it arrives fast and rings once, like a dealt card. */
const SPRING = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 } as const

/** Kept in step with the card's footer link in `src/data/card.ts`. */
const RESUME_HREF = '/cv-erdafa-andikri-portfolio-2026-08-22.pdf'

const COMPANY_LOGOS: Readonly<Record<string, string>> = {
  'totm-technologies': totmTechnologiesCompanyLogo,
  systatum: systatumCompanyLogo,
  kementrans: kementransCompanyLogo,
  vicii: viciiCompanyLogo,
  interbio: interbioCompanyLogo,
  ristek: ristekCompanyLogo,
}

export interface ExperienceDeckProps {
  /** Which role is currently punched into the circuits. */
  selectedId: string
  onSelect: (id: string) => void
}

export default function ExperienceDeck({ selectedId, onSelect }: ExperienceDeckProps) {
  const selected = selectedId

  // Oldest first, so the fan reads past → present left to right.
  const hand = [...timeline].reverse()
  const mid = (hand.length - 1) / 2
  const selectedIndex = hand.findIndex((stop) => stop.entry.id === selected)

  return (
    <div className="deck">
      <ul className="deck__hand">
        {hand.map((stop, i) => {
          const isOpen = selected === stop.entry.id
          const company = stop.entry.company
          const companyLogo = company ? COMPANY_LOGOS[stop.entry.logo] : undefined
          const companyLinkName = company?.linkName ?? company?.name
          // Fan the hand: each card rotates and lifts by its distance from the
          // middle, the way a hand of cards splays in a palm.
          const offset = i - mid
          /*
           * A raised card grows to 1.08 and would otherwise swallow whatever sits
           * beside it — measured at 36% of its neighbour's width. Its neighbours
           * step away from it instead, which both frees the card underneath and
           * is what a hand does when you pull one out of it.
           */
          const shove =
            selectedIndex < 0 || isOpen ? 0 : Math.sign(i - selectedIndex) * 13
          return (
            <motion.li
              key={stop.entry.id}
              className={`deck__card${isOpen ? ' is-open' : ''}`}
              initial={false}
              /*
               * Every property is restated in both states rather than only on
               * the raised one. A property named in one branch and omitted in
               * the other keeps its last value, which is what left a deselected
               * card stranded in the air.
               */
              animate={{
                rotate: isOpen ? 0 : offset * 4.5,
                x: shove,
                y: isOpen ? -26 : Math.abs(offset) * 9,
                scale: isOpen ? 1.08 : 1,
                /*
                 * Strictly left-to-right, with the raised card above everything.
                 * Stacking outwards from the middle instead — which is what
                 * `10 - |offset|` did — put the highest card in the centre and
                 * made the two halves of the fan overlap in opposite directions,
                 * so the middle cards were buried from both sides at once.
                 */
                zIndex: isOpen ? 30 : i,
              }}
              /*
               * Always a variant, never `undefined`. Swapping the whole prop out
               * for the raised card left a hover entry on the gesture stack with
               * nothing to override it, so a card deselected while the pointer
               * was still over it stayed in the air until the next pointer event
               * shook it loose — which is exactly the "only goes down if you
               * hover it" symptom. Same rule as `animate` below: state every
               * branch rather than omitting one.
               */
              whileHover={
                isOpen
                  ? { x: 0, y: -26, rotate: 0, scale: 1.08 }
                  : { x: shove, y: -14, rotate: offset * 2, scale: 1.04 }
              }
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
            >
              <button
                type="button"
                className="deck__face"
                aria-expanded={isOpen}
                /* Role and company are visible in separate physical zones; the
                   accessible name joins them into one useful card control. */
                aria-label={fullTitle(stop.entry)}
                onClick={() => onSelect(stop.entry.id)}
              >
                <span className="deck__year">{stop.year ?? ''}</span>
                <span className="deck__month">{stop.month ?? ''}</span>
                <span className="deck__role">{stop.entry.role}</span>
                {!company && <span className="deck__org">{stop.entry.org}</span>}
              </button>
              {company && (
                <a
                  className="deck__company"
                  href={company.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Visit ${companyLinkName} (opens in a new tab)`}
                  title={companyLinkName}
                >
                  {companyLogo && (
                    <img
                      className="deck__company-logo"
                      src={companyLogo}
                      alt=""
                      aria-hidden="true"
                      width="44"
                      height="44"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  )}
                  <span className="deck__company-name">{company.label}</span>
                </a>
              )}
            </motion.li>
          )
        })}
      </ul>

      {/* Detail stays deliberately shallow — the résumé is where depth lives. */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            className="deck__detail"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {(() => {
              const stop = hand.find((s) => s.entry.id === selected)
              if (!stop) return null
              return (
                <>
                  {/* The role reads as a lit sign above its own description,
                      rather than as a caption stranded at the bottom of the
                      scene where nothing connected it to the card you picked. */}
                  <p className="deck__detail-role">
                    <span className="deck__neon">{stop.entry.role}</span>
                  </p>
                  <p className="deck__detail-when">{stop.entry.date}</p>
                  <p className="deck__detail-text">{stop.entry.description}</p>
                  {/* The detail is deliberately one sentence; this is where the
                      depth actually lives, and where someone who has just read
                      the roles goes looking for it. */}
                  <a
                    className="deck__cv"
                    href={RESUME_HREF}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Full résumé
                  </a>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
