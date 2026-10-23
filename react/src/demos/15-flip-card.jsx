import { useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * 3D flip cards, toggled by React state.
 *
 * Four pieces, all plain Tailwind v4 utilities:
 *   perspective-*      on the wrapper: how strong the depth effect is
 *   transform-3d       on the turning element, so its children keep their own depth
 *   rotate-y-180       the turn itself (rotate-x-180 for a vertical flip)
 *   backface-hidden    on both faces, so only the side facing you is drawn
 * The back face is pre-rotated by 180deg, so after the card turns it reads
 * the right way round. React only flips `data-flipped`.
 *
 * `inert` on the hidden face keeps its buttons out of the tab order.
 */
export const meta = {
  id: 'flip-card',
  title: '3D flip cards',
  group: 'Tailwind motion in React',
  order: 150,
  summary: 'perspective, transform-3d, rotate-y-180 and backface-hidden: a state-driven card flip, a flashcard deck with two axes, and a staggered flip-all grid.',
  tailwind: [
    'perspective-distant',
    'transform-3d',
    'rotate-y-180',
    'rotate-x-180',
    'backface-hidden',
    'data-[flipped=true]:rotate-y-180',
    'data-[stagger=true]:delay-[calc(var(--i)*90ms)]',
    'motion-reduce:transition-none',
  ],
}

/* ---------- small shared pieces ---------- */

function Button({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn('focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none', className)}
    >
      {children}
    </button>
  )
}

function Choice({ label, name, value, onChange, options }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
      {options.map(([v, text]) => (
        <label
          key={v}
          className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-muted transition-colors not-has-checked:hover:bg-accent-soft has-checked:bg-accent has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent motion-reduce:transition-none"
        >
          <input type="radio" className="sr-only" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          {text}
        </label>
      ))}
    </div>
  )
}

/* ---------- 1. Virtual card: rotate-y-180 ---------- */

function VirtualCard() {
  const id = useId()
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="grid justify-items-center gap-4">
      {/* perspective sits on the parent of the turning element, never on the turning element itself */}
      <div className="w-full max-w-88 perspective-distant">
        <div
          id={id}
          data-flipped={flipped}
          onClick={() => setFlipped((f) => !f)}
          className="relative aspect-[1.586] w-full cursor-pointer transform-3d transition-transform duration-700 ease-[cubic-bezier(0.3,1.25,0.5,1)] data-[flipped=true]:rotate-y-180 motion-reduce:transition-none"
        >
          {/* front */}
          <div
            inert={flipped}
            className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-linear-to-br from-sky-600 via-sky-700 to-indigo-800 p-5 text-white shadow-xl shadow-sky-950/30 inset-ring inset-ring-white/20 backface-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold tracking-tight">Harbor Pay</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px]">Virtual</span>
            </div>
            <div aria-hidden="true" className="h-8 w-11 rounded-md bg-linear-to-br from-amber-200 to-amber-400 inset-ring inset-ring-black/10" />
            <div className="grid gap-2">
              <p className="m-0 font-mono text-base tracking-[0.18em] sm:text-lg">•••• •••• •••• 4821</p>
              <div className="flex items-end justify-between text-xs">
                <span className="font-medium tracking-wider uppercase">Amara Okonkwo</span>
                <span className="font-mono">08/28</span>
              </div>
            </div>
          </div>

          {/* back: pre-rotated 180deg, so it faces forward once the card has turned */}
          <div
            inert={!flipped}
            className="absolute inset-0 flex rotate-y-180 flex-col overflow-hidden rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 text-white shadow-xl shadow-slate-950/30 inset-ring inset-ring-white/15 backface-hidden"
          >
            <div aria-hidden="true" className="mt-5 h-10 bg-black" />
            <div className="mt-4 flex items-center gap-3 px-5">
              <div aria-hidden="true" className="h-8 flex-1 rounded-sm bg-[repeating-linear-gradient(135deg,#f1f5f9_0_6px,#e2e8f0_6px_12px)]" />
              <p className="m-0 rounded-sm bg-white px-2.5 py-1 font-mono text-sm font-semibold text-slate-900">
                <span className="sr-only">Security code </span>417
              </p>
            </div>
            <p className="m-0 mt-auto p-5 text-[11px] leading-snug text-slate-300">Virtual card for online purchases. The number is shown once; rotate it any time in Settings.</p>
          </div>
        </div>
      </div>

      <Button onClick={() => setFlipped((f) => !f)} aria-pressed={flipped} aria-controls={id}>
        {flipped ? 'Show front' : 'Show security code'}
      </Button>
    </div>
  )
}

/* ---------- 2. Flashcards: the axis is a class swap ---------- */

const DECK = [
  {
    q: 'What does the starting: variant generate?',
    a: 'An @starting-style rule. It sets how an element looks on its first frame, and the browser transitions from there.',
  },
  {
    q: 'Which class marks an element as a query container?',
    a: '@container. Children can then use @sm:, @md:, @lg: and friends, which respond to the container’s width, not the viewport’s.',
  },
  {
    q: 'What replaced bg-opacity-50 in v4?',
    a: 'The slash syntax on the colour itself: bg-black/50. The separate opacity utilities were removed.',
  },
  {
    q: 'shadow-sm from v3 is called what in v4?',
    a: 'shadow-xs. The shadow, blur, drop-shadow and rounded scales each moved down one step, so v3’s plain shadow became shadow-sm.',
  },
  {
    q: 'How do you hand a CSS variable to a utility?',
    a: 'With parentheses: w-(--sidebar-width) replaces w-[var(--sidebar-width)].',
  },
]

// Full class strings so the scanner sees both.
const AXES = {
  y: { turn: 'data-[flipped=true]:rotate-y-180', back: 'rotate-y-180' },
  x: { turn: 'data-[flipped=true]:rotate-x-180', back: 'rotate-x-180' },
}

function Flashcards() {
  const reduced = useReducedMotion()
  const axisName = useId()
  const timer = useRef(0)
  const [axis, setAxis] = useState('x')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = DECK[index]

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // if the answer is showing, turn back to the question first, then swap the card
  function go(delta) {
    const swap = () => setIndex((i) => (i + delta + DECK.length) % DECK.length)
    window.clearTimeout(timer.current)
    if (flipped) {
      setFlipped(false)
      timer.current = window.setTimeout(swap, reduced ? 0 : 350)
    } else {
      swap()
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Choice
          label="Flip axis"
          name={axisName}
          value={axis}
          onChange={setAxis}
          options={[
            ['x', 'Vertical flip'],
            ['y', 'Horizontal flip'],
          ]}
        />
        <p className="m-0 font-mono text-xs text-muted" aria-live="polite">
          Card {index + 1} of {DECK.length}
        </p>
      </div>

      <div className="perspective-midrange">
        <div
          data-flipped={flipped}
          onClick={() => setFlipped((f) => !f)}
          className={`relative h-64 w-full cursor-pointer transform-3d transition-transform duration-600 ease-[cubic-bezier(0.3,1.35,0.5,1)] motion-reduce:transition-none ${AXES[axis].turn}`}
        >
          <div
            inert={flipped}
            className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/5 backface-hidden"
          >
            <p className="m-0 font-mono text-[11px] tracking-widest text-muted uppercase">Question</p>
            <p className="m-0 font-display text-xl leading-snug font-semibold text-balance">{card.q}</p>
            <p className="m-0 text-xs text-muted">Tap the card to reveal the answer</p>
          </div>
          <div
            inert={!flipped}
            className={`absolute inset-0 flex flex-col justify-between rounded-2xl bg-code-bg p-5 text-code-fg shadow-lg shadow-black/10 backface-hidden ${AXES[axis].back}`}
          >
            <p className="m-0 font-mono text-[11px] tracking-widest text-code-tag uppercase">Answer</p>
            <p className="m-0 text-[15px] leading-relaxed text-pretty">{card.a}</p>
            <p className="m-0 text-xs text-code-comment">Tap again to go back</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button onClick={() => go(-1)}>Previous</Button>
        <Button onClick={() => setFlipped((f) => !f)} aria-pressed={flipped} className="border-accent text-accent">
          {flipped ? 'Show question' : 'Show answer'}
        </Button>
        <Button onClick={() => go(1)}>Next</Button>
      </div>
    </div>
  )
}

/* ---------- 3. Flip all: a staggered grid ---------- */

const V4 = [
  {
    n: '01',
    title: 'CSS-first setup',
    front: 'No tailwind.config.js. One import pulls everything in, and the theme is plain CSS.',
    code: ['@import "tailwindcss";', '', '@theme {', '  --color-brand: #0369a1;', '}'],
  },
  {
    n: '02',
    title: 'Container queries',
    front: 'Style a child by the size of its parent instead of the screen, with no plugin.',
    code: ['<div className="@container">', '  <p className="@md:text-lg">', '    …', '  </p>', '</div>'],
  },
  {
    n: '03',
    title: '3D transforms',
    front: 'Perspective, depth and rotation on every axis, as utilities. This grid uses them.',
    code: ['perspective-distant', 'transform-3d', 'rotate-y-180', 'backface-hidden'],
  },
  {
    n: '04',
    title: 'Dynamic values',
    front: 'Spacing, grid columns and sizes accept any number. No more config for one-offs.',
    code: ['grid-cols-15', 'mt-17', 'w-29', 'size-(--avatar)'],
  },
]

function FlipGrid() {
  const [flips, setFlips] = useState(() => V4.map(() => false))
  const [stagger, setStagger] = useState(false)
  const allFlipped = flips.every(Boolean)

  const flipOne = (i) => {
    setStagger(false)
    setFlips((f) => f.map((v, k) => (k === i ? !v : v)))
  }
  const flipAll = () => {
    setStagger(true)
    setFlips(V4.map(() => !allFlipped))
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={flipAll} className="border-accent text-accent">
          {allFlipped ? 'Flip all to the front' : 'Flip all to the back'}
        </Button>
        <span className="text-xs text-muted">A single card turns at once; “flip all” staggers them with a variable.</span>
      </div>

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3 p-0">
        {V4.map((item, i) => (
          <li key={item.n} className="perspective-distant">
            {/* data-stagger adds the delay only for “flip all”, so a lone click never waits for its turn */}
            <div
              data-flipped={flips[i]}
              data-stagger={stagger}
              style={{ '--i': i }}
              className="relative h-52 transform-3d transition-transform duration-700 ease-[cubic-bezier(0.3,1.25,0.5,1)] data-[flipped=true]:rotate-y-180 data-[stagger=true]:delay-[calc(var(--i)*90ms)] motion-reduce:transition-none"
            >
              <div inert={flips[i]} className="absolute inset-0 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 shadow-md shadow-black/5 backface-hidden">
                <span className="font-mono text-xs font-semibold text-accent">{item.n}</span>
                <h4 className="m-0 font-display text-lg leading-tight font-semibold">{item.title}</h4>
                <p className="m-0 text-[13.5px] leading-snug text-pretty text-muted">{item.front}</p>
                <Button onClick={() => flipOne(i)} className="mt-auto w-fit">
                  Show code
                </Button>
              </div>
              <div
                inert={!flips[i]}
                className="absolute inset-0 flex rotate-y-180 flex-col gap-2 rounded-2xl bg-code-bg p-4 text-code-fg shadow-md shadow-black/10 backface-hidden"
              >
                <span className="font-mono text-xs text-code-tag">{item.title}</span>
                <pre className="m-0 flex-1 overflow-hidden font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{item.code.join('\n')}</pre>
                <button
                  type="button"
                  onClick={() => flipOne(i)}
                  className="focus-ring w-fit cursor-pointer rounded-md border border-code-fg/25 bg-code-fg/10 px-2.5 py-1 text-xs font-medium text-code-fg transition-colors hover:bg-code-fg/20 motion-reduce:transition-none"
                >
                  Back
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- the demo ---------- */

export default function FlipCard() {
  return (
    <div className="grid gap-6">
      <Feature
        title="rotate-y-180 and backface-hidden"
        since="4.0"
        parts={['perspective-distant', 'transform-3d', 'rotate-y-180', 'backface-hidden', 'data-[flipped=true]:rotate-y-180']}
        docs={{ href: 'https://tailwindcss.com/docs/backface-visibility', label: 'backface-visibility' }}
        description={
          <>
            <p>
              The wrapper has <code>perspective-distant</code>. The turning element has <code>transform-3d</code> and flips with{' '}
              <code>data-[flipped=true]:rotate-y-180</code>. Each face is <code>absolute inset-0 backface-hidden</code>, and the back one is pre-rotated.
            </p>
            <p>
              Pointer users click the card; keyboard users get a real button. The face that is turned away is <code>inert</code>.
            </p>
          </>
        }
      >
        <Example
          title="Virtual payment card"
          lang="jsx"
          code={`<div className="perspective-distant">
  <div data-flipped={flipped}
       className="relative transform-3d transition-transform duration-700
              data-[flipped=true]:rotate-y-180 motion-reduce:transition-none">
    <div inert={flipped} className="absolute inset-0 backface-hidden">front</div>
    <div inert={!flipped} className="absolute inset-0 rotate-y-180 backface-hidden">back</div>
  </div>
</div>`}
        >
          <VirtualCard />
        </Example>

        <Example
          title="Flashcards: pick the axis"
          lang="jsx"
          code={`// vertical flip
data-[flipped=true]:rotate-x-180      // turning element
rotate-x-180 backface-hidden          // back face

// horizontal flip
data-[flipped=true]:rotate-y-180
rotate-y-180 backface-hidden`}
        >
          <Flashcards />
        </Example>
      </Feature>

      <Feature
        title="Staggered flip-all"
        since="4.0"
        parts={['data-[stagger=true]:delay-[calc(var(--i)*90ms)]', 'perspective-distant', 'grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]']}
        docs={{ href: 'https://tailwindcss.com/docs/perspective', label: 'perspective' }}
        description={
          <>
            <p>
              Every card keeps its own <code>data-flipped</code>, so each one turns independently. “Flip all” sets them together and adds{' '}
              <code>data-stagger</code>, which switches on <code>delay-[calc(var(--i)*90ms)]</code>.
            </p>
            <p>The delay is conditional on purpose: a delay that is always on would make a single click wait for its turn in line.</p>
          </>
        }
      >
        <Example
          title="What changed in v4"
          lang="jsx"
          code={`<div data-flipped={flips[i]} data-stagger={stagger} style={{ '--i': i }}
     className="transform-3d transition-transform duration-700
            data-[flipped=true]:rotate-y-180
            data-[stagger=true]:delay-[calc(var(--i)*90ms)]">
  …
</div>`}
        >
          <FlipGrid />
        </Example>
      </Feature>
    </div>
  )
}
