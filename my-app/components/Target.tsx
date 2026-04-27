"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface TargetProps {
  position: [number, number, number]
}

export function Target({ position }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHit, setIsHit] = useState(false)

  // Use useFrame to animate the backward rotation smoothly
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // -Math.PI / 2 means 90 degrees backwards around X-axis
    const targetRotationX = isHit ? -Math.PI / 2 : 0
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      10 * delta
    )
  })

  return (
    <group position={position}>
      {/* Pivot group at the base (y=0) */}
      <group ref={groupRef}>
        {/* Support post */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        
        {/* Circular target at the top of the post */}
        {/* We use a cylinder to have a thick circle, rotated 90 degrees so it faces Z */}
        <mesh 
          position={[0, 1.5, 0.1]} 
          rotation={[Math.PI / 2, 0, 0]} 
          castShadow 
          receiveShadow
          onClick={(e) => {
            e.stopPropagation() // Prevent click from passing through
            if (!isHit) setIsHit(true)
          }}
        >
          {/* Main red circle */}
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#e53935" roughness={0.4} />
          
          {/* White inner circle */}
          <mesh position={[0, 0.051, 0]}>
             <cylinderGeometry args={[0.5, 0.5, 0.01, 32]} />
             <meshStandardMaterial color="white" roughness={0.4} />
          </mesh>
          
          {/* Red bullseye */}
          <mesh position={[0, 0.052, 0]}>
             <cylinderGeometry args={[0.2, 0.2, 0.01, 32]} />
             <meshStandardMaterial color="#e53935" roughness={0.4} />
          </mesh>
        </mesh>
      </group>
    </group>
  )
}
