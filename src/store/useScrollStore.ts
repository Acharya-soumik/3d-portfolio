import { create } from 'zustand'

interface ScrollState {
  /** Global scroll progress 0..1 across the whole document */
  progress: number
  /** Continuous chapter position 0..7 (7 section anchors + end of page) */
  chapter: number
  /** Rounded active section index 0..6, for nav highlighting */
  chapterIndex: number
  /** Smooth-scroll velocity (px/frame-ish, from Lenis) — drives scene reactivity */
  velocity: number
  /** Preloader finished — hero entrance can play */
  ready: boolean
  setReady: (ready: boolean) => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  chapter: 0,
  chapterIndex: 0,
  velocity: 0,
  ready: false,
  setReady: (ready) => set({ ready }),
}))

export const SECTION_IDS = ['hero', 'stats', 'about', 'projects', 'skills', 'experience', 'contact'] as const
