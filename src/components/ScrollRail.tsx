import { useEffect, useRef } from 'react'

/** Never smaller than this, so the thumb stays a comfortable tap target. */
const MIN_THUMB = 48
/** How far one arrow-key press moves the page, in px. */
const KEY_STEP = 120
/** A tap on the bare track pages by this much of a screen. */
const PAGE = 0.85

/**
 * Touch-only scroll rail — the ONLY way to scroll the page on a touch device.
 *
 * Finger panning is switched off (see `html.rail-scroll` in the stylesheet) and
 * this rail drives the page instead. It replaced the hold-to-pop joystick: a
 * control you can't see is a control you don't know exists, and a rate-based
 * stick has no idea where you are in the document. This is a position slider —
 * the whole page maps to the height of the rail, so the thumb doubles as a
 * "you are here", and a drag lands you somewhere specific rather than
 * accelerating you in a direction.
 *
 * What deliberately still works:
 *   • taps, clicks and links — nothing preventDefaults a touch, so a tap still
 *     produces a click exactly as before
 *   • pinch to zoom — the page sets `touch-action: pinch-zoom`, not `none`;
 *     taking zoom away from someone who needs it is not a trade worth making
 *   • the keyboard — arrows/page keys/home/end still scroll, and the rail
 *     itself is focusable and takes arrow keys as a slider
 *   • the nav's section links, which jump the page programmatically
 *
 * Desktop never sees any of this.
 */
export function ScrollRail() {
  const root = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    const el = root.current
    const th = thumb.current
    if (!el || !th) return

    // the class is what actually disables finger panning; keep it tied to the
    // rail's own lifetime so the page is never left unscrollable
    const html = document.documentElement
    html.classList.add('rail-scroll')

    let trackH = 0
    let thumbH = MIN_THUMB
    let maxScroll = 1
    let dragging = false
    let grabOffset = 0
    let raf = 0

    const measure = () => {
      trackH = el.clientHeight
      const doc = html.scrollHeight
      maxScroll = Math.max(1, doc - window.innerHeight)
      // thumb length tells you how much of the document a screen covers
      thumbH = Math.max(MIN_THUMB, trackH * Math.min(1, window.innerHeight / doc))
      th.style.height = `${thumbH}px`
    }

    const paint = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      th.style.transform = `translateY(${(p * (trackH - thumbH)).toFixed(1)}px)`
      el.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    }

    // the page can be scrolled by things other than this rail (nav jumps, the
    // keyboard), so the thumb follows the scroll rather than owning it
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    const localY = (clientY: number) => clientY - el.getBoundingClientRect().top

    const scrollToY = (y: number) => {
      const span = Math.max(1, trackH - thumbH)
      const p = Math.min(1, Math.max(0, (y - grabOffset) / span))
      window.scrollTo(0, p * maxScroll)
    }

    /** Short eased hop, so a page-step doesn't teleport you out of context. */
    const hop = (to: number) => {
      const from = window.scrollY
      const d = Math.min(maxScroll, Math.max(0, to)) - from
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / 260)
        window.scrollTo(0, from + d * (1 - Math.pow(1 - t, 3)))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const onDown = (e: PointerEvent) => {
      measure()
      const y = localY(e.clientY)
      const thumbTop = (window.scrollY / maxScroll) * (trackH - thumbH)

      // Off the thumb: page, the way a real scrollbar does — do NOT scrub to
      // the tap. This document is ~14,000px against a ~565px rail, so one
      // pixel of travel is twenty-five of page and scrubbing cannot land on a
      // paragraph. Paging is the only fine control the rail can offer, and
      // without it the page is unreadable once the finger stops panning.
      if (y < thumbTop || y > thumbTop + thumbH) {
        hop(window.scrollY + (y < thumbTop ? -1 : 1) * window.innerHeight * PAGE)
        return
      }

      grabOffset = y - thumbTop
      dragging = true
      el.setPointerCapture(e.pointerId)
      el.classList.add('is-dragging')
    }

    const onMove = (e: PointerEvent) => {
      if (dragging) scrollToY(localY(e.clientY))
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      el.classList.remove('is-dragging')
    }

    const onKey = (e: KeyboardEvent) => {
      const jump: Record<string, number> = {
        ArrowDown: KEY_STEP,
        ArrowUp: -KEY_STEP,
        PageDown: window.innerHeight * 0.9,
        PageUp: -window.innerHeight * 0.9,
      }
      if (e.key === 'Home') return void (e.preventDefault(), window.scrollTo(0, 0))
      if (e.key === 'End') return void (e.preventDefault(), window.scrollTo(0, maxScroll))
      const d = jump[e.key]
      if (d === undefined) return
      e.preventDefault()
      window.scrollTo(0, Math.min(maxScroll, Math.max(0, window.scrollY + d)))
    }

    measure()
    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('keydown', onKey)

    // sections reveal and images load long after mount, so the document keeps
    // growing — re-measure instead of trusting the height we saw at startup
    const ro = new ResizeObserver(() => {
      measure()
      paint()
    })
    ro.observe(document.body)

    return () => {
      html.classList.remove('rail-scroll')
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('keydown', onKey)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      className="scroll-rail"
      ref={root}
      role="slider"
      tabIndex={0}
      aria-label="Scroll the page"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <span className="scroll-rail-track" aria-hidden="true" />
      <div className="scroll-rail-thumb" ref={thumb} aria-hidden="true">
        <span className="scroll-rail-grip" />
      </div>
    </div>
  )
}
