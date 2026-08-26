import { SectionMark } from './SectionMark'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { skillGroups } from '../content/data'
import { TechIcon } from './TechIcon'
import { useTiltGroup } from '../hooks/useTilt'

gsap.registerPlugin(ScrollTrigger)

export function Skills() {
  const root = useRef<HTMLElement>(null)
  useTiltGroup(root, '.tech-tile', 10)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.skills-headline',
        { clipPath: 'inset(0 0 100% 0)', y: 40 },
        {
          clipPath: 'inset(0 0 -10% 0)',
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        },
      )
      gsap.fromTo(
        '.tech-tile',
        { opacity: 0, y: 34, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: { each: 0.045, from: 'start' },
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', once: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="skills" className="skills section scrim-left" ref={root}>
      <div className="container">
        <SectionMark n="04">The stack</SectionMark>
        <h2 className="skills-headline">
          Tools change. <span className="accent">Shipping doesn’t.</span>
        </h2>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.name}>
              <p className="skill-group-name mono">{group.name}</p>
              <ul className="tech-tiles">
                {group.items.map((item, i) => (
                  <li
                    className="tech-tile"
                    key={item.name}
                    style={{ animationDelay: `${(i % 5) * 0.7}s` }}
                  >
                    <TechIcon skill={item} />
                    <span className="tech-name">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
