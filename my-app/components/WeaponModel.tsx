"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { WeaponKey } from "./weapons"

export function WeaponModel({ weapon }: { weapon: WeaponKey }) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const offset = useMemo(() => {
    // right, down, forward (camera space)
    if (weapon === "sniper") return new THREE.Vector3(0.22, -0.22, -0.55)
    if (weapon === "ak47") return new THREE.Vector3(0.22, -0.23, -0.48)
    return new THREE.Vector3(0.20, -0.22, -0.40)
  }, [weapon])

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.quaternion.copy(camera.quaternion)
    tmp.copy(offset).applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(tmp)
  })

  return (
    <group ref={groupRef}>
      {weapon === "pistol" && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.08, 0.32]} />
            <meshStandardMaterial color="#2e3338" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.09, 0.05]} castShadow>
            <boxGeometry args={[0.08, 0.18, 0.10]} />
            <meshStandardMaterial color="#1f2327" roughness={0.75} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, -0.18]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.12]} />
            <meshStandardMaterial color="#3a3f46" roughness={0.45} metalness={0.65} />
          </mesh>
        </group>
      )}

      {weapon === "ak47" && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.10, 0.62]} />
            <meshStandardMaterial color="#2b3036" roughness={0.55} metalness={0.65} />
          </mesh>
          <mesh position={[0, -0.12, 0.06]} rotation={[0, 0, Math.PI / 14]} castShadow>
            <boxGeometry args={[0.08, 0.22, 0.12]} />
            <meshStandardMaterial color="#1e2126" roughness={0.8} metalness={0.25} />
          </mesh>
          <mesh position={[0, -0.08, -0.12]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.10]} />
            <meshStandardMaterial color="#3a2b22" roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.02, -0.30]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.18]} />
            <meshStandardMaterial color="#3a3f46" roughness={0.45} metalness={0.7} />
          </mesh>
        </group>
      )}

      {weapon === "sniper" && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.10, 0.82]} />
            <meshStandardMaterial color="#262b31" roughness={0.55} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.10, -0.10]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.38, 18]} />
            <meshStandardMaterial color="#1f2327" roughness={0.45} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.10, -0.28]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.46, 18]} />
            <meshStandardMaterial color="#1b1f24" roughness={0.35} metalness={0.85} />
          </mesh>
          <mesh position={[0, -0.12, 0.12]} castShadow>
            <boxGeometry args={[0.08, 0.22, 0.12]} />
            <meshStandardMaterial color="#1e2126" roughness={0.8} metalness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  )
}

