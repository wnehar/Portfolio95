"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type Spark = {
  velocity: THREE.Vector3
  position: THREE.Vector3
  scale: number
  rotation: THREE.Euler
}

export function Sparks({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)
  const sparksRef = useRef<Spark[] | null>(null)
  const flashRef = useRef<THREE.Mesh>(null)
  const startTimeRef = useRef<number | null>(null)
  const count = 22
  
  useEffect(() => {
    startTimeRef.current = performance.now()
    const initial = Array.from({ length: count }).map(() => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        Math.random() * 11 + 4,
        (Math.random() - 0.5) * 18
      ),
      position: new THREE.Vector3(0, 0, 0),
      scale: Math.random() * 0.07 + 0.025,
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
    }))
    sparksRef.current = initial
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    if (!sparksRef.current) return
    const children = groupRef.current.children
    const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : 1

    if (flashRef.current) {
      const flashScale = Math.max(0, 1 - elapsed * 3.8)
      flashRef.current.scale.setScalar(0.45 * flashScale)
      ;(flashRef.current.material as THREE.Material).opacity = flashScale * 0.65
    }
    
    sparksRef.current.forEach((spark, i) => {
      spark.velocity.y -= 26 * delta
      spark.velocity.multiplyScalar(0.992)
      spark.position.addScaledVector(spark.velocity, delta)
      
      const mesh = children[i + 1] as THREE.Mesh
      if (mesh) {
        mesh.position.copy(spark.position)
        mesh.rotation.x += 6 * delta
        mesh.rotation.y += 10 * delta
        if (mesh.scale.x > 0) {
           const newScale = Math.max(0, mesh.scale.x - delta * 0.16)
           mesh.scale.set(newScale, newScale, newScale)
        }
      }
    })
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={flashRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffe1b5" transparent opacity={0.65} depthWrite={false} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} scale={[0.05, 0.05, 0.05]}>
          <boxGeometry args={[1.1, 0.34, 0.34]} />
          <meshBasicMaterial color={i % 3 === 0 ? "#fff2c7" : "#ffae42"} />
        </mesh>
      ))}
    </group>
  )
}
