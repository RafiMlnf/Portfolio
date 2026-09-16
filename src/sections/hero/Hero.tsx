"use client";

import dynamic from "next/dynamic";

const Prism = dynamic(() => import("@/components/Prism"), {
  ssr: false,
});

const Noise = dynamic(() => import("@/components/Noise"), {
  ssr: false,
});

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden"
    >
      {/* Centered Boxed Canvas with Left and Right borders */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-5xl h-full border-x border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 overflow-hidden pointer-events-auto">
          {/* Prism WebGL canvas inside boxed container */}
          <div className="absolute inset-0 w-full h-full">
            <Prism
              height={3.5}
              baseWidth={5.5}
              animationType="hover"
              glow={1}
              noise={0.5}
              transparent={true}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              hoverStrength={2}
              inertia={0.05}
              bloom={1}
              timeScale={0.5}
            />
          </div>

          {/* Noise overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Noise
              patternSize={250}
              patternScaleX={1}
              patternScaleY={1}
              patternRefreshInterval={2}
              patternAlpha={15}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 pointer-events-auto">
        <div className="max-w-2xl">
          <h1 className="font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase">
            creative developer
          </h1>
          <p className="mt-4 text-neutral-400 text-lg sm:text-xl font-normal">
            Building minimal, interactive digital experiences.
          </p>
        </div>
      </div>
    </section>
  );
}
