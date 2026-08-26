import { useEffect, useRef } from 'react'

/** Hold this long, roughly still, and the joystick takes the gesture. */
const HOLD_MS = 220
/** Finger travel that cancels the hold — it was a swipe, let it scroll. */
const SLOP = 12
/** Drag distance (px) that reaches full speed. */
const RANGE = 110
/** Full speed, px per second. */
const MAX_SPEED = 2600

/**
 * Touch-only scroll joystick. Place a finger anywhere and hold: the widget
 * pops up under it, and dragging up/down scrolls the page at a speed
 * proportional to the drag — a precision alternative when iOS flick
 * scrolling misbehaves. Taps and normal swipes pass through untouched.
 *
 * While active it owns the gesture (capture-phase preventDefault) and scrolls
 * with window.scrollBy from a rAF loop. That blocking listener is bound ONLY
 * while the stick is up — see `show()` — because a standing non-passive
 * touchmove on window costs every other swipe on the page its fast path.
 */
export function ScrollJoystick() {
  const root = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    const el = root.current
    const knobEl = knob.current
    if (!el || !knobEl) return

    let originX = 0
    let originY = 0
    let dy = 0
    let holdTimer = 0
    let tracking = false
    let active = false
    let raf = 0
    let last = 0

    const step = (now: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = Math.min(1, Math.abs(dy) / RANGE)
      const speed = Math.sign(dy) * Math.pow(t, 1.6) * MAX_SPEED
      if (speed) window.scrollBy(0, speed * dt)
      const clamped = Math.max(-RANGE, Math.min(RANGE, dy))
      knobEl.style.transform = `translate(-50%, calc(-50% + ${(clamped * 0.32).toFixed(1)}px))`
      el.classList.toggle('is-up', dy < -6)
      el.classList.toggle('is-down', dy > 6)
    }

    const show = () => {
      active = true
      // The drag listener is non-passive, and a non-passive touchmove on window
      // tells Safari "JS might preventDefault this" — which disables the
      // compositor scroll fast path for EVERY swipe on the page, joystick or
      // not. That single listener was making the whole site feel heavy on iOS.
      // Attach it only once the stick is actually up, drop it the moment it
      // goes down, so an ordinary swipe never sees a blocking listener.
      window.addEventListener('touchmove', onDragMove, { capture: true, passive: false })
      el.style.left = `${originX}px`
      el.style.top = `${originY}px`
      el.classList.add('is-on')
      document.documentElement.classList.add('joystick-on')
      last = performance.now()
      raf = requestAnimationFrame(step)
    }

    const reset = () => {
      window.clearTimeout(holdTimer)
      cancelAnimationFrame(raf)
      if (active) {
        window.removeEventListener('touchmove', onDragMove, {
          capture: true,
        } as EventListenerOptions)
      }
      tracking = false
      active = false
      dy = 0
      el.classList.remove('is-on', 'is-up', 'is-down')
      document.documentElement.classList.remove('joystick-on')
      knobEl.style.transform = 'translate(-50%, -50%)'
    }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const target = e.target as HTMLElement
      // leave interactive elements to their own long-press behaviours
      if (target.closest('a, button, input, textarea, select, [role="tab"]')) return
      const t = e.touches[0]
      originX = t.clientX
      originY = t.clientY
      dy = 0
      tracking = true
      holdTimer = window.setTimeout(show, HOLD_MS)
    }

    /** Hold-window watcher. Passive: it only reads, so the fast path survives. */
    const onTrackMove = (e: TouchEvent) => {
      if (!tracking || active) return
      const t = e.touches[0]
      // moved before the hold landed — it's a swipe, hand it back
      if (Math.hypot(t.clientX - originX, t.clientY - originY) > SLOP) {
        window.clearTimeout(holdTimer)
        tracking = false
      }
    }

    /** Only bound while the stick is up. */
    function onDragMove(e: TouchEvent) {
      if (!active) return
      dy = e.touches[0].clientY - originY
      e.preventDefault()
      e.stopPropagation()
    }

    const onEnd = (e: TouchEvent) => {
      if (active) e.preventDefault() // no ghost click where the stick was
      reset()
    }

    window.addEventListener('touchstart', onStart, { capture: true, passive: true })
    window.addEventListener('touchmove', onTrackMove, { capture: true, passive: true })
    window.addEventListener('touchend', onEnd, { capture: true })
    window.addEventListener('touchcancel', onEnd, { capture: true })
    return () => {
      reset()
      window.removeEventListener('touchstart', onStart, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchmove', onTrackMove, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchend', onEnd, { capture: true } as EventListenerOptions)
      window.removeEventListener('touchcancel', onEnd, { capture: true } as EventListenerOptions)
    }
  }, [])

  return (
    <div className="joystick" ref={root} aria-hidden="true">
      <span className="joystick-arrow joystick-arrow--up">▲</span>
      <div className="joystick-track">
        <div className="joystick-knob" ref={knob} />
      </div>
      <span className="joystick-arrow joystick-arrow--down">▼</span>
    </div>
  )
}
