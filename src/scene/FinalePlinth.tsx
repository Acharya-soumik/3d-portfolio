import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** The finale: a single pedestal with a softly breathing glow — "let's make it happen". */
export function FinalePlinth({ animate }: { animate: boolean }) {
  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d9e6c9',
        emissive: new THREE.Color('#d9e6c9'),
        emissiveIntensity: 1.4,
        roughness: 0.4,
      }),
    [],
  )
  const stone = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7d8a72', roughness: 0.95 }),
    [],
  )
  const light = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    const breath = 1.2 + Math.sin(t * 0.9) * 0.35
    glowMat.emissiveIntensity = breath
    if (light.current) light.current.intensity = breath * 14
  })

  return (
    <group position={[0, 0, -238]}>
      <mesh material={stone} position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 1.0, 6.5]} />
      </mesh>
      <mesh material={stone} position={[0, 2.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 3.2, 4.2]} />
      </mesh>
      <mesh material={glowMat} position={[0, 4.4, 0]}>
        <boxGeometry args={[4.5, 0.35, 4.5]} />
      </mesh>
      <pointLight ref={light} position={[0, 6.5, 0]} color="#d9e6c9" distance={40} decay={1.8} intensity={16} />
    </group>
  )
}
