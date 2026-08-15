import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { Terrain } from './Terrain'
import { PineForest } from './PineForest'
import { DistantRidges } from './DistantRidges'
import { SkyBackdrop } from './SkyBackdrop'
import { AtmosphereGrade } from './AtmosphereGrade'
import { FogLayers } from './FogLayers'
import { DustMotes } from './DustMotes'
import { Moon } from './Moon'
import { StatTowers } from './StatTowers'
import { StatPlaqueAnchors } from './StatPlaqueAnchors'
import { Pedestals } from './Pedestals'
import { StoneCircle } from './StoneCircle'
import { FinalePlinth } from './FinalePlinth'
import { Birds } from './Birds'
import { Effects } from './Effects'
import type { PerfTier } from '../hooks/usePerfTier'

const DUST_COUNT: Record<PerfTier, number> = { low: 400, medium: 800, high: 1400 }
const TREE_COUNT: Record<PerfTier, number> = { low: 150, medium: 280, high: 430 }
const DPR_MAX: Record<PerfTier, number> = { low: 1.25, medium: 1.5, high: 2 }

export function SceneRoot({ tier, reducedMotion }: { tier: PerfTier; reducedMotion: boolean }) {
  const animate = !reducedMotion
  const shadows = tier !== 'low'

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, DPR_MAX[tier]]}
        shadows={shadows ? 'soft' : false}
        gl={{ antialias: tier !== 'low', powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 58, near: 0.1, far: 460, position: [0, 3.2, 15] }}
      >
        <color attach="background" args={['#1d211a']} />
        <fog attach="fog" args={['#242a1e', 48, 250]} />

        <hemisphereLight args={['#5a654c', '#10130c', 0.8]} />
        {/* moonlight key — casts long soft shadows down the valley */}
        <directionalLight
          position={[52, 58, -140]}
          color="#f2ecd8"
          intensity={1.35}
          castShadow={shadows}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0006}
          shadow-normalBias={0.4}
          shadow-camera-left={-130}
          shadow-camera-right={130}
          shadow-camera-top={160}
          shadow-camera-bottom={-160}
          shadow-camera-near={1}
          shadow-camera-far={420}
        />
        {/* soft frontal fill so text-side faces aren't pitch black */}
        <directionalLight position={[-20, 30, 60]} color="#c8cbb2" intensity={0.35} />

        <AtmosphereGrade />
        <SkyBackdrop />
        <DistantRidges />
        <Terrain />
        <PineForest count={TREE_COUNT[tier]} castShadows={shadows} />
        <FogLayers animate={animate} />
        <Moon animate={animate} />
        <Birds animate={animate} />

        <CameraRig reducedMotion={reducedMotion} />
        <DustMotes count={DUST_COUNT[tier]} animate={animate} />
        <StatTowers tier={tier} />
        <StatPlaqueAnchors />
        <Pedestals animate={animate} />
        <StoneCircle animate={animate} />
        <FinalePlinth animate={animate} />
        <Effects tier={tier} />
      </Canvas>
    </div>
  )
}
