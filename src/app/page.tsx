import Header from "@/sections/header/Header";
import Hero from "@/sections/hero/Hero";
import Profile from "@/sections/profile/Profile";
import Experiences from "@/sections/experiences/Experiences";
import Skills from "@/sections/skills/Skills";
import Projects from "@/sections/projects/Projects";
import Footer from "@/sections/footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative w-full">
        {/* Sticky Hero section: tetap di posisinya saat scroll awal */}
        <Hero />

        {/* Layered Content Sheet: Container yang meluncur naik dari bawah menutupi Hero & Header */}
        <div className="relative z-20 w-full bg-[var(--background)] border-t border-neutral-800/80 overflow-hidden transition-colors duration-300">
          <Profile />
          <Experiences />
          <Skills />
          <Projects />
        </div>
      </main>
      <div className="relative z-20 bg-[var(--background)]">
        <Footer />
      </div>
    </>
  );
}

