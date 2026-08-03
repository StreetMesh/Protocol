import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from 'vuepress-plugin-md-enhance'

export default defineUserConfig({
  lang: 'en-US',

  title: 'StreetMesh Protocol',
  description: 'A collection of Guides and APIs that establish the design and architecture for a spatial Web.',

  head: [
    // Two favicons, because the mark carries its own near-black ground: correct
    // on a light tab strip and invisible against a dark one.
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png', media: '(prefers-color-scheme: light)' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-dark-32.png', media: '(prefers-color-scheme: dark)' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { property: 'og:image', content: 'https://protocol.streetmesh.com/og-image-1200x630.png' }],
  ],

  theme: defaultTheme({
    /*
     * Served from here rather than hotlinked from a GitHub avatar, which is
     * what this used to be — an address outside our control, resized by
     * somebody else's CDN, and carrying a cache-busting query string that
     * would have gone stale the moment the avatar changed.
     *
     * Two files, because the green only works over dark and the default mark
     * supplies its own ground. On a dark page that ground becomes a visible
     * black disc, so the dark variant drops it and lets the page show through.
     */
    logo: '/brand/svg/streetmesh-mark.svg',
    logoDark: '/brand/dark/svg/streetmesh-mark-dark.svg',
    darkmode: 'enable',
    contributors: false,
    navbar: [
      {
        text: 'Guides',
        prefix: '/guides',
        children: [
          {
            text: 'Introduction',
            link: '/guides/introduction',
          },
          {
            text: 'Design',
            link: '/guides/design',
          },
          {
            text: 'Components',
            link: '/guides/components',
          },
          {
            text: 'Technology',
            link: '/guides/technology',
          },
          {
            text: 'Tools',
            link: '/guides/tools',
          },
        ],
      },
    ],
    // GitHub repository
    repo: 'StreetMesh/Protocol',

    // Directory where your docs are located in the repo
    docsDir: 'docs',

    // Customize the text of the link
    editLinkText: 'Suggest changes',
  }),

  bundler: viteBundler(),

  plugins: [
    mdEnhancePlugin({
      mermaid: true,
    }),
  ],
})
