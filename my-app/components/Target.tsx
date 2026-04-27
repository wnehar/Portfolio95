"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Sparks } from "./Sparks"

export type TargetKey = "about" | "skills" | "contact"

interface TargetProps {
  position: [number, number, number]
  targetKey: TargetKey
  onFallen?: (targetKey: TargetKey) => void
}

export function Target({ position, targetKey, onFallen }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHit, setIsHit] = useState(false)
  const [impactPoint, setImpactPoint] = useState<THREE.Vector3 | null>(null)
  const hitTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isHit) return
    hitTimeRef.current = performance.now()
    const t = window.setTimeout(() => {
      setIsHit(false)
      setImpactPoint(null)
    }, 5000)

    return () => window.clearTimeout(t)
  }, [isHit])

  // Use useFrame to animate the backward rotation smoothly
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // -Math.PI / 2 means 90 degrees backwards around X-axis
    const targetRotationX = isHit ? -Math.PI / 2 : 0
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      22 * delta
    )

    // Small energetic vibration right after impact
    const hitTime = hitTimeRef.current
    const elapsed = hitTime ? (performance.now() - hitTime) / 1000 : 999
    if (elapsed < 0.18) {
      const p = 1 - elapsed / 0.18
      const amp = 0.08 * p
      groupRef.current.rotation.z = Math.sin(elapsed * 70) * amp
      groupRef.current.rotation.y = Math.cos(elapsed * 90) * amp * 0.6
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 18 * delta)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 18 * delta)
    }
  })

  // Fonction appelée par le raycaster global lorsqu'on tire sur cette cible
  const handleHit = (point: THREE.Vector3) => {
    if (!isHit) {
      setIsHit(true)
      onFallen?.(targetKey)
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
        {/* Support post (acier usé) */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshStandardMaterial color="#6a6f75" roughness={0.65} metalness={0.8} />
        </mesh>

        {/* Base plate */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.04, 0.9]} />
          <meshStandardMaterial color="#5f666d" roughness={0.7} metalness={0.85} />
        </mesh>

        {/* Angled supports (worn steel) */}
        <mesh position={[-0.28, 0.6, 0]} rotation={[0, 0, Math.PI / 10]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.95, 0.08]} />
          <meshStandardMaterial color="#70767d" roughness={0.72} metalness={0.75} />
        </mesh>
        <mesh position={[0.28, 0.6, 0]} rotation={[0, 0, -Math.PI / 10]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.95, 0.08]} />
          <meshStandardMaterial color="#70767d" roughness={0.72} metalness={0.75} />
        </mesh>
        
        {/* Circular target at the top of the post */}
        {/* We use a cylinder to have a thick circle, rotated 90 degrees so it faces Z */}
        <mesh 
          position={[0, 1.5, 0.1]} 
          rotation={[Math.PI / 2, 0, 0]} 
          castShadow 
          receiveShadow
          userData={{ isTarget: true, targetKey, onHit: handleHit }}
        >
          {/* Main red circle */}
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#b71c1c" roughness={0.55} metalness={0.05} />
          
          {/* White inner circle */}
          <mesh position={[0, 0.051, 0]}>
             <cylinderGeometry args={[0.5, 0.5, 0.01, 32]} />
             <meshStandardMaterial color="white" roughness={0.4} />
          </mesh>
          
          {/* Neon red bullseye */}
          <mesh position={[0, 0.052, 0]}>
             <cylinderGeometry args={[0.2, 0.2, 0.01, 32]} />
             <meshStandardMaterial
               color="#ff1744"
               emissive="#ff1744"
               emissiveIntensity={2.4}
               roughness={0.25}
               metalness={0.1}
             />
          </mesh>
        </mesh>
      </group>
      
      {/* Affichage des étincelles au point d'impact */}
      {impactPoint && <Sparks position={impactPoint} />}
    </group>
  )
}
