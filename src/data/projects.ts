import type { Project } from './schema'

/**
 * Portfolio projects. Edit THIS file to add/update a project.
 * Validated at load time against projectsSchema (see ./index.ts) — a malformed
 * entry fails the build with a clear error instead of shipping broken.
 *
 * Fields:
 * - image: an asset key resolved via getImage(); "" renders a "Coming Soon" placeholder.
 * - techStack: asset keys resolved via getIcon().
 * - liveLink / repoLink: full URL, relative route, or "#".
 */
export const projectsData: Project[] = [
  {
    title: 'SIRA — Smart Invoice Reminder AI',
    year: '2025',
    featured: true,
    context: 'Team product · In use at NashTa Group',
    description:
      'AI-powered invoice collection platform that predicts payment risk and sends tone-adapted reminders so finance teams stop chasing overdue clients manually. Built end-to-end by a 15-engineer team across a full semester, coordinating 214 merge requests through bot-driven automation.',
    image: 'sira_project',
    features: [
      'ML risk engine scores each client LOW/MEDIUM/HIGH and drives tone-adaptive reminders (SOPAN/TEGAS/PERINGATAN) over email, WhatsApp & SMS',
      'FastAPI + Celery/Redis backend running daily scheduled overdue checks, validated end-to-end with Pydantic models',
      'Killed N+1 queries via ORM profiling — invoice tracking latency cut from 217ms to 18ms',
      'Three-tier QA gate (SonarQube static analysis, mutation/behavioral, performance) plus OWASP Top 10 hardening and Sentry telemetry',
    ],
    techStack: ['python', 'fastapi', 'react', 'postgresql', 'tailwind', 'gitlab'],
    liveLink: '#',
    liveLabel: 'Private deployment',
    repoLink: '#',
  },
  {
    title: 'Boulder Coach',
    year: '2026',
    featured: true,
    context: 'Independent product · Live',
    description:
      'An adaptive bouldering training PWA that tells an intermediate (V4–V6) climber exactly what to train today — adapting to performance and readiness while keeping them out of injury. Shipped alongside a tool-agnostic, AI-first development harness that lets any agent or human commit only verifiably correct work.',
    image: 'boulder_project',
    features: [
      'Offline-first Next.js PWA: ACWR load monitoring, RAMP warm-ups, 6-week waved periodization & a safety-first adaptation engine',
      'Pure-TypeScript domain layer with zero I/O; layering (domain ↛ data ↛ app) enforced automatically by dependency-cruiser',
      'Deterministic 8-step quality gate — strict type-checked ESLint (bans any), 99% type-coverage, per-file 100% branch coverage on safety logic',
      'AI harness with four enforcement tiers (in-loop, pre-commit, pre-push, CI), a safety reviewer and a learning ledger that promotes recurring failures into automated checks',
    ],
    techStack: ['nextjs', 'typescript', 'react', 'tailwind', 'playwright', 'vitest'],
    liveLink: 'https://boulder-coach-gamma.vercel.app',
    liveLabel: 'Open live app',
    repoLink: 'https://github.com/dafandikri/boulder-coach',
  },
  {
    title: 'Portfolio Website',
    year: '2025–2026',
    featured: true,
    context: 'Independent build · Ongoing',
    description:
      'A cinematic, scene-driven personal website that turns a conventional portfolio into a continuous interactive story. The current edition moves through tactile film references while keeping the underlying experience fast, accessible, and data-driven.',
    image: 'portfolio_project',
    features: [
      'Four connected cinematic scenes built as a continuous scroll experience rather than a template portfolio',
      'Purpose-built 3D, canvas and motion systems with reduced-motion and keyboard-accessible alternatives',
      'Data-validated project and experience content backed by unit, interaction and visual regression checks',
      'Performance-conscious scene splitting, responsive layouts, SEO metadata and social previews',
    ],
    techStack: ['react', 'javascript', 'vsc', 'github'],
    liveLink: 'https://dafandikri.dev',
    liveLabel: 'Open live site',
    repoLink: 'https://github.com/dafandikri/portfolio-website',
  },
  {
    title: 'Interbio.id Website',
    year: '2024 archive',
    featured: true,
    context: 'Client redesign · Archived version',
    description:
      'The 2024 redesign and relaunch of interbio.id for PT International Biometrics Indonesia. This case study documents the version I delivered; Interbio has since launched a newer website, so the recorded walkthrough is preserved here as an honest project archive.',
    image: 'interbio_project',
    features: [
      'Full website redesign and relaunch on WordPress platform',
      'Modern UI with streamlined navigation for enhanced user engagement',
      'ISO 27001 compliance with SSL/TLS security implementation',
      'Modular CMS workflow training for non-technical staff (2x PR efficiency increase)',
    ],
    techStack: ['wordpress', 'figma', 'github'],
    liveLink: 'https://interbio.id',
    liveLabel: 'Current Interbio site',
    repoLink: '#',
  },
  {
    title: 'JagaRaga',
    year: '2025',
    featured: false,
    context: 'HCI course project',
    description:
      'A comprehensive health and wellness application designed through an end-to-end HCI cycle. Focused on translating complex health needs of office workers and students into an intuitive digital solution through extensive user research and data-driven design.',
    image: '',
    features: [
      'End-to-end HCI cycle implementation with Value Proposition Canvas',
      '25+ qualitative insights consolidated into actionable design requirements',
      'High-fidelity Figma prototype with iterative usability testing',
      'System Usability Scale improved to 68.67 (Good rating)',
    ],
    techStack: ['figma', 'react', 'javascript'],
    liveLink: '#',
    liveLabel: 'Unavailable',
    repoLink: '#',
  },
  {
    title: 'Solemates',
    year: '2025',
    featured: false,
    context: 'Security engineering course',
    description:
      'A secure Django-based e-commerce website for shoe retail built as part of Security-Driven Software Development course. Implemented OWASP Top 10 principles and secure coding practices, successfully passing independent penetration testing.',
    image: '',
    features: [
      'Django-based e-commerce platform with security focus',
      'OWASP Top 10 security principles implementation',
      'Kubernetes deployment to Fakultas Ilmu Komputer UI server',
      'Secure DevOps practices with SSH configuration and infrastructure hardening',
    ],
    techStack: ['python', 'django', 'docker', 'github'],
    liveLink: '#',
    liveLabel: 'Unavailable',
    repoLink: '#',
  },
  {
    title: 'GeoBikunAlert',
    year: '2024',
    featured: false,
    context: 'Campus utility',
    description:
      "An intelligent notification bot that revolutionizes campus transportation. Automatically tracks Bikun bus locations, converts data to GPS coordinates, and sends proximity alerts via Apple's API, improving commuting efficiency for 3000+ students and professors by 200%.",
    image: '',
    features: [
      'Real-time bus location scraping from bikun.ui.ac.id',
      'GPS coordinate conversion and proximity detection (100m radius)',
      'Apple API integration for seamless notifications',
      '200% improvement in commuting efficiency for 3000+ users',
    ],
    techStack: ['python', 'javascript', 'github'],
    liveLink: '#',
    liveLabel: 'Unavailable',
    repoLink: '#',
  },
  {
    title: 'DepeFood',
    year: '2024',
    featured: false,
    context: 'Software engineering course',
    description:
      'A comprehensive food ordering platform built with JavaFX, featuring dual interfaces for administrators and customers. Streamlined restaurant management for admins while providing seamless ordering experience for customers.',
    image: '',
    features: [
      'JavaFX-based food ordering system',
      'Dual interface design for admins and customers',
      'Restaurant management and order processing features',
      '25% improvement in user satisfaction ratings',
    ],
    techStack: ['java', 'github'],
    liveLink: '#',
    liveLabel: 'Unavailable',
    repoLink: '#',
  },
]
