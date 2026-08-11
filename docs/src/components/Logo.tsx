import clsx from 'clsx'

/**
 * The mark, drawn rather than fetched.
 *
 * `public/brand/` ships this as a pair of files — one carrying a near-black
 * ground for light surfaces, one without it for dark — and the difference
 * between them is a single circle. Inlined here, that difference is a class
 * instead of a second request, so the mark can't lag a theme change or arrive
 * after the page around it.
 *
 * Micro geometry, from `brand/dark/svg/streetmesh-mark-dark-micro.svg`: wider
 * junctions, so the two roundabout islands survive at the 24px the chrome
 * draws it at. Don't scale this one up — above 32px the small or primary mark
 * is the correct drawing.
 */
export function Mark(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="4 4 92 92" role="img" aria-label="StreetMesh" {...props}>
      <defs>
        <clipPath id="streetmesh-mark">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      {/*
        The ground. Light surfaces only: the fabric green sits at about 74%
        luminance and has roughly 1.15:1 contrast against white, so on a light
        page the mark has to bring its own darkness. On a dark one the streets
        are meant to let the page through.
      */}
      <circle cx="50" cy="50" r="46" fill="#14181A" className="dark:hidden" />
      <g clipPath="url(#streetmesh-mark)">
        <g transform="rotate(22 50 50)">
          <g fill="#00FF99">
            <path d="M-7 -14 H31 V10.168 A12 12 0 0 0 21.168 20 H-7 Z" />
            <path d="M35 -14 H65 V20 H44.832 A12 12 0 0 0 35 10.168 Z" />
            <rect x="69" y="-14" width="50" height="66" rx="1.5" />
            <path d="M-7 24 H21.168 A12 12 0 0 0 31 33.832 V52 H-7 Z" />
            <path d="M44.832 24 H65 V66.168 A12 12 0 0 0 55.168 76 H35 V33.832 A12 12 0 0 0 44.832 24 Z" />
            <rect x="-7" y="56" width="38" height="60" rx="1.5" />
            <path d="M69 56 H119 V76 H78.832 A12 12 0 0 0 69 66.168 Z" />
            <path d="M35 80 H55.168 A12 12 0 0 0 65 89.832 V116 H35 Z" />
            <path d="M78.832 80 H119 V116 H69 V89.832 A12 12 0 0 0 78.832 80 Z" />
          </g>
          <g fill="#FFFFFF">
            <circle cx="33" cy="22" r="8" />
            <circle cx="67" cy="78" r="8" />
          </g>
        </g>
      </g>
    </svg>
  )
}

/**
 * Mark and name together.
 *
 * The brand package deliberately ships no wordmark — no typeface has been
 * chosen, and the reasoning is that other implementers will set the StreetMesh
 * name in their own documents, so a face they already have gets reproduced
 * correctly far more often than a licensed one does. The name is set in the
 * site's own type for the same reason.
 */
export function Logo({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={clsx('flex items-center gap-2.5', className)} {...props}>
      <Mark className="h-full w-auto" />
      <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
        StreetMesh
      </span>
    </div>
  )
}
