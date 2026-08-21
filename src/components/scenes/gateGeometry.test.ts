import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DOMParser as XmlDomParser } from '@xmldom/xmldom'
import { MeshStandardMaterial, type Mesh } from 'three'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { hingedDoor, splitGateGeometry } from './gateGeometry'

beforeAll(() => {
  vi.stubGlobal('DOMParser', XmlDomParser)
})

/** Parse the exact asset shipped to visitors, not a simplified test double. */
function sourceMesh(): Mesh {
  const dae = readFileSync(resolve(process.cwd(), 'public/gate/gate.dae'), 'utf8')
  const parsed = new ColladaLoader().parse(dae, '')
  if (!parsed) throw new Error('gate.dae could not be parsed')
  const model = parsed.scene
  const mesh = model.getObjectByProperty('isMesh', true) as Mesh | undefined
  if (!mesh) throw new Error('gate.dae did not contain a mesh')
  return mesh
}

describe('gate geometry surgery', () => {
  it('extracts both complete doors from the real merged model', () => {
    const source = sourceMesh()
    const pieces = splitGateGeometry(source.geometry)

    expect(pieces.left.getAttribute('position').count / 3).toBe(272)
    expect(pieces.right.getAttribute('position').count / 3).toBe(272)
    expect(pieces.static.getAttribute('position').count / 3).toBe(4688)
  })

  it('places the two extracted leaves on opposite outside hinges', () => {
    const source = sourceMesh()
    const pieces = splitGateGeometry(source.geometry)
    const material = new MeshStandardMaterial()
    const left = hingedDoor(pieces.left, material, 'left')
    const right = hingedDoor(pieces.right, material, 'right')

    expect(left.name).toBe('left-gate-hinge')
    expect(right.name).toBe('right-gate-hinge')
    expect(left.position.x).toBeLessThan(0)
    expect(right.position.x).toBeGreaterThan(0)
    expect(left.children).toHaveLength(1)
    expect(right.children).toHaveLength(1)
  })
})
