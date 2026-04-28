"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { WeaponKey } from "./weapons"

const PISTOL_MODEL_URL = "https://raw.githubusercontent.com/webaverse/pistol/master/glock.glb"

const WEAPON_TRANSFORMS: Record<
  WeaponKey,
  {
    offset: THREE.Vector3
    rotation: THREE.Euler
    scale: number
    adsOffset?: THREE.Vector3
  }
> = {
  pistol: {
    offset: new THREE.Vector3(0.25, -0.30, -0.48),
    rotation: new THREE.Euler(0.03, Math.PI, 0.035),
    scale: 0.22,
  },
  ak47: {
    offset: new THREE.Vector3(0.28, -0.26, -0.8),
    rotation: new THREE.Euler(-0.03, Math.PI - 0.08, 0.02),
    scale: 1,
  },
  sniper: {
    offset: new THREE.Vector3(0.22, -0.2, -1.02),
    rotation: new THREE.Euler(-0.015, Math.PI - 0.02, 0.01),
    scale: 1,
    adsOffset: new THREE.Vector3(0.01, -0.015, -0.56),
  },
}

function metalMaterial(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.34, metalness: 0.88 })
}

function polymerMaterial(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.18 })
}

function woodMaterial(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05 })
}

function ProceduralAk47() {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.12, 0.12]} />
        <primitive object={metalMaterial("#2a2f36")} attach="material" />
      </mesh>
      <mesh position={[0.28, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, 0.16, 0.16]} />
        <primitive object={metalMaterial("#343a44")} attach="material" />
      </mesh>
      <mesh position={[-0.52, 0.02, 0]} rotation={[0, 0, -0.92]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.16, 0.18]} />
        <primitive object={polymerMaterial("#171b20")} attach="material" />
      </mesh>
      <mesh position={[-0.78, 0.03, 0]} rotation={[0, 0, 0.65]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.14, 0.18]} />
        <primitive object={woodMaterial("#6f4228")} attach="material" />
      </mesh>
      <mesh position={[0.7, -0.08, 0]} rotation={[0, 0, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.26, 0.15]} />
        <primitive object={woodMaterial("#8b5a34")} attach="material" />
      </mesh>
      <mesh position={[0.12, -0.22, 0]} rotation={[0, 0, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.5, 0.12]} />
        <primitive object={metalMaterial("#272c34")} attach="material" />
      </mesh>
      <mesh position={[0.42, -0.34, 0]} rotation={[0, 0, 0.28]} castShadow receiveShadow>
        <torusGeometry args={[0.22, 0.07, 10, 22, Math.PI]} />
        <primitive object={metalMaterial("#2d323a")} attach="material" />
      </mesh>
      <mesh position={[0.94, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.18]} />
        <primitive object={metalMaterial("#22272f")} attach="material" />
      </mesh>
      <mesh position={[1.2, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.18, 0.14]} />
        <primitive object={woodMaterial("#7d4a28")} attach="material" />
      </mesh>
      <mesh position={[-0.18, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.08, 0.08]} />
        <primitive object={metalMaterial("#14181d")} attach="material" />
      </mesh>
    </group>
  )
}

function ProceduralSniper() {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 0.09, 0.09]} />
        <primitive object={metalMaterial("#272d35")} attach="material" />
      </mesh>
      <mesh position={[0.2, -0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.16, 0.16]} />
        <primitive object={polymerMaterial("#1a1e24")} attach="material" />
      </mesh>
      <mesh position={[-0.72, -0.18, 0]} rotation={[0, 0, -0.58]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.14, 0.18]} />
        <primitive object={polymerMaterial("#12161b")} attach="material" />
      </mesh>
      <mesh position={[-0.12, -0.28, 0]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.44, 0.11]} />
        <primitive object={polymerMaterial("#12161b")} attach="material" />
      </mesh>
      <mesh position={[0.1, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.84, 18]} />
        <primitive object={metalMaterial("#10141a")} attach="material" />
      </mesh>
      <mesh position={[-0.18, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.048, 0.048, 0.22, 16]} />
        <primitive object={metalMaterial("#0f1318")} attach="material" />
      </mesh>
      <mesh position={[0.38, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.048, 0.048, 0.22, 16]} />
        <primitive object={metalMaterial("#0f1318")} attach="material" />
      </mesh>
      <mesh position={[0.92, -0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.1, 0.14]} />
        <primitive object={polymerMaterial("#20252d")} attach="material" />
      </mesh>
      <mesh position={[1.18, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.22, 16]} />
        <primitive object={metalMaterial("#7d828a")} attach="material" />
      </mesh>
    </group>
  )
}

export function WeaponModel({
  weapon,
  sniperScoped = false,
}: {
  weapon: WeaponKey
  sniperScoped?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const aimingRef = useRef(false)
  const aimBlendRef = useRef(0)
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
  }, [pistolModelData.scene])

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

    const aimTarget = weapon === "sniper" && (aimingRef.current || sniperScoped) ? 1 : 0
    const t = 1 - Math.exp(-12 * delta)
    aimBlendRef.current = THREE.MathUtils.lerp(aimBlendRef.current, aimTarget, t)

    groupRef.current.quaternion.copy(camera.quaternion)
    tmp.copy(offset)
    if (weapon === "sniper" && aimBlendRef.current > 0.001) {
      tmp.lerp(transform.adsOffset ?? new THREE.Vector3(), aimBlendRef.current)
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
      modelRef.current.visible = !(weapon === "sniper" && aimBlendRef.current > 0.92)
      modelRef.current.rotation.copy(transform.rotation)
      modelRef.current.rotation.y += Math.sin(elapsed * 1.4) * 0.015 * bobScale
      if (weapon === "sniper" && aimBlendRef.current > 0.001) {
        modelRef.current.rotation.x = THREE.MathUtils.lerp(transform.rotation.x, -0.002, aimBlendRef.current)
        modelRef.current.rotation.y = THREE.MathUtils.lerp(transform.rotation.y, Math.PI, aimBlendRef.current)
        modelRef.current.rotation.z = THREE.MathUtils.lerp(transform.rotation.z, 0, aimBlendRef.current)
      }
      modelRef.current.scale.setScalar(transform.scale)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        {weapon === "pistol" ? <primitive object={pistolModel} /> : null}
        {weapon === "ak47" ? <ProceduralAk47 /> : null}
        {weapon === "sniper" ? <ProceduralSniper /> : null}
      </group>
    </group>
  )
}

useGLTF.preload(PISTOL_MODEL_URL)

