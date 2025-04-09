import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  title: 'Protocol',
  description: 'A collection of Guides and APIs that establish the decentralized architecture of StreetMesh',

  theme: defaultTheme({
    logo: 'https://avatars.githubusercontent.com/u/206335802?s=400&u=df52d23f1e5fde57616a018ea44593df68293aa9&v=4',
    darkmode: 'enable', 
    navbar: ['/', '/get-started'],
  }),

  bundler: viteBundler(),
})
