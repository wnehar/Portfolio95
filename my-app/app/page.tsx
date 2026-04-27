import { Scene } from "@/components/Scene";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene />
      
      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {/* Crosshair */}
        <div className="relative flex h-6 w-6 items-center justify-center mix-blend-difference">
          <div className="absolute h-full w-[2px] bg-white" />
          <div className="absolute h-[2px] w-full bg-white" />
        </div>
      </div>
      
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
