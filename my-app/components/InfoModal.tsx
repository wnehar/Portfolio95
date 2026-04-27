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
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/80 p-6 text-white shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/85">{children}</div>
      </div>
    </div>
  )
}

