import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-layout-grid',
  title: 'Layout reflow: filter, sort, expand',
  group: 'Motion library + Tailwind',
  order: 230,
  summary:
    'Add the layout prop and siblings glide to their new slots when a grid is filtered, a list is re-sorted or an accordion opens. A CSS transition cannot animate a change in grid position, so use Motion for reflow; for a single height change, plain Tailwind is enough.',
  tailwind: ['grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]', 'grid-rows-[0fr]', 'grid-rows-[1fr]', 'transition-[grid-template-rows]', 'overflow-hidden', 'tabular-nums'],
}

const CHIP = 'focus-ring cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'
const CHIP_IDLE = 'border-line bg-surface text-muted hover:border-accent hover:text-ink'
const CHIP_ON = 'border-accent bg-accent text-surface'

/* ==========================================================================
   1. Filterable grid: layout + popLayout
   ========================================================================== */
const ARTICLES = [
  { id: 1, tag: 'Layout', mins: 4, title: 'Subgrid keeps card rows aligned' },
  { id: 2, tag: 'Theming', mins: 6, title: 'Colour tokens with oklch' },
  { id: 3, tag: 'Layout', mins: 5, title: 'Container query units' },
  { id: 4, tag: 'Variants', mins: 3, title: 'Style a parent with has-*' },
  { id: 5, tag: 'Theming', mins: 7, title: 'Write your first @utility' },
  { id: 6, tag: 'Motion', mins: 5, title: 'Springs for press feedback' },
  { id: 7, tag: 'Variants', mins: 4, title: 'Stack variants without tears' },
  { id: 8, tag: 'Motion', mins: 6, title: 'Reorder lists by dragging' },
]
const TAGS = ['All', ...new Set(ARTICLES.map((a) => a.tag))]

// full class strings so Tailwind's scanner can see them
const TAG_STYLE = {
  Layout: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  Theming: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  Variants: 'bg-amber-500/20 text-amber-900 dark:text-amber-300',
  Motion: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
}

function FilterableGrid() {
  const [tag, setTag] = useState('All')
  const shown = useMemo(() => ARTICLES.filter((a) => tag === 'All' || a.tag === tag), [tag])

  return (
    <div className="grid gap-4">
      <div role="group" aria-label="Filter articles by topic" className="flex flex-wrap gap-2">
        {TAGS.map((t) => {
          const count = t === 'All' ? ARTICLES.length : ARTICLES.filter((a) => a.tag === t).length
          return (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className={cn(CHIP, tag === t ? CHIP_ON : CHIP_IDLE)}>
              {t} <span className="tabular-nums opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {/* popLayout takes leaving cards out of the flow at once, so the rest can reflow while they fade */}
      <ul className="relative m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3 p-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((a) => (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
              className="grid min-h-28 content-between gap-3 rounded-2xl border border-line bg-surface p-3"
            >
              <span className={cn('w-fit rounded-full px-2 py-0.5 font-mono text-[11px] font-medium', TAG_STYLE[a.tag])}>{a.tag}</span>
              <span className="font-display text-[15px] leading-snug font-semibold text-balance">{a.title}</span>
              <span className="text-xs text-muted">{a.mins} min read</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="m-0 text-sm text-muted" role="status">
        Showing {shown.length} of {ARTICLES.length} articles.
      </p>
    </div>
  )
}

/* ==========================================================================
   2. Sortable ranking: the rows swap places, the bars grow
   ========================================================================== */
const START = [
  { id: 'vite', name: 'vite-plugin-tailwind', value: 72 },
  { id: 'forms', name: 'tailwind-forms', value: 38 },
  { id: 'merge', name: 'tailwind-merge', value: 91 },
  { id: 'typo', name: 'tailwind-typography', value: 55 },
  { id: 'motion', name: 'motion', value: 64 },
]

function SortableBars() {
  const [rows, setRows] = useState(START)
  const [sort, setSort] = useState('value')

  const ordered = useMemo(() => {
    const copy = [...rows]
    return sort === 'value' ? copy.sort((a, b) => b.value - a.value) : copy.sort((a, b) => a.name.localeCompare(b.name))
  }, [rows, sort])

  const shuffle = () => setRows((r) => r.map((row) => ({ ...row, value: 8 + Math.round(Math.random() * 90) })))

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={sort === 'value'} onClick={() => setSort('value')} className={cn(CHIP, sort === 'value' ? CHIP_ON : CHIP_IDLE)}>
          Most installs
        </button>
        <button type="button" aria-pressed={sort === 'name'} onClick={() => setSort('name')} className={cn(CHIP, sort === 'name' ? CHIP_ON : CHIP_IDLE)}>
          A to Z
        </button>
        <button type="button" onClick={shuffle} className={cn(CHIP, CHIP_IDLE, 'ml-auto')}>
          Shuffle numbers
        </button>
      </div>

      <ol className="m-0 grid list-none gap-2 p-0">
        {ordered.map((row, i) => (
          <motion.li
            key={row.id}
            // layout="position": the row only moves, it never changes size, so it is never stretched mid-flight
            layout="position"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="grid gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5"
          >
            <div className="flex items-baseline gap-2 text-sm">
              <span className="w-4 font-mono text-xs text-muted tabular-nums">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
              <span className="font-mono text-xs text-muted tabular-nums">{row.value}k</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stage">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={false}
                animate={{ width: `${row.value}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              />
            </div>
          </motion.li>
        ))}
      </ol>
      <p className="m-0 text-xs text-muted">Sample data: weekly installs in thousands.</p>
    </div>
  )
}

/* ==========================================================================
   3. Accordion: Motion's height auto vs the plain Tailwind grid-rows trick
   ========================================================================== */
const FAQ = [
  { id: 'config', q: 'Do I still need tailwind.config.js?', a: 'No. Version 4 reads its configuration from CSS: @theme for tokens, @plugin for plugins and @source for scanning rules.' },
  { id: 'colors', q: 'How are colours defined now?', a: 'As CSS variables inside @theme, using oklch by default. Every colour becomes a utility and a variable you can read at runtime.' },
  { id: 'bundler', q: 'Can I skip the bundler?', a: 'Yes. Use the standalone CLI, the PostCSS plugin or the Vite plugin, or the browser build for quick prototypes.' },
]

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('size-4 shrink-0 text-muted transition-transform duration-300 motion-reduce:transition-none', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const TRIGGER = 'focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium'

function MotionAccordion() {
  const [openId, setOpenId] = useState('config')
  return (
    <div className="grid gap-1 rounded-2xl border border-line bg-surface p-1">
      {FAQ.map((item) => {
        const open = openId === item.id
        return (
          <div key={item.id} className="rounded-xl">
            <h4 className="m-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`mo-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className={TRIGGER}
              >
                {item.q}
                <Chevron open={open} />
              </button>
            </h4>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`mo-${item.id}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                  className="overflow-hidden"
                >
                  <p className="m-0 px-3 pb-3 text-sm text-pretty text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function CssAccordion() {
  const [openId, setOpenId] = useState('config')
  return (
    <div className="grid gap-1 rounded-2xl border border-line bg-surface p-1">
      {FAQ.map((item) => {
        const open = openId === item.id
        return (
          <div key={item.id} className="rounded-xl">
            <h4 className="m-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`css-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className={TRIGGER}
              >
                {item.q}
                <Chevron open={open} />
              </button>
            </h4>
            {/* the grid-rows trick: a 0fr row collapses to nothing, 1fr grows to the content's height */}
            <div
              id={`css-${item.id}`}
              role="region"
              inert={!open}
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="m-0 px-3 pb-3 text-sm text-pretty text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Accordions() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(15rem,100%),1fr))] items-start gap-4">
      <div className="grid gap-2">
        <p className="m-0 font-mono text-xs tracking-widest text-muted uppercase">Motion: height auto</p>
        <MotionAccordion />
      </div>
      <div className="grid gap-2">
        <p className="m-0 font-mono text-xs tracking-widest text-muted uppercase">Tailwind only: grid-rows</p>
        <CssAccordion />
      </div>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionLayoutGrid() {
  return (
    <Feature
      id="motion-layout-grid"
      title="Reflow without jumping"
      parts={['layout', 'layout="position"', 'mode="popLayout"', 'height: "auto"', 'grid-rows-[0fr]']}
      docs={{ href: 'https://motion.dev/docs/react-layout-animations', label: 'Motion: layout animations' }}
      description={
        <>
          <p>
            When a render changes where an element sits, <code>layout</code> measures before and after, then animates the difference with a transform.
            Filtering, sorting and inserting all work with no per-case code.
          </p>
          <p>
            <strong>Plain Tailwind</strong> is enough when one element changes one property. The accordion on the right animates height with{' '}
            <code>grid-rows-[0fr]</code> to <code>grid-rows-[1fr]</code> and <code>transition-[grid-template-rows]</code>.
          </p>
          <p>
            <strong>Reach for Motion</strong> when elements must move to new grid cells, leave while the rest reflow, or when the animation has to
            be interrupted and redirected mid-flight.
          </p>
        </>
      }
    >
      <Example
        title="Filter chips: cards leave, the rest reflow"
        lang="jsx"
        code={`<ul className="relative grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
  <AnimatePresence mode="popLayout" initial={false}>
    {shown.map((a) => (
      <motion.li key={a.id} layout
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="rounded-2xl border border-line bg-surface p-3" />
    ))}
  </AnimatePresence>
</ul>`}
      >
        <FilterableGrid />
      </Example>

      <Example
        title="Ranking: re-sort and re-shuffle"
        lang="jsx"
        code={`{sorted.map((row) => (
  <motion.li key={row.id} layout="position"
    transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
    <motion.div className="h-full rounded-full bg-accent"
      animate={{ width: row.value + '%' }} />
  </motion.li>
))}`}
      >
        <SortableBars />
      </Example>

      <Example
        title="Accordion: Motion against the CSS grid-rows trick"
        lang="jsx"
        code={[
          {
            lang: 'jsx',
            label: 'Motion',
            text: `<AnimatePresence initial={false}>
  {open && (
    <motion.div className="overflow-hidden"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} />
  )}
</AnimatePresence>`,
          },
          {
            lang: 'jsx',
            label: 'Tailwind only',
            text: `<div inert={!open}
  className={cn('grid transition-[grid-template-rows,opacity] duration-300',
    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
  <div className="overflow-hidden">…</div>
</div>`,
          },
        ]}
      >
        <Accordions />
      </Example>
    </Feature>
  )
}
