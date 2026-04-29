"use client"

export type WeaponKey = "pistol" | "ak47"

export type WeaponConfig = {
  label: string
  automatic: boolean
  shotsPerSecond: number
  recoilKick: number
  recoilReturnSpeed: number
  zoom?: {
    enabled: boolean
    fov: number
    damping: number
  }
  sound: {
    type: "pistol" | "ak" | "sniper"
    gain: number
  }
}

export const WEAPONS: Record<WeaponKey, WeaponConfig> = {
  pistol: {
    label: "Pistolet",
    automatic: false,
    shotsPerSecond: 4.5,
    recoilKick: 0.06,
    recoilReturnSpeed: 14,
    sound: { type: "pistol", gain: 0.22 },
  },
  ak47: {
    label: "AK-47",
    automatic: true,
    shotsPerSecond: 11.5,
    recoilKick: 0.09,
    recoilReturnSpeed: 18,
    sound: { type: "ak", gain: 0.18 },
  },
}

