/**
 * Scroll the page to an element, animated, without asking the browser to do it.
 *
 * `scrollIntoView({ behavior: 'smooth' })` does not work on this page: it moves
 * about a pixel and stops. It fails with every touch lock removed too, so it is
 * not the rail — something in the scene's per-frame work cancels the browser's
 * scroll animation before it gets going. The visible cost was that every nav
 * link and the "Hire me" CTA silently did nothing on a phone, because touch has
 * no Lenis instance to fall back on.
 *
 * Driving it from rAF sidesteps the question entirely and has the side benefit
 * of matching the easing Lenis gives desktop, so a section jump feels the same
 * on both. Any real scroll input cancels it, so a drag on the rail mid-flight
 * takes over instead of fighting.
 */
export function scrollToElement(el: Element, duration = 900) {
  const startY = window.scrollY
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const targetY = Math.min(max, Math.max(0, el.getBoundingClientRect().top + startY))
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const start = performance.now()
  // the position we last wrote, so an outside scroll is distinguishable from
  // our own and can cancel the animation
  let written = startY
  let cancelled = false

  const stop = () => {
    cancelled = true
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('pointerdown', stop)
  }
  window.addEventListener('wheel', stop, { passive: true, once: true })
  window.addEventListener('touchstart', stop, { passive: true, once: true })
  window.addEventListener('pointerdown', stop, { passive: true, once: true })

  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  const step = (now: number) => {
    if (cancelled) return
    // something else moved the page — hand it over rather than yanking it back
    if (Math.abs(window.scrollY - written) > 2) return stop()
    const t = Math.min(1, (now - start) / duration)
    written = startY + distance * ease(t)
    window.scrollTo(0, written)
    if (t < 1) requestAnimationFrame(step)
    else stop()
  }
  requestAnimationFrame(step)
}
