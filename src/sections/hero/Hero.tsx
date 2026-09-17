"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import starImg from "@/assets/star.png";
import OptionWheel from "@/components/OptionWheel";

interface SongData {
  title: string;
  videoSrc?: string;   // path ke file lokal di /public/videos/
  startSeconds?: number;
}

const songDataList: SongData[] = [
  { title: "Arteri",  videoSrc: "/videos/arteri.mp4",  startSeconds: 231 },
  { title: "Gravits", videoSrc: "/videos/gravits.mp4", startSeconds: 188 },
  { title: "Tek It" },
  { title: "Telenovia" },
  { title: "Egosentris" },
  { title: "Jigsaw Falling Into Place" },
  { title: "La Novela" },
];

const songItems = songDataList.map((s) => s.title);

const Prism = dynamic(() => import("@/components/Prism"), { ssr: false });
const Noise = dynamic(() => import("@/components/Noise"), { ssr: false });

export default function Hero() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [isVideoSwitching, setIsVideoSwitching] = useState(false);

  const closeTimerRef     = useRef<NodeJS.Timeout | null>(null);
  const videoFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeRafRef        = useRef<number | null>(null);

  // HTML5 video & Web Audio
  const videoRef      = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const gainRef       = useRef<GainNode | null>(null);
  const sourceRef     = useRef<MediaElementAudioSourceNode | null>(null);

  const currentSong = songDataList[selectedSongIdx];

  // Inisialisasi Web Audio API untuk smooth volume fade
  const ensureAudioCtx = () => {
    if (audioCtxRef.current) return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainRef.current     = gain;
  };

  const connectVideoToAudio = () => {
    const ctx   = audioCtxRef.current;
    const gain  = gainRef.current;
    const video = videoRef.current;
    if (!ctx || !gain || !video) return;
    // Sambungkan source ke gain hanya sekali
    if (!sourceRef.current) {
      const src = ctx.createMediaElementSource(video);
      src.connect(gain);
      sourceRef.current = src;
    }
    if (ctx.state === "suspended") ctx.resume();
  };

  // Smooth sinusoidal volume fade menggunakan Web Audio scheduledValue
  const fadeGain = (targetVal: number, durationMs: number, onComplete?: () => void) => {
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
    const gain = gainRef.current;
    if (!gain) { onComplete?.(); return; }

    const startVal  = gain.gain.value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easing cosine (S-curve nyaman di telinga)
      const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      gain.gain.value = startVal + (targetVal - startVal) * ease;

      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(tick);
      } else {
        gain.gain.value = targetVal;
        fadeRafRef.current = null;
        onComplete?.();
      }
    };

    fadeRafRef.current = requestAnimationFrame(tick);
  };

  const playWithFadeIn = (song: SongData, durationMs = 1000) => {
    if (!song?.videoSrc) return;
    const video = videoRef.current;
    if (!video) return;

    ensureAudioCtx();
    connectVideoToAudio();

    // Ganti src hanya jika berbeda
    const newSrc = song.videoSrc;
    if (video.src !== window.location.origin + newSrc) {
      video.src = newSrc;
      video.currentTime = song.startSeconds ?? 0;
    }

    video.muted = false;
    video.play().catch(() => {});
    fadeGain(0.85, durationMs);
  };

  const stopWithFadeOut = (durationMs = 600, onDone?: () => void) => {
    fadeGain(0, durationMs, () => {
      videoRef.current?.pause();
      onDone?.();
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setIsWheelOpen(true);
    playWithFadeIn(currentSong);
  };

  const handleMouseLeave = () => {
    stopWithFadeOut();
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsWheelOpen(false), 450);
  };

  const toggleWheel = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setIsWheelOpen((prev) => {
      const next = !prev;
      if (next) playWithFadeIn(currentSong);
      else      stopWithFadeOut();
      return next;
    });
  };

  const handleSongChange = (index: number) => {
    setSelectedSongIdx(index);
    const newSong = songDataList[index];

    setIsVideoSwitching(true);
    if (videoFadeTimerRef.current) clearTimeout(videoFadeTimerRef.current);

    if (newSong?.videoSrc) {
      stopWithFadeOut(350, () => {
        playWithFadeIn(newSong, 1000);
        videoFadeTimerRef.current = setTimeout(() => setIsVideoSwitching(false), 300);
      });
    } else {
      stopWithFadeOut(500);
      videoFadeTimerRef.current = setTimeout(() => setIsVideoSwitching(false), 300);
    }
  };

  // Mouse cursor parallax for stars
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();
  const yParallax  = useTransform(scrollY, [0, 500], [0, -160]);
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0.05]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX - innerWidth  * 0.5) / (innerWidth  * 0.5);
      const ny = (e.clientY - innerHeight * 0.5) / (innerHeight * 0.5);
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
    document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="sticky top-0 w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden z-0"
    >
      {/* Centered Boxed Canvas with Left and Right borders */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-5xl h-full border-x border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 overflow-hidden pointer-events-auto">
          {/* Prism WebGL canvas */}
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

          {/* HTML5 Video Ambient Overlay — no controls, no YouTube UI */}
          <div
            className={`prism-video-ambient transition-all duration-700 ease-in-out ${
              isWheelOpen && currentSong?.videoSrc && !isVideoSwitching
                ? "opacity-40 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            style={{ mixBlendMode: "screen" }}
          >
            <video
              ref={videoRef}
              loop
              muted        /* muted attr agar browser izinkan autoplay; audio dihandle via Web Audio */
              playsInline
              preload="none"
              className="prism-video-el"
            />
          </div>

          {/* Noise overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-10">
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

      {/* Music icon + OptionWheel */}
      <motion.div
        style={{ y: yParallax, opacity: textOpacity }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="absolute left-3 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center"
      >
        <button
          type="button"
          onClick={toggleWheel}
          aria-label="Toggle song list"
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border bg-neutral-900/60 backdrop-blur-md flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300 ${
            isWheelOpen
              ? "text-white border-neutral-400 bg-neutral-800/80 scale-105"
              : "text-neutral-400 border-neutral-700/60 hover:text-white hover:border-neutral-400 hover:bg-neutral-800/80"
          }`}
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </button>

        <div
          className={`absolute left-8 sm:left-10 top-1/2 -translate-y-1/2 w-[200px] sm:w-[230px] md:w-[270px] font-narrow transition-all duration-300 ease-out flex flex-col ${
            isWheelOpen
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
        >
          <div className="w-full h-64 sm:h-72 relative overflow-hidden">
            <OptionWheel
              items={songItems}
              defaultSelected={selectedSongIdx}
              textColor="#777777"
              activeColor="#ffffff"
              side="left"
              fontSize={1.1}
              spacing={1.35}
              curve={0.8}
              tilt={5}
              blur={1.8}
              fade={0.28}
              smoothing={110}
              inset={8}
              loop={false}
              draggable
              onChange={handleSongChange}
            />
          </div>
        </div>
      </motion.div>

      {/* Main title */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 pointer-events-auto">
        <div className="w-full flex items-center justify-between gap-4">
          <motion.h1
            style={{ y: yParallax, opacity: textOpacity }}
            className="font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase shrink-0"
          >
            <span className="shaky-retro-text flicker-container">
              {"portfolio".split("").map((char, cIdx) => {
                const duration = 3.6 + (cIdx % 5) * 0.22;
                const delay    = ((cIdx * 7) % 11) * 0.18;
                return (
                  <span
                    key={cIdx}
                    className="flicker-char"
                    style={{ "--flicker-duration": `${duration}s`, "--flicker-delay": `${delay}s` } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </motion.h1>

          <motion.span
            style={{ y: yParallax, opacity: textOpacity }}
            className="font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase text-right shrink-0"
          >
            <span className="shaky-retro-text flicker-container">
              {"rafi".split("").map((char, cIdx) => {
                const duration = 3.8 + (cIdx % 4) * 0.25;
                const delay    = 0.3 + (cIdx % 3) * 0.28;
                return (
                  <span
                    key={cIdx}
                    className="flicker-char"
                    style={{ "--flicker-duration": `${duration}s`, "--flicker-delay": `${delay}s` } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </motion.span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-500 ease-out ${
          showScrollIndicator ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
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

      {/* 4 Overlapping Blue Stars */}
      <motion.div
        style={{ x: smoothMouseX, y: smoothMouseY }}
        className="absolute bottom-14 sm:bottom-16 md:bottom-20 right-10 sm:right-16 md:right-20 lg:right-24 z-20 flex items-center select-none pointer-events-auto"
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="star-flicker-item relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 -ml-16 sm:-ml-19 md:-ml-22 first:ml-0 transition-transform duration-200 hover:scale-115 hover:-translate-y-2 hover:z-30 cursor-pointer"
            style={{ zIndex: index + 1, animationDelay: `${index * 0.16}s` }}
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
            {/* Deep Blue inner star layer */}
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
