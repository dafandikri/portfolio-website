/**
 * Standalone content validation, run in CI before the build for a fast, clear
 * failure independent of the full Vite build. Importing ../src/data triggers
 * every schema parse; an invalid data file throws and exits non-zero.
 */
import { projects, experiences } from '../src/data/index.ts'

const projectCount = projects.length
const experienceYears = Object.keys(experiences).length
const experienceCount = Object.values(experiences).reduce(
  (sum, year) => sum + year.entries.length,
  0,
)

console.log(
  `✓ content valid — ${projectCount} projects, ${experienceCount} experiences across ${experienceYears} years`,
)
