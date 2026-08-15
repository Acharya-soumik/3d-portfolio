/**
 * Recolours the Lottie bird into the site's olive-green palette while keeping it
 * legible against the dark background.
 *
 *   assets/lottie/cute-bird.source.json  (pristine, as downloaded)
 *     ->  public/lottie/cute-bird.json    (served, recoloured)
 *
 * Lottie stores solid fills/strokes as `{ "c": { "a": 0, "k": [r,g,b,a] } }`
 * with channels in 0..1. We match each fill against the bird's known source
 * colours and swap in a palette colour. Re-run with `npm run bird` after
 * editing the map; it always rebuilds from the pristine source, so it's
 * idempotent.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'assets/lottie/cute-bird.source.json')
const OUT = join(ROOT, 'public/lottie/cute-bird.json')

/** [from-rgb, to-rgb, label] — channels 0..255. */
const MAP = [
  [[244, 106, 91], [217, 230, 201], 'body: coral -> glow green (--glow, the bright pop)'],
  [[80, 95, 122], [143, 162, 133], 'wing: slate -> sage (--clay)'],
  [[56, 61, 89], [92, 107, 82], 'wing shadow: navy -> deep sage'],
  [[242, 180, 96], [240, 190, 110], 'beak/feet: kept warm gold as the focal accent'],
  [[66, 39, 36], [40, 46, 34], 'outline/eye: brown -> dark olive (near --bg)'],
]

const to01 = (rgb) => rgb.map((c) => c / 255)
const table = MAP.map(([from, to, label]) => ({ from: to01(from), to: to01(to), label }))

/** Squared distance between two 0..1 RGB triples. */
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
/** Colours within this radius of a source swatch are treated as a match. */
const TOLERANCE = 0.02 ** 2

let hits = 0

/** Recursively rewrite every colour array in place. */
function walk(node) {
  if (Array.isArray(node)) {
    node.forEach(walk)
    return
  }
  if (node && typeof node === 'object') {
    // A colour value: c.k = [r,g,b] or [r,g,b,a], all static (c.a === 0).
    if (node.c && node.c.a === 0 && Array.isArray(node.c.k) && node.c.k.length >= 3) {
      const k = node.c.k
      const match = table.find((t) => dist2(t.from, k) <= TOLERANCE)
      if (match) {
        k[0] = match.to[0]
        k[1] = match.to[1]
        k[2] = match.to[2]
        hits++
      }
    }
    for (const key of Object.keys(node)) walk(node[key])
  }
}

const anim = JSON.parse(await readFile(SRC, 'utf8'))
walk(anim)
await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(anim))

console.log(`recoloured ${hits} fills:`)
for (const { label } of table) console.log(`  • ${label}`)
console.log(`\n${SRC.replace(ROOT + '/', '')} -> ${OUT.replace(ROOT + '/', '')}`)
