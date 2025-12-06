import AboutMe from "../sections/AboutMe";
import Experience from "../sections/Experience";
import Projects from "../sections/Projects";
import Education from "../sections/Education";
import type { Landmark } from "../types";

export const CRITICAL_POINTS_SKIP = [1, 4, 7];

export const LANDMARK_CONFIGS: Landmark[] = [
  {
    id: "aboutMe",
    progress: null,
    title: "About Me",
    side: "right" as const,
    component: AboutMe,
  },
  {
    id: "experience",
    progress: null,
    title: "Experience",
    side: "left" as const,
    component: Experience,
  },
  {
    id: "projects",
    progress: null,
    title: "Projects",
    side: "left" as const,
    component: Projects,
  },
  {
    id: "education",
    progress: null,
    title: "Education",
    side: "right" as const,
    component: Education,
  },
];
