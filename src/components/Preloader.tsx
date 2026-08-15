import { useEffect, useRef, useState } from 'react'
import { useScrollStore } from '../store/useScrollStore'
import { Logo } from './Logo'

const MIN_DURATION = 1700
const EXIT_DURATION = 750

export function Preloader() {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const setReady = useScrollStore((s) => s.setReady)
  const startRef = useRef(performance.now())

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.classList.add('is-loading')

    let raf = 0
    const tickProgress = () => {
      const elapsed = performance.now() - startRef.current
      setProgress(Math.min(1, elapsed / MIN_DURATION))
      if (elapsed < MIN_DURATION) raf = requestAnimationFrame(tickProgress)
    }
    raf = requestAnimationFrame(tickProgress)

    const finish = async () => {
      await Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => setTimeout(r, MIN_DURATION)),
      ])
      setProgress(1)
      setExiting(true)
      window.setTimeout(() => {
        document.documentElement.classList.remove('is-loading')
        setReady(true)
        setGone(true)
      }, EXIT_DURATION)
    }
    finish()

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('is-loading')
    }
  }, [setReady])

  if (gone) return null

  return (
    <div className={`preloader${exiting ? ' preloader--exit' : ''}`} role="status" aria-label="Loading">
      <div className="preloader-mark">
        <Logo size="loader" />
      </div>
      <p className="preloader-sub">Portfolio — Soumik Acharjee</p>
      <div className="preloader-bar">
        <div className="preloader-bar-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  )
}
