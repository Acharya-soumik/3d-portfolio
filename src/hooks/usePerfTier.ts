import { useMemo } from 'react'

export type PerfTier = 'low' | 'medium' | 'high'

interface NavigatorPerf extends Navigator {
  deviceMemory?: number
}

/**
 * Rough device capability tier. Controls particle counts, DPR cap and
 * postprocessing so the scene stays smooth on phones.
 *
 * Every touch-first or phone-width device is LOW, full stop. iOS Safari does
 * not expose deviceMemory (so it used to default high and land phones on
 * 'medium'), and medium keeps soft shadows + fullscreen Bloom running —
 * which is exactly what made iPhones stutter. Shadows, postprocessing and
 * high DPR are desktop luxuries.
 */
export function usePerfTier(): PerfTier {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'medium'
    const nav = navigator as NavigatorPerf
    const cores = nav.hardwareConcurrency ?? 8
    const memory = nav.deviceMemory ?? 8
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return 'low'
    if (cores <= 4 || memory <= 4) return 'medium'
    return 'high'
  }, [])
}

export function usePrefersReducedMotion(): boolean {
  return useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
}
