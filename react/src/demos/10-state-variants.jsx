import { useEffect, useId, useRef, useState } from 'react'
import { Example, Feature } from '../components/Feature'

/*
 * State-driven transitions, no animation library.
 *
 * React owns ONE fact (open or closed, on or off) and writes it to the DOM as an
 * attribute: aria-expanded, aria-checked or data-state. Tailwind variants read
 * that attribute and decide how things look, so every style has a visible
 * "when" and React never touches a class name.
 */
export const meta = {
  id: 'state-variants',
  title: 'State-driven transitions',
  group: 'Tailwind motion in React',
  order: 100,
  summary: 'React flips one attribute (aria-expanded, aria-checked or data-state); Tailwind variants on that attribute do all of the animating.',
  tailwind: [
    'aria-expanded:',
    'aria-checked:',
    'data-[state=open]:',
    'group-aria-expanded/trigger:',
    'group-data-[state=open]/item:',
    'grid-rows-[0fr]',
    'transition-[grid-template-rows,opacity]',
    'origin-top-right',
    'motion-reduce:transition-none',
  ],
}

/* ---------- small shared pieces ---------- */

function Chevron({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  )
}

/**
 * A height-animated region. grid-template-rows goes 0fr -> 1fr, which animates
 * to the content's natural height without measuring it in JS. The inner box
 * needs min-h-0 + overflow-hidden so the 0fr row can actually collapse.
 * `inert` keeps hidden links and buttons out of the tab order.
 */
function Collapse({ open, id, labelledBy, children }) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      inert={!open}
      data-state={open ? 'open' : 'closed'}
      className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100 motion-reduce:transition-none"
    >
      <div className="min-h-0 overflow-hidden">
        <div className="px-4 pt-1 pb-4 text-sm text-pretty text-muted">{children}</div>
      </div>
    </div>
  )
}

/** Radio buttons styled as a segmented control; native inputs give arrow-key support for free. */
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

/* ---------- 1. Disclosure: aria-expanded ---------- */

const NOTES = [
  {
    q: 'What changed in the 2.14 release?',
    a: 'Webhook retries now back off exponentially, and failed deliveries can be replayed from the dashboard for 14 days.',
  },
  {
    q: 'Is there a migration step?',
    a: 'No. Existing endpoints keep their signing secrets, and the new retry policy applies from the next delivery.',
  },
  {
    q: 'How do I roll back a bad deploy?',
    a: 'Open Deployments, pick any earlier build and press Promote. The previous build stays warm for 24 hours.',
  },
]

function Disclosure({ question, children, defaultOpen = false }) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-line bg-surface">
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="focus-ring group/trigger flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent-soft/60 aria-expanded:text-accent motion-reduce:transition-none"
        >
          <span className="min-w-0 flex-1">{question}</span>
          <Chevron className="size-4 shrink-0 text-muted transition-transform duration-300 group-aria-expanded/trigger:rotate-180 group-aria-expanded/trigger:text-accent motion-reduce:transition-none" />
        </button>
      </h3>
      <Collapse open={open} id={`${id}-panel`} labelledBy={`${id}-trigger`}>
        {children}
      </Collapse>
    </div>
  )
}

function DisclosureStack() {
  return (
    <div className="mx-auto grid max-w-xl gap-2">
      {NOTES.map((n, i) => (
        <Disclosure key={n.q} question={n.q} defaultOpen={i === 0}>
          {n.a}
        </Disclosure>
      ))}
    </div>
  )
}

/* ---------- 2. Accordion: data-state on the item, read by descendants ---------- */

const FAQ = [
  {
    id: 'cycle',
    q: 'Can I change plans mid-cycle?',
    a: 'Yes. Upgrades apply immediately and you are billed the prorated difference. Downgrades start on your next renewal date.',
  },
  {
    id: 'seats',
    q: 'How are seats counted?',
    a: 'Every person who signed in during the billing month counts once. Viewers on shared links are free and never take a seat.',
  },
  {
    id: 'student',
    q: 'Is there a student or nonprofit discount?',
    a: 'Verified students get 50% off the Team plan. Registered nonprofits get 30% off any plan, applied at checkout.',
  },
]

function Accordion() {
  const id = useId()
  const [openId, setOpenId] = useState('cycle')
  return (
    <div className="mx-auto grid max-w-xl gap-3">
      <ul className="m-0 grid list-none gap-2 p-0">
        {FAQ.map((item) => {
          const open = openId === item.id
          return (
            <li
              key={item.id}
              data-state={open ? 'open' : 'closed'}
              className="group/item overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-300 data-[state=open]:border-accent/60 data-[state=open]:bg-accent-soft/40 motion-reduce:transition-none"
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={`${id}-${item.id}-trigger`}
                  aria-expanded={open}
                  aria-controls={`${id}-${item.id}-panel`}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="focus-ring flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium"
                >
                  <span className="min-w-0 flex-1">{item.q}</span>
                  {/* a plus that turns into a cross: two bars, the whole icon rotates 45deg */}
                  <span
                    aria-hidden="true"
                    className="relative size-5 shrink-0 text-muted transition-[rotate,color] duration-300 group-data-[state=open]/item:rotate-45 group-data-[state=open]/item:text-accent motion-reduce:transition-none"
                  >
                    <span className="absolute inset-x-0.5 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current" />
                    <span className="absolute inset-y-0.5 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-current" />
                  </span>
                </button>
              </h3>
              <Collapse open={open} id={`${id}-${item.id}-panel`} labelledBy={`${id}-${item.id}-trigger`}>
                {item.a}
              </Collapse>
            </li>
          )
        })}
      </ul>
      <p className="m-0 text-center font-mono text-xs text-muted" aria-live="polite">
        {openId ? (
          <>
            open item: <span className="text-ink">data-state=&quot;open&quot;</span>
          </>
        ) : (
          'all items: data-state="closed"'
        )}
      </p>
    </div>
  )
}

/* ---------- 3. Menu: data-state + transform-origin ---------- */

// Full class strings so the scanner sees every one of them.
const PLACEMENT = {
  'down-right': 'top-full right-0 mt-2 origin-top-right',
  'down-left': 'top-full left-0 mt-2 origin-top-left',
  'up-right': 'bottom-full right-0 mb-2 origin-bottom-right',
}

const MENU_ITEMS = [
  { label: 'Rename', hint: 'R' },
  { label: 'Duplicate', hint: 'D' },
  { label: 'Archive', hint: 'A' },
  { label: 'Delete project', hint: 'Del', danger: true },
]

function ActionMenu({ placement, onPick }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  // close on any press outside the menu
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // move focus into the menu when it opens
  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true })
  }, [open])

  function onMenuKeyDown(e) {
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')]
    const at = items.indexOf(document.activeElement)
    const go = (i) => {
      e.preventDefault()
      items[(i + items.length) % items.length]?.focus()
    }
    if (e.key === 'ArrowDown') go(at + 1)
    else if (e.key === 'ArrowUp') go(at - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(items.length - 1)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      setOpen(false)
      if (e.key === 'Escape') triggerRef.current?.focus()
    }
  }

  return (
    <div ref={rootRef} className="relative mx-auto w-fit">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="focus-ring group/trigger inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium shadow-xs transition-colors hover:border-accent aria-expanded:border-accent aria-expanded:bg-accent-soft motion-reduce:transition-none"
      >
        Project actions
        <Chevron className="size-4 text-muted transition-transform duration-200 group-aria-expanded/trigger:rotate-180 motion-reduce:transition-none" />
      </button>

      {/* the menu stays mounted: data-state + inert + pointer-events decide whether it can be seen or used */}
      <div
        ref={menuRef}
        id={id}
        role="menu"
        aria-label="Project actions"
        data-state={open ? 'open' : 'closed'}
        inert={!open}
        onKeyDown={onMenuKeyDown}
        className={`absolute z-10 w-52 scale-95 rounded-xl border border-line bg-surface p-1 opacity-0 shadow-xl shadow-black/10 transition duration-150 ease-out data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-reduce:transition-none ${PLACEMENT[placement]}`}
      >
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              onPick(item.label)
              setOpen(false)
              triggerRef.current?.focus()
            }}
            className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none focus:bg-accent-soft ${
              item.danger ? 'mt-1 border-t border-line pt-2 text-red-700 dark:text-red-400' : ''
            }`}
          >
            {item.label}
            <kbd className="font-mono text-[11px] text-muted">{item.hint}</kbd>
          </button>
        ))}
      </div>
    </div>
  )
}

function MenuDemo() {
  const [placement, setPlacement] = useState('down-right')
  const [last, setLast] = useState(null)
  return (
    <div className="grid gap-5">
      <div className="flex justify-center">
        <Choice
          label="Menu placement"
          name="menu-placement"
          value={placement}
          onChange={setPlacement}
          options={[
            ['down-right', 'Down, right'],
            ['down-left', 'Down, left'],
            ['up-right', 'Up'],
          ]}
        />
      </div>
      <div className="grid min-h-[22rem] content-center">
        <ActionMenu placement={placement} onPick={setLast} />
      </div>
      <p className="m-0 text-center text-xs text-muted" aria-live="polite">
        {last ? (
          <>
            Last action: <span className="font-semibold text-ink">{last}</span>
          </>
        ) : (
          'Open the menu, then use the arrow keys, Escape or a click outside.'
        )}
      </p>
    </div>
  )
}

/* ---------- 4. Switch: aria-checked ---------- */

const PREFS = [
  { id: 'fail', label: 'Email me when a deploy fails', on: true },
  { id: 'digest', label: 'Send a weekly activity digest', on: false },
  { id: 'push', label: 'Desktop notifications', on: false },
]

function Switches() {
  const [prefs, setPrefs] = useState(() => Object.fromEntries(PREFS.map((p) => [p.id, p.on])))
  const base = useId()
  return (
    <ul className="m-0 mx-auto grid max-w-md list-none gap-2 p-0">
      {PREFS.map((p) => {
        const on = prefs[p.id]
        const labelId = `${base}-${p.id}`
        return (
          <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
            <span id={labelId} className="min-w-0 flex-1 text-sm">
              {p.label}
            </span>
            <span className="font-mono text-[11px] text-muted">{on ? 'on' : 'off'}</span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-labelledby={labelId}
              onClick={() => setPrefs((s) => ({ ...s, [p.id]: !s[p.id] }))}
              className="focus-ring group relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-muted/50 transition-colors duration-200 aria-checked:bg-accent motion-reduce:transition-none"
            >
              <span
                aria-hidden="true"
                className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out group-aria-checked:translate-x-5 motion-reduce:transition-none"
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------- the demo ---------- */

export default function StateVariants() {
  return (
    <div className="grid gap-6">
      <Feature
        title="aria-expanded on a disclosure"
        since="core"
        parts={['aria-expanded:', 'group-aria-expanded/trigger:', 'grid-rows-[0fr]', 'transition-[grid-template-rows,opacity]']}
        docs={{ href: 'https://tailwindcss.com/docs/hover-focus-and-other-states#aria-states', label: 'ARIA state variants' }}
        description={
          <>
            <p>
              The button carries <code>aria-expanded</code>, which assistive tech needs anyway. <code>aria-expanded:</code> styles the button itself and{' '}
              <code>group-aria-expanded/trigger:</code> reaches its chevron, so the open look is never tracked in a second place.
            </p>
            <p>
              The panel animates <code>grid-template-rows</code> from <code>0fr</code> to <code>1fr</code>: smooth height, no measuring.
            </p>
          </>
        }
      >
        <Example
          title="Independent disclosures"
          code={`<button aria-expanded={open} className="group/trigger aria-expanded:text-accent ...">
  Question
  <Chevron className="transition-transform group-aria-expanded/trigger:rotate-180" />
</button>

<div data-state={open ? 'open' : 'closed'} inert={!open}
     className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity]
            data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100">
  <div className="min-h-0 overflow-hidden">…</div>
</div>`}
          lang="jsx"
        >
          <DisclosureStack />
        </Example>

        <Example
          title="Single-open accordion"
          code={`<li data-state={open ? 'open' : 'closed'}
    className="group/item data-[state=open]:border-accent/60 data-[state=open]:bg-accent-soft/40">
  <button aria-expanded={open}>
    …
    <span className="transition-[rotate] group-data-[state=open]/item:rotate-45">+</span>
  </button>
  <Collapse open={open}>…</Collapse>
</li>`}
          lang="jsx"
        >
          <Accordion />
        </Example>
      </Feature>

      <Feature
        title="data-state on a menu"
        since="core"
        parts={['data-[state=open]:', 'origin-top-right', 'origin-bottom-right', 'inert']}
        docs={{ href: 'https://tailwindcss.com/docs/hover-focus-and-other-states#data-attributes', label: 'Data attribute variants' }}
        description={
          <>
            <p>
              The menu never unmounts. It sits at <code>scale-95 opacity-0</code> and <code>data-[state=open]:</code> brings it to full size.
            </p>
            <p>
              <code>origin-*</code> picks the corner it grows from, so the scale feels anchored to the trigger. <code>inert</code> keeps a closed menu out of
              reach of the keyboard and screen readers.
            </p>
          </>
        }
      >
        <Example
          title="Dropdown with three placements"
          stageClassName="px-3"
          code={`<div role="menu" data-state={open ? 'open' : 'closed'} inert={!open}
     className="absolute top-full right-0 mt-2 origin-top-right scale-95 opacity-0
            transition duration-150 motion-reduce:transition-none
            data-[state=open]:scale-100 data-[state=open]:opacity-100">
  …
</div>`}
          lang="jsx"
        >
          <MenuDemo />
        </Example>

        <Example
          title="Switches with aria-checked"
          code={`<button role="switch" aria-checked={on}
        className="group h-6 w-11 rounded-full bg-muted/50 transition-colors aria-checked:bg-accent">
  <span className="size-5 transition-transform group-aria-checked:translate-x-5" />
</button>`}
          lang="jsx"
        >
          <Switches />
        </Example>
      </Feature>
    </div>
  )
}
