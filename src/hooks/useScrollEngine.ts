import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollStore, SECTION_IDS } from '../store/useScrollStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll (Lenis) + GSAP ScrollTrigger sync + chapter tracking.
 * Section top anchors are measured on load/resize; scroll position between
 * anchors produces a continuous `chapter` float (0..7) that drives the 3D camera.
 */
export function useScrollEngine() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // iOS fires resize every time the URL bar collapses mid-scroll; without
    // this, every trigger refreshes DURING the scroll and the page hitches
    ScrollTrigger.config({ ignoreMobileResize: true })
    const lenis = new Lenis({
      duration: reduced ? 0 : 1.1,
      smoothWheel: !reduced,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    let anchors: number[] = []
    const measure = () => {
      const scrollY = window.scrollY
      anchors = SECTION_IDS.map((id) => {
        const el = document.getElementById(id)
        if (!el) return 0
        return el.getBoundingClientRect().top + scrollY
      })
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        anchors[anchors.length - 1] + 1,
      )
      anchors.push(maxScroll)
    }

    let lastVelocity = 0
    lenis.on('scroll', (e: { velocity: number }) => {
      lastVelocity = e.velocity
    })

    const update = () => {
      if (anchors.length === 0) return
      const y = window.scrollY
      const maxScroll = anchors[anchors.length - 1]
      const progress = Math.min(1, Math.max(0, y / maxScroll))

      // find current anchor span
      let i = 0
      while (i < anchors.length - 2 && y >= anchors[i + 1]) i++
      const span = Math.max(1, anchors[i + 1] - anchors[i])
      const frac = Math.min(1, Math.max(0, (y - anchors[i]) / span))
      const chapter = i + frac
      // floor + small lead so a section highlights as it fills the viewport,
      // without flipping to the next one mid-section (projects is very tall)
      const chapterIndex = Math.min(SECTION_IDS.length - 1, Math.floor(chapter + 0.35))

      const state = useScrollStore.getState()
      if (
        state.chapterIndex !== chapterIndex ||
        Math.abs(state.chapter - chapter) > 0.0005 ||
        Math.abs(state.velocity - lastVelocity) > 0.05
      ) {
        useScrollStore.setState({ progress, chapter, chapterIndex, velocity: lastVelocity })
      }
    }

    lenis.on('scroll', update)
    window.addEventListener('scroll', update, { passive: true })

    // Same story for the camera anchors: a height-only resize on a touch
    // device is the browser chrome moving, not a real layout change — if we
    // re-measure, maxScroll shifts under the finger and the camera jumps.
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (coarse && window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      measure()
      update()
    }
    window.addEventListener('resize', onResize)

    // measure after layout + fonts settle
    measure()
    update()
    const t1 = window.setTimeout(onResize, 300)
    document.fonts?.ready.then(() => {
      measure()
      ScrollTrigger.refresh()
    })

    // The 300ms and fonts.ready passes both run while the preloader still holds
    // html.is-loading { overflow: hidden }, so anchors get measured against a
    // locked page. Re-measure once the preloader releases.
    const unsubReady = useScrollStore.subscribe((s) => {
      if (s.ready) {
        onResize()
        ScrollTrigger.refresh()
      }
    })

    return () => {
      window.clearTimeout(t1)
      unsubReady()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', update)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
