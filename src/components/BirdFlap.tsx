import { useEffect, useRef } from 'react'

/**
 * A small looping Lottie bird, rendered only once it scrolls near the viewport
 * so its ~77KB of animation JSON and the lottie-web runtime never touch the
 * initial load. Honours prefers-reduced-motion by showing a static first frame.
 */
export function BirdFlap({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let anim: { destroy: () => void; goToAndStop: (f: number, isFrame: boolean) => void } | null = null
    let cancelled = false

    const mount = async () => {
      // Dynamic import keeps lottie-web out of the main chunk; it loads the
      // first time the bird nears the screen and never before.
      const [{ default: lottie }, data] = await Promise.all([
        import('lottie-web'),
        fetch('/lottie/cute-bird.json').then((r) => r.json()),
      ])
      if (cancelled || !host.current) return
      anim = lottie.loadAnimation({
        container: host.current,
        renderer: 'svg',
        loop: !reduced,
        autoplay: !reduced,
        animationData: data,
      })
      if (reduced) anim.goToAndStop(0, true)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        mount()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)

    return () => {
      cancelled = true
      io.disconnect()
      anim?.destroy()
    }
  }, [])

  return <div className={className} ref={host} aria-hidden="true" />
}
