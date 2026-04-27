"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Sparks({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Generate random initial velocities for 15 sparks
  const sparks = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 15
      ),
      position: new THREE.Vector3(0, 0, 0),
      scale: Math.random() * 0.05 + 0.02
    }))
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children
    
    // Animate sparks
    sparks.forEach((spark, i) => {
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
      {sparks.map((spark, i) => (
        <mesh key={i} scale={[spark.scale, spark.scale, spark.scale]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      ))}
    </group>
  )
}
