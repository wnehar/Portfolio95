"use client"

import { useEffect } from "react"

export function InfoModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(23,23,23,0.98),rgba(8,8,8,0.96))] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="pointer-events-none absolute -left-16 top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-16 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-white/45">Target unlocked</p>
            <h2 className="text-2xl font-semibold tracking-wide">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Fermer
          </button>
        </div>

        <div className="relative mt-6 max-h-[68vh] overflow-y-auto pr-2 text-sm leading-relaxed text-white/85 [scrollbar-color:rgba(248,113,113,0.55)_transparent] [scrollbar-width:thin]">
          {children}
        </div>

        <div className="relative mt-8 flex justify-center border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-red-400/30 bg-red-500/15 px-6 py-3 text-sm font-semibold tracking-[0.18em] text-white shadow-[0_0_30px_rgba(239,68,68,0.18)] transition hover:bg-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-300/40"
          >
            Continuer a jouer
          </button>
        </div>
      </div>
    </div>
  )
}

