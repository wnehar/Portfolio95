"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import type { WeaponKey } from "./weapons"

const PISTOL_MODEL_URL = "https://raw.githubusercontent.com/webaverse/pistol/master/glock.glb"
const AK47_MODEL_URL = "https://raw.githubusercontent.com/pinheiro-lucas/fps-game-ursina/f8c56b00/models/ak47.obj"
const AK47_MTL_URL = "https://raw.githubusercontent.com/pinheiro-lucas/fps-game-ursina/f8c56b00/models/ak47.mtl"

const WEAPON_TRANSFORMS: Record<
  WeaponKey,
  {
    offset: THREE.Vector3
    rotation: THREE.Euler
    scale: number
  }
> = {
  pistol: {
    offset: new THREE.Vector3(0.25, -0.30, -0.48),
    rotation: new THREE.Euler(0.03, Math.PI, 0.035),
    scale: 0.22,
  },
  ak47: {
    offset: new THREE.Vector3(0.29, -0.28, -0.7),
    rotation: new THREE.Euler(0.02, 0.06, -0.02),
    scale: 0.18,
  },
}

export function WeaponModel({
  weapon,
  shotCount = 0,
}: {
  weapon: WeaponKey
  shotCount?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const recoilKickRef = useRef(0)
  const [akObjModel, setAkObjModel] = useState<THREE.Group | null>(null)
  const pistolModelData = useGLTF(PISTOL_MODEL_URL)
  const transform = WEAPON_TRANSFORMS[weapon]
  const offset = transform.offset

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const swayRef = useRef(new THREE.Vector3())
  const pistolModel = useMemo(() => {
    const cloned = pistolModelData.scene.clone(true)
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

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
  }, [pistolModelData.scene])
  useEffect(() => {
    let cancelled = false

    const mtlLoader = new MTLLoader()
    const objLoader = new OBJLoader()

    mtlLoader.load(AK47_MTL_URL, (materials) => {
      if (cancelled) return
      materials.preload()
      objLoader.setMaterials(materials)
      objLoader.load(AK47_MODEL_URL, (obj) => {
        if (cancelled) return
        obj.traverse((child) => {
          const mesh = child as THREE.Mesh
          if (!mesh.isMesh) return
          mesh.castShadow = true
          mesh.receiveShadow = true

          const mat = mesh.material
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
                m.envMapIntensity = 1.3
                m.needsUpdate = true
              }
            })
          } else if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            mat.envMapIntensity = 1.3
            mat.needsUpdate = true
          }
        })
        setAkObjModel(obj)
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  const akModel = useMemo(() => (akObjModel ? akObjModel.clone(true) : null), [akObjModel])

  useEffect(() => {
    if (shotCount <= 0) return
    recoilKickRef.current += weapon === "ak47" ? 0.1 : 0.055
  }, [shotCount, weapon])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.quaternion.copy(camera.quaternion)
    tmp.copy(offset)
    const elapsed = state.clock.elapsedTime
    const bobScale = 1
    recoilKickRef.current = THREE.MathUtils.lerp(recoilKickRef.current, 0, (weapon === "ak47" ? 18 : 13) * delta)
    swayRef.current.set(
      Math.sin(elapsed * 1.9) * 0.012 * bobScale,
      Math.cos(elapsed * 2.8) * 0.008 * bobScale,
      0
    )
    tmp.add(swayRef.current)
    tmp.z += recoilKickRef.current
    tmp.y += recoilKickRef.current * 0.04
    tmp.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(tmp)

    if (modelRef.current) {
      modelRef.current.rotation.copy(transform.rotation)
      modelRef.current.rotation.y += Math.sin(elapsed * 1.4) * 0.015 * bobScale
      modelRef.current.rotation.x -= recoilKickRef.current * 0.35
      modelRef.current.rotation.z += recoilKickRef.current * (weapon === "ak47" ? 0.22 : 0.12)
      modelRef.current.scale.setScalar(transform.scale)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        {weapon === "pistol" ? <primitive object={pistolModel} /> : null}
        {weapon === "ak47" && akModel ? <primitive object={akModel} /> : null}
      </group>
    </group>
  )
}

useGLTF.preload(PISTOL_MODEL_URL)

