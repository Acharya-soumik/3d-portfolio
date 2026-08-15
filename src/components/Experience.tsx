import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experience } from '../content/data'

gsap.registerPlugin(ScrollTrigger)

export function Experience() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // the timeline spine draws itself as you scroll past
      gsap.fromTo(
        '.xp-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.xp-timeline',
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.6,
          },
        },
      )
      gsap.utils.toArray<HTMLElement>('.xp-entry').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -34 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" className="experience section scrim-left" ref={root}>
      <div className="container">
        <p className="eyebrow">05 — The record</p>
        <div className="xp-timeline">
          <span className="xp-line" aria-hidden="true" />
          {experience.map((xp) => (
            <article className="xp-entry" key={xp.company}>
              <div className="xp-meta">
                <p className="xp-period mono">{xp.period}</p>
                <p className="xp-sector mono">{xp.sector.toUpperCase()}</p>
              </div>
              <div className="xp-body">
                <h3 className="xp-role">{xp.role}</h3>
                <p className="xp-company mono">@ {xp.company}</p>
                <ul className="xp-points">
                  {xp.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
