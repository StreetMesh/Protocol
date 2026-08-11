'use client'

import { usePathname } from 'next/navigation'

/**
 * The current route, without the trailing slash.
 *
 * The site is exported as static files and served by GitHub Pages, so every
 * page is written as `<route>/index.html` and every URL ends in a slash —
 * which is the one arrangement a plain file server is guaranteed to resolve.
 * `usePathname` reports the URL as it is, so `/guides/design/` comes back
 * while the navigation, the section index, and the source links are all keyed
 * on `/guides/design`.
 *
 * Trimmed here, once, rather than at each of those comparisons.
 */
export function useRoute(): string {
  const pathname = usePathname()

  return pathname === '/' ? pathname : pathname.replace(/\/$/, '')
}
