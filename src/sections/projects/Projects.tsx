"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type ProjectCategory = "apps" | "posters";

interface AppProject {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  year: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

interface PosterProject {
  id: string;
  code: string;
  title: string;
  dimensions: string;
  year: string;
  accent: string;
}

const appProjects: AppProject[] = [
  {
    id: "app-1",
    title: "Portfolio 2.0 & Audio Visualizer",
    category: "Interactive Web / Creative Dev",
    description:
      "Interactive 3D portfolio featuring custom WebGL Prism shader, real-time audio reactivity, kinetic option wheel, and dynamic ambient lighting.",
    tags: ["Next.js", "React 19", "Three.js / WebGL", "Web Audio API", "Tailwind CSS"],
    year: "2026",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
  },
  {
    id: "app-2",
    title: "Vessel Commerce Architecture",
    category: "Full-Stack Web Application",
    description:
      "High-performance headless e-commerce experience with sub-second catalog transitions, optimistic UI updates, and real-time inventory synchronization.",
    tags: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
    year: "2025",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    id: "app-3",
    title: "Neural Canvas Studio",
    category: "Web Application / Creative Tool",
    description:
      "Browser-based generative studio allowing creative directors to synthesize generative noise fields, grain filters, and dynamic typographic layouts.",
    tags: ["React", "Canvas API", "GLSL Shaders", "Zustand", "Framer Motion"],
    year: "2025",
    liveUrl: "https://example.com",
  },
  {
    id: "app-4",
    title: "Aether OS / Dashboard",
    category: "SaaS Platform / Dashboard",
    description:
      "Minimalist telemetry monitoring workspace for distributed edge microservices with real-time stream processing and custom analytics charting.",
    tags: ["TypeScript", "WebSocket", "Tailwind CSS", "Chart.js"],
    year: "2024",
    githubUrl: "https://github.com",
  },
];

const posterProjects: PosterProject[] = [
  {
    id: "poster-1",
    code: "PX-01",
    title: "Kinetic Typography & Brutalism",
    dimensions: "A1 (594 × 841 mm)",
    year: "2026",
    accent: "#0000bd",
  },
  {
    id: "poster-2",
    code: "PX-02",
    title: "Echoes of Sonic Landscape",
    dimensions: "B2 (500 × 707 mm)",
    year: "2025",
    accent: "#3b82f6",
  },
  {
    id: "poster-3",
    code: "PX-03",
    title: "Industrial Modernism / 04",
    dimensions: "A2 (420 × 594 mm)",
    year: "2025",
    accent: "#ef4444",
  },
  {
    id: "poster-4",
    code: "PX-04",
    title: "Cosmic Frequency & Prism",
    dimensions: "A1 (594 × 841 mm)",
    year: "2024",
    accent: "#8b5cf6",
  },
  {
    id: "poster-5",
    code: "PX-05",
    title: "Synthetic Nostalgia",
    dimensions: "A2 (420 × 594 mm)",
    year: "2024",
    accent: "#06b6d4",
  },
  {
    id: "poster-6",
    code: "PX-06",
    title: "The Sound of Silence",
    dimensions: "B1 (707 × 1000 mm)",
    year: "2024",
    accent: "#a1a1aa",
  },
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("apps");
  const [hoveredPosterCell, setHoveredPosterCell] = useState<number | null>(null);

  const hoveredCol = hoveredPosterCell !== null ? hoveredPosterCell % 7 : null;
  const hoveredRow = hoveredPosterCell !== null ? Math.floor(hoveredPosterCell / 7) : null;

  // 7 columns total: explicit 1fr list for smooth CSS interpolation (prevents repeat() syntax interpolation jump)
  const defaultCols = "1fr 1fr 1fr 1fr 1fr 1fr 1fr";
  const defaultRows = "1fr 1fr 1fr 1fr 1fr";

  // Hovered column expands gently to 1.55fr, surrounding 6 columns narrow slightly to 0.91fr
  const gridColsStyle = hoveredCol !== null
    ? Array.from({ length: 7 }, (_, c) => (c === hoveredCol ? "1.55fr" : "0.91fr")).join(" ")
    : defaultCols;

  // Hovered row expands gently to 1.55fr, surrounding 4 rows narrow slightly to 0.86fr
  const gridRowsStyle = hoveredRow !== null
    ? Array.from({ length: 5 }, (_, r) => (r === hoveredRow ? "1.55fr" : "0.86fr")).join(" ")
    : defaultRows;

  return (
    <section
      id="projects"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 md:px-10 lg:px-12 pointer-events-auto border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="font-narrow text-xs tracking-widest uppercase text-neutral-500 block mb-2">
              04 / Portfolio Showcase
            </span>
            <h2 className="font-narrow text-4xl sm:text-5xl md:text-6xl font-normal italic tracking-tight lowercase text-neutral-100">
              Selected Works
            </h2>
          </div>

          {/* Sub-section Navigation Tabs */}
          <div className="inline-flex p-1 rounded-full border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/90 backdrop-blur-md self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("apps")}
              className={`relative px-5 sm:px-6 py-2 rounded-full font-narrow text-sm transition-all duration-300 cursor-pointer lowercase ${
                activeTab === "apps"
                  ? "text-neutral-900 dark:text-neutral-900 light:text-white font-medium"
                  : "text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-black"
              }`}
            >
              {activeTab === "apps" && (
                <motion.div
                  layoutId="activeProjectTab"
                  className="absolute inset-0 bg-white dark:bg-white light:bg-neutral-900 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>Web / App</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === "apps"
                      ? "bg-black/10 dark:bg-black/10 light:bg-white/20"
                      : "bg-white/10 dark:bg-white/10 light:bg-black/5"
                  }`}
                >
                  {appProjects.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("posters")}
              className={`relative px-5 sm:px-6 py-2 rounded-full font-narrow text-sm transition-all duration-300 cursor-pointer lowercase ${
                activeTab === "posters"
                  ? "text-neutral-900 dark:text-neutral-900 light:text-white font-medium"
                  : "text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-black"
              }`}
            >
              {activeTab === "posters" && (
                <motion.div
                  layoutId="activeProjectTab"
                  className="absolute inset-0 bg-white dark:bg-white light:bg-neutral-900 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>Graphic / Poster</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === "posters"
                      ? "bg-black/10 dark:bg-black/10 light:bg-white/20"
                      : "bg-white/10 dark:bg-white/10 light:bg-black/5"
                  }`}
                >
                  {posterProjects.length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "apps" ? (
            <motion.div
              key="apps-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Sub-section description badge */}
              <div className="flex items-center justify-between border-b border-neutral-800/40 dark:border-neutral-800/40 light:border-neutral-200 pb-4">
                <p className="font-narrow text-xs text-neutral-400 lowercase tracking-wide">
                  Interactive web applications, digital products, & creative engineering
                </p>
                <span className="font-narrow text-xs text-neutral-500 uppercase tracking-widest hidden sm:inline-block">
                  Sub-Section: Applications & Web
                </span>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {appProjects.map((project, idx) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-950/40 dark:bg-neutral-950/40 light:bg-neutral-50/80 hover:border-neutral-700 dark:hover:border-neutral-700 light:hover:border-neutral-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div>
                      {/* Top metadata */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="font-narrow text-xs tracking-wider uppercase text-neutral-500">
                          {project.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {project.featured && (
                            <span className="font-narrow text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 dark:text-blue-400 light:text-blue-600 border border-blue-500/20">
                              featured
                            </span>
                          )}
                          <span className="font-narrow text-xs text-neutral-500">{project.year}</span>
                        </div>
                      </div>

                      {/* Mockup / Preview Canvas Placeholder */}
                      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-6 relative border border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-neutral-100 flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-500">
                        {/* Abstract Mockup UI Wireframe */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between w-full border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-200 pb-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                            </div>
                            <span className="font-mono text-[10px] text-neutral-500">
                              preview // {project.id}.tsx
                            </span>
                          </div>
                          <div className="space-y-2.5 py-4">
                            <div className="w-2/5 h-2 rounded bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-200" />
                            <div className="w-4/5 h-2 rounded bg-neutral-800/60 dark:bg-neutral-800/60 light:bg-neutral-200/70" />
                            <div className="w-3/5 h-2 rounded bg-neutral-800/40 dark:bg-neutral-800/40 light:bg-neutral-200/50" />
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="w-16 h-4 rounded bg-neutral-800/50 dark:bg-neutral-800/50 light:bg-neutral-200" />
                            <div className="w-6 h-6 rounded-full border border-neutral-700/60 dark:border-neutral-700/60 light:border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400">
                              →
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Title & Description */}
                      <h3 className="font-narrow text-2xl font-normal tracking-tight lowercase text-neutral-100 mb-2.5 group-hover:text-blue-400 dark:group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="font-sans text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed mb-6">
                        {project.description}
                      </p>
                    </div>

                    {/* Footer: Tags & Action Links */}
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-narrow text-xs px-2.5 py-1 rounded-md bg-neutral-900/80 dark:bg-neutral-900/80 light:bg-neutral-200/80 text-neutral-400 dark:text-neutral-400 light:text-neutral-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-200">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-narrow text-xs text-neutral-300 hover:text-white dark:hover:text-white light:text-neutral-800 light:hover:text-black flex items-center gap-1.5 group/link"
                          >
                            <span>Live Demo</span>
                            <span className="inline-block transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                              ↗
                            </span>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-narrow text-xs text-neutral-400 hover:text-neutral-200 dark:hover:text-neutral-200 light:text-neutral-600 light:hover:text-neutral-900 flex items-center gap-1.5"
                          >
                            <span>Source Code</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="posters-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full pt-4"
            >
              {/* Pure Table-Line Pixel Grid (7 columns x 5 rows = 35 cells, No Gaps, Outer Border + Cell Borders, Zero Text Inside) */}
              <div
                onMouseLeave={() => setHoveredPosterCell(null)}
                style={{
                  gridTemplateColumns: gridColsStyle,
                  gridTemplateRows: gridRowsStyle,
                  transition:
                    "grid-template-columns 420ms cubic-bezier(0.2, 0.8, 0.2, 1), grid-template-rows 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  willChange: "grid-template-columns, grid-template-rows",
                }}
                className="w-full aspect-[7/5] min-h-[460px] sm:min-h-[580px] md:min-h-[660px] grid border-t border-l border-neutral-800 dark:border-neutral-800 light:border-neutral-300 select-none"
              >
                {Array.from({ length: 35 }).map((_, idx) => {
                  const isHovered = hoveredPosterCell === idx;
                  return (
                    <div
                      key={`pixel-cell-${idx}`}
                      onMouseEnter={() => setHoveredPosterCell(idx)}
                      className={`relative w-full h-full border-r border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-300 group overflow-hidden transition-colors duration-200 cursor-pointer ${
                        isHovered
                          ? "bg-neutral-800/90 dark:bg-neutral-800/90 light:bg-neutral-200 z-10"
                          : "bg-transparent hover:bg-neutral-900/40 dark:hover:bg-neutral-900/40 light:hover:bg-neutral-100"
                      }`}
                    >
                      {/* Subtle aesthetic accent wash on hover */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none bg-neutral-100 dark:bg-neutral-100 light:bg-neutral-900 ${
                          isHovered ? "opacity-15" : "opacity-0"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
