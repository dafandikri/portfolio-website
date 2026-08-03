import { useEffect, useRef, useState } from 'react'
import TimeCircuits from '../TimeCircuits'
import { timeline } from '../../data/timeline'
import { useInView } from '../../hooks/useInView'
import './TimeCircuitsScene.css'

/**
 * The Back to the Future scene.
 *
 * The panel sticks while the roles scroll past it, and whichever role is
 * currently centred becomes the DESTINATION. PRESENT holds the current role and
 * LAST TIME DEPARTED holds the one before the destination — which is how the
 * prop behaves and how a career timeline reads.
 *
 * Scrolling is never intercepted. The scene reacts to where the page already is
 * rather than taking the wheel, so keyboard, trackpad momentum and find-in-page
 * all keep working.
 */
export default function TimeCircuitsScene() {
  // The scene begins exactly at the first viewport's lower edge. A positive
  // prefetch margin would therefore count it as visible on initial load and
  // defeat the lazy mount; shrinking the bottom edge waits for real scrolling.
  const [sceneRef, hasEntered] = useInView<HTMLElement>('0px 0px -12%', true)
  const [active, setActive] = useState(0)
  const stopRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!hasEntered) return
    const nodes = stopRefs.current.filter((n): n is HTMLElement => n !== null)
    if (nodes.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return

    // Track ratios for every stop and pick the most visible, so a fast scroll
    // cannot leave the panel showing a role that has already left the screen.
    const ratios = new Map<Element, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio)
        let best = 0
        let bestRatio = -1
        nodes.forEach((node, i) => {
          const ratio = ratios.get(node) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = i
          }
        })
        setActive(best)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [hasEntered])

  const present = timeline[0]
  if (!present) return null

  const destination = timeline[active] ?? present
  const departed = timeline[active + 1] ?? null

  return (
    <section
      ref={sceneRef}
      className="scene scene--circuits"
      aria-labelledby="experience-heading"
    >
      <h2 id="experience-heading" className="visually-hidden">
        Experience
      </h2>

      {hasEntered ? (
        <>
          <div className="circuits-scene__panel">
            <TimeCircuits destination={destination} present={present} departed={departed} />
          </div>

          <ol className="circuits-scene__stops">
            {timeline.map((stop, i) => (
              <li
                key={stop.entry.id}
                ref={(node) => {
                  stopRefs.current[i] = node
                }}
                className={`circuits-stop${i === active ? ' is-active' : ''}`}
              >
                <p className="circuits-stop__when">{stop.entry.monthLabel}</p>
                <h3 className="circuits-stop__title">{stop.entry.title}</h3>
                <p className="circuits-stop__date">{stop.entry.date}</p>
                <p className="circuits-stop__description">{stop.entry.description}</p>
                <ul className="circuits-stop__achievements">
                  {stop.entry.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="circuits-scene__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
