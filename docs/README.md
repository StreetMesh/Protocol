# protocol.streetmesh.com

The site that publishes the guides. Next.js, MDX, Tailwind, exported to static
files and served by GitHub Pages from the `gh-pages` branch — see
[`.github/workflows/deploy-docs.yml`](../.github/workflows/deploy-docs.yml).

```sh
npm install
npm run dev      # http://localhost:3070
npm run build    # writes out/, which is what gets deployed
```

Locally the site is also at **https://protocol.streetmesh.test**, an Nginx
proxy in front of that dev server:

```sh
herd proxy protocol.streetmesh http://127.0.0.1:3070 --secure
```

The port is pinned in the `dev` script rather than left to Next's default,
because the proxy points at a number and 3000 is the first port every other
project asks for.

## Where things are

| | |
|---|---|
| `src/app/page.mdx` | The front page |
| `src/app/guides/*/page.mdx` | A guide. The directory is the URL |
| `src/components/Navigation.tsx` | The sidebar, and the links that are not guides |
| `src/lib/site.ts` | Addresses the site needs to know about itself |
| `public/brand/` | The logo package. `public/brand/README.md` is the brand book |

To add a guide, add `src/app/guides/<name>/page.mdx` with a `metadata` export,
and add it to `navigation` in `Navigation.tsx`. Headings, the search index, and
the previous/next links at the foot of the page all follow from those two.

## Licenses

Two, and the split matters.

The **code** is [Tailwind Plus Protocol](https://tailwindcss.com/plus), under
[`LICENSE.md`](LICENSE.md). It is a commercial template: the license permits
building sites with it and does not permit redistributing the template itself.

The **guides** — everything in `src/app/**/page.mdx` — are this repository's
content, under CC BY-NC-SA 4.0 along with the rest of it.
