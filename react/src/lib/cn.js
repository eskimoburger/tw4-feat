import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge needs to know about the custom utilities from src/index.css,
// otherwise it would treat `bg-dots` as a background *colour* and let a later
// `bg-surface` silently drop it. Everything else (bg-bg, text-ink, border-line…
// from the semantic @theme tokens) is understood out of the box.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-dots': ['bg-dots', { 'bg-dots': [(value) => /^\d+$/.test(value)] }],
      'focus-ring': ['focus-ring'],
      'prose-themed': ['prose-themed'],
    },
  },
})

/**
 * Class-name helper: clsx for conditionals/arrays/objects, then tailwind-merge
 * so the *last* conflicting Tailwind utility wins (cn('p-2', cond && 'p-4')).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
