"use client";

import { useState } from "react";
import Link from "next/link";

const contacts = [
  {
    name: "linkedin",
    label: "rafimlnf",
    href: "https://linkedin.com/in/rafimlnf",
    isExternal: true,
  },
  {
    name: "github",
    label: "rafimlnf",
    href: "https://github.com/rafimlnf",
    isExternal: true,
  },
  {
    name: "instagram",
    label: "@rafimlnf",
    href: "https://instagram.com/rafimlnf",
    isExternal: true,
  },
  {
    name: "discord",
    label: "xenithgg",
    href: "https://discord.com/users/xenithgg",
    isExternal: false,
    copyValue: "xenithgg",
  },
];

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleDiscordClick = (e: React.MouseEvent, copyValue?: string) => {
    if (copyValue) {
      e.preventDefault();
      navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer id="footer" className="relative w-full border-t border-neutral-800/80">
      <div className="max-w-5xl mx-auto px-8 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6 font-narrow">
        <div className="flex items-center gap-2 text-sm text-neutral-400 lowercase">
          <span>contact</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300">get in touch</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {contacts.map((item) => {
            if (item.name === "discord") {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={(e) => handleDiscordClick(e, item.copyValue)}
                  className="group flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors lowercase cursor-pointer"
                  title="Click to copy Discord username"
                >
                  <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                    {item.name}:
                  </span>
                  <span className="text-neutral-200 group-hover:underline">
                    {copied ? "copied!" : item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors lowercase"
              >
                <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                  {item.name}:
                </span>
                <span className="text-neutral-200 group-hover:underline">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

