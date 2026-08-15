import { useEffect, useRef } from 'react'

/** Soft custom cursor: a glow dot with a trailing ring. Desktop only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    document.documentElement.classList.add('has-cursor')

    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let hovering = false
    let raf = 0

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
    }
    const onOver = (e: PointerEvent) => {
      hovering = !!(e.target as HTMLElement).closest('a, button, .tech-tile, .project-card')
    }

    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`
      if (ring.current) {
        ring.current.style.transform = `translate(${rx}px, ${ry}px) scale(${hovering ? 1.9 : 1})`
        ring.current.style.opacity = hovering ? '0.9' : '0.45'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
    </>
  )
}
