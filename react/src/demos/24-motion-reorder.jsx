import { useState } from 'react'
import { AnimatePresence, Reorder, useDragControls } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-reorder',
  title: 'Reorder: drag to sort',
  group: 'Motion library + Tailwind',
  order: 240,
  summary:
    'Reorder.Group and Reorder.Item turn a state array into a drag-to-sort list: a handle-driven task queue and a wrapping filter bar. Use Motion when sorting is a gesture; a native sortable library or plain buttons are fine when it is only a settings form.',
  tailwind: ['touch-none', 'touch-pan-y', 'cursor-grab', 'active:cursor-grabbing', 'select-none', 'ring-accent', 'shadow-xl', 'transition-shadow'],
}

const ICON_BTN =
  'focus-ring grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-stage hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent motion-reduce:transition-none'

function Icon({ d, className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

/* ==========================================================================
   1. Task queue: drag by the handle, or use the arrow buttons
   ========================================================================== */
const TASKS = [
  { id: 'checkout', title: 'Fix the checkout redirect loop', meta: 'Bug · Mara' },
  { id: 'dark', title: 'Ship the dark mode tokens', meta: 'Feature · Tomás' },
  { id: 'notes', title: 'Write the 4.3 release notes', meta: 'Docs · Priya' },
  { id: 'audit', title: 'Audit unused utilities', meta: 'Chore · Mara' },
]

function TaskRow({ task, index, total, onMove, onDone }) {
  // dragListener={false} + dragControls: only the handle starts a drag, so the rest of the row still scrolls on touch screens
  const controls = useDragControls()
  const [dragging, setDragging] = useState(false)

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileDrag={{ scale: 1.03, zIndex: 10 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex items-center gap-2 rounded-xl border bg-surface px-2 py-2.5 transition-shadow duration-150 select-none motion-reduce:transition-none',
        dragging ? 'border-accent shadow-xl' : 'border-line shadow-sm',
      )}
    >
      <button
        type="button"
        aria-label={`Drag to reorder: ${task.title}`}
        onPointerDown={(e) => controls.start(e)}
        className={cn(ICON_BTN, 'touch-none', dragging ? 'cursor-grabbing text-accent' : 'cursor-grab')}
      >
        <Icon d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" className="size-5" />
      </button>
      <span className="w-6 shrink-0 font-mono text-xs text-muted tabular-nums">#{index + 1}</span>
      <span className="grid min-w-0 flex-1 text-sm leading-snug">
        <span className="font-medium text-pretty">{task.title}</span>
        <span className="text-xs text-muted">{task.meta}</span>
      </span>
      <span className="grid shrink-0">
        <button type="button" aria-label={`Move up: ${task.title}`} disabled={index === 0} onClick={() => onMove(index, -1)} className={ICON_BTN}>
          <Icon d="M6 15l6-6 6 6" />
        </button>
        <button type="button" aria-label={`Move down: ${task.title}`} disabled={index === total - 1} onClick={() => onMove(index, 1)} className={ICON_BTN}>
          <Icon d="M6 9l6 6 6-6" />
        </button>
      </span>
      <button type="button" aria-label={`Mark done: ${task.title}`} onClick={() => onDone(task.id)} className={cn(ICON_BTN, 'size-8 text-emerald-700 hover:text-emerald-700 dark:text-emerald-300')}>
        <Icon d="M5 12.5l4.5 4.5L19 7.5" className="size-5" />
      </button>
    </Reorder.Item>
  )
}

function TaskQueue() {
  const [tasks, setTasks] = useState(TASKS)

  function move(index, delta) {
    setTasks((list) => {
      const next = [...list]
      const [item] = next.splice(index, 1)
      next.splice(index + delta, 0, item)
      return next
    })
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-sm text-muted" role="status" aria-live="polite">
          {tasks.length ? (
            <>
              Up next: <strong className="font-semibold text-ink">{tasks[0].title}</strong>
            </>
          ) : (
            'The queue is clear.'
          )}
        </p>
        <button
          type="button"
          onClick={() => setTasks(TASKS)}
          className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:border-accent"
        >
          Reset
        </button>
      </div>
      <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="relative m-0 grid list-none gap-2 p-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} total={tasks.length} onMove={move} onDone={(id) => setTasks((l) => l.filter((t) => t.id !== id))} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}

/* ==========================================================================
   2. Wrapping filter bar: axis="xy" reorders in two dimensions
   ========================================================================== */
const FILTERS = ['Unread', 'Starred', 'Mentions', 'Drafts', 'Attachments', 'Snoozed', 'Archived']

function FilterBar() {
  const [filters, setFilters] = useState(FILTERS)
  const [active, setActive] = useState('Unread')

  return (
    <div className="mx-auto grid grid-cols-1 max-w-lg gap-3">
      <p className="m-0 text-sm text-muted">Drag a chip to change the order your inbox shows them in. Click one to select it.</p>
      <Reorder.Group axis="xy" values={filters} onReorder={setFilters} className="m-0 flex list-none flex-wrap gap-2 p-0">
        {filters.map((name) => {
          const selected = name === active
          return (
            <Reorder.Item
              key={name}
              value={name}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
              onClick={() => setActive(name)}
              className={cn(
                'relative cursor-grab touch-none rounded-full border px-3.5 py-1.5 text-sm font-medium select-none active:cursor-grabbing',
                selected ? 'border-accent bg-accent text-surface' : 'border-line bg-surface text-ink hover:border-accent',
              )}
            >
              {name}
            </Reorder.Item>
          )
        })}
      </Reorder.Group>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 min-w-0 flex-1 truncate font-mono text-xs text-muted" role="status" aria-live="polite">
          {filters.join(' > ')}
        </p>
        <button
          type="button"
          onClick={() => setFilters(FILTERS)}
          className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:border-accent"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionReorder() {
  return (
    <Feature
      id="motion-reorder"
      title="Sorting as a gesture"
      parts={['Reorder.Group', 'Reorder.Item', 'useDragControls', 'axis="xy"', 'whileDrag', 'touch-none']}
      docs={{ href: 'https://motion.dev/docs/react-reorder', label: 'Motion: Reorder' }}
      description={
        <>
          <p>
            <code>Reorder.Group</code> takes your array in <code>values</code> and gives it back, re-sorted, through <code>onReorder</code>. Each{' '}
            <code>Reorder.Item</code> animates to its new slot with layout animation.
          </p>
          <p>
            <strong>Plain Tailwind</strong> styles the states: here a <code>dragging</code> flag from <code>onDragStart</code> switches{' '}
            <code>shadow-xl</code> and <code>border-accent</code> on, with a CSS transition.
          </p>
          <p>
            <strong>Reach for Motion</strong> when sorting by dragging is the feature. If order is only edited in a form, up and down buttons are
            simpler and more accessible, so the queue offers both.
          </p>
          <p>
            On touch screens, <code>touch-none</code> on the handle (or the chip) lets Motion own the gesture while the rest of the page still
            scrolls.
          </p>
        </>
      }
    >
      <Example
        title="Task queue: handle, arrows, and exit animation"
        lang="jsx"
        code={`function TaskRow({ task }) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={task} dragListener={false} dragControls={controls}
      whileDrag={{ scale: 1.03, zIndex: 10 }}
      className="relative flex items-center gap-2 rounded-xl border bg-surface">
      <button className="touch-none cursor-grab"
        onPointerDown={(e) => controls.start(e)}>⋮⋮</button>
      {task.title}
    </Reorder.Item>
  )
}

<Reorder.Group axis="y" values={tasks} onReorder={setTasks}>
  <AnimatePresence mode="popLayout">…</AnimatePresence>
</Reorder.Group>`}
      >
        <TaskQueue />
      </Example>

      <Example
        title="Filter bar: wrapping chips with axis xy"
        lang="jsx"
        code={`<Reorder.Group axis="xy" values={filters} onReorder={setFilters}
  className="flex flex-wrap gap-2">
  {filters.map((name) => (
    <Reorder.Item key={name} value={name} whileDrag={{ scale: 1.1, zIndex: 10 }}
      className="cursor-grab touch-none rounded-full border px-3.5 py-1.5" />
  ))}
</Reorder.Group>`}
      >
        <FilterBar />
      </Example>
    </Feature>
  )
}
