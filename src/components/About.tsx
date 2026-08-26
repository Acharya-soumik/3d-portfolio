import { SectionMark } from './SectionMark'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { about, recordExhibit } from '../content/data'
import { Gallery } from './Gallery'
import { CycleMap } from './CycleMap'
import { BirdFlap } from './BirdFlap'

gsap.registerPlugin(ScrollTrigger)

export function About() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-headline',
        { clipPath: 'inset(0 0 100% 0)', y: 40 },
        {
          clipPath: 'inset(0 0 -10% 0)',
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.about-headline', start: 'top 78%', once: true },
        },
      )
      // Scrollytelling: words light up in reading order as you scroll through.
      // One trigger over the whole block, not one per paragraph — paragraph 2's
      // top crosses the start line long before paragraph 1's bottom reaches the
      // end line, so per-paragraph triggers overlap and light words out of order.
      //
      // On touch devices the scrub drives whole PARAGRAPHS, not words —
      // writing ~150 span opacities per scroll frame is what made phones
      // stutter through this section. Four targets is compositor change.
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const scrubEls = root.current?.querySelectorAll(
        coarse ? '.about-copy .scrub' : '.about-copy .w',
      )
      if (scrubEls?.length) {
        gsap.fromTo(
          scrubEls,
          { opacity: coarse ? 0.25 : 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.6,
            scrollTrigger: {
              trigger: '.about-copy',
              start: 'top 85%',
              // finish while the last paragraph is still mid-viewport — with
              // 'bottom 55%' the final words only lit after they'd scrolled
              // past comfortable reading height
              end: 'bottom 78%',
              scrub: 0.4,
            },
          },
        )
      }
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const splitWords = (text: string) =>
    text.split(' ').map((w, i) => (
      <span className="w" key={i}>
        {w}{' '}
      </span>
    ))

  return (
    <section id="about" className="about section scrim-left" ref={root}>
      {/* Sits in the section's right margin and sticks while the section scrolls. */}
      <div className="about-bird-rail">
        <BirdFlap className="about-bird" />
      </div>
      <div className="container">
        <div className="about-intro">
          <SectionMark n="02">The story</SectionMark>
          <h2 className="about-headline reveal">{about.headline}</h2>
          <div className="story-grid">
            {/* DOM-first so it stacks ABOVE the text on mobile; the desktop
                grid sends it to the right column */}
            <figure className="story-exhibit reveal">
              <img
                src={recordExhibit.image}
                width={recordExhibit.width}
                height={recordExhibit.height}
                alt={recordExhibit.alt}
                loading="lazy"
              />
              <figcaption className="mono">
                <span>{recordExhibit.caption}</span>
                <span className="story-exhibit-tag">{recordExhibit.tag}</span>
              </figcaption>
            </figure>

            <div className="about-copy">
            <p className="mono about-copy-label" aria-hidden="true">
              Personal log
              <span>Siliguri, India</span>
            </p>
            {about.paragraphs.map((p, i) => (
              <p className={`scrub${i === 0 ? ' scrub--lead' : ''}`} key={i}>
                {splitWords(p)}
              </p>
            ))}
            <p className="about-copy-sign" aria-hidden="true">
              — Soumik
            </p>
            </div>
          </div>
        </div>

        <Gallery />

        <CycleMap />
      </div>
    </section>
  )
}
