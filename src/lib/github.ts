// src/lib/github.ts
// Service untuk mengambil repository GitHub (Public & Private) secara aman di server

export interface GitHubProject {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string;
  longSummary: string;
  techStack: string[];
  tags: string[];
  year: string;
  liveUrl?: string;
  previewImage?: string;
  githubUrl?: string;
  isPrivate: boolean;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

// Analisis kurasi profil & tech stack untuk repository RafiMlnf
interface RepoIntelligence {
  title?: string;
  category?: string;
  summary: string;
  techStack: string[];
  liveUrl?: string;
  previewImage?: string;
}

export const REPO_KNOWLEDGE: Record<string, RepoIntelligence> = {
  tadika: {
    title: "Tadika",
    category: "Creative Archive / Community Platform",
    summary:
      "Platform arsip digital media & memori interaktif untuk komunitas Tadika. Dilengkapi sistem ensiklopedia komunitas (Tadikapedia), galeri foto memori multi-lokasi, direktori profil warga Tadika, dan audio-visual vibes interaktif.",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Media Streaming"],
    previewImage: "/tadika.png",
  },
  portfolio: {
    title: "Portfolio",
    category: "Creative Dev / 3D Web",
    summary:
      "Arsitektur portofolio interaktif 3D generasi baru yang mengintegrasikan WebGL/OGL Prism Shader, real-time Web Audio API frequency visualizer, kinetic OptionWheel selector, galeri poster dinamis (aspect ratio adaptive hover), dan integrasi CI/CD live sync repositori GitHub (public & private).",
    techStack: ["Next.js 16", "React 19", "Three.js / OGL", "Web Audio API", "TypeScript", "Tailwind CSS v4", "Motion / Framer"],
    liveUrl: "https://rafimlnf.vercel.app",
  },
  andonppic: {
    title: "ANDONPPIC",
    category: "Industrial IoT / Production Telemetry",
    summary:
      "Sistem pemantauan status lini produksi manufaktur (Andon System) untuk divisi PPIC (Production Planning and Inventory Control). Mengatur broadcast visual status mesin, peringatan downtime real-time, monitoring target vs actual output pabrik secara terpusat.",
    techStack: ["Next.js", "TypeScript", "WebSocket / Realtime", "Lucide React", "Tailwind CSS", "Node.js Backend"],
  },
  jigfixtures: {
    title: "Jig & Fixtures",
    category: "Manufacturing Enterprise System",
    summary:
      "Aplikasi enterprise private untuk inventory, maintenance lifecycle, kalibrasi, dan tracking utilisasi perkakas produksi Jig & Fixtures di lini manufaktur presisi tinggi. Mengoptimalkan availability alat kerja dan mencegah cacat assembly.",
    techStack: ["TypeScript", "Next.js", "Enterprise Database", "Tailwind CSS", "REST API"],
    previewImage: "/jig-system.png",
  },
  "mtm-map": {
    title: "MTM-MAP",
    category: "Spatial Engineering / Canvas System",
    summary:
      "Platform visual interaktif untuk pemetaan denah fasilitas pabrik, zona kerja, dan tracking koordinat shape poligon (.mtm file format). Memungkinkan visualisasi live posisi mesin, routing jalur logistik internal, dan inspeksi tata letak pabrik.",
    techStack: ["Next.js", "TypeScript", "HTML5 Canvas / SVG Vector", "Custom MTM Shape Engine", "Tailwind CSS"],
  },
  passwordmanager: {
    title: "PasswordManager",
    category: "Cybersecurity / Utility Tool",
    summary:
      "Aplikasi brankas kredensial lokal yang ringan dan aman. Mengimplementasikan generator password berkekuatan tinggi, enkripsi vault, dan tata kelola kredensial tanpa ketergantungan cloud pihak ketiga yang berat.",
    techStack: ["JavaScript", "HTML5 Web Crypto", "Modern CSS", "Local Vault Storage"],
  },
  "capex-hub": {
    title: "CAPEX-HUB",
    category: "Financial Technology / ERP Portal",
    summary:
      "Sistem enterprise komprehensif 3-in-1 portal: Portal Pengajuan & Tracking Anggaran Belanja Modal (CAPEX), Portal BODR, dan Portal Otorisasi Approval Harga Vendor. Dilengkapi multi-level approval hierarchy, log audit riwayat migrasi, dan kalkulasi otomatis.",
    techStack: ["Next.js", "TypeScript", "PostgreSQL / PLpgSQL", "Node.js API", "Tailwind CSS"],
  },
  autoitalic: {
    title: "AutoItalic",
    category: "Productivity / NLP Utility",
    summary:
      "Alat bantu cerdas berbasis web untuk mendeteksi kosakata asing, istilah ilmiah, dan nomenklatur yang wajib dicetak miring (italic) pada naskah akademis, jurnal, laporan KP, seminar proposal, hingga skripsi secara otomatis.",
    techStack: ["JavaScript", "Vercel Edge", "NLP Tokenizer", "Tailwind CSS", "HTML5"],
    liveUrl: "https://auto-italic.vercel.app/",
  },
  mtmstandart: {
    title: "MTMStandart",
    category: "Industrial Engineering Platform",
    summary:
      "Sistem standardisasi workflow manufaktur dan kalkulasi Methods-Time Measurement (MTM). Membantu industrial engineer mengukur waktu baku kerja operator, standard operating procedure (SOP), dan efisiensi lini perakitan.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostCSS", "Enterprise API"],
  },
  wiglesco: {
    title: "Wiglesco",
    category: "Mobile Vision / Generative AI",
    summary:
      "Editor foto mobile revolusioner yang mentransformasi foto 2D biasa menjadi animasi video 3D Wigglegram ala kamera analog legendaris Nishika N8000. Ditenagai estimasi kedalaman visual AI monocular depth estimation (Depth Anything V2).",
    techStack: ["Flutter", "Dart", "Python", "Depth Anything V2 (AI)", "Shader Effects", "FFmpeg Engine"],
  },
  konserku: {
    title: "KonserKu",
    category: "Web Engineering / Event Platform",
    summary:
      "Platform web modern untuk eksplorasi jadwal konser musik, reservasi tiket panggung, dan manajemen festival musik interaktif.",
    techStack: ["HTML5", "JavaScript", "Tailwind CSS", "Vercel"],
    liveUrl: "https://rpl-konser-ku.vercel.app",
  },
  "ux-research-tool": {
    title: "UX-Research-Tool",
    category: "Product Design / Research Utility",
    summary:
      "Toolkit interaktif metodologi riset UX untuk perancangan pengalaman pengguna, pengujian kegunaan (usability testing), dan sintesis data penelitian produk digital.",
    techStack: ["CSS3", "JavaScript", "HTML5", "Vercel"],
    liveUrl: "https://ux-research-tool.vercel.app",
  },
  chatmd: {
    title: "ChatMD",
    category: "Desktop Engineering / Performance Tool",
    summary:
      "Klien komunikasi desktop ultra-cepat dan hemat memori yang dibuat untuk mengatasi bottleneck WhatsApp Desktop pada perangkat kerja kantor dengan spesifikasi terbatas. Memungkinkan komunikasi kantor darurat berjalan instan dan zero-lag.",
    techStack: ["Python", "PyQt / Tk GUI", "Lightweight IPC Protocol", "Async Networking"],
    previewImage: "/chatmd.png",
  },
  dov: {
    title: "Delivery Order Vendor",
    category: "Industrial Visualizer / Private System",
    summary:
      "Dashboard visualizer privat operasional untuk menyajikan status data manufaktur, efisiensi OEE, dan performa throughput secara real-time ke layar monitor lantai pabrik.",
    techStack: ["TypeScript", "Next.js", "Tailwind CSS", "Industrial Protocol"],
  },
  "truck-weighting": {
    title: "Truck Scale",
    category: "Logistics Automation / Hardware Integration",
    summary:
      "Sistem pencatatan dan verifikasi timbangan armada truk logistik pabrik. Terhubung langsung dengan hardware jembatan timbang (weighbridge), kalkulasi berat kotor (gross), tara (tare), dan netto muatan secara otomatis tanpa manipulasi data.",
    techStack: ["TypeScript", "PLpgSQL / PostgreSQL", "Hardware Serial Port", "Tailwind CSS"],
    previewImage: "/weightingflow.png",
  },
  portofolio: {
    title: "Portofolio",
    category: "Web Engineering / Showcase",
    summary:
      "Iterasi portofolio personal awal yang berfokus pada arsitektur web responsif, clean typography, dan showcase karya pemrograman software engineer.",
    techStack: ["TypeScript", "Next.js", "Vercel", "Tailwind CSS"],
    liveUrl: "https://portofolio-mu-six-23.vercel.app",
  },
  solfeggioanalyzer: {
    title: "SolfeggioAnalyzer",
    category: "Audio Engineering / Musical Intelligence",
    summary:
      "Eksperimen audio computing berbasis browser untuk mendeteksi mood, tangga nada, harmoni interval, dan resonansi frekuensi solfeggio mistis (528Hz, 432Hz, dsb) secara langsung dari input mikrofon atau file lagu.",
    techStack: ["TypeScript", "Web Audio API", "Fast Fourier Transform (FFT)", "React", "Tailwind CSS"],
    liveUrl: "https://solfeggio-analyzer.vercel.app",
  },
  elina: {
    title: "ELINA",
    category: "Educational Enterprise Web App",
    summary:
      "Platform komprehensif untuk tata kelola, logbook harian, dan evaluasi siswa Praktek Kerja Industri (Prakerin) di jurusan Elektronika Industri SMKN 2 Garut. Mengotomatiskan approval pembimbing industri dan rekap nilai sekolah.",
    techStack: ["PHP", "MySQL", "Bootstrap", "Web Platform Architecture"],
    previewImage: "/elina.png",
  },
};

// Data kurasi manual / fallback jika API limit atau offline
export const FALLBACK_PROJECTS: GitHubProject[] = Object.entries(REPO_KNOWLEDGE).map(([key, info], i) => {
  const exactName = info.title || key;
  return {
    id: key,
    name: exactName,
    title: exactName,
    category: info.category || "Software Project",
    description: info.summary.slice(0, 130) + "...",
    longSummary: info.summary,
    techStack: info.techStack,
    tags: info.techStack.slice(0, 4),
    year: "2026",
    liveUrl: info.liveUrl,
    previewImage: info.previewImage,
    githubUrl: `https://github.com/RafiMlnf/${key}`,
    isPrivate: key === "jigfixtures" || key === "dov" || key === "truck-weighting",
    stars: 1,
    forks: 0,
    createdAt: `2026-0${Math.max(1, 9 - i)}-01`,
    updatedAt: "2026-03-01",
    featured: i < 3,
  };
});

interface GitHubApiRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
  fork: boolean;
  visibility?: string;
}

function formatRepoTitle(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

/**
 * Mengambil repository GitHub akun pengguna.
 * Jika GITHUB_TOKEN disediakan, repositori private juga akan terambil.
 */
export async function getGitHubProjects(): Promise<GitHubProject[]> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const username = process.env.GITHUB_USERNAME?.trim() || "RafiMlnf";

  // Endpoint: Sort berdasarkan kapan repo dibuat (sort=created, direction=desc)
  const endpoint = token
    ? "https://api.github.com/user/repos?per_page=100&sort=created&direction=desc&affiliation=owner"
    : `https://api.github.com/users/${username}/repos?per_page=100&sort=created&direction=desc`;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Portfolio-App",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      headers,
      next: { revalidate: 3600 }, // ISR: Cache 1 jam lalu revalidasi otomatis
    });

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}: ${res.statusText}. Using fallback data.`);
      return FALLBACK_PROJECTS;
    }

    const repos: GitHubApiRepo[] = await res.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      return FALLBACK_PROJECTS;
    }

    // Blacklist repos yang tidak ingin ditampilkan (tugas kuliah / praktikum lab / repositori skripsi)
    const EXCLUDED_REPOS = new Set([
      "sentimen-feast-arteri-svm",
      "uas_web2_312210382_rafimaulanafidaus",
      "uas-checklist-kebersihan-toilet",
      "uas-djangoframework",
      "uas-mobile2",
      "utskripto",
      "lab7web2",
      "lab7web",
      "lab5web",
      "lab6web",
      "lab8web",
    ]);

    // Filter repo:
    // 1. Bukan fork repo orang lain
    // 2. Bukan repo metadata khusus profile
    // 3. Bukan repo yang masuk blacklist pengecualian atau repo skripsi/lab praktikum
    const filtered = repos.filter((repo) => {
      if (repo.fork) return false;
      const slug = repo.name.toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      
      // Filter blacklist eksplisit
      if (EXCLUDED_REPOS.has(slug)) return false;

      // Filter jika nama repo diawali lab (tugas praktikum lab)
      if (slug.startsWith("lab")) return false;

      // Filter jika nama repo mengandung skripsi
      if (slug.includes("skripsi")) return false;

      // Filter jika deskripsi repositori adalah proyek skripsi (misal: "Untuk SKRIPSI.")
      // Catatan: kecualikan AutoItalic karena merupakan tool utilitas yang bermanfaat
      if (desc.includes("skripsi") && slug !== "autoitalic") return false;

      if (slug === username.toLowerCase() && !repo.description) return false;
      return true;
    });

    // Mapping repo ke format GitHubProject yang lengkap dengan analisa intelligence
    const mapped: GitHubProject[] = filtered.map((repo) => {
      const slug = repo.name.toLowerCase();
      const intelligence = REPO_KNOWLEDGE[slug];
      const year = (repo.created_at || repo.updated_at || "").slice(0, 4) || "2026";

      // Tech Stack cerdas
      const techStack: string[] = intelligence
        ? intelligence.techStack
        : [repo.language || "Software", ...(repo.topics || [])].filter(Boolean);

      // Kategori cerdas
      const category = intelligence?.category || (repo.language ? `${repo.language} Engineering` : "Software System");

      // Rangkuman mendalam & Deskripsi
      const longSummary =
        intelligence?.summary ||
        repo.description ||
        `Proyek rekayasa perangkat lunak ${repo.name} yang berfokus pada arsitektur sistem modern, efisiensi komputasi, dan solusi digital terstruktur.`;

      const description = repo.description || longSummary;

      // Live Deploy URL: prioritaskan intelligence.liveUrl jika diset, atau repo.homepage
      const liveUrl = intelligence?.liveUrl
        ? intelligence.liveUrl
        : (repo.homepage && repo.homepage.trim().startsWith("http"))
        ? repo.homepage.trim()
        : undefined;

      const isFeatured =
        repo.stargazers_count > 0 ||
        slug === "portfolio" ||
        slug === "wiglesco" ||
        slug === "andonppic" ||
        slug === "capex-hub";

      const exactName = intelligence?.title || repo.name;

      return {
        id: slug,
        name: exactName,
        title: exactName,
        category,
        description,
        longSummary,
        techStack,
        tags: techStack.slice(0, 4),
        year,
        liveUrl,
        previewImage: intelligence?.previewImage,
        githubUrl: repo.private ? undefined : repo.html_url,
        isPrivate: repo.private,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        featured: isFeatured,
      };
    });

    // Gabungkan repositori enterprise/kurasi khusus (seperti jigfixtures, truck-weighting, dov, elina) jika belum ada di list publik
    const existingIds = new Set(mapped.map((p) => p.id));
    const mandatoryProjects = FALLBACK_PROJECTS.filter(
      (p) =>
        (p.id === "jigfixtures" ||
          p.id === "truck-weighting" ||
          p.id === "dov" ||
          p.id === "elina" ||
          p.id === "konserku" ||
          p.id === "ux-research-tool") &&
        !existingIds.has(p.id)
    );

    const allProjects = [...mapped, ...mandatoryProjects];

    // Urutkan murni berdasarkan tanggal pembuatan (created_at terbaru -> terlama)
    allProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allProjects.slice(0, 20);
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return FALLBACK_PROJECTS;
  }
}
