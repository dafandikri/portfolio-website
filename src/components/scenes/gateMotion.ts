/** Scroll choreography for the Jurassic Park gate. */

export const GATE_OPEN_ANGLE = Math.PI * 0.54

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** A reversible ease whose endpoints have no velocity jump. */
export function smoothstep(from: number, to: number, value: number): number {
  if (from === to) return Number(value >= to)
  const t = clamp01((value - from) / (to - from))
  return t * t * (3 - 2 * t)
}

export interface GateMotion {
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
      doorAngle: GATE_OPEN_ANGLE,
      dollyProgress: 0,
      roarStrength: 0,
      projectStrength: 1,
      creditStrength: 0,
    }
  }

  const p = clamp01(progress)
  const roarIn = smoothstep(0.06, 0.12, p)
  const roarOut = 1 - smoothstep(0.3, 0.39, p)
  const creditIn = smoothstep(0.01, 0.08, p)
  const creditOut = 1 - smoothstep(0.6, 0.68, p)

  return {
    doorAngle: smoothstep(0.16, 0.4, p) * GATE_OPEN_ANGLE,
    dollyProgress: smoothstep(0.34, 0.68, p),
    roarStrength: roarIn * roarOut,
    // Attribution belongs to the gate shot, not the project interface. It
    // arrives gently after the scene enters and is gone when the dolly ends.
    creditStrength: creditIn * creditOut,
    /*
     * The handoff completes on the same scroll frame as the dolly. Once this
     * reaches one, the project cards run on their own CSS clock; the visitor
     * can stop the wheel and watch the deal finish.
     */
    projectStrength: smoothstep(0.66, 0.68, p),
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
