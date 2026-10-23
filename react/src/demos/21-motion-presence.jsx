import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-presence',
  title: 'AnimatePresence: modal, toasts, steps',
  group: 'Motion library + Tailwind',
  order: 210,
  summary:
    'AnimatePresence keeps a removed element mounted until its exit animation ends: a modal, a toast stack and a step wizard. Tailwind v4 can animate things in with starting:, but only Motion can animate them out of the DOM.',
  tailwind: ['absolute inset-0', 'isolate', 'shadow-2xl', 'max-w-xs', 'tabular-nums', 'starting:', 'dark:'],
}

const BUTTON = 'focus-ring inline-flex cursor-pointer items-center justify-center rounded-xl px-3.5 py-2 text-sm font-semibold select-none'
const BUTTON_PRIMARY = 'bg-accent text-surface shadow-sm'
const BUTTON_QUIET = 'border border-line bg-surface text-ink hover:border-accent'

/* ==========================================================================
   1. Modal: backdrop fades, panel springs; both animate out before unmounting
   ========================================================================== */
function ModalExample() {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const triggerRef = useRef(null)
  const dialogRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  // Escape closes the dialog, wherever focus is
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // keep Tab inside the dialog while it is open
  function trapTab(e) {
    if (e.key !== 'Tab') return
    const items = dialogRef.current.querySelectorAll('button')
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="relative isolate h-80 overflow-hidden rounded-2xl border border-line bg-surface">
      {/* the page behind the dialog: `inert` removes it from the tab order and the accessibility tree */}
      <div inert={open} className="grid gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 font-display text-lg font-semibold">Q4 launch site</h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[11px] font-medium',
              deleted ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
            )}
          >
            {deleted ? 'Deleted' : 'Live'}
          </span>
        </div>
        <dl className="m-0 grid grid-cols-3 gap-2 text-center">
          {[
            ['Pages', '14'],
            ['People', '3'],
            ['Deploy', '2h ago'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-stage px-2 py-2">
              <dt className="text-[11px] tracking-wide text-muted uppercase">{label}</dt>
              <dd className="m-0 text-sm font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-2 rounded-xl border border-red-500/40 p-3">
          <p className="m-0 text-sm font-medium">Danger zone</p>
          <p className="m-0 text-xs text-muted">Deleting removes every page and revokes access for collaborators.</p>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => (deleted ? setDeleted(false) : setOpen(true))}
            className={cn(BUTTON, 'w-fit', deleted ? BUTTON_QUIET : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400')}
          >
            {deleted ? 'Restore project' : 'Delete project…'}
          </button>
        </div>
      </div>

      {/* onExitComplete: focus goes back to the trigger only after the exit animation has finished */}
      <AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
        {open && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-10 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-slate-950/55" />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="presence-dialog-title"
              aria-describedby="presence-dialog-desc"
              onKeyDown={trapTab}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
              className="relative w-full max-w-xs rounded-2xl border border-line bg-surface p-5 shadow-2xl"
            >
              <h4 id="presence-dialog-title" className="m-0 font-display text-lg leading-snug font-semibold">
                Delete Q4 launch site?
              </h4>
              <p id="presence-dialog-desc" className="mt-2 mb-0 text-sm text-pretty text-muted">
                This removes 14 pages and revokes access for 3 collaborators. You can restore it from the project list.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" autoFocus onClick={close} className={cn(BUTTON, BUTTON_QUIET)}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleted(true)
                    close()
                  }}
                  className={cn(BUTTON, 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400')}
                >
                  Delete project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ==========================================================================
   2. Toasts: mode="popLayout" lets the survivors slide into the gap
   ========================================================================== */
const TOAST_MS = 4200
const TOASTS = {
  success: { title: 'Draft saved', body: 'All changes are stored.', bar: 'bg-emerald-500', label: 'Save draft' },
  info: { title: 'Invite sent', body: 'ada@analytical.engine will get an email.', bar: 'bg-sky-500', label: 'Invite teammate' },
  error: { title: 'Upload failed', body: 'logo.svg is larger than 2 MB.', bar: 'bg-red-500', label: 'Upload logo' },
}

// the timer lives in an inner component so the <motion.li> stays a direct child of AnimatePresence
function ToastBody({ toast, onClose, reduce }) {
  useEffect(() => {
    const id = setTimeout(() => onClose(toast.id), TOAST_MS)
    return () => clearTimeout(id)
  }, [toast.id, onClose])

  const kind = TOASTS[toast.kind]
  return (
    <>
      <div className="flex items-start gap-3 p-3 pr-2">
        <span aria-hidden="true" className={cn('mt-1 size-2.5 shrink-0 rounded-full', kind.bar)} />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold">{kind.title}</p>
          <p className="m-0 text-xs text-pretty text-muted">{kind.body}</p>
        </div>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          aria-label={`Dismiss: ${kind.title}`}
          className="focus-ring grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-stage hover:text-ink"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className={cn('absolute bottom-0 left-0 h-0.5 w-full origin-left', kind.bar)}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: TOAST_MS / 1000, ease: 'linear' }}
        />
      )}
    </>
  )
}

function ToastExample() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)
  const reduce = useReducedMotion()

  const push = (kind) => {
    const id = nextId.current++
    setToasts((list) => [...list.slice(-2), { id, kind }]) // keep at most 3
  }
  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  return (
    // tall enough that three toasts stack below the trigger buttons instead of covering them
    <div className="relative isolate h-[28rem] overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid gap-3 p-4 sm:p-5">
        <div>
          <h3 className="m-0 font-display text-lg font-semibold">Notifications playground</h3>
          <p className="m-0 mt-1 text-sm text-muted">Fire a few in a row, then dismiss one from the middle.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TOASTS).map(([kind, { label }]) => (
            <button key={kind} type="button" onClick={() => push(kind)} className={cn(BUTTON, BUTTON_QUIET)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setToasts([])}
            disabled={toasts.length === 0}
            className={cn(BUTTON, 'text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50')}
          >
            Clear all
          </button>
        </div>
      </div>

      <ul role="status" aria-live="polite" className="absolute right-3 bottom-3 left-3 z-10 m-0 grid list-none justify-items-end gap-2 p-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.li
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 56, scale: 0.96 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              className="relative w-full max-w-72 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
            >
              <ToastBody toast={toast} onClose={dismiss} reduce={reduce} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

/* ==========================================================================
   3. Wizard: mode="wait" plus `custom` makes enter and exit follow the direction
   ========================================================================== */
const STEPS = [
  {
    title: 'Connect your repository',
    body: 'Grant read access so the build can scan your templates. Tailwind v4 finds class names automatically; there is no content array to maintain.',
  },
  {
    title: 'Move your theme into CSS',
    body: 'Paste your old tailwind.config.js and turn its colors, fonts and breakpoints into an @theme block that sits next to your styles.',
  },
  {
    title: 'Ship and compare',
    body: 'Run the production build, then compare the CSS size and build time against the v3 baseline. Most projects get smaller and faster.',
  },
]

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -40 }),
}

function WizardExample() {
  const [[step, dir], setPage] = useState([0, 1])
  const last = STEPS.length - 1
  const go = (delta) => setPage(([s]) => [Math.min(last, Math.max(0, s + delta)), delta])
  const current = STEPS[step]

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 font-mono text-xs tracking-widest text-muted uppercase">
          Step {step + 1} of {STEPS.length}
        </p>
        <div aria-hidden="true" className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span key={s.title} className={cn('h-1.5 w-6 rounded-full transition-colors duration-300 motion-reduce:transition-none', i <= step ? 'bg-accent' : 'bg-line')} />
          ))}
        </div>
      </div>

      <div className="relative min-h-40 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <h3 className="m-0 font-display text-xl leading-snug font-semibold text-balance">{current.title}</h3>
            <p className="mt-2 mb-0 text-sm text-pretty text-muted">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-2">
        <button type="button" onClick={() => go(-1)} disabled={step === 0} className={cn(BUTTON, BUTTON_QUIET, 'disabled:cursor-not-allowed disabled:opacity-50')}>
          Back
        </button>
        <button
          type="button"
          onClick={() => (step === last ? setPage([0, -1]) : go(1))}
          className={cn(BUTTON, BUTTON_PRIMARY)}
        >
          {step === last ? 'Start over' : 'Next'}
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionPresence() {
  return (
    <Feature
      id="motion-presence"
      title="Animating things out"
      parts={['AnimatePresence', 'exit', 'mode="popLayout"', 'mode="wait"', 'custom', 'onExitComplete']}
      docs={{ href: 'https://motion.dev/docs/react-animation', label: 'Motion: React animation' }}
      description={
        <>
          <p>
            React removes an element the instant its condition turns false. <code>AnimatePresence</code> holds it in the DOM until its{' '}
            <code>exit</code> animation has finished.
          </p>
          <p>
            <strong>Plain Tailwind</strong> covers the way in: the <code>starting:</code> variant styles an element for its first frame, so a{' '}
            <code>transition</code> can animate it into place with no JavaScript.
          </p>
          <p>
            <strong>Reach for Motion</strong> for the way out, for lists where survivors must close the gap, and for steps whose direction depends
            on where the user came from.
          </p>
          <p>
            The two frames are <code>absolute</code> boxes so the page stays usable. In an app, make the overlay <code>fixed inset-0</code>.
          </p>
        </>
      }
    >
      <Example
        title="Modal: backdrop fade, spring panel, focus returns"
        lang="jsx"
        code={`<AnimatePresence onExitComplete={() => trigger.current?.focus()}>
  {open && (
    <motion.div className="absolute inset-0 grid place-items-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div role="dialog" aria-modal="true"
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
        className="w-full max-w-xs rounded-2xl bg-surface p-5 shadow-2xl" />
    </motion.div>
  )}
</AnimatePresence>`}
      >
        <ModalExample />
      </Example>

      <Example
        title="Toast stack: popLayout and layout"
        lang="jsx"
        code={`<ul role="status" aria-live="polite" className="absolute right-3 bottom-3 left-3 grid gap-2">
  <AnimatePresence mode="popLayout">
    {toasts.map((t) => (
      <motion.li key={t.id} layout
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 56 }}
        className="w-full max-w-72 rounded-xl border border-line bg-surface shadow-lg" />
    ))}
  </AnimatePresence>
</ul>`}
      >
        <ToastExample />
      </Example>

      <Example
        title="Wizard: mode wait with a direction"
        lang="jsx"
        code={`const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -40 }),
}

<AnimatePresence mode="wait" custom={dir} initial={false}>
  <motion.div key={step} custom={dir} variants={slide}
    initial="enter" animate="center" exit="exit" />
</AnimatePresence>`}
      >
        <WizardExample />
      </Example>
    </Feature>
  )
}
