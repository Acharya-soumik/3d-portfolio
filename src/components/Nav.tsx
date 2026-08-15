import type Lenis from 'lenis'
import { useScrollStore, SECTION_IDS } from '../store/useScrollStore'
import { Logo } from './Logo'

const LABELS: Record<string, string> = {
  hero: 'Intro',
  stats: 'Numbers',
  about: 'About',
  projects: 'Work',
  skills: 'Stack',
  experience: 'History',
  contact: 'Contact',
}

export function Nav({ lenis }: { lenis: React.RefObject<Lenis | null> }) {
  const active = useScrollStore((s) => s.chapterIndex)
  const ready = useScrollStore((s) => s.ready)
  const progress = useScrollStore((s) => s.progress)

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    if (lenis.current) lenis.current.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <header className={`nav${ready ? ' is-ready' : ''}`}>
        <a className="nav-mark" href="#hero" onClick={go('hero')} aria-label="Back to top">
          <Logo size="nav" />
        </a>
        <nav className="nav-links" aria-label="Sections">
          {SECTION_IDS.slice(1).map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`nav-link${active === i + 1 ? ' is-active' : ''}`}
            >
              <span className="nav-num">{String(i + 1).padStart(2, '0')}</span>
              {LABELS[id]}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#contact" onClick={go('contact')}>
          Hire me
        </a>
      </header>
    </>
  )
}
