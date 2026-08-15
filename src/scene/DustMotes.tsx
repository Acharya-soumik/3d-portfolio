import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Fine ivory dust drifting in the air — replaces the starfield. */
export function DustMotes({ count, animate }: { count: number; animate: boolean }) {
  const points = useRef<THREE.Points>(null)

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 130
      positions[i * 3 + 1] = Math.random() * 34
      positions[i * 3 + 2] = 25 - Math.random() * 300
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      size: 0.09,
      color: '#ded9b8',
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
    })
    return { geometry, material }
  }, [count])

  useFrame((state) => {
    if (!points.current || !animate) return
    const t = state.clock.elapsedTime
    points.current.rotation.y = Math.sin(t * 0.02) * 0.04
    points.current.position.y = Math.sin(t * 0.11) * 0.6
  })

  return <points ref={points} geometry={geometry} material={material} />
}
