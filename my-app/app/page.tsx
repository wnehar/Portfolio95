"use client";

import { useCallback, useMemo, useState } from "react";
import { Scene } from "@/components/Scene";
import { InfoModal } from "@/components/InfoModal";
import type { TargetKey } from "@/components/Target";

export default function Home() {
  const [openKey, setOpenKey] = useState<TargetKey | null>(null);

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

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene onTargetFallen={handleTargetFallen} />
      
      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {/* Crosshair */}
        <div className="relative flex h-6 w-6 items-center justify-center mix-blend-difference">
          <div className="absolute h-full w-[2px] bg-white" />
          <div className="absolute h-[2px] w-full bg-white" />
        </div>
      </div>

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
    </main>
  );
}
