"use client"

import { useMemo } from "react"
import * as THREE from "three"

function makeNoiseTexture({
  size,
  base,
  variation,
  contrast,
  streaks,
}: {
  size: number
  base: number
  variation: number
  contrast: number
  streaks?: { direction: "x" | "y"; strength: number; count: number }
}) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const img = ctx.createImageData(size, size)
  const data = img.data

  // Basic noise
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const n = (Math.random() - 0.5) * 2 // [-1, 1]
      const v = base + n * variation
      const c = Math.max(0, Math.min(255, base + (v - base) * contrast))
      data[i + 0] = c
      data[i + 1] = c
      data[i + 2] = c
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Optional streaks / stains
  if (streaks) {
    ctx.globalAlpha = streaks.strength
    ctx.fillStyle = "rgba(0,0,0,1)"
    for (let i = 0; i < streaks.count; i++) {
      if (streaks.direction === "y") {
        const x = Math.random() * size
        const w = 1 + Math.random() * 3
        const h = size
        ctx.fillRect(x, 0, w, h)
      } else {
        const y = Math.random() * size
        const h = 1 + Math.random() * 3
        const w = size
        ctx.fillRect(0, y, w, h)
      }
    }
    ctx.globalAlpha = 1
  }

  // Subtle blur to make it feel like concrete
  ctx.globalAlpha = 0.55
  ctx.filter = "blur(1.2px)"
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = "none"
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function LightStrip({
  position,
  rotation = [0, 0, 0],
  size,
  color = "#ff4d6d",
  intensity = 1.8,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number, number]
  color?: string
  intensity?: number
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={false} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        roughness={0.25}
        metalness={0.15}
      />
    </mesh>
  )
}

function LaneDivider({ x }: { x: number }) {
  return (
    <group position={[x, -1.98, -0.6]}>
      <mesh position={[0, 0.16, -3.1]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.32, 6.6]} />
        <meshStandardMaterial color="#4f5660" roughness={0.42} metalness={0.86} />
      </mesh>
      <mesh position={[0, 0.9, -3.1]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.05, 6.2]} />
        <meshStandardMaterial color="#5f6872" roughness={0.36} metalness={0.88} />
      </mesh>
      <mesh position={[0, 1.48, -3.1]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.1, 6.25]} />
        <meshStandardMaterial color="#88909a" roughness={0.3} metalness={0.9} />
      </mesh>
      <LightStrip position={[0, 1.51, -3.1]} size={[0.04, 0.04, 6]} color="#ff6b81" intensity={2.2} />
    </group>
  )
}

function DisplayColumn({ x }: { x: number }) {
  return (
    <group position={[x, -2, 1.2]}>
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 3.5, 1.2]} />
        <meshStandardMaterial color="#191d24" roughness={0.54} metalness={0.48} />
      </mesh>
      <mesh position={[0, 1.75, 0.62]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 2.5, 0.08]} />
        <meshStandardMaterial color="#101317" roughness={0.35} metalness={0.62} />
      </mesh>
      <LightStrip position={[0, 2.8, 0.67]} size={[0.68, 0.06, 0.03]} color="#8be9fd" intensity={2} />
      <LightStrip position={[0, 0.76, 0.67]} size={[0.68, 0.06, 0.03]} color="#ff4d6d" intensity={2} />
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.84, 0.22, 24]} />
        <meshStandardMaterial color="#3a4048" roughness={0.42} metalness={0.78} />
      </mesh>
    </group>
  )
}

export function Environment() {
  const textures = useMemo(() => {
    const polishedConcrete = makeNoiseTexture({
      size: 512,
      base: 136,
      variation: 20,
      contrast: 1.2,
      streaks: { direction: "x", strength: 0.09, count: 150 },
    })

    const darkIndustrialWall = makeNoiseTexture({
      size: 512,
      base: 58,
      variation: 16,
      contrast: 1.28,
      streaks: { direction: "y", strength: 0.14, count: 220 },
    })

    const satinMetal = makeNoiseTexture({
      size: 512,
      base: 110,
      variation: 14,
      contrast: 1.08,
      streaks: { direction: "x", strength: 0.12, count: 200 },
    })

    if (polishedConcrete) polishedConcrete.repeat.set(10, 10)
    if (darkIndustrialWall) darkIndustrialWall.repeat.set(7, 3)
    if (satinMetal) satinMetal.repeat.set(4, 2)

    return { polishedConcrete, darkIndustrialWall, satinMetal }
  }, [])

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -6]} receiveShadow>
        <planeGeometry args={[48, 56]} />
        <meshStandardMaterial
          map={textures.polishedConcrete ?? undefined}
          color="#7f878f"
          roughness={0.42}
          metalness={0.06}
        />
      </mesh>

      {/* Player platform */}
      <mesh position={[0, -1.72, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.56, 7]} />
        <meshStandardMaterial
          map={textures.satinMetal ?? undefined}
          color="#2a2f37"
          roughness={0.34}
          metalness={0.74}
        />
      </mesh>

      {/* Shooting lane */}
      <mesh position={[0, -1.92, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[10, 0.16, 17.8]} />
        <meshStandardMaterial
          map={textures.satinMetal ?? undefined}
          color="#1c2127"
          roughness={0.28}
          metalness={0.82}
        />
      </mesh>

      {/* Brass lane trims */}
      <mesh position={[-3.15, -1.83, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.12, 17.4]} />
        <meshStandardMaterial
          color="#8c6c3f"
          roughness={0.28}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[3.15, -1.83, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.12, 17.4]} />
        <meshStandardMaterial color="#8c6c3f" roughness={0.28} metalness={0.9} />
      </mesh>

      {/* Back target stage */}
      <mesh position={[0, -1.55, -6.45]} castShadow receiveShadow>
        <boxGeometry args={[14.5, 0.9, 3.8]} />
        <meshStandardMaterial
          map={textures.satinMetal ?? undefined}
          color="#2e333b"
          roughness={0.32}
          metalness={0.8}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6.1, -5.6]} receiveShadow castShadow>
        <boxGeometry args={[22, 0.6, 22]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#111417"
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.3, -11.4]} receiveShadow castShadow>
        <boxGeometry args={[22, 8.5, 0.8]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#20252b"
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10.8, 2.3, -5.8]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[22, 8.5, 0.8]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#181d22"
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>
      <mesh position={[10.8, 2.3, -5.8]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[22, 8.5, 0.8]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#181d22"
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>

      {/* Architectural wall insets */}
      {[-6.4, 0, 6.4].map((x) => (
        <group key={`back-panel-${x}`} position={[x, 2.45, -10.98]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.4, 5.8, 0.18]} />
            <meshStandardMaterial
              map={textures.satinMetal ?? undefined}
              color="#101317"
              roughness={0.36}
              metalness={0.72}
            />
          </mesh>
          <LightStrip position={[0, 2.45, 0.08]} size={[3.2, 0.05, 0.02]} color="#8be9fd" intensity={1.2} />
        </group>
      ))}

      {/* Side accent panels */}
      {[-1, 1].map((side) => (
        <group key={`side-panel-${side}`} position={[side * 10.36, 2.2, -4.8]}>
          <mesh rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[11.5, 5.4, 0.14]} />
            <meshStandardMaterial
              map={textures.satinMetal ?? undefined}
              color="#12161c"
              roughness={0.4}
              metalness={0.74}
            />
          </mesh>
          <LightStrip
            position={[side * -0.06, 2.05, 0]}
            rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            size={[7.5, 0.05, 0.03]}
            color="#ff4d6d"
            intensity={1.6}
          />
          <LightStrip
            position={[side * -0.06, -1.8, 0]}
            rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            size={[7.5, 0.05, 0.03]}
            color="#8be9fd"
            intensity={1.1}
          />
        </group>
      ))}

      {/* Ceiling beams */}
      {[-6.4, 0, 6.4].map((x) => (
        <mesh key={`beam-${x}`} position={[x, 5.55, -5.6]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.8, 21]} />
          <meshStandardMaterial color="#303742" roughness={0.38} metalness={0.82} />
        </mesh>
      ))}

      {/* Target bay side wings */}
      <mesh position={[-6.1, 0.35, -6.25]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 4.4, 0.6]} />
        <meshStandardMaterial color="#1f252c" roughness={0.46} metalness={0.62} />
      </mesh>
      <mesh position={[6.1, 0.35, -6.25]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 4.4, 0.6]} />
        <meshStandardMaterial color="#1f252c" roughness={0.46} metalness={0.62} />
      </mesh>

      {/* Lane dividers */}
      <LaneDivider x={-3.35} />
      <LaneDivider x={3.35} />

      {/* Decorative columns */}
      <DisplayColumn x={-7.6} />
      <DisplayColumn x={7.6} />

      {/* Front desk-like blocks */}
      <mesh position={[-6.8, -1.28, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 1.4, 1.8]} />
        <meshStandardMaterial color="#2f353d" roughness={0.34} metalness={0.76} />
      </mesh>
      <mesh position={[6.8, -1.28, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 1.4, 1.8]} />
        <meshStandardMaterial color="#2f353d" roughness={0.34} metalness={0.76} />
      </mesh>

      {/* Ambient practical lights */}
      <pointLight position={[-7.4, 1.2, 1.6]} intensity={10} distance={6} decay={2} color="#8be9fd" />
      <pointLight position={[7.4, 1.2, 1.6]} intensity={10} distance={6} decay={2} color="#ff4d6d" />
      <pointLight position={[0, 0.3, -7.8]} intensity={8} distance={8} decay={2} color="#ffd166" />
    </group>
  )
}
