import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

interface Hoverboard3DProps {
  onVisibilityChange?: (visible: boolean) => void
}

const MODEL_PATH = '/hoverboard/hoverboard.obj'
const MAP_PATHS = {
  color: '/hoverboard/base-color.webp',
  normal: '/hoverboard/normal.webp',
  metalness: '/hoverboard/metalness.webp',
  roughness: '/hoverboard/roughness.webp',
} as const

/** The original Onamani OBJ rendered as real geometry, not a warped image. */
export default function Hoverboard3D({ onVisibilityChange }: Hoverboard3DProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /*
   * jsdom has no WebGL context. Keep this browser integration outside the v8
   * threshold exactly like GateScene; the mounted canvas, lazy scene boundary,
   * attribution and content interactions remain covered by component tests.
   */
  /* v8 ignore start */
  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas || typeof WebGLRenderingContext === 'undefined') return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.16

    const scene = new Scene()
    const camera = new PerspectiveCamera(34, 1, 0.1, 50)
    camera.position.set(0, 3.25, 8.6)
    camera.lookAt(0, 0, 0)

    const rig = new Group()
    scene.add(rig)

    // Keep a forgiving invisible hit volume with the small prop. Rings and
    // wind streaks stay outside this group so they can never steal a click.
    const interactionGroup = new Group()
    rig.add(interactionGroup)

    const hoverEffects = new Group()
    hoverEffects.visible = false
    rig.add(hoverEffects)

    const hoverRings = Array.from({ length: 3 }, (_, index) => {
      const material = new MeshBasicMaterial({
        color: index === 1 ? 0xff3f9d : 0x57e9ff,
        transparent: true,
        opacity: 0.24,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      })
      const ring = new Mesh(new RingGeometry(0.34, 0.38, 64), material)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = -0.34 - index * 0.035
      ring.scale.set(1.85, 0.72, 1)
      hoverEffects.add(ring)
      return { ring, material, phase: index / 3 }
    })

    const windStreaks = Array.from({ length: 5 }, (_, index) => {
      const material = new MeshBasicMaterial({
        color: index % 2 === 0 ? 0x72efff : 0xff68b9,
        transparent: true,
        opacity: 0.12,
        blending: AdditiveBlending,
        depthWrite: false,
      })
      const streak = new Mesh(new BoxGeometry(0.92, 0.012, 0.018), material)
      streak.position.set(-1.25 - index * 0.14, -0.1 - index * 0.025, (index - 2) * 0.13)
      hoverEffects.add(streak)
      return { streak, material, phase: index / 5 }
    })

    const cyanFixtureMaterial = new MeshBasicMaterial({ color: 0x8af5ff, blending: AdditiveBlending })
    const pinkFixtureMaterial = new MeshBasicMaterial({ color: 0xff76bd, blending: AdditiveBlending })
    for (const [x, material] of [[-0.68, cyanFixtureMaterial], [0.68, pinkFixtureMaterial]] as const) {
      const fixture = new Mesh(new BoxGeometry(0.34, 0.028, 0.055), material)
      fixture.position.set(x, -0.22, -0.12)
      hoverEffects.add(fixture)
    }

    const hoverLight = new PointLight(0x55e8ff, 5, 3.2, 2)
    hoverLight.position.set(0, -0.52, 0)
    hoverEffects.add(hoverLight)
    const hoverPinkLight = new PointLight(0xff3c9d, 2.8, 2.4, 2)
    hoverPinkLight.position.set(0.72, -0.3, -0.12)
    hoverEffects.add(hoverPinkLight)

    scene.add(new AmbientLight(new Color(0xffd9e8), 1.3))
    const key = new DirectionalLight(0xfff1df, 4.1)
    key.position.set(4, 5, 7)
    scene.add(key)
    const cyanLight = new PointLight(0x43ddff, 17, 9, 2)
    cyanLight.position.set(-2.2, -1.4, 2.5)
    scene.add(cyanLight)
    const pinkLight = new PointLight(0xff2b8a, 11, 8, 2)
    pinkLight.position.set(2.8, 1.2, 1.4)
    scene.add(pinkLight)

    const resize = () => {
      const width = Math.max(1, root.clientWidth)
      const height = Math.max(1, root.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      if (width < 640) camera.position.set(0, 4.15, 11.6)
      else camera.position.set(0, 3.25, 8.6)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }
    resize()

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(root)
    if (!resizeObserver) window.addEventListener('resize', resize)

    let disposed = false
    let frame = 0
    let visible = true
    let loaded = false
    let boardOnScreen = false
    let modelRoot: Group | null = null
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let previousFrameAt = performance.now()
    let motionElapsed = 0
    const projectedPosition = new Vector3()
    const interactionOffset = new Vector3()
    const interactionVelocity = new Vector3()
    const interactionRotation = new Vector3()
    const angularVelocity = new Vector3()
    const pointer = new Vector2()
    const raycaster = new Raycaster()

    const intersectionAt = (event: PointerEvent) => {
      if (!loaded || !modelRoot) return null
      const rect = canvas.getBoundingClientRect()
      pointer.set(
        ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObject(modelRoot, true)[0] ?? null
    }

    const handlePointerMove = (event: PointerEvent) => {
      canvas.style.cursor = intersectionAt(event) ? 'pointer' : 'default'
    }

    const handlePointerLeave = () => { canvas.style.cursor = 'default' }

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion) return
      const hit = intersectionAt(event)
      if (!hit) return
      event.preventDefault()

      rig.getWorldPosition(projectedPosition)
      projectedPosition.project(camera)
      const horizontalHit = pointer.x - projectedPosition.x
      const verticalHit = pointer.y - projectedPosition.y

      // A poke pushes away from the side that was clicked. Translation and
      // angular momentum decay through springs below, so repeated clicks can
      // make the board briefly unruly without replacing its flight path.
      interactionVelocity.x += -horizontalHit * 3.4
      interactionVelocity.y += -verticalHit * 2.2
      interactionVelocity.z += 0.75 + Math.min(0.65, Math.abs(horizontalHit) * 1.8)
      angularVelocity.x += verticalHit * 3.2
      angularVelocity.y += -horizontalHit * 4.6
      angularVelocity.z += -horizontalHit * 3.4 + (Math.random() - 0.5) * 0.55
      canvas.style.cursor = 'grabbing'
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (reducedMotion || !loaded || (event.key !== 'Enter' && event.key !== ' ')) return
      event.preventDefault()
      interactionVelocity.x += 1.25
      interactionVelocity.y += 0.42
      interactionVelocity.z += 0.9
      angularVelocity.x += 0.75
      angularVelocity.y -= 2.2
      angularVelocity.z += 1.8
    }

    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', handlePointerLeave)
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('keydown', handleKeyDown)

    const announceBoardVisibility = () => {
      if (!loaded) return
      rig.getWorldPosition(projectedPosition)
      projectedPosition.project(camera)
      const nextOnScreen = Math.abs(projectedPosition.x) <= 1.08
        && Math.abs(projectedPosition.y) <= 1.08
        && projectedPosition.z >= -1
        && projectedPosition.z <= 1
      if (nextOnScreen === boardOnScreen) return
      boardOnScreen = nextOnScreen
      onVisibilityChange?.(nextOnScreen)
    }

    const draw = (now: number) => {
      if (!visible || disposed) return
      const delta = Math.min(0.05, Math.max(0.001, (now - previousFrameAt) / 1000))
      previousFrameAt = now
      if (loaded && !reducedMotion) {
        motionElapsed += delta
        const time = motionElapsed
        // Translation is real camera-space travel; scale changes come from
        // perspective as the mesh moves in Z, not from resizing an image.
        const cycleDuration = 11.5
        const flightCycle = Math.floor(time / cycleDuration)
        const flightProgress = (time % cycleDuration) / cycleDuration
        const flightDirection = flightCycle % 2 === 0 ? 1 : -1
        const orbitAngle = flightProgress * Math.PI * 2
        const lateralVelocity = flightDirection + Math.cos(orbitAngle) * 0.16
        const gust = Math.sin(time * 1.74) * 0.045 + Math.sin(time * 0.53) * 0.06
        // Alternate edge-to-edge passes. A small circular offset gives each
        // crossing a loop without ever parking the prop behind the cards.
        interactionVelocity.addScaledVector(interactionOffset, -3.6 * delta)
        interactionVelocity.multiplyScalar(Math.exp(-2.1 * delta))
        interactionOffset.addScaledVector(interactionVelocity, delta)
        angularVelocity.addScaledVector(interactionRotation, -4.2 * delta)
        angularVelocity.multiplyScalar(Math.exp(-2.25 * delta))
        interactionRotation.addScaledVector(angularVelocity, delta)

        rig.position.x = flightDirection * (flightProgress * 2 - 1) * 4.9
          + Math.sin(orbitAngle) * 0.55 + interactionOffset.x
        rig.position.y = 0.45 + Math.sin(orbitAngle) * 0.68
          + Math.sin(time * 0.82) * 0.1 + interactionOffset.y
        rig.position.z = Math.cos(orbitAngle) * 0.7 - 0.3 + interactionOffset.z
        rig.rotation.x = -0.28 + Math.cos(time * 0.9) * 0.1
          + Math.cos(time * 0.19) * 0.08 + interactionRotation.x
        rig.rotation.y = time * 0.34 + Math.sin(time * 0.23) * 0.2 + interactionRotation.y
        // Bank into lateral velocity; the smaller second signal reads as a
        // gust pressing on the deck rather than arbitrary wobble.
        rig.rotation.z = -lateralVelocity * 0.13 + gust + interactionRotation.z
        cyanLight.intensity = 15 + Math.sin(time * 2.7) * 3
        hoverLight.intensity = 4.4 + Math.sin(time * 3.1) * 1.25
        hoverPinkLight.intensity = 2.3 + Math.cos(time * 2.4) * 0.65

        hoverRings.forEach(({ ring, material, phase }) => {
          const pulse = (time * 0.72 + phase) % 1
          const spread = 1 + pulse * 1.35
          ring.scale.set(1.85 * spread, 0.72 * spread, 1)
          ring.position.y = -0.34 - pulse * 0.32
          material.opacity = (1 - pulse) * 0.3
        })

        windStreaks.forEach(({ streak, material, phase }) => {
          const flow = (time * 0.88 + phase) % 1
          streak.position.x = -flightDirection * (1.02 + flow * 1.55)
          streak.position.y = -0.08 - flow * 0.16 + Math.sin(time * 2.1 + phase * 8) * 0.025
          streak.scale.x = 0.45 + flow * 1.15
          material.opacity = Math.sin(Math.PI * flow) * (0.1 + Math.abs(lateralVelocity) * 0.1)
        })
      }
      renderer.render(scene, camera)
      announceBoardVisibility()
      frame = window.requestAnimationFrame(draw)
    }

    frame = window.requestAnimationFrame(draw)

    const textureLoader = new TextureLoader()
    Promise.all([
      new OBJLoader().loadAsync(MODEL_PATH),
      textureLoader.loadAsync(MAP_PATHS.color),
      textureLoader.loadAsync(MAP_PATHS.normal),
      textureLoader.loadAsync(MAP_PATHS.metalness),
      textureLoader.loadAsync(MAP_PATHS.roughness),
    ]).then(([object, colorMap, normalMap, metalnessMap, roughnessMap]) => {
      if (disposed) {
        colorMap.dispose()
        normalMap.dispose()
        metalnessMap.dispose()
        roughnessMap.dispose()
        return
      }

      colorMap.colorSpace = SRGBColorSpace
      for (const texture of [colorMap, normalMap, metalnessMap, roughnessMap]) {
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      }

      const material = new MeshStandardMaterial({
        map: colorMap,
        normalMap,
        metalnessMap,
        roughnessMap,
        metalness: 0.72,
        roughness: 0.66,
      })

      object.traverse((child) => {
        if (!(child instanceof Mesh)) return
        const previous = Array.isArray(child.material) ? child.material : [child.material]
        previous.forEach((entry) => entry.dispose())
        child.material = material
      })

      const bounds = new Box3().setFromObject(object)
      const size = bounds.getSize(new Vector3())
      // Keep it an atmospheric prop rather than letting it dominate the
      // dashboard. The wider camera on phones gives it breathing room too.
      const scale = 0.9 / Math.max(size.x, size.y, size.z)
      object.scale.setScalar(scale)
      const centeredBounds = new Box3().setFromObject(object)
      object.position.sub(centeredBounds.getCenter(new Vector3()))
      const hitTarget = new Mesh(
        new BoxGeometry(1.45, 0.55, 0.82),
        new MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
          colorWrite: false,
        }),
      )
      interactionGroup.add(object, hitTarget)
      hoverEffects.visible = true
      modelRoot = interactionGroup

      loaded = true
      motionElapsed = 0
      previousFrameAt = performance.now()
      if (reducedMotion) {
        rig.position.set(1.25, -0.15, -0.45)
        rig.rotation.set(-0.22, -0.55, -0.08)
      }
      renderer.render(scene, camera)
      announceBoardVisibility()
    }).catch(() => {
      // The experience remains usable if a model request is interrupted.
    })

    const visibilityObserver = reducedMotion || typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          const nextVisible = Boolean(entry?.isIntersecting)
          if (nextVisible === visible) return
          visible = nextVisible
          if (visible) {
            previousFrameAt = performance.now()
            frame = window.requestAnimationFrame(draw)
          }
          else window.cancelAnimationFrame(frame)
        })
    visibilityObserver?.observe(root)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('keydown', handleKeyDown)
      visibilityObserver?.disconnect()
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', resize)
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          const standard = material as MeshStandardMaterial
          standard.map?.dispose()
          standard.normalMap?.dispose()
          standard.metalnessMap?.dispose()
          standard.roughnessMap?.dispose()
          material.dispose()
        })
      })
      renderer.dispose()
    }
  }, [onVisibilityChange])
  /* v8 ignore stop */

  return (
    <div ref={rootRef} className="circuits-scene__hoverboard3d">
      <canvas
        ref={canvasRef}
        data-renderer="three"
        role="button"
        tabIndex={0}
        aria-label="Nudge the hoverboard flight path"
      />
    </div>
  )
}
