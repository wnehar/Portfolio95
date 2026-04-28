"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scene } from "@/components/Scene";
import { InfoModal } from "@/components/InfoModal";
import type { TargetKey } from "@/components/Target";
import { WEAPONS, type WeaponKey } from "@/components/weapons";
import { useAmbientAudio } from "@/components/useAmbientAudio";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
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
  const [completedTargets, setCompletedTargets] = useState<TargetKey[]>([]);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const streakResetRef = useRef<number | null>(null);
  const hitFlashRef = useRef<number | null>(null);
  const { start: startAmbient, stop: stopAmbient } = useAmbientAudio();

  const contentByTarget = useMemo(() => {
    return {
      about: {
        title: "À propos",
        body: (
          <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
              <div className="border-b border-white/10 bg-white/6 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/55">
                Profil
              </div>
              <Image
                src="/william-nehar.png"
                alt="Portrait de William Nehar"
                width={900}
                height={900}
                className="h-[360px] w-full object-cover object-center"
                priority
              />
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-red-300/75">Identification</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">William Nehar</h3>
                <p className="mt-1 text-white/60">Profil personnel</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Nom</p>
                  <p className="mt-1 text-base font-medium text-white">NEHAR</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Prenom</p>
                  <p className="mt-1 text-base font-medium text-white">William</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Age</p>
                    <p className="mt-1 text-base font-medium text-white">19 ans</p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Date de naissance</p>
                    <p className="mt-1 text-base font-medium text-white">28/04/2007</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Domicile</p>
                  <p className="mt-1 text-base font-medium leading-relaxed text-white">
                    1 rue chateaubriand
                    <br />
                    95330 DOMONT
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      skills: {
        title: "Projets & compétences",
        body: (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-300/75">Portfolio</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Mes projets</h3>
              <p className="mt-2 max-w-2xl text-white/65">
                Une selection de projets realises autour du web, de la conception produit,
                de la presentation d’idees et de l’utilisation d’outils IA pour produire
                des experiences plus modernes et plus impactantes.
              </p>
            </div>

            <div className="grid gap-4">
              <a
                href="https://www.linkedin.com/posts/william-nehar-73a528382_eugeniaschool-lvmh-ia-activity-7430170793302470656-SGko?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAF5n-B4B8iEgE_yF9gnnSncWzax3ec_wkuo"
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-black/20 transition hover:border-red-400/35 hover:bg-white/[0.05]"
              >
                <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="relative h-52 overflow-hidden md:h-full">
                    <Image
                      src="/projects/lvmh-project.png"
                      alt="Projet LVMH"
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-red-200/85">
                        LinkedIn
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/55">
                        Strategie / IA / Presentation
                      </span>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-white">Projet LVMH</h4>
                    <p className="mt-3 text-white/72">
                      Realisation d’un BDD pour LVMH autour d’une problematique concrete,
                      avec une reponse pensee pour un vrai besoin metier. Ce projet m’a
                      permis de travailler la reflexion strategique, la presentation orale
                      et l’utilisation de l’IA comme levier d’innovation.
                    </p>
                    <p className="mt-4 text-sm text-white/55">
                      Cliquer pour voir la publication LinkedIn.
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://wiloc-e7d716.webflow.io"
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-black/20 transition hover:border-red-400/35 hover:bg-white/[0.05]"
              >
                <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="relative h-52 overflow-hidden md:h-full">
                    <Image
                      src="/projects/wiloc-project.png"
                      alt="Projet de location de voiture Wiloc"
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-red-200/85">
                        Site web
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/55">
                        UX / Web design / Parcours client
                      </span>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-white">Site de location de voiture</h4>
                    <p className="mt-3 text-white/72">
                      Conception d’un site moderne de location automobile avec une approche
                      claire, premium et rassurante. L’objectif etait de rendre la reservation
                      simple, visuelle et fluide, avec une presentation soignee du service,
                      du parcours client et des vehicules disponibles.
                    </p>
                    <p className="mt-4 text-sm text-white/55">
                      Cliquer pour visiter le site.
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/posts/william-nehar-73a528382_projet-bdd-cursor-project-eugenia-school-activity-7414983793587044354-spER?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAF5n-B4B8iEgE_yF9gnnSncWzax3ec_wkuo"
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-black/20 transition hover:border-red-400/35 hover:bg-white/[0.05]"
              >
                <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="relative h-52 overflow-hidden md:h-full">
                    <Image
                      src="/projects/cursor-project.png"
                      alt="Projet BDD Cursor Project Eugenia School"
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-red-200/85">
                        LinkedIn
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/55">
                        Base de donnees / Plateforme / IA
                      </span>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-white">
                      Cursor Project - Eugenia School
                    </h4>
                    <p className="mt-3 text-white/72">
                      Creation d’un site inspire des codes d’un reseau social pour Eugenia
                      School, avec gestion des roles utilisateurs, publication de contenu,
                      interactions sociales et espace de messagerie. Ce projet m’a permis de
                      renforcer mes bases en developpement web, structure de donnees et logique
                      produit.
                    </p>
                    <p className="mt-4 text-sm text-white/55">
                      Cliquer pour voir la publication LinkedIn.
                    </p>
                  </div>
                </div>
              </a>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-red-300/75">Competences</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "IA Prompting",
                    "React",
                    "Next.js",
                    "TypeScript",
                    "JavaScript",
                    "Three.js",
                    "React Three Fiber",
                    "HTML / CSS",
                    "Tailwind CSS",
                    "UI Design",
                    "UX Thinking",
                    "Web Design",
                    "Conception de projet",
                    "Presentation orale",
                    "Storytelling produit",
                    "Travail en equipe",
                    "Organisation",
                    "Veille technologique",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/78"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-white/62">
                  J’aime concevoir des projets modernes, visuels et utiles, en melangeant
                  logique technique, sens du design et bonne utilisation des outils IA.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-red-300/75">Langues</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Francais</p>
                      <p className="mt-1 text-base font-medium text-white">Courant</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Anglais</p>
                      <p className="mt-1 text-base font-medium text-white">Intermediaire professionnel</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-red-300/75">Profil</p>
                  <p className="mt-3 text-white/68">
                    Profil creatif et ambitieux, a l’aise pour imaginer un concept, le
                    transformer en site concret et le presenter avec impact. Je m’interesse
                    particulierement aux experiences digitales modernes, au design et a l’IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
    setCompletedTargets((prev) => (prev.includes(targetKey) ? prev : [...prev, targetKey]));
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
    const weaponBonus = weapon === "ak47" ? 70 : 95;
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

  useEffect(() => {
    startAmbient(hasStarted ? "game" : "lobby");
    return () => stopAmbient();
  }, [hasStarted, startAmbient, stopAmbient]);

  useEffect(() => {
    if (completedTargets.length === 3) {
      setShowSessionSummary(true);
    }
  }, [completedTargets]);

  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  useEffect(() => {
    if (!openKey && !showSessionSummary) return;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [openKey, showSessionSummary]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {hasStarted ? (
        <>
          <Scene
            weapon={weapon}
            onTargetFallen={handleTargetFallen}
            onShot={handleShot}
            onHit={handleHit}
            shotCount={shots}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative flex h-10 w-10 items-center justify-center transition opacity-100">
              <div className="absolute h-10 w-10 rounded-full border border-white/8 bg-white/[0.02] backdrop-blur-[1px]" />
              <div className="absolute h-5 w-5 rounded-full border border-red-400/25" />
              <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-white/90 to-transparent" />
              <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              <div className="absolute h-1.5 w-1.5 rounded-full bg-red-400/90 shadow-[0_0_14px_rgba(248,113,113,0.9)]" />
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

          {showSessionSummary && (
            <InfoModal
              title="Session terminée"
              onClose={() => setShowSessionSummary(false)}
            >
              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/75">Performance</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Score</p>
                      <p className="mt-1 text-xl font-semibold text-white">{score}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Précision</p>
                      <p className="mt-1 text-xl font-semibold text-white">{accuracy}%</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Coups tirés</p>
                      <p className="mt-1 text-xl font-semibold text-white">{shots}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Best streak</p>
                      <p className="mt-1 text-xl font-semibold text-white">x{streak}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSessionSummary(false)}
                    className="rounded-full border border-red-400/30 bg-red-500/15 px-5 py-3 text-sm font-semibold tracking-[0.18em] text-white hover:bg-red-500/25"
                  >
                    Continuer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSessionSummary(false);
                      setCompletedTargets([]);
                      setOpenKey(null);
                      setShots(0);
                      setHits(0);
                      setScore(0);
                      setStreak(0);
                    }}
                    className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold tracking-[0.18em] text-white/85 hover:bg-white/10"
                  >
                    Nouvelle session
                  </button>
                </div>
              </div>
            </InfoModal>
          )}

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-center text-white/80 shadow-xl backdrop-blur-md">
            <p className="mb-2 text-[11px] uppercase tracking-[0.32em] text-white/50">Contrôles</p>
            <div className="flex gap-6 text-xs font-mono">
              <span>ZQSD / WASD : Déplacement</span>
              <span>Souris : Caméra</span>
              <span>Clic : Verrouiller / Jouer</span>
              <span>Échap : Quitter</span>
            </div>
          </div>

          <div className="pointer-events-none fixed left-6 top-6 z-40 overflow-hidden rounded-[24px] border border-white/10 bg-black/45 px-4 py-3 text-white/90 shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
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
            <div className="mt-2 border-t border-white/10 pt-2 text-xs text-white/60">
              Cibles: <span className="font-semibold text-white/80">{completedTargets.length}/3</span>
            </div>
          </div>

          <div className="pointer-events-auto fixed bottom-6 right-6 z-40">
            <div className="relative">
              {weaponsOpen && (
                <div className="absolute bottom-14 right-0 w-48 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/90 shadow-2xl backdrop-blur-xl">
                  {(["pistol", "ak47"] as WeaponKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setWeapon(k);
                        setWeaponsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm text-white/85 transition hover:bg-white/10 ${
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
                className="h-12 w-28 rounded-2xl border border-white/15 bg-neutral-950/75 text-xs font-semibold tracking-[0.25em] text-white/90 shadow-lg backdrop-blur-xl hover:bg-neutral-900/75 focus:outline-none focus:ring-2 focus:ring-white/25"
              >
                ARMES
              </button>
            </div>
          </div>

        </>
      ) : (
        <section className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,82,119,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(107,187,255,0.14),transparent_26%),linear-gradient(180deg,#06080b_0%,#0c1016_45%,#040507_100%)] px-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:110px_110px] opacity-40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6 bg-white/[0.02] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-[16%] mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />

          <div className="relative z-10 w-full max-w-6xl">
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[36px] border border-white/10 bg-black/35 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-12">
                <p className="text-[11px] uppercase tracking-[0.5em] text-red-300/75">William Nehar</p>
                <h1 className="mt-5 text-5xl font-semibold leading-[0.95] md:text-7xl">
                  Shooting
                  <br />
                  Portfolio
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
                  Entrez dans une experience interactive inspiree d’un vrai menu de jeu.
                  Explorez le stand, touchez les cibles et decouvrez le portfolio dans une ambiance plus immersive.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setHasStarted(true)}
                    className="rounded-full border border-red-400/30 bg-[linear-gradient(180deg,rgba(255,95,126,0.38),rgba(174,26,57,0.42))] px-9 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_0_45px_rgba(239,68,68,0.24)] transition hover:scale-[1.02] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-300/40"
                  >
                    Jouer
                  </button>
                  <div className="rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm uppercase tracking-[0.22em] text-white/60">
                    Best score: {bestScore}
                  </div>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Mode</p>
                    <p className="mt-2 text-sm font-medium text-white/88">Stand de tir</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Objectif</p>
                    <p className="mt-2 text-sm font-medium text-white/88">Trouver 3 cibles</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Style</p>
                    <p className="mt-2 text-sm font-medium text-white/88">Arcade premium</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Briefing</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40">Experience</p>
                      <p className="mt-1 text-sm text-white/82">Portfolio interactif en vue FPS.</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40">Mission</p>
                      <p className="mt-1 text-sm text-white/82">Touchez chaque cible pour debloquer les fiches.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Controles</p>
                  <div className="mt-4 space-y-3 text-sm text-white/82">
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span>Deplacement</span>
                      <span className="font-mono text-white/60">ZQSD / WASD</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span>Camera</span>
                      <span className="font-mono text-white/60">Souris</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span>Tir / entrer</span>
                      <span className="font-mono text-white/60">Clic gauche</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span>Quitter</span>
                      <span className="font-mono text-white/60">Echap</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
