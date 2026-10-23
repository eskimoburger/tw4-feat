import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-scroll',
  title: 'Scroll-linked: progress and parallax',
  group: 'Motion library + Tailwind',
  order: 260,
  summary:
    'useScroll feeds a reading-progress bar, a parallax hero and a carousel indicator, all reading a scroll container instead of the page. Tailwind already covers snap points and sticky headers; use Motion when a value must follow the scroll position.',
  tailwind: ['sticky top-0', 'snap-x', 'snap-mandatory', 'snap-center', 'origin-left', 'overflow-y-auto', '[scrollbar-width:none]', 'bg-linear-to-b'],
}

const BTN = 'focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:border-accent disabled:cursor-not-allowed disabled:opacity-50'

/* ==========================================================================
   1. Reading progress: scrollYProgress of a scroll container, smoothed by a spring
   ========================================================================== */
const ARTICLE = [
  'We kept our design tokens in a JavaScript config for years. Every colour change meant a rebuild, and nobody outside the front-end team could read the file without help.',
  'Moving the tokens into CSS variables changed that overnight. Designers could open one stylesheet, see the whole palette, and try a new value in the browser inspector before opening a pull request.',
  'The second win was theming. A dark theme became a handful of variable overrides under one selector, instead of a parallel set of utility classes scattered across every template.',
  'The third was runtime access. Because the tokens are real custom properties, a chart library or a canvas can read them with getComputedStyle and stay in sync with the interface.',
  'There were costs. We had to agree on names, retire a few one-off colours, and teach the team that a token is a decision, not a convenience. That conversation was worth having.',
  'If you are starting from scratch, begin with the semantic names: surface, ink, muted, line, accent. You can always add a palette scale later, but renaming a semantic token across a codebase is painful.',
]

function ReadingProgress() {
  const scroller = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ container: scroller })
  // the spring smooths the bar; with reduced motion it follows the scroll position exactly
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 })
  const scaleX = reduce ? scrollYProgress : smooth
  const percent = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`)

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div ref={scroller} tabIndex={0} role="region" aria-label="Article: scroll to read" className="focus-ring relative h-80 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur-sm motion-reduce:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
            <span className="truncate font-medium">Why our tokens moved into CSS</span>
            <motion.span className="font-mono text-muted tabular-nums">{percent}</motion.span>
          </div>
          <motion.div aria-hidden="true" style={{ scaleX }} className="h-1 origin-left bg-accent" />
        </div>
        <article className="grid gap-3 p-4 text-sm leading-relaxed text-pretty">
          <h3 className="m-0 font-display text-xl leading-snug font-semibold text-balance">Why our tokens moved into CSS</h3>
          {ARTICLE.map((p) => (
            <p key={p.slice(0, 24)} className="m-0 text-muted">
              {p}
            </p>
          ))}
          <p className="m-0 font-medium">That is the whole story. Thanks for reading.</p>
        </article>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. Parallax: layers read the same progress and map it to different offsets
   ========================================================================== */
function ParallaxHero() {
  const scroller = useRef(null)
  const hero = useRef(null)
  const reduce = useReducedMotion()
  // 0 when the hero's top meets the scroller's top, 1 when its bottom has scrolled out of view
  const { scrollYProgress } = useScroll({ container: scroller, target: hero, offset: ['start start', 'end start'] })

  const range = (distance) => (reduce ? [0, 0] : [0, distance])
  const sunY = useTransform(scrollYProgress, [0, 1], range(150))
  const farY = useTransform(scrollYProgress, [0, 1], range(90))
  const nearY = useTransform(scrollYProgress, [0, 1], range(40))
  const titleY = useTransform(scrollYProgress, [0, 1], range(110))
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1])

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div ref={scroller} tabIndex={0} role="region" aria-label="Parallax demo: scroll to see the layers move" className="focus-ring relative h-80 overflow-y-auto">
        <section ref={hero} className="relative isolate h-72 overflow-hidden bg-linear-to-b from-sky-400 to-amber-100 dark:from-slate-900 dark:to-indigo-700">
          <motion.div aria-hidden="true" style={{ y: sunY }} className="absolute top-12 right-8 -z-10 size-16 rounded-full bg-amber-300 shadow-lg shadow-amber-200/60 dark:bg-slate-200 dark:shadow-indigo-200/30" />
          <motion.div aria-hidden="true" style={{ y: farY }} className="absolute -bottom-16 -left-16 -z-10 h-44 w-[130%] rounded-[50%] bg-sky-700/55 dark:bg-indigo-950/80" />
          <motion.div aria-hidden="true" style={{ y: nearY }} className="absolute -right-20 -bottom-24 -z-10 h-44 w-[120%] rounded-[50%] bg-emerald-800 dark:bg-slate-950" />
          <motion.div style={{ y: titleY, opacity: titleOpacity }} className="grid h-full content-start gap-1 p-5 pt-10 text-sky-950 dark:text-white">
            <p className="m-0 font-mono text-xs tracking-widest uppercase opacity-80">Field notes</p>
            <h3 className="m-0 font-display text-3xl leading-none font-bold text-balance">Above the treeline</h3>
          </motion.div>
        </section>
        <div className="grid gap-3 p-4 text-sm">
          <h4 className="m-0 font-display text-lg font-semibold">How it works</h4>
          <p className="m-0 text-muted">
            Each layer reads the same <code className="rounded-[5px] bg-accent-soft px-1 font-mono text-xs">scrollYProgress</code> and maps it to a
            different distance. The sun travels furthest, the near hill barely moves, so depth appears.
          </p>
          <p className="m-0 text-muted">
            Under a reduced-motion setting the ranges collapse to zero: the layers stay put and the page simply scrolls.
          </p>
          <p className="m-0 rounded-xl bg-stage p-3 font-medium">Scroll back up to run it in reverse.</p>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   3. Carousel: Tailwind does the snapping, Motion reads the position
   ========================================================================== */
const STEPS = [
  ['Install', 'Add tailwindcss and the Vite plugin with one npm command.'],
  ['Import', 'One line of CSS replaces the three old @tailwind directives.'],
  ['Theme', 'Declare your tokens in @theme, next to the styles that use them.'],
  ['Build', 'Run the bundler. Class names are found without a content array.'],
  ['Ship', 'Compare the CSS size against your old build and enjoy the saving.'],
]

function Carousel() {
  const scroller = useRef(null)
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const { scrollXProgress } = useScroll({ container: scroller, axis: 'x' })
  const scaleX = useSpring(scrollXProgress, { stiffness: 260, damping: 34 })
  useMotionValueEvent(scrollXProgress, 'change', (v) => setIndex(Math.round(v * (STEPS.length - 1))))

  const scrollByCard = (dir) => {
    const el = scroller.current
    el.scrollBy({ left: dir * (el.firstElementChild.offsetWidth + 12), behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-3">
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Setup steps carousel"
        className="focus-ring flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-2xl pb-1 [scrollbar-width:none]"
      >
        {STEPS.map(([title, body], i) => (
          <article key={title} className="grid w-[78%] shrink-0 snap-center content-start gap-2 rounded-2xl border border-line bg-surface p-4 sm:w-56">
            <span className="grid size-8 place-items-center rounded-full bg-accent-soft font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <h4 className="m-0 font-display text-lg font-semibold">{title}</h4>
            <p className="m-0 text-sm text-pretty text-muted">{body}</p>
          </article>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div style={{ scaleX }} className="h-full origin-left rounded-full bg-accent" />
        </div>
        <span className="font-mono text-xs text-muted tabular-nums" role="status" aria-live="polite">
          {index + 1} / {STEPS.length}
        </span>
        <button type="button" onClick={() => scrollByCard(-1)} disabled={index === 0} aria-label="Previous step" className={cn(BTN, 'px-2')}>
          ←
        </button>
        <button type="button" onClick={() => scrollByCard(1)} disabled={index === STEPS.length - 1} aria-label="Next step" className={cn(BTN, 'px-2')}>
          →
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionScroll() {
  return (
    <Feature
      id="motion-scroll"
      title="Values that follow the scroll"
      parts={['useScroll', 'useTransform', 'useSpring', 'container', 'target', 'offset', 'useMotionValueEvent']}
      docs={{ href: 'https://motion.dev/docs/react-scroll-animations', label: 'Motion: scroll animations' }}
      description={
        <>
          <p>
            <code>useScroll</code> returns motion values (<code>scrollYProgress</code> runs from 0 to 1). Pass it a <code>container</code> to read a
            scrollable box rather than the page, and a <code>target</code> with <code>offset</code> to track one element.
          </p>
          <p>
            <strong>Plain Tailwind</strong> already handles <code>sticky</code> headers, <code>snap-x</code> carousels and hiding scrollbars. None of
            those needs JavaScript.
          </p>
          <p>
            <strong>Reach for Motion</strong> when a number must follow the scroll position: a progress bar, a parallax offset, a counter. Wrap it in{' '}
            <code>useTransform</code> to map ranges, and in <code>useSpring</code> to smooth it.
          </p>
        </>
      }
    >
      <Example
        title="Reading progress inside a scroll container"
        lang="jsx"
        code={`const scroller = useRef(null)
const { scrollYProgress } = useScroll({ container: scroller })
const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32 })

<div ref={scroller} className="h-80 overflow-y-auto">
  <div className="sticky top-0 bg-surface/90">
    <motion.div style={{ scaleX }} className="h-1 origin-left bg-accent" />
  </div>
  …article…
</div>`}
      >
        <ReadingProgress />
      </Example>

      <Example
        title="Parallax: one progress, three speeds"
        lang="jsx"
        code={`const { scrollYProgress } = useScroll({
  container: scroller, target: hero, offset: ['start start', 'end start'],
})
const sunY = useTransform(scrollYProgress, [0, 1], [0, 150])
const nearY = useTransform(scrollYProgress, [0, 1], [0, 40])

<motion.div style={{ y: sunY }} className="absolute top-12 right-8 size-16 rounded-full bg-amber-300" />
<motion.div style={{ y: nearY }} className="absolute -bottom-24 h-44 w-[120%] rounded-[50%] bg-emerald-800" />`}
      >
        <ParallaxHero />
      </Example>

      <Example
        title="Carousel: snap from Tailwind, progress from Motion"
        lang="jsx"
        code={`const { scrollXProgress } = useScroll({ container: scroller, axis: 'x' })
const scaleX = useSpring(scrollXProgress)

<div ref={scroller} className="flex snap-x snap-mandatory gap-3 overflow-x-auto">
  <article className="w-[78%] shrink-0 snap-center">…</article>
</div>
<motion.div style={{ scaleX }} className="h-1.5 origin-left rounded-full bg-accent" />`}
      >
        <Carousel />
      </Example>
    </Feature>
  )
}
