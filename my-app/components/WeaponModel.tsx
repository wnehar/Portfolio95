"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { WeaponKey } from "./weapons"

const WEAPON_MODEL_URLS: Record<WeaponKey, string> = {
  pistol: "https://raw.githubusercontent.com/webaverse/pistol/master/glock.glb",
  ak47: "https://raw.githubusercontent.com/SAAAM-LLC/3D_model_bundle/main/weapons/SAM_ASSET-LARGE-MACHINE-GUN.glb",
  sniper: "https://raw.githubusercontent.com/SAAAM-LLC/3D_model_bundle/main/weapons/SAM_ASSET-RIFLE1.glb",
}

const WEAPON_TRANSFORMS: Record<
  WeaponKey,
  {
    offset: THREE.Vector3
    rotation: THREE.Euler
    scale: number
  }
> = {
  pistol: {
    offset: new THREE.Vector3(0.22, -0.26, -0.42),
    rotation: new THREE.Euler(0.02, Math.PI, 0.04),
    scale: 0.24,
  },
  ak47: {
    offset: new THREE.Vector3(0.24, -0.28, -0.56),
    rotation: new THREE.Euler(0.06, Math.PI, 0.03),
    scale: 0.18,
  },
  sniper: {
    offset: new THREE.Vector3(0.24, -0.30, -0.64),
    rotation: new THREE.Euler(0.04, Math.PI, 0.02),
    scale: 0.16,
  },
}

export function WeaponModel({ weapon }: { weapon: WeaponKey }) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const { scene } = useGLTF(WEAPON_MODEL_URLS[weapon])
  const transform = WEAPON_TRANSFORMS[weapon]
  const offset = transform.offset

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      // Preserve embedded PBR maps and improve metallic readability under our lighting.
      const mat = mesh.material
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
            m.envMapIntensity = 1.15
            m.needsUpdate = true
          }
        })
      } else if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
        mat.envMapIntensity = 1.15
        mat.needsUpdate = true
      }
    })
    return cloned
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.quaternion.copy(camera.quaternion)
    tmp.copy(offset).applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(tmp)

    if (modelRef.current) {
      modelRef.current.rotation.copy(transform.rotation)
      modelRef.current.scale.setScalar(transform.scale)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <primitive object={model} />
      </group>
    </group>
  )
}

useGLTF.preload(WEAPON_MODEL_URLS.pistol)
useGLTF.preload(WEAPON_MODEL_URLS.ak47)
useGLTF.preload(WEAPON_MODEL_URLS.sniper)

