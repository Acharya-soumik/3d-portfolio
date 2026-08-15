# SOUMIK.A — 3D Portfolio

A scroll-cinematic 3D portfolio set in a procedural highland valley at dusk — noise-built terrain, an instanced pine forest, layered mountain ridges, drifting fog banks, a hazy moon, birds, and stone monuments. One fixed WebGL scene (React Three Fiber) runs behind the page; scrolling flies the camera through seven chapters while DOM sections scroll over it in sync. Signature moment: four stone towers rise from the valley fog as a monumental 3D bar chart of the headline metrics, scrubbed to scroll.

## Run it

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run build    # production build in dist/
```

## Deploy to Vercel

```bash
npm i -g vercel   # if needed
vercel            # from this folder; accept defaults (Vite is auto-detected)
```

## Edit your content

**All copy lives in one file: `src/content/data.ts`** — name, bio, stats, projects, skills, experience, contact.

To-do before sharing (all in `src/content/data.ts`):
- [ ] `gallery` — swap the Unsplash placeholders for real project screenshots and personal photos (Umling La bike trip, treks, instruments). Just replace each `src`/`caption`; local files go in `public/`.
- [ ] `github` / `linkedin` — real URLs (they're hidden from the site while set to `#`)
- [ ] `calendar` — your real Cal.com or Calendly booking link (currently a placeholder cal.com URL)
- [ ] `formEndpoint` — create a free form at formspree.io, paste its endpoint (e.g. `https://formspree.io/f/abcdwxyz`). Messages then arrive in your email inbox as notifications. Until then, the contact form falls back to opening the visitor's mail app.

## Architecture notes

- `src/scene/` — the 3D world. `CameraRig.tsx` holds the camera keyframes (one per section); edit `POS`/`LOOK` to re-choreograph the flight. `statGrowth.ts` is the shared scrub curve that keeps the stat towers and the DOM counters in sync.
- `src/hooks/useScrollEngine.ts` — Lenis smooth scroll + section anchors → a continuous `chapter` value (0–7) in the zustand store that drives the camera.
- `src/components/` — DOM sections with GSAP scroll reveals.
- Mobile: perf tiers (`usePerfTier`) cut particle counts/DPR/postprocessing; the horizontal project gallery becomes a vertical stack below 900px; `prefers-reduced-motion` is respected.
