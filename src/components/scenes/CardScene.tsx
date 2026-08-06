import { useCallback, useState } from 'react'
import BusinessCard from '../BusinessCard'
import ScrollCue from '../ScrollCue'

/** Scene one: the finished American Psycho card and its quiet scroll cue. */
export default function CardScene() {
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  return (
    <section className="scene scene--card" aria-label="Business card introduction">
      <BusinessCard onReady={markReady} />
      <ScrollCue ready={ready} />
    </section>
  )
}
