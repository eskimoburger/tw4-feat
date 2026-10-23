import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, spring, useAnimate, useReducedMotion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-springs-keyframes',
  title: 'Springs, tweens and keyframes',
  group: 'Motion library + Tailwind',
  order: 290,
  summary:
    'Race springs against tweens, interrupt them mid-flight, play keyframe sequences with custom times and tune a spring against its own curve. Tailwind\'s animate-* utilities are enough for a spinner or a ping; reach for Motion when timing, interruption or choreography matters.',
  tailwind: ['motion-safe:animate-ping', 'origin-top', 'rounded-full', 'stroke-accent', 'fill-none', 'accent-accent'],
}

const BTN = 'focus-ring cursor-pointer rounded-xl border px-3.5 py-1.5 text-sm font-semibold select-none transition-colors duration-150 motion-reduce:transition-none'
const BTN_PRIMARY = 'border-transparent bg-accent text-surface'
const BTN_QUIET = 'border-line bg-surface text-ink hover:border-accent'

/* ==========================================================================
   1. Race: the same journey, four different transitions
   ========================================================================== */
const LANES = [
  { id: 'bouncy', kind: 'spring', detail: 'bounce 0.5 · 0.8s', transition: { type: 'spring', bounce: 0.5, visualDuration: 0.8 }, ball: 'bg-sky-500' },
  { id: 'stiff', kind: 'spring', detail: 'stiffness 500 · damping 40', transition: { type: 'spring', stiffness: 500, damping: 40 }, ball: 'bg-violet-500' },
  { id: 'ease', kind: 'tween', detail: 'easeOut · 0.6s', transition: { type: 'tween', ease: 'easeOut', duration: 0.6 }, ball: 'bg-emerald-500' },
  { id: 'linear', kind: 'tween', detail: 'linear · 0.6s', transition: { type: 'tween', ease: 'linear', duration: 0.6 }, ball: 'bg-amber-500' },
]

function Race() {
  const reduce = useReducedMotion()
  const [far, setFar] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const toggle = () => {
    clearTimeout(timer.current)
    setFar((v) => !v)
  }
  // go right, then turn back after 250ms, while every ball is still in motion
  const interrupt = () => {
    clearTimeout(timer.current)
    setFar(true)
    timer.current = setTimeout(() => setFar(false), 250)
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={toggle} className={cn(BTN, BTN_PRIMARY)}>
          {far ? 'Run back' : 'Run'}
        </button>
        <button type="button" onClick={interrupt} className={cn(BTN, BTN_QUIET)}>
          Interrupt at 250 ms
        </button>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0">
        {LANES.map((lane) => (
          <li key={lane.id} className="grid gap-1.5">
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-semibold capitalize">{lane.kind}</span>
              <span className="font-mono text-xs text-muted">{lane.detail}</span>
            </p>
            <div className="relative h-10 overflow-hidden rounded-full border border-line bg-surface">
              {/* the inner track stops one ball-width short of the end; the ball travels 6% to 86% of it, leaving room to overshoot */}
              <div className="absolute inset-y-1 right-9 left-1">
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  className={cn('absolute top-0 size-8 rounded-full shadow-md', lane.ball)}
                  animate={{ left: far ? '86%' : '6%' }}
                  transition={reduce ? { duration: 0 } : lane.transition}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-muted">
        Springs overshoot and carry their velocity into a reversal, so an interrupted spring turns smoothly. A tween restarts from where it is, on a
        fresh clock.
      </p>
    </div>
  )
}

/* ==========================================================================
   2. Keyframes: arrays, times and repeat
   ========================================================================== */
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

function Tile({ caption, children }) {
  return (
    <div className="grid content-between justify-items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-center">
      <div className="grid h-14 place-items-center">{children}</div>
      <p className="m-0 text-xs text-pretty text-muted">{caption}</p>
    </div>
  )
}

function Keyframes() {
  const reduce = useReducedMotion()
  const [scope, animate] = useAnimate()

  const ring = () => {
    if (reduce) return
    // a keyframe array: one value per step, eased between them
    animate(scope.current, { rotate: [0, 18, -16, 12, -8, 4, 0] }, { duration: 0.9, ease: 'easeInOut' })
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
      <Tile caption="Imperative keyframes with useAnimate. Click the bell.">
        <button type="button" onClick={ring} aria-label="Ring the bell" className="focus-ring cursor-pointer rounded-full p-1 text-accent">
          <span ref={scope} className="block origin-top">
            <BellIcon />
          </span>
        </button>
      </Tile>

      <Tile caption="Tailwind only: one class, motion-safe:animate-ping">
        <span className="relative flex size-4" aria-hidden="true">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex size-4 rounded-full bg-emerald-500" />
        </span>
      </Tile>

      <Tile caption="Motion: a double heartbeat, timed with times: [0, .15, .3, .45, 1]">
        <span className="relative flex size-4" aria-hidden="true">
          <motion.span
            className="absolute inline-flex size-full rounded-full bg-rose-400"
            animate={reduce ? { opacity: 0.6 } : { scale: [1, 2.3, 1, 1.9, 1], opacity: [0.7, 0, 0.7, 0, 0.7] }}
            transition={{ duration: 1.6, times: [0, 0.15, 0.3, 0.45, 1], repeat: Infinity, ease: 'easeOut' }}
          />
          <span className="relative inline-flex size-4 rounded-full bg-rose-500" />
        </span>
      </Tile>

      <Tile caption="Motion: a typing indicator, one keyframe loop per dot with staggered delay">
        <span className="flex items-end gap-1.5" role="img" aria-label="Someone is typing">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2.5 rounded-full bg-muted"
              animate={reduce ? undefined : { y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, delay: i * 0.14, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </span>
      </Tile>
    </div>
  )
}

/* ==========================================================================
   3. Tuner: change bounce and visualDuration, see the curve and the motion
   ========================================================================== */
const PLOT = { w: 300, h: 130, top: 10, base: 105, rise: 62, span: 1500 } // span: milliseconds shown

function curvePath(bounce, visualDuration) {
  const gen = spring({ keyframes: [0, 1], bounce, visualDuration })
  const points = []
  for (let t = 0; t <= PLOT.span; t += 15) {
    const { value, done } = gen.next(t)
    const v = done ? 1 : value
    points.push(`${((t / PLOT.span) * PLOT.w).toFixed(1)} ${(PLOT.base - v * PLOT.rise).toFixed(1)}`)
  }
  return `M${points.join(' L')}`
}

function Tuner() {
  const reduce = useReducedMotion()
  const [bounce, setBounce] = useState(0.35)
  const [duration, setDuration] = useState(0.55)
  const [far, setFar] = useState(false)
  const path = useMemo(() => curvePath(bounce, duration), [bounce, duration])
  const transition = { type: 'spring', bounce, visualDuration: duration }
  const targetY = PLOT.base - PLOT.rise

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="tuner-bounce" className="font-mono text-xs text-muted">
              bounce
            </label>
            <output htmlFor="tuner-bounce" className="font-mono text-xs tabular-nums">
              {bounce.toFixed(2)}
            </output>
          </div>
          <input id="tuner-bounce" type="range" min="0" max="0.8" step="0.05" value={bounce} onChange={(e) => setBounce(Number(e.target.value))} className="focus-ring w-full cursor-pointer accent-accent" />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="tuner-duration" className="font-mono text-xs text-muted">
              visualDuration
            </label>
            <output htmlFor="tuner-duration" className="font-mono text-xs tabular-nums">
              {duration.toFixed(2)}s
            </output>
          </div>
          <input id="tuner-duration" type="range" min="0.2" max="1.2" step="0.05" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="focus-ring w-full cursor-pointer accent-accent" />
        </div>
      </div>

      <figure className="m-0 overflow-hidden rounded-xl border border-line bg-surface">
        <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} role="img" aria-label={`Spring curve for bounce ${bounce.toFixed(2)} and visual duration ${duration.toFixed(2)} seconds`} className="block h-auto w-full">
          <line x1="0" x2={PLOT.w} y1={PLOT.base} y2={PLOT.base} className="stroke-line" strokeWidth="1" />
          <line x1="0" x2={PLOT.w} y1={targetY} y2={targetY} className="stroke-muted" strokeWidth="1" strokeDasharray="4 4" />
          <text x="6" y={targetY - 5} className="fill-muted font-mono text-[9px]">
            target
          </text>
          <text x={PLOT.w - 6} y={PLOT.base - 6} textAnchor="end" className="fill-muted font-mono text-[9px]">
            0 to 1.5 s
          </text>
          <path d={path} className="fill-none stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </figure>

      <div className="relative h-10 overflow-hidden rounded-full border border-line bg-surface">
        <div className="absolute inset-y-1 right-9 left-1">
          <motion.span
            aria-hidden="true"
            initial={false}
            className="absolute top-0 size-8 rounded-full bg-accent shadow-md"
            animate={{ left: far ? '68%' : '8%' }}
            transition={reduce ? { duration: 0 } : transition}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setFar((v) => !v)} className={cn(BTN, BTN_PRIMARY)}>
          Play
        </button>
        <code className="min-w-0 rounded-[5px] bg-accent-soft px-2 py-1 font-mono text-xs wrap-anywhere">
          {`{ type: 'spring', bounce: ${bounce.toFixed(2)}, visualDuration: ${duration.toFixed(2)} }`}
        </code>
      </div>
      <p className="m-0 text-xs text-muted">
        <code className="rounded-[5px] bg-accent-soft px-1 font-mono">visualDuration</code> is when the curve first reaches the target;{' '}
        <code className="rounded-[5px] bg-accent-soft px-1 font-mono">bounce</code> decides how far it overshoots and how long it rings.
      </p>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionSpringsKeyframes() {
  return (
    <Feature
      id="motion-springs-keyframes"
      title="Choosing how it moves"
      parts={['type: "spring"', 'bounce', 'visualDuration', 'type: "tween"', 'times', 'repeat', 'useAnimate']}
      docs={{ href: 'https://motion.dev/docs/react-transitions', label: 'Motion: transitions' }}
      description={
        <>
          <p>
            A transition says how a value travels. A <strong>spring</strong> is driven by physics, so it can overshoot and keeps its velocity if
            interrupted. A <strong>tween</strong> has a fixed duration and easing curve. A <strong>keyframe array</strong> walks through several
            values, with <code>times</code> controlling when each is reached.
          </p>
          <p>
            <strong>Plain Tailwind</strong> is the better choice for a spinner, a pulse or a fade: <code>animate-spin</code>,{' '}
            <code>animate-ping</code>, <code>transition</code> and <code>duration-300</code> need no JavaScript.
          </p>
          <p>
            <strong>Reach for Motion</strong> when the motion must be interruptible, physical, sequenced or driven from code. Gate looping animations
            on <code>useReducedMotion</code>, as the tiles here do.
          </p>
        </>
      }
    >
      <Example
        title="Race: springs against tweens, with an interruption"
        lang="jsx"
        code={`const spring = { type: 'spring', bounce: 0.5, visualDuration: 0.8 }
const tween  = { type: 'tween', ease: 'easeOut', duration: 0.6 }

<motion.span
  animate={{ left: far ? '86%' : '6%' }}
  transition={spring}
  className="absolute top-0 left-0 size-8 rounded-full bg-sky-500" />`}
      >
        <Race />
      </Example>

      <Example
        title="Keyframes: arrays, times and loops"
        lang="jsx"
        code={`// Tailwind only
<span className="motion-safe:animate-ping rounded-full bg-emerald-400" />

// Motion: a double heartbeat
<motion.span
  animate={{ scale: [1, 2.3, 1, 1.9, 1], opacity: [0.7, 0, 0.7, 0, 0.7] }}
  transition={{ duration: 1.6, times: [0, 0.15, 0.3, 0.45, 1], repeat: Infinity }}
  className="rounded-full bg-rose-400" />`}
      >
        <Keyframes />
      </Example>

      <Example
        title="Spring tuner: curve and motion together"
        lang="jsx"
        code={`import { spring } from 'motion/react'

// sample the curve Motion will use, 0 to 1.5 seconds
const gen = spring({ keyframes: [0, 1], bounce: 0.35, visualDuration: 0.55 })
const value = gen.next(120).value   // position after 120 ms

<motion.span animate={{ left: far ? '68%' : '8%' }}
  transition={{ type: 'spring', bounce: 0.35, visualDuration: 0.55 }} />`}
      >
        <Tuner />
      </Example>
    </Feature>
  )
}
