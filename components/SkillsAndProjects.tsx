"use client";

import Image from "next/image";
import { useState } from "react";

type Project = {
  id: string;
  title: string;
  tags: string[];
  shortDesc: string;
  image: string;
  link: string;
  linkText: string;
  challenge: string;
  solution: string;
  result: string;
  tech: string[];
};

function TechIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  
  if (n.includes("react")) {
    return (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="h-3.5 w-3.5 shrink-0 text-[#61DAFB]">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    );
  }
  if (n.includes("figma")) {
    return (
      <svg viewBox="0 0 38 57" className="h-3 w-3 shrink-0">
        <path fill="#F24E1E" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
        <path fill="#FF7262" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v19H9.5A9.5 9.5 0 0 1 0 47.5z"/>
        <path fill="#1ABCFE" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
        <path fill="#0ACF83" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
        <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
      </svg>
    );
  }
  if (n.includes("webflow")) {
    return (
      <svg viewBox="0 0 500 500" className="h-3 w-3 shrink-0 fill-current text-[#146EF5]">
        <path d="M386.4,121.2c-29.3,0-52.6,22-54.8,49.8c-2.3-27.8-25.5-49.8-54.8-49.8c-23,0-42.5,13.2-50.8,32.4 c-8.3-19.1-27.8-32.4-50.8-32.4c-30.7,0-55.6,25.3-55.6,56.5v191h45.2v-176c0-11,8.6-20.1,19.3-20.1c10.7,0,19.3,9,19.3,20.1v176h45.2 v-176c0-11,8.6-20.1,19.3-20.1c10.7,0,19.3,9,19.3,20.1v176h45.2v-176c0-11,8.6-20.1,19.3-20.1c10.7,0,19.3,9,19.3,20.1v176h45.2 v-206.5C442,146.5,417.1,121.2,386.4,121.2z"/>
      </svg>
    );
  }
  if (n.includes("base") || n.includes("data") || n.includes("architecture")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-blue-400">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>
    );
  }
  if (n.includes("ia") || n.includes("intelligence")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-yellow-400">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
      </svg>
    );
  }
  if (n.includes("stratégie") || n.includes("produit") || n.includes("logique")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-red-400">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    );
  }
  if (n.includes("ux") || n.includes("ui") || n.includes("parcours") || n.includes("design")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-pink-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    );
  }
  if (n.includes("autonomie") || n.includes("seul")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-emerald-400">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    );
  }
  if (n.includes("storytelling") || n.includes("pitch") || n.includes("présentation") || n.includes("keynote")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-purple-400">
        <path d="M2 3h20"></path>
        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
        <path d="m7 21 5-5 5 5"></path>
      </svg>
    );
  }
  
  // Fallback icon (small diamond)
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2 shrink-0 text-white/50">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  );
}

const PROJECTS: Project[] = [
  {
    id: "lvmh",
    title: "Projet Stratégique LVMH",
    tags: ["Stratégie", "IA", "Présentation"],
    shortDesc:
      "Réalisation d'un Business Development Document (BDD) pour LVMH intégrant l'Intelligence Artificielle au cœur de la stratégie.",
    image: "/projects/lvmh-project.png",
    link: "https://www.linkedin.com/posts/william-nehar-73a528382_eugeniaschool-lvmh-ia-activity-7430170793302470656-SGko",
    linkText: "Voir la publication LinkedIn",
    challenge:
      "LVMH a pour exigence constante l'excellence et l'innovation. Le défi était d'imaginer et de présenter une solution technologique viable qui respecte l'ADN ultra-premium du groupe tout en répondant à un véritable besoin métier complexe.",
    solution:
      "J'ai mené une réflexion stratégique approfondie pour proposer une intégration sur-mesure de l'Intelligence Artificielle. Le travail incluait l'analyse du besoin, la structuration d'un Business Development Document complet, et la préparation d'un pitch impactant pour défendre mes idées.",
    result:
      "Une présentation saluée pour sa clarté et sa faisabilité. Ce projet m'a permis d'affûter ma capacité à lier des concepts techniques (IA) à des enjeux business concrets de très haut niveau.",
    tech: ["Stratégie Produit", "IA Prompting", "Storytelling", "Keynote / Pitch"],
  },
  {
    id: "wiloc",
    title: "Site de location automobile - Wiloc",
    tags: ["UX", "Web design", "Parcours client"],
    shortDesc:
      "Conception et développement intégral d'un site de location automobile premium, réalisé de A à Z en solo.",
    image: "/projects/wiloc-project.png",
    link: "https://wiloc-e7d716.webflow.io",
    linkText: "Visiter le site web",
    challenge:
      "Le secteur de la location automobile souffre souvent de sites surchargés et confus. L'objectif était de créer une expérience utilisateur (UX) fluide, rassurante et esthétiquement irréprochable pour la réservation de véhicules de prestige.",
    solution:
      "J'ai réalisé l'intégralité de ce projet absolument seul et sans aucune aide de l'Intelligence Artificielle. J'ai pensé l'arborescence, maquetté chaque écran pour maximiser la conversion, et développé le site complet sur Webflow avec des animations sur-mesure pour sublimer les véhicules.",
    result:
      "Un produit fini professionnel, rapide et visuellement percutant. Ce projet démontre ma pleine autonomie sur la création de plateformes web complexes, de la page blanche jusqu'à la mise en ligne.",
    tech: ["Webflow", "UI/UX Design", "Figma", "Parcours Client", "Autonomie Totale"],
  },
  {
    id: "cursor",
    title: "Cursor Project - Eugenia School",
    tags: ["Base de données", "Plateforme", "IA"],
    shortDesc:
      "Création d'une plateforme communautaire inspirée d'un réseau social pour les étudiants d'Eugenia School.",
    image: "/projects/cursor-project.png",
    link: "https://www.linkedin.com/posts/william-nehar-73a528382_projet-bdd-cursor-project-eugenia-school-activity-7414983793587044354-spER",
    linkText: "Voir le projet sur LinkedIn",
    challenge:
      "L'école avait besoin d'un espace interactif interne pour favoriser les échanges entre étudiants, avec une véritable architecture logicielle : gestion des rôles, publications dynamiques, et un système de messagerie fluide.",
    solution:
      "J'ai structuré une base de données robuste capable d'encaisser les interactions sociales en temps réel. J'ai ensuite développé les fonctionnalités front-end et back-end, tout en y intégrant l'IA pour automatiser la modération et l'assistance utilisateur.",
    result:
      "Une plateforme fonctionnelle qui prouve ma capacité à manipuler de la data complexe, à gérer des états utilisateurs multiples, et à créer une expérience sociale engageante.",
    tech: ["Bases de données", "Logique Produit", "Architecture", "Intégration IA"],
  },
];

const SKILL_CATEGORIES = [
  {
    title: "Développement & Code",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-400/20",
    skills: [
      { name: "React / Next.js", level: 90 },
      { name: "TypeScript / JavaScript", level: 85 },
      { name: "Three.js / React Three Fiber", level: 75 },
      { name: "Tailwind CSS", level: 95 },
    ],
  },
  {
    title: "Design & Produit",
    color: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-400/20",
    skills: [
      { name: "UI Design & Web Design", level: 90 },
      { name: "UX Thinking", level: 85 },
      { name: "Storytelling Produit", level: 80 },
      { name: "Conception de projet", level: 85 },
    ],
  },
  {
    title: "Outils & Soft Skills",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-400/20",
    skills: [
      { name: "IA Prompting & Intégration", level: 95 },
      { name: "Présentation orale", level: 90 },
      { name: "Travail en équipe", level: 85 },
      { name: "Veille technologique", level: 90 },
    ],
  },
];

export function SkillsAndProjects() {
  const [activeTab, setActiveTab] = useState<"projects" | "skills">("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (selectedProject) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => setSelectedProject(null)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          <span className="text-lg">←</span> Retour aux projets
        </button>

        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/40 shadow-2xl">
          <div className="relative h-64 w-full">
            <Image
              src={selectedProject.image}
              alt={selectedProject.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-3xl font-bold text-white">{selectedProject.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedProject.tech.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/90 backdrop-blur-md shadow-lg"
                  >
                    <TechIcon name={t} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h4 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-300/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> Le Défi
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{selectedProject.challenge}</p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-300/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> L'Approche
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{selectedProject.solution}</p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-300/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> Le Résultat
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{selectedProject.result}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
              <a
                href={selectedProject.link}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-red-500 hover:text-white"
              >
                {selectedProject.linkText}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-center">
        <div className="flex rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("projects")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
              activeTab === "projects"
                ? "bg-white/15 text-white shadow-lg"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Cas d'étude
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
              activeTab === "skills"
                ? "bg-white/15 text-white shadow-lg"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Compétences
          </button>
        </div>
      </div>

      {activeTab === "projects" && (
        <div className="grid gap-5 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02] transition duration-300 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition duration-300 group-hover:opacity-40" />
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md border border-white/5 shadow-sm"
                    >
                      <TechIcon name={tag} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-xl font-bold text-white transition group-hover:text-red-400">
                  {project.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-sm text-white/60">
                  {project.shortDesc}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold uppercase tracking-widest text-red-300/80 transition group-hover:text-red-400">
                  Découvrir le projet <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-6">
          <p className="text-center text-sm text-white/60">
            Une expertise équilibrée entre développement technique, réflexion design et utilisation d'outils IA.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            {SKILL_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className={`rounded-[24px] border ${cat.border} bg-gradient-to-b ${cat.color} p-5 backdrop-blur-xl transition hover:border-white/20`}
              >
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/90">
                  {cat.title}
                </h3>
                <div className="space-y-4">
                  {cat.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-white/80">{skill.name}</span>
                        <span className="text-white/40">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div
                          className="h-full rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 text-center">
            <h4 className="text-xl font-semibold text-white">L'Intelligence Artificielle au cœur du processus</h4>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              L'IA n'est pas qu'un outil pour moi, c'est un véritable partenaire de conception. Que ce soit pour générer du code complexes, brainstormer sur des architectures logicielles ou créer des concepts visuels innovants, j'intègre l'IA (ChatGPT, Claude, Cursor) au quotidien pour multiplier ma productivité et livrer des expériences de très haute qualité.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
