import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const CENTER: [number, number, number] = [0, 0, -142]
const STONES = 9
const RADIUS = 15

const rand = (seed: number) => {
  const s = Math.sin(seed * 93.9898 + 47.233) * 43758.5453
  return s - Math.floor(s)
}

/** A weathered standing-stone ring — the skills chapter's monument, with fireflies. */
export function StoneCircle({ animate }: { animate: boolean }) {
  const fireflies = useRef<THREE.Points>(null)

  const stones = useMemo(() => {
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#6b7660', roughness: 0.97 })
    return Array.from({ length: STONES }, (_, i) => {
      const angle = (i / STONES) * Math.PI * 2 + rand(i) * 0.25
      const h = 4.5 + rand(i + 11) * 2.8
      const geo = mergeVertices(new THREE.BoxGeometry(1.7, h, 1.1, 2, 3, 2))
      // weather the stone: displace vertices slightly
      const pos = geo.attributes.position
      for (let v = 0; v < pos.count; v++) {
        const n = rand(i * 100 + v)
        pos.setX(v, pos.getX(v) + (n - 0.5) * 0.3)
        pos.setZ(v, pos.getZ(v) + (rand(i * 100 + v + 7) - 0.5) * 0.25)
      }
      geo.computeVertexNormals()
      const mesh = new THREE.Mesh(geo, stoneMat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.set(
        CENTER[0] + Math.cos(angle) * RADIUS,
        CENTER[1] + h / 2 - 0.4,
        CENTER[2] + Math.sin(angle) * RADIUS,
      )
      mesh.rotation.y = -angle + Math.PI / 2 + (rand(i + 31) - 0.5) * 0.4
      mesh.rotation.z = (rand(i + 51) - 0.5) * 0.12
      return mesh
    })
  }, [])

  const { flyGeo, flyMat, flySeeds } = useMemo(() => {
    const count = 40
    const positions = new Float32Array(count * 3)
    const flySeeds = Array.from({ length: count }, (_, i) => ({
      r: 3 + rand(i + 3) * 11,
      a: rand(i + 17) * Math.PI * 2,
      y: 1 + rand(i + 29) * 5,
      speed: 0.1 + rand(i + 41) * 0.3,
      bob: rand(i + 53) * Math.PI * 2,
    }))
    const flyGeo = new THREE.BufferGeometry()
    flyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const flyMat = new THREE.PointsMaterial({
      size: 0.16,
      color: '#e4ecc9',
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { flyGeo, flyMat, flySeeds }
  }, [])

  useFrame((state) => {
    const pts = fireflies.current
    if (!pts) return
    const t = animate ? state.clock.elapsedTime : 0
    const pos = pts.geometry.attributes.position
    flySeeds.forEach((f, i) => {
      const a = f.a + t * f.speed
      pos.setXYZ(
        i,
        CENTER[0] + Math.cos(a) * f.r,
        f.y + Math.sin(t * 0.8 + f.bob) * 0.7,
        CENTER[2] + Math.sin(a) * f.r,
      )
    })
    pos.needsUpdate = true
  })

  return (
    <group>
      {stones.map((s, i) => (
        <primitive object={s} key={i} />
      ))}
      <points ref={fireflies} geometry={flyGeo} material={flyMat} frustumCulled={false} />
    </group>
  )
}
