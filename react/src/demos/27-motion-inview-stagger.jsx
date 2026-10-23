import { useRef, useState } from 'react'
import { motion, stagger } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-inview-stagger',
  title: 'whileInView: staggered reveals',
  group: 'Motion library + Tailwind',
  order: 270,
  summary:
    'whileInView plus variants and stagger() reveal content as it scrolls into view: grouped lists, a grid that ripples from any origin and a timeline. Tailwind\'s starting: variant can fade something in on mount, but only Motion knows when an element enters the viewport.',
  tailwind: ['overflow-y-auto', 'grid-cols-3', 'rounded-full', 'bg-sky-500/15', 'text-pretty', 'before:absolute', 'dark:'],
}

const CHIP = 'focus-ring cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'
const CHIP_IDLE = 'border-line bg-surface text-muted hover:border-accent hover:text-ink'
const CHIP_ON = 'border-accent bg-accent text-surface'

/* ==========================================================================
   1. Grouped reveal: the parent owns the timing, children inherit the labels
   ========================================================================== */
const GROUPS = [
  { title: 'Plan', blurb: 'Decide before you type.', items: ['Name your design tokens', 'List the utilities you rely on', 'Pick a migration order'] },
  { title: 'Build', blurb: 'Small steps, each shippable.', items: ['Move colours into @theme', 'Replace the config file', 'Run the upgrade tool'] },
  { title: 'Ship', blurb: 'Prove it with numbers.', items: ['Compare CSS size', 'Check dark mode screens', 'Announce it to the team'] },
]

// the parent only sets timing: delayChildren: stagger() spaces its children 90ms apart
const groupVariants = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.09) } },
}
const childVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.55, bounce: 0.15 } },
}

function ScrollReveal() {
  const scroller = useRef(null)
  const [repeat, setRepeat] = useState(false)

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={repeat} onClick={() => setRepeat((r) => !r)} className={cn(CHIP, repeat ? CHIP_ON : CHIP_IDLE)}>
          Replay on every pass
        </button>
        <span className="text-xs text-muted">{repeat ? 'Leaving the viewport hides the group again.' : 'Each group reveals once.'}</span>
      </div>

      {/* key remounts the sections, so the new viewport options start from a clean state */}
      <div ref={scroller} tabIndex={0} role="region" aria-label="Migration checklist: scroll to reveal" key={String(repeat)} className="focus-ring grid h-80 content-start gap-4 overflow-y-auto rounded-2xl border border-line bg-surface p-3">
        {GROUPS.map((group, gi) => (
          <motion.section
            key={group.title}
            variants={groupVariants}
            initial="hidden"
            whileInView="show"
            // root: the scroll box counts as the viewport, not the page; amount: how much must show before it fires
            viewport={{ root: scroller, once: !repeat, amount: 0.4 }}
            className="grid min-h-60 content-start gap-3 rounded-xl bg-stage p-4"
          >
            <motion.div variants={childVariants} className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-muted tabular-nums">0{gi + 1}</span>
              <h4 className="m-0 font-display text-xl font-semibold">{group.title}</h4>
              <span className="text-sm text-muted">{group.blurb}</span>
            </motion.div>
            <ul className="m-0 grid list-none gap-2 p-0">
              {group.items.map((item) => (
                <motion.li key={item} variants={childVariants} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.section>
        ))}
        <p className="m-0 pb-2 text-center text-xs text-muted">End of the checklist.</p>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. Grid ripple: stagger() accepts an origin
   ========================================================================== */
const TOOLS = ['Slack', 'GitHub', 'Linear', 'Notion', 'Figma', 'Stripe', 'Sentry', 'Vercel', 'Zapier']
const TILE_TONES = [
  'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  'bg-amber-500/20 text-amber-900 dark:text-amber-300',
  'bg-rose-500/15 text-rose-800 dark:text-rose-300',
]
const ORIGINS = ['first', 'center', 'last']

const tileVariants = {
  hidden: { opacity: 0, scale: 0.55 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.5, bounce: 0.3 } },
}

function Ripple() {
  const [from, setFrom] = useState('center')

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-4">
      <div role="group" aria-label="Stagger origin" className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">from:</span>
        {ORIGINS.map((o) => (
          <button key={o} type="button" aria-pressed={from === o} onClick={() => setFrom(o)} className={cn(CHIP, 'font-mono', from === o ? CHIP_ON : CHIP_IDLE)}>
            {o}
          </button>
        ))}
      </div>
      <motion.ul
        // the key remounts the grid, which replays the reveal with the new origin
        key={from}
        variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.08, { from }) } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="m-0 grid list-none grid-cols-3 gap-2 p-0"
      >
        {TOOLS.map((name, i) => (
          <motion.li key={name} variants={tileVariants} className="grid justify-items-center gap-1.5 rounded-xl border border-line bg-surface px-2 py-3">
            <span aria-hidden="true" className={cn('grid size-9 place-items-center rounded-full font-display text-base font-semibold', TILE_TONES[i % TILE_TONES.length])}>
              {name[0]}
            </span>
            <span className="text-sm font-medium">{name}</span>
          </motion.li>
        ))}
      </motion.ul>
      <p className="m-0 text-xs text-muted">Press Replay above, or pick another origin: each choice reruns the reveal.</p>
    </div>
  )
}

/* ==========================================================================
   3. Timeline: every item watches the viewport on its own
   ========================================================================== */
const EVENTS = [
  ['Jan', 'Kickoff', 'Three people, one prototype and a shared spreadsheet.'],
  ['Mar', 'Private beta', 'Forty teams invited. The first bug report arrived in eleven minutes.'],
  ['Jun', 'Public launch', 'The pricing page went live and the waiting list emptied by lunch.'],
  ['Sep', '10,000 teams', 'A quiet milestone, celebrated with a long overdue refactor.'],
  ['Dec', 'Version two', 'A full rewrite of the editor, shipped behind a flag first.'],
]

const eventVariants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', duration: 0.55, bounce: 0.15 } },
}

function Timeline() {
  const scroller = useRef(null)

  return (
    <div ref={scroller} tabIndex={0} role="region" aria-label="Company timeline: scroll to reveal" className="focus-ring h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-4">
      <ol className="relative m-0 grid list-none gap-10 p-0 pt-4 pb-24 before:absolute before:top-0 before:bottom-0 before:left-[0.45rem] before:w-px before:bg-line">
        {EVENTS.map(([month, title, body]) => (
          <motion.li
            key={title}
            variants={eventVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ root: scroller, once: true, amount: 0.8 }}
            className="relative grid gap-1 pl-8"
          >
            <span aria-hidden="true" className="absolute top-1.5 left-0 size-[0.95rem] rounded-full border-2 border-accent bg-surface" />
            <span className="font-mono text-xs tracking-widest text-accent uppercase">{month}</span>
            <h4 className="m-0 font-display text-lg font-semibold">{title}</h4>
            <p className="m-0 text-sm text-pretty text-muted">{body}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionInViewStagger() {
  return (
    <Feature
      id="motion-inview-stagger"
      title="Reveal on scroll"
      parts={['whileInView', 'viewport', 'variants', 'stagger()', 'delayChildren', 'once', 'amount']}
      docs={{ href: 'https://motion.dev/docs/react-scroll-animations', label: 'Motion: scroll animations' }}
      description={
        <>
          <p>
            <code>whileInView</code> animates to a target once the element is visible. Put it on a parent with <code>variants</code> and the children
            follow, spaced by <code>delayChildren: stagger(0.09)</code>. In Motion 14, this replaces the older <code>staggerChildren</code>.
          </p>
          <p>
            <strong>Plain Tailwind</strong> can fade something in on mount with <code>starting:</code> or <code>animate-*</code>, and it is the
            simplest option for hero content. It has no idea whether an element is on screen.
          </p>
          <p>
            <strong>Reach for Motion</strong> when the reveal depends on scroll position or must be choreographed across many children. Set{' '}
            <code>viewport.root</code> to the scroll box when the content is not scrolled by the page.
          </p>
        </>
      }
    >
      <Example
        title="Checklist groups: variants and stagger()"
        lang="jsx"
        code={`const group = { hidden: {}, show: { transition: { delayChildren: stagger(0.09) } } }
const child = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.55 } },
}

<motion.section variants={group} initial="hidden" whileInView="show"
  viewport={{ root: scroller, once: true, amount: 0.4 }}>
  <motion.li variants={child}>…</motion.li>
</motion.section>`}
      >
        <ScrollReveal />
      </Example>

      <Example
        title="Grid ripple: stagger from first, center or last"
        lang="jsx"
        replay
        code={`<motion.ul
  variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.08, { from: 'center' }) } } }}
  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}
  className="grid grid-cols-3 gap-2">
  <motion.li variants={tile} className="rounded-xl border border-line bg-surface" />
</motion.ul>`}
      >
        <Ripple />
      </Example>

      <Example
        title="Timeline: each item reveals itself"
        lang="jsx"
        code={`<motion.li variants={event} initial="hidden" whileInView="show"
  viewport={{ root: scroller, once: true, amount: 0.8 }}
  className="relative grid gap-1 pl-8" />`}
      >
        <Timeline />
      </Example>
    </Feature>
  )
}
