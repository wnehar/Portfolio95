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
  const flashRef = useRef<THREE.Group>(null)
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

    const active = performance.now() < flashUntilRef.current && !!document.pointerLockElement
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
      <group ref={flashRef} visible={false}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.55, 1.5, 8, 1]} />
          <meshBasicMaterial color="#ffe2b5" transparent opacity={0.92} depthWrite={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.75, 0.75, 0.75]}>
          <coneGeometry args={[0.42, 1.2, 8, 1]} />
          <meshBasicMaterial color="#ffb45f" transparent opacity={0.82} depthWrite={false} />
        </mesh>
        <mesh scale={[0.35, 0.35, 0.35]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#fff4d6" transparent opacity={0.88} depthWrite={false} />
        </mesh>
      </group>
      <pointLight ref={lightRef} visible={false} intensity={0} distance={4.2} decay={2} color="#ffb36b" />
    </>
  )
}

function getWeaponMuzzleOffset(weapon: WeaponKey) {
  if (weapon === "ak47") return new THREE.Vector3(-0.2, -0.1, -0.78)
  return new THREE.Vector3(0.24, -0.13, -0.7)
}

type ShellCasing = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  spin: THREE.Vector3
  bornAt: number
}

type ProjectileTrace = {
  start: THREE.Vector3
  end: THREE.Vector3
  progress: number
  speed: number
  bornAt: number
}

function ShellEjection({ shotCount }: { shotCount: number }) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const casingsRef = useRef<ShellCasing[]>([])
  const rightOffset = useMemo(() => new THREE.Vector3(0.22, -0.08, -0.35), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const side = useMemo(() => new THREE.Vector3(), [])
  const forward = useMemo(() => new THREE.Vector3(), [])
  const tempPos = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (shotCount <= 0) return

    forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
    side.set(1, 0, 0).applyQuaternion(camera.quaternion)
    tempPos.copy(rightOffset).applyQuaternion(camera.quaternion).add(camera.position)

    casingsRef.current.unshift({
      position: tempPos.clone(),
      velocity: side.multiplyScalar(2.4).add(up.clone().multiplyScalar(1.8)).add(forward.multiplyScalar(0.55)),
      rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
      spin: new THREE.Vector3(10 + Math.random() * 8, 12 + Math.random() * 8, 8 + Math.random() * 6),
      bornAt: performance.now(),
    })

    casingsRef.current = casingsRef.current.slice(0, 12)
  }, [camera, forward, rightOffset, shotCount, side, tempPos, up])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const now = performance.now()
    casingsRef.current = casingsRef.current.filter((casing) => now - casing.bornAt < 2200)

    casingsRef.current.forEach((casing, i) => {
      casing.velocity.y -= 5.8 * delta
      casing.velocity.multiplyScalar(0.992)
      casing.position.addScaledVector(casing.velocity, delta)
      casing.rotation.x += casing.spin.x * delta
      casing.rotation.y += casing.spin.y * delta
      casing.rotation.z += casing.spin.z * delta
      if (casing.position.y < -1.85) {
        casing.position.y = -1.85
        casing.velocity.y *= -0.18
        casing.velocity.x *= 0.92
        casing.velocity.z *= 0.92
      }

      const mesh = groupRef.current.children[i] as THREE.Mesh | undefined
      if (!mesh) return
      mesh.visible = true
      mesh.position.copy(casing.position)
      mesh.rotation.copy(casing.rotation)
    })

    for (let i = casingsRef.current.length; i < groupRef.current.children.length; i++) {
      const mesh = groupRef.current.children[i] as THREE.Mesh
      mesh.visible = false
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} visible={false} castShadow receiveShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.09, 10]} />
          <meshStandardMaterial color="#b38a3a" roughness={0.28} metalness={0.92} />
        </mesh>
      ))}
    </group>
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
  const projectileGroupRef = useRef<THREE.Group>(null)
  const projectilesRef = useRef<ProjectileTrace[]>([])
  const impactTimeoutsRef = useRef<number[]>([])
  const { play } = useGunSound()
  const muzzleOffset = useMemo(() => getWeaponMuzzleOffset(weapon), [weapon])
  const startPoint = useMemo(() => new THREE.Vector3(), [])
  const endPoint = useMemo(() => new THREE.Vector3(), [])
  const shotDir = useMemo(() => new THREE.Vector3(), [])

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

      startPoint.copy(muzzleOffset).applyQuaternion(camera.quaternion).add(camera.position)

      // Raycast hit detection (targets only)
      raycasterRef.current.setFromCamera(ndc, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      const hit = intersects.find((i) => i.object?.userData?.isTarget && typeof i.object.userData.onHit === "function")
      shotDir.copy(dir)
      if (hit) {
        endPoint.copy(hit.point as THREE.Vector3)
        const distance = startPoint.distanceTo(endPoint)
        const travelMs = Math.max(110, (distance / 55) * 1000)
        projectilesRef.current.unshift({
          start: startPoint.clone(),
          end: endPoint.clone(),
          progress: 0,
          speed: 1 / (travelMs / 1000),
          bornAt: performance.now(),
        })
        projectilesRef.current = projectilesRef.current.slice(0, 18)

        const timeoutId = window.setTimeout(() => {
          onHit?.()
          hit.object.userData.onHit(hit.point as THREE.Vector3)
          impactTimeoutsRef.current = impactTimeoutsRef.current.filter((id) => id !== timeoutId)
        }, travelMs)
        impactTimeoutsRef.current.push(timeoutId)
      } else {
        endPoint.copy(startPoint).addScaledVector(shotDir, 80)
        projectilesRef.current.unshift({
          start: startPoint.clone(),
          end: endPoint.clone(),
          progress: 0,
          speed: 1 / 0.48,
          bornAt: performance.now(),
        })
        projectilesRef.current = projectilesRef.current.slice(0, 18)
      }
    }
  }, [camera, dir, endPoint, muzzleOffset, ndc, onHit, onShot, play, recoilDebtRef, recoilReturnSpeedRef, scene.children, shotDir, startPoint, weaponConfig])

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
      impactTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
      impactTimeoutsRef.current = []
    }
  }, [doShot, weaponConfig.automatic])

  useFrame((_, delta) => {
    if (!weaponConfig.automatic) return
    if (!isFiringRef.current) return
    if (!document.pointerLockElement) return

    const now = performance.now()
    const intervalMs = 1000 / weaponConfig.shotsPerSecond
    if (now < nextShotAtRef.current) return

    doShot()
    nextShotAtRef.current = now + intervalMs
  })

  useFrame((_, delta) => {
    if (!projectileGroupRef.current) return

    const now = performance.now()
    projectilesRef.current = projectilesRef.current.filter((projectile) => {
      projectile.progress = Math.min(1, projectile.progress + projectile.speed * delta)
      return projectile.progress < 1 || now - projectile.bornAt < 60
    })

    projectilesRef.current.forEach((projectile, i) => {
      const mesh = projectileGroupRef.current?.children[i] as THREE.Mesh | undefined
      if (!mesh) return
      const current = projectile.start.clone().lerp(projectile.end, projectile.progress)
      const dirToEnd = projectile.end.clone().sub(projectile.start)
      const length = Math.min(1.75, Math.max(0.38, dirToEnd.length() * 0.1))
      mesh.visible = true
      mesh.position.copy(current)
      mesh.scale.set(0.045, 0.045, length)
      mesh.lookAt(projectile.end)
    })

    for (let i = projectilesRef.current.length; i < projectileGroupRef.current.children.length; i++) {
      const mesh = projectileGroupRef.current.children[i] as THREE.Mesh
      mesh.visible = false
    }
  })

  return (
    <group ref={projectileGroupRef}>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} visible={false}>
          <capsuleGeometry args={[0.35, 0.6, 4, 8]} />
          <meshBasicMaterial color="#fff2c8" transparent opacity={0.98} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
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
      <WeaponModel weapon={weapon} shotCount={shotCount} />
      <MuzzleFlash shotCount={shotCount} />
      <ShellEjection shotCount={shotCount} />
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
