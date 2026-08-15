import { useEffect, useRef, useState } from 'react'
import { cycle } from '../content/data'

/** Tilt of the wheel out of the screen plane. */
const TILT = 62
/** One full revolution, ms — 12 stages ≈ 2.3s each at the front. */
const REV_MS = 28000

/**
 * The end-to-end cycle as a rotating 3D wheel. The disc — dashed rings and
 * spokes drawn in its plane — turns continuously under perspective while
 * every stage chip is counter-rotated each frame to stay readable
 * (billboarded). The highlight position is FIXED at the front of the wheel;
 * stages take turns passing through it, and the centre readout announces
 * whichever one is there.
 *
 * The wheel runs at every viewport — the radius comes from a CSS clamp
 * (measured off the ring element each frame), so phones get the same
 * animation at a tighter radius. Reduced motion keeps the wheel still and
 * steps the highlight instead.
 */
export function CycleMap() {
  const stages = cycle.phases.flatMap((phase, pi) =>
    phase.stages.map((stage) => ({ stage, pi })),
  )
  const n = stages.length
  const step = 360 / n

  const wheel = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const bills = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tiltRad = (TILT * Math.PI) / 180
    const PERSPECTIVE = 1050

    // chips are projected by hand onto a flat overlay — same geometry as the
    // 3D disc below them, but no preserve-3d, so nothing ever slices them
    const pose = (angle: number) => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      // the ring's rendered size IS the resolved --cycle-r clamp
      const R = ring.current ? ring.current.offsetWidth / 2 : 19 * rem
      for (let i = 0; i < n; i++) {
        const b = bills.current[i]
        if (!b) continue
        const theta = ((angle + i * step) * Math.PI) / 180
        const x = R * Math.cos(theta)
        const yPlane = R * Math.sin(theta)
        const z = yPlane * Math.sin(tiltRad) // + toward the camera at the front
        const s = PERSPECTIVE / (PERSPECTIVE - z)
        const y = yPlane * Math.cos(tiltRad)
        const depth = Math.sin(theta) // 1 = front, -1 = back
        b.style.transform = `translate(${x * s}px, ${y * s - 10}px) scale(${s})`
        b.style.opacity = String(0.35 + 0.65 * (depth + 1) / 2)
        b.style.zIndex = String(Math.round((depth + 1) * 50))
      }
    }

    // static pose for reduced motion: node 0 at the front, highlight steps
    if (reduced) {
      const w = wheel.current
      if (w) w.style.transform = `rotateX(${TILT}deg) rotateZ(90deg)`
      pose(90)
      const id = window.setInterval(() => {
        if (!document.hidden) setActive((i) => (i + 1) % n)
      }, 1400)
      return () => window.clearInterval(id)
    }

    let raf = 0
    let angle = 90 // node 0 starts at the front (total = angle + node angle = 90°)
    let last = performance.now()
    let activeIdx = -1

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 100)
      last = now
      if (!document.hidden) angle = (angle + (dt * 360) / REV_MS) % 360

      const w = wheel.current
      if (!w) return
      w.style.transform = `rotateX(${TILT}deg) rotateZ(${angle}deg)`
      pose(angle)

      const idx = ((Math.round((90 - angle) / step) % n) + n) % n
      if (idx !== activeIdx) {
        activeIdx = idx
        setActive(idx)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [n, step])

  return (
    <div className="cycle reveal">
      <div className="cycle-head">
        <h3 className="cycle-headline">{cycle.headline}</h3>
        <p className="cycle-sub">{cycle.sub}</p>
      </div>

      <div
        className="cycle3d"
        role="img"
        aria-label={`The product cycle, end to end: ${stages.map((x) => x.stage).join(', ')}.`}
      >
        <div className="cycle3d-scene" aria-hidden="true">
          <div className="cycle3d-wheel" ref={wheel}>
            <span className="cycle3d-ring" ref={ring} />
            <span className="cycle3d-ring cycle3d-ring--inner" />
            {stages.map((x, i) => (
              <span
                className="cycle3d-spoke"
                key={`spoke-${x.stage}`}
                style={{ transform: `rotateZ(${i * step}deg)` }}
              />
            ))}
          </div>

          {/* flat chip overlay, projected to match the disc every frame */}
          <div className="cycle3d-chips">
            {stages.map((x, i) => (
              <span
                className="cycle3d-bill"
                key={x.stage}
                ref={(el) => {
                  bills.current[i] = el
                }}
              >
                <span
                  className={`cycle3d-chip mono phase-${x.pi}${i === active ? ' is-front' : ''}`}
                >
                  {x.stage}
                </span>
              </span>
            ))}
          </div>

          {/* fixed centre readout: whatever is at the front of the wheel */}
          <div className="cycle3d-readout">
            <span className={`cycle3d-readout-phase mono phase-${stages[active].pi}`}>
              {cycle.phases[stages[active].pi].name}
            </span>
            <span className="cycle3d-readout-stage" key={active}>
              {stages[active].stage}
            </span>
            <span className="cycle3d-readout-count mono">
              {String(active + 1).padStart(2, '0')} / {n}
            </span>
          </div>
        </div>
      </div>

      <ul className="cycle-legend" aria-hidden="true">
        {cycle.phases.map((phase, pi) => (
          <li className={`mono phase-${pi}`} key={phase.name}>
            <span className="cycle-dot" aria-hidden="true" />
            {phase.name}
          </li>
        ))}
      </ul>

      <p className="cycle-loop mono">↺ {cycle.loop}</p>
    </div>
  )
}
