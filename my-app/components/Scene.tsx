"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Environment } from "./Environment"
import { Player } from "./Player"
import { Target, type TargetKey } from "./Target"

function CameraRecoil({ recoilDebtRef }: { recoilDebtRef: React.MutableRefObject<number> }) {
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
    const returnSpeed = 3.0 // units/sec
    const step = Math.min(debt, returnSpeed * delta)
    camera.position.addScaledVector(dir, step)
    recoilDebtRef.current -= step
  })

  return null
}

function RaycastShooter({
  recoilDebtRef,
}: {
  recoilDebtRef: React.MutableRefObject<number>
}) {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const ndc = useMemo(() => new THREE.Vector2(0, 0), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const handlePointerDown = () => {
      raycasterRef.current.setFromCamera(ndc, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      const hit = intersects.find((i) => i.object?.userData?.isTarget && typeof i.object.userData.onHit === "function")
      if (!hit) return

      // Instant kick back (recoil) + add debt to return smoothly
      const kick = 0.15
      camera.getWorldDirection(dir)
      camera.position.addScaledVector(dir, -kick)
      recoilDebtRef.current += kick

      hit.object.userData.onHit(hit.point as THREE.Vector3)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [camera, scene, ndc, dir, recoilDebtRef])

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
  }, [])

  return (
    <>
      <spotLight
        ref={lightRef}
        position={lightPosition}
        intensity={3.5}
        angle={0.45}
        penumbra={0.45}
        distance={40}
        decay={2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <object3D ref={targetRef} position={targetPosition} />
    </>
  )
}

export function Scene({ onTargetFallen }: { onTargetFallen?: (targetKey: TargetKey) => void }) {
  const recoilDebtRef = useRef(0)

  return (
    <Canvas
      shadows
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 2, 5] }}
      className="h-full w-full"
    >
      <color attach="background" args={["#87ceeb"]} /> {/* Ciel par défaut */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <Environment />

      {/* Spotlights to highlight each target */}
      <TargetSpotlight lightPosition={[-3, 5, -2]} targetPosition={[-3, 1.5, -5]} />
      <TargetSpotlight lightPosition={[0, 5, -2]} targetPosition={[0, 1.5, -5]} />
      <TargetSpotlight lightPosition={[3, 5, -2]} targetPosition={[3, 1.5, -5]} />
      
      {/* 3 cibles alignées face au joueur (z=-5 est à 10 mètres de z=5) */}
      <Target targetKey="about" position={[-3, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="skills" position={[0, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="contact" position={[3, 0, -5]} onFallen={onTargetFallen} />

      <Player />
      <RaycastShooter recoilDebtRef={recoilDebtRef} />
      <CameraRecoil recoilDebtRef={recoilDebtRef} />
    </Canvas>
  )
}
