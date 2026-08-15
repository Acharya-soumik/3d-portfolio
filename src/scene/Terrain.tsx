import { useMemo } from 'react'
import * as THREE from 'three'
import { terrainHeight, fbm } from './noise'

const LOW = new THREE.Color('#20261b')
const MID = new THREE.Color('#3b4530')
const HIGH = new THREE.Color('#5c6549')
const PEAK = new THREE.Color('#8f947c')

/** The valley floor and flanking mountains the camera flies through. */
export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(780, 620, 150, 120)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const localY = pos.getY(i)
      const worldZ = -localY - 105 // plane recentered below via mesh position
      const h = terrainHeight(x, worldZ)
      pos.setZ(i, h)

      // color by altitude with a little noise jitter to avoid banding
      const jitter = (fbm(x * 0.11, worldZ * 0.11) - 0.5) * 3
      const hj = h + jitter
      if (hj < 3) c.copy(LOW).lerp(MID, hj / 3)
      else if (hj < 14) c.copy(MID).lerp(HIGH, (hj - 3) / 11)
      else c.copy(HIGH).lerp(PEAK, Math.min(1, (hj - 14) / 16))
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.computeVertexNormals()
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        metalness: 0,
      }),
    [],
  )

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation-x={-Math.PI / 2}
      position={[0, 0, -105]}
      receiveShadow
    />
  )
}
