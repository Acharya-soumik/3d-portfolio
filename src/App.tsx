import { usePerfTier, usePrefersReducedMotion } from './hooks/usePerfTier'
import { useScrollEngine } from './hooks/useScrollEngine'
import { SceneRoot } from './scene/SceneRoot'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { ScrollRail } from './components/ScrollRail'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Stats } from './components/Stats'
import { About } from './components/About'
import { Reviews } from './components/Reviews'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { Experience } from './components/Experience'
import { Contact } from './components/Contact'

export default function App() {
  const tier = usePerfTier()
  const reducedMotion = usePrefersReducedMotion()
  const lenis = useScrollEngine()

  return (
    <>
      <Preloader />
      <Cursor />
      <ScrollRail />
      <SceneRoot tier={tier} reducedMotion={reducedMotion} />
      <Nav lenis={lenis} />
      <main>
        <Hero lenis={lenis} />
        <Stats />
        <About />
        <Reviews />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
    </>
  )
}
