import { useState } from 'react'
import TimeCircuits from '../TimeCircuits'
import { readoutFromStop } from '../../data/timeline'
import FluxCapacitor from '../FluxCapacitor'
import ExperienceDeck from '../ExperienceDeck'
import { useInView } from '../../hooks/useInView'
import { useClock } from '../../hooks/useClock'
import { timeline } from '../../data/timeline'
import './TimeCircuitsScene.css'

/**
 * The Back to the Future scene.
 *
 * The deck is the control and the circuits are the readout: picking a card sets
 * the destination, exactly as punching a date into the dashboard does. Selection
 * lives here rather than inside the deck so both readouts and the hand stay in
 * agreement — two components each holding their own idea of "current" is how
 * they drift apart.
 */
export default function TimeCircuitsScene() {
  const present = timeline[0]
  const [activeId, setActiveId] = useState<string | null>(present?.entry.id ?? null)
  const [sceneRef, hasEntered] = useInView<HTMLElement>('0px 0px -12%', true)
  // PRESENT TIME is the visitor's own clock, in their own timezone.
  const now = useClock()

  if (!present) return null

  const activeIndex = Math.max(
    0,
    timeline.findIndex((stop) => stop.entry.id === activeId),
  )
  const destination = timeline[activeIndex] ?? present
  const departed = timeline[activeIndex + 1] ?? null

  return (
    <section ref={sceneRef} className="scene scene--circuits" aria-labelledby="experience-heading">
      <h2 id="experience-heading" className="visually-hidden">
        Experience
      </h2>
      {hasEntered ? (
        <>
          {/* Dashboard: the capacitor sits to the left of the circuits, the
              way it does behind the seats, rather than floating alone. */}
          <div className="circuits-scene__top">
            <div className="circuits-scene__dash">
              <FluxCapacitor />
              <TimeCircuits
                destination={readoutFromStop(destination)}
                present={now}
                departed={readoutFromStop(departed)}
              />
            </div>
          </div>

          <ExperienceDeck selectedId={destination.entry.id} onSelect={setActiveId} />
        </>
      ) : (
        <div className="circuits-scene__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
