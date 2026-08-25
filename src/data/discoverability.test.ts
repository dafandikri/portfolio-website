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
  const manifest = JSON.parse(readFileSync('public/matrix-v2-site.webmanifest', 'utf8')) as {
    icons: Array<{ src: string; sizes: string; type: string; purpose: string }>
  }
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

  it('publishes the Matrix favicon in Safari and cross-browser fallback formats', () => {
    for (const asset of [
      'favicon.svg',
      'favicon.ico',
      'apple-touch-icon.png',
      'matrix-v2-favicon.svg',
      'matrix-v2-favicon.ico',
      'matrix-v2-favicon-32.png',
      'matrix-v2-favicon-16.png',
      'matrix-v2-apple-touch.png',
      'matrix-v2-safari-pinned-tab.svg',
      'matrix-v2-site.webmanifest',
      'matrix-v2-icon-192.png',
      'matrix-v2-icon-512.png',
      'matrix-v2-icon-maskable-1024.png',
    ]) {
      expect(existsSync(`public/${asset}`)).toBe(true)
    }

    expect(html).toContain('/matrix-v2-favicon.ico')
    expect(html).toContain('/matrix-v2-favicon.svg')
    expect(html).toContain('/matrix-v2-apple-touch.png')
    expect(html).toContain('/matrix-v2-safari-pinned-tab.svg')
    expect(html).toContain('/matrix-v2-site.webmanifest')
  })

  it('keeps the approved red and blue Matrix pills in the versioned artwork', () => {
    const icon = readFileSync('public/matrix-v2-favicon.svg', 'utf8')

    expect(icon).toContain('id="redBody"')
    expect(icon).toContain('id="blueBody"')
    expect(icon).toContain('#df1a15')
    expect(icon).toContain('#1666e8')
  })

  it('uses a valid Safari mask and versioned manifest children', () => {
    const mask = readFileSync('public/matrix-v2-safari-pinned-tab.svg', 'utf8')
    expect(mask).toContain('viewBox="0 0 16 16"')
    expect(mask).toContain('fill="#000"')

    expect(manifest.icons).toEqual([
      {
        src: '/matrix-v2-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/matrix-v2-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/matrix-v2-icon-maskable-1024.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ])
    for (const icon of manifest.icons) expect(existsSync(`public${icon.src}`)).toBe(true)

    const maskable = readFileSync('public/matrix-v2-icon-maskable-1024.png')
    expect([maskable.readUInt32BE(16), maskable.readUInt32BE(20)]).toEqual([1024, 1024])
    // PNG colour type 2 is opaque true-colour; maskable art must be full-bleed.
    expect(maskable[25]).toBe(2)
  })
})
