import { useId, useState } from 'react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * Staggering with one CSS variable per item.
 *
 * React hands every item its position as a custom property:
 *     <li style={{ '--i': index }}>
 * and a single arbitrary-value utility turns that number into a delay:
 *     delay-[calc(var(--i)*60ms)]
 * Every item shares the same classes. Reverse order, a different step size or
 * a different curve are one-class edits, and nothing needs a timer or a loop.
 *
 * Note for hover effects: the delay applies to EVERY transition on the same
 * element, including hover. Keep the staggered element and the hovered element
 * separate (an <li> that staggers, a card inside it that reacts to the pointer).
 */
export const meta = {
  id: 'stagger-list',
  title: 'Staggered lists with CSS variables',
  group: 'Tailwind motion in React',
  order: 130,
  summary: 'Each item gets style={{ "--i": index }} and delay-[calc(var(--i)*60ms)]: open and close menus, replayable grids, word reveals and sibling-index().',
  tailwind: [
    'delay-[calc(var(--i)*60ms)]',
    'delay-[calc(var(--i)*var(--step))]',
    'group-data-[open=true]:delay-[calc(var(--i)*60ms)]',
    'delay-[calc(sibling-index()*60ms)]',
    'starting:translate-y-4',
    'blur-sm',
    'transition-[opacity,translate,filter]',
    'motion-reduce:transition-none',
  ],
}

/* ---------- small shared pieces ---------- */

function Button({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn('focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-accent motion-reduce:transition-none', className)}
    >
      {children}
    </button>
  )
}

function Chevron({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  )
}

/* ---------- 1. A menu that cascades in and unwinds in reverse ---------- */

const ACTIONS = [
  ['New deploy', 'Ship the current branch'],
  ['Roll back', 'Return to the last good build'],
  ['Add variable', 'Secrets stay encrypted'],
  ['Invite teammate', 'Editors can deploy'],
  ['View logs', 'Live tail, last 24 hours'],
  ['Open settings', 'Domains, billing, members'],
]

function CascadeMenu() {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* --n is set once on the wrapper; every descendant can read it */}
      <div data-open={open} style={{ '--n': ACTIONS.length }} className="group overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="focus-ring flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-semibold"
        >
          <span className="flex-1">Quick actions</span>
          <Chevron className="size-4 text-muted transition-transform duration-300 group-data-[open=true]:rotate-180 motion-reduce:transition-none" />
        </button>

        {/* the card itself collapses AFTER the last item has left: a delay of n x step when closing, none when opening */}
        <div
          id={id}
          inert={!open}
          className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out delay-[calc(var(--n)*35ms)] group-data-[open=true]:grid-rows-[1fr] group-data-[open=true]:delay-0 motion-reduce:transition-none"
        >
          <ul className="m-0 min-h-0 list-none overflow-hidden p-0">
            {ACTIONS.map(([title, note], i) => (
              <li
                key={title}
                style={{ '--i': i }}
                className="translate-y-3 opacity-0 transition-[opacity,translate] duration-300 ease-out delay-[calc((var(--n)_-_1_-_var(--i))*35ms)] group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100 group-data-[open=true]:delay-[calc(var(--i)*60ms)] motion-reduce:transition-none"
              >
                <button
                  type="button"
                  className="focus-ring grid w-full cursor-pointer gap-0.5 border-t border-line px-4 py-2.5 text-left transition-colors hover:bg-accent-soft motion-reduce:transition-none"
                >
                  <span className="text-sm font-medium">{title}</span>
                  <span className="text-xs text-muted">{note}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ---------- 2. A tile grid you can replay with a different step ---------- */

const TILES = [
  ['Requests', '1.28M', '+12% vs last month'],
  ['Error rate', '0.21%', '-0.04 pt'],
  ['p95 latency', '284 ms', '-18 ms'],
  ['Deploys', '38', '6 this week'],
  ['Build time', '1m 48s', '-9 s'],
  ['Cache hit', '94%', '+2 pt'],
  ['Bandwidth', '412 GB', '41% of plan'],
  ['Seats', '8 of 10', '2 free'],
]

function TileGrid() {
  const rangeId = useId()
  const [step, setStep] = useState(70)
  const [run, setRun] = useState(0)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label htmlFor={rangeId} className="text-[13px] font-medium">
          Step between tiles
        </label>
        <input
          id={rangeId}
          type="range"
          min="0"
          max="200"
          step="10"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="focus-ring w-40 max-w-full accent-accent"
        />
        <output htmlFor={rangeId} className="min-w-12 font-mono text-xs text-muted">
          {step} ms
        </output>
        <Button onClick={() => setRun((n) => n + 1)} className="border-accent text-accent">
          Replay
        </Button>
      </div>

      {/* key={run}: a fresh mount runs every starting: rule again; --step is read by every tile */}
      <ul key={run} style={{ '--step': `${step}ms` }} className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
        {TILES.map(([label, value, note], i) => (
          <li
            key={label}
            style={{ '--i': i }}
            className="min-w-0 transition-[opacity,translate,scale] duration-500 ease-out delay-[calc(var(--i)*var(--step))] starting:translate-y-4 starting:scale-95 starting:opacity-0 motion-reduce:transition-none"
          >
            {/* the hover effect lives one element deeper, so it does not inherit the stagger delay */}
            <div className="h-full rounded-xl border border-line bg-surface p-3 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent motion-reduce:transition-none">
              <p className="m-0 truncate text-xs text-muted">{label}</p>
              <p className="m-0 mt-1 font-display text-xl font-semibold tracking-tight">{value}</p>
              <p className="m-0 mt-0.5 truncate text-xs text-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- 3. Word reveal ---------- */

const WORDS = 'Ship the small thing today, then the next one tomorrow.'.split(' ')

function WordReveal() {
  const [on, setOn] = useState(true)
  return (
    <div className="mx-auto grid max-w-xl gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setOn((v) => !v)} aria-pressed={on}>
          {on ? 'Hide words' : 'Reveal words'}
        </Button>
        <span className="font-mono text-xs text-muted">data-on={String(on)}</span>
      </div>
      {/* visible is the base style; hidden is a data-[on=false] override, and starting: repeats it so the first mount reveals too */}
      <p data-on={on} className="group m-0 font-display text-[clamp(1.5rem,6vw,2.25rem)] leading-tight font-bold tracking-tight text-balance">
        {WORDS.map((word, i) => (
          <span
            key={i}
            style={{ '--i': i }}
            className="mr-[0.28em] inline-block transition-[opacity,translate,filter] duration-500 ease-out delay-[calc(var(--i)*70ms)] starting:translate-y-[0.5em] starting:opacity-0 starting:blur-sm group-data-[on=false]:translate-y-[0.5em] group-data-[on=false]:opacity-0 group-data-[on=false]:blur-sm motion-reduce:transition-none"
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  )
}

/* ---------- 4. No variable at all: sibling-index() ---------- */

const STEPS = ['Connect your repository', 'Pick a region', 'Add environment variables', 'Run the first deploy', 'Invite your team']

const HAS_SIBLING_INDEX = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('transition-delay', 'calc(sibling-index() * 1ms)')

function SiblingIndexList() {
  const [on, setOn] = useState(true)
  return (
    <div className="mx-auto grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setOn((v) => !v)} aria-pressed={on}>
          {on ? 'Collapse checklist' : 'Expand checklist'}
        </Button>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${
            HAS_SIBLING_INDEX ? 'border-v43 text-v43' : 'border-v42 text-v42'
          }`}
        >
          {HAS_SIBLING_INDEX ? 'sibling-index() supported' : 'sibling-index() not supported here'}
        </span>
      </div>
      <ol data-on={on} className="group m-0 grid list-none gap-2 p-0">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm transition-[opacity,translate] duration-500 ease-out delay-[calc(sibling-index()*60ms)] group-data-[on=false]:-translate-x-4 group-data-[on=false]:opacity-0 motion-reduce:transition-none"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      {!HAS_SIBLING_INDEX && (
        <p className="m-0 text-xs text-pretty text-muted">
          This browser has not shipped <code className="font-mono">sibling-index()</code> yet, so the whole list moves together. The CSS-variable versions above work everywhere.
        </p>
      )}
    </div>
  )
}

/* ---------- the demo ---------- */

export default function StaggerList() {
  return (
    <div className="grid gap-6">
      <Feature
        title="One variable, one delay"
        since="4.0"
        parts={['style={{ "--i": i }}', 'delay-[calc(var(--i)*60ms)]', 'group-data-[open=true]:delay-[calc(var(--i)*60ms)]', 'delay-[calc(var(--i)*var(--step))]']}
        docs={{ href: 'https://tailwindcss.com/docs/transition-delay', label: 'transition-delay' }}
        description={
          <>
            <p>
              <code>--i</code> is the item index. <code>delay-[calc(var(--i)*60ms)]</code> multiplies it by the step, so item 0 starts at once and item 5 starts 300 ms
              later.
            </p>
            <p>
              Variants can swap the formula. The menu uses <code>(--n - 1 - --i)</code> for closing, so the last item leaves first and the order unwinds.
            </p>
          </>
        }
      >
        <Example
          title="Menu that cascades open and unwinds shut"
          lang="jsx"
          code={`<div data-open={open} style={{ '--n': items.length }} className="group">
  <ul className="grid grid-rows-[0fr] transition-[grid-template-rows]
             delay-[calc(var(--n)*35ms)]
             group-data-[open=true]:grid-rows-[1fr] group-data-[open=true]:delay-0">
    <li style={{ '--i': i }}
        className="translate-y-3 opacity-0 transition-[opacity,translate]
               delay-[calc((var(--n)_-_1_-_var(--i))*35ms)]
               group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100
               group-data-[open=true]:delay-[calc(var(--i)*60ms)]">…</li>
  </ul>
</div>`}
        >
          <CascadeMenu />
        </Example>

        <Example
          title="Tile grid with an adjustable step"
          lang="jsx"
          code={`<ul style={{ '--step': step + 'ms' }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  <li style={{ '--i': i }}
      className="transition-[opacity,translate,scale] duration-500
             delay-[calc(var(--i)*var(--step))]
             starting:translate-y-4 starting:scale-95 starting:opacity-0">
    <div className="hover:-translate-y-0.5 …">…</div>
  </li>
</ul>`}
        >
          <TileGrid />
        </Example>
      </Feature>

      <Feature
        title="Text, and no variable at all"
        since="4.0"
        parts={['starting:blur-sm', 'group-data-[on=false]:opacity-0', 'transition-[opacity,translate,filter]', 'delay-[calc(sibling-index()*60ms)]']}
        docs={{ href: 'https://tailwindcss.com/docs/transition-property', label: 'transition-property' }}
        description={
          <>
            <p>
              Split a headline into words and each <code>inline-block</code> span becomes an item. <code>blur-sm</code> and <code>translate-y-*</code> together read as
              focus pulling in.
            </p>
            <p>
              Newer browsers can count siblings in CSS: <code>sibling-index()</code> replaces <code>--i</code> entirely, so the markup carries no inline style at all.
            </p>
          </>
        }
      >
        <Example
          title="Word-by-word reveal"
          lang="jsx"
          code={`<p data-on={on} className="group">
  <span style={{ '--i': i }}
        className="inline-block transition-[opacity,translate,filter]
               delay-[calc(var(--i)*70ms)]
               starting:translate-y-[0.5em] starting:opacity-0 starting:blur-sm
               group-data-[on=false]:translate-y-[0.5em] group-data-[on=false]:opacity-0
               group-data-[on=false]:blur-sm">word</span>
</p>`}
        >
          <WordReveal />
        </Example>

        <Example
          title="sibling-index(): the same stagger, no inline style"
          lang="jsx"
          code={`<ol data-on={on} className="group">
  <li className="transition-[opacity,translate]
             delay-[calc(sibling-index()*60ms)]
             group-data-[on=false]:-translate-x-4 group-data-[on=false]:opacity-0">…</li>
</ol>`}
        >
          <SiblingIndexList />
        </Example>
      </Feature>
    </div>
  )
}
