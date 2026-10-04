# Gravits Glitch Effect - Catatan & Panduan Rollback

> [!CAUTION]
> **PERINGATAN KESELAMATAN TINGGI (EPILEPSI FOTOSENSITIF / PHOTOSENSITIVITY WARNING)**
> Efek glitch ini mengaktifkan **strobe negatif & invert visual (full-screen backdrop-filter invert)** dengan frekuensi kedipan sangat tinggi (puluhan pergantian kontras/warna ekstrem hitam-putih-neon hanya dalam rentang waktu **0,7 detik**).
> 
> Secara medis dan standar web accessibility (**WCAG 2.3.1 Three Flashes or Below Threshold**), kedipan layar lebih dari **3 kali per detik** dapat memicu kejang (*seizures*), disorientasi, migrain, atau respon fotoparoksismal pada penderita **Photosensitive Epilepsy (PSE)** maupun pengguna yang rentan stimulasi visual kontras tinggi.
> 
> **Elemen Paling Berbahaya Terkait Efek Negatif / Invert:**
> 1. `.glitch-negative-flash`: Menyelimuti seluruh layar hero dengan `backdrop-filter: invert(1)` berkecepatan tinggi.
> 2. `.prism-glitch-invert`: Memutarbalikkan warna kanvas WebGL Prism secara stroboskopik.
> 3. `.glitch-overlay-flash`: Berkedip dengan warna hijau neon dan putih ter-invert.

---

### Cara Khusus Mematikan Efek Negatif / Invert Saja
*(Jika ingin tetap mempertahankan efek glitch slicing pergeseran layar, namun menghilangkan kedipan negatif ekstrem yang berbahaya bagi epilepsi)*:

1. **Hapus overlay negatif di `src/sections/hero/Hero.tsx`**:
```tsx
// Hapus baris ini:
{isGlitching && <div className="glitch-negative-flash" aria-hidden="true" />}
```

2. **Matikan invert pada Prism di `src/sections/hero/Hero.tsx`**:
```diff
- <div className={`absolute inset-0 w-full h-full ${isGlitching ? "prism-glitch-invert" : ""}`}>
+ <div className="absolute inset-0 w-full h-full">
```

3. **Matikan backdrop invert pada slice bar di `src/app/globals.css`**:
Ubah atau hapus `backdrop-filter: invert(1)` dari `.glitch-slice-bar-1` sampai `6`.

---

## Ringkasan Fitur

- **Pemicu:** Lagu **Gravits** (`song.title === "Gravits"`), saat roda lagu diputar.
- **Waktu Mulai:** Detik ke **4.7** setelah pemutaran lagu dimulai.
- **Durasi:** **0.7 detik** (700 ms).
- **Komponen Efek:**
  1. Full-screen Negative Strobe (`.glitch-negative-flash`).
  2. Canvas Prism Invert Strobe (`.prism-glitch-invert`).
  3. Horizontal Slice Cut Displacements (6 baris slice terpisah).
  4. Skew, Jitter, dan Clip-Path Slicing pada judul teks dan kedua sisi monitor (`.screen-glitch-active`).
  5. CRT Scanline Flashing (`.glitch-overlay-flash`).
- **Safety Interruption:** Timer otomatis di-reset (`clearPending()`) saat user keluar hover atau mengganti lagu lain sebelum detik ke-4.7 tercapai.

---

## File yang Terpengaruh

| File | Bagian yang Diubah |
|------|--------------------|
| `src/sections/hero/Hero.tsx` | State `isGlitching`, ref timer (4.7s & 0.7s), JSX overlays, dan class binding |
| `src/app/globals.css` | Blok CSS glitch di bagian paling bawah file (mulai baris `Screen Fast Glitch, Slicing & Invert`) |

---

## CARA CEPAT MENONAKTIFKAN (1 Baris Saja)

Di [Hero.tsx](file:///d:/Coding/Project%20Solo/Portfolio/src/sections/hero/Hero.tsx), pada fungsi `playSong`, ubah pemicunya:

```diff
-    if (song.title.toLowerCase() === "gravits") {
+    if (false && song.title.toLowerCase() === "gravits") {
```
Dengan mengubah ini, glitch tidak akan pernah terpancing tanpa perlu menghapus kode lainnya.

---

## PANDUAN ROLLBACK PENUH (Menghapus Total Semua Kode Glitch)

### A. Di `src/sections/hero/Hero.tsx`

1. **Hapus State & Ref (sekitar baris 38 - 45):**
```tsx
const [isGlitching, setIsGlitching] = useState(false);
const glitchTimerRef    = useRef<NodeJS.Timeout | null>(null);
const glitchEndTimerRef = useRef<NodeJS.Timeout | null>(null);
```

2. **Hapus Pembersihan Timer di `clearPending()`:**
```tsx
if (glitchTimerRef.current) { clearTimeout(glitchTimerRef.current); glitchTimerRef.current = null; }
if (glitchEndTimerRef.current) { clearTimeout(glitchEndTimerRef.current); glitchEndTimerRef.current = null; }
setIsGlitching(false);
```

3. **Hapus Blok Penjadwalan di `playSong()`:**
```tsx
if (song.title.toLowerCase() === "gravits") {
  glitchTimerRef.current = setTimeout(() => {
    if (token !== playTokenRef.current) return;
    setIsGlitching(true);
    glitchEndTimerRef.current = setTimeout(() => {
      setIsGlitching(false);
    }, 700);
  }, 4700);
}
```

4. **Hapus Overlay Negatif (tepat di bawah tag pembuka `<section ...>`):**
```tsx
{isGlitching && <div className="glitch-negative-flash" aria-hidden="true" />}
```

5. **Kembalikan Side Bulge ke Normal:**
```tsx
<div className="hero-side-bulge left" aria-hidden="true" />
<div className="hero-side-bulge right" aria-hidden="true" />
```

6. **Kembalikan Wrapper Boxed Canvas ke Normal:**
```tsx
<div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
```

7. **Hapus Blok Overlays di Dalam Boxed Canvas:**
```tsx
{isGlitching && (
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
```

8. **Kembalikan Wrapper Prism ke Normal:**
```tsx
<div className="absolute inset-0 w-full h-full">
```

9. **Kembalikan Container Judul Utama "portfolio rafi" ke Normal:**
```tsx
<div className="relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 pointer-events-auto">
```

---

### B. Di `src/app/globals.css`

Hapus semua blok kode dari komentar:
`/* ── Screen Fast Glitch, Slicing & Invert (Triggered 4.7s after Gravits is played, 0.7s duration) ── */`
sampai baris paling akhir file `globals.css`.

Daftar selector yang dihapus:
- `.screen-glitch-active` & `@keyframes fast-screen-glitch-slice`
- `.glitch-slice-container`
- `.glitch-slice-bar-1` s/d `6`
- `@keyframes glitch-slice-shift-1`, `2`, `3`
- `.glitch-overlay-flash` & `@keyframes glitch-overlay-burst`
- `.prism-glitch-invert` & `@keyframes prism-invert-strobe`
- `.glitch-negative-flash` & `@keyframes glitch-negative-strobe`

---

## Opsi Ramah Aksesibilitas (CSS Media Query)

Jika ingin mematikan efek otomatis bagi pengunjung yang mengaktifkan opsi sensitivitas gerak/kedipan pada sistem operasi mereka:
```css
@media (prefers-reduced-motion: reduce) {
  .screen-glitch-active,
  .prism-glitch-invert,
  .glitch-negative-flash,
  .glitch-overlay-flash,
  .glitch-slice-container {
    animation: none !important;
    display: none !important;
  }
}
```

---

## Snapshot Salinan Kode CSS Glitch Saat Ini

```css
/* â”€â”€ Screen Fast Glitch, Slicing & Invert (Triggered 4.7s after Gravits is played, 0.7s duration) â”€â”€ */
.screen-glitch-active {
  animation: fast-screen-glitch-slice 700ms steps(1, end) forwards !important;
}

@keyframes fast-screen-glitch-slice {
  0% {
    transform: translate(0, 0);
    filter: none;
    clip-path: inset(0 0 0 0);
  }
  6% {
    transform: translate(-16px, 4px) skewX(-3deg);
    filter: invert(1) contrast(300%) drop-shadow(8px 0 0 #ff0055) drop-shadow(-8px 0 0 #00ffff);
    clip-path: inset(18% 0 54% 0);
  }
  12% {
    transform: translate(18px, -6px) skewY(2.5deg);
    filter: invert(0) contrast(220%) brightness(1.8) drop-shadow(-6px 0 0 #0ed600);
    clip-path: inset(62% 0 10% 0);
  }
  18% {
    transform: translate(-22px, 8px) scaleY(1.05);
    filter: invert(1) hue-rotate(180deg) contrast(400%);
    clip-path: inset(4% 0 78% 0);
  }
  26% {
    transform: translate(14px, -4px) skewX(4deg);
    filter: invert(0.85) contrast(250%) drop-shadow(10px 0 0 #ff0055);
    clip-path: inset(40% 0 35% 0);
  }
  35% {
    transform: translate(-10px, 3px) skewY(-2deg);
    filter: invert(1) brightness(1.6) drop-shadow(-8px 0 0 #00ffff);
    clip-path: inset(72% 0 6% 0);
  }
  44% {
    transform: translate(8px, -2px) skewX(-2deg);
    filter: invert(0) contrast(200%);
    clip-path: inset(28% 0 48% 0);
  }
  54% {
    transform: translate(-18px, 6px) skewX(3deg);
    filter: invert(1) contrast(350%) drop-shadow(-10px 0 0 #0ed600);
    clip-path: inset(12% 0 65% 0);
  }
  65% {
    transform: translate(20px, -5px) scaleY(1.03);
    filter: invert(0.9) hue-rotate(90deg) contrast(280%);
    clip-path: inset(55% 0 18% 0);
  }
  75% {
    transform: translate(-12px, 4px) skewY(2deg);
    filter: invert(1) brightness(1.4) drop-shadow(8px 0 0 #ff0055);
    clip-path: inset(32% 0 42% 0);
  }
  86% {
    transform: translate(6px, -2px);
    filter: invert(0.5) contrast(160%);
    clip-path: inset(80% 0 4% 0);
  }
  94% {
    transform: translate(-3px, 1px);
    filter: invert(0.2) contrast(120%);
    clip-path: inset(0 0 0 0);
  }
  100% {
    transform: translate(0, 0);
    filter: none;
    clip-path: inset(0 0 0 0);
  }
}

/* Slicing Bar Overlays: Displaced Horizontal Slices */
.glitch-slice-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 46;
  overflow: hidden;
}

.glitch-slice-bar-1 {
  position: absolute;
  top: 15%;
  left: -5%;
  right: -5%;
  height: 18%;
  background: inherit;
  backdrop-filter: invert(1) contrast(300%) hue-rotate(90deg);
  border-top: 2px solid #ff0055;
  border-bottom: 2px solid #00ffff;
  transform: translateX(-18px);
  animation: glitch-slice-shift-1 700ms steps(3) forwards;
}

.glitch-slice-bar-2 {
  position: absolute;
  top: 48%;
  left: -5%;
  right: -5%;
  height: 24%;
  background: inherit;
  backdrop-filter: invert(1) contrast(350%) brightness(1.4);
  border-top: 1.5px solid #00ffff;
  border-bottom: 1.5px solid #0ed600;
  transform: translateX(22px);
  animation: glitch-slice-shift-2 700ms steps(3) forwards;
}

.glitch-slice-bar-3 {
  position: absolute;
  top: 76%;
  left: -5%;
  right: -5%;
  height: 14%;
  background: inherit;
  backdrop-filter: invert(0.9) contrast(200%);
  border-top: 2px solid #ff0055;
  transform: translateX(-14px);
  animation: glitch-slice-shift-3 700ms steps(3) forwards;
}

@keyframes glitch-slice-shift-1 {
  0% { opacity: 0; transform: translateX(0); }
  10% { opacity: 1; transform: translateX(-28px) skewX(-4deg); }
  30% { opacity: 0.9; transform: translateX(20px) skewX(3deg); }
  50% { opacity: 1; transform: translateX(-18px); }
  75% { opacity: 0.85; transform: translateX(14px) skewX(-2deg); }
  90% { opacity: 0.9; transform: translateX(-6px); }
  100% { opacity: 0; transform: translateX(0); }
}

@keyframes glitch-slice-shift-2 {
  0% { opacity: 0; transform: translateX(0); }
  12% { opacity: 1; transform: translateX(34px) skewX(5deg); }
  35% { opacity: 0.85; transform: translateX(-22px) skewX(-3deg); }
  55% { opacity: 1; transform: translateX(16px); }
  78% { opacity: 0.9; transform: translateX(-12px) skewX(2deg); }
  92% { opacity: 0.8; transform: translateX(5px); }
  100% { opacity: 0; transform: translateX(0); }
}

@keyframes glitch-slice-shift-3 {
  0% { opacity: 0; transform: translateX(0); }
  15% { opacity: 1; transform: translateX(-24px); }
  40% { opacity: 0.9; transform: translateX(18px) skewX(-2deg); }
  60% { opacity: 1; transform: translateX(-12px); }
  80% { opacity: 0.75; transform: translateX(8px); }
  95% { opacity: 0.6; transform: translateX(-3px); }
  100% { opacity: 0; transform: translateX(0); }
}

.glitch-overlay-flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 47;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.12) 0px,
    rgba(255, 255, 255, 0.12) 1.5px,
    transparent 1.5px,
    transparent 3.5px
  );
  animation: glitch-overlay-burst 700ms steps(1) forwards;
}

@keyframes glitch-overlay-burst {
  0% { opacity: 0; }
  8% { opacity: 1; background-color: rgba(255, 255, 255, 0.28); filter: invert(1); }
  18% { opacity: 0.5; background-color: transparent; }
  30% { opacity: 1; background-color: rgba(14, 214, 0, 0.22); filter: invert(0.85); }
  45% { opacity: 0.4; }
  58% { opacity: 1; background-color: rgba(255, 0, 85, 0.25); filter: invert(1); }
  72% { opacity: 0.35; background-color: transparent; }
  85% { opacity: 0.9; background-color: rgba(0, 240, 255, 0.2); filter: invert(0.7); }
  100% { opacity: 0; }
}





/* Extra slice bars + Prism invert (Gravits glitch) */
.glitch-slice-bar-4, .glitch-slice-bar-5, .glitch-slice-bar-6 {
  position: absolute;
  left: -5%;
  right: -5%;
  background: inherit;
  opacity: 0;
}
.glitch-slice-bar-4 {
  top: 3%; height: 9%;
  backdrop-filter: invert(1) contrast(250%);
  border-bottom: 2px solid #00ffff;
  animation: glitch-slice-shift-2 700ms steps(3) forwards;
}
.glitch-slice-bar-5 {
  top: 36%; height: 8%;
  backdrop-filter: invert(1) hue-rotate(160deg) contrast(300%);
  border-top: 2px solid #ff0055;
  animation: glitch-slice-shift-1 700ms steps(3) forwards;
}
.glitch-slice-bar-6 {
  top: 90%; height: 8%;
  backdrop-filter: invert(1) contrast(280%) brightness(1.3);
  border-top: 2px solid #0ed600;
  animation: glitch-slice-shift-3 700ms steps(3) forwards;
}

/* Invert color strobe on the Prism canvas */
.prism-glitch-invert {
  animation: prism-invert-strobe 700ms steps(1, end) forwards;
}
@keyframes prism-invert-strobe {
  0%   { filter: invert(1) hue-rotate(0deg); }
  8%   { filter: invert(0); }
  14%  { filter: invert(1) hue-rotate(90deg) contrast(160%); }
  22%  { filter: invert(0) hue-rotate(0deg); }
  30%  { filter: invert(1) contrast(200%); }
  38%  { filter: invert(0); }
  46%  { filter: invert(1) hue-rotate(180deg); }
  54%  { filter: invert(0.2); }
  62%  { filter: invert(1) hue-rotate(270deg) contrast(180%); }
  72%  { filter: invert(0); }
  82%  { filter: invert(1); }
  92%  { filter: invert(0.4); }
  100% { filter: invert(0); }
}
/* Full-screen negative (color inverted) strobe during glitch */
.glitch-negative-flash {
  position: absolute;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  background: transparent;
  animation: glitch-negative-strobe 700ms steps(1, end) forwards;
}
@keyframes glitch-negative-strobe {
  0%   { backdrop-filter: invert(1); }
  7%   { backdrop-filter: invert(0); }
  13%  { backdrop-filter: invert(1) contrast(140%); }
  20%  { backdrop-filter: invert(0); }
  27%  { backdrop-filter: invert(1); }
  33%  { backdrop-filter: invert(0); }
  40%  { backdrop-filter: invert(1) hue-rotate(180deg); }
  47%  { backdrop-filter: invert(0); }
  55%  { backdrop-filter: invert(1) contrast(160%); }
  62%  { backdrop-filter: invert(0); }
  70%  { backdrop-filter: invert(1); }
  78%  { backdrop-filter: invert(0); }
  86%  { backdrop-filter: invert(1) contrast(130%); }
  93%  { backdrop-filter: invert(0.35); }
  100% { backdrop-filter: invert(0); }
}
```

