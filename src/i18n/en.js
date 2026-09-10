// --- Portfolio content (English) -----------------------------------------------
// One dictionary per locale, all the same shape. This is the single source of
// truth for page mode AND 3D mode — `getDict(locale)` returns one of these and
// every component reads from it, so the two modes never drift apart.
//
//   profile / hero / stats / projects / experience / stackGroups / contact
//     the portfolio data (was src/content.js)
//   sections
//     short display labels by section id — the 3D signposts and the page's
//     nav + section tags both read these
//   ui
//     every loose interface string (buttons, aria labels, HUD, prompts)

export default {
  profile: {
    name: "Nico Hermida",
    role: "Fullstack Developer",
    location: "La Plata, AR",
    available: true,
    cvUrl: "/portfolio/CV_Nicolas_Hermida_English.pdf",
    links: [
      { label: "GitHub", handle: "github.com/nicohermida01", href: "https://github.com/nicohermida01" },
      { label: "LinkedIn", handle: "linkedin.com/in/nico-hermida", href: "https://linkedin.com/in/nico-hermida" },
      { label: "Email", handle: "hermida.nicolas101@gmail.com", href: "mailto:hermida.nicolas101@gmail.com" },
    ],
  },

  hero: {
    headline: "I build web products end‑to‑end — from the API to the interface.",
    body:
      "Software developer from La Plata, Argentina — Systems at UNLP, one year in " +
      "production at a startup, and several projects shipped end to end. I lean " +
      "backend and architecture: REST APIs, async messaging, hexagonal design, and " +
      "taking a thing from the domain model all the way to deploy.",
  },

  stats: [
    { value: "5+", label: "Years building software" },
    { value: "1", label: "Year in production · startup" },
    { value: "5", label: "Projects live in production" },
  ],

  projects: [
    {
      id: "necto",
      name: "Necto",
      badge: "In production",
      href: "https://necto.com.ar",
      hrefLabel: "Live",
      image: "/portfolio/necto.jpg",
      description:
        "Neighbourhood marketplace for tradespeople, ranked by distance, reputation " +
        "and verification. Designed and built solo, end to end — modular monolith " +
        "with hexagonal architecture, search ranking computed in Postgres, " +
        "passwordless auth, and a privacy-by-design API that never exposes a " +
        "user's location. MVP for La Plata.",
      stack: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Prisma", "Auth.js", "Mapbox"],
    },
    {
      id: "estudio-nodo",
      name: "Estudio Nodo",
      badge: "Studio",
      href: "https://estudionodo.tech",
      hrefLabel: "Live",
      image: "/portfolio/estudio-nodo.jpg",
      description:
        "My own web-development studio — custom builds across landing pages, course " +
        "platforms, content-managed blogs and booking systems, plus a monthly plan " +
        "for the sites I ship. Single-scroll landing in vanilla JS with an animated " +
        "node-network hero.",
      stack: ["Vite", "Vanilla JS", "HTML / CSS", "Canvas", "SEO"],
    },
    {
      id: "bit-by-bit",
      name: "Bit by Bit",
      badge: "Personal",
      href: "https://bit-by-bit-theta.vercel.app",
      hrefLabel: "Live",
      image: "/portfolio/bit-by-bit.jpg",
      description:
        "A web platform to learn programming step by step, through a growing " +
        "collection of articles I write myself — key concepts explained clearly, " +
        "no prior experience needed.",
      stack: ["Astro", "TypeScript", "TailwindCSS"],
    },
  ],

  experience: [
    {
      id: "autoinspector",
      period: ["NOV 2021", "NOV 2022"],
      role: "Fullstack Developer Jr.",
      company: "Autoinspector",
      companyUrl: "https://autoinspector.ai",
      image: "/portfolio/autoinspector.jpg",
      description:
        "Backend and frontend work on an AI-powered platform for insurers that " +
        "automates vehicle inspections and validations. Microservices and " +
        "asynchronous messaging, features shipped iteratively on a product already " +
        "in production.",
      achievement:
        "Built the company's internal backoffice almost from scratch — the " +
        "data-visualisation and statistics modules covering the platform's main " +
        "operational metrics.",
      stack: ["TypeScript", "NestJS", "Next.js", "MongoDB", "RabbitMQ", "Docker", "Git"],
    },
    {
      id: "cepa",
      period: ["2025"],
      role: "Freelance Web Developer",
      company: "CEPA Argentina",
      companyUrl: "https://www.cepaargentina.org.ar",
      image: "/portfolio/cepa.jpg",
      description:
        "Institutional website for an NGO, built together with a UX/UI designer. " +
        "Content administration so the organisation runs the site on its own.",
      achievement:
        "Integrated Decap CMS so the team updates content with no developer in the " +
        "loop — fully self-sufficient after handoff.",
      stack: ["Astro", "TailwindCSS", "Decap CMS", "Vercel"],
    },
    {
      id: "academia-perrupato",
      period: ["2026"],
      role: "Freelance Web Developer",
      company: "Academia Perrupato",
      companyUrl: "https://academia.draperrupato.com",
      image: "/portfolio/academia-perrupato.jpg",
      description:
        "Online learning platform — courses, assessments and certification — for an " +
        "aesthetic-medicine professional. Two-person team. NestJS + Next.js + " +
        "worker monorepo with strict hexagonal module boundaries and spec-driven " +
        "development.",
      achievement:
        "Payment confirmation is backend-authoritative and payment-plus-enrolment " +
        "is atomic; certificates issue idempotently after commit. Live with real " +
        "users.",
      stack: ["NestJS", "Next.js", "TypeScript", "Prisma", "PostgreSQL", "pg-boss", "Mux", "Mercado Pago"],
    },
  ],

  stackGroups: [
    {
      title: "Backend & architecture",
      items: ["TypeScript", "Python", "NestJS", "Express", "Django", "Flask", "FastAPI", "REST APIs", "Workers / jobs", "Hexagonal"],
    },
    {
      title: "Data & messaging",
      items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "RabbitMQ", "Data modelling"],
    },
    {
      title: "Platform & delivery",
      items: ["Docker", "Docker Compose", "GitHub Actions", "Git", "Bash", "Linux"],
    },
    {
      title: "Cloud & frontend",
      items: ["Vercel", "Cloudflare R2", "Render", "Railway", "React", "Next.js", "TailwindCSS"],
    },
  ],

  contact: {
    heading: "Let's talk.",
    body: "Open to full-time roles, freelance projects, or just trading notes with other developers.",
  },

  sections: {
    index: "Home",
    work: "Work",
    log: "Log",
    stack: "Stack",
    contact: "Contact",
    projects: "Projects",
  },

  ui: {
    sectionsAria: "Sections",
    available: "Available",
    availableRest: " for work",
    openMenu: "Open menu",
    viewWork: "View work",
    downloadCv: "Download CV",
    selectedProjects: "Selected projects",
    workSub: "Built end to end — product, architecture, code, deploy.",
    workExperience: "Work experience",
    screenshot: "screenshot",
    footerTagline: "La Plata, Argentina · MMXXVI",

    switchTo3d: "Switch to 3D game mode",
    switchToPage: "Switch to page mode",

    closeSection: "Close section",
    closeEsc: "Close (Esc)",
    open: "Open",
    site: "Site",

    read: "Read",

    intro: "Walk up to a signpost to read that section — bridges link the islands.",
    hudMoveWith: "Move with",
    hudUseJoystick: "Use the joystick",
    hudTail: " — walk up to a signpost to read it",
    loading3d: "Loading 3D mode…",

    localeSwitchAria: "Language",
  },
};
