"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type Spark = {
  velocity: THREE.Vector3
  position: THREE.Vector3
  scale: number
}

export function Sparks({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)
  const sparksRef = useRef<Spark[] | null>(null)
  const count = 15
  
  useEffect(() => {
    const initial = Array.from({ length: count }).map(() => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 15
      ),
      position: new THREE.Vector3(0, 0, 0),
      scale: Math.random() * 0.05 + 0.02,
    }))
    sparksRef.current = initial
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    if (!sparksRef.current) return
    const children = groupRef.current.children
    
    // Animate sparks
    sparksRef.current.forEach((spark, i) => {
      // Apply gravity
      spark.velocity.y -= 25 * delta 
      spark.position.addScaledVector(spark.velocity, delta)
      
      const mesh = children[i] as THREE.Mesh
      if (mesh) {
        mesh.position.copy(spark.position)
        // Shrink particles over time
        if (mesh.scale.x > 0) {
           const newScale = Math.max(0, mesh.scale.x - delta * 0.1)
           mesh.scale.set(newScale, newScale, newScale)
        }
      }
    })
  })

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} scale={[0.05, 0.05, 0.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      ))}
    </group>
  )
}
