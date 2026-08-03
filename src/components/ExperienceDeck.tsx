import { motion, AnimatePresence } from 'motion/react'
import { timeline } from '../data/timeline'
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

  return (
    <div className="deck">
      <ul className="deck__hand">
        {hand.map((stop, i) => {
          const isOpen = selected === stop.entry.id
          // Fan the hand: each card rotates and lifts by its distance from the
          // middle, the way a hand of cards splays in a palm.
          const offset = i - mid
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
                y: isOpen ? -26 : Math.abs(offset) * 9,
                scale: isOpen ? 1.08 : 1,
                zIndex: isOpen ? 20 : 10 - Math.abs(Math.round(offset)),
              }}
              whileHover={isOpen ? undefined : { y: -14, rotate: offset * 2, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
            >
              <button
                type="button"
                className="deck__face"
                aria-expanded={isOpen}
                onClick={() => onSelect(stop.entry.id)}
              >
                <span className="deck__year">{stop.year ?? ''}</span>
                <span className="deck__month">{stop.month ?? ''}</span>
                <span className="deck__title">{stop.entry.title}</span>
              </button>
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
                  <p className="deck__detail-when">{stop.entry.date}</p>
                  <p className="deck__detail-text">{stop.entry.description}</p>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
