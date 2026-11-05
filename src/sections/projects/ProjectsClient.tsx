"use client";

import { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { posterImages, type PosterItem } from "@/data/posters";
import type { GitHubProject } from "@/lib/github";
import AppsShowcase from "./AppsShowcase";

/** Poster thumbnail baru di-render (mount) saat sel mendekati viewport. */
function LazyPosterImage({ src, alt, isHovered }: { src: string; alt: string; isHovered: boolean }) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={holderRef} className="absolute inset-0">
      {visible && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 30vw, 15vw"
          loading="lazy"
          className={`object-cover object-center transition-all duration-300 ease-out ${
            isHovered ? "brightness-105 contrast-105" : "opacity-95 hover:opacity-100"
          }`}
        />
      )}
    </div>
  );
}

const LazyPosterImageMemo = memo(LazyPosterImage);

/** Sel poster ter-memo: hover hanya me-render ulang sel yang berubah, bukan seluruh 35 sel. */
const PosterCell = memo(function PosterCell({
  poster,
  idx,
  isHovered,
  onEnter,
  onSelect,
}: {
  poster: PosterItem;
  idx: number;
  isHovered: boolean;
  onEnter: (idx: number) => void;
  onSelect: (poster: PosterItem) => void;
}) {
  return (
    <div
      onMouseEnter={() => onEnter(idx)}
      onClick={() => onSelect(poster)}
      className={`relative w-full h-full border-r border-b border-neutral-800 dark:border-neutral-800 light:border-neutral-300 group overflow-hidden transition-shadow duration-200 cursor-pointer bg-neutral-900 ${
        isHovered ? "z-20 ring-1 ring-white/40 shadow-2xl" : "z-0"
      }`}
    >
      <LazyPosterImageMemo src={poster.thumb} alt={poster.title} isHovered={isHovered} />
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
});

type ProjectCategory = "apps" | "posters";

interface ProjectsClientProps {
  initialProjects: GitHubProject[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("apps");
  const [hoveredPosterCell, setHoveredPosterCell] = useState<number | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

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
              <AppsShowcase projects={initialProjects} />
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
                  contain: "layout paint",
                }}
                className="w-full aspect-[7/5] grid border-t border-l border-neutral-800 dark:border-neutral-800 light:border-neutral-300 select-none bg-neutral-950/80 overflow-hidden"
                ref={gridRef}
              >
                {gridPosters.map((poster, idx) => (
                  <PosterCell
                    key={poster.id}
                    poster={poster}
                    idx={idx}
                    isHovered={hoveredPosterCell === idx}
                    onEnter={setHoveredPosterCell}
                    onSelect={setSelectedPoster}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layer Tertinggi (Top-Level Portal): Pop Up Project Modal & Poster Modal */}
      {mounted &&
        createPortal(
          <>


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
