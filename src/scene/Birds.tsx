import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 11

const rand = (seed: number) => {
  const s = Math.sin(seed * 61.17 + 9.13) * 43758.5453
  return s - Math.floor(s)
}

/** A small flock crossing the valley sky in a slow ellipse. */
export function Birds({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)

  const birds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        offset: (rand(i) - 0.5) * 14,
        lift: (rand(i + 7) - 0.5) * 5,
        lag: rand(i + 13) * 0.35,
        flap: rand(i + 19) * Math.PI * 2,
        scale: 0.5 + rand(i + 23) * 0.4,
      })),
    [],
  )

  const wingGeo = useMemo(() => {
    // one bird = two thin triangles meeting at the body
    const geo = new THREE.BufferGeometry()
    const verts = new Float32Array([
      0, 0, 0, -1.4, 0.1, -0.35, -1.4, 0.1, 0.35, // left wing
      0, 0, 0, 1.4, 0.1, 0.35, 1.4, 0.1, -0.35, // right wing
    ])
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#141711', side: THREE.DoubleSide, fog: false }),
    [],
  )

  useFrame((state) => {
    if (!group.current || !animate) return
    const t = state.clock.elapsedTime * 0.035
    group.current.children.forEach((bird, i) => {
      const b = birds[i]
      const a = t - b.lag
      // wide, distant, slow arc — far enough to read as silhouettes,
      // shallow enough in z to never drift out of the visible sky
      const x = Math.cos(a * Math.PI * 2) * 72 + b.offset
      const z = -138 + Math.sin(a * Math.PI * 2) * 42 + b.offset * 0.5
      const y = 38 + b.lift + Math.sin(a * 7) * 1.2
      bird.position.set(x, y, z)
      bird.rotation.y = -a * Math.PI * 2
      // gentle bank into the turn + unhurried flap
      bird.rotation.x = Math.sin(a * Math.PI * 2) * 0.15
      const flap = Math.sin(state.clock.elapsedTime * 5.5 + b.flap) * 0.5
      bird.rotation.z = flap
      bird.scale.setScalar(b.scale)
    })
  })

  if (!animate) return null

  return (
    <group ref={group}>
      {birds.map((_, i) => (
        <mesh key={i} geometry={wingGeo} material={mat} frustumCulled={false} />
      ))}
    </group>
  )
}
