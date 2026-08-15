/** Deterministic value-noise + FBM shared by terrain, forest placement, and ridges. */

function hash(ix: number, iz: number): number {
  const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453
  return s - Math.floor(s)
}

const smooth = (t: number) => t * t * (3 - 2 * t)

export function vnoise(x: number, z: number): number {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = smooth(x - ix)
  const fz = smooth(z - iz)
  const a = hash(ix, iz)
  const b = hash(ix + 1, iz)
  const c = hash(ix, iz + 1)
  const d = hash(ix + 1, iz + 1)
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz
}

export function fbm(x: number, z: number, octaves = 4): number {
  let value = 0
  let amp = 0.5
  let fx = x
  let fz = z
  for (let i = 0; i < octaves; i++) {
    value += vnoise(fx, fz) * amp
    fx *= 2.03
    fz *= 1.97
    amp *= 0.5
  }
  return value // ~0..1
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const sstep = (edge0: number, edge1: number, v: number) =>
  smooth(clamp01((v - edge0) / (edge1 - edge0)))

/**
 * Valley height field. The camera corridor (|x| < ~26, z 20..-210) stays near
 * flat; hills rise on the flanks and a back ridge closes the valley behind
 * the finale plinth.
 */
export function terrainHeight(x: number, z: number): number {
  const ax = Math.abs(x)
  const flank = sstep(26, 64, ax)
  const rolling = fbm(x * 0.02 + 3.7, z * 0.02 + 1.3) * 6
  const hills = Math.pow(fbm(x * 0.009 + 9.1, z * 0.009 + 4.2), 1.5) * 40
  const backwall = sstep(-260, -330, z) * 30 * (0.6 + fbm(x * 0.015, 7.7) * 0.8)
  const floor = fbm(x * 0.05, z * 0.05) * 0.7
  return floor + (rolling + hills) * flank + backwall
}
