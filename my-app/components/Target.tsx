"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Sparks } from "./Sparks"

interface TargetProps {
  position: [number, number, number]
}

export function Target({ position }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHit, setIsHit] = useState(false)
  const [impactPoint, setImpactPoint] = useState<THREE.Vector3 | null>(null)

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

  // Fonction appelée par le raycaster global lorsqu'on tire sur cette cible
  const handleHit = (point: THREE.Vector3) => {
    if (!isHit) {
      setIsHit(true)
      // On sauvegarde le point d'impact (dans l'espace monde) pour générer les étincelles
      // Comme la Target elle-même va pivoter, on pourrait vouloir placer les étincelles globalement
      // Mais comme elles disparaissent vite, on peut simplement les attacher à la scène via le Player
      // Ou ici, on convertit le point monde en point local si on les attache à la cible.
      // Pour faire simple, on passe le point monde direct au composant Sparks si on l'attache en absolu, 
      // ou on convertit. Les particules sont éjectées rapidement de toute façon.
      
      // Convertir le point d'impact du monde vers les coordonnées locales du groupe parent
      if (groupRef.current && groupRef.current.parent) {
        const localPoint = groupRef.current.parent.worldToLocal(point.clone())
        setImpactPoint(localPoint)
      } else {
        setImpactPoint(point)
      }
    }
  }

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
          userData={{ isTarget: true, onHit: handleHit }}
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
      
      {/* Affichage des étincelles au point d'impact */}
      {impactPoint && <Sparks position={impactPoint} />}
    </group>
  )
}
