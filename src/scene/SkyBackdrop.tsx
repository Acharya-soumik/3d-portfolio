import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../store/useScrollStore'
import { moonPose } from './Moon'

const PLANE_POS = new THREE.Vector3(0, 95, -352)
const PLANE_W = 1400
const PLANE_H = 420

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uProgress;
  uniform vec2 uMoonUv;
  varying vec2 vUv;
  void main() {
    // dusk palette (hero): warm amber horizon under a charcoal zenith
    vec3 zenithA = vec3(0.075, 0.086, 0.06);
    vec3 midA = vec3(0.155, 0.15, 0.10);
    vec3 horizonA = vec3(0.42, 0.35, 0.20);
    // moonlit palette (finale): deep green night, cool pale horizon
    vec3 zenithB = vec3(0.03, 0.052, 0.045);
    vec3 midB = vec3(0.06, 0.10, 0.085);
    vec3 horizonB = vec3(0.14, 0.21, 0.16);
    vec3 zenith = mix(zenithA, zenithB, uProgress);
    vec3 mid = mix(midA, midB, uProgress);
    vec3 horizon = mix(horizonA, horizonB, uProgress);
    float t = vUv.y;
    vec3 col = mix(horizon, mid, smoothstep(0.02, 0.32, t));
    col = mix(col, zenith, smoothstep(0.3, 0.85, t));
    // glow that follows the moon across the sky: warm at dusk, silver at night
    vec3 glowCol = mix(vec3(0.45, 0.36, 0.20), vec3(0.30, 0.35, 0.28), uProgress);
    float glow = smoothstep(0.55, 0.0, distance(vUv * vec2(1.0, 2.2), uMoonUv * vec2(1.0, 2.2))) * 0.12;
    col += glowCol * glow;
    gl_FragColor = vec4(col, 1.0);
  }
`

/**
 * Sky behind the whole valley. Not static: it grades from warm dusk at the
 * hero into a deep moonlit green as the visitor scrolls, and its glow patch
 * is re-projected every frame to sit behind wherever the moon currently is.
 */
export function SkyBackdrop() {
  const damped = useRef(0)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uProgress: { value: 0 },
          uMoonUv: { value: new THREE.Vector2(0.54, 0.55) },
        },
        fog: false,
        depthWrite: false,
      }),
    [],
  )

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { progress } = useScrollStore.getState()
    // same damping as the moon itself, so the grade and glow track its motion
    damped.current = THREE.MathUtils.damp(damped.current, progress, 3, delta)
    const p = damped.current
    material.uniforms.uProgress.value = p

    // project the moon onto the sky plane along the camera ray so the glow
    // stays behind the disc no matter where the camera has travelled
    const pose = moonPose(p)
    const cam = state.camera.position
    const dz = pose.z - cam.z
    if (dz < -1) {
      const t = (PLANE_POS.z - cam.z) / dz
      const hx = cam.x + (pose.x - cam.x) * t
      const hy = cam.y + (pose.y - cam.y) * t
      material.uniforms.uMoonUv.value.set(
        (hx - PLANE_POS.x) / PLANE_W + 0.5,
        (hy - PLANE_POS.y) / PLANE_H + 0.5,
      )
    }
  })

  return (
    <mesh position={PLANE_POS} material={material}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
    </mesh>
  )
}
