import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += vnoise(p) * a;
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * vec2(5.0, 1.6) + vec2(uTime * 0.016 + uSeed, uSeed);
    float n = fbm(p);
    // soft banks, fading at the plane's edges
    float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
               * smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float a = smoothstep(0.38, 0.78, n) * 0.15 * edge;
    gl_FragColor = vec4(vec3(0.42, 0.45, 0.36), a);
  }
`

const LAYERS = [
  { z: -22, y: 2.4, w: 150, seed: 1.7 },
  { z: -64, y: 3.0, w: 170, seed: 4.2 },
  { z: -108, y: 2.6, w: 180, seed: 7.9 },
  { z: -156, y: 3.4, w: 190, seed: 11.3 },
  { z: -205, y: 3.0, w: 200, seed: 15.8 },
]

/** Drifting ground-fog banks across the valley floor. */
export function FogLayers({ animate }: { animate: boolean }) {
  const materials = useMemo(
    () =>
      LAYERS.map(
        (l) =>
          new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: { uTime: { value: 0 }, uSeed: { value: l.seed } },
            transparent: true,
            depthWrite: false,
          }),
      ),
    [],
  )

  useFrame((state) => {
    if (!animate) return
    materials.forEach((m) => {
      m.uniforms.uTime.value = state.clock.elapsedTime
    })
  })

  return (
    <group>
      {LAYERS.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.z]} material={materials[i]}>
          <planeGeometry args={[l.w, 13]} />
        </mesh>
      ))}
    </group>
  )
}
