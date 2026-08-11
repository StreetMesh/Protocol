'use client'

import { Button } from '@/components/Button'
import { sourceOf } from '@/lib/site'
import { useRoute } from '@/lib/useRoute'

/**
 * The foot of every page, and the closest thing a specification has to a
 * comment box.
 *
 * The template shipped a "was this page helpful?" form with nothing behind it,
 * which collects an opinion and drops it. This asks for the same thing and
 * sends it somewhere it can be argued with.
 */
export function SuggestChanges() {
  const pathname = useRoute()

  return (
    <div className="flex items-center justify-center gap-6 border-t border-zinc-900/5 pt-8 md:justify-start dark:border-white/5">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Something here wrong, or missing?
      </p>
      <Button href={sourceOf(pathname)} variant="secondary" arrow="right">
        Suggest changes
      </Button>
    </div>
  )
}
