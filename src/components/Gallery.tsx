import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { gallery } from '../content/data'
import { photos, photoSrc } from '../content/gallery-manifest'

const STRIPS = 8
const AUTOPLAY_MS = 5200
const FLIP_DURATION = 0.85
const FLIP_STAGGER = 0.055
/** Start fetching the gallery this far before it scrolls into view. */
const PRELOAD_MARGIN = '600px'

/**
 * Image gallery whose transitions are physical: the picture is split into
 * vertical cuboid strips that flip in sequence, each strip's side face
 * carrying the next image — the photo literally rebuilds itself in 3D.
 *
 * Nothing is fetched until the gallery is near the viewport, and then only one
 * frame ahead of the one on screen, at the width the stage actually renders at.
 * A frame never flips in before it has decoded, so a strip can't turn up blank.
 */
/** The widths scripts/optimize-images.mjs emits, ascending. */
const LADDER = [800, 1280, 1920]

/**
 * Rounds a device-pixel width up to the next emitted variant. Bucketing here
 * rather than tracking raw pixels means a drag-resize only invalidates the
 * loaded frames when it actually crosses a variant boundary.
 */
const bucket = (devicePx: number) => LADDER.find((w) => w >= devicePx) ?? LADDER[LADDER.length - 1]

export function Gallery() {
  const [index, setIndex] = useState(0)
  const [next, setNext] = useState<{ to: number; dir: 1 | -1 } | null>(null)
  /** Target width in device px, snapped to the variant ladder; 0 until measured. */
  const [target, setTarget] = useState(0)
  const [ready, setReady] = useState<ReadonlySet<number>>(() => new Set())
  const stage = useRef<HTMLDivElement>(null)
  const [nearby, setNearby] = useState(false)
  const requested = useRef(new Set<number>())
  const busy = useRef(false)
  const inView = useRef(false)
  const reduced = useRef(false)

  const srcFor = useCallback((i: number) => photoSrc(gallery[i].photo, target), [target])

  /** Fetches and decodes one frame, then marks it flippable. */
  const load = useCallback(
    (i: number) => {
      if (!target || requested.current.has(i)) return
      requested.current.add(i)
      const img = new Image()
      img.src = srcFor(i)
      const settle = () => setReady((s) => (s.has(i) ? s : new Set(s).add(i)))
      // decode() gives a frame that's ready to paint, but Chrome leaves it
      // pending in a backgrounded tab — so the load event backs it up. Either
      // one is enough to let the frame flip in; whichever lands first wins.
      img.addEventListener('load', settle, { once: true })
      img.addEventListener('error', settle, { once: true })
      img.decode().then(settle, settle)
    },
    [srcFor, target],
  )

  // A new variant width invalidates everything decoded at the old one. The LQIP
  // covers the gap, so this degrades to a brief blur rather than a blank stage.
  useEffect(() => {
    requested.current = new Set()
    setReady(new Set())
  }, [target])

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Measure the stage, keep --gal-d (cuboid depth) in sync, and track both
  // "near enough to prefetch" and "actually visible" (which gates autoplay).
  useEffect(() => {
    const el = stage.current
    if (!el) return

    const visibility = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
    })
    visibility.observe(el)

    const proximity = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearby(true)
        proximity.disconnect()
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    proximity.observe(el)

    const measure = () => {
      el.style.setProperty('--gal-d', `${el.clientHeight}px`)
      setTarget(bucket(el.clientWidth * Math.min(window.devicePixelRatio, 2)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    return () => {
      visibility.disconnect()
      proximity.disconnect()
      ro.disconnect()
    }
  }, [])

  // Keep the current frame and the one after it warm — never the whole set.
  useEffect(() => {
    if (!target || !nearby) return
    load(index)
    load((index + 1) % gallery.length)
  }, [index, load, nearby, target])

  const go = useCallback(
    (to: number, dir: 1 | -1) => {
      if (busy.current || to === index) return
      if (!ready.has(to)) {
        load(to)
        return
      }
      if (reduced.current) {
        setIndex(to)
        return
      }
      busy.current = true
      setNext({ to, dir })
    },
    [index, load, ready],
  )

  // run the strip-flip once the next-faces are painted
  useEffect(() => {
    if (!next || !stage.current) return
    const strips = stage.current.querySelectorAll<HTMLElement>('.gal-strip-inner')
    const d = stage.current.clientHeight
    gsap.set(strips, { z: -d / 2, rotationX: 0, transformPerspective: 1400 })
    gsap.to(strips, {
      rotationX: -90 * next.dir,
      duration: FLIP_DURATION,
      ease: 'power2.inOut',
      stagger: FLIP_STAGGER,
      onComplete: () => {
        setIndex(next.to)
        setNext(null)
        gsap.set(strips, { rotationX: 0 })
        busy.current = false
      },
    })
  }, [next])

  // autoplay
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!inView.current || busy.current || document.hidden) return
      go((index + 1) % gallery.length, 1)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [go, index])

  const current = gallery[index]
  const dir = next?.dir ?? 1
  const shown = ready.has(index)

  const faceStyle = (src: string, i: number): React.CSSProperties => ({
    backgroundImage: `url(${src})`,
    backgroundSize: `${STRIPS * 100}% 100%`,
    backgroundPosition: `${(i / (STRIPS - 1)) * 100}% 50%`,
  })

  return (
    <figure className="gallery holo reveal">
      <header className="gal-header">
        <h3 className="gal-title">
          Behind the <span className="accent">scenes</span>
        </h3>
        <p className="gal-count mono" aria-hidden="true">
          {String(index + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
        </p>
      </header>
      <div className="gal-stage" ref={stage}>
        {/* Inlined 24px thumbnail, blown up and blurred, holding the frame until
            the real photo decodes. Costs ~200 bytes and ships in the JS bundle. */}
        <div
          className="gal-lqip"
          aria-hidden="true"
          style={{ '--lqip': `url(${photos[current.photo].lqip})` } as React.CSSProperties}
        />
        {Array.from({ length: STRIPS }, (_, i) => (
          <div className="gal-strip" key={i}>
            <div className="gal-strip-inner">
              <div
                className="gal-face gal-face--front"
                style={shown ? faceStyle(srcFor(index), i) : undefined}
              />
              {next && (
                <div
                  className="gal-face gal-face--next"
                  style={{
                    ...faceStyle(srcFor(next.to), i),
                    transform: `rotateX(${90 * dir}deg) translateZ(calc(var(--gal-d) / 2))`,
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <span className="sr-only">{current.alt}</span>

        {/* Field-note annotations + caption, laid over the frame. Sits above
            the strips and never takes the pointer, so the flip is untouched.
            Keyed on index so every label re-animates on each flip. */}
        <div className="gal-notes" key={`notes-${index}`} aria-hidden="true">
          {current.notes.map((n) => (
            <span
              className={`gal-note gal-note--${n.side}`}
              key={n.label}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <span className="gal-note-pin" />
              <span className="gal-note-line" />
              <span className="gal-note-label mono">{n.label}</span>
            </span>
          ))}
        </div>

        {/* visual only — the real <figcaption> is the last child of <figure>,
            which is where the spec requires it */}
        <div className="gal-overlay" aria-hidden="true">
          <p className="gal-tag mono" key={`tag-${index}`}>
            {current.tag}
          </p>
          <p className="gal-text" key={`cap-${index}`}>
            {current.caption}
          </p>
        </div>
      </div>

      <figcaption className="gal-foot">
        <span className="sr-only">
          {current.tag}. {current.caption}
        </span>
        <div className="gal-dots" role="tablist" aria-label="Gallery images">
          {gallery.map((g, i) => (
            <button
              key={g.photo}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={g.tag}
              className={`gal-dot${i === index ? ' is-active' : ''}`}
              onClick={() => go(i, i > index ? 1 : -1)}
            />
          ))}
        </div>
        <span className="gal-progress" aria-hidden="true">
          <span
            className="gal-progress-fill"
            key={`bar-${index}`}
            style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
          />
        </span>
      </figcaption>
    </figure>
  )
}
