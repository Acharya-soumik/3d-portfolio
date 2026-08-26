/**
 * Line icons for the four cycle phases.
 *
 * Drawn here rather than pulled from an icon set: everything else in this
 * design is thin-stroke and geometric, and the one icon dependency the project
 * already has (simple-icons) is brand marks, which are solid-filled and would
 * sit wrong next to letter-spaced caps at 0.6rem.
 *
 * All four share one 24-unit box and inherit `currentColor`, so a phase's
 * accent reaches them through `--phase` like the dots did.
 */

/**
 * A cog, generated rather than hand-drawn — a hand-written gear path is a
 * hundred unreadable magic numbers, and this way the tooth count is a knob.
 */
function cogPath(teeth = 8, rOut = 9.4, rIn = 6.8, cx = 12, cy = 12) {
  const seg = 360 / teeth
  const pt = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  }
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * seg
    d += `${i ? 'L' : 'M'}${pt(rOut, a - seg * 0.19)}`
    d += `L${pt(rOut, a + seg * 0.19)}`
    d += `L${pt(rIn, a + seg * 0.31)}`
    d += `L${pt(rIn, a + seg * 0.69)}`
  }
  return `${d}Z`
}

const COG = cogPath()

export type PhaseIconName = 'build' | 'test' | 'automate' | 'scale'

/** Each entry is whatever goes inside the shared <svg>. */
const SHAPES: Record<PhaseIconName, React.ReactNode> = {
  // a cube under construction — the thing being made
  build: (
    <>
      <path d="M12 2.7 20.7 7.4 20.7 16.6 12 21.3 3.3 16.6 3.3 7.4Z" />
      <path d="M12 21.3V12.1" />
      <path d="M12 12.1 20.7 7.4" />
      <path d="M12 12.1 3.3 7.4" />
    </>
  ),
  // a flask: the one shape that says "checked before it ships" at 12px
  test: (
    <>
      <path d="M9.2 2.9v6.6l-4.5 8.2a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3l-4.5-8.2V2.9" />
      <path d="M7.6 2.9h8.8" />
      <path d="M6.5 15.1h11" />
    </>
  ),
  // a cog: hands off the wheel
  automate: (
    <>
      <path d={COG} />
      <circle cx="12" cy="12" r="3.1" />
    </>
  ),
  // a rising line — growth, not size
  scale: (
    <>
      <path d="M3 17.4 9.2 11.2l3.9 3.9L21 7.2" />
      <path d="M15.4 7.2H21v5.6" />
    </>
  ),
}

export function PhaseIcon({
  name,
  className,
}: {
  name: PhaseIconName
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {SHAPES[name]}
    </svg>
  )
}
