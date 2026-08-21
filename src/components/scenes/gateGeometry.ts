import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  type BufferAttribute,
  type MeshStandardMaterial,
  Vector3,
} from 'three'
import { classifyGateTriangle, type GatePart, type Point3 } from './gateMotion'

export interface SplitGateGeometry {
  static: BufferGeometry
  left: BufferGeometry
  right: BufferGeometry
}

/** Copy the model's unindexed triangles into the three pieces we can animate. */
export function splitGateGeometry(source: BufferGeometry): SplitGateGeometry {
  const names = Object.keys(source.attributes)
  const values = Object.fromEntries(
    (['static', 'left', 'right'] as GatePart[]).map((part) => [
      part,
      Object.fromEntries(names.map((name) => [name, [] as number[]])),
    ]),
  ) as Record<GatePart, Record<string, number[]>>
  const position = source.getAttribute('position')

  for (let first = 0; first < position.count; first += 3) {
    const point = (index: number): Point3 => [
      position.getX(index),
      position.getY(index),
      position.getZ(index),
    ]
    const part = classifyGateTriangle(point(first), point(first + 1), point(first + 2))

    for (const name of names) {
      const attribute = source.getAttribute(name) as BufferAttribute
      const target = values[part][name]!
      for (let vertex = first; vertex < first + 3; vertex += 1) {
        const offset = vertex * attribute.itemSize
        for (let item = 0; item < attribute.itemSize; item += 1) {
          target.push(Number(attribute.array[offset + item]))
        }
      }
    }
  }

  const make = (part: GatePart) => {
    const geometry = new BufferGeometry()
    for (const name of names) {
      const sourceAttribute = source.getAttribute(name) as BufferAttribute
      geometry.setAttribute(
        name,
        new Float32BufferAttribute(
          values[part][name]!,
          sourceAttribute.itemSize,
          sourceAttribute.normalized,
        ),
      )
    }
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }

  return { static: make('static'), left: make('left'), right: make('right') }
}

/** Put one extracted door on a pivot located at its outermost rail. */
export function hingedDoor(
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  side: 'left' | 'right',
): Group {
  const position = geometry.getAttribute('position')
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const hingeX = side === 'left' ? box.min.x : box.max.x
  const tolerance = 0.018
  let hingeZ = 0
  let samples = 0

  for (let i = 0; i < position.count; i += 1) {
    if (Math.abs(position.getX(i) - hingeX) > tolerance) continue
    hingeZ += position.getZ(i)
    samples += 1
  }
  hingeZ = samples > 0 ? hingeZ / samples : box.getCenter(new Vector3()).z

  geometry.translate(-hingeX, 0, -hingeZ)
  const pivot = new Group()
  pivot.name = `${side}-gate-hinge`
  pivot.position.set(hingeX, 0, hingeZ)
  pivot.add(new Mesh(geometry, material))
  return pivot
}
