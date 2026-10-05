"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import starImg from "@/assets/star.webp";

interface SongData {
  title: string;
  videoSrc?: string;   // path ke file lokal di /public/videos/
  bpm?: number;
  startTime?: number;  // detik awal pemutaran
}

const songDataList: SongData[] = [
  { title: "Arteri",  videoSrc: "/videos/arteri.mp4", bpm: 182 },
  { title: "Gravits", videoSrc: "/videos/gravits.mp4", bpm: 151.2 },
  { title: "Bayangkan jika kita tidak menyerah", videoSrc: "/videos/bayangkan.mp4", bpm: 144, startTime: 129 },
  { title: "Telenovia", videoSrc: "/videos/telenovia.mp4", bpm: 161 },
  { title: "Egosentris", bpm: 128 },
  { title: "Jigsaw Falling Into Place", videoSrc: "/videos/jigsaw.mp4", bpm: 166 },
  { title: "La Novela", bpm: 118 },
];

const songItems = songDataList.map((s) => s.title);

const Prism = dynamic(() => import("@/components/Prism"), { ssr: false });
const Noise = dynamic(() => import("@/components/Noise"), { ssr: false });
const OptionWheel = dynamic(() => import("@/components/OptionWheel"), { ssr: false });

export default function Hero() {
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [isVideoSwitching, setIsVideoSwitching] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isOffscreen, setIsOffscreen] = useState(false);

  const closeTimerRef     = useRef<NodeJS.Timeout | null>(null);
  const videoFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef      = useRef<NodeJS.Timeout | null>(null); // delayed pause timer
  const glitchTimerRef    = useRef<NodeJS.Timeout | null>(null); // 5s glitch trigger timer for Gravits
  const glitchEndTimerRef = useRef<NodeJS.Timeout | null>(null); // glitch duration end timer
  const playTokenRef      = useRef(0);                            // invalidates stale async playback callbacks
  const readyHandlerRef   = useRef<(() => void) | null>(null);   // pending canplay listener

  // Single video element + Web Audio
  const videoRef       = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const gainRef        = useRef<GainNode | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const sourceRef      = useRef<MediaElementAudioSourceNode | null>(null);
  const currentSrcRef  = useRef<string>("");
  const sectionRef     = useRef<HTMLElement | null>(null);
  const isVisibleRef   = useRef<boolean>(true);

  const currentSong = songDataList[selectedSongIdx];
  const currentBpm = currentSong?.bpm ?? 182;
  // 60 / BPM = duration per beat in seconds (e.g. 182 BPM = 0.3297s, 151.2 BPM = 0.3968s)
  const beatDurationSeconds = (60 / currentBpm).toFixed(4);

  const { scrollY } = useScroll();
  const yParallax  = useTransform(scrollY, [0, 500], [0, -160]);
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0.05]);

  /* ── Viewport Offscreen Detection: shuts down Prism WebGL, Noise & audio when scrolled past ── */
  useEffect(() => {
    const checkOffscreen = () => {
      const heroH = sectionRef.current?.offsetHeight || window.innerHeight;
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const off = currentScroll >= heroH;
      setIsOffscreen((prev) => (prev !== off ? off : prev));
      isVisibleRef.current = !off;
    };

    checkOffscreen();
    window.addEventListener("scroll", checkOffscreen, { passive: true });
    window.addEventListener("resize", checkOffscreen, { passive: true });

    const unsub = scrollY.on("change", (latest) => {
      const heroH = sectionRef.current?.offsetHeight || window.innerHeight;
      const off = latest >= heroH;
      setIsOffscreen((prev) => (prev !== off ? off : prev));
      isVisibleRef.current = !off;
    });

    return () => {
      window.removeEventListener("scroll", checkOffscreen);
      window.removeEventListener("resize", checkOffscreen);
      unsub();
    };
  }, [scrollY]);

  /* ── Stop/pause video & audio when offscreen, resume when back in view ── */
  useEffect(() => {
    if (isOffscreen) {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
      if (audioCtxRef.current?.state === "running") {
        audioCtxRef.current.suspend().catch(() => {});
      }
      setIsPlaying(false);
      clearPending();
    } else {
      if (isWheelOpen && videoRef.current && currentSong?.videoSrc) {
        resumeCtx();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [isOffscreen, isWheelOpen, currentSong?.videoSrc]);

  /* ── Web Audio helpers ───────────────────────────────── */
  const ensureAudioCtx = () => {
    if (audioCtxRef.current) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0.85;
    gain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    gainRef.current = gain;
  };

  const connectSource = () => {
    const video = videoRef.current;
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!video || !ctx || !gain || sourceRef.current) return;
    try {
      const src = ctx.createMediaElementSource(video);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      src.connect(analyser);
      analyser.connect(gain);
      sourceRef.current = src;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);
    } catch {}
  };

  const resumeCtx = () => {
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  /* ── Volume fade via native Web Audio scheduling (zero JS CPU) ── */
  const fadeGain = (target: number, ms: number) => {
    const gain = gainRef.current;
    const ctx = audioCtxRef.current;
    if (gain && ctx && sourceRef.current) {
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(target, now + ms / 1000);
      } catch {
        gain.gain.value = target;
      }
    } else if (videoRef.current) {
      // Fallback when Web Audio graph isn't connected
      videoRef.current.volume = Math.max(0, Math.min(1, target));
    }
  };

  const clearPending = () => {
    if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
    if (glitchTimerRef.current) { clearTimeout(glitchTimerRef.current); glitchTimerRef.current = null; }
    if (glitchEndTimerRef.current) { clearTimeout(glitchEndTimerRef.current); glitchEndTimerRef.current = null; }
    setIsGlitching(false);
    const video = videoRef.current;
    if (video && readyHandlerRef.current) {
      video.removeEventListener("canplay", readyHandlerRef.current);
      readyHandlerRef.current = null;
    }
  };

  /* Try unmuted play; retry on AbortError; fall back to muted + unmute on first gesture */
  const startPlayback = (video: HTMLVideoElement, fadeDur: number, token: number, startAt = 0) => {
    try { video.currentTime = startAt; } catch {}
    const onOk = () => {
      if (token !== playTokenRef.current) return;
      setIsPlaying(true);
      resumeCtx();
      fadeGain(0.85, fadeDur);
    };
    const tryPlay = (retries: number) => {
      if (token !== playTokenRef.current) return;
      video.muted = false;
      resumeCtx();
      video.play().then(onOk).catch((err: { name?: string }) => {
        if (token !== playTokenRef.current) return;
        if (err?.name === "AbortError" && retries > 0) {
          setTimeout(() => tryPlay(retries - 1), 80);
          return;
        }
        video.muted = true;
        video.play()
          .then(() => {
            if (token !== playTokenRef.current) return;
            setIsPlaying(true);
            const unmute = () => {
              if (token !== playTokenRef.current) return;
              resumeCtx();
              video.muted = false;
              fadeGain(0.85, 300);
            };
            window.addEventListener("pointerdown", unmute, { once: true, passive: true });
          })
          .catch(() => { if (token === playTokenRef.current) setIsPlaying(false); });
      });
    };
    tryPlay(2);
  };

  /* ── Playback ────────────────────────────────────────── */
  const playSong = (song: SongData, fadeDur = 500) => {
    const video = videoRef.current;
    if (!song?.videoSrc || !video || !isVisibleRef.current) return;

    const token = ++playTokenRef.current;
    clearPending();

    ensureAudioCtx();
    connectSource();
    resumeCtx();

    // Trigger fast screen glitch, slicing & invert 4.7s after Gravits playback starts (0.7s duration)
    if (song.title.toLowerCase() === "gravits") {
      glitchTimerRef.current = setTimeout(() => {
        if (token !== playTokenRef.current) return;
        setIsGlitching(true);
        glitchEndTimerRef.current = setTimeout(() => {
          setIsGlitching(false);
        }, 700);
      }, 4700);
    }

    if (currentSrcRef.current !== song.videoSrc) {
      currentSrcRef.current = song.videoSrc;
      setVideoReady(false);
      video.src = song.videoSrc;
      video.load();

      const onReady = () => {
        video.removeEventListener("canplay", onReady);
        if (readyHandlerRef.current === onReady) readyHandlerRef.current = null;
        if (token !== playTokenRef.current) return;
        setVideoReady(true);
        startPlayback(video, fadeDur, token, song.startTime ?? 0);
      };
      if (video.readyState >= 3) {
        onReady();
      } else {
        readyHandlerRef.current = onReady;
        video.addEventListener("canplay", onReady);
      }
    } else {
      setVideoReady(true);
      startPlayback(video, fadeDur, token, song.startTime ?? 0);
    }
  };

  const stopSong = (fadeDur = 400, onDone?: () => void) => {
    ++playTokenRef.current;
    clearPending();
    setIsPlaying(false);
    fadeGain(0, fadeDur);
    const token = playTokenRef.current;
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      if (token !== playTokenRef.current) return;
      const video = videoRef.current;
      if (video) {
        video.pause();
        try { video.currentTime = 0; } catch {}
      }
      setVideoReady(false);
      onDone?.();
    }, fadeDur);
  };

  /* ── Lifecycle: unlock audio context on first gesture + preload first video ── */
  useEffect(() => {
    const unlock = () => {
      ensureAudioCtx();
      resumeCtx();
      connectSource();
      const video = videoRef.current;
      const first = songDataList.find((s) => s.videoSrc);
      if (video && first?.videoSrc && !currentSrcRef.current) {
        currentSrcRef.current = first.videoSrc;
        video.src = first.videoSrc;
        video.load();
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, []);

  /* ── Event handlers ──────────────────────────────────── */
  const handleMouseEnter = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    ensureAudioCtx();
    resumeCtx();
    connectSource();
    setIsWheelOpen(true);
    playSong(currentSong);
  };

  const handleMouseLeave = () => {
    stopSong();
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsWheelOpen(false), 450);
  };

  const toggleWheel = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    ensureAudioCtx();
    resumeCtx();
    connectSource();
    const next = !isWheelOpen;
    setIsWheelOpen(next);
    if (next) playSong(currentSong);
    else      stopSong();
  };

  const handleSongChange = (index: number) => {
    setSelectedSongIdx(index);
    const newSong = songDataList[index];
    setIsVideoSwitching(true);
    if (videoFadeTimerRef.current) clearTimeout(videoFadeTimerRef.current);

    if (newSong?.videoSrc) {
      stopSong(200, () => {
        playSong(newSong, 400);
        videoFadeTimerRef.current = setTimeout(() => setIsVideoSwitching(false), 150);
      });
    } else {
      stopSong(300);
      videoFadeTimerRef.current = setTimeout(() => setIsVideoSwitching(false), 150);
    }
  };

  // Mouse cursor parallax for stars
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isOffscreen) return;
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX - innerWidth  * 0.5) / (innerWidth  * 0.5);
      const ny = (e.clientY - innerHeight * 0.5) / (innerHeight * 0.5);
      mouseX.set(nx * 20);
      mouseY.set(ny * 16);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isOffscreen]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="sticky top-0 w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden z-0"
    >
      {/* Full-screen negative (inverted colors) strobe during glitch */}
      {isGlitching && !isOffscreen && <div className="glitch-negative-flash" aria-hidden="true" />}

      {/* Convex blurry side screens (hidden when offscreen to free GPU compositor) */}
      <div className={`hero-side-bulge left ${isGlitching ? "screen-glitch-active" : ""} ${isOffscreen ? "hidden" : ""}`} aria-hidden="true" />
      <div className={`hero-side-bulge right ${isGlitching ? "screen-glitch-active" : ""} ${isOffscreen ? "hidden" : ""}`} aria-hidden="true" />

      {/* Centered Boxed Canvas with Left and Right borders */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-transform ${
        isGlitching ? "screen-glitch-active" : ""
      } ${isOffscreen ? "invisible opacity-0" : ""}`} aria-hidden={isOffscreen}>
        <div className="relative w-full max-w-5xl h-full border-x border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 overflow-hidden pointer-events-auto">
          {/* Rapid Glitch Scanline Burst & Slicing Overlays */}
          {isGlitching && !isOffscreen && (
            <>
              <div className="glitch-overlay-flash" aria-hidden="true" />
              <div className="glitch-slice-container" aria-hidden="true">
                <div className="glitch-slice-bar-1" />
                <div className="glitch-slice-bar-2" />
                <div className="glitch-slice-bar-3" />
                <div className="glitch-slice-bar-4" />
                <div className="glitch-slice-bar-5" />
                <div className="glitch-slice-bar-6" />
              </div>
            </>
          )}

          {/* Prism WebGL canvas (invert color strobe during glitch) */}
          <div className={`absolute inset-0 w-full h-full ${isGlitching ? "prism-glitch-invert" : ""}`}>
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
              suspendWhenOffscreen={true}
              paused={isOffscreen}
            />
          </div>

          {/* Single video element — canplay-gated, no multi-element overhead */}
          <div
            className={`prism-video-ambient transition-opacity duration-500 ease-in-out ${
              !isOffscreen && isWheelOpen && videoReady && currentSong?.videoSrc && !isVideoSwitching
                ? "opacity-40"
                : "opacity-0 pointer-events-none"
            }`}
            style={{ mixBlendMode: "screen", transform: "translateZ(0)" }}
          >
            <video
              ref={videoRef}
              loop
              playsInline
              preload="auto"
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
              paused={isOffscreen}
            />
          </div>
        </div>
      </div>

      {/* Music icon + OptionWheel */}
      <motion.div
        style={{ y: yParallax, opacity: textOpacity }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute left-3 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center ${isOffscreen ? "pointer-events-none invisible" : ""}`}
      >
        <button
          type="button"
          onClick={toggleWheel}
          aria-label="Toggle song list"
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white/80 backdrop-blur-md flex items-center justify-center cursor-pointer shadow-sm transition-all duration-300 ${
            isWheelOpen
              ? "text-white dark:text-white light:text-neutral-900 border-neutral-400 dark:border-neutral-400 light:border-neutral-500 bg-neutral-800/80 dark:bg-neutral-800/80 light:bg-neutral-200/90 scale-105"
              : "text-neutral-400 dark:text-neutral-400 light:text-neutral-600 border-neutral-700/60 dark:border-neutral-700/60 light:border-neutral-300 hover:text-white dark:hover:text-white light:hover:text-black hover:border-neutral-400 dark:hover:border-neutral-400 light:hover:border-neutral-600 hover:bg-neutral-800/80 dark:hover:bg-neutral-800/80 light:hover:bg-neutral-100"
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
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
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 pointer-events-auto ${
        isGlitching ? "screen-glitch-active" : ""
      }`}>
        <div className="w-full flex items-center justify-between gap-4">
          <motion.h1
            style={
              {
                y: yParallax,
                opacity: textOpacity,
                "--beat-duration": `${beatDurationSeconds}s`,
              } as unknown as React.CSSProperties
            }
            className={`font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase shrink-0 transition-transform origin-left ${
              isPlaying ? "beat-text-pulse" : ""
            }`}
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
            style={
              {
                y: yParallax,
                opacity: textOpacity,
                "--beat-duration": `${beatDurationSeconds}s`,
              } as unknown as React.CSSProperties
            }
            className={`font-narrow text-5xl sm:text-7xl font-normal italic tracking-tight text-neutral-100 lowercase text-right shrink-0 transition-transform origin-right ${
              isPlaying ? "beat-text-pulse" : ""
            }`}
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



      {/* 4 Overlapping Blue Stars */}
      <motion.div
        style={{ x: smoothMouseX, y: smoothMouseY }}
        className={`absolute bottom-14 sm:bottom-16 md:bottom-20 right-10 sm:right-16 md:right-20 lg:right-24 z-20 flex items-center select-none ${isOffscreen ? "pointer-events-none invisible" : "pointer-events-auto"}`}
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
