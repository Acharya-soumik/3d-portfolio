import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../store/useScrollStore'
import {
  statGrowth,
  towerSpread,
  TOWERS,
  TOWER_BASE_TOP,
  TOWER_CAP_LIFT,
  VIEW_DIST,
} from './statGrowth'
import { markStatPlaquesLive, placeStatPlaque } from './statPlaques'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * Plaques only exist while the stats viewport is pinned: in as the chapter
 * takes over the frame, out as the sticky stage releases (~1.58) and the
 * camera starts arcing away.
 */
const chapterWindow = (c: number) => smoothstep(0.62, 0.85, c) * (1 - smoothstep(1.56, 1.76, c))

/**
 * Projects each tower's crown to screen space and drives the DOM plaques.
 * Renders nothing itself — it is the anchor half of `statPlaques`.
 */
export function StatPlaqueAnchors() {
  const v = useMemo(() => new THREE.Vector3(), [])
  /** projected crowns: x in 0..3, y in 4..7 */
  const pts = useMemo(() => new Float32Array(TOWERS.length * 2), [])

  /** Plaques were hidden last frame — skip the whole projection pass. */
  const idle = useMemo(() => ({ was: false }), [])

  useFrame(({ camera, size }) => {
    const { chapter } = useScrollStore.getState()
    const win = chapterWindow(chapter)

    // Outside the stats chapter every plaque is at opacity 0, but the pass
    // still projected four crowns and wrote four elements' styles every single
    // frame — DOM writes interleaved with the WebGL frame, for the whole rest
    // of the page. Do the last hiding pass, then stand down until it reopens.
    if (win <= 0) {
      // still claim the layout on frame one, or the section would render its
      // static fallback grid and then snap to floating plaques as you arrive
      markStatPlaquesLive()
      if (idle.was) return
      idle.was = true
      for (let i = 0; i < TOWERS.length; i++) placeStatPlaque(i, -1e4, -1e4, 1, 0)
      return
    }
    idle.was = false

    const growth = statGrowth(chapter)
    const spread = towerSpread((camera as THREE.PerspectiveCamera).aspect)

    // project every crown first: the tightest gap between neighbours decides
    // how big a plaque may be before the set starts colliding
    let tightest = Infinity
    for (let i = 0; i < TOWERS.length; i++) {
      const tw = TOWERS[i]
      v.set(tw.x * spread, TOWER_BASE_TOP + tw.h * growth[i] + TOWER_CAP_LIFT, tw.z)
      v.project(camera)
      pts[i] = (v.x * 0.5 + 0.5) * size.width
      pts[i + TOWERS.length] = (-v.y * 0.5 + 0.5) * size.height
      if (i > 0) tightest = Math.min(tightest, Math.abs(pts[i] - pts[i - 1]))
    }
    // narrow viewports drop the caption, so a plaque needs far less elbow room
    const fit = Math.min(1, tightest / (size.width < 900 ? 92 : 160))

    for (let i = 0; i < TOWERS.length; i++) {
      const tw = TOWERS[i]
      const h = tw.h * growth[i]
      v.set(tw.x * spread, TOWER_BASE_TOP + h + TOWER_CAP_LIFT, tw.z)

      const dist = camera.position.distanceTo(v)
      v.project(camera)
      const behind = v.z > 1
      const x = pts[i]
      const y = pts[i + TOWERS.length]

      // fade with the chapter, with the tower rising out of the ground, and
      // wherever the plaque would run off an edge
      let opacity = win * clamp01((growth[i] - 0.04) / 0.14)
      if (behind) opacity = 0
      else {
        opacity *=
          clamp01((x - 6) / 46) *
          clamp01((size.width - 6 - x) / 46) *
          clamp01((y - 36) / 56) *
          clamp01((size.height - y) / 80)
      }

      // gentle perspective so the plaques feel welded to the stone, shrunk
      // further whenever the towers crowd together on screen
      const scale = Math.max(
        0.5,
        Math.min(1.12, Math.sqrt(VIEW_DIST / Math.max(dist, 1))) * fit,
      )
      placeStatPlaque(i, x, y, scale, opacity)
    }

    markStatPlaquesLive()
  })

  return null
}
