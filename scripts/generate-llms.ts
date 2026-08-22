/**
 * Generate public/llms.txt from the same typed data the site renders.
 *
 * The hand-written version drifted: it linked `/cv-erdafa-andikri.pdf` after
 * that file was replaced, and because vercel.json rewrites every unmatched path
 * to `/`, the dead link answered 200 with the homepage rather than 404. A model
 * following it would have indexed the site's markup as the résumé. Anything a
 * crawler is told here now comes from the data files, so a rename cannot leave
 * a link behind.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { card, projects, experiences, awards, skills, contacts } from '../src/data/index.ts'

const ORIGIN = 'https://dafandikri.dev'

const featured = projects.filter((project) => project.featured)
const archived = projects.length - featured.length
const cv = contacts.find((line) => line.href.endsWith('.pdf'))
const years = Object.keys(experiences)
const roleCount = Object.values(experiences).reduce((n, year) => n + year.entries.length, 0)

const lines: string[] = [
  `# ${card.name} — ${card.role}`,
  '',
  `> Portfolio of ${card.name}, a ${card.role.toLowerCase()} in Jakarta, Indonesia,`,
  `> ${card.affiliation.detail.toLowerCase()} at ${card.affiliation.name}. The site is a`,
  '> single scrolled page of film-set scenes, each carrying real project data.',
  '',
  '## Primary pages',
  '',
  `- [Portfolio](${ORIGIN}/): Projects, experience, awards, skills and contact details.`,
]

if (cv) lines.push(`- [Curriculum vitae](${ORIGIN}${cv.href}): Current CV in PDF format.`)

for (const line of contacts.filter((entry) => entry.external)) {
  lines.push(`- [${line.label}](${line.href}): ${line.role}.`)
}

lines.push(
  '',
  '## Work',
  '',
  `${featured.length} featured projects and ${archived} archived, ${roleCount} roles across ${years.length} years.`,
  '',
)

for (const project of featured) {
  const links = [project.liveLink, project.repoLink].filter((link) => link && link !== '#')
  lines.push(`### ${project.title}`)
  lines.push(project.description)
  if (project.techStack?.length) lines.push(`Built with: ${project.techStack.join(', ')}.`)
  if (links.length) lines.push(`Links: ${links.join(' · ')}`)
  lines.push('')
}

if (awards.length) {
  lines.push('## Awards', '')
  for (const award of awards) {
    const team = award.members ? `${award.members.length} members` : `${award.teamSize} members`
    lines.push(
      `- **${award.title}**, ${award.event}, ${award.host}, ${award.date}. ` +
        `Won with ${award.projectTitle ?? 'no listed project'} as ${award.team} (${team}). ${award.story}`,
    )
  }
  lines.push('')
}

lines.push(
  '## Skills',
  '',
  skills.map((skill) => skill.name).join(', ') + '.',
  '',
  '## Site information',
  '',
  `- Canonical domain: \`${ORIGIN.replace('https://', '')}\``,
  '- Primary language: English',
  '- Location: Jakarta, Indonesia',
  `- Role: ${card.role}`,
  `- Generated from source data on build; do not edit by hand.`,
  '',
)

writeFileSync('public/llms.txt', lines.join('\n'))
console.log(
  `✓ llms.txt — ${featured.length} featured projects, ${awards.length} awards, ${contacts.length} contact routes`,
)

/*
 * The same facts as structured data, written between markers in index.html so
 * the page a crawler parses and the file an agent reads cannot disagree. Person
 * carries `award` and `knowsAbout` natively, which is where the achievements and
 * the stack belong rather than in prose a parser has to guess at.
 */
const structured = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: card.name,
  url: `${ORIGIN}/`,
  image: `${ORIGIN}/profile.png`,
  jobTitle: card.role,
  email: 'mailto:dafandikri@gmail.com',
  homeLocation: { '@type': 'Place', name: 'Jakarta, Indonesia' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: card.affiliation.name },
  award: awards.map((a) => `${a.title}, ${a.event} (${a.host}, ${a.date})`),
  knowsAbout: skills.map((skill) => skill.name),
  sameAs: contacts.filter((line) => line.external).map((line) => line.href),
  ...(cv ? { subjectOf: { '@type': 'DigitalDocument', name: 'Curriculum vitae', url: `${ORIGIN}${cv.href}` } } : {}),
}

const html = readFileSync('index.html', 'utf8')
const START = '<!-- ld+json:start -->'
const END = '<!-- ld+json:end -->'
const before = html.slice(0, html.indexOf(START) + START.length)
const after = html.slice(html.indexOf(END))
const block = `\n    <script type="application/ld+json">\n${JSON.stringify(structured, null, 2)
  .split('\n').map((l) => '    ' + l).join('\n')}\n    </script>\n    `
writeFileSync('index.html', before + block + after)
console.log(`\u2713 index.html JSON-LD \u2014 ${structured.award.length} awards, ${structured.knowsAbout.length} skills`)

/* Same reason as the rest of this script: a hand-edited lastmod is a date that
   silently stops being true. */
const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${ORIGIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
writeFileSync('public/sitemap.xml', sitemap)
console.log(`\u2713 sitemap.xml \u2014 lastmod ${today}`)
