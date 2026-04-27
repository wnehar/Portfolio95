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

export function Environment() {
  const textures = useMemo(() => {
    const polishedConcrete = makeNoiseTexture({
      size: 512,
      base: 175,
      variation: 22,
      contrast: 1.15,
      streaks: { direction: "x", strength: 0.08, count: 120 },
    })

    const darkIndustrialWall = makeNoiseTexture({
      size: 512,
      base: 70,
      variation: 18,
      contrast: 1.2,
      streaks: { direction: "y", strength: 0.12, count: 180 },
    })

    if (polishedConcrete) polishedConcrete.repeat.set(10, 10)
    if (darkIndustrialWall) darkIndustrialWall.repeat.set(6, 2)

    return { polishedConcrete, darkIndustrialWall }
  }, [])

  return (
    <group>
      {/* Sol en béton poli texturé */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          map={textures.polishedConcrete ?? undefined}
          color="#9aa0a6"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      
      {/* Mur de fond (béton industriel sombre) */}
      <mesh position={[0, 5, -30]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#2b2f33"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
      
      {/* Murs latéraux (béton industriel sombre) */}
      <mesh position={[-30, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#23272b"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
      
      <mesh position={[30, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial
          map={textures.darkIndustrialWall ?? undefined}
          color="#23272b"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
    </group>
  )
}
