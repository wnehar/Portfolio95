import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { WEAPONS, type WeaponKey } from "./weapons"

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

export function Player({ weapon }: { weapon: WeaponKey }) {
  const { forward, backward, left, right } = usePlayerControls()
  const { camera, gl } = useThree()
  const cameraRef = useRef<THREE.Camera | null>(null)
  const domRef = useRef<HTMLElement | null>(null)
  const isLockedRef = useRef(false)
  
  const direction = useRef(new THREE.Vector3())
  const forwardVec = useMemo(() => new THREE.Vector3(), [])
  const rightVec = useMemo(() => new THREE.Vector3(), [])

  const speed = 10.0 // units per second

  // Mouse smoothing (dynamic damping)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const yawTargetRef = useRef(0)
  const pitchTargetRef = useRef(0)
  const zoomingRef = useRef(false)
  const fovTargetRef = useRef(75)

  useEffect(() => {
    cameraRef.current = camera
    domRef.current = gl.domElement
  }, [camera, gl.domElement])

  useEffect(() => {
    const dom = domRef.current
    if (!dom) return

    const onPointerDown = () => {
      if (document.pointerLockElement) return
      dom.requestPointerLock()
    }

    const onPointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === dom
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return
      const sensitivity = 0.0022
      yawTargetRef.current -= e.movementX * sensitivity
      pitchTargetRef.current -= e.movementY * sensitivity

      const maxPitch = Math.PI / 2 - 0.05
      pitchTargetRef.current = Math.max(-maxPitch, Math.min(maxPitch, pitchTargetRef.current))
    }

    const onContextMenu = (e: MouseEvent) => {
      // Prevent right-click menu while aiming
      if (isLockedRef.current) e.preventDefault()
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return
      if (!isLockedRef.current) return
      if (weapon !== "sniper") return
      zoomingRef.current = true
    }

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 2) return
      zoomingRef.current = false
    }

    dom.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("pointerlockchange", onPointerLockChange)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("contextmenu", onContextMenu, true)
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup", onMouseUp)

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointerlockchange", onPointerLockChange)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("contextmenu", onContextMenu, true)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [weapon])

  useFrame((state, delta) => {
    if (!isLockedRef.current) return
    const cam = cameraRef.current
    if (!cam) return

    // Camera damping toward target yaw/pitch
    const damping = 14 // higher = snappier
    const t = 1 - Math.exp(-damping * delta)
    yawRef.current = THREE.MathUtils.lerp(yawRef.current, yawTargetRef.current, t)
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, pitchTargetRef.current, t)

    cam.rotation.order = "YXZ"
    cam.rotation.y = yawRef.current
    cam.rotation.x = pitchRef.current

    // Zoom (sniper RMB)
    const baseFov = 75
    const zoomCfg = WEAPONS[weapon].zoom
    const desired = zoomCfg?.enabled && zoomingRef.current ? zoomCfg.fov : baseFov
    const zoomDamping = zoomCfg?.enabled ? zoomCfg.damping : 12
    fovTargetRef.current = desired

    if ("fov" in cam) {
      const current = (cam as THREE.PerspectiveCamera).fov
      const tz = 1 - Math.exp(-zoomDamping * delta)
      const next = THREE.MathUtils.lerp(current, fovTargetRef.current, tz)
      ;(cam as THREE.PerspectiveCamera).fov = next
      ;(cam as THREE.PerspectiveCamera).updateProjectionMatrix()
    }

    const z = Number(forward) - Number(backward)
    const x = Number(right) - Number(left)
    
    // Movement relative to yaw (ground plane)
    // In Three.js, forward is -Z by default, so we invert.
    forwardVec.set(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize()
    rightVec.set(-forwardVec.z, 0, forwardVec.x).normalize()

    direction.current.set(0, 0, 0)
    direction.current.addScaledVector(forwardVec, z)
    direction.current.addScaledVector(rightVec, x)

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize().multiplyScalar(speed * delta)
      cam.position.add(direction.current)
    }
  })

  return null
}
