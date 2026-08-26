import { SectionMark } from './SectionMark'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { contact, links, identity } from '../content/data'
import { SECTION_IDS } from '../store/useScrollStore'
import { Logo } from './Logo'

gsap.registerPlugin(ScrollTrigger)

const FOOTER_LABELS: Record<string, string> = {
  hero: 'Intro',
  stats: 'Numbers',
  about: 'About',
  projects: 'Work',
  skills: 'Stack',
  experience: 'History',
  contact: 'Contact',
}

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const root = useRef<HTMLElement>(null)
  const btn = useRef<HTMLAnchorElement>(null)
  const [sendState, setSendState] = useState<SendState>('idle')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-headline',
        { clipPath: 'inset(0 0 100% 0)', y: 40 },
        {
          clipPath: 'inset(0 0 -10% 0)',
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        },
      )
      gsap.fromTo(
        '.contact-el:not(.contact-headline)',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  // magnetic booking CTA
  useEffect(() => {
    const el = btn.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const strength = 0.35
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const dist = Math.hypot(dx, dy)
      if (dist < 160) el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      else el.style.transform = ''
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      el.style.transform = ''
    }
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')

    if (links.formEndpoint) {
      setSendState('sending')
      try {
        const res = await fetch(links.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setSendState('sent')
        form.reset()
      } catch {
        setSendState('error')
      }
    } else {
      // no form backend configured yet — hand off to the visitor's mail app
      const subject = encodeURIComponent(`Project brief from ${name || 'your site'}`)
      const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`)
      window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the address is visible as text anyway */
    }
  }

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const profileLinks = [
    { label: 'Upwork', href: links.upwork },
    { label: 'GitHub', href: links.github },
    { label: 'LinkedIn', href: links.linkedin },
  ].filter((l) => l.href && l.href !== '#')

  return (
    <section id="contact" className="contact section scrim-center" ref={root}>
      <div className="container contact-inner">
        <SectionMark n="06" className="contact-el">Get in touch</SectionMark>
        <h2 className="contact-headline contact-el">{contact.headline}</h2>
        <p className="contact-sub contact-el">{contact.sub}</p>

        <div className="contact-actions contact-el">
          <a
            className="btn-primary"
            ref={btn}
            href={links.calendar}
            target="_blank"
            rel="noreferrer"
          >
            Book a call ↗
          </a>
          <button type="button" className="copy-email mono" onClick={copyEmail}>
            {copied ? '✓ Copied to clipboard' : `${links.email} — copy`}
          </button>
        </div>

        <form className="brief-form holo contact-el" onSubmit={onSubmit}>
          <p className="brief-form-title mono">Or send it from right here</p>
          <div className="brief-row">
            <label className="brief-field">
              <span className="mono">Name</span>
              <input name="name" type="text" autoComplete="name" required placeholder="Ada Lovelace" />
            </label>
            <label className="brief-field">
              <span className="mono">Email</span>
              <input name="email" type="email" autoComplete="email" required placeholder="ada@company.com" />
            </label>
          </div>
          <label className="brief-field">
            <span className="mono">What are you building?</span>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="2–3 sentences. Stack, stage, and where it's stuck."
            />
          </label>
          <div className="brief-submit-row">
            <button className="btn-primary" type="submit" disabled={sendState === 'sending'}>
              {sendState === 'sending' ? 'Sending…' : 'Send message →'}
            </button>
            {sendState === 'sent' && (
              <p className="brief-status mono" role="status">
                ✓ Sent — it’s in my inbox. I reply within a day.
              </p>
            )}
            {sendState === 'error' && (
              <p className="brief-status brief-status--error mono" role="status">
                Couldn’t send. Email me directly: {links.email}
              </p>
            )}
          </div>
        </form>

        <p className="contact-note mono contact-el">{contact.note}</p>
      </div>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo size="footer" />
            <p className="footer-blurb">
              {identity.role}. Systems serving 20M+ users, moving $350k a day. Built from Siliguri,
              shipped worldwide.
            </p>
            <p className="footer-status mono">
              <span className="status-dot" aria-hidden="true" />
              {identity.availability}
            </p>
          </div>
          <nav className="footer-col" aria-label="Sections">
            <p className="footer-col-title mono">Explore</p>
            <ul>
              {SECTION_IDS.filter((id) => id !== 'hero').map((id) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={goTo(id)}>
                    {FOOTER_LABELS[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer-col">
            <p className="footer-col-title mono">Connect</p>
            <ul>
              <li>
                <a href={`mailto:${links.email}`}>Email</a>
              </li>
              <li>
                <a href={links.calendar} target="_blank" rel="noreferrer">
                  Book a call ↗
                </a>
              </li>
              {profileLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container footer-bar">
          <p className="mono footer-copy">© 2026 Soumik Acharjee — Designed &amp; engineered in React Three Fiber</p>
          <a href="#hero" className="footer-top mono" onClick={goTo('hero')}>
            Back to the valley ↑
          </a>
        </div>
      </footer>
    </section>
  )
}
