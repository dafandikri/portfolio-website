import { lazy, Suspense, type ReactNode } from 'react'
import CardScene from './components/scenes/CardScene'
import { useInView } from './hooks/useInView'

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
const GateScene = lazy(() => import('./components/scenes/GateScene'))
const VisitorCenterScene = lazy(() => import('./components/scenes/VisitorCenterScene'))

/**
 * Keep a full-height place in the document, but do not even request a scene's
 * JavaScript until the visitor gets within one viewport of it. This matters
 * most for the two Three.js scenes: code splitting alone still downloads a
 * lazy component immediately when React tries to render it.
 */
function DeferredScene({ name, children }: { name: string; children: ReactNode }) {
  const [sceneRef, shouldLoad] = useInView<HTMLDivElement>('100% 0px', true)

  return (
    <div ref={sceneRef} className="deferred-scene" data-deferred-scene={name}>
      {shouldLoad ? (
        <Suspense fallback={<div className="deferred-scene__fallback" aria-hidden="true" />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  )
}

export default function App() {
  return (
    <main>
      <CardScene />
      <DeferredScene name="departure"><DepartureScene /></DeferredScene>
      <DeferredScene name="experience"><TimeCircuitsScene /></DeferredScene>
      <DeferredScene name="projects"><GateScene /></DeferredScene>
      <DeferredScene name="awards"><VisitorCenterScene /></DeferredScene>
    </main>
  )
}
