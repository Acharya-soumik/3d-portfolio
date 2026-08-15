import { useEffect, useRef, useState } from 'react'
import { links, projects } from '../content/data'
import { useTiltGroup } from '../hooks/useTilt'
import { ProofShot } from './ProofShot'

const DESKTOP = '(min-width: 901px)'

/** Cards shown before the visitor opts into the full track. */
const PREVIEW_COUNT = 3

/**
 * Desktop: outer section is tall; a sticky viewport translates the card track
 * horizontally as you scroll (no GSAP pin — keeps camera anchors stable).
 * Mobile: plain vertical stack.
 *
 * Only the top three builds show by default — the section is exactly as tall
 * as the track needs (1px of scroll per 1px of translate), so the collapsed
 * state is a short chapter. "View all" widens the track; the height follows
 * and a synthetic resize lets the scroll engine re-measure its anchors.
 */
export function Projects() {
  const outer = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(1)
  const [expanded, setExpanded] = useState(false)
  useTiltGroup(outer, '.project-card', 5)

  const shown = expanded ? projects : projects.slice(0, PREVIEW_COUNT)

  useEffect(() => {
    const outerEl = outer.current
    const trackEl = track.current
    if (!outerEl || !trackEl) return

    let horizontal = window.matchMedia(DESKTOP).matches
    let raf = 0
    const count = expanded ? projects.length : PREVIEW_COUNT

    const apply = () => {
      raf = 0
      if (!horizontal) {
        trackEl.style.transform = ''
        outerEl.style.height = ''
        return
      }
      const maxX = Math.max(0, trackEl.scrollWidth - window.innerWidth)
      // 1:1 px mapping: the section is exactly tall enough to play the track
      const needed = window.innerHeight + maxX
      if (Math.abs(outerEl.offsetHeight - needed) > 2) {
        outerEl.style.height = `${needed}px`
        // height changed — let the scroll engine re-measure section anchors
        window.dispatchEvent(new Event('resize'))
      }
      const rect = outerEl.getBoundingClientRect()
      const total = Math.max(1, outerEl.offsetHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      trackEl.style.transform = `translate3d(${-progress * maxX}px, 0, 0)`
      setCurrent(Math.min(count, 1 + Math.floor(progress * count * 0.999)))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    const mq = window.matchMedia(DESKTOP)
    const onMedia = () => {
      horizontal = mq.matches
      apply()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    mq.addEventListener('change', onMedia)
    apply()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mq.removeEventListener('change', onMedia)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [expanded])

  return (
    <section id="projects" className="projects" ref={outer}>
      <div className="projects-sticky">
        <header className="projects-header container">
          <p className="eyebrow">03 — Selected work</p>
          <p className="projects-counter mono" aria-hidden="true">
            {String(current).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
          </p>
        </header>
        <div className="projects-track" ref={track}>
          {shown.map((p) => (
            <article className="project-card holo" key={p.index}>
              <div className="project-top">
                <p className="project-index mono">{p.index}</p>
                <p className="project-sector mono">{p.sector}</p>
              </div>

              <ProofShot project={p} />

              <h3 className="project-title">{p.title}</h3>

              {/* the same came → shipped spine the hero ledger uses */}
              <dl className="project-arc">
                <dt className="mono">Came in</dt>
                <dd>{p.came}</dd>
                <dt className="mono">Shipped</dt>
                <dd className="project-arc-out">{p.shipped}</dd>
              </dl>

              <p className="project-metric mono">
                {p.metric}
                <span className="project-metric-label">{p.metricLabel}</span>
              </p>

              <p className="project-role mono">
                {p.role} · {p.period}
              </p>

              <ul className="project-stack" aria-label="Stack">
                {p.stack.map((s) => (
                  <li className="chip mono" key={s}>
                    {s}
                  </li>
                ))}
              </ul>

              <div className="project-links">
                {p.href ? (
                  <a
                    className="project-link mono"
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit the live build ↗
                  </a>
                ) : (
                  <span className="project-link project-link--none mono">
                    {p.visibility === 'nda'
                      ? 'Under NDA — walkthrough on request'
                      : 'Link on request'}
                  </span>
                )}
                <a
                  className="project-link project-link--alt mono"
                  href={links.upwork}
                  target="_blank"
                  rel="noreferrer"
                >
                  Case detail ↗
                </a>
              </div>
            </article>
          ))}

          {!expanded && (
            <article className="project-card project-card--more holo">
              <p className="project-more-count">
                +{projects.length - PREVIEW_COUNT}
                <span>more builds</span>
              </p>
              <p className="project-more-sectors mono">
                {projects
                  .slice(PREVIEW_COUNT)
                  .map((p) => p.sector)
                  .join(' · ')}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setExpanded(true)}
              >
                View all {projects.length} →
              </button>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}
