/**
 * Flame locations measured from the source gate mesh.
 *
 * Each pylon carries three face sconces and one brazier at the cap. Keeping the
 * positions in model space means the light follows the gate instead of being a
 * screen-space glow painted over the render.
 */
export interface GateTorch {
  side: 'left' | 'right'
  tier: 'lower' | 'middle' | 'upper' | 'cap'
  position: readonly [x: number, y: number, z: number]
  phase: number
}

const LEFT: GateTorch[] = [
  { side: 'left', tier: 'lower', position: [-0.6, -0.43, 0.22], phase: 0.1 },
  { side: 'left', tier: 'middle', position: [-0.67, -0.05, 0.19], phase: 1.7 },
  { side: 'left', tier: 'upper', position: [-0.57, 0.45, 0.17], phase: 3.1 },
  { side: 'left', tier: 'cap', position: [-0.55, 0.905, 0.08], phase: 4.8 },
]

export const GATE_TORCHES: readonly GateTorch[] = [
  ...LEFT,
  ...LEFT.map<GateTorch>(({ tier, position: [x, y, z], phase }) => ({
    side: 'right',
    tier,
    position: [-x, y, z],
    phase: phase + 0.85,
  })),
]

/** Deterministic flicker; adjacent torches never pulse in unison. */
export function torchFlicker(timeMs: number, phase: number): number {
  const fast = Math.sin(timeMs * 0.018 + phase)
  const slow = Math.sin(timeMs * 0.0067 + phase * 1.9)
  return 0.86 + fast * 0.09 + slow * 0.05
}
