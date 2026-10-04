"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { posterImages, type PosterItem } from "@/data/posters";
import type { GitHubProject } from "@/lib/github";
import mtmIcon from "@/assets/mtm.png";
import upbIcon from "@/assets/upb.png";

type ProjectCategory = "apps" | "posters";

const MTM_PROJECT_IDS = new Set([
  "dov",
  "andonppic",
  "truck-weighting",
  "truck-scale",
  "capex-hub",
  "mtmstandart",
  "mtm-standart",
  "jigfixtures",
  "jig",
]);

const UPB_PROJECT_IDS = new Set([
  "konserku",
  "ux-research-tool",
  "ux",
  "web2",
]);

function isMtmProject(project: GitHubProject): boolean {
  const id = project.id?.toLowerCase() || "";
  const name = project.name?.toLowerCase() || "";
  const title = project.title?.toLowerCase() || "";
  if (MTM_PROJECT_IDS.has(id) || MTM_PROJECT_IDS.has(name)) return true;
  return (
    id.includes("dov") ||
    id.includes("andonppic") ||
    id.includes("truck") ||
    id.includes("capex") ||
    id.includes("mtm") ||
    id.includes("jig") ||
    name.includes("dov") ||
    name.includes("andonppic") ||
    name.includes("truck") ||
    name.includes("capex") ||
    name.includes("mtm") ||
    name.includes("jig") ||
    title.includes("dov") ||
    title.includes("andonppic") ||
    title.includes("truck scale") ||
    title.includes("capex") ||
    title.includes("mtm") ||
    title.includes("jig")
  );
}

function isUpbProject(project: GitHubProject): boolean {
  const id = project.id?.toLowerCase() || "";
  const name = project.name?.toLowerCase() || "";
  const title = project.title?.toLowerCase() || "";
  if (UPB_PROJECT_IDS.has(id) || UPB_PROJECT_IDS.has(name)) return true;
  return (
    id.includes("konser") ||
    id.includes("ux") ||
    id.includes("web2") ||
    name.includes("konser") ||
    name.includes("ux") ||
    name.includes("web2") ||
    title.includes("konser") ||
    title.includes("ux") ||
    title.includes("web2")
  );
}

interface ProjectsClientProps {
  initialProjects: GitHubProject[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("apps");
  const [hoveredPosterCell, setHoveredPosterCell] = useState<number | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<GitHubProject | null>(initialProjects[0] ?? null);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const currentProject = selectedProject ?? initialProjects[0] ?? null;

  const handleSelectTab = (tab: ProjectCategory) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPoster(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock background scroll (including Lenis) when poster modal is active
  useEffect(() => {
    if (selectedPoster) {
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Pause Lenis smooth scroll engine
      const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
      if (lenis) {
        lenis.stop();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        if (lenis) {
          lenis.start();
        }
      };
    }
  }, [selectedPoster]);

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
      className="relative w-full py-8 sm:py-10 lg:py-12 px-4 sm:px-6 md:px-10 lg:px-12 pointer-events-auto border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <span className="font-narrow text-[11px] tracking-widest uppercase text-neutral-500 block mb-1">
              04 / Portfolio Showcase
            </span>
            <h2 className="font-narrow text-3xl sm:text-4xl md:text-5xl font-normal italic tracking-tight lowercase text-neutral-100">
              Selected Works
            </h2>
          </div>

          {/* Sub-section Navigation Tabs */}
          <div className="inline-flex p-0.5 rounded-full border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/90 backdrop-blur-md self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleSelectTab("apps")}
              className={`relative px-4 sm:px-5 py-1.5 rounded-full font-narrow text-xs transition-all duration-300 cursor-pointer lowercase ${
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
              <span className="relative z-10 flex items-center gap-1.5">
                <span>Web / App</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
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
              className={`relative px-4 sm:px-5 py-1.5 rounded-full font-narrow text-xs transition-all duration-300 cursor-pointer lowercase ${
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
              <span className="relative z-10 flex items-center gap-1.5">
                <span>Graphic / Poster</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
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
              key="apps-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full relative"
            >
              {/* Apps 2-Column Split: Left List & Right Detail */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                {/* Left Column: Pure List of Application Names (Flat, Dividers Only) */}
                <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-20 self-start">
                  <div
                    data-lenis-prevent="true"
                    onWheel={(e) => {
                      const container = e.currentTarget;
                      const { scrollTop, scrollHeight, clientHeight } = container;
                      const maxScroll = scrollHeight - clientHeight;
                      if (maxScroll > 0) {
                        e.stopPropagation();
                        // If scrolling down and not at bottom, or scrolling up and not at top, prevent window scroll
                        if (
                          (e.deltaY > 0 && scrollTop < maxScroll) ||
                          (e.deltaY < 0 && scrollTop > 0)
                        ) {
                          container.scrollTop += e.deltaY;
                          e.preventDefault();
                        }
                      }
                    }}
                    className="flex flex-col divide-y divide-neutral-800/60 dark:divide-neutral-800/60 light:divide-neutral-200/80 max-h-[460px] overflow-y-auto overscroll-contain pr-1 custom-list-scrollbar select-none"
                  >
                    {initialProjects.length > 0 ? (
                      initialProjects.map((project) => {
                        const isSelected = currentProject?.id === project.id;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => setSelectedProject(project)}
                            className={`group relative w-full text-left py-2.5 px-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-neutral-800/30 dark:bg-neutral-800/30 light:bg-neutral-200/60 text-white dark:text-white light:text-neutral-950 font-medium"
                                : "text-neutral-400 dark:text-neutral-400 light:text-neutral-600 hover:text-white dark:hover:text-white light:hover:text-black hover:bg-neutral-900/20 dark:hover:bg-neutral-900/20 light:hover:bg-neutral-100/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              {isMtmProject(project) ? (
                                <span className="inline-flex items-center justify-center shrink-0 w-4 h-4 rounded overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
                                  <Image
                                    src={mtmIcon}
                                    alt="MTM"
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                              ) : isUpbProject(project) ? (
                                <span className="inline-flex items-center justify-center shrink-0 w-4 h-4 rounded overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
                                  <Image
                                    src={upbIcon}
                                    alt="UPB"
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                              ) : null}
                              <span className="font-narrow text-sm sm:text-base tracking-tight truncate lowercase">
                                {project.title || project.name}
                              </span>
                            </div>
                            {isSelected && (
                              <motion.span
                                layoutId="activeAppIndicator"
                                className="font-mono text-xs text-neutral-300 dark:text-neutral-300 light:text-neutral-700"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                              >
                                →
                              </motion.span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-neutral-500 font-mono text-xs">
                        Tidak ada aplikasi tersedia.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Project Details Panel */}
                <div className="lg:col-span-8 xl:col-span-8 w-full min-w-0">
                  <AnimatePresence mode="wait">
                    {currentProject ? (
                      <motion.div
                        key={currentProject.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full space-y-4"
                      >
                        {/* Top Section: 2 Sub-Columns (Kiri Gambar Preview, Kanan Nama Aplikasi & Tech Stack) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-start">
                          {/* Sub-Column Kiri: Gambar / Viewport Preview (Rasio Asli 16:9 Pas Tanpa Border Hitam, Hover Pop Up) */}
                          <div className="md:col-span-7 flex flex-col">
                            <div
                              onMouseEnter={() => setIsPreviewHovered(true)}
                              onMouseLeave={() => setIsPreviewHovered(false)}
                              className="group/preview relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 bg-neutral-950 flex items-center justify-center cursor-zoom-in"
                            >
                              {currentProject.liveUrl ? (
                                <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">
                                  {/* Render full desktop viewport (1440x810 or 1280x720) scaled down seamlessly into the container so it shows the actual desktop UI */}
                                  <div className="absolute top-0 left-0 w-[300%] h-[300%] origin-top-left scale-[0.333333]">
                                    <iframe
                                      key={currentProject.liveUrl}
                                      src={currentProject.liveUrl}
                                      title={`${currentProject.name} live preview`}
                                      className="w-full h-full border-0 bg-white pointer-events-none"
                                      loading="lazy"
                                      tabIndex={-1}
                                      sandbox="allow-scripts allow-same-origin"
                                    />
                                  </div>
                                  {/* Transparent overlay ensuring absolutely no clicks or interactions go through */}
                                  <div className="absolute inset-0 bg-transparent cursor-default pointer-events-auto" />
                                </div>
                              ) : currentProject.previewImage ? (
                                <Image
                                  src={currentProject.previewImage}
                                  alt={`${currentProject.name} preview`}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 40vw"
                                  className="object-cover object-top"
                                />
                              ) : (
                                /* Code Architecture Console */
                                <div className="w-full h-full p-3.5 flex flex-col justify-between font-mono text-[10px] bg-neutral-950 text-neutral-300 select-none">
                                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-blue-400 font-bold">#</span>
                                      <span className="text-neutral-200">{currentProject.id}</span>
                                    </div>
                                    <span className="text-neutral-500 text-[9px]">
                                      {currentProject.isPrivate ? "Private" : "Open Source"}
                                    </span>
                                  </div>

                                  <div className="space-y-0.5 py-1">
                                    <div className="text-neutral-400">
                                      <span className="text-purple-400">const</span> <span className="text-yellow-300">manifest</span> = &#123;
                                    </div>
                                    <div className="pl-2 space-y-0.5 text-[9px] text-neutral-400">
                                      <div>name: <span className="text-emerald-300">&quot;{currentProject.name}&quot;</span>,</div>
                                      <div>version: <span className="text-amber-300">&quot;{currentProject.year}.1.0&quot;</span>,</div>
                                      <div>ecosystem: <span className="text-blue-300">&quot;{currentProject.techStack[0] || 'TypeScript'}&quot;</span>,</div>
                                      <div>status: <span className="text-purple-300">&quot;{currentProject.isPrivate ? 'private' : 'open'}&quot;</span></div>
                                    </div>
                                    <div className="text-neutral-400">&#125;;</div>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-neutral-800/80 pt-1 text-[9px] text-neutral-500">
                                    <span>DEPLOY: {currentProject.isPrivate ? "INTERNAL" : "EDGE"}</span>
                                    <span className="text-emerald-400">● OK</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sub-Column Kanan: Nama Aplikasi & Tech Stack */}
                          <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                            <div className="space-y-2.5">

                              {/* Application Name (Title) */}
                              <h3 className="font-narrow text-xl sm:text-2xl font-normal lowercase tracking-tight text-white dark:text-white light:text-neutral-950">
                                {currentProject.title || currentProject.name}
                              </h3>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-0.5">
                                {currentProject.liveUrl && (
                                  <a
                                    href={currentProject.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-narrow text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                                  >
                                    <span>Open Live</span>
                                    <span>↗</span>
                                  </a>
                                )}
                                {currentProject.githubUrl && !currentProject.isPrivate && (
                                  <a
                                    href={currentProject.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-narrow text-xs px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-800 light:hover:bg-neutral-200 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 border border-neutral-700/60 dark:border-neutral-700/60 light:border-neutral-300 flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <span>GitHub</span>
                                    <span>↗</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
                              <h4 className="font-narrow text-[10px] tracking-wider uppercase text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
                                Teknologi & Tools
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {currentProject.techStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="font-narrow text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 dark:bg-neutral-900 light:bg-neutral-100 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Merged Full-Width Column: Deskripsi & Stats (Merge jadi 1 kolom lagi) */}
                        <div className="w-full space-y-3 pt-3 border-t border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
                          {/* Overview & Analysis */}
                          <div className="space-y-1">
                            <h4 className="font-narrow text-[10px] tracking-wider uppercase text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
                              Analisis & Rangkuman Repository
                            </h4>
                            <p className="font-sans text-xs text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-snug p-3 rounded-lg bg-neutral-900/50 dark:bg-neutral-900/50 light:bg-neutral-100/70 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 line-clamp-3">
                              {currentProject.longSummary || currentProject.description}
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                            <div className="p-2 rounded-lg bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/50 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
                              <span className="font-mono text-[9px] text-neutral-500 block">Created At</span>
                              <span className="font-narrow text-xs text-neutral-200 dark:text-neutral-200 light:text-neutral-800 font-medium">
                                {new Date(currentProject.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/50 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
                              <span className="font-mono text-[9px] text-neutral-500 block">Visibility</span>
                              <span className="font-narrow text-xs text-neutral-200 dark:text-neutral-200 light:text-neutral-800 font-medium">
                                {currentProject.isPrivate ? "Private" : "Public"}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/50 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
                              <span className="font-mono text-[9px] text-neutral-500 block">Stars / Forks</span>
                              <span className="font-narrow text-xs text-neutral-200 dark:text-neutral-200 light:text-neutral-800 font-medium">
                                ★ {currentProject.stars || 0} / ⑂ {currentProject.forks || 0}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/50 border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200">
                              <span className="font-mono text-[9px] text-neutral-500 block">Deployment</span>
                              <span className="font-narrow text-xs text-neutral-200 dark:text-neutral-200 light:text-neutral-800 font-medium">
                                {currentProject.liveUrl ? "Live" : "Local"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="p-6 text-center text-neutral-500 font-mono text-xs">
                        Pilih aplikasi dari daftar di sebelah kiri.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
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


            {/* Pop Up Preview Gambar / Live App saat Hover */}
            <AnimatePresence>
              {isPreviewHovered && currentProject && (currentProject.previewImage || currentProject.liveUrl) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center p-4 sm:p-8"
                >
                  {/* Subtle dark backdrop glow */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                  />

                  {/* Pop Up Box with 16:9 Aspect Ratio */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative w-full max-w-4xl aspect-[16/9] rounded-xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-neutral-950 flex items-center justify-center"
                  >
                    {currentProject.liveUrl ? (
                      <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">
                        <iframe
                          key={`popup-${currentProject.liveUrl}`}
                          src={currentProject.liveUrl}
                          title={`${currentProject.name} enlarged preview`}
                          className="w-full h-full border-0 bg-white pointer-events-none"
                          tabIndex={-1}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    ) : currentProject.previewImage ? (
                      <Image
                        src={currentProject.previewImage}
                        alt={`${currentProject.name} enlarged preview`}
                        fill
                        sizes="(max-width: 1280px) 90vw, 1200px"
                        className="object-cover object-top"
                        priority
                      />
                    ) : null}
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
                  data-lenis-prevent
                  className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out overscroll-contain"
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
