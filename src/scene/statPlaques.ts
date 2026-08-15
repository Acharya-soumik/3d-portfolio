/**
 * Bridge between the R3F scene and the DOM stat plaques.
 *
 * The plaques are real DOM (crisp type, selectable, in the a11y tree) but they
 * are positioned by the scene: every frame each tower's top is projected to
 * screen space and written straight to the element's transform. No React state
 * is involved — this runs at frame rate.
 */

import { TOWER_COUNT } from './statGrowth'

interface Placed {
  x: number
  y: number
  scale: number
  opacity: number
}

const els: (HTMLElement | null)[] = Array(TOWER_COUNT).fill(null)
const last: Placed[] = Array.from({ length: TOWER_COUNT }, () => ({
  x: -1e4,
  y: -1e4,
  scale: 1,
  opacity: -1,
}))

let root: HTMLElement | null = null
let live = false

export function registerStatPlaque(i: number, el: HTMLElement | null) {
  els[i] = el
}

export function registerStatPlaqueRoot(el: HTMLElement | null) {
  root = el
}

/** True once the scene has actually driven the plaques at least one frame. */
export function statPlaquesAreLive() {
  return live
}

/** Called from the render loop; flips the layout from static fallback to floating. */
export function markStatPlaquesLive() {
  if (live || !root) return
  live = true
  root.classList.add('is-live')
}

export function placeStatPlaque(i: number, x: number, y: number, scale: number, opacity: number) {
  const el = els[i]
  if (!el) return
  const prev = last[i]

  if (Math.abs(prev.x - x) > 0.2 || Math.abs(prev.y - y) > 0.2 || Math.abs(prev.scale - scale) > 0.002) {
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${scale.toFixed(3)})`
    prev.x = x
    prev.y = y
    prev.scale = scale
  }
  if (Math.abs(prev.opacity - opacity) > 0.004) {
    el.style.opacity = opacity.toFixed(3)
    // keep fully faded plaques out of hit-testing / paint entirely
    el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
    prev.opacity = opacity
  }
}
