import { useMemo } from 'react'

export type PerfTier = 'low' | 'medium' | 'high'

interface NavigatorPerf extends Navigator {
  deviceMemory?: number
}

/**
 * Rough device capability tier. Controls particle counts, DPR cap and
 * postprocessing so the scene stays smooth on phones.
 */
export function usePerfTier(): PerfTier {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'medium'
    const nav = navigator as NavigatorPerf
    const cores = nav.hardwareConcurrency ?? 8
    const memory = nav.deviceMemory ?? 8
    const isMobile = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
    if (isMobile && (cores <= 4 || memory <= 4)) return 'low'
    if (isMobile || cores <= 4) return 'medium'
    return 'high'
  }, [])
}

export function usePrefersReducedMotion(): boolean {
  return useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
}
