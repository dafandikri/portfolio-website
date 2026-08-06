import { useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Box3,
  BufferGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { useInView } from '../../hooks/useInView'
import { hingedDoor, splitGateGeometry } from './gateGeometry'
import { gateMotion } from './gateMotion'
import { GATE_TORCHES, torchFlicker } from './gateTorches'
import ParkScene from './ParkScene'
import './GateScene.css'

/**
 * The gate itself, rendered.
 *
 * The CSS gate that preceded this could open, but it was never going to look
 * like the film — it was a drawing of a gate from memory. This is the actual
 * model, so the geometry and materials are right.
 *
 * The DAE arrives as one merged mesh. At load time its triangles are partitioned
 * into the stonework and two door leaves, then the leaves are placed on hinge
 * pivots. That keeps the reference model's geometry and textures while allowing
 * the doors to swing before the camera moves through them.
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
  const creditRef = useRef<HTMLDetailsElement>(null)
  const [failed, setFailed] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [projectsMounted, setProjectsMounted] = useState(false)
  const [projectsActive, setProjectsActive] = useState(false)

  /*
   * jsdom has no WebGL context, so this integration path is verified in a real
   * browser at closed, roar, mid-swing, open and through-the-gate positions.
   * The mesh partition and choreography it calls are covered as pure modules.
   */
  /* v8 ignore start */
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
      setProjectsMounted(true)
      setProjectsActive(true)
      return
    }

    const gl = renderer
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    gl.outputColorSpace = SRGBColorSpace
    gl.toneMapping = ACESFilmicToneMapping
    gl.toneMappingExposure = 0.76
    gl.shadowMap.enabled = true
    gl.shadowMap.type = PCFSoftShadowMap

    const scene = new Scene()
    scene.background = null

    const camera = new PerspectiveCamera(42, 1, 0.1, 40)

    /*
     * Real light, not colour painted over the mesh. A low blue hemisphere gives
     * the night an environment; one moon key produces directional form and a
     * shadow; the eight local point lights below put warm falloff on the stone.
     */
    scene.add(new HemisphereLight(new Color('#617493'), new Color('#100704'), 0.2))
    const key = new DirectionalLight(new Color('#9db8d6'), 0.76)
    key.position.set(1.8, 2.5, 2.8)
    key.castShadow = true
    key.shadow.mapSize.set(1536, 1536)
    key.shadow.camera.left = -1.7
    key.shadow.camera.right = 1.7
    key.shadow.camera.top = 1.7
    key.shadow.camera.bottom = -1.7
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 8
    key.shadow.bias = -0.00045
    key.shadow.normalBias = 0.018

    const rim = new DirectionalLight(new Color('#7d3f20'), 0.24)
    rim.position.set(-1.5, 0.4, -2.2)
    scene.add(key, rim)

    const textures = new TextureLoader()
    const albedo = textures.load('/gate/albedo.jpg')
    albedo.colorSpace = SRGBColorSpace
    const ao = textures.load('/gate/ao.jpg')
    const normal = textures.load('/gate/normal.png')
    const roughness = textures.load('/gate/roughness.jpg')
    const metallic = textures.load('/gate/metallic.jpg')
    const emissive = textures.load('/gate/emissive.jpg')
    emissive.colorSpace = SRGBColorSpace
    const textureSet = [albedo, ao, normal, roughness, metallic, emissive]
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    for (const texture of textureSet) texture.anisotropy = anisotropy

    let centre = new Vector3()
    let span = 1
    let ready = false
    let leftHinge: Group | null = null
    let rightHinge: Group | null = null
    const torchEffects: Array<{
      light: PointLight
      flame: Mesh
      core: Mesh
      halo: Mesh
      phase: number
      scale: number
      intensity: number
    }> = []

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let projectMountedState = reduced
    let projectActiveState = reduced
    if (reduced) {
      setProjectsMounted(true)
      setProjectsActive(true)
    }

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
        const sourceMesh = model.getObjectByProperty('isMesh', true) as Mesh | undefined
        if (!sourceMesh || !sourceMesh.parent) {
          setFailed(true)
          setProjectsMounted(true)
          setProjectsActive(true)
          return
        }

        /* AO uses the second UV channel. The source has one good unwrap, so
           duplicate it before partitioning the merged mesh into door pieces. */
        const uv = sourceMesh.geometry.getAttribute('uv')
        if (uv && !sourceMesh.geometry.getAttribute('uv1')) {
          sourceMesh.geometry.setAttribute('uv1', uv.clone())
        }

        const material = new MeshStandardMaterial({
          map: albedo,
          aoMap: ao,
          aoMapIntensity: 1.12,
          normalMap: normal,
          normalScale: new Vector2(0.72, 0.72),
          roughnessMap: roughness,
          metalnessMap: metallic,
          emissiveMap: emissive,
          emissive: new Color('#ff6e22'),
          emissiveIntensity: 0.34,
          roughness: 0.96,
          metalness: 0.72,
        })

        const pieces = splitGateGeometry(sourceMesh.geometry)
        const assembly = new Group()
        assembly.name = 'animated-gate'
        assembly.position.copy(sourceMesh.position)
        assembly.quaternion.copy(sourceMesh.quaternion)
        assembly.scale.copy(sourceMesh.scale)

        const staticGate = new Mesh(pieces.static, material)
        staticGate.castShadow = true
        staticGate.receiveShadow = true
        assembly.add(staticGate)
        leftHinge = hingedDoor(pieces.left, material, 'left')
        rightHinge = hingedDoor(pieces.right, material, 'right')
        for (const hinge of [leftHinge, rightHinge]) {
          const door = hinge.children[0] as Mesh
          door.castShadow = true
          door.receiveShadow = true
        }
        assembly.add(leftHinge, rightHinge)
        sourceMesh.parent.add(assembly)
        sourceMesh.parent.remove(sourceMesh)
        sourceMesh.geometry.dispose()

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

        /* A dark, rough receiving plane gives the pylons contact and lets the
           local lights pool on a surface. Without it the gate floats in a void,
           however detailed its material is. */
        const ground = new Mesh(
          new PlaneGeometry(span * 6, span * 5),
          new MeshStandardMaterial({
            /* Match the painted night at rest; only real light should reveal
               the floor, otherwise the plane produces a synthetic horizon. */
            color: new Color('#050301'),
            roughness: 1,
            metalness: 0,
            transparent: true,
            opacity: 0.42,
          }),
        )
        ground.rotation.x = -Math.PI / 2
        ground.position.set(0, box.min.y - centre.y - span * 0.065, -span * 0.35)
        ground.receiveShadow = true
        scene.add(ground)

        /*
         * Four torches per pylon, including the cap brazier. The tiny meshes are
         * the visible fire; each one also owns a real inverse-square point light
         * whose independent phase keeps the stone from pulsing in unison.
         */
        const flameGeometry = new ConeGeometry(span * 0.011, span * 0.052, 10)
        const coreGeometry = new ConeGeometry(span * 0.005, span * 0.032, 8)
        const haloGeometry = new SphereGeometry(span * 0.017, 10, 8)
        const flameMaterial = new MeshBasicMaterial({
          color: new Color('#ff681e'),
          transparent: true,
          opacity: 0.84,
          depthWrite: false,
          blending: AdditiveBlending,
        })
        const coreMaterial = new MeshBasicMaterial({
          color: new Color('#fff2b0'),
          transparent: true,
          opacity: 0.94,
          depthWrite: false,
          blending: AdditiveBlending,
        })
        const haloMaterial = new MeshBasicMaterial({
          color: new Color('#ff7a26'),
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
          blending: AdditiveBlending,
        })

        for (const torch of GATE_TORCHES) {
          const holder = new Group()
          holder.name = `gate-torch-${torch.side}-${torch.tier}`
          holder.position.set(...torch.position)
          const torchScale = torch.tier === 'cap' ? 1.28 : 1
          holder.scale.setScalar(torchScale)

          const flame = new Mesh(flameGeometry, flameMaterial)
          flame.position.y = span * 0.028
          const core = new Mesh(coreGeometry, coreMaterial)
          core.position.y = span * 0.023
          const halo = new Mesh(haloGeometry, haloMaterial)
          halo.position.y = span * 0.02
          const intensity = torch.tier === 'cap' ? 3.2 : 2.35
          const light = new PointLight(new Color('#ff7a25'), intensity, span * 0.58, 2)
          light.position.set(0, span * 0.028, span * 0.018)
          holder.add(halo, flame, core, light)
          model.add(holder)
          torchEffects.push({
            light,
            flame,
            core,
            halo,
            phase: torch.phase,
            scale: torchScale,
            intensity,
          })
        }

        scene.add(model)
        ready = true
        setModelReady(true)
      },
      undefined,
      () => {
        if (!disposed) {
          setFailed(true)
          setProjectsMounted(true)
          setProjectsActive(true)
        }
      },
    )

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      if (w === 0 || h === 0) return
      gl.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const tick = (time = 0) => {
      frame = requestAnimationFrame(tick)

      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const raw = travel <= 0 ? 0 : -rect.top / travel
      const progress = Math.min(1, Math.max(0, raw))
      const motion = gateMotion(progress, reduced)

      section.style.setProperty('--environment-strength', motion.environmentStrength.toFixed(3))
      section.style.setProperty('--gate-model-strength', motion.modelStrength.toFixed(3))
      section.style.setProperty('--gate-dolly-scale', (1 + motion.dollyProgress * 0.28).toFixed(3))
      section.style.setProperty('--gate-dolly-y', `${(motion.dollyProgress * -3.4).toFixed(3)}%`)
      section.style.setProperty('--credit-strength', motion.creditStrength.toFixed(3))
      const credit = creditRef.current
      if (credit) {
        const creditActive = motion.creditStrength > 0.05
        credit.inert = !creditActive
        credit.setAttribute('aria-hidden', String(!creditActive))
        if (!creditActive) credit.open = false
      }

      section.style.setProperty('--project-strength', motion.projectStrength.toFixed(3))
      const mountProjects = motion.projectStrength > 0.001
      const activateProjects = motion.projectStrength >= 0.98
      if (mountProjects !== projectMountedState) {
        projectMountedState = mountProjects
        setProjectsMounted(mountProjects)
      }
      if (activateProjects !== projectActiveState) {
        projectActiveState = activateProjects
        setProjectsActive(activateProjects)
      }

      if (!ready) return

      if (leftHinge && rightHinge) {
        // Both leaves swing away from the camera and into the park.
        leftHinge.rotation.y = motion.doorAngle
        rightHinge.rotation.y = -motion.doorAngle
      }

      section.style.setProperty('--roar-strength', motion.roarStrength.toFixed(3))
      const jolt = Math.sin(time * 0.075) * motion.roarStrength
      section.style.setProperty('--roar-x', `${(jolt * 5).toFixed(2)}px`)
      section.style.setProperty('--roar-y', `${(Math.abs(jolt) * -2).toFixed(2)}px`)

      for (const torch of torchEffects) {
        const flicker = reduced ? 0.9 : torchFlicker(time, torch.phase)
        torch.light.intensity = torch.intensity * flicker
        torch.flame.scale.set(
          0.86 + flicker * 0.14,
          0.72 + flicker * 0.34,
          0.86 + flicker * 0.14,
        )
        torch.core.scale.setScalar(0.82 + flicker * 0.18)
        torch.halo.scale.setScalar(0.72 + flicker * 0.32)
      }

      // The dolly starts only after the swing has cleared the opening.
      const eased = 1 - (1 - motion.dollyProgress) ** 2
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
      for (const texture of textureSet) texture.dispose()
      const materials = new Set<Material>()
      const geometries = new Set<BufferGeometry>()
      scene.traverse((child) => {
        const mesh = child as Mesh
        if (!mesh.isMesh) return
        geometries.add(mesh.geometry)
        const assigned = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const item of assigned) materials.add(item)
      })
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      gl.dispose()
    }
  }, [hasEntered])
  /* v8 ignore stop */

  return (
    <section
      ref={(node) => {
        sceneRef.current = node
        sectionRef.current = node
      }}
      className="scene scene--gate"
    >
      <div className={`gate__stage${projectsActive ? ' is-projects' : ''}`}>
        {/* Painted behind the canvas, so a device without WebGL still gets a lit
            night rather than a hole in the page. */}
        <div className="gate__picture" aria-hidden="true">
          <div className="gate__backdrop" />
          {hasEntered && !failed && (
            <canvas
              ref={canvasRef}
              className={`gate__canvas${modelReady ? ' is-ready' : ''}`}
            />
          )}
        </div>

        {/* The nearby animal remains off-screen. Only the pressure of its roar
            enters before the doors move; the jungle plate holds a different,
            distant silhouette deeper inside the reserve. */}
        <div className="gate__roar" aria-hidden="true">
          <span className="gate__echo gate__echo--1" />
          <span className="gate__echo gate__echo--2" />
          <span className="gate__echo gate__echo--3" />
          <span className="gate__roar-dust" />
        </div>

        {projectsMounted && (
          <div
            className={`gate__projects${projectsActive ? ' is-active' : ''}`}
            aria-hidden={!projectsActive}
            inert={!projectsActive}
          >
            <ParkScene />
          </div>
        )}

        <details ref={creditRef} className="gate__credit" inert aria-hidden="true">
          <summary aria-label="Gate model credit">i</summary>
          <p>
            Gate asset:{' '}
            <a
              href="https://sketchfab.com/3d-models/jurassic-park-gate-f85e89d2c0ef44beb3fe7fd7e72afdc7"
              target="_blank"
              rel="noreferrer noopener"
            >
              &ldquo;Jurassic Park Gate&rdquo;
            </a>{' '}
            by Mathzilla5335 ·{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer noopener license"
            >
              CC BY 4.0
            </a>
          </p>
          <p>Adapted for web: PBR maps resized, doors animated, and lighting rebuilt.</p>
        </details>
      </div>
    </section>
  )
}
