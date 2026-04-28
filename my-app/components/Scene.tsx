"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { Environment } from "./Environment"
import { Player } from "./Player"
import { Target, type TargetKey } from "./Target"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { WeaponModel } from "./WeaponModel"
import { WEAPONS, type WeaponKey } from "./weapons"
import { useGunSound } from "./useGunSound"

function CameraRecoil({
  recoilDebtRef,
  returnSpeedRef,
}: {
  recoilDebtRef: React.MutableRefObject<number>
  returnSpeedRef: React.MutableRefObject<number>
}) {
  const { camera } = useThree()
  const dir = useMemo(() => new THREE.Vector3(), [])

  // Apply a simple "debt" model:
  // - On shot: we push camera backward and add the same amount to debt
  // - Each frame: we move camera forward to repay the debt smoothly
  // This keeps the net displacement ~0 over time without needing a separate camera rig.
  useFrame((_, delta) => {
    const debt = recoilDebtRef.current
    if (debt <= 0) return

    camera.getWorldDirection(dir)
    const returnSpeed = returnSpeedRef.current
    const step = Math.min(debt, returnSpeed * delta)
    camera.position.addScaledVector(dir, step)
    recoilDebtRef.current -= step
  })

  return null
}

function MuzzleFlash({ shotCount }: { shotCount: number }) {
  const { camera } = useThree()
  const flashRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const flashUntilRef = useRef(0)
  const offset = useMemo(() => new THREE.Vector3(0.24, -0.13, -0.7), [])
  const worldOffset = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (shotCount <= 0) return
    flashUntilRef.current = performance.now() + 45
  }, [shotCount])

  useFrame(() => {
    if (!flashRef.current || !lightRef.current) return

    worldOffset.copy(offset).applyQuaternion(camera.quaternion)
    flashRef.current.position.copy(camera.position).add(worldOffset)
    flashRef.current.quaternion.copy(camera.quaternion)
    lightRef.current.position.copy(flashRef.current.position)

    const active = performance.now() < flashUntilRef.current && document.pointerLockElement
    flashRef.current.visible = active
    lightRef.current.visible = active

    if (active) {
      const flicker = 1 + Math.random() * 0.55
      flashRef.current.scale.setScalar(0.12 * flicker)
      lightRef.current.intensity = 4.5 * flicker
    }
  })

  return (
    <>
      <mesh ref={flashRef} visible={false}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#ffd7a8" transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} visible={false} intensity={0} distance={4.2} decay={2} color="#ffb36b" />
    </>
  )
}

function WeaponShooter({
  weapon,
  recoilDebtRef,
  recoilReturnSpeedRef,
  onShot,
  onHit,
}: {
  weapon: WeaponKey
  recoilDebtRef: React.MutableRefObject<number>
  recoilReturnSpeedRef: React.MutableRefObject<number>
  onShot?: () => void
  onHit?: () => void
}) {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const ndc = useMemo(() => new THREE.Vector2(0, 0), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const isFiringRef = useRef(false)
  const nextShotAtRef = useRef(0)
  const allowSemiRef = useRef(true)
  const { play } = useGunSound()

  const weaponConfig = WEAPONS[weapon]

  const doShot = useMemo(() => {
    return () => {
      // Only shoot when pointer is locked (prevents accidental shots while clicking UI)
      if (!document.pointerLockElement) return

      // Recoil
      camera.getWorldDirection(dir)
      camera.position.addScaledVector(dir, -weaponConfig.recoilKick)
      recoilDebtRef.current += weaponConfig.recoilKick
      recoilReturnSpeedRef.current = weaponConfig.recoilReturnSpeed
      onShot?.()

      // Sound (best-effort)
      play(weaponConfig.sound.type, weaponConfig.sound.gain)

      // Raycast hit detection (targets only)
      raycasterRef.current.setFromCamera(ndc, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      const hit = intersects.find((i) => i.object?.userData?.isTarget && typeof i.object.userData.onHit === "function")
      if (hit) {
        onHit?.()
        hit.object.userData.onHit(hit.point as THREE.Vector3)
      }
    }
  }, [camera, dir, ndc, onHit, onShot, play, recoilDebtRef, recoilReturnSpeedRef, scene.children, weaponConfig])

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      if (!document.pointerLockElement) return

      if (weaponConfig.automatic) {
        isFiringRef.current = true
        // Shoot immediately
        const now = performance.now()
        nextShotAtRef.current = now
      } else {
        if (!allowSemiRef.current) return
        allowSemiRef.current = false
        doShot()
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return
      isFiringRef.current = false
      allowSemiRef.current = true
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [doShot, weaponConfig.automatic])

  useFrame(() => {
    if (!weaponConfig.automatic) return
    if (!isFiringRef.current) return
    if (!document.pointerLockElement) return

    const now = performance.now()
    const intervalMs = 1000 / weaponConfig.shotsPerSecond
    if (now < nextShotAtRef.current) return

    doShot()
    nextShotAtRef.current = now + intervalMs
  })

  return null
}

function TargetAccentLight({
  lightPosition,
  targetPosition,
}: {
  lightPosition: [number, number, number]
  targetPosition: [number, number, number]
}) {
  const lightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return
    lightRef.current.target = targetRef.current
    // Sharper projected shadows
    lightRef.current.shadow.bias = -0.00012
    lightRef.current.shadow.normalBias = 0.02
    if (lightRef.current.shadow.camera) {
      lightRef.current.shadow.camera.near = 0.5
      lightRef.current.shadow.camera.far = 35
    }
  }, [])

  return (
    <>
      <spotLight
        ref={lightRef}
        position={lightPosition}
        intensity={5.2}
        angle={0.42}
        penumbra={0.65}
        distance={24}
        decay={2}
        color="#ffe8ef"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <object3D ref={targetRef} position={targetPosition} />
    </>
  )
}

export function Scene({
  weapon,
  onTargetFallen,
  onShot,
  onHit,
  shotCount = 0,
}: {
  weapon: WeaponKey
  onTargetFallen?: (targetKey: TargetKey) => void
  onShot?: () => void
  onHit?: () => void
  shotCount?: number
}) {
  const recoilDebtRef = useRef(0)
  const recoilReturnSpeedRef = useRef(WEAPONS[weapon].recoilReturnSpeed)

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 2, 5] }}
      className="h-full w-full"
    >
      <color attach="background" args={["#10141a"]} />
      <ambientLight intensity={0.34} color="#c5dcff" />
      <hemisphereLight intensity={0.6} color="#e1ecff" groundColor="#1b1d22" />

      <fog attach="fog" args={["#10141a", 11, 42]} />
      
      <Environment />

      <directionalLight
        position={[4, 8, 3]}
        intensity={1.6}
        color="#dbe8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-6, 5, -8]} intensity={0.7} color="#8ed2ff" />
      <pointLight position={[0, 4.6, 2.2]} intensity={15} distance={20} decay={2} color="#f8fbff" />
      <pointLight position={[-8.4, 2.2, -0.5]} intensity={9} distance={13} decay={2} color="#8be9fd" />
      <pointLight position={[8.4, 2.2, -0.5]} intensity={9} distance={13} decay={2} color="#ff5c7a" />
      <pointLight position={[0, 1.8, -1.2]} intensity={6.5} distance={12} decay={2} color="#d9e7ff" />

      {/* Soft target accents integrated into the ceiling lighting */}
      <TargetAccentLight lightPosition={[-3, 4.9, -3.6]} targetPosition={[-3, 1.5, -5.1]} />
      <TargetAccentLight lightPosition={[0, 4.9, -3.8]} targetPosition={[0, 1.5, -5.1]} />
      <TargetAccentLight lightPosition={[3, 4.9, -3.6]} targetPosition={[3, 1.5, -5.1]} />

      {/* Néon rouge émanant du centre de chaque cible */}
      <pointLight position={[-3, 1.5, -4.9]} intensity={5.6} distance={8} decay={2} color="#ff1744" />
      <pointLight position={[0, 1.5, -4.9]} intensity={5.6} distance={8} decay={2} color="#ff1744" />
      <pointLight position={[3, 1.5, -4.9]} intensity={5.6} distance={8} decay={2} color="#ff1744" />
      
      {/* 3 cibles alignées face au joueur (z=-5 est à 10 mètres de z=5) */}
      <Target targetKey="about" position={[-3, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="skills" position={[0, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="contact" position={[3, 0, -5]} onFallen={onTargetFallen} />

      <Player weapon={weapon} />
      <WeaponModel weapon={weapon} />
      <MuzzleFlash shotCount={shotCount} />
      <WeaponShooter
        weapon={weapon}
        recoilDebtRef={recoilDebtRef}
        recoilReturnSpeedRef={recoilReturnSpeedRef}
        onShot={onShot}
        onHit={onHit}
      />
      <CameraRecoil recoilDebtRef={recoilDebtRef} returnSpeedRef={recoilReturnSpeedRef} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.6} luminanceThreshold={0.42} luminanceSmoothing={0.22} />
      </EffectComposer>
    </Canvas>
  )
}
