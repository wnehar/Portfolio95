"use client"

import { useCallback, useRef } from "react"

type GunSoundType = "pistol" | "ak" | "sniper"

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

function ensureAudioContext(ref: React.MutableRefObject<AudioContext | null>) {
  if (ref.current) return ref.current
  const w = window as WebkitWindow
  const g = globalThis as unknown as { AudioContext?: typeof AudioContext }
  const Ctx = g.AudioContext ?? w.webkitAudioContext
  if (!Ctx) throw new Error("Web Audio API non supportée (AudioContext manquant).")
  ref.current = new Ctx()
  return ref.current
}

function burstNoise(ctx: AudioContext, duration: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  return src
}

export function useGunSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback((type: GunSoundType, gain: number) => {
    const ctx = ensureAudioContext(ctxRef)
    if (ctx.state === "suspended") void ctx.resume()

    const now = ctx.currentTime
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, now)
    out.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), now + 0.002)
    out.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    out.connect(ctx.destination)

    // Main tone
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.0001, now)
    oscGain.gain.exponentialRampToValueAtTime(0.35, now + 0.002)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
    osc.connect(oscGain)

    // Noise crack
    const noise = burstNoise(ctx, 0.06)
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = "highpass"
    noiseFilter.frequency.setValueAtTime(1200, now)
    noise.connect(noiseFilter)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.0001, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.6, now + 0.001)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
    noiseFilter.connect(noiseGain)

    // Weapon character
    if (type === "pistol") {
      osc.type = "square"
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.05)
    } else if (type === "ak") {
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.05)
      noiseFilter.frequency.setValueAtTime(1500, now)
      noiseGain.gain.setValueAtTime(0.0001, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.75, now + 0.001)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)
    } else {
      // sniper
      osc.type = "triangle"
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.07)
      noiseFilter.frequency.setValueAtTime(900, now)
      noiseGain.gain.setValueAtTime(0.0001, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.001)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
    }

    oscGain.connect(out)
    noiseGain.connect(out)

    osc.start(now)
    noise.start(now)
    osc.stop(now + 0.12)
    noise.stop(now + 0.08)
  }, [])

  return { play }
}

