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
      <main>
        <Hero />
        <Profile />
        <Experiences />
        <Skills />
        <Projects />
        <Peripherals />
      </main>
      <Footer />
    </>
  );
}
