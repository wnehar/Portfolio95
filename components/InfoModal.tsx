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
      <style jsx>{`
        @keyframes modalBackdropIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(20px);
          }
        }

        @keyframes modalCardIn {
          0% {
            opacity: 0;
            transform: translateY(42px) scale(0.9) rotateX(10deg);
            filter: blur(10px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.22);
          }
          55% {
            opacity: 1;
            transform: translateY(-8px) scale(1.012) rotateX(0deg);
            filter: blur(0px);
            box-shadow: 0 35px 120px rgba(0, 0, 0, 0.58);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
            filter: blur(0px);
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
          }
        }

        @keyframes modalContentIn {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalGlowSweep {
          0% {
            opacity: 0;
            transform: translateX(-18%) skewX(-14deg);
          }
          100% {
            opacity: 1;
            transform: translateX(14%) skewX(-14deg);
          }
        }
      `}</style>

      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        style={{ animation: "modalBackdropIn 240ms ease-out both" }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(23,23,23,0.98),rgba(8,8,8,0.96))] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        style={{
          animation: "modalCardIn 560ms cubic-bezier(0.16, 1, 0.3, 1) both",
          transformOrigin: "50% 70%",
          perspective: "1200px",
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
          style={{ animation: "modalGlowSweep 820ms ease-out 90ms both" }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="pointer-events-none absolute -left-16 top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-16 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

        <div
          className="relative flex items-start justify-between gap-4 border-b border-white/10 pb-4"
          style={{ animation: "modalContentIn 360ms ease-out 120ms both" }}
        >
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

        <div
          className="relative mt-6 max-h-[68vh] overflow-y-auto pr-2 text-sm leading-relaxed text-white/85 [scrollbar-color:rgba(248,113,113,0.55)_transparent] [scrollbar-width:thin]"
          style={{ animation: "modalContentIn 420ms ease-out 190ms both" }}
        >
          {children}
        </div>

        <div
          className="relative mt-8 flex justify-center border-t border-white/10 pt-5"
          style={{ animation: "modalContentIn 420ms ease-out 260ms both" }}
        >
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

