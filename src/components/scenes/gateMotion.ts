/** Scroll choreography for the Jurassic Park gate. */

export const GATE_OPEN_ANGLE = Math.PI * 0.54
/**
 * Finish the gate shot before its sticky section releases. The remaining
 * quarter of the pin is a deliberate inspection hold for the project paddocks
 * rather than a one-wheel-notch glimpse before the next scene arrives.
 */
export const GATE_SEQUENCE_END = 0.587

/**
 * How much of the runway belongs to the gate chapter (the gate shot plus the
 * paddock inspection hold). The remainder paperizes the live paddock, cuts the
 * X across it and pushes it away from camera.
 *
 * Over a 660svh runway this is ~396svh of gate chapter — ~233svh of gate shot
 * and ~164svh of inspection hold — leaving ~264svh for the tear and the push.
 */
export const GATE_CHAPTER_SHARE = 0.6

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function gateSequenceProgress(rawProgress: number): number {
  return clamp01(rawProgress / GATE_SEQUENCE_END)
}

export interface ProjectAwardsProgress {
  gate: number
  archive: number
}

/** Split one unified sticky runway into two reversible local clocks. */
export function projectAwardsProgress(rawProgress: number): ProjectAwardsProgress {
  const progress = clamp01(rawProgress)
  return {
    gate: clamp01(progress / GATE_CHAPTER_SHARE),
    archive: clamp01((progress - GATE_CHAPTER_SHARE) / (1 - GATE_CHAPTER_SHARE)),
  }
}

/** A reversible ease whose endpoints have no velocity jump. */
export function smoothstep(from: number, to: number, value: number): number {
  if (from === to) return Number(value >= to)
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

export interface GateMotion {
  /** Jungle emerging only after the visitor enters the gate scene. */
  environmentStrength: number
  /** Physical gate resolving inside the established jungle world. */
  modelStrength: number
  /** Additional rotation applied to each door, in radians. */
  doorAngle: number
  /** Camera progress after the doors are safely out of its path. */
  dollyProgress: number
  /** Strength of the off-screen roar, from silent to full impact. */
  roarStrength: number
  /** Gate-to-project handoff after the camera has crossed the threshold. */
  projectStrength: number
  /** Visibility of the compact model-credit control during the gate shot. */
  creditStrength: number
}

/**
 * Convert one scroll value into the three beats of the shot.
 *
 * The rex roars first, the doors answer by swinging inward, and only then does
 * the camera cross the threshold. Keeping those windows separate prevents the
 * camera from passing through a door while it is still moving.
 */
export function gateMotion(progress: number, reducedMotion = false): GateMotion {
  if (reducedMotion) {
    return {
      environmentStrength: 1,
      modelStrength: 0,
      doorAngle: GATE_OPEN_ANGLE,
      dollyProgress: 0,
      roarStrength: 0,
      projectStrength: 1,
      creditStrength: 0,
    }
  }

  const p = clamp01(progress)
  const roarIn = smoothstep(0.12, 0.21, p)
  const roarOut = 1 - smoothstep(0.36, 0.46, p)
  const creditIn = smoothstep(0.09, 0.17, p)
  const creditOut = 1 - smoothstep(0.8, 0.9, p)

  return {
    environmentStrength: smoothstep(0.01, 0.15, p),
    modelStrength: smoothstep(0.07, 0.21, p),
    // The doors finish before the camera moves. The earlier windows overlapped,
    // which made the push feel hurried and allowed the viewer to read it as a
    // transition cut rather than physically travelling through the opening.
    doorAngle: smoothstep(0.24, 0.58, p) * GATE_OPEN_ANGLE,
    dollyProgress: smoothstep(0.62, 0.89, p),
    roarStrength: roarIn * roarOut,
    // Attribution belongs to the gate shot, not the project interface. It
    // arrives gently after the scene enters and is gone when the dolly ends.
    creditStrength: creditIn * creditOut,
    /*
     * The handoff overlaps the end of the dolly. Once this reaches one, the
     * project paddocks run on their own CSS clock; the visitor can stop the
     * wheel and inspect them.
     */
    // Reveal the paddocks while the camera is still passing beneath the gate.
    // Both scenes share the same jungle plate, so this reads as one location
    // coming into focus instead of a cut to a new screen.
    projectStrength: smoothstep(0.84, 0.99, p),
  }
}

export type GatePart = 'static' | 'left' | 'right'
export type Point3 = readonly [x: number, y: number, z: number]

/**
 * Locate the two doors inside the source model's single merged mesh.
 *
 * The DAE has no named door nodes, but the doors are the only triangles wholly
 * inside this central doorway box. These bounds select exactly 272 triangles
 * per leaf in the current asset, including the rails and X braces, while the
 * stone pylons and the sign remain static.
 */
export function classifyGateTriangle(a: Point3, b: Point3, c: Point3): GatePart {
  const points = [a, b, c]
  const insideDoorway = points.every(
    ([x, y]) => Math.abs(x) <= 0.48 && y >= -0.86 && y <= 0.255,
  )

  if (!insideDoorway) return 'static'

  const xs = points.map(([x]) => x)
  if (Math.max(...xs) < 0.025) return 'left'
  if (Math.min(...xs) > -0.025) return 'right'
  return 'static'
}
