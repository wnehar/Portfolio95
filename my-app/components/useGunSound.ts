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
    out.gain.exponentialRampToValueAtTime(0.0001, now + (type === "sniper" ? 0.38 : type === "ak" ? 0.24 : 0.18))
    out.connect(ctx.destination)

    const body = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    const transient = ctx.createOscillator()
    const transientGain = ctx.createGain()
    const noise = burstNoise(ctx, type === "sniper" ? 0.13 : 0.08)
    const noiseFilter = ctx.createBiquadFilter()
    const noiseGain = ctx.createGain()
    const tailNoise = burstNoise(ctx, type === "sniper" ? 0.22 : 0.14)
    const tailFilter = ctx.createBiquadFilter()
    const tailGain = ctx.createGain()

    body.connect(bodyGain)
    transient.connect(transientGain)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    tailNoise.connect(tailFilter)
    tailFilter.connect(tailGain)

    bodyGain.connect(out)
    transientGain.connect(out)
    noiseGain.connect(out)
    tailGain.connect(out)

    bodyGain.gain.setValueAtTime(0.0001, now)
    transientGain.gain.setValueAtTime(0.0001, now)
    noiseGain.gain.setValueAtTime(0.0001, now)
    tailGain.gain.setValueAtTime(0.0001, now)

    if (type === "pistol") {
      body.type = "triangle"
      body.frequency.setValueAtTime(190, now)
      body.frequency.exponentialRampToValueAtTime(92, now + 0.08)
      bodyGain.gain.exponentialRampToValueAtTime(0.42, now + 0.003)
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      transient.type = "square"
      transient.frequency.setValueAtTime(520, now)
      transient.frequency.exponentialRampToValueAtTime(180, now + 0.03)
      transientGain.gain.exponentialRampToValueAtTime(0.24, now + 0.001)
      transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028)

      noiseFilter.type = "highpass"
      noiseFilter.frequency.setValueAtTime(1450, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.68, now + 0.001)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)

      tailFilter.type = "bandpass"
      tailFilter.frequency.setValueAtTime(540, now)
      tailFilter.Q.setValueAtTime(0.9, now)
      tailGain.gain.exponentialRampToValueAtTime(0.12, now + 0.008)
      tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
    } else if (type === "ak") {
      body.type = "sawtooth"
      body.frequency.setValueAtTime(165, now)
      body.frequency.exponentialRampToValueAtTime(70, now + 0.07)
      bodyGain.gain.exponentialRampToValueAtTime(0.45, now + 0.002)
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      transient.type = "square"
      transient.frequency.setValueAtTime(720, now)
      transient.frequency.exponentialRampToValueAtTime(210, now + 0.025)
      transientGain.gain.exponentialRampToValueAtTime(0.18, now + 0.001)
      transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022)

      noiseFilter.type = "highpass"
      noiseFilter.frequency.setValueAtTime(1750, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.001)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

      tailFilter.type = "lowpass"
      tailFilter.frequency.setValueAtTime(820, now)
      tailGain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
      tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    } else {
      body.type = "triangle"
      body.frequency.setValueAtTime(122, now)
      body.frequency.exponentialRampToValueAtTime(48, now + 0.12)
      bodyGain.gain.exponentialRampToValueAtTime(0.58, now + 0.003)
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)

      transient.type = "sawtooth"
      transient.frequency.setValueAtTime(860, now)
      transient.frequency.exponentialRampToValueAtTime(160, now + 0.03)
      transientGain.gain.exponentialRampToValueAtTime(0.2, now + 0.001)
      transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024)

      noiseFilter.type = "highpass"
      noiseFilter.frequency.setValueAtTime(980, now)
      noiseGain.gain.exponentialRampToValueAtTime(1.05, now + 0.001)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      tailFilter.type = "bandpass"
      tailFilter.frequency.setValueAtTime(280, now)
      tailFilter.Q.setValueAtTime(0.55, now)
      tailGain.gain.exponentialRampToValueAtTime(0.24, now + 0.015)
      tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
    }

    body.start(now)
    transient.start(now)
    noise.start(now)
    tailNoise.start(now)
    body.stop(now + 0.2)
    transient.stop(now + 0.06)
    noise.stop(now + (type === "sniper" ? 0.13 : 0.08))
    tailNoise.stop(now + (type === "sniper" ? 0.26 : 0.16))
  }, [])

  return { play }
}

