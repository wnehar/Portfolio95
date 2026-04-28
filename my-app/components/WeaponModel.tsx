"use client"

import { useEffect, useMemo, useRef } from "react"
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
    offset: new THREE.Vector3(0.25, -0.30, -0.48),
    rotation: new THREE.Euler(0.03, Math.PI, 0.035),
    scale: 0.22,
  },
  ak47: {
    offset: new THREE.Vector3(0.27, -0.32, -0.60),
    rotation: new THREE.Euler(0.065, Math.PI, 0.03),
    scale: 0.16,
  },
  sniper: {
    offset: new THREE.Vector3(0.29, -0.35, -0.70),
    rotation: new THREE.Euler(0.03, Math.PI, 0.015),
    scale: 0.145,
  },
}

export function WeaponModel({ weapon }: { weapon: WeaponKey }) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const aimingRef = useRef(false)
  const aimBlendRef = useRef(0)
  const { scene } = useGLTF(WEAPON_MODEL_URLS[weapon])
  const transform = WEAPON_TRANSFORMS[weapon]
  const offset = transform.offset

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const adsOffset = useMemo(() => new THREE.Vector3(0.10, 0.07, 0.16), [])
  const swayRef = useRef(new THREE.Vector3())
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

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return
      if (!document.pointerLockElement) return
      if (weapon !== "sniper") return
      aimingRef.current = true
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 2) return
      aimingRef.current = false
    }
    const onLockChange = () => {
      if (!document.pointerLockElement) aimingRef.current = false
    }

    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("pointerlockchange", onLockChange)
    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("pointerlockchange", onLockChange)
    }
  }, [weapon])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const aimTarget = weapon === "sniper" && aimingRef.current ? 1 : 0
    const t = 1 - Math.exp(-12 * delta)
    aimBlendRef.current = THREE.MathUtils.lerp(aimBlendRef.current, aimTarget, t)

    groupRef.current.quaternion.copy(camera.quaternion)
    tmp.copy(offset)
    if (weapon === "sniper" && aimBlendRef.current > 0.001) {
      tmp.lerp(adsOffset, aimBlendRef.current)
    }
    const elapsed = state.clock.elapsedTime
    const bobScale = 1 - aimBlendRef.current * 0.75
    swayRef.current.set(
      Math.sin(elapsed * 1.9) * 0.012 * bobScale,
      Math.cos(elapsed * 2.8) * 0.008 * bobScale,
      0
    )
    tmp.add(swayRef.current)
    tmp.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(tmp)

    if (modelRef.current) {
      modelRef.current.rotation.copy(transform.rotation)
      modelRef.current.rotation.y += Math.sin(elapsed * 1.4) * 0.015 * bobScale
      if (weapon === "sniper" && aimBlendRef.current > 0.001) {
        modelRef.current.rotation.x = THREE.MathUtils.lerp(transform.rotation.x, 0, aimBlendRef.current)
        modelRef.current.rotation.z = THREE.MathUtils.lerp(transform.rotation.z, 0, aimBlendRef.current)
      }
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

