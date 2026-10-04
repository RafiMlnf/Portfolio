"use client";

import { useEffect, useRef } from "react";

interface BeatGridProps {
  isPlaying: boolean;
  bpm?: number;
  className?: string;
}

interface VerticalBeatLine {
  id: number;
  x: number;
  vx: number;
  age: number;
  lifespan: number;
  maxAlpha: number;
  tickY?: number;
}

export default function BeatGrid({
  isPlaying,
  bpm = 182,
  className = "",
}: BeatGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const linesRef = useRef<VerticalBeatLine[]>([]);
  const nextIdRef = useRef<number>(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // 1 Beat = 1 Vertical Line covering the entire screen height
    const spawnVerticalLine = () => {
      // Confined to the left region of the hero screen
      const maxLeftArea = Math.min(width * 0.35, 340);
      const minLeftArea = 16;

      const randomX = Math.floor(minLeftArea + Math.random() * Math.max(10, maxLeftArea - minLeftArea));
      // Drift randomly to the left or to the right
      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = 0.35 + Math.random() * 0.65;
      const vx = direction * speed;

      // Optional subtle architectural tick notch on the vertical line
      const tickY = Math.random() > 0.4 ? Math.floor(height * 0.25 + Math.random() * (height * 0.5)) : undefined;

      linesRef.current.push({
        id: nextIdRef.current++,
        x: randomX,
        vx,
        age: 0,
        lifespan: Math.floor(55 + Math.random() * 30), // ~0.9s - 1.4s at 60fps
        maxAlpha: 0.6 + Math.random() * 0.3,
        tickY,
      });

      // Keep maximum 16 concurrent lines
      if (linesRef.current.length > 16) {
        linesRef.current.shift();
      }
    };

    const isLightMode = () => document.documentElement.classList.contains("light");

    const beatIntervalMs = (60 / Math.max(40, bpm)) * 1000;
    let lastTime = performance.now();
    let lastBeatTime = performance.now();

    // Trigger immediate first line on start
    if (isPlaying) {
      spawnVerticalLine();
    }

    const loop = (currentTime: number) => {
      const dt = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // ── BPM-driven Beat Timing: 1 Beat = 1 Vertical Line ──
      if (isPlaying) {
        if (currentTime - lastBeatTime >= beatIntervalMs) {
          lastBeatTime = currentTime;
          spawnVerticalLine();
        }
      }

      // ── Render & Update Vertical Lines ──
      const light = isLightMode();
      const baseR = light ? 20 : 255;
      const baseG = light ? 20 : 255;
      const baseB = light ? 20 : 255;

      const activeLines: VerticalBeatLine[] = [];

      for (let i = 0; i < linesRef.current.length; i++) {
        const line = linesRef.current[i];
        const step = dt / 16.666;
        line.age += step;

        if (line.age < line.lifespan) {
          // Movement: drift smoothly to the right
          line.x += line.vx * step;

          // Fade profile: fast fade in, smooth exponential decay to 0
          const progress = line.age / line.lifespan;
          let alpha = 0;
          if (progress < 0.12) {
            alpha = (progress / 0.12) * line.maxAlpha;
          } else {
            const decay = (progress - 0.12) / 0.88;
            alpha = line.maxAlpha * Math.pow(1 - decay, 1.6);
          }

          // Crisp 1px hairline rendering via 0.5px snapping
          const snapX = Math.round(line.x) + 0.5;

          ctx.save();
          ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.85; // ultra-thin vertical line

          // 1 Single Vertical Line spanning the entire height of the screen
          ctx.beginPath();
          ctx.moveTo(snapX, 0);
          ctx.lineTo(snapX, height);
          ctx.stroke();

          // Small architectural horizontal tick notch
          if (line.tickY !== undefined) {
            const tickW = 4;
            ctx.beginPath();
            ctx.moveTo(snapX - tickW, line.tickY);
            ctx.lineTo(snapX + tickW, line.tickY);
            ctx.stroke();
          }

          ctx.restore();

          activeLines.push(line);
        }
      }

      linesRef.current = activeLines;

      if (isPlaying || linesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = 0;
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      lastBeatTime = performance.now();
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isPlaying, bpm]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-20 w-full h-full ${className}`}
      style={{ willChange: "transform" }}
    />
  );
}
