"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

const Noise = dynamic(() => import("@/components/Noise"), {
  ssr: false,
});

const navItems = [
  { name: "About", href: "#profile" },
  { name: "Experience", href: "#experiences" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Peripherals", href: "#peripherals" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      document.documentElement.classList.toggle("light", savedTheme === "light");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  return (
    <motion.header
      id="header"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      {/* Ultra Large Pure Optical Gradual Fading Blur Overlay */}
      <div className="absolute top-0 left-0 right-0 h-56 sm:h-72 pointer-events-none overflow-hidden">
        {/* Pure optical backdrop blur - without colored background tints */}
        <div className="absolute inset-0 backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,black_0%,black_25%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_25%,transparent_100%)]" />
        <div className="absolute inset-0 backdrop-blur-lg [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]" />
        {/* Film grain noise overlay */}
        <div className="absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]">
          <Noise
            patternSize={250}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={15}
          />
        </div>
      </div>

      <div className="relative z-10 w-full px-8 md:px-12 py-6 flex items-center justify-between pointer-events-auto">
        <nav className="hidden md:flex items-center gap-5 font-serif">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-base text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 inline-block origin-center capitalize"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 ml-auto font-serif">
          <div className="hidden md:block">
            <Link
              href="#footer"
              className="px-4 py-1.5 text-sm text-black bg-white dark:text-black dark:bg-white light:text-white light:bg-black rounded-full hover:opacity-80 transition-opacity capitalize"
            >
              Contact
            </Link>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-neutral-800/80 bg-black/20 dark:bg-black/20 light:bg-white/20 backdrop-blur-sm text-neutral-400 hover:text-foreground hover:border-neutral-600 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-neutral-400 hover:text-foreground p-2"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden relative z-10 font-serif bg-black/95 dark:bg-black/95 light:bg-white/95 border-b border-neutral-800 px-8 py-4 flex flex-col gap-4 pointer-events-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-base text-neutral-400 hover:text-white hover:translate-x-1 transition-all duration-200 text-left capitalize"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="#footer"
            onClick={() => setIsOpen(false)}
            className="w-full text-center px-4 py-2 text-sm text-black bg-white dark:text-black dark:bg-white light:text-white light:bg-black rounded-full transition-opacity capitalize"
          >
            Contact
          </Link>
        </div>
      )}
    </motion.header>
  );
}
