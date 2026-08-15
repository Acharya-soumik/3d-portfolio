import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { PerfTier } from '../hooks/usePerfTier'

export function Effects({ tier }: { tier: PerfTier }) {
  if (tier === 'low') return null

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.35} />
      <Vignette eskil={false} offset={0.24} darkness={0.58} />
      {tier === 'high' ? <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.35} /> : <></>}
    </EffectComposer>
  )
}
