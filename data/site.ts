import { projects, profile, socialLinks } from "./profile";

export const site = {
  initials: "CR",
  shortName: "Chandu",
  edition: "PORTFOLIO / 2026",
  hero: {
    eyebrow: "AI/ML ENGINEER & RESEARCHER",
    headline: ["Intelligence,", "by design."],
    introduction: `I'm ${profile.name}. I build intelligent systems at the intersection of data, code, and research.`,
    detail: "M.Tech Artificial Intelligence · IIIT Bhopal",
  },
  links: [
    { id: "about", label: "About" },
    { id: "projects", label: "Work" },
    { id: "research", label: "Research" },
    { id: "skills", label: "Expertise" },
    { id: "education", label: "Journey" },
    { id: "contact", label: "Contact" },
  ],
  projectCategories: ["All work", "AI & Data", "Full Stack"],
  projectVisuals: ["retrieval", "hiring", "analytics", "commerce"] as const,
  // These URLs agree with the project's explicit source links in the supplied profile.
  repositories: projects.filter((project) => project.featured && project.githubUrl),
  socials: socialLinks.filter((link) => link.icon !== "email"),
  resume: { url: "/resume.pdf", fileName: "Chandra_Sekhar_Reddy_Resume.pdf" },
};

export function validUrl(url?: string): url is string {
  return Boolean(url && !url.includes("[ADD") && /^(https?:\/\/|mailto:|\/)/.test(url));
}
