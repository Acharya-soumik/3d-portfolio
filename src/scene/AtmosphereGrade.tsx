import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../store/useScrollStore'

// dusk (hero) → moonlit night (finale); the sky backdrop blends the same way
const BG_A = new THREE.Color('#242619')
const BG_B = new THREE.Color('#161d17')
const FOG_A = new THREE.Color('#2d2d1f')
const FOG_B = new THREE.Color('#1c2620')
const DAMP = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 8 : 3

/**
 * Grades scene fog + clear color with scroll so the whole valley — not just
 * the sky plane — slides from warm dusk into moonlit green as the moon comes
 * down the sky. Runs on the same damping as the moon and SkyBackdrop.
 */
export function AtmosphereGrade() {
  const damped = useRef(0)

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { progress } = useScrollStore.getState()
    damped.current = THREE.MathUtils.damp(damped.current, progress, DAMP, delta)
    const p = damped.current

    const bg = state.scene.background
    if (bg instanceof THREE.Color) bg.lerpColors(BG_A, BG_B, p)
    const fog = state.scene.fog
    if (fog) fog.color.lerpColors(FOG_A, FOG_B, p)
  })

  return null
}
