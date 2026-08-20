# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four audiences, all confirmed, arriving with different budgets of attention:

- **Engineers and peers.** Other developers judging craft. They open the
  repository, read the source, and notice which things are real — that the
  Jurassic gate is an actual Collada model rather than a CSS drawing of one.
  They spend minutes, not seconds.
- **Recruiters and hiring managers.** Screening for a role, often non-technical
  on the first pass, skimming in under two minutes. They need role, stack,
  recency and proof to be findable without reading code.
- **Clients and freelance leads.** Considering paying for delivery. They want
  evidence that things ship and a way to make contact.
- **Scholarship and academic reviewers.** Assessing the person behind an
  application. They want awards, institution and rigour.

The site does not segment by audience. One path serves all four, and the
engineers' bar is the highest, so it sets the standard.

## Product Purpose

A personal portfolio for Erdafa Andikri, a software engineer and Computer
Science student at Universitas Indonesia, presenting work, experience and
awards.

Success is three things at once, all confirmed:

1. **Credibility.** The visitor concludes this is a serious engineer, whether
   or not they ever make contact. Proof and depth outrank memorability.
2. **Personal ambition.** The site is a project in its own right, built to a
   standard its owner is proud of. This is what justifies building the real
   thing instead of an approximation, and future work must not treat it as
   overhead to be optimised away.
3. **Recall.** It is memorable enough that a skim can become a conversation.

These are not in tension. The craft is the argument: the site demonstrates
capability by being an instance of it.

## Positioning

The portfolio is itself the largest work sample. A conventional portfolio
describes projects; this one is a project — a continuous scrolled sequence of
film sets, each carrying real content, each engineered to a standard a peer can
audit by opening the repository.

The differentiator a neighbouring portfolio could not truthfully copy is that
the presentation layer and the evidence are the same artifact. Someone assessing
the work is already inside a piece of it.

## Operating Context

- Production is `dafandikri.dev`, deployed from `main` through Vercel's Git
  integration.
- A second deployment runs at `k8s.dafandikri.dev` on k3s on a DigitalOcean
  droplet, built and rolled out by GitHub Actions through `ghcr.io`, documented
  in the README. It exists and is live, but the owner twice declined to record
  it as a durable constraint, so future work must not treat it as one and must
  not assume it will be maintained.
- Content is authored by editing typed data files (`src/data/`), not a CMS.
  Every collection is validated against a Zod schema at module load, so a
  malformed entry fails the build rather than shipping.
- Visitors arrive from CV links, LinkedIn, GitHub and referrals. There is no
  onboarding, no account, and no state to preserve between visits.

## Capabilities and Constraints

Confirmed capabilities:

- A single scrolled page of full-viewport scenes: a business card, a departure,
  an experience timeline, a projects enclosure, and an awards hall.
- Project records with media, feature notes, technology and live/source links.
- An experience timeline grouped by year, a technology marquee, and a skills set.
- Award records that reference the project they were won with. The reference is
  one-directional and enforced at build time.
- A downloadable CV.

Durable constraints future work must not break:

- **The cinematic scene concept is the product**, not a presentation layer over
  it. No agent may flatten the site into a conventional portfolio, and no
  request to "simplify" or "modernise" authorises replacing the scene sequence.
  This is the single most important constraint in this file.
- **Performance is a published commitment.** The README publishes desktop and
  mobile PageSpeed scores. Scenes stay code-split and gated on approach; assets
  stay small.
- **The accessibility floor holds.** `prefers-reduced-motion` renders the
  finished state rather than the animation, keyboard focus stays visible,
  semantics stay real, and body text stays at or above 4.5:1 contrast.

Explicitly undecided:

- Whether the k3s deployment is permanent.
- Whether the site should ever carry an explicit call to action. It currently
  does not, and none of the three success criteria requires one.

## Brand Commitments

- The product name is the owner's own: **Erdafa Andikri**.
- Copy is factual and unembellished. Project descriptions state what a thing
  does and what was measured, and name limits honestly — an archived client site
  is labelled as an archive, an unavailable link is labelled unavailable.
- **A project's copy describes the product and nothing else.** Competition
  results, placings and team credits live only in the awards record, which
  references the project rather than the reverse. A test enforces this: no
  project description may contain competition language.

## Evidence on Hand

Real, present in the repository:

- Nine projects, five featured, four archived (`src/data/projects.ts`).
- Six roles across four years (`src/data/experiences.ts`).
- One award: Best Presentation, RISTEK Hackathon 2026, Fakultas Ilmu Komputer
  Universitas Indonesia, won with Talk-Active by the five-person Team FAM
  (`src/data/awards.ts`).
- Walkthrough recordings for four featured projects in `public/`, and product
  stills in `src/assets/img/`. Talk-Active currently has a still; its recording
  is planned and not yet captured.
- Published PageSpeed results and CI/deployment screenshots in `readme/`.
- A CV at `public/cv-erdafa-andikri.pdf`.

Absences future work must not fabricate: there are no testimonials, no client
quotes, no user counts, no revenue figures, and no press. Metrics that do appear
in project copy came from the projects themselves and must not be extended,
rounded up, or invented.

## Product Principles

1. **Build the real thing.** When an object can be modelled, modelled it is.
   The codebase has already made this trade once, replacing a CSS gate that
   "was a drawing of a gate from memory" with the actual model. Approximation is
   the exception that must be justified, not the default.
2. **The highest-attention audience sets the bar.** Engineers who will open the
   repository are the strictest readers; satisfying them satisfies everyone
   else. Never optimise for the skim at the cost of what a peer would find.
3. **Honesty over polish in the copy.** Label archives as archives and dead
   links as dead. Credibility is the primary success criterion and a single
   inflated claim costs more than a plain one gains.
4. **Content is typed and validated.** New content is a data entry against a
   schema, not markup. If a fact can be checked at build time, check it there.
5. **The site is allowed to be ambitious.** It is a personal work its owner is
   proud of. Effort spent on craft that no visitor consciously notices is not
   waste; it is the point.

## Accessibility & Inclusion

Confirmed as a durable requirement rather than a nice-to-have:

- Every animated scene provides a `prefers-reduced-motion` path that presents
  the finished state without motion.
- Keyboard focus is visible on every interactive element, and decorative
  elements are hidden from assistive technology rather than given empty labels.
- Interactive regions carry real semantics: headings, lists, dialogs with
  labels, and links that state their destination.
- Body and secondary text meet 4.5:1 contrast against their own ground.
