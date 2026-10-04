"use client";

import { useEffect, useRef } from "react";

// Deterministic 32-bit integer hash for cell coordinates
function hash2(c: number, r: number, seed: number): number {
  let h = (c * 374761393) ^ (r * 668265263) ^ (seed * 127412617);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export default function CursorTrackerGrid() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const coordRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const path1Ref = useRef<SVGPathElement | null>(null);
  const dot1Ref = useRef<SVGCircleElement | null>(null);
  const path2Ref = useRef<SVGPathElement | null>(null);
  const dot2Ref = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout | null = null;
    const boxSize = 32;
    const half = boxSize / 2;

    const handleMove = (e: MouseEvent) => {
      const x = Math.round(e.clientX);
      const y = Math.round(e.clientY);

      // Gerakan stepped/snapped: box menempel pada node grid 32px terdekat (tidak gerak halus/kontinu)
      // Seakan setiap cell grid matrix menyala saat kursor melewatinya
      const col = Math.round(x / boxSize);
      const row = Math.round(y / boxSize);
      const nodeX = col * boxSize;
      const nodeY = row * boxSize;
      const boxX = nodeX - half;
      const boxY = nodeY - half;

      const el = containerRef.current;
      const coord = coordRef.current;
      const svg = svgRef.current;
      const path1 = path1Ref.current;
      const dot1 = dot1Ref.current;
      const path2 = path2Ref.current;
      const dot2 = dot2Ref.current;

      if (el) {
        el.style.display = "block";
        el.style.transform = `translate3d(${boxX}px, ${boxY}px, 0)`;
      }

      if (svg) {
        svg.style.display = "block";
      }

      // Setiap cell (col, row) memiliki garis miring dengan posisi statisnya sendiri di koordinat ruang
      // Garis solid, tidak fading, tidak flicker, dan muncul acak dari berbagai arah/jarak
      if (path1 && dot1 && path2 && dot2) {
        const h1 = hash2(col, row, 1);
        const h2 = hash2(col, row, 2);
        const h3 = hash2(col, row, 3);
        const h4 = hash2(col, row, 4);

        // Track 1: Arah diagonal 45 derajat
        const dir1 = Math.floor(h1 * 4);
        const dx1 = dir1 === 0 || dir1 === 3 ? -1 : 1;
        const dy1 = dir1 === 0 || dir1 === 1 ? -1 : 1;
        const tx1 = nodeX + dx1 * half;
        const ty1 = nodeY + dy1 * half;

        // Jarak statis origin titik anchor (antara 64px s/d 256px dari berbagai arah acak)
        const steps1 = 2 + Math.floor(h2 * 7);
        const dist1 = steps1 * boxSize;

        let d1 = "";
        let ax1 = 0;
        let ay1 = 0;

        if (h3 < 0.45) {
          // Garis miring murni 45 derajat langsung dari anchor ke box
          ax1 = tx1 + dx1 * (dist1 - half);
          ay1 = ty1 + dy1 * (dist1 - half);
          d1 = `M ${ax1} ${ay1} L ${tx1} ${ty1}`;
        } else {
          // Jalur miring dogleg (miring 45 derajat + lurus horizontal masuk ke sisi box)
          const diagSpan = Math.max(boxSize, Math.floor(h3 * (dist1 - boxSize)));
          ax1 = tx1 + dx1 * dist1;
          ay1 = ty1 + dy1 * diagSpan;
          const cornerX = tx1 + dx1 * (dist1 - diagSpan);
          const cornerY = ty1;
          d1 = `M ${ax1} ${ay1} L ${cornerX} ${cornerY} L ${tx1} ${ty1}`;
        }

        path1.style.display = "block";
        path1.setAttribute("d", d1);
        dot1.style.display = "block";
        dot1.setAttribute("cx", String(ax1));
        dot1.setAttribute("cy", String(ay1));

        // Track 2: Beberapa cell memiliki garis kedua dari sudut berlawanan/berbeda
        if (h4 < 0.38) {
          const h5 = hash2(col, row, 5);
          const h6 = hash2(col, row, 6);
          const h7 = hash2(col, row, 7);

          const dir2 = (dir1 + 1 + Math.floor(h5 * 2)) % 4;
          const dx2 = dir2 === 0 || dir2 === 3 ? -1 : 1;
          const dy2 = dir2 === 0 || dir2 === 1 ? -1 : 1;
          const tx2 = nodeX + dx2 * half;
          const ty2 = nodeY + dy2 * half;
          const steps2 = 2 + Math.floor(h6 * 6);
          const dist2 = steps2 * boxSize;

          let d2 = "";
          let ax2 = 0;
          let ay2 = 0;

          if (h7 < 0.5) {
            ax2 = tx2 + dx2 * (dist2 - half);
            ay2 = ty2 + dy2 * (dist2 - half);
            d2 = `M ${ax2} ${ay2} L ${tx2} ${ty2}`;
          } else {
            const diagSpan = Math.max(boxSize, Math.floor(h7 * (dist2 - boxSize)));
            ax2 = tx2 + dx2 * dist2;
            ay2 = ty2 + dy2 * diagSpan;
            const cornerX = tx2 + dx2 * (dist2 - diagSpan);
            const cornerY = ty2;
            d2 = `M ${ax2} ${ay2} L ${cornerX} ${cornerY} L ${tx2} ${ty2}`;
          }

          path2.style.display = "block";
          path2.setAttribute("d", d2);
          dot2.style.display = "block";
          dot2.setAttribute("cx", String(ax2));
          dot2.setAttribute("cy", String(ay2));
        } else {
          path2.style.display = "none";
          dot2.style.display = "none";
        }
      }

      if (coord) {
        coord.textContent = `${x.toString().padStart(4, "0")}, ${y.toString().padStart(4, "0")}`;
      }

      if (idleTimer) clearTimeout(idleTimer);
      // Ketika kursor berhenti bergerak selama 120ms, matikan grid & garis
      idleTimer = setTimeout(() => {
        if (containerRef.current) containerRef.current.style.display = "none";
        if (svgRef.current) svgRef.current.style.display = "none";
      }, 120);
    };

    const handleLeave = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (containerRef.current) containerRef.current.style.display = "none";
      if (svgRef.current) svgRef.current.style.display = "none";
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const boxSize = 32;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* Garis-garis track statis miring (solid, tidak fading, tidak flick, blending screen) */}
      <svg
        ref={svgRef}
        className="cursor-connector-canvas"
        style={{ display: "none" }}
      >
        <path
          ref={path1Ref}
          d=""
          stroke="rgba(255, 255, 255, 0.42)"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          ref={dot1Ref}
          cx="0"
          cy="0"
          r="1.5"
          fill="rgba(255, 255, 255, 0.6)"
        />
        <path
          ref={path2Ref}
          d=""
          stroke="rgba(255, 255, 255, 0.42)"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          ref={dot2Ref}
          cx="0"
          cy="0"
          r="1.5"
          fill="rgba(255, 255, 255, 0.6)"
        />
      </svg>

      {/* Box tracker di posisi kursor - snapped discrete matrix node */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          display: "none",
          width: `${boxSize}px`,
          height: `${boxSize}px`,
        }}
      >
        {/* Garis batas kotak yang flickering dan berganti bentuk antara 1:1 dan persegi panjang */}
        <div
          className="absolute inset-0 cursor-grid-flicker"
          style={{
            boxShadow: "inset 0 0 0 0.35px #ffffff",
          }}
        />

        {/* Teks koordinat live murni polos tanpa badge & tanpa distorsi stretch */}
        <div className="absolute left-[calc(100%+5px)] top-[calc(100%-7px)] flex items-center gap-1 font-mono text-[9px] tracking-widest text-neutral-400 dark:text-neutral-400 light:text-neutral-600 uppercase whitespace-nowrap">
          <span className="text-white/40 dark:text-white/40 light:text-black/40">XY:</span>
          <span ref={coordRef}>0000, 0000</span>
        </div>
      </div>
    </div>
  );
}
