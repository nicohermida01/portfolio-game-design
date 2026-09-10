// --- Portfolio content (Spanish) ---------------------------------------------
// Same shape as en.js. Neutral Spanish (no voseo) — switch the imperatives in
// `ui` to Rioplatense (acercate / movete / usá) if you prefer that register.

export default {
  profile: {
    name: "Nico Hermida",
    role: "Desarrollador Fullstack",
    location: "La Plata, AR",
    available: true,
    cvUrl: "/portfolio/CV_Nicolas_Hermida.pdf",
    links: [
      { label: "GitHub", handle: "github.com/nicohermida01", href: "https://github.com/nicohermida01" },
      { label: "LinkedIn", handle: "linkedin.com/in/nico-hermida", href: "https://linkedin.com/in/nico-hermida" },
      { label: "Email", handle: "hermida.nicolas101@gmail.com", href: "mailto:hermida.nicolas101@gmail.com" },
    ],
  },

  hero: {
    headline: "Construyo productos web de punta a punta — de la API a la interfaz.",
    body:
      "Desarrollador de software de La Plata, Argentina — Sistemas en la UNLP, un " +
      "año en producción en una startup y varios proyectos llevados de punta a " +
      "punta. Me inclino por el backend y la arquitectura: APIs REST, mensajería " +
      "asíncrona, diseño hexagonal y llevar algo desde el modelo de dominio hasta " +
      "el deploy.",
  },

  stats: [
    { value: "5+", label: "Años construyendo software" },
    { value: "1", label: "Año en producción · startup" },
    { value: "5", label: "Proyectos en producción" },
  ],

  projects: [
    {
      id: "necto",
      name: "Necto",
      badge: "En producción",
      href: "https://necto.com.ar",
      hrefLabel: "En vivo",
      image: "/portfolio/necto.jpg",
      description:
        "Marketplace barrial de oficios, ordenado por distancia, reputación y " +
        "verificación. Diseñado y construido en solitario, de punta a punta — " +
        "monolito modular con arquitectura hexagonal, ranking de búsqueda " +
        "calculado en Postgres, autenticación sin contraseña y una API con " +
        "privacidad por diseño que nunca expone la ubicación del usuario. MVP " +
        "para La Plata.",
      stack: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Prisma", "Auth.js", "Mapbox"],
    },
    {
      id: "estudio-nodo",
      name: "Estudio Nodo",
      badge: "Estudio",
      href: "https://estudionodo.tech",
      hrefLabel: "En vivo",
      image: "/portfolio/estudio-nodo.jpg",
      description:
        "Mi propio estudio de desarrollo web — desarrollos a medida: landing " +
        "pages, plataformas de cursos, blogs con gestor de contenido y sistemas " +
        "de reservas, más un plan mensual para los sitios que entrego. Landing de " +
        "scroll único en JS vanilla con un hero animado de red de nodos.",
      stack: ["Vite", "Vanilla JS", "HTML / CSS", "Canvas", "SEO"],
    },
    {
      id: "bit-by-bit",
      name: "Bit by Bit",
      badge: "Personal",
      href: "https://bit-by-bit-theta.vercel.app",
      hrefLabel: "En vivo",
      image: "/portfolio/bit-by-bit.jpg",
      description:
        "Una plataforma web para aprender a programar paso a paso, a través de una " +
        "colección creciente de artículos que escribo yo mismo — conceptos clave " +
        "explicados con claridad, sin experiencia previa.",
      stack: ["Astro", "TypeScript", "TailwindCSS"],
    },
  ],

  experience: [
    {
      id: "autoinspector",
      period: ["NOV 2021", "NOV 2022"],
      role: "Desarrollador Fullstack Jr.",
      company: "Autoinspector",
      companyUrl: "https://autoinspector.ai",
      image: "/portfolio/autoinspector.jpg",
      description:
        "Trabajo de backend y frontend en una plataforma con IA para aseguradoras " +
        "que automatiza inspecciones y validaciones de vehículos. Microservicios y " +
        "mensajería asíncrona, funcionalidades entregadas de forma iterativa sobre " +
        "un producto ya en producción.",
      achievement:
        "Construí el backoffice interno de la empresa casi desde cero — los " +
        "módulos de visualización de datos y estadísticas que cubren las " +
        "principales métricas operativas de la plataforma.",
      stack: ["TypeScript", "NestJS", "Next.js", "MongoDB", "RabbitMQ", "Docker", "Git"],
    },
    {
      id: "cepa",
      period: ["2025"],
      role: "Desarrollador Web Freelance",
      company: "CEPA Argentina",
      companyUrl: "https://www.cepaargentina.org.ar",
      image: "/portfolio/cepa.jpg",
      description:
        "Sitio institucional para una ONG, desarrollado junto a un diseñador " +
        "UX/UI. Administración de contenido para que la organización maneje el " +
        "sitio por su cuenta.",
      achievement:
        "Integré Decap CMS para que el equipo actualice el contenido sin un " +
        "desarrollador en el medio — totalmente autosuficiente tras la entrega.",
      stack: ["Astro", "TailwindCSS", "Decap CMS", "Vercel"],
    },
    {
      id: "academia-perrupato",
      period: ["2026"],
      role: "Desarrollador Web Freelance",
      company: "Academia Perrupato",
      companyUrl: "https://academia.draperrupato.com",
      image: "/portfolio/academia-perrupato.jpg",
      description:
        "Plataforma de aprendizaje online — cursos, evaluaciones y certificación — " +
        "para una profesional de la medicina estética. Equipo de dos personas. " +
        "Monorepo NestJS + Next.js + worker con límites de módulo hexagonales " +
        "estrictos y desarrollo guiado por especificación.",
      achievement:
        "La confirmación de pago es autoritativa en el backend y el pago junto con " +
        "la inscripción es atómico; los certificados se emiten de forma idempotente " +
        "tras el commit. En vivo con usuarios reales.",
      stack: ["NestJS", "Next.js", "TypeScript", "Prisma", "PostgreSQL", "pg-boss", "Mux", "Mercado Pago"],
    },
  ],

  stackGroups: [
    {
      title: "Backend y arquitectura",
      items: ["TypeScript", "Python", "NestJS", "Express", "Django", "Flask", "FastAPI", "APIs REST", "Workers / jobs", "Hexagonal"],
    },
    {
      title: "Datos y mensajería",
      items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "RabbitMQ", "Modelado de datos"],
    },
    {
      title: "Plataforma y entrega",
      items: ["Docker", "Docker Compose", "GitHub Actions", "Git", "Bash", "Linux"],
    },
    {
      title: "Cloud y frontend",
      items: ["Vercel", "Cloudflare R2", "Render", "Railway", "React", "Next.js", "TailwindCSS"],
    },
  ],

  contact: {
    heading: "Hablemos.",
    body: "Abierto a puestos full-time, proyectos freelance o simplemente a intercambiar ideas con otros desarrolladores.",
  },

  sections: {
    index: "Inicio",
    work: "Trabajo",
    log: "Registro",
    stack: "Stack",
    contact: "Contacto",
    projects: "Proyectos",
  },

  ui: {
    sectionsAria: "Secciones",
    available: "Disponible",
    availableRest: "\u{00a0}para trabajar",
    openMenu: "Abrir menú",
    viewWork: "Ver trabajo",
    downloadCv: "Descargar CV",
    selectedProjects: "Proyectos seleccionados",
    workSub: "Construidos de punta a punta — producto, arquitectura, código, deploy.",
    workExperience: "Experiencia laboral",
    screenshot: "captura",
    footerTagline: "La Plata, Argentina · MMXXVI",

    switchTo3d: "Cambiar al modo juego 3D",
    switchToPage: "Cambiar al modo página",

    closeSection: "Cerrar sección",
    closeEsc: "Cerrar (Esc)",
    open: "Abrir",
    site: "Sitio",

    read: "Leer",

    intro: "Acércate a un cartel para leer esa sección — los puentes unen las islas.",
    hudMoveWith: "Muévete con",
    hudUseJoystick: "Usa el joystick",
    hudTail: " — acércate a un cartel para leerlo",
    loading3d: "Cargando modo 3D…",

    localeSwitchAria: "Idioma",
  },
};
