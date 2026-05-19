import { ProjectItems } from "./projects";

export const projectItemConfig: ProjectItems[] = [
  {
    projectName: "Sendly",
    description:
      "Sendly lets you share files across devices instantly—no signups, no quality loss, just convenience.",
    projectImage: "sendly.png",
    githubLink: "https://github.com/Vaibhav-kesarwani/sendly",
    liveLink: "https://sendlyfile.vercel.app/",
    techStack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Prisma"],
    difficulty: "Advanced",
    skills: ["File Handling", "Database", "Authentication"],
    learningPath: ["Fullstack Next.js", "Backend Integration"],
    estimatedTime: "2-3 weeks",
    prerequisites: ["React", "SQL basics"],
  },
  {
    projectName: "ShowTime",
    description:
      "A cinematic streaming guide built with React featuring real-time movie search and a personalised watchlist to track your favourites.",
    projectImage: "showtime.png",
    githubLink: "https://github.com/Rishikapurbey/ShowTime",
    liveLink: "https://harmonious-maamoul-e4854c.netlify.app/",
    techStack: ["React js", "JavaScript", "CSS", "HTML"],
    difficulty: "Intermediate",
    skills: ["API Fetching", "State Management", "Routing"],
    learningPath: ["Frontend Mastery"],
    estimatedTime: "1-2 weeks",
    prerequisites: ["Basic React Hooks", "Promises/Async"],
  },
  {
    projectName: "Pomodoro Timer",
    description:
      "A productivity timer built with React featuring work and break sessions, countdown timer, start/pause/reset controls, and session tracking.",
    projectImage: "pomodoro-timer.png",
    githubLink: "https://github.com/chopadkartanishka/100-reactjs-projects",
    techStack: ["React js", "JavaScript", "CSS", "HTML"],
    difficulty: "Intermediate",
    skills: ["Timers & Intervals", "React State"],
    learningPath: ["React Basics", "Utility Apps"],
    estimatedTime: "3-5 days",
    prerequisites: ["JavaScript Basics", "useState/useEffect"],
  },
];

