import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contacts } from './index'

/**
 * The generated crawler-facing files must point at things that exist.
 *
 * llms.txt once linked a CV that had been renamed. Because vercel.json rewrites
 * every unmatched path to `/`, that dead link answered 200 with the homepage
 * instead of 404, so nothing surfaced it — a model following the link would have
 * read the site's markup as the résumé.
 */
describe('discoverability artifacts', () => {
  const llms = readFileSync('public/llms.txt', 'utf8')
  const html = readFileSync('index.html', 'utf8')
  const cv = contacts.find((line) => line.href.endsWith('.pdf'))

  it('links a CV that is actually published', () => {
    expect(cv).toBeDefined()
    expect(existsSync(`public${cv!.href}`)).toBe(true)
  })

  it('advertises the same CV in llms.txt and in the structured data', () => {
    expect(llms).toContain(cv!.href)
    expect(html).toContain(cv!.href)
  })

  it('never advertises a path that no longer ships', () => {
    for (const stale of ['cv-erdafa-andikri.pdf', 'cv-erdafa-andikri_.pdf']) {
      expect(existsSync(`public/${stale}`)).toBe(false)
      expect(llms).not.toContain(`/${stale}`)
      expect(html).not.toContain(`/${stale}`)
    }
  })

  it('lists every external contact route as a sameAs identity', () => {
    for (const line of contacts.filter((c) => c.external)) {
      expect(html).toContain(line.href)
      expect(llms).toContain(line.href)
    }
  })

  it('keeps llms.txt generated rather than hand-edited', () => {
    expect(llms).toContain('do not edit by hand')
  })
})
