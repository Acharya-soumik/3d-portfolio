import { SectionMark } from './SectionMark'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stats, brands } from '../content/data'
import type { Brand } from '../content/data'
import { IconSvg } from './TechIcon'
import { useScrollStore } from '../store/useScrollStore'
import { statGrowth } from '../scene/statGrowth'
import {
  registerStatPlaque,
  registerStatPlaqueRoot,
  statPlaquesAreLive,
} from '../scene/statPlaques'

gsap.registerPlugin(ScrollTrigger)

/**
 * The stats chapter is tall; a sticky viewport holds the chapter on screen
 * while the 3D towers rise behind it. Each figure lives on a plaque that the
 * scene pins above its tower's crown (see `StatPlaqueAnchors`), so the numbers
 * literally ride the monument they describe. Counters scrub with the same
 * growth curve the towers use.
 *
 * If WebGL never comes up the plaques stay in their static fallback grid —
 * `.is-live` is only added once the scene has driven a frame.
 */
export function Stats() {
  const root = useRef<HTMLElement>(null)
  const plaqueRoot = useRef<HTMLDivElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])
  const legendRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null)

  // scrub counters from the shared growth curve. Text writes re-layout the
  // plaques, so touch devices update at ~10Hz — imperceptible on a counter,
  // but it stops the per-frame layout churn that made phones hitch here.
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let lastWrite = 0
    const render = (chapter: number) => {
      if (coarse) {
        const now = performance.now()
        if (now - lastWrite < 100) return
        lastWrite = now
      }
      const growth = statGrowth(chapter)
      stats.forEach((s, i) => {
        const value = String(Math.round(s.value * growth[i]))
        const el = numRefs.current[i]
        const legend = legendRefs.current[i]
        if (el && el.textContent !== value) el.textContent = value
        if (legend && legend.textContent !== value) legend.textContent = value
      })
    }
    render(useScrollStore.getState().chapter)
    return useScrollStore.subscribe((state) => render(state.chapter))
  }, [])

  // hand the plaque nodes to the scene; drop back to the static grid if no frame
  // lands. A backgrounded tab has no rAF, so only start counting once visible —
  // and if the scene wakes up later it re-adds `is-live` itself.
  useEffect(() => {
    registerStatPlaqueRoot(plaqueRoot.current)
    let timer = 0
    const arm = () => {
      if (timer || document.visibilityState !== 'visible') return
      timer = window.setTimeout(() => {
        if (!statPlaquesAreLive()) plaqueRoot.current?.classList.remove('is-live')
      }, 1600)
    }
    arm()
    document.addEventListener('visibilitychange', arm)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', arm)
      registerStatPlaqueRoot(null)
    }
  }, [])

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-legend',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="stats" className="stats" ref={root}>
      <div className="stats-sticky">
        <div className="container">
          <SectionMark n="01">The numbers</SectionMark>
        </div>

        {/* plaques: pinned above each tower by the scene once WebGL is live */}
        <div className="stat-plaques is-live" ref={plaqueRoot}>
          {stats.map((s, i) => (
            <div
              className="stat-plaque"
              key={s.label}
              ref={(el) => { registerStatPlaque(i, el) }}
            >
              <p className="stat-plaque-value">
                {s.prefix && <span className="stat-prefix">{s.prefix}</span>}
                <span className="stat-num" ref={(el) => { numRefs.current[i] = el }}>
                  0
                </span>
                <span className="stat-fix">{s.suffix}</span>
              </p>
              <p className="stat-plaque-label">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="container stats-bottom">
          {/* narrow screens keep the plaques to bare figures — the copy reads here */}
          <ul className="stats-legend" aria-hidden="true">
            {stats.map((s, i) => (
              <li className="stat-legend" key={s.label}>
                <span className="stat-legend-value">
                  {s.prefix}
                  <span ref={(el) => { legendRefs.current[i] = el }}>0</span>
                  <span className="stat-fix">{s.suffix}</span>
                </span>
                <span className="stat-legend-label">{s.label}</span>
              </li>
            ))}
          </ul>

          <div className="brands">
            <p className="brands-title">My code runs in production for</p>
            <div
              className={`marquee${activeBrand ? ' is-paused' : ''}`}
              onMouseLeave={() => setActiveBrand(null)}
            >
              <div className="marquee-track">
                {[...brands, ...brands].map((b, i) => (
                  <span className="brand-cell" key={i}>
                    <button
                      type="button"
                      className={`brand${activeBrand?.name === b.name ? ' is-active' : ''}`}
                      aria-pressed={activeBrand?.name === b.name}
                      onMouseEnter={() => setActiveBrand(b)}
                      onFocus={() => setActiveBrand(b)}
                      onClick={() =>
                        setActiveBrand((cur) => (cur?.name === b.name ? null : b))
                      }
                    >
                      <IconSvg icon={b.icon} className="brand-icon" />
                      {b.name}
                    </button>
                    <span className="brand-sep" aria-hidden="true">
                      ✺
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <p className="brand-stat" key={activeBrand?.name ?? 'hint'}>
              {activeBrand ? (
                <>
                  <span className="brand-stat-name">{activeBrand.name}</span> — {activeBrand.stat}
                </>
              ) : (
                'Tap or hover a name ↑'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
