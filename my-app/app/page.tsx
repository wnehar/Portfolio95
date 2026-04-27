"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scene } from "@/components/Scene";
import { InfoModal } from "@/components/InfoModal";
import type { TargetKey } from "@/components/Target";
import { WEAPONS, type WeaponKey } from "@/components/weapons";

export default function Home() {
  const [openKey, setOpenKey] = useState<TargetKey | null>(null);
  const [weapon, setWeapon] = useState<WeaponKey>("pistol");
  const [weaponsOpen, setWeaponsOpen] = useState(false);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem("portfolio_best_score");
    return saved ? Number(saved) || 0 : 0;
  });
  const [hitFlash, setHitFlash] = useState(false);
  const streakResetRef = useRef<number | null>(null);
  const hitFlashRef = useRef<number | null>(null);

  const contentByTarget = useMemo(() => {
    return {
      about: {
        title: "À propos",
        body: (
          <>
            <p>
              Je conçois et développe des expériences web interactives, avec un
              goût pour les interfaces propres, les animations subtiles et la
              performance.
            </p>
            <p>
              Mon objectif: transformer une idée en un produit clair, utile et
              agréable à utiliser.
            </p>
          </>
        ),
      },
      skills: {
        title: "Compétences",
        body: (
          <>
            <p>
              Front-end: React / Next.js, TypeScript, UI responsive,
              accessibilité.
            </p>
            <p>
              3D & interaction: Three.js, React Three Fiber, intégration
              d’expériences temps réel.
            </p>
            <p>
              Bonnes pratiques: design system léger, code maintenable,
              optimisation des assets.
            </p>
          </>
        ),
      },
      contact: {
        title: "Contact",
        body: (
          <>
            <p>
              Envie de collaborer, proposer une mission ou simplement discuter?
            </p>
            <p>
              Écris-moi avec un bref contexte (projet, deadline, budget) et je
              te réponds rapidement.
            </p>
          </>
        ),
      },
    } satisfies Record<TargetKey, { title: string; body: React.ReactNode }>;
  }, []);

  const handleTargetFallen = useCallback((targetKey: TargetKey) => {
    setOpenKey(targetKey);
  }, []);

  const updateBestScore = useCallback((nextScore: number) => {
    setBestScore((prev) => {
      const next = Math.max(prev, nextScore);
      if (next !== prev) window.localStorage.setItem("portfolio_best_score", String(next));
      return next;
    });
  }, []);

  const handleShot = useCallback(() => {
    setShots((v) => v + 1);
  }, []);

  const handleHit = useCallback(() => {
    const weaponBonus = weapon === "sniper" ? 140 : weapon === "ak47" ? 70 : 95;
    setHits((v) => v + 1);
    setStreak((prevStreak) => {
      const nextStreak = prevStreak + 1;
      const gained = weaponBonus + nextStreak * 8;
      setScore((prevScore) => {
        const nextScore = prevScore + gained;
        updateBestScore(nextScore);
        return nextScore;
      });
      return nextStreak;
    });

    if (streakResetRef.current) window.clearTimeout(streakResetRef.current);
    streakResetRef.current = window.setTimeout(() => setStreak(0), 2400);

    setHitFlash(true);
    if (hitFlashRef.current) window.clearTimeout(hitFlashRef.current);
    hitFlashRef.current = window.setTimeout(() => setHitFlash(false), 90);
  }, [updateBestScore, weapon]);

  useEffect(() => {
    return () => {
      if (streakResetRef.current) window.clearTimeout(streakResetRef.current);
      if (hitFlashRef.current) window.clearTimeout(hitFlashRef.current);
    };
  }, []);

  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene
        weapon={weapon}
        onTargetFallen={handleTargetFallen}
        onShot={handleShot}
        onHit={handleHit}
      />
      
      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {/* Crosshair */}
        <div className="relative flex h-6 w-6 items-center justify-center mix-blend-difference">
          <div className="absolute h-full w-[2px] bg-white" />
          <div className="absolute h-[2px] w-full bg-white" />
        </div>
      </div>

      {hitFlash && (
        <div className="pointer-events-none absolute inset-0 z-30 bg-white/5">
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-center text-white/95">
            ✦
          </div>
        </div>
      )}

      {openKey && (
        <InfoModal
          title={contentByTarget[openKey].title}
          onClose={() => setOpenKey(null)}
        >
          {contentByTarget[openKey].body}
        </InfoModal>
      )}
      
      {/* Instructions Overlay */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/80 mix-blend-difference">
        <p className="mb-2 text-sm uppercase tracking-widest font-bold">Contrôles</p>
        <div className="flex gap-6 text-xs font-mono">
          <span>ZQSD / WASD : Déplacement</span>
          <span>Souris : Caméra</span>
          <span>Clic : Verrouiller / Jouer</span>
          <span>Échap : Quitter</span>
        </div>
      </div>

      {/* Arcade HUD */}
      <div className="pointer-events-none fixed left-6 top-6 z-40 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white/90 shadow-xl backdrop-blur-md">
        <div className="mb-1 text-[11px] uppercase tracking-[0.25em] text-white/55">Arcade</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <span>Score</span>
          <span className="text-right font-semibold">{score}</span>
          <span>Précision</span>
          <span className="text-right font-semibold">{accuracy}%</span>
          <span>Streak</span>
          <span className="text-right font-semibold">x{streak}</span>
          <span>Arme</span>
          <span className="text-right font-semibold">{WEAPONS[weapon].label}</span>
        </div>
        <div className="mt-2 border-t border-white/10 pt-2 text-xs text-white/60">
          Meilleur score: <span className="font-semibold text-white/80">{bestScore}</span>
        </div>
      </div>

      {/* Weapons UI (bottom-right) */}
      <div className="pointer-events-auto fixed bottom-6 right-6 z-40">
        <div className="relative">
          {weaponsOpen && (
            <div className="absolute bottom-14 right-0 w-44 overflow-hidden rounded-xl border border-white/10 bg-neutral-950/85 shadow-2xl backdrop-blur">
              {(["pistol", "ak47", "sniper"] as WeaponKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setWeapon(k);
                    setWeaponsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm text-white/85 hover:bg-white/10 ${
                    weapon === k ? "bg-white/10" : ""
                  }`}
                >
                  <span>{WEAPONS[k].label}</span>
                  {weapon === k && <span className="text-xs text-white/60">Actif</span>}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setWeaponsOpen((v) => !v)}
            className="h-12 w-24 rounded-xl border border-white/15 bg-neutral-950/70 text-xs font-semibold tracking-widest text-white/90 shadow-lg backdrop-blur hover:bg-neutral-900/70 focus:outline-none focus:ring-2 focus:ring-white/25"
          >
            ARMES
          </button>
        </div>
      </div>
    </main>
  );
}
