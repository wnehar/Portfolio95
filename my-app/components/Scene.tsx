"use client"

import { Canvas } from "@react-three/fiber"
import { Environment } from "./Environment"
import { Player } from "./Player"

export function Scene() {
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
      <Player />
    </Canvas>
  )
}
