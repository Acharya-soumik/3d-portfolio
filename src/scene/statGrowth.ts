/**
 * Shared scrub math + layout for the stats chapter: the 3D towers, the DOM
 * plaques floating above them and the counters all derive from the same
 * chapter value, so chart and figures move as one.
 * Growth spans chapter ~0.55 → ~1.7 (the scroll through the stats section).
 */

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const TOWER_COUNT = 4

/** Per-tower growth 0..1 with a stagger, from the global chapter float. */
export function statGrowth(chapter: number): number[] {
  // done by ~1.45, a beat before the camera starts arcing away at 1.55
  const p = clamp01((chapter - 0.55) / 0.98)
  return Array.from({ length: TOWER_COUNT }, (_, i) =>
    easeOutCubic(clamp01((p - i * 0.12) / 0.55)),
  )
}

/** Tower layout: x position, final height, z offset. Order matches `stats` in content/data.ts. */
export const TOWERS = [
  { x: -8.5, h: 6.0, z: -33 }, // 20M+ users
  { x: -3.0, h: 9.5, z: -36 }, // $130M/yr — tallest
  { x: 2.5, h: 8.0, z: -34 }, // $350k/day
  { x: 8.0, h: 5.0, z: -37 }, // 100% JSS
]

/** Top of the stepped base — where every shaft starts. */
export const TOWER_BASE_TOP = 0.75
/** Gap between the glowing cap and the floating plaque's leader line. */
export const TOWER_CAP_LIFT = 0.55

const BASE_MAX_X = 8.5
const REF_FOV = 58 // camera fov before the velocity widening kicks in
export const VIEW_DIST = 27 // roughly camera → tower distance at the stats vantage

/**
 * The group only reads as a bar chart if the whole set fits the frame, so the
 * spread adapts to the viewport aspect: wide desktop pushes the towers apart
 * (room for the plaques), a portrait phone pulls them into a tight cluster.
 */
export function towerSpread(aspect: number): number {
  const halfW = VIEW_DIST * Math.tan((REF_FOV * Math.PI) / 180 / 2) * aspect
  return Math.min(1.18, Math.max(0.5, (halfW * 0.8) / (BASE_MAX_X + 1.8)))
}

/** Bars get slimmer with the spread so a phone shows obelisks, not slabs. */
export const towerWidthScale = (spread: number) => Math.min(1.12, Math.max(0.66, spread))
