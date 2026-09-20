"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";

/* =========================================================================
   STRICT FONT COMPLIANCE:
   Only EB Garamond (font-serif), Poppins (font-sans), and Arial Narrow (font-narrow).
   No other fonts are allowed.
   ========================================================================= */

// Staggered Flicker-In Entrance Component for Text
function FlickerInText({
  text,
  className = "",
  delay = 0,
  as: Component = "span",
  by = "char",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "p" | "h2" | "h3" | "div";
  by?: "char" | "word";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });

  if (by === "word") {
    const words = text.split(" ");
    return (
      <Component ref={ref as React.Ref<any>} className={`flicker-container ${className}`}>
        {words.map((word, wIdx) => {
          const wordDelay = delay + wIdx * 0.07;
          return (
            <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
              <span
                className={
                  isInView
                    ? "footer-flicker-active inline-block"
                    : "opacity-0 inline-block"
                }
                style={isInView ? { animationDelay: `${wordDelay}s` } : undefined}
              >
                {word}
              </span>
            </span>
          );
        })}
      </Component>
    );
  }

  // Character by character flicker
  const chars = text.split("");
  return (
    <Component ref={ref as React.Ref<any>} className={`flicker-container ${className}`}>
      {chars.map((char, cIdx) => {
        if (char === " ") {
          return <span key={cIdx}> </span>;
        }
        const charDelay = delay + cIdx * 0.02 + ((cIdx % 4) * 0.01);
        return (
          <span
            key={cIdx}
            className={
              isInView
                ? "footer-flicker-active inline-block relative"
                : "opacity-0 inline-block relative"
            }
            style={
              isInView
                ? {
                    animationDelay: `${charDelay}s`,
                    animationDuration: "0.65s",
                  }
                : undefined
            }
          >
            {char}
          </span>
        );
      })}
    </Component>
  );
}

export default function Footer() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Live real-time clock (Jakarta / WIB time: UTC+7)
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);
        setCurrentTime(formatted);
      } catch {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString("en-US"));
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tickerItems = [
    "OPEN FOR COLLABORATION",
    "FRONTEND & INTERACTIVE DEV",
    "RAFI MAULANA",
    "BASED IN INDONESIA",
    "AVAILABLE FOR FREELANCE & FULLTIME",
    "WEB ARCHITECTURE & DESIGN",
  ];

  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden border-t border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 bg-neutral-950 dark:bg-neutral-950 light:bg-neutral-50 transition-colors duration-300"
    >
      {/* ── TOP INFINITE MARQUEE TICKER TAPE ──────────────────────── */}
      <div className="relative w-full border-b border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 py-3 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-neutral-100/60 overflow-hidden select-none">
        <div className="animate-footer-marquee flex items-center whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map(
            (item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-4">
                <span className="font-narrow text-xs tracking-widest text-neutral-400 dark:text-neutral-400 light:text-neutral-600 uppercase font-medium">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            )
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 pt-14 pb-12">
        {/* Top Status & Live Clock Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            </span>
            <span className="font-narrow text-xs sm:text-sm tracking-wide text-neutral-300 dark:text-neutral-300 light:text-neutral-700 uppercase font-medium">
              <FlickerInText text="Available for new opportunities" delay={0.05} />
            </span>
          </div>

          <div className="flex items-center gap-2 font-narrow text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
            <span className="text-neutral-500 font-medium">JAKARTA, ID</span>
            <span>•</span>
            <span className="tabular-nums font-narrow tracking-wider text-neutral-200 dark:text-neutral-200 light:text-neutral-800 font-semibold">
              {currentTime || "00:00:00 AM"}
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">[WIB / UTC+7]</span>
          </div>
        </div>

        {/* Big Editorial Headline with Character Flicker Entrance */}
        <div className="py-12 sm:py-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-narrow text-xs text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950/20">
                <FlickerInText text="[ GET IN TOUCH ]" delay={0.1} by="word" />
              </span>
            </div>

            <h2 className="font-serif italic text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-neutral-100 dark:text-neutral-100 light:text-neutral-900 leading-[1.08] max-w-3xl">
              <span className="shaky-retro-text">
                <FlickerInText
                  text="Let's build something extraordinary together."
                  delay={0.15}
                />
              </span>
            </h2>

            <p className="font-narrow text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-neutral-600 max-w-xl mt-2 leading-relaxed">
              <FlickerInText
                text="Have a concept in mind, an engineering problem to solve, or just want to chat about web technology? Feel free to reach out anytime."
                delay={0.3}
                by="word"
              />
            </p>
          </div>
        </div>

        {/* ── INTERACTIVE COLORED CONTACT & SOCIAL CARDS ─────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-2 pb-14">
          {/* 1. GMAIL (PROMINENT OFFICIAL 4-COLOR) */}
          <div className="group relative rounded-2xl p-5 border border-neutral-800/90 dark:border-neutral-800/90 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-[0_10px_30px_rgba(234,67,53,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Official Google Mail 4-Color Icon */}
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 dark:bg-neutral-800/80 light:bg-neutral-100 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <path
                      d="M22 6.5V17.5C22 18.88 20.88 20 19.5 20H17.5V11L12 15L6.5 11V20H4.5C3.12 20 2 18.88 2 17.5V6.5C2 5.12 3.12 4 4.5 4H5L12 9.5L19 4H19.5C20.88 4 22 5.12 22 6.5Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M2 6.5C2 5.12 3.12 4 4.5 4H5L12 9.5L6.5 14L2 10.5V6.5Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M22 6.5C22 5.12 20.88 4 19.5 4H19L12 9.5L17.5 14L22 10.5V6.5Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M2 10.5L6.5 14V20H4.5C3.12 20 2 18.88 2 17.5V10.5Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M22 10.5L17.5 14V20H19.5C20.88 20 22 18.88 22 17.5V10.5Z"
                      fill="#34A853"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold">
                    Gmail
                  </h3>
                  <p className="font-narrow text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-medium select-all">
                    rafimaulanaf03@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-100">
              <button
                type="button"
                onClick={() => handleCopy("email", "rafimaulanaf03@gmail.com")}
                className="font-narrow text-xs px-2.5 py-1.5 rounded-lg bg-neutral-800/70 hover:bg-neutral-700/80 dark:bg-neutral-800/70 dark:hover:bg-neutral-700/80 light:bg-neutral-100 light:hover:bg-neutral-200 text-neutral-200 dark:text-neutral-200 light:text-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "email" ? (
                  <>
                    <span className="text-emerald-400">✓</span>
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href="mailto:rafimaulanaf03@gmail.com"
                className="font-narrow text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1 ml-auto"
              >
                <span>Compose</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* 2. LINKEDIN (OFFICIAL BLUE) */}
          <Link
            href="https://linkedin.com/in/rafimlnf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 border border-neutral-800/90 dark:border-neutral-800/90 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#0A66C2]/60 hover:shadow-[0_10px_30px_rgba(10,102,194,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/15 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0A66C2">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold">
                    LinkedIn
                  </h3>
                  <p className="font-narrow text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-medium">
                    in/rafimlnf
                  </p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-[#0A66C2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                ↗
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-100">
              <span className="font-narrow text-xs text-neutral-400">Professional Network</span>
              <span className="font-narrow text-xs text-[#0A66C2] group-hover:underline">Connect</span>
            </div>
          </Link>

          {/* 3. GITHUB (VIBRANT GRADIENT BADGE) */}
          <Link
            href="https://github.com/rafimlnf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 border border-neutral-800/90 dark:border-neutral-800/90 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <defs>
                      <linearGradient id="gh-footer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#gh-footer-grad)"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold">
                    GitHub
                  </h3>
                  <p className="font-narrow text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-medium">
                    github.com/rafimlnf
                  </p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                ↗
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-100">
              <span className="font-narrow text-xs text-neutral-400">Open Source & Repos</span>
              <span className="font-narrow text-xs text-purple-400 group-hover:underline">Explore</span>
            </div>
          </Link>

          {/* 4. INSTAGRAM (VIBRANT SUNSET GRADIENT) */}
          <Link
            href="https://instagram.com/rafimlnf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 border border-neutral-800/90 dark:border-neutral-800/90 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#e1306c]/50 hover:shadow-[0_10px_30px_rgba(225,48,108,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <defs>
                      <radialGradient id="ig-footer-grad" cx="20%" cy="105%" r="130%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="5%" stopColor="#fdf497" />
                        <stop offset="45%" stopColor="#fd5949" />
                        <stop offset="60%" stopColor="#d6249f" />
                        <stop offset="90%" stopColor="#285AEB" />
                      </radialGradient>
                    </defs>
                    <path
                      fill="url(#ig-footer-grad)"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold">
                    Instagram
                  </h3>
                  <p className="font-narrow text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-medium">
                    @rafimlnf
                  </p>
                </div>
              </div>
              <span className="text-neutral-500 group-hover:text-pink-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                ↗
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-100">
              <span className="font-narrow text-xs text-neutral-400">Visuals & Life</span>
              <span className="font-narrow text-xs text-pink-400 group-hover:underline">Follow</span>
            </div>
          </Link>

          {/* 5. DISCORD (OFFICIAL BLURPLE) */}
          <div className="group relative rounded-2xl p-5 border border-neutral-800/90 dark:border-neutral-800/90 light:border-neutral-200 bg-neutral-900/40 dark:bg-neutral-900/40 light:bg-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#5865F2]/60 hover:shadow-[0_10px_30px_rgba(88,101,242,0.15)] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold">
                    Discord
                  </h3>
                  <p className="font-narrow text-sm text-neutral-100 dark:text-neutral-100 light:text-neutral-900 font-medium">
                    xenithgg
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/50 dark:border-neutral-800/50 light:border-neutral-100">
              <span className="font-narrow text-xs text-neutral-400">Direct Chat</span>
              <button
                type="button"
                onClick={() => handleCopy("discord", "xenithgg")}
                className="font-narrow text-xs px-2 py-1 rounded bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors cursor-pointer"
              >
                {copiedKey === "discord" ? "Copied! ✓" : "Copy Tag"}
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM CREDITS & SCROLL TO TOP ─────────────────────── */}
        <div className="pt-8 border-t border-neutral-800/80 dark:border-neutral-800/80 light:border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 text-center sm:text-left">
            <span className="font-narrow text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              © {new Date().getFullYear()} Rafi Maulana. All rights reserved.
            </span>
            <span className="hidden sm:inline text-neutral-700 dark:text-neutral-700 light:text-neutral-300">
              |
            </span>
            <span className="font-narrow text-xs text-neutral-500 dark:text-neutral-500 light:text-neutral-500">
              Crafted with Next.js, Tailwind CSS & Motion
            </span>
          </div>

          {/* Interactive Back to Top Capsule Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700/60 dark:border-neutral-700/60 light:border-neutral-300 bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white dark:hover:text-white light:hover:text-black hover:border-neutral-500 dark:hover:border-neutral-500 light:hover:border-neutral-400 transition-all duration-300 shadow-sm cursor-pointer"
            aria-label="Back to top of page"
          >
            <span className="font-narrow text-xs uppercase tracking-wider">Back to Top</span>
            <span className="w-5 h-5 rounded-full bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-100 flex items-center justify-center text-xs group-hover:-translate-y-0.5 transition-transform duration-200">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
