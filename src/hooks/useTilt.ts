import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * 3D tilt-toward-cursor on every element matching `selector` inside root.
 * Desktop (hover-capable) pointers only; respects reduced motion.
 */
export function useTiltGroup(
  root: RefObject<HTMLElement | null>,
  selector: string,
  maxDeg = 7,
) {
  useEffect(() => {
    const rootEl = root.current
    if (!rootEl) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = Array.from(rootEl.querySelectorAll<HTMLElement>(selector))
    const cleanups = cards.map((card) => {
      let raf = 0
      const onMove = (e: PointerEvent) => {
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          const rect = card.getBoundingClientRect()
          const px = (e.clientX - rect.left) / rect.width - 0.5
          const py = (e.clientY - rect.top) / rect.height - 0.5
          card.style.transform = `perspective(900px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) translateY(-4px)`
          card.style.setProperty('--shine-x', `${((px + 0.5) * 100).toFixed(1)}%`)
          card.style.setProperty('--shine-y', `${((py + 0.5) * 100).toFixed(1)}%`)
        })
      }
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        card.style.transform = ''
      }
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
      return () => {
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
        if (raf) cancelAnimationFrame(raf)
      }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [root, selector, maxDeg])
}
