import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

/**
 * The guides after the introduction, which has the front page to itself.
 *
 * Four of these are still to be written. They are listed anyway: an outline
 * with holes in it says more about where the work is than a shorter list that
 * pretends the shape is settled.
 */
const guides = [
  {
    href: '/guides/design',
    name: 'Design',
    description:
      'The experience of a spatial Web, before any of the technology that carries it.',
  },
  {
    href: '/guides/components',
    name: 'Components',
    description:
      'The pieces a spatial Web is assembled from, and what each one is responsible for.',
  },
  {
    href: '/guides/technology',
    name: 'Technology',
    description:
      'The open standards underneath — HTTP, DIDs, OAuth, ATProtocol — and how they fit together.',
  },
  {
    href: '/guides/tools',
    name: 'Tools',
    description:
      'What you need on hand to build a place, and how to get a server of your own running.',
  },
]

export function Guides() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="guides">
        Guides
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
