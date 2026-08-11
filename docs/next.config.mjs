import nextMDX from '@next/mdx'

import { recmaPlugins } from './src/mdx/recma.mjs'
import { rehypePlugins } from './src/mdx/rehype.mjs'
import { remarkPlugins } from './src/mdx/remark.mjs'
import withSearch from './src/mdx/search.mjs'

const withMDX = nextMDX({
  options: {
    remarkPlugins,
    rehypePlugins,
    recmaPlugins,
  },
})

/**
 * Built as static files, because GitHub Pages is a file server.
 *
 * `trailingSlash` writes each page as `<route>/index.html` rather than
 * `<route>.html`, which is the one arrangement a plain file server is
 * guaranteed to resolve without a rewrite rule. It also means every URL ends
 * in a slash — see `useRoute`, which is where that is accounted for.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  /*
   * This directory, not whatever Next infers from looking upward for a
   * lockfile. The site is one project inside a repository that is mostly not a
   * site, sitting in a tree of sibling repositories that are also not.
   */
  outputFileTracingRoot: import.meta.dirname,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: {
    // No server to resize anything on the way out.
    unoptimized: true,
  },
}

export default withSearch(withMDX(nextConfig))
