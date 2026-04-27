import { useEffect, useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { PointerLockControls } from "@react-three/drei"
import * as THREE from "three"

const keys = { 
  KeyW: "forward", KeyS: "backward", KeyA: "left", KeyD: "right", 
  KeyZ: "forward", KeyQ: "left",
  ArrowUp: "forward", ArrowDown: "backward", ArrowLeft: "left", ArrowRight: "right" 
}

export const usePlayerControls = () => {
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false })
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let action = keys[e.code as keyof typeof keys]
      // Support explicitly for ZQSD (French keyboard mapping)
      if (e.key === 'z' || e.key === 'Z') action = 'forward'
      if (e.key === 'q' || e.key === 'Q') action = 'left'
      if (e.key === 's' || e.key === 'S') action = 'backward'
      if (e.key === 'd' || e.key === 'D') action = 'right'
      
      if (action) setMovement((m) => ({ ...m, [action]: true }))
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      let action = keys[e.code as keyof typeof keys]
      if (e.key === 'z' || e.key === 'Z') action = 'forward'
      if (e.key === 'q' || e.key === 'Q') action = 'left'
      if (e.key === 's' || e.key === 'S') action = 'backward'
      if (e.key === 'd' || e.key === 'D') action = 'right'

      if (action) setMovement((m) => ({ ...m, [action]: false }))
    }
    
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [])
  
  return movement
}

export function Player() {
  const { forward, backward, left, right } = usePlayerControls()
  const controlsRef = useRef<any>(null)
  
  const direction = useRef(new THREE.Vector3())
  const speed = 10.0 // units per second

  useFrame((state, delta) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) return

    const z = Number(forward) - Number(backward)
    const x = Number(right) - Number(left)
    
    direction.current.set(x, 0, z).normalize().multiplyScalar(speed * delta)

    if (direction.current.x) controlsRef.current.moveRight(direction.current.x)
    if (direction.current.z) controlsRef.current.moveForward(direction.current.z)
  })

  return <PointerLockControls ref={controlsRef} />
}
