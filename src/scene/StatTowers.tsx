import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../store/useScrollStore'
import {
  statGrowth,
  towerSpread,
  towerWidthScale,
  TOWERS,
  TOWER_BASE_TOP,
} from './statGrowth'
import { fbm } from './noise'
import type { PerfTier } from '../hooks/usePerfTier'

/** Spacing of the carved gradation bands that the shaft climbs past. */
const TICK_STEP = 3

/**
 * Procedural stone: fine grain crossed with sedimentary strata. Mirrored wrap
 * keeps the tiling seamless as the shaft stretches past one repeat.
 */
function makeStoneTexture(): THREE.Texture {
  const S = 128
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(S, S)

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const grain = fbm(x * 0.14 + 5.2, y * 0.14 + 8.7, 4)
      const strata = Math.sin(y * 0.42 + fbm(x * 0.03, y * 0.02, 2) * 6) * 0.5 + 0.5
      const pit = fbm(x * 0.5, y * 0.5, 2) > 0.72 ? -14 : 0
      const v = Math.max(0, Math.min(255, 168 + grain * 74 + strata * 20 + pit))
      const o = (y * S + x) * 4
      img.data[o] = v
      img.data[o + 1] = v
      img.data[o + 2] = v
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.MirroredRepeatWrapping
  tex.wrapT = THREE.MirroredRepeatWrapping
  tex.anisotropy = 4
  return tex
}

/**
 * The signature moment: four carved towers rise out of the fog as the visitor
 * scrolls through the stats chapter — a monumental bar chart of the metrics.
 * Growth is scrubbed to scroll (scrolling back sinks them again) and the DOM
 * plaques in `Stats` ride each crown via `StatPlaqueAnchors`.
 */
export function StatTowers({ tier }: { tier: PerfTier }) {
  const detailed = tier !== 'low'
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const spread = towerSpread(aspect)
  const widthScale = towerWidthScale(spread)

  const risers = useRef<(THREE.Group | null)[]>([])
  const cornices = useRef<(THREE.Mesh | null)[]>([])
  const caps = useRef<(THREE.Mesh | null)[]>([])
  const tickGroups = useRef<(THREE.Group | null)[]>([])

  // unit-height geometry (0..1 in y) so one group scale drives the whole shaft
  const geo = useMemo(() => {
    const up = (g: THREE.BoxGeometry) => {
      g.translate(0, 0.5, 0)
      return g
    }
    return {
      shaft: up(new THREE.BoxGeometry(3, 1, 3)),
      pilaster: up(new THREE.BoxGeometry(0.5, 1, 0.5)),
      fluteX: up(new THREE.BoxGeometry(0.26, 1, 3.03)),
      fluteZ: up(new THREE.BoxGeometry(3.03, 1, 0.26)),
    }
  }, [])

  const stoneTex = useMemo(() => makeStoneTexture(), [])

  // one material per tower: each carries its own texture clone so the grain
  // scale can track that tower's height instead of stretching as it grows
  const stoneMats = useMemo(
    () =>
      TOWERS.map((_, i) => {
        const map = stoneTex.clone()
        map.needsUpdate = true
        map.offset.set(i * 0.19, i * 0.31)
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color('#78846b').offsetHSL(0, 0, (i % 2 ? 1 : -1) * 0.012),
          map,
          roughnessMap: map,
          roughness: 0.95,
          metalness: 0,
        })
      }),
    [stoneTex],
  )

  const baseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#5c6852', roughness: 0.96, metalness: 0 }),
    [],
  )
  const footMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4a5442', roughness: 0.98, metalness: 0 }),
    [],
  )
  const fluteMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#525c48', roughness: 0.98, metalness: 0 }),
    [],
  )
  const trimMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8e9a80', roughness: 0.88, metalness: 0 }),
    [],
  )
  const tickMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9aa88c',
        emissive: new THREE.Color('#c8d9b6'),
        emissiveIntensity: 0.12,
        roughness: 0.7,
      }),
    [],
  )
  const capMats = useMemo(
    () =>
      TOWERS.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: '#d9e6c9',
            emissive: new THREE.Color('#d9e6c9'),
            emissiveIntensity: 0,
            roughness: 0.5,
          }),
      ),
    [],
  )

  /** Fixed world heights of each tower's gradation bands. */
  const ticks = useMemo(
    () =>
      TOWERS.map((tw) =>
        Array.from({ length: Math.max(0, Math.floor((tw.h - 0.9) / TICK_STEP)) }, (_, k) => (k + 1) * TICK_STEP),
      ),
    [],
  )

  useFrame(() => {
    const { chapter } = useScrollStore.getState()
    const growth = statGrowth(chapter)

    TOWERS.forEach((tw, i) => {
      const t = growth[i]
      const h = Math.max(0.001, tw.h * t)
      const shown = t > 0.002

      const riser = risers.current[i]
      if (riser) {
        riser.scale.y = h
        riser.visible = shown
      }

      const map = stoneMats[i].map
      if (map) {
        const rep = Math.max(0.35, h / 3)
        if (Math.abs(map.repeat.y - rep) > 0.01) map.repeat.set(1, rep)
      }

      const cornice = cornices.current[i]
      if (cornice) {
        cornice.position.y = TOWER_BASE_TOP + h - 0.12
        cornice.visible = shown && h > 0.4
      }

      const cap = caps.current[i]
      if (cap) {
        cap.position.y = TOWER_BASE_TOP + h + 0.16
        cap.visible = shown
        // glow eases in as the tower reaches full height
        capMats[i].emissiveIntensity = Math.pow(t, 3) * 0.85
      }

      // bands sit at fixed heights: the shaft reveals them one by one as it climbs
      const group = tickGroups.current[i]
      if (group) {
        const rows = ticks[i]
        for (let k = 0; k < group.children.length; k++) {
          group.children[k].visible = shown && h > rows[k] + 0.45
        }
      }
    })
  })

  return (
    <group>
      {TOWERS.map((tw, i) => (
        <group key={i} position={[tw.x * spread, 0, tw.z]} scale={[widthScale, 1, widthScale]}>
          {/* stepped stylobate */}
          <mesh material={footMat} position={[0, 0.11, 0]} receiveShadow>
            <boxGeometry args={[4.9, 0.22, 4.9]} />
          </mesh>
          <mesh material={baseMat} position={[0, 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.15, 0.55, 4.15]} />
          </mesh>

          {/* everything that grows lives in one unit-height riser */}
          <group ref={(el) => { risers.current[i] = el }} position={[0, TOWER_BASE_TOP, 0]}>
            <mesh material={stoneMats[i]} geometry={geo.shaft} castShadow receiveShadow />
            {detailed && (
              <>
                {/* recessed fluting down the middle of all four faces */}
                <mesh material={fluteMat} geometry={geo.fluteX} />
                <mesh material={fluteMat} geometry={geo.fluteZ} />
                {/* corner pilasters catch the moonlight and thicken the silhouette */}
                {[
                  [-1.36, -1.36],
                  [1.36, -1.36],
                  [-1.36, 1.36],
                  [1.36, 1.36],
                ].map(([px, pz], k) => (
                  <mesh
                    key={k}
                    material={stoneMats[i]}
                    geometry={geo.pilaster}
                    position={[px, 0, pz]}
                  />
                ))}
              </>
            )}
          </group>

          {/* carved gradation bands at fixed heights — the chart's scale marks */}
          {detailed && (
            <group ref={(el) => { tickGroups.current[i] = el }}>
              {ticks[i].map((y) => (
                <mesh key={y} material={tickMat} position={[0, TOWER_BASE_TOP + y, 0]}>
                  <boxGeometry args={[3.18, 0.05, 3.18]} />
                </mesh>
              ))}
            </group>
          )}

          {/* cornice tucked under the crown */}
          <mesh ref={(el) => { cornices.current[i] = el }} material={trimMat}>
            <boxGeometry args={[3.42, 0.22, 3.42]} />
          </mesh>

          {/* glowing cap */}
          <mesh ref={(el) => { caps.current[i] = el }} material={capMats[i]}>
            <boxGeometry args={[3.62, 0.26, 3.62]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
