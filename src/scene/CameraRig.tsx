import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../store/useScrollStore'

// One keyframe per section anchor (7 sections + end of page = 8)
const POS: [number, number, number][] = [
  [0, 3.2, 15], // hero — among the clay forms
  [1.5, 4.2, -8], // stats — front row for the rising towers
  [16, 7.5, -50], // about — arcing high and wide of the tower group
  [-7, 4.5, -58], // projects — into the pedestal hall
  [0, 8, -100], // skills — rising toward the pebble cluster
  [-5, 9, -122], // experience
  [0, 10, -152], // contact — approaching the plinth
  [0, 8, -196], // end — settled before the glowing plinth
]

const LOOK: [number, number, number][] = [
  [0, 6, -60], // hero — down the valley toward the moon
  [-0.5, 5.5, -35],
  [-5, 4, -95],
  [2, 5, -100],
  [0, 6, -142], // skills — into the stone circle
  [2, 5.5, -158],
  [0, 7, -225],
  [0, 5.5, -238],
]

const smooth = (t: number) => t * t * (3 - 2 * t)

// Per-segment pacing. Segment 1 (stats → about) dwells at the stats vantage
// while the towers grow, then swings around them in the final stretch.
const SEGMENT_EASE: Record<number, (t: number) => number> = {
  1: (t) => smooth(Math.min(1, Math.max(0, (t - 0.55) / 0.45))),
}

export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  // On touch the camera tracks the finger much tighter: heavy damping makes
  // the rAF-driven scene visibly trail the native, compositor-driven scroll,
  // which reads as jitter. Desktop keeps the floatier cinematic lag.
  const touch = useRef(
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )
  const targetPos = useRef(new THREE.Vector3(...POS[0]))
  const targetLook = useRef(new THREE.Vector3(...LOOK[0]))
  const currentLook = useRef(new THREE.Vector3(...LOOK[0]))
  const a = useRef(new THREE.Vector3())
  const b = useRef(new THREE.Vector3())
  const smoothedSpeed = useRef(0)

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { chapter } = useScrollStore.getState()
    const i = Math.min(POS.length - 2, Math.floor(chapter))
    const frac = Math.min(1, Math.max(0, chapter - i))
    const f = (SEGMENT_EASE[i] ?? smooth)(frac)

    a.current.set(...POS[i])
    b.current.set(...POS[i + 1])
    targetPos.current.lerpVectors(a.current, b.current, f)

    a.current.set(...LOOK[i])
    b.current.set(...LOOK[i + 1])
    targetLook.current.lerpVectors(a.current, b.current, f)

    const cam = state.camera as THREE.PerspectiveCamera
    const lambda = reducedMotion ? 30 : touch.current ? 9 : 4.2

    // subtle idle float + mouse parallax
    const t = state.clock.elapsedTime
    const bobY = reducedMotion ? 0 : Math.sin(t * 0.5) * 0.18
    const px = reducedMotion ? 0 : state.pointer.x * 1.1
    const py = reducedMotion ? 0 : state.pointer.y * 0.55

    cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.current.x + px, lambda, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, targetPos.current.y + bobY + py, lambda, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.current.z, lambda, delta)

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, targetLook.current.x, lambda, delta)
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, targetLook.current.y, lambda, delta)
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, targetLook.current.z, lambda, delta)
    cam.lookAt(currentLook.current)

    // speed makes the world breathe: FOV widens and the frame rolls slightly
    if (!reducedMotion) {
      const { velocity } = useScrollStore.getState()
      const speed = Math.min(Math.abs(velocity) / 40, 1)
      smoothedSpeed.current = THREE.MathUtils.damp(smoothedSpeed.current, speed, 3, delta)
      const fovTarget = 58 + smoothedSpeed.current * 5
      if (Math.abs(cam.fov - fovTarget) > 0.01) {
        cam.fov = fovTarget
        cam.updateProjectionMatrix()
      }
      cam.rotation.z += Math.sign(velocity) * smoothedSpeed.current * 0.012
    }
  })

  return null
}
