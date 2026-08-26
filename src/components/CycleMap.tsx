import { useEffect, useMemo, useRef, useState } from 'react'
import { cycle } from '../content/data'
import { PhaseIcon } from './PhaseIcon'
import type { PhaseIconName } from './PhaseIcon'

/** Tilt of the wheel out of the screen plane. */
const TILT = 62
/**
 * Phones get a much shallower tilt. 62° squashes the disc to 47% of its height,
 * which is fine at a 304px radius but turns a phone-sized ring into a sliver —
 * the donut stopped reading as a chart at all. 44° keeps 72% of the height.
 */
const TILT_SMALL = 44
/** Below this the wheel is ticks-and-one-label, and gets the shallow tilt. */
const SMALL = '(max-width: 768px)'
/**
 * How far the focused chip lifts off the orbit, as a fraction of the radius.
 * The lit stage marker sits at ~0.83R and the chips ride at 1.0R; on a desktop
 * ring that gap is ~30px and both read, but at phone size it closes to ~14px
 * and the pill simply covers the marker it is meant to be pointing at. Scaled
 * by focus, so only the chip at the front moves, and it moves smoothly.
 */
const CHIP_PUSH_SMALL = 0.17
/** One full revolution, ms — 12 stages ≈ 2.3s each at the front. */
const REV_MS = 28000
/** Breathing room between pie segments, degrees. */
const SEG_GAP = 2.6
/**
 * The segment band, in the 100-unit radius space — chips ride outside it at
 * 100. Kept thin on purpose: filled wedges running to the centre were tried
 * and they swallowed the scene, and they buried the readout. A donut says the
 * same thing (arc length = share of the cycle) and leaves the disc airy.
 */
const BAND_IN = 78
const BAND_OUT = 88
/**
 * The stage marker sits ON the band, a shade proud of it on both edges so it
 * reads as that segment of the ring lighting up rather than as a second ring.
 * The band shows which PHASE you are in and holds still across all of that
 * phase's stages; this is what tracks the single stage at the front. Putting
 * it on its own outer track was tried and failed: in the Build phase the band
 * underneath is ember too, so the two just merged into one orange mass.
 */
const MARK_IN = 76.5
const MARK_OUT = 89.5
/** The marker is a tick, so it wants a tighter gap than a phase slice. */
const MARK_GAP = 3.4
/**
 * How far from the front slot a chip still counts as focused, as a fraction of
 * one stage's spacing. Focus is measured in ANGLE, not in depth: depth is
 * sin(θ), which is flat where it matters — its slope goes to zero exactly at
 * the front — so a depth-driven curve gave the highlighted chip and both its
 * neighbours nearly the same value and nothing visibly grew.
 */
const FOCUS_SPAN = 0.92
/** Scale on top of the perspective scale: fully compacted → fully focused. */
const COMPACT = 0.7
const FOCUSED = 1.34
/**
 * Reduced motion floors the perspective term for the focused chip. The wheel is
 * frozen there and the highlight steps to chips at the BACK, where perspective
 * alone shrinks them below the un-focused chips sitting at the front — the
 * selected stage ended up smaller than its neighbours.
 */
const STILL_MIN_SCALE = 1.15

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a)] as const
}
const f = (n: number) => n.toFixed(2)

/**
 * A donut segment in a 100-unit radius space with y pointing down — the same
 * convention `pose()` projects the chips with, so a segment drawn at angle θ
 * lands under the chip at angle θ.
 */
function segPath(rIn: number, rOut: number, a1: number, a2: number) {
  const large = a2 - a1 > 180 ? 1 : 0
  const [x1, y1] = polar(rOut, a1)
  const [x2, y2] = polar(rOut, a2)
  const [x3, y3] = polar(rIn, a2)
  const [x4, y4] = polar(rIn, a1)
  return (
    `M${f(x1)} ${f(y1)}A${rOut} ${rOut} 0 ${large} 1 ${f(x2)} ${f(y2)}` +
    `L${f(x3)} ${f(y3)}A${rIn} ${rIn} 0 ${large} 0 ${f(x4)} ${f(y4)}Z`
  )
}

/**
 * The end-to-end cycle as a rotating 3D wheel. The disc — a phase pie drawn in
 * its plane — turns continuously under perspective while every stage chip is
 * counter-rotated each frame to stay readable (billboarded). The highlight
 * position is FIXED at the front of the wheel; stages take turns passing
 * through it, growing as they arrive and compacting as they leave, and the
 * centre readout announces whichever one is there.
 *
 * The donut is the chart: each phase's arc is sized by how many stages it
 * owns, so the disc shows where the work actually goes, and the segment under
 * the front slot lights up as its stages are read out.
 *
 * The wheel runs at every viewport — the radius comes from a CSS clamp
 * (measured off the ring element each frame), so phones get the same
 * animation at a tighter radius. Reduced motion keeps the wheel still and
 * steps the highlight instead.
 */
export function CycleMap() {
  const stages = useMemo(
    () => cycle.phases.flatMap((phase, pi) => phase.stages.map((stage) => ({ stage, pi }))),
    [],
  )
  const n = stages.length
  const step = 360 / n

  /** One pie slice per phase, spanning the stages it owns. */
  const segments = useMemo(() => {
    let start = 0
    return cycle.phases.map((phase, pi) => {
      const len = phase.stages.length
      const a1 = (start - 0.5) * step + SEG_GAP / 2
      const a2 = (start + len - 0.5) * step - SEG_GAP / 2
      start += len
      return { pi, name: phase.name, count: len, band: segPath(BAND_IN, BAND_OUT, a1, a2) }
    })
  }, [step])

  /** One lit tick per stage — only the one at the front is ever shown. */
  const marks = useMemo(
    () =>
      stages.map((_, i) =>
        segPath(MARK_IN, MARK_OUT, (i - 0.5) * step + MARK_GAP / 2, (i + 0.5) * step - MARK_GAP / 2),
      ),
    [stages, step],
  )

  const wheel = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const bills = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  const activePhase = stages[active].pi

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const PERSPECTIVE = 1050

    // Tilt is read once and cached, never per frame: pose() already touches
    // layout for the radius, and adding a getComputedStyle call per frame is
    // exactly the kind of thing that costs a phone its scroll.
    const small = window.matchMedia(SMALL)
    let tilt = small.matches ? TILT_SMALL : TILT
    let tiltRad = (tilt * Math.PI) / 180
    let push = small.matches ? CHIP_PUSH_SMALL : 0

    // chips are projected by hand onto a flat overlay — same geometry as the
    // 3D disc below them, but no preserve-3d, so nothing ever slices them.
    // `forced` pins the focus to one index for the reduced-motion pose, where
    // the wheel never turns and the highlight steps instead.
    const pose = (angle: number, forced = -1) => {
      // the ring's rendered size IS the resolved --cycle-r clamp
      const R = ring.current ? ring.current.offsetWidth / 2 : 304
      for (let i = 0; i < n; i++) {
        const b = bills.current[i]
        if (!b) continue
        const theta = ((angle + i * step) * Math.PI) / 180
        const depth = Math.sin(theta) // 1 = front, -1 = back
        // Grow into the front slot and compact away from it. Driven by angular
        // distance from the front (0° = dead centre of the slot), which unlike
        // depth still separates neighbours one step apart. Recomputed every
        // frame, so the size change is smooth on its own — no CSS transition
        // to fight the per-frame write.
        const away = Math.abs(((((angle + i * step - 90) % 360) + 540) % 360) - 180)
        const focus =
          forced >= 0 ? (i === forced ? 1 : 0) : 1 - smoothstep(0, step * FOCUS_SPAN, away)
        const grow = COMPACT + (FOCUSED - COMPACT) * focus

        // lift the focused chip off the orbit so it stops covering its marker
        const orbit = R * (1 + push * focus)
        const x = orbit * Math.cos(theta)
        const yPlane = orbit * Math.sin(theta)
        const z = yPlane * Math.sin(tiltRad) // + toward the camera at the front
        const s = PERSPECTIVE / (PERSPECTIVE - z)
        const y = yPlane * Math.cos(tiltRad)

        // a frozen wheel can't rely on perspective to make the pick look picked
        const size = forced === i ? Math.max(s, STILL_MIN_SCALE) * FOCUSED : s * grow
        // Opacity and stacking follow focus as well as depth. On the turning
        // wheel that changes nothing — focus only peaks at the front, where
        // depth has already carried the chip to full — but under reduced
        // motion the wheel is frozen and the highlight steps to chips at the
        // BACK, where perspective keeps them small and depth alone would leave
        // the selected stage sitting at 28% behind its neighbours.
        const base = 0.28 + 0.72 * ((depth + 1) / 2)
        b.style.transform = `translate(${x * s}px, ${y * s - 10}px) scale(${size})`
        b.style.opacity = String(base + (1 - base) * focus)
        b.style.zIndex = String(Math.round((depth + 1) * 50 + focus * 100))
      }
    }

    // static pose for reduced motion: node 0 at the front, highlight steps
    if (reduced) {
      let idx = 0
      const still = () => {
        const w = wheel.current
        if (w) w.style.transform = `rotateX(${tilt}deg) rotateZ(90deg)`
        pose(90, idx)
      }
      still()
      // nothing re-renders the frozen wheel on its own, so a breakpoint change
      // has to redraw it by hand
      const onSmall = () => {
        tilt = small.matches ? TILT_SMALL : TILT
        tiltRad = (tilt * Math.PI) / 180
        push = small.matches ? CHIP_PUSH_SMALL : 0
        still()
      }
      small.addEventListener('change', onSmall)
      const id = window.setInterval(() => {
        if (document.hidden) return
        idx = (idx + 1) % n
        setActive(idx)
        // the wheel is still, so the focus has to be told where to go
        still()
      }, 1400)
      return () => {
        window.clearInterval(id)
        small.removeEventListener('change', onSmall)
      }
    }

    // the turning wheel picks the new tilt up on its next frame
    const onSmall = () => {
      tilt = small.matches ? TILT_SMALL : TILT
      tiltRad = (tilt * Math.PI) / 180
      push = small.matches ? CHIP_PUSH_SMALL : 0
    }
    small.addEventListener('change', onSmall)

    let raf = 0
    let angle = 90 // node 0 starts at the front (total = angle + node angle = 90°)
    let last = performance.now()
    let activeIdx = -1

    // don't spend frames on a wheel that isn't on screen (phones especially)
    let visible = true
    const sceneEl = wheel.current?.parentElement
    const io = sceneEl
      ? new IntersectionObserver(([e]) => {
          visible = e.isIntersecting
        })
      : null
    if (sceneEl && io) io.observe(sceneEl)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 100)
      last = now
      if (!visible) return
      // Turns so stages arrive in listed order — scope → design → … → analytics
      // → back to scope. The front index is round((90 - angle) / step), so the
      // angle has to DECREASE for that index to count up; spinning the other
      // way walked the cycle backwards through its own phases.
      if (!document.hidden) angle = (angle - (dt * 360) / REV_MS + 360) % 360

      const w = wheel.current
      if (!w) return
      w.style.transform = `rotateX(${tilt}deg) rotateZ(${angle}deg)`
      pose(angle)

      const idx = ((Math.round((90 - angle) / step) % n) + n) % n
      if (idx !== activeIdx) {
        activeIdx = idx
        setActive(idx)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      small.removeEventListener('change', onSmall)
    }
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
        aria-label={`The product cycle, end to end. ${cycle.phases
          .map((p) => `${p.name}: ${p.stages.join(', ')}`)
          .join('. ')}.`}
      >
        <div className="cycle3d-scene" aria-hidden="true">
          <div className="cycle3d-wheel" ref={wheel}>
            {/* the pie lives IN the wheel plane, so it tilts and turns with it */}
            <svg className="cycle3d-pie" viewBox="-100 -100 200 200">
              {segments.map((s) => (
                <g
                  className={`cycle-seg phase-${s.pi}`}
                  key={s.name}
                  data-on={s.pi === activePhase}
                >
                  <path className="cycle-seg-band" d={s.band} />
                </g>
              ))}
              {marks.map((d, i) => (
                <path
                  className="cycle-mark"
                  key={`mark-${stages[i].stage}`}
                  d={d}
                  data-on={i === active}
                />
              ))}
            </svg>
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
            <span className={`cycle3d-readout-phase mono phase-${activePhase}`}>
              <PhaseIcon
                name={cycle.phases[activePhase].icon as PhaseIconName}
                className="cycle-phase-icon"
              />
              {cycle.phases[activePhase].name}
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

      {/* doubles as the pie's key: the count is what sizes each slice */}
      <ul className="cycle-legend" aria-hidden="true">
        {cycle.phases.map((phase, pi) => (
          <li
            className={`mono phase-${pi}${pi === activePhase ? ' is-on' : ''}`}
            key={phase.name}
          >
            <PhaseIcon name={phase.icon as PhaseIconName} className="cycle-phase-icon" />
            {phase.name}
            <span className="cycle-legend-count">{phase.stages.length}</span>
          </li>
        ))}
      </ul>

      <p className="cycle-loop mono">↺ {cycle.loop}</p>
    </div>
  )
}
