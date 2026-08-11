/**
 * The handful of addresses the site needs to know about itself.
 *
 * Here rather than scattered through components because the repository moves
 * as a unit: rename it or move the docs out of `docs/` and every link built
 * from these has to follow.
 */
export const site = {
  name: 'StreetMesh Protocol',
  description:
    'A collection of guides and APIs that establish the design and architecture for a spatial Web.',
  url: 'https://protocol.streetmesh.com',
  organization: 'https://github.com/StreetMesh',
  repository: 'https://github.com/StreetMesh/Protocol',
  /** Where the MDX for a page lives, relative to the repository root. */
  pagesDirectory: 'docs/src/app',
} as const

/**
 * The GitHub editor for the page at a given route.
 *
 * The route is the directory, which is what the app router promises: a page at
 * `/guides/design` is `guides/design/page.mdx`, and the home page is the one
 * route with no directory of its own.
 */
export function sourceOf(pathname: string): string {
  const directory = pathname.replace(/^\/|\/$/g, '')
  const file = directory === '' ? 'page.mdx' : `${directory}/page.mdx`

  return `${site.repository}/edit/main/${site.pagesDirectory}/${file}`
}
