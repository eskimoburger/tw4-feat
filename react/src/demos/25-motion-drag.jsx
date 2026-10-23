import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-drag',
  title: 'Drag: constraints, elastic and snap',
  group: 'Motion library + Tailwind',
  order: 250,
  summary:
    'drag, dragConstraints, dragElastic and dragSnapToOrigin on Tailwind-styled elements: a constrained box, a slide-to-confirm control and swipe-to-archive rows. CSS has no pointer-driven movement at all, so any draggable UI is a job for Motion.',
  tailwind: ['touch-none', 'touch-pan-y', 'cursor-grab', 'active:cursor-grabbing', 'size-20', 'overflow-hidden', 'rounded-full', 'bg-emerald-600'],
}

const CHIP = 'focus-ring cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'
const CHIP_IDLE = 'border-line bg-surface text-muted hover:border-accent hover:text-ink'
const CHIP_ON = 'border-accent bg-accent text-surface'
const SPRING = { type: 'spring', stiffness: 500, damping: 34 }

/* ==========================================================================
   1. Constraints, elastic edges and snap-back
   ========================================================================== */
function ConstrainedDrag() {
  const areaRef = useRef(null)
  const boxRef = useRef(null)
  const [elastic, setElastic] = useState(0.2)
  const [snap, setSnap] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // a MotionValue can be rendered as text: the readout updates without re-rendering React
  const xText = useTransform(x, (v) => Math.round(v))
  const yText = useTransform(y, (v) => Math.round(v))

  // drag needs a pointer; arrow keys give keyboard users the same box, clamped to the same area
  function onKeyDown(e) {
    const step = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key]
    if (!step) return
    e.preventDefault()
    const box = boxRef.current
    const area = areaRef.current
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
    animate(x, clamp(x.get() + step[0], -box.offsetLeft, area.clientWidth - box.offsetLeft - box.offsetWidth), SPRING)
    animate(y, clamp(y.get() + step[1], -box.offsetTop, area.clientHeight - box.offsetTop - box.offsetHeight), SPRING)
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Drag settings">
        <span className="text-sm text-muted">Elastic</span>
        {[0, 0.2, 0.6].map((v) => (
          <button key={v} type="button" aria-pressed={elastic === v} onClick={() => setElastic(v)} className={cn(CHIP, 'tabular-nums', elastic === v ? CHIP_ON : CHIP_IDLE)}>
            {v}
          </button>
        ))}
        <button type="button" aria-pressed={snap} onClick={() => setSnap((s) => !s)} className={cn(CHIP, 'ml-auto', snap ? CHIP_ON : CHIP_IDLE)}>
          Snap back
        </button>
      </div>

      <div ref={areaRef} className="relative h-56 rounded-2xl border-2 border-dashed border-line bg-surface">
        <motion.div
          ref={boxRef}
          drag
          dragConstraints={areaRef}
          dragElastic={elastic}
          dragSnapToOrigin={snap}
          dragMomentum={!snap}
          whileDrag={{ scale: 1.08 }}
          style={{ x, y }}
          tabIndex={0}
          role="group"
          aria-label="Draggable box. Use the arrow keys to move it."
          onKeyDown={onKeyDown}
          className="focus-ring absolute top-4 left-4 grid size-20 cursor-grab touch-none place-items-center rounded-2xl bg-linear-to-br from-sky-600 to-indigo-700 text-sm font-semibold text-white shadow-lg select-none active:cursor-grabbing"
        >
          Drag me
        </motion.div>
        <p className="absolute right-3 bottom-2 m-0 font-mono text-xs text-muted tabular-nums">
          x <motion.span>{xText}</motion.span> · y <motion.span>{yText}</motion.span>
        </p>
      </div>
      <p className="m-0 text-xs text-muted">
        The dashed box is the constraint. With elastic 0 it stops dead at the edge; higher values let it stretch, then spring back. Arrow keys work too.
      </p>
    </div>
  )
}

/* ==========================================================================
   2. Slide to confirm: constraints measured from the rail, decided on release
   ========================================================================== */
const KNOB = 48 // size-12
const RAIL_PAD = 4 // p-1

function SlideToConfirm() {
  const railRef = useRef(null)
  const [max, setMax] = useState(0)
  const [done, setDone] = useState(false)
  const x = useMotionValue(0)
  const maxX = useMotionValue(0)
  const fill = useTransform(x, (v) => v + KNOB + RAIL_PAD * 2)
  const hint = useTransform([x, maxX], ([xv, m]) => (m ? Math.max(0, 1 - xv / (m * 0.55)) : 1))

  useEffect(() => {
    const rail = railRef.current
    const measure = () => {
      const m = Math.max(0, rail.clientWidth - KNOB - RAIL_PAD * 2)
      setMax(m)
      maxX.set(m)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(rail)
    return () => ro.disconnect()
  }, [maxX])

  const confirm = () => {
    setDone(true)
    animate(x, maxX.get(), SPRING)
  }
  const reset = () => {
    setDone(false)
    animate(x, 0, SPRING)
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-3">
      <div className="flex items-baseline justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div>
          <p className="m-0 text-sm font-medium">Annual Team plan</p>
          <p className="m-0 text-xs text-muted">12 seats · billed to Northwind Studio</p>
        </div>
        <p className="m-0 font-display text-xl font-semibold tabular-nums">$1,728</p>
      </div>

      <div ref={railRef} className="relative h-14 overflow-hidden rounded-full border border-line bg-surface p-1" aria-live="polite">
        <motion.div aria-hidden="true" style={{ width: fill }} className={cn('absolute inset-y-0 left-0 rounded-full', done ? 'bg-emerald-500/30' : 'bg-accent/25')} />
        <motion.p style={{ opacity: hint }} className="pointer-events-none absolute inset-0 m-0 grid place-items-center pl-14 text-sm font-medium text-muted">
          Slide to pay $1,728
        </motion.p>
        {done && <p className="pointer-events-none absolute inset-0 m-0 grid place-items-center pr-14 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Payment sent</p>}
        <motion.button
          type="button"
          drag={done ? false : 'x'}
          dragConstraints={{ left: 0, right: max }}
          dragElastic={0.04}
          dragMomentum={false}
          style={{ x }}
          onDragEnd={() => (x.get() > max * 0.85 ? confirm() : animate(x, 0, SPRING))}
          // a keyboard "click" has detail 0; pointer clicks (the end of a drag) have detail >= 1
          onClick={(e) => e.detail === 0 && !done && confirm()}
          aria-label={done ? 'Payment sent' : 'Slide to confirm payment of $1,728, or press Enter'}
          className={cn(
            'focus-ring relative grid size-12 touch-none place-items-center rounded-full text-surface shadow-md select-none',
            done ? 'cursor-default bg-emerald-600 text-white dark:bg-emerald-500' : 'cursor-grab bg-accent active:cursor-grabbing',
          )}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={done ? 'M5 12.5l4.5 4.5L19 7.5' : 'M5 12h14M13 6l6 6-6 6'} />
          </svg>
        </motion.button>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>Drag past 85% to confirm. Release earlier and it springs home.</span>
        {done && (
          <button type="button" onClick={reset} className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-accent">
            Undo
          </button>
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   3. Swipe to archive: elastic on one side, a threshold on release
   ========================================================================== */
const MAIL = [
  { id: 1, from: 'Priya Nair', subject: 'Review: pricing page copy', time: '09:41' },
  { id: 2, from: 'Tomás Rivera', subject: 'Dark mode tokens are merged', time: '09:12' },
  { id: 3, from: 'Billing', subject: 'Invoice 4821 is ready to download', time: 'Yesterday' },
  { id: 4, from: 'Mara Okafor', subject: 'Offsite agenda: first draft', time: 'Mon' },
]

function SwipeRow({ mail, onArchive }) {
  const x = useMotionValue(0)
  const reveal = useTransform(x, [0, 96], [0, 1])

  return (
    <motion.li
      initial={false}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.24, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="pb-2">
        <div className="relative overflow-hidden rounded-xl border border-line">
          <motion.div aria-hidden="true" style={{ opacity: reveal }} className="absolute inset-0 flex items-center bg-emerald-600 pl-4 text-sm font-semibold text-white">
            Archive
          </motion.div>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            // no stretch to the left, a generous stretch to the right
            dragElastic={{ left: 0, right: 0.9 }}
            style={{ x }}
            onDragEnd={(_, info) => (info.offset.x > 110 || info.velocity.x > 700) && onArchive(mail.id)}
            className="relative flex cursor-grab touch-pan-y items-center gap-3 bg-surface px-3 py-2.5 select-none active:cursor-grabbing"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{mail.from}</span>
                <span className="shrink-0 text-xs text-muted">{mail.time}</span>
              </span>
              <span className="block truncate text-sm text-muted">{mail.subject}</span>
            </span>
            <button
              type="button"
              onClick={() => onArchive(mail.id)}
              aria-label={`Archive: ${mail.subject}`}
              className="focus-ring shrink-0 cursor-pointer rounded-lg border border-line px-2 py-1 text-xs font-medium hover:border-accent"
            >
              Archive
            </button>
          </motion.div>
        </div>
      </div>
    </motion.li>
  )
}

function SwipeList() {
  const [mail, setMail] = useState(MAIL)

  return (
    <div className="mx-auto grid grid-cols-1 max-w-md gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-muted" role="status" aria-live="polite">
          {mail.length ? `${mail.length} in your inbox` : 'Inbox zero.'}
        </p>
        <button
          type="button"
          onClick={() => setMail(MAIL)}
          disabled={mail.length === MAIL.length}
          className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Restore all
        </button>
      </div>
      <ul className="m-0 list-none p-0">
        <AnimatePresence initial={false}>
          {mail.map((m) => (
            <SwipeRow key={m.id} mail={m} onArchive={(id) => setMail((list) => list.filter((item) => item.id !== id))} />
          ))}
        </AnimatePresence>
      </ul>
      <p className="m-0 text-xs text-muted">Swipe a row to the right past the threshold. Anything less springs back; the button does the same for keyboards.</p>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionDrag() {
  return (
    <Feature
      id="motion-drag"
      title="Pointer-driven movement"
      parts={['drag', 'dragConstraints', 'dragElastic', 'dragSnapToOrigin', 'dragMomentum', 'onDragEnd', 'touch-none']}
      docs={{ href: 'https://motion.dev/docs/react-motion-component', label: 'Motion: the motion component' }}
      description={
        <>
          <p>
            Add <code>drag</code> and the element follows the pointer. Constraints can be a pixel box or another element&apos;s ref;{' '}
            <code>dragElastic</code> sets how far it may stretch past them.
          </p>
          <p>
            <strong>Plain Tailwind</strong> has no pointer-driven movement, but it does the supporting work: <code>touch-none</code> or{' '}
            <code>touch-pan-y</code> decides which touch gestures the browser keeps, and <code>cursor-grab</code> sets the affordance.
          </p>
          <p>
            <strong>Reach for Motion</strong> for every draggable. Give keyboard users a second route, as the arrow keys, Enter and Archive buttons
            do here.
          </p>
        </>
      }
    >
      <Example
        title="Constrained box with elastic edges"
        lang="jsx"
        code={`<div ref={area} className="relative h-56 rounded-2xl border-2 border-dashed">
  <motion.div drag dragConstraints={area}
    dragElastic={0.2} dragSnapToOrigin={snap}
    whileDrag={{ scale: 1.08 }}
    className="absolute top-4 left-4 size-20 cursor-grab touch-none rounded-2xl bg-accent" />
</div>`}
      >
        <ConstrainedDrag />
      </Example>

      <Example
        title="Slide to confirm: decide on release"
        lang="jsx"
        code={`const x = useMotionValue(0)

<motion.button drag="x" dragConstraints={{ left: 0, right: max }}
  dragElastic={0.04} dragMomentum={false} style={{ x }}
  onDragEnd={() => x.get() > max * 0.85 ? confirm() : animate(x, 0, spring)}
  className="size-12 touch-none rounded-full bg-accent" />`}
      >
        <SlideToConfirm />
      </Example>

      <Example
        title="Swipe to archive: one-sided elastic"
        lang="jsx"
        code={`<motion.div drag="x" dragConstraints={{ left: 0, right: 0 }}
  dragElastic={{ left: 0, right: 0.9 }} style={{ x }}
  onDragEnd={(_, info) => info.offset.x > 110 && onArchive(id)}
  className="touch-pan-y bg-surface px-3 py-2.5" />`}
      >
        <SwipeList />
      </Example>
    </Feature>
  )
}
