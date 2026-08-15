import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { fbm } from './noise'
import { useScrollStore } from '../store/useScrollStore'

const RADIUS = 14

// touch tracks tighter: a trailing moon against native scroll reads as jitter
const DAMP = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 8 : 3

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Moon path scrubbed to scroll: hangs high in the sky at the hero — fully
 * clear of the front ridge (which tops out near y≈89), so the disc is never
 * clipped — then drifts down and left across the journey to settle large and
 * centered behind the finale plinth, growing the whole way.
 */
export function moonPose(p: number) {
  return {
    x: lerp(52, 4, p),
    y: lerp(110, 44, p) + Math.sin(p * Math.PI) * 20,
    z: -290,
    scale: 1 + p * 1.6,
  }
}

// fixed shade direction: lit from upper-left, slightly toward camera
const LIGHT_DIR = new THREE.Vector3(-0.5, 0.42, 0.76).normalize()
const BRIGHT = new THREE.Color('#f7f1da')
const DARK = new THREE.Color('#4a4d3c')

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const haloFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float r = length(vUv * 2.0 - 1.0);
    float a = pow(max(0.0, 1.0 - r), 2.4) * 0.5;
    gl_FragColor = vec4(vec3(0.87, 0.86, 0.74), a);
  }
`

/**
 * A real 3D moon: crater-displaced sphere with lambert shading baked into
 * vertex colors (from a fixed light direction), so it always reads as a lit
 * body with a soft terminator — independent of scene lighting. Atmospheric
 * halo billboard sits behind it.
 */
export function Moon({ animate = true }: { animate?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(() => {
    const geo = mergeVertices(new THREE.SphereGeometry(RADIUS, 56, 40))
    const pos = geo.attributes.position
    const v = new THREE.Vector3()

    // displace: low-frequency maria + sharper crater noise
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = v.clone().normalize()
      const maria = fbm(n.x * 2.1 + 5, n.y * 2.1 + n.z * 1.7, 3) - 0.5
      const craters = Math.pow(fbm(n.x * 6 + 11, n.y * 6 + n.z * 5, 4), 2.2) - 0.25
      v.addScaledVector(n, maria * 0.55 + craters * 0.7)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()

    // bake lambert shading + albedo variation into vertex colors
    const normal = geo.attributes.normal
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    const nv = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      nv.fromBufferAttribute(normal, i)
      v.fromBufferAttribute(pos, i).normalize()
      // half-lambert wrap keeps the dark limb readable instead of pitch black
      const lambert = nv.dot(LIGHT_DIR) * 0.5 + 0.5
      // maria patches darken the albedo like the real moon's seas
      const albedo = 0.85 + (fbm(v.x * 2.6 + 21, v.y * 2.6 + v.z * 2.2, 3) - 0.5) * 0.45
      const t = Math.pow(lambert, 1.6) * albedo
      c.copy(DARK).lerp(BRIGHT, Math.min(1, t))
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        fog: false,
      }),
    [],
  )

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    [],
  )

  useFrame((_, rawDelta) => {
    const g = group.current
    if (!g) return
    const delta = Math.min(rawDelta, 0.1)
    const { progress } = useScrollStore.getState()
    const pose = moonPose(progress)
    if (!animate) {
      g.position.set(pose.x, pose.y, pose.z)
      g.scale.setScalar(pose.scale)
      return
    }
    const lambda = DAMP
    g.position.x = THREE.MathUtils.damp(g.position.x, pose.x, lambda, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, pose.y, lambda, delta)
    g.position.z = pose.z
    const s = THREE.MathUtils.damp(g.scale.x, pose.scale, lambda, delta)
    g.scale.setScalar(s)
  })

  const initial = moonPose(0)

  return (
    <group ref={group} position={[initial.x, initial.y, initial.z]}>
      {/* halo sits behind the sphere so the limb stays crisp */}
      <mesh position={[0, 0, -18]} material={haloMaterial}>
        <planeGeometry args={[RADIUS * 7.5, RADIUS * 7.5]} />
      </mesh>
      {/* yaw chosen so the baked-lit hemisphere faces the camera from the
          moon's raised hero position — a gibbous disc, terminator on the right */}
      <mesh geometry={geometry} material={material} rotation={[0.35, -0.4, 0]} />
    </group>
  )
}
