"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Environment } from "./Environment"
import { Player } from "./Player"
import { Target, type TargetKey } from "./Target"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { WeaponModel } from "./WeaponModel"
import { WEAPONS, type WeaponKey } from "./weapons"
import { useGunSound } from "./useGunSound"

function LightBeam({
  lightPosition,
  targetPosition,
  radius = 0.7,
  opacity = 0.07,
  color = "#ffffff",
}: {
  lightPosition: [number, number, number]
  targetPosition: [number, number, number]
  radius?: number
  opacity?: number
  color?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const light = useMemo(() => new THREE.Vector3(...lightPosition), [lightPosition])
  const target = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  useEffect(() => {
    if (!meshRef.current) return
    const height = light.distanceTo(target)
    meshRef.current.position.set(...lightPosition)
    // Place cone so its base ends at the target
    meshRef.current.translateZ(-height / 2)

    // Orient the cone from light -> target
    dir.copy(target).sub(light).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
    meshRef.current.quaternion.copy(q)
  }, [lightPosition, targetPosition, light, target, dir, up])

  const height = light.distanceTo(target)

  return (
    <mesh ref={meshRef} renderOrder={2}>
      <coneGeometry args={[radius, height, 24, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

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

function WeaponShooter({
  weapon,
  recoilDebtRef,
  recoilReturnSpeedRef,
}: {
  weapon: WeaponKey
  recoilDebtRef: React.MutableRefObject<number>
  recoilReturnSpeedRef: React.MutableRefObject<number>
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

      // Sound (best-effort)
      play(weaponConfig.sound.type, weaponConfig.sound.gain)

      // Raycast hit detection (targets only)
      raycasterRef.current.setFromCamera(ndc, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      const hit = intersects.find((i) => i.object?.userData?.isTarget && typeof i.object.userData.onHit === "function")
      if (hit) hit.object.userData.onHit(hit.point as THREE.Vector3)
    }
  }, [camera, dir, ndc, play, recoilDebtRef, recoilReturnSpeedRef, scene.children, weaponConfig])

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

function TargetSpotlight({
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
        intensity={9}
        angle={0.26}
        penumbra={0.12}
        distance={35}
        decay={2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <object3D ref={targetRef} position={targetPosition} />
    </>
  )
}

export function Scene({
  weapon,
  onTargetFallen,
}: {
  weapon: WeaponKey
  onTargetFallen?: (targetKey: TargetKey) => void
}) {
  const recoilDebtRef = useRef(0)
  const recoilReturnSpeedRef = useRef(WEAPONS[weapon].recoilReturnSpeed)

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 2, 5] }}
      className="h-full w-full"
    >
      <color attach="background" args={["#2a2d32"]} /> {/* Ciel gris foncé uniforme */}
      {/* Ambiance très tamisée */}
      <ambientLight intensity={0.12} />

      {/* Brume légère pour donner de la présence aux faisceaux */}
      <fog attach="fog" args={["#2a2d32", 10, 38]} />
      
      <Environment />

      {/* Spotlights focalisés sur le centre de chaque cible */}
      <TargetSpotlight lightPosition={[-3, 5, -2]} targetPosition={[-3, 1.5, -5]} />
      <TargetSpotlight lightPosition={[0, 5, -2]} targetPosition={[0, 1.5, -5]} />
      <TargetSpotlight lightPosition={[3, 5, -2]} targetPosition={[3, 1.5, -5]} />

      {/* Faisceaux visibles (cône volumétrique léger) */}
      <LightBeam lightPosition={[-3, 5, -2]} targetPosition={[-3, 1.5, -5]} opacity={0.06} />
      <LightBeam lightPosition={[0, 5, -2]} targetPosition={[0, 1.5, -5]} opacity={0.06} />
      <LightBeam lightPosition={[3, 5, -2]} targetPosition={[3, 1.5, -5]} opacity={0.06} />

      {/* Néon rouge émanant du centre de chaque cible */}
      <pointLight position={[-3, 1.5, -4.9]} intensity={3.5} distance={6} decay={2} color="#ff1744" />
      <pointLight position={[0, 1.5, -4.9]} intensity={3.5} distance={6} decay={2} color="#ff1744" />
      <pointLight position={[3, 1.5, -4.9]} intensity={3.5} distance={6} decay={2} color="#ff1744" />
      
      {/* 3 cibles alignées face au joueur (z=-5 est à 10 mètres de z=5) */}
      <Target targetKey="about" position={[-3, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="skills" position={[0, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="contact" position={[3, 0, -5]} onFallen={onTargetFallen} />

      <Player weapon={weapon} />
      <WeaponModel weapon={weapon} />
      <WeaponShooter
        weapon={weapon}
        recoilDebtRef={recoilDebtRef}
        recoilReturnSpeedRef={recoilReturnSpeedRef}
      />
      <CameraRecoil recoilDebtRef={recoilDebtRef} returnSpeedRef={recoilReturnSpeedRef} />

      {/* Bloom léger sur les zones néon (emissive) */}
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.35} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
      </EffectComposer>
    </Canvas>
  )
}
