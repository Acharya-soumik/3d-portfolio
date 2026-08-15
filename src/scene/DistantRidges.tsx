import { useMemo } from 'react'
import * as THREE from 'three'
import { fbm } from './noise'

const RIDGES = [
  { z: -285, amp: 42, base: 2, color: '#2a3124', seed: 11 },
  { z: -310, amp: 55, base: 8, color: '#343a2b', seed: 23 },
  { z: -335, amp: 68, base: 16, color: '#3e4231', seed: 37 },
]

/** Silhouetted mountain layers behind the valley — hand-painted aerial perspective. */
export function DistantRidges() {
  const meshes = useMemo(
    () =>
      RIDGES.map((r) => {
        const geo = new THREE.PlaneGeometry(1100, 130, 110, 6)
        const pos = geo.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          const y = pos.getY(i)
          // displace only the upper edge into a ridgeline
          const t = (y + 65) / 130
          const ridge = Math.pow(fbm(x * 0.006 + r.seed, r.seed), 1.6) * r.amp
          pos.setY(i, -65 + t * (r.base + ridge + 65))
        }
        geo.computeVertexNormals()
        const mat = new THREE.MeshBasicMaterial({ color: r.color, fog: false })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(0, 45, r.z)
        return mesh
      }),
    [],
  )

  return (
    <group>
      {meshes.map((m, i) => (
        <primitive object={m} key={i} />
      ))}
    </group>
  )
}
