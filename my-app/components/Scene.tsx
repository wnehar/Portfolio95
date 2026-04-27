"use client"

import { Canvas } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Environment } from "./Environment"
import { Player } from "./Player"
import { Target, type TargetKey } from "./Target"

function RaycastShooter() {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new THREE.Raycaster())
  const ndc = useMemo(() => new THREE.Vector2(0, 0), [])

  useEffect(() => {
    const handlePointerDown = () => {
      raycasterRef.current.setFromCamera(ndc, camera)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      const hit = intersects.find((i) => i.object?.userData?.isTarget && typeof i.object.userData.onHit === "function")
      if (!hit) return

      hit.object.userData.onHit(hit.point as THREE.Vector3)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    return () => window.removeEventListener("pointerdown", handlePointerDown)
  }, [camera, scene, ndc])

  return null
}

export function Scene({ onTargetFallen }: { onTargetFallen?: (targetKey: TargetKey) => void }) {
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
      
      {/* 3 cibles alignées face au joueur (z=-5 est à 10 mètres de z=5) */}
      <Target targetKey="about" position={[-3, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="skills" position={[0, 0, -5]} onFallen={onTargetFallen} />
      <Target targetKey="contact" position={[3, 0, -5]} onFallen={onTargetFallen} />

      <Player />
      <RaycastShooter />
    </Canvas>
  )
}
