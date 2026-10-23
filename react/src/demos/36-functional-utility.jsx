import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'
import './36-functional-utility.css'
// The stylesheet's own text, for the listing at the bottom (`?raw` = the file as a string).
import cssSource from './36-functional-utility.css?raw'

/*
 * Custom functional utilities: @utility auto-grid-* { ... --value() ... }.
 *
 * A functional utility is a family: the last part of the class is an input.
 * `auto-grid-56` and `auto-grid-56/6` are not two rules someone wrote, they are
 * one definition evaluated twice, and only the values this file actually uses
 * end up in the stylesheet. The definitions are in 36-functional-utility.css.
 *
 * Note: the text-stroke and glow classes below go straight to className, not
 * through cn(). tailwind-merge only knows Tailwind's own utilities, so it would
 * read text-stroke-2/accent as a text colour and drop its neighbour
 * (text-transparent); a custom utility has to be registered with it first,
 * the way src/lib/cn.js does for bg-dots.
 */
export const meta = {
  id: 'functional-utility',
  title: 'Functional @utility with --value()',
  group: 'Build-step features',
  order: 306,
  summary: 'Define auto-grid-*, text-stroke-* and glow-* once in CSS, then use auto-grid-56/6 or hover:glow-24/accent like any built-in class.',
  tailwind: ['@utility', '--value(integer)', '--value([length])', '--modifier()', '--default()', '--spacing()', 'auto-grid-56/6', 'text-stroke-2/accent', 'hover:glow-24/accent'],
}

/* ---------- shared bits ---------- */

function Segmented({ label, value, onChange, options }) {
  const pill = useId()
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map(([val, text]) => {
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(val)}
            className={cn(
              'focus-ring relative cursor-pointer rounded-lg px-3 py-1 font-mono text-xs font-medium transition-colors motion-reduce:transition-none',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span layoutId={pill} className="absolute inset-0 rounded-lg bg-accent-soft" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
            )}
            <span className="relative">{text}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- 1. auto-grid-* ---------- */

// Complete class strings: the scanner reads them, the utility turns each into one rule.
const GRIDS = [
  { cls: 'auto-grid-40', css: 'minmax(calc(var(--spacing) * 40), 1fr)', gap: 'gap: calc(var(--spacing) * 4)  /* --default(4) */', note: 'min 160px, default gap' },
  { cls: 'auto-grid-56/6', css: 'minmax(calc(var(--spacing) * 56), 1fr)', gap: 'gap: calc(var(--spacing) * 6)  /* the /6 */', note: 'min 224px, gap 6' },
  { cls: 'auto-grid-[14rem]/[1.25rem]', css: 'minmax(14rem, 1fr)', gap: 'gap: 1.25rem  /* the /[1.25rem] */', note: 'arbitrary length and gap' },
]

const APPS = [
  { name: 'Slack', text: 'Post deploys and alerts to a channel.', tone: 'bg-violet-100 text-violet-900' },
  { name: 'GitHub', text: 'Link pull requests to tasks.', tone: 'bg-slate-200 text-slate-900' },
  { name: 'Linear', text: 'Sync issues in both directions.', tone: 'bg-sky-100 text-sky-900' },
  { name: 'Figma', text: 'Embed frames in specs.', tone: 'bg-rose-100 text-rose-900' },
  { name: 'Notion', text: 'Mirror docs into the wiki.', tone: 'bg-amber-100 text-amber-900' },
  { name: 'Stripe', text: 'Show payment status on accounts.', tone: 'bg-violet-100 text-violet-900' },
  { name: 'Sentry', text: 'Attach errors to releases.', tone: 'bg-emerald-100 text-emerald-900' },
  { name: 'Zapier', text: 'Trigger any of 6,000 apps.', tone: 'bg-amber-100 text-amber-900' },
]

function GridExample() {
  const [index, setIndex] = useState(1)
  const [width, setWidth] = useState(640)
  const id = useId()
  const gridRef = useRef(null)
  const [columns, setColumns] = useState(0)
  const grid = GRIDS[index]

  useEffect(() => {
    const el = gridRef.current
    if (!el) return undefined
    const read = () => setColumns(getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length)
    read()
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 @xl:grid-cols-2">
        <div className="grid gap-1.5">
          <span className="text-[13px] font-semibold">Class</span>
          <Segmented label="Grid class" value={index} onChange={setIndex} options={GRIDS.map((g, i) => [i, g.cls.replace('auto-grid-', '')])} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[13px] font-semibold">
            Container width <span className="font-mono text-xs font-medium text-muted">{width}px max</span>
          </label>
          <input id={id} type="range" min={240} max={760} step={10} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full cursor-pointer accent-sky-600" />
        </div>
      </div>

      <p className="m-0 text-sm" aria-live="polite">
        <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[12.5px] wrap-anywhere">{grid.cls}</code> <span className="text-muted">({grid.note})</span> gives{' '}
        <strong>
          {columns} {columns === 1 ? 'column' : 'columns'}
        </strong>
        .
      </p>

      <div className="overflow-hidden rounded-xl border border-dashed border-line p-3" style={{ width: `min(100%, ${width}px)` }}>
        {/* the three classes appear as whole words, so the scanner hands them to the @utility */}
        <ul ref={gridRef} className={cn('m-0 list-none p-0', index === 0 && 'auto-grid-40', index === 1 && 'auto-grid-56/6', index === 2 && 'auto-grid-[14rem]/[1.25rem]')}>
          {APPS.map((app) => (
            <li key={app.name} className="grid content-start gap-2 rounded-lg border border-line bg-surface p-3">
              <span className={cn('grid size-9 place-items-center rounded-lg font-display text-sm font-bold', app.tone)}>{app.name.slice(0, 2)}</span>
              <span className="font-semibold">{app.name}</span>
              <span className="text-[13px] text-pretty text-muted">{app.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-1 rounded-lg bg-code-bg px-3 py-2 font-mono text-[12px] leading-relaxed text-code-fg">
        <span className="text-code-comment">/* what the build emitted for this class */</span>
        <span className="wrap-anywhere">
          .{grid.cls.replace(/[/[\].]/g, '\\$&')} {'{'}
        </span>
        <span className="pl-4">display: grid;</span>
        <span className="pl-4 wrap-anywhere">grid-template-columns: repeat(auto-fill, {grid.css});</span>
        <span className="pl-4 wrap-anywhere">{grid.gap};</span>
        <span>{'}'}</span>
      </div>
    </div>
  )
}

/* ---------- 2. text-stroke-* ---------- */

const STROKES = [
  { cls: 'text-transparent text-stroke-2/accent', text: 'Outline', note: 'integer width, theme colour' },
  { cls: 'text-transparent text-stroke-hairline/ink', text: 'Hairline', note: 'named width from @theme, ink token' },
  { cls: 'text-surface text-stroke-bold/accent', text: 'Sticker', note: 'filled, with a 4px outline behind it' },
  { cls: 'text-transparent text-stroke-[3px]/[#e11d48] hover:text-[#e11d48]', text: 'Arbitrary', note: 'arbitrary width and colour; hover fills it' },
]

function StrokeExample() {
  return (
    <ul className="m-0 grid list-none gap-5 p-0">
      {STROKES.map((s) => (
        <li key={s.cls} className="grid gap-1.5 border-b border-line pb-5 last:border-b-0 last:pb-0">
          <span className={`font-sans text-5xl leading-none font-bold tracking-tight transition-colors motion-reduce:transition-none sm:text-6xl ${s.cls}`}>{s.text}</span>
          <code className="font-mono text-xs wrap-anywhere text-ink">{s.cls}</code>
          <span className="text-xs text-muted">{s.note}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- 3. glow-* ---------- */

function Led({ className, label }) {
  const reduce = useReducedMotion()
  return (
    <li className="flex items-center gap-2.5">
      <motion.span
        aria-hidden="true"
        className={`size-3 rounded-full ${className}`}
        animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="grid">
        <span className="text-sm font-medium">{label[0]}</span>
        <code className="font-mono text-[11.5px] text-muted">{label[1]}</code>
      </span>
    </li>
  )
}

function GlowExample() {
  return (
    <div className="grid gap-6">
      <ul className="m-0 flex list-none flex-wrap gap-x-8 gap-y-4 p-0">
        <Led className="bg-v43 text-v43 glow-8/v43" label={['API', 'glow-8/v43']} />
        <Led className="bg-v42 text-v42 glow-10/v42" label={['Queue', 'glow-10/v42']} />
        <Led className="bg-red-500 text-red-500 glow-12/red-500" label={['Billing', 'glow-12/red-500']} />
        <Led className="bg-sky-500 text-sky-500 glow-6" label={['Search', 'glow-6 (current colour)']} />
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          className="focus-ring grid cursor-pointer content-start gap-1 rounded-xl border border-line bg-surface p-4 text-left transition-shadow hover:border-accent hover:glow-24/accent focus-visible:glow-24/accent motion-reduce:transition-none"
        >
          <span className="font-display font-semibold">Hover or focus me</span>
          <code className="font-mono text-xs text-muted">hover:glow-24/accent focus-visible:glow-24/accent</code>
        </motion.button>
        <div className="grid content-start gap-1 rounded-xl border border-line bg-surface p-4 dark:border-accent dark:glow-20/accent">
          <span className="font-display font-semibold">Glows in dark mode only</span>
          <code className="font-mono text-xs text-muted">dark:glow-20/accent</code>
          <span className="text-xs text-muted">Switch the theme menu to see it.</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- the demo ---------- */

const GRID_CODE = [
  {
    lang: 'html',
    label: 'markup',
    text: `<ul class="auto-grid-56/6"> … </ul>        <!-- columns >= 56 steps (224px), gap 6 -->
<ul class="auto-grid-[14rem]/[1.25rem]"> … </ul>
<ul class="auto-grid-40 md:auto-grid-72"> … </ul>   <!-- variants work -->`,
  },
  {
    lang: 'css',
    label: 'definition',
    text: `@utility auto-grid-* {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(--spacing(--value(integer)), 1fr));
  grid-template-columns: repeat(auto-fill, minmax(--value([length]), 1fr));
  gap: --spacing(--modifier(integer, --default(4)));
  gap: --modifier([length]);
}`,
  },
]

const STROKE_CODE = [
  {
    lang: 'html',
    label: 'markup',
    text: `<h2 class="text-transparent text-stroke-2/accent">Outline</h2>
<h2 class="text-surface text-stroke-bold/accent">Sticker</h2>
<h2 class="text-transparent text-stroke-[3px]/[#e11d48]">Arbitrary</h2>`,
  },
  {
    lang: 'css',
    label: 'definition',
    text: `@theme inline { --stroke-hairline: 0.5px; --stroke-bold: 4px; --stroke-heavy: 6px; }

@utility text-stroke-* {
  -webkit-text-stroke-width: --value(--stroke-*, [length]);   /* text-stroke-bold, text-stroke-[3px] */
  -webkit-text-stroke-width: calc(--value(integer) * 1px);    /* text-stroke-2 */
  -webkit-text-stroke-color: --modifier(--color-*, [color]);  /* /accent, /[#e11d48] */
  paint-order: stroke fill;
}`,
  },
]

const GLOW_CODE = [
  {
    lang: 'html',
    label: 'markup',
    text: `<span class="bg-v43 text-v43 glow-8/v43"></span>
<button class="hover:glow-24/accent focus-visible:glow-24/accent">…</button>
<div class="dark:glow-20/accent">…</div>`,
  },
  {
    lang: 'css',
    label: 'definition',
    text: `@utility glow-* {
  box-shadow: 0 0 calc(--value(integer) * 1px) currentColor;
  box-shadow: 0 0 calc(--value(integer) * 1px) --modifier(--color-*, [color]);
}`,
  },
]

export default function FunctionalUtilityDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="auto-grid"
        title="auto-grid-*: a responsive grid in one class"
        since="4.0"
        parts={['@utility auto-grid-*', '--value(integer)', '--value([length])', '--modifier(integer, --default(4))', '--spacing()']}
        docs={{ href: 'https://tailwindcss.com/docs/adding-custom-styles#functional-utilities', label: 'Functional utilities' }}
        description={
          <>
            <p>
              The number after the dash is the minimum column width in spacing steps; the optional <code>/6</code> is the gap. One definition covers{' '}
              <code>auto-grid-40</code>, <code>auto-grid-56/6</code> and <code>auto-grid-[14rem]/[1.25rem]</code>.
            </p>
            <p>
              <strong>Why it matters in a build.</strong> The utility lives in a real CSS file beside the component that owns it. The build generates one
              rule per value actually used and ships static CSS; the browser does no compiling.
            </p>
          </>
        }
      >
        <Example title="Integrations gallery" code={GRID_CODE} stageClassName="px-3 py-5 sm:px-5">
          <div className="@container">
            <GridExample />
          </div>
        </Example>
      </Feature>

      <Feature
        id="text-stroke"
        title="text-stroke-*: outlined type with theme colours"
        since="4.0"
        parts={['--value(--stroke-*, [length])', 'calc(--value(integer) * 1px)', '--modifier(--color-*, [color])', 'paint-order']}
        description={
          <>
            <p>
              Several <code>--value()</code> forms in one utility: a bare integer, a named width from a custom <code>@theme</code> namespace, or an
              arbitrary length. The <code>/colour</code> modifier resolves theme colours, including this app&apos;s own <code>accent</code> and{' '}
              <code>ink</code>, and arbitrary ones.
            </p>
            <p>Declarations whose input is missing are dropped, so a class without a modifier just keeps the text colour.</p>
          </>
        }
      >
        <Example title="Four ways to write the input" code={STROKE_CODE} stageClassName="px-3 py-6 sm:px-5">
          <StrokeExample />
        </Example>
      </Feature>

      <Feature
        id="glow"
        title="glow-*: and every variant works on it"
        since="4.0"
        parts={['@utility glow-*', 'hover:glow-24/accent', 'focus-visible:glow-24/accent', 'dark:glow-20/accent']}
        description={
          <>
            <p>
              Custom utilities join the normal pipeline, so <code>hover:</code>, <code>focus-visible:</code>, <code>dark:</code> and breakpoints stack
              on them with no extra CSS.
            </p>
            <p>
              The LED dots pulse with Motion (skipped when you ask for reduced motion); the glow itself is plain CSS.
            </p>
          </>
        }
      >
        <Example title="Status LEDs and interactive cards" code={GLOW_CODE} stageClassName="px-3 py-6 sm:px-5">
          <GlowExample />
        </Example>

        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/demos/36-functional-utility.css (imported with ?raw)" preClassName="max-h-[34rem]">
            {cssSource}
          </Code>
        </div>
      </Feature>
    </div>
  )
}
