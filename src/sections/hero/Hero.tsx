"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import starImg from "@/assets/star.png";

const Prism = dynamic(() => import("@/components/Prism"), {
  ssr: false,
});

const Noise = dynamic(() => import("@/components/Noise"), {
  ssr: false,
});

export default function Hero() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Mouse cursor parallax for stars
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Menggunakan scrollY window langsung karena section Hero berstatus sticky top-0
  const { scrollY } = useScroll();

  // Parallax vertical transitions (0px - 550px scroll)
  // Kedua teks bergerak naik ke atas secara elegan dengan fade out halus
  const yParallax = useTransform(scrollY, [0, 500], [0, -160]);

  // Opasitas teks menipis seiring scroll
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0.05]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalisasi -1 hingga 1 dari tengah layar
      const nx = (e.clientX - innerWidth * 0.5) / (innerWidth * 0.5);
      const ny = (e.clientY - innerHeight * 0.5) / (innerHeight * 0.5);
      // Rentang parallax lembut: -18px s/d 18px horizontal, -14px s/d 14px vertikal
      mouseX.set(nx * 20);
      mouseY.set(ny * 16);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      setShowScrollIndicator(currentY > 20 && currentY < 550);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToProfile = () => {
    const profileEl = document.getElementById("profile");
    if (profileEl) {
      profileEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="sticky top-0 w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden z-0"
    >
      {/* Centered Boxed Canvas with Left and Right borders */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-5xl h-full border-x border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 overflow-hidden pointer-events-auto">
          {/* Prism WebGL canvas inside boxed container */}
          <div className="absolute inset-0 w-full h-full">
            <Prism
              height={4.5}
              baseWidth={7.0}
              animationType="hover"
              glow={1}
              noise={0.5}
              transparent={true}
              scale={5.2}
              hueShift={0}
              colorFrequency={1}
              hoverStrength={2}
              inertia={0.05}
              bloom={1}
              bulge={0.8}
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
        <div className="w-full flex items-baseline justify-between gap-4">
          <motion.h1
            style={{ y: yParallax, opacity: textOpacity }}
            className="font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase"
          >
            <span className="shaky-retro-text flicker-container">
              {"portfolio".split(" ").map((word, wIdx, arr) => (
                <span key={wIdx}>
                  <span className="flicker-word">
                    {word.split("").map((char, cIdx) => {
                      // Predefined pseudo-random duration and delays (crisp, snappy flickers)
                      const duration = 3.6 + ((cIdx * 7 + wIdx * 13) % 15) * 0.18;
                      const delay = ((cIdx * 11 + wIdx * 17) % 19) * 0.22;
                      return (
                        <span
                          key={cIdx}
                          className="flicker-char"
                          style={
                            {
                              "--flicker-duration": `${duration}s`,
                              "--flicker-delay": `${delay}s`,
                            } as React.CSSProperties
                          }
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                  {wIdx < arr.length - 1 && " "}
                </span>
              ))}
            </span>
          </motion.h1>

          <motion.span
            style={{ y: yParallax, opacity: textOpacity }}
            className="font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase text-right"
          >
            <span className="shaky-retro-text flicker-container">
              {"rafi".split("").map((char, cIdx) => {
                const duration = 3.8 + (cIdx % 4) * 0.2;
                const delay = 0.4 + (cIdx % 3) * 0.25;
                return (
                  <span
                    key={cIdx}
                    className="flicker-char"
                    style={
                      {
                        "--flicker-duration": `${duration}s`,
                        "--flicker-delay": `${delay}s`,
                      } as React.CSSProperties
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </motion.span>
        </div>
      </div>

      {/* Floating white scroll indicator with slide down and fade in */}
      <div
        className={`absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-500 ease-out ${
          showScrollIndicator
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={scrollToProfile}
          className="group flex flex-col items-center cursor-pointer focus:outline-none p-3"
          aria-label="Scroll to profile"
        >
          <div className="animate-bounce">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white/50 group-hover:text-white/90 stroke-current group-hover:scale-110 transition-all duration-300"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
            >
              <polyline points="4 8 12 16 20 8" />
            </svg>
          </div>
        </button>
      </div>

      {/* 4 Overlapping Blue Stars with White Stroke & Cursor Parallax */}
      <motion.div
        style={{ x: smoothMouseX, y: smoothMouseY }}
        className="absolute bottom-14 sm:bottom-16 md:bottom-20 right-10 sm:right-16 md:right-20 lg:right-24 z-20 flex items-center select-none pointer-events-auto"
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="star-flicker-item relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 -ml-16 sm:-ml-19 md:-ml-22 first:ml-0 transition-transform duration-200 hover:scale-115 hover:-translate-y-2 hover:z-30 cursor-pointer"
            style={{
              zIndex: index + 1,
              animationDelay: `${index * 0.16}s`,
            }}
          >
            {/* White outer stroke layer */}
            <div
              className="absolute inset-0 scale-105"
              style={{
                backgroundColor: "#ffffff",
                maskImage: `url(${starImg.src})`,
                WebkitMaskImage: `url(${starImg.src})`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))",
              }}
            />
            {/* Deep Blue (#0000bd) inner star layer */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#0000bd",
                maskImage: `url(${starImg.src})`,
                WebkitMaskImage: `url(${starImg.src})`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
