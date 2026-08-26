import { SectionMark } from './SectionMark'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { links, reviews, testimonial } from '../content/data'
import { IconSvg } from './TechIcon'

gsap.registerPlugin(ScrollTrigger)

/**
 * The receipts: real Upwork contract history on a bone canvas, its own
 * chapter right before the work. Deliberately NOT in SECTION_IDS — the
 * camera's about→projects segment simply spans it, so the scroll engine and
 * nav stay untouched.
 */
export function Reviews() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reviews-headline',
        { clipPath: 'inset(0 0 100% 0)', y: 40 },
        {
          clipPath: 'inset(0 0 -10% 0)',
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      )
      gsap.fromTo(
        '.reviews-canvas',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.reviews-canvas', start: 'top 80%', once: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="reviews section scrim-left" ref={root}>
      <div className="container">
        <SectionMark>{reviews.eyebrow}</SectionMark>
        <h2 className="reviews-headline">{reviews.headline}</h2>

        <figure className="reviews-canvas">
          <figcaption className="reviews-canvas-label mono">
            Client reviews
            <span>Verified on Upwork</span>
          </figcaption>

          <blockquote className="reviews-pull">
            {reviews.pull}
            <cite className="mono">
              {reviews.attribution} ·{' '}
              <a href={testimonial.image} target="_blank" rel="noreferrer">
                Read it in full ↗
              </a>
            </cite>
          </blockquote>

          {/* an image of text still has to be readable by a screen reader */}
          <p className="sr-only">{testimonial.transcript}</p>

          <a
            className="reviews-open"
            href={reviews.image}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the Upwork reviews at full size"
          >
            <img
              className="reviews-img"
              src={reviews.image}
              width={reviews.width}
              height={reviews.height}
              alt={reviews.alt}
              loading="lazy"
            />
          </a>

          <p className="reviews-foot mono">
            <span className="reviews-badge">
              <IconSvg icon="siUpwork" className="reviews-mark" />
              {reviews.badge}
            </span>
            <a href={links.upwork} target="_blank" rel="noreferrer">
              See the live profile ↗
            </a>
          </p>
        </figure>
      </div>
    </section>
  )
}
