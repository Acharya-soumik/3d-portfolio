import { useMemo } from 'react'
import * as THREE from 'three'
import { terrainHeight, fbm } from './noise'

interface Tree {
  x: number
  y: number
  z: number
  scale: number
  rot: number
  shade: number
}

const rand = (seed: number) => {
  const s = Math.sin(seed * 78.233 + 12.9898) * 43758.5453
  return s - Math.floor(s)
}

/** Instanced pines on the valley flanks — two draw calls for the whole forest. */
export function PineForest({ count, castShadows = false }: { count: number; castShadows?: boolean }) {
  const trees = useMemo<Tree[]>(() => {
    const list: Tree[] = []
    let seed = 1
    let guard = 0
    while (list.length < count && guard < count * 30) {
      guard++
      const side = rand(seed++) > 0.5 ? 1 : -1
      const x = side * (27 + rand(seed++) * 70)
      const z = 15 - rand(seed++) * 265
      const h = terrainHeight(x, z)
      // treeline: skip valley floor and bare peaks; clump with noise
      if (h < 1.5 || h > 24) continue
      if (fbm(x * 0.045 + 2, z * 0.045) < 0.42) continue
      list.push({
        x,
        y: h - 0.2,
        z,
        scale: 2.1 + rand(seed++) * 2.6,
        rot: rand(seed++) * Math.PI * 2,
        shade: 0.75 + rand(seed++) * 0.5,
      })
    }
    return list
  }, [count])

  const { trunks, foliage } = useMemo(() => {
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.14, 1, 5)
    trunkGeo.translate(0, 0.5, 0)
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#241f16', roughness: 1 })
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, trees.length)

    const coneGeo = new THREE.ConeGeometry(0.62, 1.6, 6)
    coneGeo.translate(0, 1.15, 0)
    const coneMat = new THREE.MeshStandardMaterial({ roughness: 0.98 })
    const foliage = new THREE.InstancedMesh(coneGeo, coneMat, trees.length)

    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z)
      dummy.rotation.set(0, t.rot, 0)
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      trunks.setMatrixAt(i, dummy.matrix)
      foliage.setMatrixAt(i, dummy.matrix)
      color.set('#2a3421').multiplyScalar(t.shade)
      foliage.setColorAt(i, color)
    })
    trunks.instanceMatrix.needsUpdate = true
    foliage.instanceMatrix.needsUpdate = true
    if (foliage.instanceColor) foliage.instanceColor.needsUpdate = true
    trunks.frustumCulled = false
    foliage.frustumCulled = false
    foliage.castShadow = castShadows
    foliage.receiveShadow = castShadows
    return { trunks, foliage }
  }, [trees, castShadows])

  return (
    <group>
      <primitive object={trunks} />
      <primitive object={foliage} />
    </group>
  )
}
