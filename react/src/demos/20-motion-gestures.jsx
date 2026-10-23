import { useState } from 'react'
import { motion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-gestures',
  title: 'Gestures: hover, tap and focus',
  group: 'Motion library + Tailwind',
  order: 200,
  summary:
    'whileHover, whileTap and whileFocus on Tailwind-styled buttons, cards and inputs. Plain hover: and transition utilities are enough for colour and simple transforms; reach for Motion when a press needs spring physics or a parent hover must drive its children.',
  tailwind: ['motion-safe:', 'transition-transform', 'hover:-translate-y-0.5', 'active:scale-95', 'bg-linear-to-br', 'focus-ring', 'form-input'],
}

/* ---------- small layout helpers ---------- */
const BUTTON = 'focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold select-none'

function Tile({ caption, children }) {
  return (
    <div className="grid content-start justify-items-start gap-2">
      {children}
      <p className="m-0 text-xs text-pretty text-muted">{caption}</p>
    </div>
  )
}

/* ==========================================================================
   1. Buttons: the same press, built two ways
   ========================================================================== */
function HeartIcon({ filled }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      // keyframes: a one-off pop whenever `filled` flips to true
      animate={filled ? { scale: [1, 1.5, 1], rotate: [0, -14, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </motion.svg>
  )
}

function Buttons() {
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(0)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-4 gap-y-6">
      <Tile caption="CSS only: transition-transform with hover: and active:">
        <button
          type="button"
          className={cn(
            BUTTON,
            'bg-accent text-surface shadow-sm transition-transform duration-150 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95',
          )}
        >
          Save changes
        </button>
      </Tile>

      <Tile caption="Motion: a spring on whileHover and whileTap">
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20 }}
          className={cn(BUTTON, 'bg-accent text-surface shadow-sm')}
        >
          Save changes
        </motion.button>
      </Tile>

      <Tile caption="Toggle: whileTap plus a keyframe pop on state change">
        <motion.button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          whileTap={{ scale: 0.88 }}
          className={cn(
            BUTTON,
            'border border-line bg-surface text-ink',
            liked && 'border-rose-400 text-rose-600 dark:border-rose-400/70 dark:text-rose-300',
          )}
        >
          <HeartIcon filled={liked} />
          <span className="tabular-nums">{liked ? 129 : 128}</span>
        </motion.button>
      </Tile>

      <Tile caption="Icon swap: whileHover rotates the plus into an x">
        <motion.button
          type="button"
          onClick={() => setAdded((n) => n + 1)}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          aria-label={`Add item (${added} added)`}
          className={cn(BUTTON, 'size-11 rounded-full border border-line bg-surface p-0 text-accent')}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
        <span className="sr-only" role="status">
          {added} items added
        </span>
      </Tile>
    </div>
  )
}

/* ==========================================================================
   2. Cards: whileHover on the parent drives every child through variants
   ========================================================================== */
const POSTS = [
  { id: 'cq', tag: 'Layout', mins: 6, title: 'Container queries in production', gradient: 'from-sky-400 to-indigo-500' },
  { id: 'theme', tag: 'Theming', mins: 8, title: 'Design tokens with @theme', gradient: 'from-emerald-400 to-teal-600' },
  { id: 'dark', tag: 'Dark mode', mins: 5, title: 'Dark mode without a flash', gradient: 'from-amber-300 to-rose-500' },
]

// the parent sets the label ("hover"); each child picks its own target for that label
const cardVariants = { hover: { y: -6 }, tap: { scale: 0.98 } }
const thumbVariants = { hover: { scale: 1.14, rotate: 1.5 } }
const arrowVariants = { hover: { x: 6 } }

function PostCard({ post, saved, onToggle }) {
  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      onClick={onToggle}
      variants={cardVariants}
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="focus-ring grid w-full cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface text-left text-ink shadow-sm transition-shadow duration-200 hover:shadow-lg"
    >
      <span className="block h-20 overflow-hidden">
        <motion.span variants={thumbVariants} className={cn('block size-full bg-linear-to-br', post.gradient)} />
      </span>
      <span className="grid gap-1 p-3.5">
        <span className="font-mono text-[11px] font-medium tracking-widest text-accent uppercase">
          {post.tag} · {post.mins} min
        </span>
        <span className="font-display text-base leading-snug font-semibold text-balance">{post.title}</span>
        <span className="mt-1 flex items-center justify-between gap-2 text-sm text-muted">
          <span>{saved ? 'Saved to reading list' : 'Save for later'}</span>
          <motion.span variants={arrowVariants} aria-hidden="true" className="text-accent">
            →
          </motion.span>
        </span>
      </span>
    </motion.button>
  )
}

function Cards() {
  const [saved, setSaved] = useState(() => new Set(['theme']))
  const toggle = (id) =>
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
        {POSTS.map((post) => (
          <PostCard key={post.id} post={post} saved={saved.has(post.id)} onToggle={() => toggle(post.id)} />
        ))}
      </div>
      <p className="m-0 text-sm text-muted" role="status">
        {saved.size === 0 ? 'Reading list is empty.' : `${saved.size} of ${POSTS.length} saved to your reading list.`}
      </p>
    </div>
  )
}

/* ==========================================================================
   3. Focus: whileFocus on a form field
   ========================================================================== */
function FocusForm() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <form
      className="mx-auto grid grid-cols-1 max-w-sm gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setDone(true)
      }}
    >
      <div className="grid gap-1.5">
        <label htmlFor="gestures-email" className="text-sm font-medium">
          Work email
        </label>
        <motion.input
          id="gestures-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setDone(false)
          }}
          placeholder="ada@analytical.engine"
          whileFocus={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="form-input focus-ring w-full rounded-xl border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:ring-0"
        />
        <p className="m-0 text-xs text-muted">Tab into the field: the keyboard focus triggers the same animation as a click.</p>
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className={cn(BUTTON, 'w-full bg-accent text-surface shadow-sm', done && 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950')}
      >
        {done ? 'Subscribed, check your inbox' : 'Send me the changelog'}
      </motion.button>
    </form>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionGestures() {
  return (
    <Feature
      id="motion-gestures"
      title="Gestures are props"
      parts={['whileHover', 'whileTap', 'whileFocus', 'variants', 'transition']}
      docs={{ href: 'https://motion.dev/docs/react-animation', label: 'Motion: React animation' }}
      description={
        <>
          <p>
            Each gesture prop names a target. Motion animates to it while the gesture is active and back when it ends, so there is no state to
            keep.
          </p>
          <p>
            <strong>Plain Tailwind</strong> is the right tool for colour, shadow and one-step transforms: <code>hover:</code>,{' '}
            <code>active:</code> and <code>transition</code> cost nothing at runtime.
          </p>
          <p>
            <strong>Reach for Motion</strong> when you want spring physics, a press that interrupts smoothly, keyframes, or a hover on the parent that
            moves several children differently (variants).
          </p>
        </>
      }
    >
      <Example
        title="Buttons: CSS transition vs Motion spring"
        lang="jsx"
        code={`<button className="transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95">
  Save changes
</button>

<motion.button
  whileHover={{ scale: 1.06 }}
  whileTap={{ scale: 0.92 }}
  transition={{ type: 'spring', stiffness: 520, damping: 20 }}
  className="rounded-xl bg-accent px-4 py-2 text-surface"
>
  Save changes
</motion.button>`}
      >
        <Buttons />
      </Example>

      <Example
        title="Cards: one hover, three different children"
        lang="jsx"
        code={`const card = { hover: { y: -6 }, tap: { scale: 0.98 } }
const thumb = { hover: { scale: 1.14 } }
const arrow = { hover: { x: 6 } }

<motion.button variants={card} whileHover="hover" whileFocus="hover" whileTap="tap">
  <span className="overflow-hidden">
    <motion.span variants={thumb} className="bg-linear-to-br from-sky-400 to-indigo-500" />
  </span>
  <motion.span variants={arrow}>→</motion.span>
</motion.button>`}
      >
        <Cards />
      </Example>

      <Example
        title="Form field: whileFocus"
        lang="jsx"
        code={`<motion.input
  type="email"
  whileFocus={{ scale: 1.03 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  className="form-input focus-ring rounded-xl border-line focus:border-accent focus:ring-0"
/>`}
      >
        <FocusForm />
      </Example>
    </Feature>
  )
}
