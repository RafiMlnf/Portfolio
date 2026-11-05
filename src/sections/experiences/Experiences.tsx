import Image from "next/image";
import mtmIcon from "@/assets/mtm.png";
import upbIcon from "@/assets/upb.png";

interface RoleItem {
  title: string;
  employmentType: string;
  period: string;
  description?: string | null;
}

interface ExperienceItem {
  company: string;
  affiliation?: string;
  logo: typeof mtmIcon;
  roles: RoleItem[];
}

const experiences: ExperienceItem[] = [
  {
    company: "PT Menara Terus Makmur",
    affiliation: "Member of Astra group",
    logo: mtmIcon,
    roles: [
      {
        title: "Digitalization Comitee",
        employmentType: "Contract",
        period: "Nov 2026 – Present",
      },
      {
        title: "Fullstack Developer & UI QA",
        employmentType: "Internship",
        period: "May 2026 – Nov 2026",
      },
    ],
  },
  {
    company: "Universitas Pelita Bangsa",
    affiliation: "Topic: UI/UX Architecture with Java & Android Studio",
    logo: upbIcon,
    roles: [
      {
        title: "Webinar Speaker",
        employmentType: "Speaker",
        period: "Dec 2024",
        description: "Membagikan pengalaman teknis seputar keseimbangan estetika dan performa dalam pengembangan UI/UX.",
      },
    ],
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
          {experiences.map((exp) => {
            const isMultiRole = exp.roles.length > 1;

            return (
              <div
                key={exp.company}
                className="group py-6 sm:py-8 px-2 sm:px-4 -mx-2 sm:-mx-4 transition-colors duration-200 hover:bg-neutral-900/30 dark:hover:bg-neutral-900/30 light:hover:bg-neutral-100/60 rounded-lg"
              >
                {/* Header Perusahaan */}
                <div className="flex items-start gap-4 sm:gap-5 mb-5">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center pt-0.5">
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
                  </div>
                </div>

                {/* Timeline Jenjang Karir / Role */}
                <div className="relative pl-4 sm:pl-5 ml-4 sm:ml-5">
                  {/* Garis vertikal timeline gaya LinkedIn jika ada jenjang bertingkat */}
                  {isMultiRole && (
                    <div
                      className="absolute left-0 top-2.5 bottom-3.5 w-px bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-300"
                      aria-hidden="true"
                    />
                  )}

                  <div className="space-y-6">
                    {exp.roles.map((role, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot bulat timeline minimalis & netral */}
                        {isMultiRole && (
                          <div
                            className={`absolute -left-[1.28rem] sm:-left-[1.53rem] top-2 w-2 h-2 rounded-full border transition-colors ${
                              idx === 0
                                ? "bg-neutral-100 dark:bg-neutral-100 light:bg-neutral-900 border-neutral-400 dark:border-neutral-500 light:border-neutral-700 shadow-sm"
                                : "bg-neutral-900 dark:bg-neutral-900 light:bg-white border-neutral-600 dark:border-neutral-700 light:border-neutral-300"
                            }`}
                            aria-hidden="true"
                          />
                        )}

                        {/* Role Title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-base sm:text-lg font-medium text-neutral-200 dark:text-neutral-200 light:text-neutral-800 tracking-tight">
                            {role.title}
                          </span>
                        </div>

                        {/* Employment Type & Period di bawah Role */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mt-1 font-narrow tracking-wide">
                          <span className="text-sm sm:text-base font-normal text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                            {role.employmentType}
                          </span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-neutral-500">
                            {role.period}
                          </span>
                        </div>

                        {role.description && (
                          <p className="text-xs text-neutral-400/90 font-sans mt-2 max-w-xl leading-relaxed">
                            {role.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
