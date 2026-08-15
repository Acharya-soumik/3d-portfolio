// ─── All site copy lives here. Edit this file to update the site. ───

import type { PhotoName } from './gallery-manifest'

export const identity = {
  name: 'Soumik A.',
  monogram: 'S.A',
  role: 'AI Full-Stack Developer',
  /**
   * The h1. The thesis leads; the name is a credit, not a headline.
   * Broken by hand so the wrap never splits a phrase. Each entry is one
   * rendered line.
   */
  headlineLines: ['The only engineer', 'you need.'],
  credit: 'Soumik A. — 6+ years of top product industry experience',
  sub: 'Senior full-stack engineer. The systems I have built serve 20M+ users and move $350k a day.',
  /** Availability only — response time is the proof rail's job, not this line. */
  availability: 'Product Engineer',
  stack: ['Next.js', 'React', 'Python', 'LLM Agents'],
}

export const links = {
  email: 'soumik.acharjee.work@gmail.com',
  upwork: 'https://www.upwork.com/freelancers/soumikacharjee',
  github: '#', // TODO: add GitHub URL
  linkedin: '#', // TODO: add LinkedIn URL
  /** TODO: replace with your real Cal.com / Calendly booking link */
  calendar: 'https://cal.com/soumik-acharjee',
  /**
   * TODO: create a free Formspree form (formspree.io → New form → copy its
   * endpoint, e.g. 'https://formspree.io/f/abcdwxyz') and paste it here.
   * Every message then lands in your email inbox as a notification.
   * While empty, the form falls back to opening the visitor's mail app.
   */
  formEndpoint: '',
}

export const stats = [
  { value: 20, suffix: 'M+', label: 'users on systems I built', prefix: '' },
  { value: 130, suffix: 'M/yr', label: 'handled by platforms I engineered', prefix: '$' },
  { value: 350, suffix: 'k/day', label: 'cleared through my payment rails', prefix: '$' },
  { value: 100, suffix: '%', label: 'job success, every contract', prefix: '' },
]

/**
 * The hero proof rail. Every figure here is verified on the live Upwork
 * profile. Total earnings / job count / hours are deliberately omitted —
 * they are real but small, and next to "20M+ users" they invite the wrong
 * comparison. Badge tier, job success, rating and verification carry it.
 */
export const proof = {
  platform: { name: 'Upwork', icon: 'siUpwork' },
  badge: 'Top Rated',
  facts: ['100% Job Success', '5.0 across every rated job', 'ID verified'],
  terms: '$60/hr · replies in under 4 hrs',
  logosTitle: 'Past contributions for companies',
}

export interface Brand {
  name: string
  /** simple-icons export key (only where the brand allows icon use) */
  icon?: string
  /** short stat revealed on hover / tap */
  stat: string
}

export const brands: Brand[] = [
  { name: 'Verizon', icon: 'siVerizon', stat: 'Telecom-scale infrastructure running on my code' },
  { name: 'Ford', icon: 'siFord', stat: 'Automotive digital platforms in production' },
  { name: 'Yahoo', stat: 'High-traffic web infrastructure at portal scale' },
  { name: 'H&M', icon: 'siHandm', stat: 'Global fashion e-commerce experiences' },
  { name: 'Bewakoof', stat: '20M+ users — led the Shopify → Next.js multi-brand migration' },
  { name: 'Upswing', stat: '$350k/day payment rails · 30Cr+ revenue in the first month' },
]

export const about = {
  headline: 'Engineering isn’t a skill. It’s a mindset.',
  paragraphs: [
    'It starts with a curious kid who questioned every aspect of everything — how it works, why it’s built that way, what breaks it. That curiosity is why I treat engineering not as a skill but as a mindset.',
    'Over the years I stretched that mindset far beyond solid engineering and scale — into product, customer experience, UI/UX, release priorities, critical decision-making, client partnership, even sales. None of it is theory: all of it came hands-on, inside real roles or while building my own company.',
    'Today, AI is the blessing that turns that range into a superpower. It lets me run engineering, business, and automation end to end — a genuine one-man army.',
    'Building products and making them scale is what genuinely makes me happy — it’s the kick I chase, and it’s why I do this. But it’s not the only thing I do for fun 😉',
  ],
}

/**
 * The end-to-end cycle: every stage of a product one person can run. On
 * desktop it renders as a ring around the monogram; on mobile, a phase-
 * grouped chain. Order matters — it is the order a product actually moves.
 */
export const cycle = {
  headline: 'One engineer, the whole cycle.',
  sub: 'The stack it takes to win in today’s market — product scope to sales automation, every stage run end to end.',
  loop: 'ship → learn → ship again',
  phases: [
    {
      name: 'Build',
      stages: [
        'Product scope',
        'UI/UX design',
        'Architecture',
        'Engineering',
        'QA & review',
        'Deployment',
      ],
    },
    {
      name: 'Automate',
      stages: [
        'Automated testing',
        'Support automation',
        'Marketing automation',
        'Sales automation',
      ],
    },
    {
      name: 'Grow',
      stages: ['Self-improving SEO', 'Analytics & iteration'],
    },
  ],
}

export interface Project {
  index: string
  sector: string
  title: string
  impact: string
  metric: string
  metricLabel: string
  stack: string[]
  /** Hero case ledger — the state the project arrived in. */
  came: string
  /** Hero case ledger — what actually shipped. */
  shipped: string
  /** What I was on the project. */
  role: string
  period: string
  /**
   * Proof shot. Drop a file in assets/shots, run `npm run images`, then put the
   * generated key here — or paste any absolute URL. While it is undefined the
   * card renders a designed placeholder frame instead of a broken image.
   */
  shot?: string
  /** Caption shown under the frame — what the shot actually shows. */
  shotLabel?: string
  /** Public link, if there is one to give. */
  href?: string
  /**
   * 'nda' marks work done inside an employer that cannot be shown. The card
   * says so plainly rather than leaving an empty frame unexplained.
   */
  visibility: 'live' | 'nda'
}

export const projects: Project[] = [
  {
    index: '01',
    sector: 'FINTECH',
    title: 'Payment rails at $350k a day',
    impact:
      'Architected B2B payment infrastructure for a Series A fintech — multi-tenant, partner-configurable, generating 30Cr+ revenue in its first month with enterprise-grade reliability.',
    metric: '$350k',
    metricLabel: 'daily transaction volume',
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    came: 'Legacy payment stack, every partner config hard-coded.',
    shipped: 'Multi-tenant rails clearing $350k a day, partner-configurable.',
    role: 'Senior Software Engineer · Upswing',
    period: '2023 — 2024',
    visibility: 'nda',
    shotLabel: 'Partner-configurable payment console',
  },
  {
    index: '02',
    sector: 'E-COMMERCE',
    title: 'One codebase, every brand',
    impact:
      'Pod lead for migrating a 20M+ user e-commerce platform from Shopify to a scalable multi-brand Next.js architecture — single codebase, brand-level customization, full analytics.',
    metric: '20M+',
    metricLabel: 'users on the platform',
    stack: ['Next.js', 'React', 'TypeScript', 'A/B Infra'],
    came: 'Shopify storefront, 20M users, one brand at a time.',
    shipped: 'One Next.js codebase, every brand, full event analytics.',
    role: 'Pod lead · TMRW (Bewakoof)',
    period: '2024 — 2025',
    visibility: 'nda',
    shot: 'bewakoof-home',
    shotLabel: 'Multi-brand storefront on one codebase',
  },
  {
    index: '03',
    sector: 'HEALTHTECH',
    title: 'Enterprise healthcare SaaS',
    impact:
      'Multi-tenant healthcare platform used by doctors and B2B partners worldwide — AI pipelines parsing 190+ lab health parameters into automated medical reports, built to WCAG AA+.',
    metric: '190+',
    metricLabel: 'health parameters automated',
    stack: ['Next.js', 'Python', 'LLM Pipelines', 'Multi-tenant'],
    came: '190+ lab parameters, read off reports and typed by hand.',
    shipped: 'An LLM pipeline parsing every one into automated reports.',
    role: 'Member of Technical Staff · The Wellness Corner',
    period: '2025',
    visibility: 'nda',
    shot: 'wellness-health-checks',
    shotLabel: 'Automated lab report, 190+ parameters',
  },
  {
    index: '04',
    sector: 'LEGALTECH',
    title: 'Founder: zero to revenue, solo',
    impact:
      'Built Vakiltech from nothing — MVP, CRMs, dashboards, AI agents for legal professionals, and programmatic SEO pipelines that grew traffic organically to paying customers.',
    metric: '0→1',
    metricLabel: 'founded, built, monetized',
    stack: ['Next.js', 'Node.js', 'OpenAI', 'SEO Automation'],
    came: 'An empty repo and a legal workflow that ran on phone calls.',
    shipped: 'MVP, CRM, dashboards and AI agents — to paying customers.',
    role: 'Founder & full-stack engineer',
    period: 'Vakiltech',
    visibility: 'live',
    shot: 'vakiltech-hero',
    shotLabel: 'Vakiltech dashboard and AI agent console',
  },
  {
    index: '05',
    sector: 'VOICE AI',
    title: 'Multilingual voice agents',
    impact:
      'Production voice AI agents in Python handling real conversations across languages — speech pipelines, LLM orchestration, and telephony that hold up outside the demo.',
    metric: 'LIVE',
    metricLabel: 'in production, multilingual',
    stack: ['Python', 'LLM Orchestration', 'RAG', 'Telephony'],
    came: 'A voice demo that worked in one language, on one happy path.',
    shipped: 'Production agents holding real calls across languages.',
    role: 'Freelance · production build',
    period: '2026',
    visibility: 'live',
    shot: 'gnani-hero',
    shotLabel: 'Voice agent call flow, multilingual',
  },
  {
    index: '06',
    sector: 'AI × SEO',
    title: 'SEO on autopilot',
    impact:
      'AI-driven SEO automation system — content generation workflows and programmatic pages driving 275k+ organic impressions without a dollar of paid acquisition.',
    metric: '275k+',
    metricLabel: 'organic impressions driven',
    stack: ['Python', 'LLM Content', 'Programmatic SEO', 'Analytics'],
    came: 'Content written one page at a time, no organic traffic.',
    shipped: '275k+ impressions from programmatic pages, zero ad spend.',
    role: 'Freelance · production build',
    period: '2026',
    visibility: 'live',
    shot: 'vakiltech-gsc',
    shotLabel: 'Programmatic SEO pipeline output',
  },
  {
    index: '07',
    sector: 'MEDIA / NEWS',
    title: 'The Tribunal — Voice of the MENA',
    impact:
      'Full news platform for the MENA region shipped solo — public site, admin panel, CMS, and AI-assisted publishing workflows. The client came back for two more contracts.',
    metric: '3×',
    metricLabel: 'repeat contracts, same client',
    stack: ['Next.js', 'Supabase', 'CMS', 'LLM Pipelines'],
    came: 'A newsroom vision for the MENA region, no platform behind it.',
    shipped: 'Full platform, admin panel, CMS — plus AI publishing tools.',
    role: 'Freelance · full build',
    period: '2026',
    visibility: 'live',
    shot: 'tribunal-home',
    shotLabel: 'The Tribunal newsroom platform',
  },
]

/**
 * Which projects the hero case ledger cycles through, in order. Three is the
 * limit — the card cross-fades in place and its height is the tallest entry.
 */
const LEDGER_ORDER = ['02', '01', '03']

export const heroLedger: Project[] = LEDGER_ORDER.map(
  (i) => projects.find((p) => p.index === i)!,
)

/**
 * Verbatim client feedback from the Upwork contract "Expert Setup for Claude
 * Cowork, Replit, and VS Code" (5.0, Mar–Apr 2026). Rendered as designed type
 * rather than a screenshot, with a link out so anyone can check it.
 */
export const testimonial = {
  /**
   * Screenshot of the review as it appears on Upwork — cropped to the review
   * itself, so the neighbouring contracts' figures stay off the page.
   */
  image: '/proof/upwork-testimonial-1425.webp',
  imageSmall: '/proof/upwork-testimonial-760.webp',
  /** Native size of the crop, so the browser reserves the right box. */
  width: 1425,
  height: 928,
  attribution: 'Upwork client · verified contract',
  contract: 'Expert Setup for Claude Cowork, Replit & VS Code',
  rating: '5.0',
  /**
   * The screenshot is an image of text, so the words have to exist for screen
   * readers too. This is the same review, verbatim, rendered off-screen.
   */
  transcript:
    '"Working with Soumik was genuinely one of the best freelancer experiences I\'ve had on Upwork. He delivered a full platform, admin panel, CMS, and several other components at a speed that honestly caught me off guard without sacrificing even a bit of quality. From day one, he came in with a clear plan, asked the right questions, and executed with zero hand-holding needed. Every milestone was hit ahead of schedule. When I had last-minute changes or additional requests, he handled them smoothly and never made it feel like an inconvenience. The code is clean, the UI is polished, and everything just works. He communicated proactively throughout — no chasing, no guessing where things stood. That alone puts him in the top 1% of freelancers I\'ve worked with. If you\'re looking for someone who gets it done fast, gets it done right, and makes the entire process effortless Soumik is your person. I\'ll absolutely be coming back for future projects and wouldn\'t hesitate to recommend him to anyone." Endorsed by client: Reliable, Committed to Quality, Solution Oriented, Clear Communicator, Detail Oriented.',
}

/**
 * The receipts section — its own chapter between the story and the work.
 * The image is a screenshot of the live contract history on the Upwork
 * profile: four real contracts, every one rated 5.0. Framed on a bone canvas
 * like the story card.
 */
export const reviews = {
  image: '/gallery/reviews.png',
  width: 1400,
  height: 1508,
  eyebrow: '— The receipts',
  headline: 'Don’t take my word for it.',
  pull: '“Genuinely one of the best freelancer experiences I’ve had on Upwork.”',
  attribution: 'Verified client · 5.0',
  badge: 'Every contract · 5.0',
  alt: 'Four Upwork contracts, each rated 5.0 stars, with client reviews, endorsements and contract values',
}

export interface Skill {
  name: string
  /** simple-icons export key, or a short glyph fallback rendered in serif */
  icon?: string
  glyph?: string
}

/** A label pinned onto the photo, with a hairline leader back to the point. */
export interface PhotoNote {
  label: string
  /** Anchor point as a percentage of the frame. */
  x: number
  y: number
  /** Which way the leader line runs from the anchor. */
  side: 'left' | 'right'
}

export interface GalleryItem {
  /** Key into the generated photo manifest — see scripts/optimize-images.mjs. */
  photo: PhotoName
  alt: string
  tag: string
  caption: string
  /** Field-note annotations drawn over the frame. Two reads best. */
  notes: PhotoNote[]
}

/**
 * The About gallery. Every frame is served from /gallery as 16/9 WebP at three
 * widths; add a photo by dropping it in assets/photos and running `npm run
 * images`, then adding an entry here.
 */
export const gallery: GalleryItem[] = [
  {
    photo: 'debug-help',
    alt: 'Two developers hunched over a laptop debugging together in a crowded hall',
    tag: '01 — Mentoring a team of next gen engineers',
    caption: 'Mentoring junior developers, takes me back to the strugging days where i felt coding is not for me.',
    notes: [
      { label: 'AlgoUniversity Seminar', x: 44, y: 62, side: 'left' },
      { label: 'Game Development Workshop', x: 72, y: 33, side: 'right' },
    ],
  },
  {
    photo: 'mentor-hall',
    alt: 'A packed hackathon hall of developers at laptops, Soumik leaning in over a team',
    tag: '02 — Then it scales',
    caption: 'AI development seminar for a 3D game building.',
    notes: [
      { label: 'Three hundred laptops', x: 30, y: 30, side: 'left' },
      { label: 'Two days straight', x: 71, y: 63, side: 'right' },
    ],
  },
  {
    photo: 'stage-panel',
    alt: 'Soumik speaking into a microphone on a panel alongside two other speakers',
    tag: '03 — And you talk about it',
    caption: 'Honored to speak to a bunch of college kids who has pride and fire in their eyes.',
    notes: [
      { label: 'Guest speaker', x: 33, y: 38, side: 'left' },
      { label: 'Bringing change', x: 70, y: 64, side: 'right' },
    ],
  },
  {
    photo: 'bike-road',
    alt: 'A rider in a red helmet on an adventure motorcycle on an empty pine-lined mountain road',
    tag: '04 — Then you leave',
    caption: 'Enough work, I like to live my life on the edge too.',
    notes: [
      { label: 'Beautiful Roads', x: 36, y: 58, side: 'left' },
      { label: 'Pine-lined, empty', x: 70, y: 28, side: 'right' },
    ],
  },
  {
    photo: 'trail-bloom',
    alt: 'Soumik in a cap and backpack looking up, framed by rhododendron blossoms',
    tag: '05 — Keep climbing',
    caption: 'Trekking to clear my mind.',
    notes: [
      { label: 'Har Ki Dun', x: 31, y: 34, side: 'left' },
      { label: 'Rhododendron season', x: 69, y: 62, side: 'right' },
    ],
  },
  {
    photo: 'trek-camp',
    alt: 'Two trekkers resting on granite boulders below snow-dusted Himalayan ridges',
    tag: '06 — Above the treeline',
    caption: 'Some more trekking...',
    notes: [
      { label: 'Above the treeline', x: 29, y: 29, side: 'left' },
      { label: 'Granite and fresh snow', x: 70, y: 60, side: 'right' },
    ],
  },
  {
    photo: 'surf-dusk',
    alt: 'Soumik holding a longboard upright on a beach at sunset',
    tag: '07 — Then all the way down',
    caption: 'Surfing makes me feel alive.',
    notes: [
      { label: 'Mulki', x: 37, y: 50, side: 'left' },
      { label: 'Sunset surfing', x: 68, y: 68, side: 'right' },
    ],
  },
]

export const skillGroups: { name: string; items: Skill[] }[] = [
  {
    name: 'FRONTEND',
    items: [
      { name: 'React', icon: 'siReact' },
      { name: 'Next.js', icon: 'siNextdotjs' },
      { name: 'TypeScript', icon: 'siTypescript' },
      { name: 'JavaScript', icon: 'siJavascript' },
      { name: 'GSAP', icon: 'siGreensock' },
    ],
  },
  {
    name: 'BACKEND',
    items: [
      { name: 'Node.js', icon: 'siNodedotjs' },
      { name: 'Python', icon: 'siPython' },
      { name: 'GraphQL', icon: 'siGraphql' },
      { name: 'PostgreSQL', icon: 'siPostgresql' },
      { name: 'Supabase', icon: 'siSupabase' },
      { name: 'MongoDB', icon: 'siMongodb' },
    ],
  },
  {
    name: 'AI SYSTEMS',
    items: [
      { name: 'Claude', icon: 'siClaude' },
      { name: 'OpenAI', glyph: 'Ø' },
      { name: 'RAG Pipelines', glyph: '¶' },
      { name: 'AI Agents', glyph: '∴' },
      { name: 'Voice AI', glyph: '~' },
    ],
  },
  {
    name: 'CLOUD & SCALE',
    items: [
      { name: 'AWS', glyph: 'λ' },
      { name: 'Google Cloud', icon: 'siGooglecloud' },
      { name: 'Vercel', icon: 'siVercel' },
      { name: 'Multi-tenant', glyph: '⌘' },
      { name: 'CI/CD', icon: 'siGithubactions' },
    ],
  },
]

export const experience = [
  {
    period: '2025',
    role: 'Member of Technical Staff',
    company: 'The Wellness Corner',
    sector: 'Healthcare SaaS',
    points: [
      'Led frontend architecture for a multi-tenant healthcare platform used by doctors and B2B partners.',
      'Built LLM workflows parsing 190+ health parameters into automated medical reports and analytics.',
    ],
  },
  {
    period: '2024 — 2025',
    role: 'Senior Frontend Engineer · Pod Lead',
    company: 'TMRW (Bewakoof)',
    sector: 'E-commerce at scale',
    points: [
      'Architected the Shopify → Next.js migration for a 20M+ user multi-brand platform.',
      'Shipped shared platform capabilities: one codebase, per-brand customization, full event analytics.',
    ],
  },
  {
    period: '2023 — 2024',
    role: 'Senior Software Engineer',
    company: 'Upswing Financial Technology',
    sector: 'B2B Fintech',
    points: [
      'Built payment systems handling $350k+ daily volume; 30Cr+ revenue in the first month post-launch.',
      'Reworked legacy systems into modular, partner-configurable architecture with the CTO.',
    ],
  },
  {
    period: 'FOUNDER',
    role: 'Founder & Full-Stack Engineer',
    company: 'Vakiltech',
    sector: 'LegalTech SaaS',
    points: [
      'Zero to revenue solo: MVP, CRM, dashboards, AI agents for legal professionals.',
      'Programmatic SEO and automated content pipelines for organic growth — no paid ads.',
    ],
  },
]

/**
 * Framed print beside the story: FamPay's team photo under the LinkedIn
 * Top Startups 2022 badge. Served straight from /proof — the 16/9 gallery
 * pipeline would crop the badge off its corner.
 */
export const recordExhibit = {
  image: '/proof/fampay-top-startups.png',
  width: 1200,
  height: 627,
  alt: 'The FamPay team photographed under the LinkedIn Top Startups 2022 badge',
  caption: 'FamPay (YC S19) — LinkedIn Top Startups 2022. Working with the brightest minds!',
  tag: 'From the archive',
}

export const contact = {
  headline: 'Got something half-built?',
  sub: 'Send me 2–3 sentences about what you’re building. I’ll come back with a stack, a timeline, and exactly where I’d start.',
  note: 'TOP RATED · 100% JOB SUCCESS · $60/HR',
}

