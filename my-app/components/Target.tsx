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
  const plateGlowRef = useRef<THREE.Mesh>(null)
  const [isHit, setIsHit] = useState(false)
  const [impactPoint, setImpactPoint] = useState<THREE.Vector3 | null>(null)
  const hitTimeRef = useRef<number | null>(null)
  const revealTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isHit) return
    hitTimeRef.current = performance.now()
    revealTimeoutRef.current = window.setTimeout(() => {
      onFallen?.(targetKey)
      revealTimeoutRef.current = null
    }, 220)
    const t = window.setTimeout(() => {
      setIsHit(false)
      setImpactPoint(null)
    }, 5000)

    return () => {
      window.clearTimeout(t)
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current)
        revealTimeoutRef.current = null
      }
    }
  }, [isHit, onFallen, targetKey])

  // Use useFrame to animate the backward rotation smoothly
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // -Math.PI / 2 means 90 degrees backwards around X-axis
    let targetRotationX = 0
    const hitTime = hitTimeRef.current
    const elapsed = hitTime ? (performance.now() - hitTime) / 1000 : 999
    if (isHit) {
      if (elapsed < 0.08) {
        targetRotationX = 0.12
      } else if (elapsed < 0.18) {
        targetRotationX = -0.1
      } else {
        targetRotationX = -Math.PI / 2
      }
    }
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      14 * delta
    )

    if (elapsed < 0.18) {
      const p = 1 - elapsed / 0.18
      const amp = 0.16 * p
      groupRef.current.rotation.z = Math.sin(elapsed * 95) * amp
      groupRef.current.rotation.y = Math.cos(elapsed * 115) * amp * 0.75
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 12 * delta)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 12 * delta)
    }

    if (plateGlowRef.current) {
      const pulse = 1.35 + Math.sin(state.clock.elapsedTime * 2.8 + position[0]) * 0.25
      const material = plateGlowRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isHit ? 2.8 : pulse
    }
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
      <mesh position={[0, 1.4, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 2.8, 0.22]} />
        <meshStandardMaterial color="#161a20" roughness={0.42} metalness={0.62} />
      </mesh>
      <mesh position={[0, 1.4, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 2.45, 0.08]} />
        <meshStandardMaterial color="#262d35" roughness={0.34} metalness={0.74} />
      </mesh>
      <mesh position={[0, 2.78, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.18, 0.12]} />
        <meshStandardMaterial
          color="#ff4d6d"
          emissive="#ff4d6d"
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.22}
        />
      </mesh>
      <mesh ref={plateGlowRef} position={[0, 1.4, -0.02]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[2.12, 2.52, 0.02]} />
        <meshStandardMaterial
          color="#6a101e"
          emissive="#ff315b"
          emissiveIntensity={1.35}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Pivot group at the base (y=0) */}
      <group ref={groupRef}>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.58, 0.72, 0.18, 28]} />
          <meshStandardMaterial color="#3f454d" roughness={0.48} metalness={0.82} />
        </mesh>

        {/* Support post */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshStandardMaterial color="#6a6f75" roughness={0.65} metalness={0.8} />
        </mesh>

        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.04, 0.9]} />
          <meshStandardMaterial color="#5f666d" roughness={0.7} metalness={0.85} />
        </mesh>

        <mesh position={[-0.28, 0.6, 0]} rotation={[0, 0, Math.PI / 10]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.95, 0.08]} />
          <meshStandardMaterial color="#70767d" roughness={0.72} metalness={0.75} />
        </mesh>
        <mesh position={[0.28, 0.6, 0]} rotation={[0, 0, -Math.PI / 10]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.95, 0.08]} />
          <meshStandardMaterial color="#70767d" roughness={0.72} metalness={0.75} />
        </mesh>
        
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
