import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * Entry animations with the `starting:` variant.
 *
 * When React inserts an element, the browser has no "before" style to
 * transition from, so a plain `transition` does nothing. `starting:` writes an
 * @starting-style rule: the styles the element has on its very first frame.
 * The browser then transitions from those to the normal styles. No effect, no
 * ref, no requestAnimationFrame.
 *
 * `starting:` only covers entering. Leaving works the other way round: React
 * keeps the element for a moment with a `data-leaving` flag, the same
 * transition runs in reverse, then the element is really removed.
 */
export const meta = {
  id: 'starting-style',
  title: 'Entry animations with starting:',
  group: 'Tailwind motion in React',
  order: 110,
  summary: 'Elements React mounts (toasts, inbox rows, swapped panels) animate in from @starting-style, and out through a data-leaving flag.',
  tailwind: [
    'starting:opacity-0',
    'starting:translate-x-8',
    'starting:grid-rows-[0fr]',
    'starting:bg-accent-soft',
    'data-leaving:',
    'group-data-unread:',
    'transition-[grid-template-rows,opacity,translate]',
    'motion-reduce:transition-none',
  ],
}

const LEAVE_MS = 320

/**
 * A list where removal is a two-step: flag `leaving` (CSS animates it out),
 * then drop the item once the transition has had time to finish.
 * With reduced motion there is no transition, so the second step is immediate.
 */
function useLeavingList(initial = []) {
  const reduced = useReducedMotion()
  const [items, setItems] = useState(initial)
  const timers = useRef(new Set())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }, [])

  const remove = useCallback(
    (id) => {
      setItems((list) => list.map((i) => (i.id === id ? { ...i, leaving: true } : i)))
      later(() => setItems((list) => list.filter((i) => i.id !== id)), reduced ? 0 : LEAVE_MS)
    },
    [later, reduced],
  )

  return { items, setItems, remove, later }
}

/** Radio buttons styled as a segmented control. */
function Choice({ label, name, value, onChange, options }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
      {options.map((text) => (
        <label
          key={text}
          className="cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-muted transition-colors not-has-checked:hover:bg-accent-soft has-checked:bg-accent has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent motion-reduce:transition-none"
        >
          <input type="radio" className="sr-only" name={name} value={text} checked={value === text} onChange={() => onChange(text)} />
          {text}
        </label>
      ))}
    </div>
  )
}

function Button({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn('focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-accent motion-reduce:transition-none', className)}
    >
      {children}
    </button>
  )
}

function Icon({ name, className }) {
  const paths = {
    check: 'm5 10.5 3.2 3.2L15 6.8',
    alert: 'M10 5.5v5.5M10 14.2v.1',
    info: 'M10 9v5M10 6v.1',
    close: 'm6 6 8 8M14 6l-8 8',
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={paths[name]} />
    </svg>
  )
}

/* ---------- 1. Toast stack ---------- */

// Full class strings, so the scanner can see them.
const KINDS = {
  success: {
    button: 'Deploy succeeded',
    title: 'Deploy finished',
    body: 'harbor-web 2.14.0 is live in eu-west.',
    icon: 'check',
    tone: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
    bar: 'border-l-emerald-600 dark:border-l-emerald-400',
  },
  error: {
    button: 'Build failed',
    title: 'Build failed',
    body: 'checkout.spec.ts: 2 tests failed on step 3 of 5.',
    icon: 'alert',
    tone: 'bg-red-600/15 text-red-700 dark:text-red-400',
    bar: 'border-l-red-600 dark:border-l-red-400',
  },
  info: {
    button: 'Invite sent',
    title: 'Invite sent',
    body: 'Mina Okafor can join as an editor once she accepts.',
    icon: 'info',
    tone: 'bg-sky-600/15 text-sky-700 dark:text-sky-400',
    bar: 'border-l-sky-600 dark:border-l-sky-400',
  },
}

function Toast({ toast, onDismiss }) {
  const kind = KINDS[toast.kind]
  return (
    // The row animates its height (grid-template-rows 0fr -> 1fr) so older toasts glide up instead of jumping.
    <li
      data-leaving={toast.leaving ? '' : undefined}
      className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity,translate] duration-300 ease-out starting:translate-x-8 starting:grid-rows-[0fr] starting:opacity-0 data-leaving:translate-x-8 data-leaving:grid-rows-[0fr] data-leaving:opacity-0 motion-reduce:transition-none"
    >
      <div className="min-h-0 overflow-hidden">
        <div className="px-1 pt-1 pb-2">
          <div className={`flex items-start gap-3 rounded-xl border border-l-4 border-line bg-surface p-3 shadow-lg shadow-black/10 ${kind.bar}`}>
            <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${kind.tone}`}>
              <Icon name={kind.icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm leading-snug font-semibold">{kind.title}</p>
              <p className="m-0 text-[13px] leading-snug text-pretty text-muted">{kind.body}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={`Dismiss: ${kind.title}`}
              className="focus-ring -m-1 cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-ink motion-reduce:transition-none"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

const MAX_TOASTS = 4

function ToastStack() {
  const { items, setItems, remove, later } = useLeavingList()
  const nextId = useRef(1)

  function push(kind) {
    const id = nextId.current++
    const live = items.filter((t) => !t.leaving)
    if (live.length >= MAX_TOASTS) remove(live[0].id)
    setItems((list) => [...list, { id, kind }])
    later(() => remove(id), 6000)
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(KINDS).map(([kind, k]) => (
          <Button key={kind} onClick={() => push(kind)}>
            {k.button}
          </Button>
        ))}
        <Button onClick={() => items.forEach((t) => remove(t.id))} className="text-muted">
          Clear all
        </Button>
      </div>
      <div className="relative h-80 overflow-hidden rounded-xl border border-line bg-surface">
        {/* a stand-in app behind the toasts */}
        <div aria-hidden="true" className="grid gap-3 p-4">
          <div className="h-3 w-28 rounded-full bg-line" />
          <div className="h-3 w-48 max-w-full rounded-full bg-line/70" />
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="h-16 rounded-lg bg-line/50" />
            <div className="h-16 rounded-lg bg-line/50" />
            <div className="h-16 rounded-lg bg-line/50" />
          </div>
          <div className="h-3 w-36 rounded-full bg-line/70" />
        </div>
        <ol aria-label="Notifications" aria-live="polite" className="absolute right-0 bottom-0 m-0 flex w-full max-w-xs list-none flex-col p-2 sm:p-3">
          {items.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={remove} />
          ))}
        </ol>
      </div>
      <p className="m-0 text-xs text-muted">Each toast closes itself after six seconds. At most {MAX_TOASTS} stay on screen.</p>
    </div>
  )
}

/* ---------- 2. Notification inbox ---------- */

const FEED = [
  { who: 'Priya Raman', initials: 'PR', color: 'bg-violet-600', text: 'commented on PR #218: "Can we memoize this selector?"' },
  { who: 'Deploys', initials: 'DP', color: 'bg-emerald-700', text: 'Deploy #482 to production finished in 1m 48s.' },
  { who: 'Ibrahim Sy', initials: 'IS', color: 'bg-amber-700', text: 'asked for your review on "Retry policy for webhooks".' },
  { who: 'Lena Fischer', initials: 'LF', color: 'bg-sky-700', text: 'mentioned you in #incident-0914.' },
  { who: 'Alerts', initials: 'AL', color: 'bg-rose-600', text: 'p95 latency is back under 300 ms. Alert resolved.' },
  { who: 'Marta Ilves', initials: 'MI', color: 'bg-teal-700', text: 'approved your pull request "Cache warmup on boot".' },
]

const seed = (n, when) => ({ id: n + 1, ...FEED[n], when, unread: n === 0 })

function Row({ item, onDismiss }) {
  return (
    <li
      data-leaving={item.leaving ? '' : undefined}
      className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity,translate] duration-300 ease-out starting:-translate-y-2 starting:grid-rows-[0fr] starting:opacity-0 data-leaving:-translate-x-6 data-leaving:grid-rows-[0fr] data-leaving:opacity-0 motion-reduce:transition-none"
    >
      <div className="min-h-0 overflow-hidden">
        {/* second starting: on the inner box: a soft highlight that fades out slowly */}
        <div
          data-unread={item.unread ? '' : undefined}
          className="group flex items-start gap-3 border-b border-line bg-surface px-4 py-3 transition-colors duration-[1600ms] starting:bg-accent-soft motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold tracking-wide text-white ${item.color}`}
          >
            {item.initials}
          </span>
          <p className="m-0 min-w-0 flex-1 text-sm leading-snug text-pretty">
            <span className="font-semibold">{item.who}</span> {item.text}
            <span className="mt-0.5 block text-xs text-muted">{item.when}</span>
          </p>
          <span
            role="img"
            aria-label={item.unread ? 'Unread' : 'Read'}
            className="mt-1.5 size-2 shrink-0 rounded-full bg-accent opacity-0 transition-opacity duration-300 group-data-unread:opacity-100 motion-reduce:transition-none"
          />
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            aria-label={`Dismiss notification from ${item.who}`}
            className="focus-ring -m-1 cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-ink motion-reduce:transition-none"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

const MAX_ROWS = 5

function Inbox() {
  const { items, setItems, remove } = useLeavingList([seed(2, '12 min ago'), seed(1, '38 min ago'), seed(0, '1 h ago')])
  const cursor = useRef(3)
  const nextId = useRef(10)
  const unread = items.filter((i) => i.unread && !i.leaving).length

  function simulate() {
    const entry = FEED[cursor.current % FEED.length]
    cursor.current += 1
    const live = items.filter((i) => !i.leaving)
    if (live.length >= MAX_ROWS) remove(live[live.length - 1].id)
    setItems((list) => [{ id: nextId.current++, ...entry, when: 'just now', unread: true }, ...list])
  }

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <h3 className="m-0 font-display text-base font-semibold">Inbox</h3>
        <span className="text-xs text-muted" aria-live="polite">
          {unread} unread
        </span>
        <span className="flex-1" />
        <Button onClick={() => setItems((list) => list.map((i) => ({ ...i, unread: false })))}>Mark all read</Button>
        <Button onClick={simulate} className="border-accent text-accent">
          Simulate incoming
        </Button>
      </div>
      <ul aria-label="Notifications" className="m-0 min-h-24 list-none p-0">
        {items.map((item) => (
          <Row key={item.id} item={item} onDismiss={remove} />
        ))}
        {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">You are all caught up.</li>}
      </ul>
    </div>
  )
}

/* ---------- 3. Remount to replay: a changing key ---------- */

const SECTIONS = ['Overview', 'Usage', 'Billing']

const SECTION_ROWS = {
  Overview: [
    ['Requests (30 days)', '1.28M', '+12%'],
    ['Error rate', '0.21%', '-0.04 pt'],
    ['p95 latency', '284 ms', '-18 ms'],
  ],
  Usage: [
    ['Bandwidth', '412 GB of 1 TB', '41%'],
    ['Build minutes', '1,870 of 3,000', '62%'],
    ['Stored logs', '9.4 GB of 50 GB', '19%'],
  ],
  Billing: [
    ['Plan', 'Team, 8 seats', '$96 / mo'],
    ['Next invoice', 'Nov 1', '$96.00'],
    ['Payment method', 'Visa ending 4821', 'Expires 08/28'],
  ],
}

function SwapPanel() {
  const [section, setSection] = useState('Overview')
  const [dir, setDir] = useState('next')
  const groupName = useId()

  function pick(next) {
    setDir(SECTIONS.indexOf(next) > SECTIONS.indexOf(section) ? 'next' : 'prev')
    setSection(next)
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-3">
      <div className="flex justify-center">
        <Choice label="Section" name={groupName} value={section} onChange={pick} options={SECTIONS} />
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {/* key={section}: a new key is a new element, so @starting-style runs again; data-dir picks the side it slides in from */}
        <dl
          key={section}
          data-dir={dir}
          className="m-0 grid transition-[opacity,translate] duration-300 ease-out starting:opacity-0 starting:data-[dir=next]:translate-x-6 starting:data-[dir=prev]:-translate-x-6 motion-reduce:transition-none"
        >
          {SECTION_ROWS[section].map(([term, value, note]) => (
            <div key={term} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-line px-4 py-3 last:border-b-0">
              <dt className="text-sm text-muted">{term}</dt>
              <dd className="m-0 text-right text-sm font-semibold">{value}</dd>
              <dd className="col-span-2 m-0 text-xs text-muted">{note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ---------- the demo ---------- */

export default function StartingStyle() {
  return (
    <div className="grid gap-6">
      <Feature
        title="Mounting and unmounting"
        since="4.0"
        parts={['starting:opacity-0', 'starting:grid-rows-[0fr]', 'data-leaving:', 'transition-[grid-template-rows,opacity,translate]']}
        docs={{ href: 'https://tailwindcss.com/docs/hover-focus-and-other-states#starting-style', label: 'The starting variant' }}
        description={
          <>
            <p>
              Each toast is a plain <code>&lt;li&gt;</code> that React appends. <code>starting:opacity-0</code> and <code>starting:translate-x-8</code> are what it looks
              like on its first frame; the normal classes are where it settles.
            </p>
            <p>
              The row also starts at <code>starting:grid-rows-[0fr]</code>, so it grows into place and the older toasts glide up. Leaving reuses the same
              values through <code>data-leaving:</code>.
            </p>
          </>
        }
      >
        <Example
          title="Toast stack"
          lang="jsx"
          code={`<li data-leaving={toast.leaving ? '' : undefined}
    className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity,translate] duration-300
           starting:translate-x-8 starting:grid-rows-[0fr] starting:opacity-0
           data-leaving:translate-x-8 data-leaving:grid-rows-[0fr] data-leaving:opacity-0
           motion-reduce:transition-none">
  <div className="min-h-0 overflow-hidden">…toast card…</div>
</li>`}
        >
          <ToastStack />
        </Example>

        <Example
          title="Notification inbox"
          lang="jsx"
          code={`<li className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity,translate]
           starting:-translate-y-2 starting:grid-rows-[0fr] starting:opacity-0">
  <div className="min-h-0 overflow-hidden">
    <div className="group bg-surface transition-colors duration-[1600ms] starting:bg-accent-soft">
      <span className="opacity-0 transition-opacity group-data-unread:opacity-100" />
    </div>
  </div>
</li>`}
        >
          <Inbox />
        </Example>
      </Feature>

      <Feature
        title="Replaying with a key"
        since="4.0"
        parts={['starting:opacity-0', 'starting:data-[dir=next]:translate-x-6', 'starting:data-[dir=prev]:-translate-x-6']}
        docs={{ href: 'https://tailwindcss.com/docs/hover-focus-and-other-states#starting-style', label: 'The starting variant' }}
        description={
          <>
            <p>
              Changing a React <code>key</code> throws the old element away and mounts a fresh one, so its <code>starting:</code> styles run again. That is
              all it takes to cross-fade or slide between panels.
            </p>
            <p>
              <code>starting:</code> stacks with other variants: <code>starting:data-[dir=next]:</code> only applies when the panel was entered going forward.
            </p>
          </>
        }
      >
        <Example
          title="Direction-aware panel swap"
          lang="jsx"
          code={`<dl key={section} data-dir={dir}
    className="transition-[opacity,translate] duration-300
           starting:opacity-0
           starting:data-[dir=next]:translate-x-6
           starting:data-[dir=prev]:-translate-x-6
           motion-reduce:transition-none">
  …
</dl>`}
        >
          <SwapPanel />
        </Example>
      </Feature>
    </div>
  )
}
