"use client";

import dynamic from "next/dynamic";

const Noise = dynamic(() => import("@/components/Noise"), {
  ssr: false,
});

export default function Profile() {
  return (
    <section
      id="profile"
      className="relative w-full h-screen min-h-[650px] bg-dither-dark border-b border-neutral-800/80 overflow-hidden flex flex-col justify-between"
    >
      {/* 1. Procedural Dither Dot Matrix Overlay */}
      <div className="dither-pattern" />

      {/* 2. Film Grain / Dither Noise Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
        <Noise
          patternSize={250}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={3}
          patternAlpha={18}
        />
      </div>

      {/* 3. Grid Visualizer & Boundary Guides (Batas 1 Layar & Kolom Grid) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="relative w-full max-w-5xl h-full border-x border-dashed border-cyan-500/40">
          {/* 12-Column Responsive Grid View */}
          <div className="w-full h-full grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-4 px-4 sm:px-8 opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-full border-x border-dashed border-cyan-400/20 bg-cyan-400/[0.015] flex flex-col justify-between py-6 items-center"
              >
                <span className="font-sans text-[10px] text-cyan-400/60 select-none">
                  C{i + 1}
                </span>
                <span className="font-sans text-[10px] text-cyan-400/60 select-none">
                  C{i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Horizontal Center Guide Line */}
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-cyan-400/30" />
        </div>
      </div>

      {/* Content Container (Ready for custom content inside bounds) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 py-16 flex-1 flex items-center">
        {/* Konten About di sini */}
      </div>

      {/* Blue Bar at Bottom with Straddling Name Text (Half in, half out) */}
      <div className="relative w-full h-16 sm:h-20 md:h-24 bg-[#0000bd] z-20 shrink-0">
        {/* Name Text centered on the dividing boundary line */}
        <div className="absolute top-0 left-0 right-0 -translate-y-1/2 flex items-baseline justify-center gap-3 sm:gap-4 md:gap-5 pointer-events-none select-none px-4">
          <h2 className="font-narrow text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal italic tracking-tight text-[#0000bd] lowercase name-double-stroke">
            rafi
          </h2>
          <span className="font-narrow text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal italic tracking-tight text-[#0000bd] lowercase name-double-stroke opacity-95">
            maulana firdaus
          </span>
        </div>
      </div>
    </section>
  );
}


