import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Example, Feature } from '../components/Feature'

/*
 * Sliding indicators driven by CSS variables.
 *
 * The indicator is ONE element that never unmounts. React writes the active
 * position into a custom property on the tab list (--tab, --x/--w, --i) and a
 * utility such as translate-x-[calc(var(--tab)*100%)] or translate-x-(--x)
 * turns it into a transform. Because the element stays put and only its
 * transform changes, CSS can transition it, and there is no layout animation
 * library involved.
 */
export const meta = {
  id: 'sliding-tabs',
  title: 'Tabs with a sliding indicator',
  group: 'Tailwind motion in React',
  order: 140,
  summary: 'The active tab is a CSS variable: the indicator slides with translate-x-[calc(var(--tab)*100%)], or with measured --x and --w for tabs of unequal width.',
  tailwind: [
    'translate-x-[calc(var(--tab)*100%)]',
    'translate-x-(--x)',
    'w-(--w)',
    'w-[calc((100%-0.5rem)/3)]',
    'aria-selected:',
    'has-checked:',
    'ease-[cubic-bezier(0.34,1.3,0.64,1)]',
    'motion-reduce:transition-none',
  ],
}

/* ---------- shared helpers ---------- */

/** WAI-ARIA tabs keyboard model: arrows, Home and End move and activate. */
function tabKeys(e, index, count, select) {
  const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1 }[e.key]
  if (target === undefined) return
  e.preventDefault()
  const next = (target + count) % count
  select(next)
  e.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus()
}

/* ---------- 1. Tabbed card: equal columns, --tab, sliding panels ---------- */

const SECTIONS = ['Overview', 'Activity', 'Members']

const EVENTS = [
  ['Priya Raman deployed 2.14.0', '12 minutes ago'],
  ['Ibrahim Sy added STRIPE_WEBHOOK_KEY', '1 hour ago'],
  ['Lena Fischer rolled back to 2.13.2', 'Yesterday'],
]

const MEMBERS = [
  ['PR', 'Priya Raman', 'Owner', 'bg-violet-600'],
  ['IS', 'Ibrahim Sy', 'Editor', 'bg-amber-700'],
  ['LF', 'Lena Fischer', 'Viewer', 'bg-sky-700'],
]

function OverviewPanel() {
  return (
    <>
      <dl className="m-0 grid grid-cols-3 gap-2 text-center">
        {[
          ['Uptime', '99.98%'],
          ['Deploys', '38'],
          ['p95', '284 ms'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-stage px-2 py-3">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="m-0 font-display text-lg font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-3 text-sm text-pretty text-muted">Last deploy 12 minutes ago by Priya Raman. All three regions are healthy.</p>
    </>
  )
}

function ActivityPanel() {
  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {EVENTS.map(([what, when]) => (
        <li key={what} className="grid gap-0.5 border-l-2 border-line pl-3">
          <span className="text-sm font-medium">{what}</span>
          <span className="text-xs text-muted">{when}</span>
        </li>
      ))}
    </ul>
  )
}

function MembersPanel() {
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {MEMBERS.map(([initials, name, role, color]) => (
        <li key={name} className="flex items-center gap-3">
          <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white ${color}`}>
            {initials}
          </span>
          <span className="flex-1 text-sm font-medium">{name}</span>
          <span className="text-xs text-muted">{role}</span>
        </li>
      ))}
    </ul>
  )
}

const PANELS = [OverviewPanel, ActivityPanel, MembersPanel]

function TabbedCard() {
  const base = useId()
  const [tab, setTab] = useState(0)

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="px-4 pt-4">
        <p className="m-0 font-mono text-[11px] tracking-widest text-muted uppercase">Project</p>
        <h3 className="m-0 font-display text-xl font-semibold">harbor-web</h3>
      </div>

      <div className="p-4">
        {/* --tab lives on the list; the thumb reads it for its offset */}
        <div role="tablist" aria-label="Project sections" style={{ '--tab': tab }} className="relative grid grid-cols-3 rounded-xl bg-stage p-1">
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] translate-x-[calc(var(--tab)*100%)] rounded-lg bg-surface shadow-sm ring-1 ring-line transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none"
          />
          {SECTIONS.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${base}-panel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={(e) => tabKeys(e, i, SECTIONS.length, setTab)}
              className="focus-ring relative z-10 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink aria-selected:text-ink motion-reduce:transition-none"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* the panels sit side by side in one strip; the same variable slides the strip by whole widths */}
      <div className="overflow-hidden">
        <div
          style={{ '--tab': tab }}
          className="flex translate-x-[calc(var(--tab)*-100%)] transition-transform duration-500 ease-out motion-reduce:transition-none"
        >
          {PANELS.map((Panel, i) => (
            <div
              key={i}
              role="tabpanel"
              id={`${base}-panel-${i}`}
              aria-labelledby={`${base}-tab-${i}`}
              inert={tab !== i}
              tabIndex={0}
              className="focus-ring min-h-44 w-full shrink-0 px-4 pb-5"
            >
              <Panel />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- 2. Underline tabs of different widths: measured --x and --w ---------- */

const ISSUES = [
  { id: 'HB-241', title: 'Deploy hook times out on large monorepos', scopes: ['all', 'mine'] },
  { id: 'HB-238', title: 'Preview URLs 404 for branches with slashes', scopes: ['all'] },
  { id: 'HB-236', title: 'Add a retry budget to the webhook dispatcher', scopes: ['all', 'mine'] },
  { id: 'HB-233', title: 'Log viewer drops the last line on resize', scopes: ['all', 'mentions'] },
  { id: 'HB-229', title: 'Rotate signing secrets from the dashboard', scopes: ['all'] },
  { id: 'HB-227', title: 'Dark mode flash on first paint', scopes: ['all'] },
  { id: 'HB-190', title: 'Upgrade the build image to Node 22', scopes: ['archived'] },
  { id: 'HB-188', title: 'Fix the typo in the onboarding email', scopes: ['archived'] },
  { id: 'HB-181', title: 'Remove the legacy /v1/ping endpoint', scopes: ['archived'] },
]

const FILTERS = [
  { id: 'all', label: 'All issues' },
  { id: 'mine', label: 'Assigned to me' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'archived', label: 'Archived' },
].map((f) => ({ ...f, count: ISSUES.filter((i) => i.scopes.includes(f.id)).length }))

/** Measures the active tab and keeps measuring when fonts load or the list resizes. */
function useMeasuredIndicator(listRef, activeIndex) {
  const [box, setBox] = useState({ x: 0, w: 0, ready: false })

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const tabs = [...list.querySelectorAll('[role="tab"]')]
    const measure = () => {
      const el = tabs[activeIndex]
      if (!el) return
      setBox((b) => (b.x === el.offsetLeft && b.w === el.offsetWidth ? b : { ...b, x: el.offsetLeft, w: el.offsetWidth }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    tabs.forEach((t) => ro.observe(t))
    return () => ro.disconnect()
  }, [listRef, activeIndex])

  // the first position is applied without a transition, so the bar does not fly in from the left
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setBox((b) => (b.ready ? b : { ...b, ready: true })))
    return () => cancelAnimationFrame(id)
  }, [])

  return box
}

function IssueTabs() {
  const base = useId()
  const reduced = useReducedMotion()
  const listRef = useRef(null)
  const [active, setActive] = useState(0)
  const box = useMeasuredIndicator(listRef, active)
  const filter = FILTERS[active]
  const shown = ISSUES.filter((i) => i.scopes.includes(filter.id))

  function select(i) {
    setActive(i)
    listRef.current?.querySelectorAll('[role="tab"]')[i]?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line">
        <div
          ref={listRef}
          role="tablist"
          aria-label="Issue filters"
          style={{ '--x': `${box.x}px`, '--w': `${box.w}px` }}
          className="relative flex overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* width and offset both come from variables, so tabs can be any size */}
          <span
            aria-hidden="true"
            data-ready={box.ready}
            className="absolute bottom-0 left-0 h-0.5 w-(--w) translate-x-(--x) rounded-full bg-accent data-[ready=true]:transition-[translate,width] data-[ready=true]:duration-300 data-[ready=true]:ease-out motion-reduce:transition-none"
          />
          {FILTERS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              id={`${base}-tab-${f.id}`}
              aria-selected={active === i}
              aria-controls={`${base}-panel`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => tabKeys(e, i, FILTERS.length, select)}
              className="focus-ring group flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 py-3 text-sm font-medium whitespace-nowrap text-muted transition-colors hover:text-ink aria-selected:text-ink motion-reduce:transition-none"
            >
              {f.label}
              <span className="rounded-full bg-stage px-1.5 py-px font-mono text-[11px] transition-colors group-aria-selected:bg-accent-soft group-aria-selected:text-accent motion-reduce:transition-none">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${filter.id}`} tabIndex={0} className="focus-ring min-h-72">
        {/* a new key per tab: a fresh list mounts, and starting: fades it in */}
        <ul
          key={filter.id}
          className="m-0 list-none p-0 transition-[opacity,translate] duration-300 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
        >
          {shown.map((issue) => (
            <li key={issue.id} className="grid grid-cols-[auto_1fr] gap-x-3 border-b border-line px-4 py-3 last:border-b-0">
              <span className="font-mono text-xs text-muted">{issue.id}</span>
              <span className="min-w-0 text-sm text-pretty">{issue.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- 3. Segmented control and price roller: --i ---------- */

const PERIODS = [
  ['Monthly', 'Billed every month'],
  ['Yearly', 'Save 20%'],
]

const PRICES = ['$12', '$9.60']
const TOTALS = ['8 seats: $96.00 a month', '8 seats: $921.60 billed once a year']

function BillingToggle() {
  const name = useId()
  const [i, setI] = useState(0)

  return (
    <div className="mx-auto grid w-full max-w-sm justify-items-center gap-5">
      <div
        role="radiogroup"
        aria-label="Billing period"
        style={{ '--i': i }}
        className="relative inline-grid grid-cols-2 rounded-full bg-stage p-1 ring-1 ring-line"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/2)] translate-x-[calc(var(--i)*100%)] rounded-full bg-accent shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none"
        />
        {PERIODS.map(([label], k) => (
          <label
            key={label}
            className="relative z-10 cursor-pointer rounded-full px-6 py-2 text-center text-sm font-medium text-muted transition-colors has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent motion-reduce:transition-none"
          >
            <input type="radio" name={name} value={label} checked={i === k} onChange={() => setI(k)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>

      <div className="w-full rounded-2xl border border-line bg-surface p-5 text-center shadow-sm">
        <p className="m-0 text-sm font-semibold">Team plan</p>
        {/* a two-row window: translate-y moves by whole rows of 3rem */}
        <div className="mx-auto mt-2 h-12 overflow-hidden" aria-hidden="true">
          <div
            style={{ '--i': i }}
            className="grid translate-y-[calc(var(--i)*-3rem)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] motion-reduce:transition-none"
          >
            {PRICES.map((price) => (
              <span key={price} className="h-12 font-display text-4xl leading-[3rem] font-bold tracking-tight">
                {price}
              </span>
            ))}
          </div>
        </div>
        <p className="m-0 text-xs text-muted">per seat, per month</p>
        <p className="m-0 mt-3 text-sm" aria-live="polite">
          <span className="sr-only">{PRICES[i]} per seat per month. </span>
          {TOTALS[i]}
        </p>
        <p className="m-0 mt-1 text-xs text-muted">{PERIODS[i][1]}</p>
      </div>
    </div>
  )
}

/* ---------- the demo ---------- */

export default function SlidingTabs() {
  return (
    <div className="grid gap-6">
      <Feature
        title="Equal columns: --tab"
        since="4.0"
        parts={['translate-x-[calc(var(--tab)*100%)]', 'w-[calc((100%-0.5rem)/3)]', 'aria-selected:', 'ease-[cubic-bezier(0.34,1.3,0.64,1)]']}
        docs={{ href: 'https://tailwindcss.com/docs/translate', label: 'translate' }}
        description={
          <>
            <p>
              React writes <code>style=&#123;&#123; &apos;--tab&apos;: index &#125;&#125;</code> on the tab list. The thumb is one third of the list wide, so{' '}
              <code>translate-x-[calc(var(--tab)*100%)]</code> moves it exactly one tab per step.
            </p>
            <p>
              The card body reuses the variable: <code>-100%</code> times the index slides a strip of panels. The cubic-bezier curve overshoots a little, so
              the thumb settles instead of stopping dead.
            </p>
          </>
        }
      >
        <Example
          title="Tabbed project card"
          lang="jsx"
          code={`<div role="tablist" style={{ '--tab': tab }} className="relative grid grid-cols-3 p-1">
  <span className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)]
               translate-x-[calc(var(--tab)*100%)]
               transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]
               motion-reduce:transition-none" />
  <button role="tab" aria-selected={tab === i} className="relative z-10 aria-selected:text-ink">…</button>
</div>

<div style={{ '--tab': tab }}
     className="flex translate-x-[calc(var(--tab)*-100%)] transition-transform duration-500">
  <div role="tabpanel" inert={tab !== i} className="w-full shrink-0">…</div>
</div>`}
        >
          <TabbedCard />
        </Example>

        <Example
          title="Segmented control with a price roller"
          lang="jsx"
          code={`<div role="radiogroup" style={{ '--i': i }} className="relative inline-grid grid-cols-2">
  <span className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/2)]
               translate-x-[calc(var(--i)*100%)] transition-transform" />
  <label className="relative z-10 has-checked:text-surface"><input type="radio" className="sr-only" />Monthly</label>
</div>

<div className="h-12 overflow-hidden">
  <div style={{ '--i': i }} className="grid translate-y-[calc(var(--i)*-3rem)] transition-transform">
    <span className="h-12">$12</span><span className="h-12">$9.60</span>
  </div>
</div>`}
        >
          <BillingToggle />
        </Example>
      </Feature>

      <Feature
        title="Unequal widths: --x and --w"
        since="4.0"
        parts={['translate-x-(--x)', 'w-(--w)', 'data-[ready=true]:transition-[translate,width]', 'starting:opacity-0']}
        docs={{ href: 'https://tailwindcss.com/docs/translate#using-a-custom-value', label: 'Custom values' }}
        description={
          <>
            <p>
              When tabs are different sizes a percentage will not do, so React measures the active tab and publishes <code>--x</code> and <code>--w</code>. In v4
              a custom property is passed with parentheses: <code>translate-x-(--x)</code> and <code>w-(--w)</code>.
            </p>
            <p>
              A <code>ResizeObserver</code> keeps the numbers right when fonts load or the list scrolls. The bar only gets its transition once it has been placed (<code>data-ready</code>).
            </p>
          </>
        }
      >
        <Example
          title="Issue filters with counts"
          lang="jsx"
          code={`<div role="tablist" style={{ '--x': box.x + 'px', '--w': box.w + 'px' }} className="relative flex overflow-x-auto">
  <span data-ready={box.ready}
        className="absolute bottom-0 left-0 h-0.5 w-(--w) translate-x-(--x) bg-accent
               data-[ready=true]:transition-[translate,width] data-[ready=true]:duration-300
               motion-reduce:transition-none" />
  <button role="tab" aria-selected={active === i} className="group aria-selected:text-ink">
    All issues <span className="group-aria-selected:bg-accent-soft">6</span>
  </button>
</div>`}
        >
          <IssueTabs />
        </Example>
      </Feature>
    </div>
  )
}
