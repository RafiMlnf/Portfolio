"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pseudo-random generator (seeded) agar bentuk garis statis konsisten di setiap render.
 */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Garis tipis statis di sisi kiri:
 * - Garis vertikal tenang (bukan gelombang denyut jantung / heart rate).
 * - Di beberapa titik acak, garis mengikal memutar / terlilit tajam dengan bentuk bersudut (sharp angular coils/tangles, tidak rounded).
 * - Statis tanpa animasi.
 */
export default function ScribbleLine() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pathD, setPathD] = useState<string>("");

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      if (!container) return;

      const height = container.offsetHeight;
      if (height <= 0) return;

      const centerX = 16;
      let currX = centerX;
      let currY = 0;

      let d = `M ${centerX} 0`;
      let seed = 42;

      while (currY < height) {
        // Jarak vertikal acak antara satu ikalan tajam dengan ikalan berikutnya (160px - 340px)
        const gap = 160 + pseudoRandom(seed++) * 180;
        const targetKnotY = Math.min(currY + gap, height);

        // Aliran vertikal tenang di antara titik ikal (hanya micro-jitter halus, bukan grafik heart rate)
        while (currY < targetKnotY - 35) {
          const stepY = Math.min(45 + pseudoRandom(seed++) * 35, targetKnotY - 35 - currY);
          currY += stepY;
          currX = centerX + (pseudoRandom(seed++) - 0.5) * 1.5;
          d += ` L ${currX.toFixed(2)} ${currY.toFixed(2)}`;
        }

        if (currY + 35 >= height) break;

        // Titik simpul ikal tajam / terlilit (angular sharp knot / wrap)
        const knotType = Math.floor(pseudoRandom(seed++) * 4);
        const dir = pseudoRandom(seed++) > 0.5 ? 1 : -1;
        const scale = 0.85 + pseudoRandom(seed++) * 0.35;
        const y0 = currY;

        if (knotType === 0) {
          // Ikalan tajam segitiga bersilangan (sharp triangular loop cross)
          d += ` L ${(centerX + 11 * dir * scale).toFixed(2)} ${(y0 + 6).toFixed(2)}`;
          d += ` L ${(centerX - 8 * dir * scale).toFixed(2)} ${(y0 + 2).toFixed(2)}`; // memotong balik ke atas menyilang
          d += ` L ${(centerX - 12 * dir * scale).toFixed(2)} ${(y0 + 13).toFixed(2)}`;
          d += ` L ${(centerX + 9 * dir * scale).toFixed(2)} ${(y0 + 17).toFixed(2)}`; // menyilang tengah
          d += ` L ${centerX.toFixed(2)} ${(y0 + 23).toFixed(2)}`;
          currY = y0 + 23;
        } else if (knotType === 1) {
          // Ikalan terlilit 2 putaran tajam (double angular coil)
          d += ` L ${(centerX + 10 * dir * scale).toFixed(2)} ${(y0 + 5).toFixed(2)}`;
          d += ` L ${(centerX - 8 * dir * scale).toFixed(2)} ${(y0 + 2).toFixed(2)}`; // potong silang ke atas
          d += ` L ${(centerX - 11 * dir * scale).toFixed(2)} ${(y0 + 10).toFixed(2)}`;
          d += ` L ${(centerX + 9 * dir * scale).toFixed(2)} ${(y0 + 11).toFixed(2)}`;
          d += ` L ${(centerX + 12 * dir * scale).toFixed(2)} ${(y0 + 18).toFixed(2)}`; // putaran kedua
          d += ` L ${(centerX - 9 * dir * scale).toFixed(2)} ${(y0 + 16).toFixed(2)}`; // potong silang balik
          d += ` L ${(centerX + 6 * dir * scale).toFixed(2)} ${(y0 + 24).toFixed(2)}`;
          d += ` L ${centerX.toFixed(2)} ${(y0 + 29).toFixed(2)}`;
          currY = y0 + 29;
        } else if (knotType === 2) {
          // Lilitan kusut bersudut tajam (sharp asymmetric tangle)
          d += ` L ${(centerX - 9 * dir * scale).toFixed(2)} ${(y0 + 4).toFixed(2)}`;
          d += ` L ${(centerX + 11 * dir * scale).toFixed(2)} ${(y0 + 1).toFixed(2)}`; // memotong miring ke atas
          d += ` L ${(centerX + 12 * dir * scale).toFixed(2)} ${(y0 + 11).toFixed(2)}`;
          d += ` L ${(centerX - 8 * dir * scale).toFixed(2)} ${(y0 + 14).toFixed(2)}`; // menyilang sumbu
          d += ` L ${(centerX + 10 * dir * scale).toFixed(2)} ${(y0 + 19).toFixed(2)}`;
          d += ` L ${(centerX - 11 * dir * scale).toFixed(2)} ${(y0 + 22).toFixed(2)}`;
          d += ` L ${(centerX + 2 * dir * scale).toFixed(2)} ${(y0 + 28).toFixed(2)}`;
          d += ` L ${centerX.toFixed(2)} ${(y0 + 32).toFixed(2)}`;
          currY = y0 + 32;
        } else {
          // Ikalan bersudut zigzag tumpang-tindih (sharp faceted wrap)
          d += ` L ${(centerX + 12 * dir * scale).toFixed(2)} ${(y0 + 7).toFixed(2)}`;
          d += ` L ${(centerX - 10 * dir * scale).toFixed(2)} ${(y0 + 8).toFixed(2)}`; // garis datar menyilang poros
          d += ` L ${(centerX + 8 * dir * scale).toFixed(2)} ${(y0 + 2).toFixed(2)}`;  // potong tajam ke atas
          d += ` L ${(centerX + 10 * dir * scale).toFixed(2)} ${(y0 + 16).toFixed(2)}`; // turun menyilang
          d += ` L ${(centerX - 11 * dir * scale).toFixed(2)} ${(y0 + 19).toFixed(2)}`;
          d += ` L ${centerX.toFixed(2)} ${(y0 + 26).toFixed(2)}`;
          currY = y0 + 26;
        }

        currX = centerX;
      }

      // Sampai paling dasar
      d += ` L ${centerX} ${height}`;
      setPathD(d);
    };

    updatePath();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        updatePath();
      });
      ro.observe(containerRef.current);
    }

    window.addEventListener("resize", updatePath);
    return () => {
      window.removeEventListener("resize", updatePath);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-0.5 sm:left-2 md:left-4 lg:left-6 top-0 bottom-0 w-8 pointer-events-none z-10 select-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* Glow halo sangat tipis */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            className="stroke-white/10 dark:stroke-white/10 light:stroke-neutral-900/10"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="miter"
            strokeMiterlimit="4"
          />
        )}

        {/* Garis scribble tipis & statis dengan simpul tajam melilit */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            className="stroke-neutral-400/55 dark:stroke-white/45 light:stroke-neutral-800/40"
            strokeWidth="0.65"
            strokeLinecap="round"
            strokeLinejoin="miter"
            strokeMiterlimit="4"
          />
        )}
      </svg>
    </div>
  );
}
