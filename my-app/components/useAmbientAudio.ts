"use client"

import { useCallback, useEffect, useRef } from "react"

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

function ensureAudioContext(ref: React.MutableRefObject<AudioContext | null>) {
  if (ref.current) return ref.current
  const w = window as WebkitWindow
  const g = globalThis as unknown as { AudioContext?: typeof AudioContext }
  const Ctx = g.AudioContext ?? w.webkitAudioContext
  if (!Ctx) throw new Error("Web Audio API non supportee.")
  ref.current = new Ctx()
  return ref.current
}

export function useAmbientAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  const stop = useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
  }, [])

  const start = useCallback((mode: "lobby" | "game") => {
    stop()

    const ctx = ensureAudioContext(ctxRef)
    if (ctx.state === "suspended") void ctx.resume()

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(mode === "lobby" ? 0.026 : 0.04, now + 1.2)
    master.connect(ctx.destination)

    const lowDrone = ctx.createOscillator()
    lowDrone.type = "sine"
    lowDrone.frequency.setValueAtTime(mode === "lobby" ? 56 : 48, now)

    const highDrone = ctx.createOscillator()
    highDrone.type = "triangle"
    highDrone.frequency.setValueAtTime(mode === "lobby" ? 132 : 118, now)

    const mod = ctx.createOscillator()
    mod.type = "sine"
    mod.frequency.setValueAtTime(mode === "lobby" ? 0.08 : 0.14, now)

    const modGain = ctx.createGain()
    modGain.gain.setValueAtTime(mode === "lobby" ? 3 : 5, now)
    mod.connect(modGain)
    modGain.connect(lowDrone.frequency)

    const droneFilter = ctx.createBiquadFilter()
    droneFilter.type = "lowpass"
    droneFilter.frequency.setValueAtTime(mode === "lobby" ? 360 : 480, now)

    const droneGain = ctx.createGain()
    droneGain.gain.setValueAtTime(mode === "lobby" ? 0.26 : 0.35, now)

    lowDrone.connect(droneFilter)
    highDrone.connect(droneFilter)
    droneFilter.connect(droneGain)
    droneGain.connect(master)

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = "bandpass"
    noiseFilter.frequency.setValueAtTime(mode === "lobby" ? 880 : 1240, now)
    noiseFilter.Q.setValueAtTime(0.4, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(mode === "lobby" ? 0.012 : 0.02, now)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(master)

    lowDrone.start(now)
    highDrone.start(now)
    mod.start(now)
    noise.start(now)

    stopRef.current = () => {
      const end = ctx.currentTime
      master.gain.cancelScheduledValues(end)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), end)
      master.gain.exponentialRampToValueAtTime(0.0001, end + 0.35)
      lowDrone.stop(end + 0.4)
      highDrone.stop(end + 0.4)
      mod.stop(end + 0.4)
      noise.stop(end + 0.4)
    }
  }, [stop])

  useEffect(() => stop, [stop])

  return { start, stop }
}
