import Image from "next/image";
import mtmIcon from "@/assets/mtm.png";
import upbIcon from "@/assets/upb.png";

const experiences = [
  {
    role: "Fullstack Developer & UI QA",
    period: "Internship · May – Nov 2026",
    company: "PT Menara Terus Makmur",
    affiliation: "Member of Astra group",
    description: null,
    logo: mtmIcon,
  },
  {
    role: "Webinar Speaker",
    period: "Dec 2024",
    company: "Universitas Pelita Bangsa",
    affiliation: "Topic: UI/UX Architecture with Java & Android Studio",
    description: "Membagikan pengalaman teknis seputar keseimbangan estetika dan performa dalam pengembangan UI/UX.",
    logo: upbIcon,
  },
];

export default function Experiences() {
  return (
    <section
      id="experiences"
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-10 lg:px-12 pointer-events-auto border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <span className="font-narrow text-[11px] tracking-widest uppercase text-neutral-500 block mb-1">
            02 / Experience
          </span>
          <h2 className="font-narrow text-3xl sm:text-4xl md:text-5xl font-normal italic tracking-tight lowercase text-neutral-100">
            Experience
          </h2>
        </div>

        {/* Minimalist Experience List */}
        <div className="border-t border-neutral-800/60 dark:border-neutral-800/60 light:border-neutral-200 divide-y divide-neutral-800/60 dark:divide-neutral-800/60 light:divide-neutral-200">
          {experiences.map((exp) => (
            <div
              key={exp.company}
              className="group py-6 sm:py-8 px-2 sm:px-4 -mx-2 sm:-mx-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 hover:bg-neutral-900/30 dark:hover:bg-neutral-900/30 light:hover:bg-neutral-100/60 rounded-lg"
            >
              {/* Left: Frameless Logo + Company */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                  <Image
                    src={exp.logo}
                    alt={exp.company}
                    className="object-contain w-full h-full"
                  />
                </div>

                <div>
                  <h3 className="font-sans text-base sm:text-lg font-medium text-neutral-100 tracking-tight transition-colors duration-200 group-hover:text-white dark:group-hover:text-white light:group-hover:text-black">
                    {exp.company}
                  </h3>
                  {exp.affiliation && (
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">
                      {exp.affiliation}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-xs text-neutral-400/90 font-sans mt-1 max-w-xl leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Role & Period */}
              <div className="pl-[3.25rem] sm:pl-0 sm:text-right flex flex-col sm:items-end">
                <span className="font-narrow text-base sm:text-lg text-neutral-300 dark:text-neutral-300 light:text-neutral-700 italic tracking-tight">
                  {exp.role}
                </span>
                {exp.period && (
                  <span className="font-narrow text-xs text-neutral-500 tracking-wide mt-0.5">
                    {exp.period}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
