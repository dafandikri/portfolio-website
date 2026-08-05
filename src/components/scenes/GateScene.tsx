import { useEffect, useRef, useState } from 'react'
import {
  AmbientLight,
  Box3,
  Color,
  MeshStandardMaterial,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type Mesh,
  type Object3D,
} from 'three'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { useInView } from '../../hooks/useInView'
import './GateScene.css'

/**
 * The gate itself, rendered.
 *
 * The CSS gate that preceded this could open, but it was never going to look
 * like the film — it was a drawing of a gate from memory. This is the actual
 * model, so the geometry and materials are right.
 *
 * What it costs: the doors do not move. The source mesh is a single merged
 * object with one node, so there is no door to rotate — the swing would need the
 * mesh split by vertex position at build time. Instead the camera does the work
 * and dollies through the opening, which is a fair trade for a gate that finally
 * reads as the real one.
 *
 * Purely choreographic, so hidden from assistive technology.
 */

/** Where the camera starts and ends, as a fraction of the model's own size. */
const DOLLY_FAR = 2.15
const DOLLY_NEAR = 0.12

export default function GateScene() {
  const [sceneRef, hasEntered] = useInView<HTMLElement>('0px 0px 10%', true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!hasEntered || !canvas || !section) return

    let disposed = false
    let frame = 0
    let renderer: WebGLRenderer | null = null

    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      // No WebGL: the scene degrades to its poster background rather than a
      // blank hole in the page.
      setFailed(true)
      return
    }

    const gl = renderer
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    gl.outputColorSpace = SRGBColorSpace

    const scene = new Scene()
    scene.background = null

    const camera = new PerspectiveCamera(42, 1, 0.1, 4000)

    /*
     * Night at the gate: one warm key standing in for the torches, a second on
     * the far side so the opening reads as a way through rather than a wall, and
     * just enough ambient that the stone is not pure black.
     */
    /*
     * Directional, not point. The file declares meter="0.01", so the gate is
     * over a thousand units across, and a point light's distance falloff leaves
     * nothing at all on geometry that size. Parallel light has no falloff, which
     * makes it scale-proof for an asset whose units you have not measured.
     */
    scene.add(new AmbientLight(new Color('#8a7350'), 1.15))
    const key = new DirectionalLight(new Color('#ffc070'), 2.6)
    key.position.set(0.45, 0.7, 1)
    const rim = new DirectionalLight(new Color('#ffd9a0'), 1.1)
    rim.position.set(-0.6, 0.2, -0.8)
    scene.add(key, rim)

    const textures = new TextureLoader()
    const albedo = textures.load('/gate/albedo.jpg')
    albedo.colorSpace = SRGBColorSpace
    const emissive = textures.load('/gate/emissive.jpg')
    emissive.colorSpace = SRGBColorSpace

    let centre = new Vector3()
    let span = 1
    let ready = false

    new ColladaLoader().load(
      '/gate/gate.dae',
      (collada) => {
        if (disposed || !collada?.scene) return
        const model: Object3D = collada.scene

        /*
         * The source has no material bindings, so every surface gets one built
         * here. Painting the albedo on directly is what makes it the film's gate
         * rather than untextured grey geometry.
         */
        model.traverse((child) => {
          const mesh = child as Mesh
          if (!mesh.isMesh) return
          mesh.material = new MeshStandardMaterial({
            map: albedo,
            emissiveMap: emissive,
            emissive: new Color('#ff9a3c'),
            emissiveIntensity: 1.1,
            roughness: 0.86,
            metalness: 0.08,
          })
        })

        /*
         * Framed from the model's own bounds rather than from hard-coded
         * numbers. The file is in centimetres with a Y-up axis, and guessing a
         * camera distance for an asset whose scale you have not measured is how
         * you end up inside the geometry.
         */
        /*
         * Measured from the geometry rather than from the object graph.
         * Box3.setFromObject returned an empty box here even though the mesh
         * carries 15,696 valid vertices, so the object-graph path is not to be
         * trusted for this asset — the attribute data is, and it is the same
         * data the GPU will draw.
         */
        /*
         * Drop the file's unit scaling. ColladaLoader honours meter="0.01" by
         * scaling the group to 0.01, which left the gate about two hundredths of
         * a unit across — closer to the camera than the near plane, so it was
         * clipped away entirely. Framing comes from geometry bounds below, so
         * the real-world unit is not information this scene needs.
         */
        model.scale.set(1, 1, 1)

        const box = new Box3()
        model.traverse((child) => {
          const mesh = child as Mesh
          if (!mesh.isMesh || !mesh.geometry) return
          mesh.geometry.computeBoundingBox()
          if (mesh.geometry.boundingBox) box.union(mesh.geometry.boundingBox)
        })
        centre = box.getCenter(new Vector3())
        span = Math.max(...box.getSize(new Vector3()).toArray()) || 1
        model.position.sub(centre)
        // Stand the camera at the height of the opening, not the model's middle.
        model.position.y -= span * 0.06
        scene.add(model)
        ready = true
      },
      undefined,
      () => {
        if (!disposed) setFailed(true)
      },
    )

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      if (w === 0 || h === 0) return
      gl.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (!ready) return

      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const raw = travel <= 0 ? 0 : -rect.top / travel
      // Reduced motion parks the camera at the approach and never moves it.
      const progress = reduced ? 0.18 : Math.min(1, Math.max(0, raw))

      // Ease the dolly so it slows as it arrives at the threshold.
      const eased = 1 - (1 - progress) ** 2
      const z = span * (DOLLY_FAR - (DOLLY_FAR - DOLLY_NEAR) * eased)
      camera.position.set(0, span * 0.02, z)
      camera.lookAt(0, 0, 0)

      resize()
      gl.render(scene, camera)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      albedo.dispose()
      emissive.dispose()
      gl.dispose()
    }
  }, [hasEntered])

  return (
    <section
      ref={(node) => {
        sceneRef.current = node
        sectionRef.current = node
      }}
      className="scene scene--gate"
      aria-hidden="true"
    >
      <div className="gate__stage">
        {/* Painted behind the canvas, so a device without WebGL still gets a lit
            night rather than a hole in the page. */}
        <div className="gate__backdrop" />
        {hasEntered && !failed && <canvas ref={canvasRef} className="gate__canvas" />}

        {/* The rex still leans in from the left, over the render. */}
        <div className="gate__rex">
          <span className="gate__rex-shape" />
          <span className="gate__echo gate__echo--1" />
          <span className="gate__echo gate__echo--2" />
          <span className="gate__echo gate__echo--3" />
        </div>
      </div>
    </section>
  )
}
