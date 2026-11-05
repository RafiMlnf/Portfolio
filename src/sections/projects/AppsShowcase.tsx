"use client";

import { useState } from "react";
import Image from "next/image";
import type { GitHubProject } from "@/lib/github";
import mtmIcon from "@/assets/mtm.png";
import upbIcon from "@/assets/upb.png";

/* ── Deteksi afiliasi (logo kecil di samping judul) ─────────────────── */
const MTM_KEYS = ["dov", "andonppic", "truck", "capex", "mtm", "jig"];
const UPB_KEYS = ["konser", "ux", "web2"];

function matchesAny(project: GitHubProject, keys: string[]) {
  const hay = `${project.id} ${project.name} ${project.title}`.toLowerCase();
  return keys.some((k) => hay.includes(k));
}

function getAffiliation(project: GitHubProject) {
  if (matchesAny(project, MTM_KEYS)) return { icon: mtmIcon, label: "MTM" };
  if (matchesAny(project, UPB_KEYS)) return { icon: upbIcon, label: "UPB" };
  return null;
}

/* ── Snapshot: hanya gambar statis (isi `previewImage` di REPO_KNOWLEDGE) ── */
function Snapshot({ project }: { project: GitHubProject }) {
  if (project.previewImage) {
    return (
      <div className="relative w-full aspect-[16/10] overflow-hidden border border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-300 bg-neutral-950">
        <Image
          src={project.previewImage}
          alt={`${project.title || project.name} snapshot`}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/10] border border-dashed border-neutral-700/70 dark:border-neutral-700/70 light:border-neutral-300 flex flex-col items-center justify-center gap-1 text-center px-4">
      <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
        Snapshot
      </span>
      <span className="font-narrow text-xs text-neutral-500">belum diset</span>
    </div>
  );
}

/* ── Satu baris project (accordion editorial) ───────────────────────── */
function ProjectRow({
  project,
  index,
  isOpen,
  onToggle,
}: {
  project: GitHubProject;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const affiliation = getAffiliation(project);
  const title = project.title || project.name;

  return (
    <li className="border-b border-neutral-800/70 dark:border-neutral-800/70 light:border-neutral-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group w-full grid grid-cols-[2rem_2.5rem_1fr_auto] sm:grid-cols-[2.5rem_3rem_1fr_auto_2rem] items-center gap-3 sm:gap-5 py-4 sm:py-5 text-left cursor-pointer"
      >
        <span
          className={`font-narrow text-sm sm:text-base transition-colors duration-200 ${
            isOpen ? "text-neutral-200 dark:text-neutral-200 light:text-neutral-900 font-medium" : "text-neutral-500 group-hover:text-neutral-300 dark:group-hover:text-neutral-300 light:group-hover:text-neutral-700"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Logo di kanan nomor: logo perusahaan/instansi, atau icon untuk projek mandiri */}
        <span
          className={`relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-70 group-hover:opacity-100"
          }`}
        >
          {affiliation ? (
            <Image src={affiliation.icon} alt={affiliation.label} fill className="object-contain" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400 dark:text-neutral-400 light:text-neutral-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Projek mandiri"
            >
              <polyline points="8 6 2 12 8 18" />
              <polyline points="16 6 22 12 16 18" />
              <line x1="14" y1="4" x2="10" y2="20" />
            </svg>
          )}
        </span>

        <span
          className={`font-narrow italic tracking-tight truncate transition-all duration-300 ${
            isOpen
              ? "text-3xl sm:text-4xl text-white dark:text-white light:text-neutral-950"
              : "text-2xl sm:text-3xl text-neutral-400 dark:text-neutral-400 light:text-neutral-600 group-hover:text-neutral-100 dark:group-hover:text-neutral-100 light:group-hover:text-neutral-900"
          }`}
        >
          {title}
        </span>

        <span className="hidden sm:block font-narrow text-xs text-neutral-500 truncate max-w-[14rem]">
          {project.category}
        </span>

        <span
          className={`justify-self-end font-mono text-sm text-neutral-500 transition-transform duration-300 ${
            isOpen ? "rotate-45 text-neutral-200" : ""
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {/* Panel detail: animasi tinggi via grid-template-rows (tanpa re-layout berat) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {isOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 pb-8 sm:pb-10 sm:pl-[5.5rem]">
              <div className="lg:col-span-6">
                <Snapshot project={project} />
              </div>

              <div className="lg:col-span-6 flex flex-col gap-5">
                <p className="font-sans text-sm leading-relaxed text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  {project.longSummary || project.description}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="font-narrow text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-5 pt-1 font-narrow text-sm">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
                    >
                      Open live ↗
                    </a>
                  )}
                  {project.githubUrl && !project.isPrivate && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white dark:hover:text-white light:hover:text-black underline-offset-4 hover:underline"
                    >
                      GitHub ↗
                    </a>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-neutral-600">
                    {project.year}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function AppsShowcase({ projects }: { projects: GitHubProject[] }) {
  const [openId, setOpenId] = useState<string | null>(projects[0]?.id ?? null);

  if (projects.length === 0) {
    return (
      <div className="py-10 text-neutral-500 font-mono text-xs">Tidak ada aplikasi tersedia.</div>
    );
  }

  return (
    <ul className="w-full border-t border-neutral-800/70 dark:border-neutral-800/70 light:border-neutral-200">
      {projects.map((project, i) => (
        <ProjectRow
          key={project.id}
          project={project}
          index={i}
          isOpen={openId === project.id}
          onToggle={() => setOpenId((prev) => (prev === project.id ? null : project.id))}
        />
      ))}
    </ul>
  );
}

