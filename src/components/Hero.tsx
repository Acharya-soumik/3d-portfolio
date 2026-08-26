import { Fragment, useEffect, useRef, useState } from 'react'
import type Lenis from 'lenis'
import gsap from 'gsap'
import { brands, heroLedger, identity, links, proof } from '../content/data'
import { useScrollStore } from '../store/useScrollStore'
import { usePrefersReducedMotion } from '../hooks/usePerfTier'
import { IconSvg } from './TechIcon'
import { RangePlate } from './RangePlate'

const CYCLE_MS = 4600

export function Hero({ lenis }: { lenis: React.RefObject<Lenis | null> }) {
  const root = useRef<HTMLElement>(null)
  const ready = useScrollStore((s) => s.ready)
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // one orchestrated entrance, not scattered effects
  useEffect(() => {
    if (!ready || !root.current) return
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          '.hero-el, .hero-letter, .hero-actions > *, .hero-ledger, .hero-proof, .hero-logos',
          { opacity: 1, y: 0, yPercent: 0, rotate: 0 },
        )
        return
      }
      const tl = gsap.timeline({ delay: 0.1 })
      // the eyebrow lives outside .hero-copy (it is row 1 of the stage), so it
      // needs its own step or it never leaves opacity: 0
      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      )
        .fromTo(
          '.hero-letter',
          { yPercent: 110, rotate: 6, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 1.05, stagger: 0.02, ease: 'power4.out' },
          '-=0.45',
        )
        .fromTo(
          '.hero-copy .hero-el',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
          '-=0.6',
        )
        .fromTo(
          '.hero-actions > *',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' },
          '-=0.45',
        )
        .fromTo(
          '.hero-ledger',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out' },
          '-=0.55',
        )
        .fromTo(
          '.hero-proof',
          { opacity: 0, yPercent: 60 },
          { opacity: 1, yPercent: 0, duration: 0.85, ease: 'power4.out' },
          '-=0.55',
        )
        .fromTo(
          '.hero-logos',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.4',
        )
    }, root)

    // the copy drifts against the pointer; the ledger and rail are anchored.
    // Touch devices skip it — there is no hover pointer to drift against, and
    // a window pointermove listener has no business in the swipe path on iOS.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const copy = root.current.querySelector<HTMLElement>('.hero-copy')
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (reduced || !fine || !copy || raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const dx = (e.clientX / window.innerWidth - 0.5) * -18
        const dy = (e.clientY / window.innerHeight - 0.5) * -10
        copy.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
      })
    }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      ctx.revert()
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ready, reduced])

  // ledger cycle — its own effect so ctx.revert() can't strand the interval.
  // `active` is a dep on purpose: a manual jump restarts the timer, so the
  // entry the visitor picked gets a full cycle before auto-advance resumes.
  useEffect(() => {
    if (!ready || reduced || paused) return
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % heroLedger.length),
      CYCLE_MS,
    )
    return () => window.clearInterval(id)
  }, [ready, reduced, paused, active])

  // don't cycle in a background tab
  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    if (lenis.current) lenis.current.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const headline = identity.headlineLines.join(' ')

  return (
    <section id="hero" className="hero section scrim-left" ref={root}>
      <div className="hero-stage">
        <p className="hero-el eyebrow hero-eyebrow">
          <span className="status-dot" aria-hidden="true" />
          {identity.availability}
        </p>

        <div className="hero-grid">
          <div className="hero-copy">
            <h1 aria-label={headline}>
              {identity.headlineLines.map((line, l) => (
                <span className="hero-line" key={l} aria-hidden="true">
                  {line.split(' ').map((word, w) => (
                    <Fragment key={w}>
                      {/* a real text node, so the gap survives inline-block
                          trimming and still offers a wrap opportunity */}
                      {w > 0 ? ' ' : null}
                      <span className="hero-word">
                        {word.split('').map((ch, i) => (
                          <span className="hero-letter-mask" key={i}>
                            <span className="hero-letter">{ch}</span>
                          </span>
                        ))}
                      </span>
                    </Fragment>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-el hero-credit">{identity.credit}</p>
            <p className="hero-el hero-sub">{identity.sub}</p>
            <div className="hero-actions">
              <a
                className="btn-primary hero-cta hero-cta--primary"
                href="#contact"
                onClick={go('contact')}
              >
                Reach out →
              </a>
              <a className="hero-cta--ghost" href="#projects" onClick={go('projects')}>
                Proof of work
              </a>
            </div>
          </div>

          <div
            className="hero-ledger holo"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <p className="sr-only" aria-live="polite">
              {heroLedger[active].sector}: {heroLedger[active].shipped}
            </p>
            <RangePlate cases={heroLedger} active={active} />
            <div className="hero-ledger-ticks">
              {/* the row of eight bars that used to live here echoed the three
                  rails above it — four rows of marks saying the same thing.
                  A counter says the position in two glyphs. */}
              <p className="hero-ledger-count mono">
                {String(active + 1).padStart(2, '0')} / {String(heroLedger.length).padStart(2, '0')}
              </p>
              <div className="hero-ledger-nav">
                <button
                  type="button"
                  className="hero-ledger-arrow"
                  onClick={() =>
                    setActive((i) => (i - 1 + heroLedger.length) % heroLedger.length)
                  }
                  aria-label="Previous case"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="hero-ledger-arrow"
                  onClick={() => setActive((i) => (i + 1) % heroLedger.length)}
                  aria-label="Next case"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="hero-proof">
            <a
              className="hero-proof-badge mono"
              href={links.upwork}
              target="_blank"
              rel="noreferrer"
            >
              <IconSvg icon={proof.platform.icon} className="hero-proof-mark" />
              {proof.badge}
            </a>
            <ul className="hero-proof-facts">
              {proof.facts.map((f) => (
                <li className="mono" key={f}>
                  {f}
                </li>
              ))}
            </ul>
            <p className="hero-proof-terms mono">{proof.terms}</p>
          </div>

          <div className="hero-logos">
            <span className="hero-logos-title mono">{proof.logosTitle}</span>
            {brands.map((b) => (
              <span className="hero-logo" key={b.name}>
                <IconSvg icon={b.icon} className="hero-logo-icon" />
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-tail">
        <div className="hero-cue" aria-hidden="true">
          <span>Scroll</span>
          <span className="hero-cue-line" />
        </div>
      </div>
    </section>
  )
}
