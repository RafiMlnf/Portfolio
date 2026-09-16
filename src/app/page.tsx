import Header from "@/sections/header/Header";
import Hero from "@/sections/hero/Hero";
import Profile from "@/sections/profile/Profile";
import Experiences from "@/sections/experiences/Experiences";
import Skills from "@/sections/skills/Skills";
import Projects from "@/sections/projects/Projects";
import Peripherals from "@/sections/peripherals/Peripherals";
import Footer from "@/sections/footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative w-full">
        {/* Sticky Hero section: tetap di posisinya saat scroll awal */}
        <Hero />

        {/* Layered Content Sheet: Container yang meluncur naik dari bawah menutupi Hero & Header */}
        <div className="relative z-20 w-full bg-[var(--background)] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] dark:shadow-[0_-25px_60px_rgba(0,0,0,0.95)] light:shadow-[0_-20px_50px_rgba(0,0,0,0.08)] border-t border-neutral-800/80 rounded-t-[2.5rem] md:rounded-t-[3.5rem] overflow-hidden transition-colors duration-300">
          {/* Subtle top indicator bar / handle aesthetic */}
          <div className="w-full flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 rounded-full bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-300" />
          </div>

          <Profile />
          <Experiences />
          <Skills />
          <Projects />
          <Peripherals />
        </div>
      </main>
      <div className="relative z-20 bg-[var(--background)]">
        <Footer />
      </div>
    </>
  );
}

