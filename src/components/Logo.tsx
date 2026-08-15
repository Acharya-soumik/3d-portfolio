import { useEffect, useRef } from 'react'
import { useScrollStore } from '../store/useScrollStore'

/**
 * The logo mark — the calligraphic "S" badge, circle-cropped. Replaces the
 * old extruded "S.A" text monogram everywhere (nav, footer, preloader).
 *
 * It spins slowly with scroll: one full revolution across the whole page,
 * riding the same smoothed scroll progress the 3D scene uses. The hover tilt
 * still composes on top (CSS `rotate` + inline `transform` are additive).
 */
export function Logo({ size = 'nav' }: { size?: 'nav' | 'footer' | 'loader' }) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const apply = (progress: number) => {
      if (ref.current) ref.current.style.transform = `rotate(${progress * 360}deg)`
    }
    apply(useScrollStore.getState().progress)
    return useScrollStore.subscribe((s) => apply(s.progress))
  }, [])

  return (
    <img
      ref={ref}
      className={`logo-mark logo-mark--${size}`}
      src="/logo.png"
      alt="Soumik Acharjee"
      width={512}
      height={512}
    />
  )
}
