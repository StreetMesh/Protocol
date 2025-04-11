import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from 'vuepress-plugin-md-enhance'

export default defineUserConfig({
  lang: 'en-US',

  title: 'StreetMesh Protocol',
  description: 'A collection of Guides and APIs that establish the design and architecture for a spatial Web.',

  theme: defaultTheme({
    logo: 'https://avatars.githubusercontent.com/u/206335802?s=400&u=df52d23f1e5fde57616a018ea44593df68293aa9&v=4',
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

    // Enable "Edit this page" link
    editLinks: true,

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
