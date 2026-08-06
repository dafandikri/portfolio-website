import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

interface Hoverboard3DProps {
  onReady?: () => void
}

const MODEL_PATH = '/hoverboard/hoverboard.obj'
const MAP_PATHS = {
  color: '/hoverboard/base-color.webp',
  normal: '/hoverboard/normal.webp',
  metalness: '/hoverboard/metalness.webp',
  roughness: '/hoverboard/roughness.webp',
} as const

/** The original Onamani OBJ rendered as real geometry, not a warped image. */
export default function Hoverboard3D({ onReady }: Hoverboard3DProps) {
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
    camera.position.set(0, 3.25, 7.6)
    camera.lookAt(0, 0, 0)

    const rig = new Group()
    scene.add(rig)

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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startedAt = performance.now()

    const draw = (now: number) => {
      if (!visible || disposed) return
      const time = (now - startedAt) / 1000
      if (loaded && !reducedMotion) {
        // Translation is real camera-space travel; scale changes come from
        // perspective as the mesh moves in Z, not from resizing an image.
        rig.position.x = Math.sin(time * 0.27) * 2.4
        rig.position.y = Math.sin(time * 0.9) * 0.34 + Math.cos(time * 0.31) * 0.14
        rig.position.z = Math.sin(time * 0.19) * 1.15 - 0.28
        rig.rotation.x = -0.3 + Math.sin(time * 0.62) * 0.24
        rig.rotation.y = time * 0.4 + Math.sin(time * 0.23) * 0.24
        rig.rotation.z = Math.sin(time * 0.84) * 0.14
        cyanLight.intensity = 15 + Math.sin(time * 2.7) * 3
      }
      renderer.render(scene, camera)
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
      const scale = 4.15 / Math.max(size.x, size.y, size.z)
      object.scale.setScalar(scale)
      const centeredBounds = new Box3().setFromObject(object)
      object.position.sub(centeredBounds.getCenter(new Vector3()))
      rig.add(object)

      loaded = true
      if (reducedMotion) {
        rig.position.set(1.7, -0.25, -0.35)
        rig.rotation.set(-0.22, -0.55, -0.08)
      }
      renderer.render(scene, camera)
      onReady?.()
    }).catch(() => {
      // The experience remains usable if a model request is interrupted.
    })

    const visibilityObserver = reducedMotion || typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          const nextVisible = Boolean(entry?.isIntersecting)
          if (nextVisible === visible) return
          visible = nextVisible
          if (visible) frame = window.requestAnimationFrame(draw)
          else window.cancelAnimationFrame(frame)
        })
    visibilityObserver?.observe(root)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
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
  }, [onReady])
  /* v8 ignore stop */

  return (
    <div ref={rootRef} className="circuits-scene__hoverboard3d" aria-hidden="true">
      <canvas ref={canvasRef} data-renderer="three" />
    </div>
  )
}
