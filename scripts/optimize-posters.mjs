/**
 * scripts/optimize-posters.mjs
 *
 * Smart poster optimization pipeline:
 * 1. Reads all PNGs from src/assets/poster/
 * 2. Generates compressed WebP thumbnails (grid: max 400px) → public/posters/thumb/
 * 3. Generates medium-res WebP (lightbox: max 1200px)       → public/posters/medium/
 * 4. Generates tiny 20px blur placeholder base64 strings
 * 5. Outputs a JSON manifest with width, height, blurDataURL, and file paths
 *    → src/data/posters-manifest.json
 *
 * Run:  node scripts/optimize-posters.mjs
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SRC_DIR = path.join(ROOT, "src/assets/poster");
const THUMB_DIR = path.join(ROOT, "public/posters/thumb");
const MEDIUM_DIR = path.join(ROOT, "public/posters/medium");
const MANIFEST_PATH = path.join(ROOT, "src/data/posters-manifest.json");

const THUMB_MAX = 700;   // max dimension for razor-sharp grid thumbnails on Retina/4K
const MEDIUM_MAX = 1400;  // max dimension for lightbox
const BLUR_SIZE = 20;     // tiny placeholder
const WEBP_QUALITY = 85;  // crisp sharp visual quality

// Slugify filename for URL-safe paths
function slugify(filename) {
  return filename
    .replace(/\.png$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function processImage(filename) {
  const srcPath = path.join(SRC_DIR, filename);
  const slug = slugify(filename);

  // Read metadata
  const meta = await sharp(srcPath).metadata();
  const { width, height } = meta;

  // --- Thumbnail (grid) ---
  const thumbPath = path.join(THUMB_DIR, `${slug}.webp`);
  await sharp(srcPath)
    .resize({
      width: width > height ? THUMB_MAX : undefined,
      height: width <= height ? THUMB_MAX : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(thumbPath);

  const thumbStat = await fs.promises.stat(thumbPath);

  // --- Medium (lightbox) ---
  const mediumPath = path.join(MEDIUM_DIR, `${slug}.webp`);
  await sharp(srcPath)
    .resize({
      width: width > height ? MEDIUM_MAX : undefined,
      height: width <= height ? MEDIUM_MAX : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(mediumPath);

  const medStat = await fs.promises.stat(mediumPath);

  // --- Blur placeholder (tiny base64) ---
  const blurBuf = await sharp(srcPath)
    .resize(BLUR_SIZE, BLUR_SIZE, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  const srcStat = await fs.promises.stat(srcPath);

  return {
    id: slug,
    originalFile: filename,
    width,
    height,
    thumb: `/posters/thumb/${slug}.webp`,
    medium: `/posters/medium/${slug}.webp`,
    blurDataURL,
    sizes: {
      originalKB: Math.round(srcStat.size / 1024),
      thumbKB: Math.round(thumbStat.size / 1024),
      mediumKB: Math.round(medStat.size / 1024),
    },
  };
}

async function main() {
  console.log("🖼️  Poster Optimization Pipeline");
  console.log("─".repeat(50));

  await ensureDir(THUMB_DIR);
  await ensureDir(MEDIUM_DIR);

  const files = fs.readdirSync(SRC_DIR).filter((f) => /\.png$/i.test(f));
  console.log(`Found ${files.length} poster PNGs\n`);

  const manifest = [];
  let totalOriginal = 0;
  let totalThumb = 0;
  let totalMedium = 0;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    process.stdout.write(`  [${i + 1}/${files.length}] ${f} ... `);
    try {
      const entry = await processImage(f);
      manifest.push(entry);
      totalOriginal += entry.sizes.originalKB;
      totalThumb += entry.sizes.thumbKB;
      totalMedium += entry.sizes.mediumKB;
      console.log(
        `✓  ${entry.sizes.originalKB}KB → thumb ${entry.sizes.thumbKB}KB / medium ${entry.sizes.mediumKB}KB`
      );
    } catch (err) {
      console.log(`✗  ERROR: ${err.message}`);
    }
  }

  // Write manifest
  await fs.promises.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log("\n" + "─".repeat(50));
  console.log(`Total original:  ${(totalOriginal / 1024).toFixed(1)} MB`);
  console.log(`Total thumbs:    ${(totalThumb / 1024).toFixed(1)} MB`);
  console.log(`Total medium:    ${(totalMedium / 1024).toFixed(1)} MB`);
  console.log(
    `Compression:     ${((1 - (totalThumb + totalMedium) / totalOriginal) * 100).toFixed(1)}% smaller`
  );
  console.log(`\nManifest written to: ${MANIFEST_PATH}`);
  console.log(`Thumbnails in:       ${THUMB_DIR}`);
  console.log(`Medium-res in:       ${MEDIUM_DIR}`);
}

main().catch(console.error);
