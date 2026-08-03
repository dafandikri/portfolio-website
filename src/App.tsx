import { lazy, Suspense } from 'react'
import CardScene from './components/scenes/CardScene'

/**
 * A sequence of cult-film set pieces, each carrying real content.
 *
 * Scene one is the American Psycho card. The scenes below it are code-split:
 * gating their *render* on an observer still shipped their JavaScript — Motion
 * included — in the first chunk, so the card paid for animation machinery it
 * never uses. Splitting the import is what actually keeps the landing instant.
 */
const DepartureScene = lazy(() => import('./components/scenes/DepartureScene'))
const TimeCircuitsScene = lazy(() => import('./components/scenes/TimeCircuitsScene'))

export default function App() {
  return (
    <main>
      <CardScene />
      {/* No spinner: the fallback reserves the scroll height the scenes will
          occupy, so nothing jumps when they arrive. */}
      <Suspense fallback={<div style={{ minHeight: '100svh' }} aria-hidden="true" />}>
        <DepartureScene />
        <TimeCircuitsScene />
      </Suspense>
    </main>
  )
}
