import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-spring-counter',
  title: 'useSpring: animated numbers',
  group: 'Motion library + Tailwind',
  order: 280,
  summary:
    'useSpring turns a changing number into a physical one: KPI tiles that count up on scroll, a live price that eases between values and progress rings with three different springs. CSS can transition a custom property but cannot format or round it, so numbers are Motion territory.',
  tailwind: ['tabular-nums', 'accent-accent', 'stroke-line', 'stroke-accent', '-rotate-90', 'font-display', 'grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]'],
}

const CHIP = 'focus-ring cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'
const CHIP_IDLE = 'border-line bg-surface text-muted hover:border-accent hover:text-ink'
const CHIP_ON = 'border-accent bg-accent text-surface'

// module-level so the options object keeps one identity across renders
const KPI_SPRING = { stiffness: 70, damping: 18 }

const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

/* ==========================================================================
   The reusable piece: a number that springs to its latest value
   ========================================================================== */
function AnimatedNumber({ value, format = (n) => integer.format(n), from = 0, active = true, spring: options, className }) {
  const reduce = useReducedMotion()
  const spring = useSpring(from, options)
  // useTransform runs on every frame and returns a string; <motion.span> writes it to the DOM without re-rendering React
  const text = useTransform(spring, format)

  useEffect(() => {
    if (!active) return
    if (reduce) spring.jump(value) // reduced motion: land on the number, no travel
    else spring.set(value)
  }, [active, value, reduce, spring])

  return <motion.span className={className}>{text}</motion.span>
}

/* ==========================================================================
   1. KPI tiles: count up when they scroll into view
   ========================================================================== */
const KPIS = [
  { label: 'Revenue', value: 48230, format: (n) => dollars.format(n), delta: '+12.4%' },
  { label: 'Active users', value: 12408, format: (n) => integer.format(n), delta: '+3.1%' },
  { label: 'Conversion', value: 3.82, format: (n) => `${n.toFixed(2)}%`, delta: '+0.4 pts' },
  { label: 'Uptime', value: 99.98, format: (n) => `${n.toFixed(2)}%`, delta: 'Last 90 days' },
]

function KpiTile({ kpi }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })

  return (
    <div ref={ref} className="grid gap-1 rounded-2xl border border-line bg-surface p-4">
      <p className="m-0 text-xs tracking-wide text-muted uppercase">{kpi.label}</p>
      <p className="m-0 font-display text-2xl font-bold tabular-nums">
        <AnimatedNumber value={kpi.value} format={kpi.format} active={seen} spring={KPI_SPRING} />
      </p>
      <p className="m-0 text-xs font-medium text-emerald-700 dark:text-emerald-300">{kpi.delta}</p>
    </div>
  )
}

function KpiTiles() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
      {KPIS.map((kpi) => (
        <KpiTile key={kpi.label} kpi={kpi} />
      ))}
    </div>
  )
}

/* ==========================================================================
   2. Price calculator: the slider moves the target, the spring catches up
   ========================================================================== */
const FEELS = {
  soft: { label: 'Soft', options: { stiffness: 60, damping: 20 } },
  snappy: { label: 'Snappy', options: { stiffness: 320, damping: 30 } },
  bouncy: { label: 'Bouncy', options: { stiffness: 240, damping: 13 } },
}

function perSeat(seats) {
  if (seats >= 50) return 9.6 // 20% off
  if (seats >= 25) return 10.8 // 10% off
  return 12
}

function PriceCalculator() {
  const [seats, setSeats] = useState(18)
  const [feel, setFeel] = useState('snappy')
  const rate = perSeat(seats)
  const total = Math.round(seats * rate * 100) / 100

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-4">
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="spring-seats" className="text-sm font-medium">
            Seats
          </label>
          <output htmlFor="spring-seats" className="font-mono text-sm tabular-nums">
            {seats}
          </output>
        </div>
        <input
          id="spring-seats"
          type="range"
          min="1"
          max="100"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="focus-ring w-full cursor-pointer accent-accent"
        />
      </div>

      <div className="grid gap-1 rounded-2xl border border-line bg-surface p-4 text-center">
        <p className="m-0 text-xs tracking-wide text-muted uppercase">Monthly total</p>
        {/* key: switching the feel remounts the number, starting it at the current total */}
        <p className="m-0 font-display text-5xl leading-none font-bold tabular-nums">
          <AnimatedNumber key={feel} value={total} from={total} format={(n) => cents.format(Math.max(0, n))} spring={FEELS[feel].options} />
        </p>
        <p className="m-0 mt-1 text-sm text-muted">
          <AnimatedNumber key={`${feel}-rate`} value={rate} from={rate} format={(n) => cents.format(Math.max(0, n))} spring={FEELS[feel].options} /> per seat
          {seats >= 25 && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">{seats >= 50 ? '20% off' : '10% off'}</span>}
        </p>
      </div>

      <div role="group" aria-label="Spring feel" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Feel</span>
        {Object.entries(FEELS).map(([id, { label }]) => (
          <button key={id} type="button" aria-pressed={feel === id} onClick={() => setFeel(id)} className={cn(CHIP, feel === id ? CHIP_ON : CHIP_IDLE)}>
            {label}
          </button>
        ))}
      </div>
      <p className="m-0 text-xs text-muted">Drag the slider quickly. The soft spring trails behind; the bouncy one overshoots, then settles.</p>
    </div>
  )
}

/* ==========================================================================
   3. Progress rings: one target, three springs, drawn with pathLength
   ========================================================================== */
const RINGS = [
  { id: 'soft', label: 'Soft', options: { stiffness: 50, damping: 16 } },
  { id: 'snappy', label: 'Snappy', options: { stiffness: 300, damping: 32 } },
  { id: 'bouncy', label: 'Bouncy', options: { stiffness: 180, damping: 8 } },
]

function Ring({ label, target, options }) {
  const reduce = useReducedMotion()
  const progress = useSpring(target / 100, options)
  const drawn = useTransform(progress, (v) => Math.min(1, Math.max(0, v))) // a bouncy spring can overshoot 100%
  const shown = useTransform(progress, (v) => Math.round(Math.min(1, Math.max(0, v)) * 100))

  useEffect(() => {
    if (reduce) progress.jump(target / 100)
    else progress.set(target / 100)
  }, [target, reduce, progress])

  return (
    <figure className="m-0 grid justify-items-center gap-1.5">
      <div className="relative aspect-square w-full max-w-24">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-line" />
          <motion.circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-accent" style={{ pathLength: drawn }} />
        </svg>
        <p className="absolute inset-0 m-0 grid place-items-center font-display text-xl font-bold tabular-nums">
          <span>
            <motion.span>{shown}</motion.span>
            <span className="text-xs font-medium text-muted">%</span>
          </span>
        </p>
      </div>
      <figcaption className="text-xs font-medium text-muted">{label}</figcaption>
    </figure>
  )
}

function Rings() {
  const [target, setTarget] = useState(65)

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-4">
      <div className="grid grid-cols-3 gap-2" role="img" aria-label={`Three progress rings, all set to ${target} percent`}>
        {RINGS.map((r) => (
          <Ring key={r.id} label={r.label} target={target} options={r.options} />
        ))}
      </div>
      <div role="group" aria-label="Upload progress" className="flex flex-wrap items-center justify-center gap-2">
        {[0, 25, 65, 100].map((v) => (
          <button key={v} type="button" aria-pressed={target === v} onClick={() => setTarget(v)} className={cn(CHIP, 'tabular-nums', target === v ? CHIP_ON : CHIP_IDLE)}>
            {v}%
          </button>
        ))}
        <button type="button" onClick={() => setTarget(Math.round(Math.random() * 100))} className={cn(CHIP, CHIP_IDLE)}>
          Random
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionSpringCounter() {
  return (
    <Feature
      id="motion-spring-counter"
      title="Numbers with momentum"
      parts={['useSpring', 'useTransform', 'useInView', 'pathLength', 'spring.jump()', 'tabular-nums']}
      docs={{ href: 'https://motion.dev/docs/react-use-spring', label: 'Motion: useSpring' }}
      description={
        <>
          <p>
            <code>useSpring</code> returns a motion value that chases whatever you <code>set</code> it to. Feed it through <code>useTransform</code>{' '}
            to format each frame, and render it with <code>motion.span</code>: React renders once, the DOM updates sixty times a second.
          </p>
          <p>
            <strong>Plain Tailwind</strong> supplies the type: <code>tabular-nums</code> keeps digits from jittering as they change, and{' '}
            <code>stroke-accent</code> colours the ring. A CSS transition could not round or format a number.
          </p>
          <p>
            <strong>Reach for Motion</strong> for counters, gauges and any value that should feel physical. Under reduced motion the code calls{' '}
            <code>spring.jump()</code>, so the number lands without travelling.
          </p>
        </>
      }
    >
      <Example
        title="KPI tiles: count up when scrolled into view"
        lang="jsx"
        replay
        code={`function AnimatedNumber({ value, format, active = true }) {
  const spring = useSpring(0, { stiffness: 70, damping: 18 })
  const text = useTransform(spring, format)
  useEffect(() => { if (active) spring.set(value) }, [active, value, spring])
  return <motion.span>{text}</motion.span>
}

const ref = useRef(null)
const seen = useInView(ref, { once: true, amount: 0.6 })`}
      >
        <KpiTiles />
      </Example>

      <Example
        title="Price calculator: pick the spring's feel"
        lang="jsx"
        code={`const FEELS = {
  soft:   { stiffness: 60,  damping: 20 },
  snappy: { stiffness: 320, damping: 30 },
  bouncy: { stiffness: 240, damping: 13 },
}

<AnimatedNumber key={feel} value={total} from={total}
  format={(n) => currency.format(n)} spring={FEELS[feel]} />`}
      >
        <PriceCalculator />
      </Example>

      <Example
        title="Progress rings: same target, three springs"
        lang="jsx"
        code={`const progress = useSpring(target / 100, { stiffness: 180, damping: 8 })
const drawn = useTransform(progress, (v) => Math.min(1, Math.max(0, v)))

<svg viewBox="0 0 100 100" className="size-24 -rotate-90">
  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-line" />
  <motion.circle cx="50" cy="50" r="42" fill="none" strokeWidth="9"
    strokeLinecap="round" className="stroke-accent" style={{ pathLength: drawn }} />
</svg>`}
      >
        <Rings />
      </Example>
    </Feature>
  )
}
