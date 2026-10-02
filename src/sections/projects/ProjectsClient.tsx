"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "motion/react";
import { posterImages, type PosterItem } from "@/data/posters";
import type { GitHubProject } from "@/lib/github";

type ProjectCategory = "apps" | "posters";

interface ProjectsClientProps {
  initialProjects: GitHubProject[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("apps");
  const [hoveredPosterCell, setHoveredPosterCell] = useState<number | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(null);
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const appsSectionRef = useRef<HTMLDivElement>(null);
  // once: false agar animasi bisa terpicu berulang kali ketika di-scroll ulang
  const isAppsInView = useInView(appsSectionRef, { once: false, amount: 0.15 });

  // State transisi grid: awalnya padat/banyak (false), lalu expand ke 4 (true)
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  // Konten card: awalnya kosong saat transisi, lalu muncul setelah expand selesai
  const [showCardContent, setShowCardContent] = useState(false);

  useEffect(() => {
    if (isAppsInView) {
      // 1. Tampilkan sebentar wujud kisi-kisi grid banyak yang kosong (300ms)
      const expandTimer = setTimeout(() => {
        setIsGridExpanded(true);
      }, 350);

      // 2. Setelah animasi ekspansi dari banyak ke 4 kolom selesai (durasi ~800ms), munculkan isi gambar & teks
      const contentTimer = setTimeout(() => {
        setShowCardContent(true);
      }, 1150);

      return () => {
        clearTimeout(expandTimer);
        clearTimeout(contentTimer);
      };
    } else {
      // Reset kembali ke state banyak kotak kosong saat pengguna scroll keluar dari section
      setIsGridExpanded(false);
      setShowCardContent(false);
    }
  }, [isAppsInView]);

  const handleSelectTab = (tab: ProjectCategory) => {
    if (tab === "apps" && activeTab !== "apps") {
      setIsGridExpanded(false);
      setShowCardContent(false);
      setTimeout(() => setIsGridExpanded(true), 300);
      setTimeout(() => setShowCardContent(true), 1100);
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
        setSelectedPoster(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show up to 35 posters (7 cols x 5 rows) on the grid
  const gridPosters = posterImages.slice(0, 35);

  const hoveredCol = hoveredPosterCell !== null ? hoveredPosterCell % 7 : null;
  const hoveredRow = hoveredPosterCell !== null ? Math.floor(hoveredPosterCell / 7) : null;
  const hoveredPoster = hoveredPosterCell !== null ? gridPosters[hoveredPosterCell] : null;

  // 7 columns total: explicit 1fr list for smooth CSS interpolation (prevents repeat() syntax interpolation jump)
  const defaultCols = "1fr 1fr 1fr 1fr 1fr 1fr 1fr";
  const defaultRows = "1fr 1fr 1fr 1fr 1fr";

  // Native aspect ratio of the hovered poster (width / height)
  const posterAr = hoveredPoster ? hoveredPoster.width / hoveredPoster.height : 1;

  // Hovered cell expands proportional to the poster's exact resolution ratio (tidak 1:1)
  const baseScale = 1.6;
  const colFr = baseScale * Math.sqrt(posterAr);
  const rowFr = baseScale / Math.sqrt(posterAr);

  // Remaining tracks share the rest of the available 7 cols and 5 rows evenly
  const otherColFr = (7 - colFr) / 6;
  const otherRowFr = (5 - rowFr) / 4;

  const gridColsStyle =
    hoveredCol !== null
      ? Array.from({ length: 7 }, (_, c) =>
          c === hoveredCol ? `${colFr.toFixed(3)}fr` : `${otherColFr.toFixed(3)}fr`
        ).join(" ")
      : defaultCols;

  const gridRowsStyle =
    hoveredRow !== null
      ? Array.from({ length: 5 }, (_, r) =>
          r === hoveredRow ? `${rowFr.toFixed(3)}fr` : `${otherRowFr.toFixed(3)}fr`
        ).join(" ")
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
              onClick={() => handleSelectTab("apps")}
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
                  {initialProjects.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("posters")}
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
                  {posterImages.length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "apps" ? (
            <motion.div
              ref={appsSectionRef}
              key="apps-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6 relative"
            >
              {/* Apps Flat Grid: pure CSS grid-cols transition via CSS vars (lebih ringan dari FLIP layout) */}
              <div
                style={
                  {
                    "--cols-base": isGridExpanded ? "1" : "8",
                    "--cols-sm": isGridExpanded ? "2" : "6",
                    "--cols-lg": isGridExpanded ? "4" : "8",
                  } as React.CSSProperties
                }
                className="w-full grid [grid-template-columns:repeat(var(--cols-base),1fr)] sm:[grid-template-columns:repeat(var(--cols-sm),1fr)] lg:[grid-template-columns:repeat(var(--cols-lg),1fr)] [transition:grid-template-columns_750ms_cubic-bezier(0.16,1,0.3,1)] [will-change:grid-template-columns]"
              >
                {initialProjects.map((project, idx) => (
                  <article
                    key={project.id}
                    onClick={() => isGridExpanded && setSelectedProject(project)}
                    className={`group relative flex flex-col justify-between transition-colors duration-300 cursor-pointer border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 ${
                      isGridExpanded
                        ? "p-5 sm:p-6 min-h-[380px] bg-transparent hover:bg-neutral-900/40 dark:hover:bg-neutral-900/40 light:hover:bg-neutral-100/60"
                        : "p-0 min-h-[100px] sm:min-h-[120px] bg-neutral-900/10 hover:bg-neutral-900/20 border-r border-b pointer-events-none"
                    } ${
                      isGridExpanded
                        ? idx === initialProjects.length - 1
                          ? "border-b-0"
                          : "border-b"
                        : ""
                    } ${
                      isGridExpanded
                        ? idx >= Math.floor((initialProjects.length - 1) / 2) * 2
                          ? "sm:border-b-0"
                          : "sm:border-b"
                        : ""
                    } ${
                      isGridExpanded
                        ? idx >= Math.floor((initialProjects.length - 1) / 4) * 4
                          ? "lg:border-b-0"
                          : "lg:border-b"
                        : ""
                    } ${
                      isGridExpanded
                        ? idx % 2 === 0
                          ? "sm:border-r"
                          : "sm:border-r-0"
                        : ""
                    } ${
                      isGridExpanded
                        ? (idx + 1) % 4 !== 0
                          ? "lg:border-r"
                          : "lg:border-r-0"
                        : ""
                    }`}
                  >
                    {/* Card Inner Content: Kosong saat transisi banyak grid, baru fade-in setelah expand ke 4 grid selesai */}
                    <div
                      className={`flex flex-col justify-between h-full transition-all duration-500 ${
                        showCardContent
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2 pointer-events-none"
                      }`}
                      style={{
                        transitionDelay: showCardContent ? `${idx * 45}ms` : "0ms",
                      }}
                    >
                      <div>
                        {/* Top metadata */}
                        <div className="flex items-center justify-between gap-1.5 mb-3">
                          {/* Live Indicator (Align Kiri, No Badge, Static Dot) */}
                          <div>
                            {project.liveUrl && (
                              <span className="font-narrow text-[10px] text-emerald-400 flex items-center gap-1.5 lowercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>live</span>
                              </span>
                            )}
                          </div>

                          {/* Right side: Private/Public badge & Year */}
                          <div className="flex items-center gap-1.5">
                            {/* Private / Public Badge */}
                            {project.isPrivate ? (
                              <span className="font-narrow text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>private</span>
                              </span>
                            ) : (
                              <span className="font-narrow text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                                public
                              </span>
                            )}

                            <span className="font-mono text-[10px] text-neutral-500">{project.year}</span>
                          </div>
                        </div>

                        {/* Mockup / Live Preview Container - Flat without rounded borders */}
                        <div className="w-full aspect-[16/10] overflow-hidden mb-4 relative border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 bg-neutral-950 flex items-center justify-center">
                          {project.liveUrl ? (
                            /* Live App Mini Preview */
                            <div className="absolute inset-0 bg-neutral-950 overflow-hidden">
                              <div className="relative w-full h-full overflow-hidden bg-neutral-900">
                                <iframe
                                  src={project.liveUrl}
                                  title={`${project.name} live preview`}
                                  tabIndex={-1}
                                  loading="lazy"
                                  scrolling="no"
                                  className="w-[200%] h-[200%] origin-top-left scale-50 border-0 pointer-events-none select-none bg-white opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                                  sandbox="allow-scripts allow-same-origin"
                                />

                                {/* Subtle hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2 pointer-events-none z-10">
                                  <span className="font-narrow text-[10px] text-emerald-300 bg-black/80 px-2 py-0.5 border border-emerald-500/20 flex items-center gap-1">
                                    <span>Preview</span>
                                    <span>↗</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : project.previewImage ? (
                            /* Image Snapshot Preview */
                            <div className="absolute inset-0 bg-neutral-950 overflow-hidden">
                              <div className="relative w-full h-full overflow-hidden bg-neutral-950">
                                <Image
                                  src={project.previewImage}
                                  alt={`${project.name} preview`}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                  className="object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2 pointer-events-none z-10">
                                  <span className="font-narrow text-[10px] text-blue-300 bg-black/80 px-2 py-0.5 border border-blue-500/20 flex items-center gap-1">
                                    <span>Snapshot</span>
                                    <span>↗</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Code Architecture Wireframe */
                            <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between w-full border-b border-neutral-800 pb-1.5">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                                </div>
                                <span className="font-mono text-[9px] text-neutral-400 truncate max-w-[130px]">
                                  {project.isPrivate ? "🔒 confidential" : project.name}
                                </span>
                              </div>

                              <div className="space-y-1 py-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] text-blue-400/80">const</span>
                                  <span className="font-mono text-[9px] text-neutral-300 truncate max-w-[100px]">{project.id.replace(/[^a-zA-Z0-9]/g, "_")}</span>
                                  <span className="font-mono text-[9px] text-neutral-500">=</span>
                                  <span className="font-mono text-[9px] text-emerald-400/80">&#123;</span>
                                </div>
                                <div className="pl-3 space-y-0.5">
                                  <div className="font-mono text-[8px] text-neutral-400 truncate">
                                    status: <span className="text-amber-300">&quot;{project.isPrivate ? "private" : "open"}&quot;</span>,
                                  </div>
                                  <div className="font-mono text-[8px] text-neutral-400 truncate">
                                    stack: <span className="text-purple-300">&quot;{project.techStack[0] || "Software"}&quot;</span>,
                                  </div>
                                </div>
                                <div className="font-mono text-[9px] text-emerald-400/80">&#125;;</div>
                              </div>

                              <div className="flex justify-between items-center pt-1 border-t border-neutral-800/40">
                                <span className="font-mono text-[8px] text-neutral-500">
                                  v// {project.year}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  →
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Project Title & Description */}
                        <h3 className="font-narrow text-lg font-normal tracking-tight text-neutral-100 mb-1.5 group-hover:text-blue-400 dark:group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <span className="truncate">{project.title}</span>
                          {project.isPrivate && (
                            <span className="text-[9px] text-neutral-500 font-mono font-normal shrink-0">
                              (private)
                            </span>
                          )}
                        </h3>
                        <p className="font-sans text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Footer: Tech Stack & Action Links */}
                      <div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.techStack.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="font-narrow text-[10px] px-1.5 py-0.5 bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-200 text-neutral-400 border border-neutral-800 truncate max-w-[110px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="font-narrow text-[9px] px-1 py-0.5 text-neutral-500">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Dummy empty cells saat awal (mode dense banyak kotak) */}
                {!isGridExpanded &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`dense-cell-${i}`}
                      className="border-r border-b border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 min-h-[100px] sm:min-h-[120px] bg-neutral-900/10 pointer-events-none"
                    />
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
              {/* Pure Table-Line Pixel Grid (7 columns x 5 rows = 35 cells filled with poster artworks) */}
              <div
                onMouseLeave={() => setHoveredPosterCell(null)}
                style={{
                  gridTemplateColumns: gridColsStyle,
                  gridTemplateRows: gridRowsStyle,
                  transition:
                    "grid-template-columns 420ms cubic-bezier(0.2, 0.8, 0.2, 1), grid-template-rows 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                  willChange: "grid-template-columns, grid-template-rows",
                }}
                className="w-full aspect-[7/5] grid border-t border-l border-neutral-800 dark:border-neutral-800 light:border-neutral-300 select-none bg-neutral-950/80 overflow-hidden"
                ref={gridRef}
              >
                {gridPosters.map((poster, idx) => {
                  const isHovered = hoveredPosterCell === idx;
                  return (
                    <div
                      key={poster.id}
                      onMouseEnter={() => setHoveredPosterCell(idx)}
                      onClick={() => setSelectedPoster(poster)}
                      className={`relative w-full h-full border-r border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-300 group overflow-hidden transition-all duration-200 cursor-pointer bg-neutral-900 ${
                        isHovered ? "z-20 ring-1 ring-white/40 shadow-2xl" : "z-0"
                      }`}
                    >
                      {/* Poster Image: direct crisp WebP rendering without any blur placeholder */}
                      <Image
                        src={poster.thumb}
                        alt={poster.title}
                        fill
                        sizes="(max-width: 768px) 30vw, 15vw"
                        loading="lazy"
                        className={`object-cover object-center transition-all duration-300 ease-out ${
                          isHovered
                            ? "brightness-105 contrast-105"
                            : "opacity-95 hover:opacity-100"
                        }`}
                      />

                      {/* Dark overlay with title hint on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-2.5 flex flex-col justify-end transition-opacity duration-300 pointer-events-none ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <span className="font-narrow text-xs text-neutral-100 font-medium truncate drop-shadow-md">
                          {poster.title}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400">
                          {poster.width} × {poster.height}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layer Tertinggi (Top-Level Portal): Pop Up Project Modal & Poster Modal */}
      {mounted &&
        createPortal(
          <>
            {/* Pop Up Detail Project Modal */}
            <AnimatePresence>
              {selectedProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedProject(null)}
                  className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-3 sm:p-6 cursor-zoom-out overflow-y-auto"
                >
                  <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 15 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl cursor-default overflow-hidden my-auto"
                  >
                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <h3 className="font-narrow text-lg font-medium text-white flex items-center gap-2">
                            <span>{selectedProject.name}</span>
                            {selectedProject.isPrivate && (
                              <span className="font-mono text-[10px] text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                                private repo
                              </span>
                            )}
                          </h3>
                          <p className="font-mono text-[11px] text-neutral-400">
                            created: {new Date(selectedProject.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · {selectedProject.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedProject.liveUrl && (
                          <a
                            href={selectedProject.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-narrow text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 transition-colors"
                          >
                            <span>Open Live</span>
                            <span>↗</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedProject(null)}
                          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Tutup"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                      {/* Live App Interactive Frame / Visualizer */}
                      {selectedProject.liveUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-narrow text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Live Application Preview
                            </span>
                            <span className="font-mono text-[10px] text-neutral-500">
                              {selectedProject.liveUrl}
                            </span>
                          </div>
                          <div className="w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner">
                            <iframe
                              src={selectedProject.liveUrl}
                              title={selectedProject.name}
                              className="w-full h-full border-0 bg-white"
                              loading="lazy"
                              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            />
                          </div>
                        </div>
                      ) : selectedProject.previewImage ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-narrow text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              Application Snapshot & System Architecture
                            </span>
                            <span className="font-mono text-[10px] text-neutral-500">
                              {selectedProject.name}
                            </span>
                          </div>
                          <div className="w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-inner group">
                            <Image
                              src={selectedProject.previewImage}
                              alt={selectedProject.title}
                              fill
                              className="object-contain p-2 bg-neutral-950"
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 font-mono text-xs text-neutral-400 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>📦</span>
                            <span>{selectedProject.isPrivate ? "Private Repository (Internal / Client IP)" : "Open Source Repository"}</span>
                          </div>
                          <span className="text-neutral-500 text-[11px]">Deploy on demand</span>
                        </div>
                      )}

                      {/* Rangkuman & Analisa Repositori */}
                      <div className="space-y-2">
                        <h4 className="font-narrow text-sm text-neutral-300 uppercase tracking-wider">
                          Analisis & Rangkuman Repository
                        </h4>
                        <p className="font-sans text-sm text-neutral-300 leading-relaxed p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
                          {selectedProject.longSummary || selectedProject.description}
                        </p>
                      </div>

                      {/* Tech Stack Breakdown */}
                      <div className="space-y-2">
                        <h4 className="font-narrow text-sm text-neutral-300 uppercase tracking-wider">
                          Teknologi & Tools
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="font-narrow text-xs px-3 py-1 rounded-lg bg-neutral-800/90 text-neutral-200 border border-neutral-700/60"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* GitHub Stats & Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                          <span className="font-mono text-[10px] text-neutral-500 block">Created At</span>
                          <span className="font-narrow text-sm text-neutral-200">
                            {new Date(selectedProject.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                          <span className="font-mono text-[10px] text-neutral-500 block">Visibility</span>
                          <span className="font-narrow text-sm text-neutral-200">
                            {selectedProject.isPrivate ? "Private (NDA)" : "Public"}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                          <span className="font-mono text-[10px] text-neutral-500 block">Stars / Forks</span>
                          <span className="font-narrow text-sm text-neutral-200">
                            ★ {selectedProject.stars || 0} / ⑂ {selectedProject.forks || 0}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
                          <span className="font-mono text-[10px] text-neutral-500 block">Deployment</span>
                          <span className="font-narrow text-sm text-neutral-200">
                            {selectedProject.liveUrl ? "Live Deployed" : "Local / Docker"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/80">
                      <span className="font-mono text-[11px] text-neutral-500">
                        Tekan <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">ESC</kbd> untuk menutup
                      </span>

                      <div className="flex items-center gap-2">
                        {selectedProject.githubUrl && !selectedProject.isPrivate && (
                          <a
                            href={selectedProject.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-narrow text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 transition-colors"
                          >
                            <span>Lihat di GitHub</span>
                            <span>↗</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedProject(null)}
                          className="font-narrow text-xs px-4 py-1.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-900 font-medium transition-colors cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lightbox / Zoom Modal Poster Artwork */}
            <AnimatePresence>
              {selectedPoster && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPoster(null)}
                  className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
                >
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-2xl max-h-[85vh] w-auto h-auto flex flex-col items-center bg-neutral-900 border border-neutral-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl cursor-default overflow-hidden"
                  >
                    <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-lg bg-black/50">
                      <Image
                        src={selectedPoster.medium}
                        alt={selectedPoster.title}
                        width={selectedPoster.width}
                        height={selectedPoster.height}
                        className="max-h-[70vh] w-auto object-contain rounded-lg"
                        priority
                      />
                    </div>

                    <div className="w-full flex items-center justify-between pt-3 px-2 border-t border-neutral-800 mt-3">
                      <span className="font-narrow text-sm text-neutral-200 lowercase tracking-wide">
                        {selectedPoster.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPoster(null)}
                        className="font-narrow text-xs px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                      >
                        Tutup (ESC)
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </section>
  );
}
