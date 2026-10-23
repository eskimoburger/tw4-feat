import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'
import './35-runtime-theming.css'
// The stylesheet's own text, for the listing at the bottom (`?raw` = the file as a string).
import cssSource from './35-runtime-theming.css?raw'

/*
 * Runtime theming: React state -> CSS variables -> Tailwind tokens.
 *
 * Nothing here re-renders the styling. React only changes the value of a few
 * custom properties on a wrapper element; the browser recomputes every colour
 * and length that reads them. Two flavours:
 *
 *   --brand-h / --brand-c   read by `@theme inline` colour tokens
 *                           (bg-brand-600, text-brand-800 ...), see the .css file
 *   --spacing               Tailwind's own base length; p-4 is calc(var(--spacing) * 4),
 *                           so a wrapper can make a whole component denser or looser
 *
 * Why this needs a build: the tokens are compiled into utilities and the CSS
 * is ordinary, static, cacheable. Changing the theme costs one style update,
 * not a regeneration of CSS in the browser.
 */
export const meta = {
  id: 'runtime-theming',
  title: 'Runtime theming with CSS variables',
  group: 'Build-step features',
  order: 305,
  summary: 'A brand colour picker and a live --spacing density slider: React writes custom properties, @theme inline tokens and spacing utilities follow.',
  tailwind: ['@theme inline', '--color-brand-*', 'bg-brand-600', 'dark:bg-brand-950', 'bg-(--demo-frozen)', '--spacing', 'accent-brand-600', 'oklch()'],
}

/* ---------- 1. brand colour ---------- */

const PRESETS = [
  { name: 'Violet', h: 295, c: 0.19 },
  { name: 'Ocean', h: 245, c: 0.17 },
  { name: 'Rose', h: 10, c: 0.2 },
  { name: 'Amber', h: 70, c: 0.15 },
  { name: 'Forest', h: 155, c: 0.14 },
]

// complete class names, one per shade, so the scanner (and the reader) can find them
const SHADES = [
  ['50', 'bg-brand-50'],
  ['100', 'bg-brand-100'],
  ['200', 'bg-brand-200'],
  ['300', 'bg-brand-300'],
  ['400', 'bg-brand-400'],
  ['500', 'bg-brand-500'],
  ['600', 'bg-brand-600'],
  ['700', 'bg-brand-700'],
  ['800', 'bg-brand-800'],
  ['900', 'bg-brand-900'],
  ['950', 'bg-brand-950'],
]

const HUE_STRIP = `linear-gradient(90deg, ${[0, 45, 90, 135, 180, 225, 270, 315, 360].map((h) => `oklch(0.7 0.16 ${h})`).join(', ')})`

function Check({ className }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn('size-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}

function PlanCard() {
  const reduce = useReducedMotion()
  return (
    <div className="grid gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-brand-950 transition-colors duration-200 motion-reduce:transition-none dark:border-brand-900 dark:bg-brand-950 dark:text-brand-50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800 transition-colors duration-200 motion-reduce:transition-none dark:bg-brand-900 dark:text-brand-100">
          Most popular
        </span>
        <span className="text-sm text-brand-800 dark:text-brand-200">Billed monthly</span>
      </div>

      <div>
        <h3 className="m-0 font-display text-2xl font-bold tracking-tight">Studio plan</h3>
        <p className="m-0 mt-1 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold">$24</span>
          <span className="text-sm text-brand-800 dark:text-brand-200">per month</span>
        </p>
      </div>

      <ul className="m-0 grid list-none gap-2 p-0 text-sm">
        {['5 team seats', 'Unlimited projects', 'Priority support within 4 hours'].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className="text-brand-600 dark:text-brand-400" />
            {item}
          </li>
        ))}
      </ul>

      <div className="grid gap-1.5">
        <div className="flex justify-between text-xs text-brand-800 dark:text-brand-200">
          <span>Seats used</span>
          <span>3 of 5</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-200 transition-colors duration-200 motion-reduce:transition-none dark:bg-brand-900">
          <motion.div
            className="h-full rounded-full bg-brand-600 transition-colors duration-200 motion-reduce:transition-none dark:bg-brand-400"
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ duration: reduce ? 0 : 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none"
        >
          Upgrade now
        </button>
        <a
          href="https://tailwindcss.com/docs/theme#referencing-other-variables"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-brand-300"
        >
          Compare plans
        </a>
      </div>
    </div>
  )
}

function Tile({ className, label, note }) {
  return (
    <div className="grid gap-2">
      <div className={cn('h-14 rounded-lg ring-1 ring-black/10 transition-colors duration-200 ring-inset motion-reduce:transition-none dark:ring-white/15', className)} />
      <p className="m-0 grid gap-0.5 text-xs">
        <code className="font-mono font-semibold wrap-anywhere">{label}</code>
        <span className="text-muted">{note}</span>
      </p>
    </div>
  )
}

function Slider({ id, label, value, onChange, min, max, step, readout, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[13px] font-semibold">
        {label}
        <output htmlFor={id} className="font-mono text-xs font-medium text-muted">
          {readout}
        </output>
      </label>
      {children}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-brand-600"
      />
    </div>
  )
}

function BrandPicker() {
  const id = useId()
  const [{ h, c }, setBrand] = useState(PRESETS[0])
  const set = (patch) => setBrand((b) => ({ ...b, ...patch }))
  const active = PRESETS.find((p) => p.h === h && p.c === c)

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 @xl:grid-cols-2 @xl:items-end">
        <Slider id={`${id}-h`} label="Hue" value={h} onChange={(v) => set({ h: v })} min={0} max={360} step={1} readout={`--brand-h: ${h}`}>
          <div aria-hidden="true" className="relative h-3 rounded-full ring-1 ring-black/10 dark:ring-white/15" style={{ background: HUE_STRIP }}>
            <span
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow-sm"
              style={{ left: `${(h / 360) * 100}%` }}
            />
          </div>
        </Slider>
        <Slider id={`${id}-c`} label="Chroma" value={c} onChange={(v) => set({ c: v })} min={0.02} max={0.24} step={0.01} readout={`--brand-c: ${c.toFixed(2)}`} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Presets">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            aria-pressed={active === p}
            onClick={() => setBrand(p)}
            className={cn(
              'focus-ring flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none',
              active === p ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-muted hover:border-accent hover:text-ink',
            )}
          >
            <span aria-hidden="true" className="size-3 rounded-full ring-1 ring-black/10 dark:ring-white/20" style={{ background: `oklch(0.55 ${p.c} ${p.h})` }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* the wrapper: the only place React touches colour */}
      <div style={{ '--brand-h': h, '--brand-c': c }} className="grid gap-5">
        <PlanCard />

        <div className="grid gap-2">
          <p className="m-0 text-[13px] font-semibold">The derived palette</p>
          <ul className="m-0 grid list-none grid-cols-6 gap-1.5 p-0 sm:grid-cols-11">
            {SHADES.map(([shade, cls]) => (
              <li key={shade} className="grid gap-1 text-center">
                <span className={cn('h-10 rounded-md ring-1 ring-black/10 transition-colors duration-200 ring-inset motion-reduce:transition-none dark:ring-white/15', cls)} />
                <span className="font-mono text-[10px] text-muted">{shade}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Tile className="bg-brand-600" label="bg-brand-600" note="@theme inline: the var() is resolved here, so it follows the sliders." />
          <Tile className="bg-(--demo-frozen)" label="bg-(--demo-frozen)" note="The same colour declared on :root (what a plain @theme does): stuck at the default hue." />
        </div>
      </div>
    </div>
  )
}

/* ---------- 2. density via --spacing ---------- */

const DENSITIES = [
  ['Compact', 0.2],
  ['Default', 0.25],
  ['Roomy', 0.32],
]

const MAIL = [
  { from: 'Priya Raman', initials: 'PR', subject: 'Q3 roadmap review', time: '9:14', unread: true, tone: 'bg-sky-100 text-sky-900' },
  { from: 'Dev Patel', initials: 'DP', subject: 'Build #4821 failed on main', time: '8:52', unread: true, tone: 'bg-red-100 text-red-900' },
  { from: 'Finance', initials: 'FN', subject: 'Invoice INV-2041 was paid', time: 'Yesterday', unread: false, tone: 'bg-emerald-100 text-emerald-900' },
  { from: 'Lena Fischer', initials: 'LF', subject: 'Lunch on Friday?', time: 'Yesterday', unread: false, tone: 'bg-violet-100 text-violet-900' },
  { from: 'Security', initials: 'SC', subject: 'New sign-in from Lisbon', time: 'Mon', unread: false, tone: 'bg-amber-100 text-amber-900' },
]

function Inbox({ spacing }) {
  return (
    <div style={{ '--spacing': `${spacing}rem` }} className="overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h3 className="m-0 font-display text-base font-semibold">Inbox</h3>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">2 unread</span>
      </header>
      <ul className="m-0 grid list-none gap-1 p-2 sm:p-3">
        {MAIL.map((m, i) => (
          <motion.li
            key={m.from}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-stage"
          >
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold', m.tone)}>{m.initials}</span>
            <span className="grid min-w-0 flex-1">
              <span className={cn('truncate text-sm', m.unread ? 'font-semibold' : 'font-medium')}>{m.from}</span>
              <span className="truncate text-[13px] text-muted">{m.subject}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-muted">
              {m.time}
              {m.unread && <span aria-label="unread" className="size-2 rounded-full bg-accent" />}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function Density() {
  const id = useId()
  const [spacing, setSpacing] = useState(0.25)
  const px = (n) => `${(spacing * n * 16).toFixed(1).replace(/\.0$/, '')}px`

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 @xl:grid-cols-[minmax(0,1fr)_auto] @xl:items-end">
        <Slider id={id} label="Density" value={spacing} onChange={setSpacing} min={0.16} max={0.36} step={0.01} readout={`--spacing: ${spacing.toFixed(2)}rem`} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Density presets">
          {DENSITIES.map(([name, value]) => (
            <button
              key={name}
              type="button"
              aria-pressed={spacing === value}
              onClick={() => setSpacing(value)}
              className={cn(
                'focus-ring cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none',
                spacing === value ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-muted hover:border-accent hover:text-ink',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <Inbox spacing={spacing} />

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs sm:grid-cols-4">
        {[
          ['p-2', 2],
          ['gap-3', 3],
          ['py-3', 3],
          ['size-9', 9],
        ].map(([cls, n]) => (
          <div key={cls} className="flex justify-between gap-2 border-b border-line py-1">
            <dt className="text-muted">{cls}</dt>
            <dd className="m-0">{px(n)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------- the demo ---------- */

const BRAND_CODE = [
  {
    lang: 'jsx',
    label: 'React: only custom properties change',
    text: `<div style={{ '--brand-h': hue, '--brand-c': chroma }}>
  <button className="bg-brand-600 hover:bg-brand-700 text-white …">Upgrade now</button>
  <div className="bg-brand-50 dark:bg-brand-950 border-brand-200 …">…</div>
</div>`,
  },
  {
    lang: 'css',
    label: 'CSS: the tokens that read them',
    text: `@theme inline {
  --color-brand-600: oklch(0.55 var(--brand-c, 0.17) var(--brand-h, 245));
  /* 50 … 950: fixed lightness, chroma scaled per step */
}`,
  },
]

const DENSITY_CODE = `<ul style={{ '--spacing': \`\${spacing}rem\` }} className="p-3 gap-1">
  <li className="flex items-center gap-3 px-3 py-3">
    <span className="size-9 …">PR</span> …
  </li>
</ul>

/* every one of those lengths is calc(var(--spacing) * n) */`

export default function RuntimeThemingDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="brand"
        title="A brand colour that follows React state"
        since="4.0"
        parts={['@theme inline', '--color-brand-*', 'bg-brand-600', 'dark:bg-brand-950', 'bg-(--demo-frozen)']}
        docs={{ href: 'https://tailwindcss.com/docs/theme#referencing-other-variables', label: 'Referencing other variables' }}
        description={
          <>
            <p>
              Move a slider and React writes <code>--brand-h</code> on one wrapper. The <code>bg-brand-*</code>, <code>text-brand-*</code> and{' '}
              <code>border-brand-*</code> utilities inside re-colour, in light and dark.
            </p>
            <p>
              <strong>Why it needs a build.</strong> <code>@theme inline</code> is compiled into the utilities themselves. The bottom-right tile shows
              what a plain <code>@theme</code> would do instead: its value is resolved on <code>:root</code>, so a wrapper cannot reach it.
            </p>
          </>
        }
      >
        <Example title="Brand picker" code={BRAND_CODE} stageClassName="px-3 py-5 sm:px-5">
          <div className="@container">
            <BrandPicker />
          </div>
        </Example>
      </Feature>

      <Feature
        id="density"
        title="Density with --spacing"
        since="4.0"
        parts={['--spacing', 'p-*', 'gap-*', 'size-*', 'calc(var(--spacing) * n)']}
        docs={{ href: 'https://tailwindcss.com/docs/theme#default-theme-variable-reference', label: 'Spacing in the theme' }}
        description={
          <>
            <p>
              In v4 the whole spacing scale is one variable: <code>p-4</code> is <code>calc(var(--spacing) * 4)</code>. Set <code>--spacing</code> on an
              element and everything inside uses the new unit: padding, gaps, even <code>size-9</code> avatars. Text stays in rem, so it does not move.
            </p>
            <p>The numbers under the list are computed from the slider, not typed in.</p>
          </>
        }
      >
        <Example title="Inbox density" code={DENSITY_CODE} stageClassName="px-3 py-5 sm:px-5">
          <div className="@container">
            <Density />
          </div>
        </Example>

        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/demos/35-runtime-theming.css (imported with ?raw)" preClassName="max-h-[34rem]">
            {cssSource}
          </Code>
        </div>
      </Feature>
    </div>
  )
}
