import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Pedestal {
  pos: [number, number, number]
  columnH: number
  slabW: number
  seed: number
}

const rand = (seed: number) => {
  const x = Math.sin(seed * 91.7 + 47.3) * 43758.5453
  return x - Math.floor(x)
}

/** Stone pedestals with slowly hovering slabs — the projects gallery hall. */
export function Pedestals({ animate }: { animate: boolean }) {
  const slabs = useRef<(THREE.Mesh | null)[]>([])

  const pedestals = useMemo<Pedestal[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        pos: [
          (i % 2 === 0 ? 1 : -1) * (9 + rand(i) * 6),
          0,
          -70 - i * 9.5,
        ] as [number, number, number],
        columnH: 3.2 + rand(i + 9) * 2.4,
        slabW: 3.4 + rand(i + 21) * 1.4,
        seed: i * 3.1,
      })),
    [],
  )

  const stone = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7d8a72', roughness: 0.95 }),
    [],
  )
  const darkStone = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#5c6852', roughness: 0.96 }),
    [],
  )
  const ivory = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#cfccba', roughness: 0.85 }),
    [],
  )

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    pedestals.forEach((p, i) => {
      const slab = slabs.current[i]
      if (!slab) return
      slab.position.y = p.columnH + 1.3 + Math.sin(t * 0.5 + p.seed) * 0.3
      slab.rotation.y = Math.sin(t * 0.15 + p.seed) * 0.3
    })
  })

  return (
    <group>
      {pedestals.map((p, i) => (
        <group key={i} position={p.pos}>
          <mesh material={darkStone} position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.8, 3.6]} />
          </mesh>
          <mesh material={stone} position={[0, 0.8 + p.columnH / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, p.columnH, 2.2]} />
          </mesh>
          <mesh material={stone} position={[0, p.columnH + 1.0, 0]}>
            <boxGeometry args={[3.0, 0.4, 3.0]} />
          </mesh>
          <mesh ref={(el) => { slabs.current[i] = el }} material={ivory} position={[0, p.columnH + 1.3, 0]}>
            <boxGeometry args={[p.slabW, 0.22, p.slabW * 0.68]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
