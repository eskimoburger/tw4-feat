import { useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

export const meta = {
  id: 'motion-shared-layout',
  title: 'Shared layout: layoutId',
  group: 'Motion library + Tailwind',
  order: 220,
  summary:
    'Give two elements the same layoutId and Motion glides one into the other: a tab underline, a billing pill and a card that grows into its detail view. CSS transitions cannot move an element between two places in the DOM, so this is where Motion earns its keep.',
  tailwind: ['absolute inset-x-2', 'bg-linear-to-br', 'min-h-44', 'overflow-x-auto', 'rounded-full', 'tabular-nums', 'text-white'],
}

const TAB_BASE = 'focus-ring relative cursor-pointer whitespace-nowrap text-sm font-medium transition-colors duration-150 motion-reduce:transition-none'

/* ==========================================================================
   1. Tabs: one underline element, mounted under whichever tab is active
   ========================================================================== */
const TABS = [
  {
    id: 'overview',
    label: 'Overview',
    rows: [
      ['Workspace', 'Northwind Studio'],
      ['Active projects', '38'],
      ['Storage used', '64 GB of 100 GB'],
    ],
  },
  {
    id: 'activity',
    label: 'Activity',
    rows: [
      ['09:41', 'Mara published the pricing page'],
      ['09:12', 'Tomás merged "Dark mode tokens"'],
      ['Yesterday', 'Priya invited 2 contractors'],
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    rows: [
      ['Plan', 'Team, 12 seats'],
      ['Monthly total', '$144.00'],
      ['Next invoice', 'Nov 3'],
    ],
  },
  {
    id: 'members',
    label: 'Members',
    rows: [
      ['Owner', 'Mara Okafor'],
      ['Admins', 'Tomás Rivera, Priya Nair'],
      ['Pending invites', '2'],
    ],
  },
]

function UnderlineTabs() {
  const [active, setActive] = useState('overview')
  const refs = useRef({})
  const current = TABS.find((t) => t.id === active)

  function onKeyDown(e) {
    const i = TABS.findIndex((t) => t.id === active)
    let next = null
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next === null) return
    e.preventDefault()
    setActive(TABS[next].id)
    refs.current[TABS[next].id]?.focus()
  }

  return (
    // LayoutGroup namespaces the layoutId, so two tab bars on one page never fly into each other
    <LayoutGroup id="underline-tabs">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line">
          <div role="tablist" aria-label="Workspace sections" onKeyDown={onKeyDown} className="flex overflow-x-auto px-2">
            {TABS.map((tab) => {
              const selected = tab.id === active
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    refs.current[tab.id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`ul-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`ul-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.id)}
                  className={cn(TAB_BASE, 'px-3 py-3', selected ? 'text-ink' : 'text-muted hover:text-ink')}
                >
                  {tab.label}
                  {selected && (
                    <motion.span
                      layoutId="underline"
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-44 p-4 sm:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              role="tabpanel"
              id={`ul-panel-${current.id}`}
              aria-labelledby={`ul-tab-${current.id}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.14 }}
              className="focus-ring rounded-lg"
            >
              <dl className="m-0 grid gap-3">
                {current.rows.map(([k, v]) => (
                  <div key={k} className="grid gap-0.5 border-b border-line pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-3">
                    <dt className="text-xs tracking-wide text-muted uppercase sm:text-sm sm:tracking-normal sm:normal-case">{k}</dt>
                    <dd className="m-0 text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}

/* ==========================================================================
   2. Segmented control: the highlight pill is the shared element
   ========================================================================== */
const BILLING = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]
const PLANS = [
  { name: 'Team', monthly: 15, yearly: 12, blurb: 'Shared themes and review' },
  { name: 'Scale', monthly: 49, yearly: 39, blurb: 'SSO, audit log, priority' },
]

function PillToggle() {
  const [billing, setBilling] = useState('yearly')

  return (
    <LayoutGroup id="billing-pill">
      <div className="mx-auto grid grid-cols-1 max-w-md gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div role="radiogroup" aria-label="Billing period" className="relative flex rounded-full border border-line bg-surface p-1">
            {BILLING.map((option) => {
              const selected = billing === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setBilling(option.id)}
                  className={cn(TAB_BASE, 'rounded-full px-4 py-1.5', selected ? 'text-surface' : 'text-muted hover:text-ink')}
                >
                  {selected && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative">{option.label}</span>
                </button>
              )
            })}
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Yearly saves 20%
          </span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
          {PLANS.map((plan) => (
            <div key={plan.name} className="grid gap-1 rounded-2xl border border-line bg-surface p-4">
              <p className="m-0 font-display text-lg font-semibold">{plan.name}</p>
              <p className="m-0 flex items-baseline gap-1">
                <span className="relative inline-flex h-9 min-w-[3.25rem] items-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={billing}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="font-display text-3xl font-bold tabular-nums"
                    >
                      ${plan[billing]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-sm text-muted">/ seat / mo</span>
              </p>
              <p className="m-0 text-xs text-muted">{plan.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </LayoutGroup>
  )
}

/* ==========================================================================
   3. Grid card grows into a detail view (same layoutId on both sides)
   ========================================================================== */
const TRIPS = [
  {
    id: 'lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    nights: 5,
    price: 640,
    gradient: 'from-orange-700 to-rose-700',
    blurb: 'Tiled hillsides, trams and a late sunset over the Tagus. Mild in October and easy to cover on foot.',
    stops: ['Alfama morning walk', 'Day trip to Sintra', 'Pastéis de Belém at closing time'],
  },
  {
    id: 'kyoto',
    city: 'Kyoto',
    country: 'Japan',
    nights: 7,
    price: 1180,
    gradient: 'from-fuchsia-600 to-violet-700',
    blurb: 'Temples at dawn, a lantern-lit Gion and maple leaves at their reddest in the second half of November.',
    stops: ['Fushimi Inari before 7 am', 'Arashiyama bamboo grove', 'Tea ceremony in Higashiyama'],
  },
  {
    id: 'reykjavik',
    city: 'Reykjavík',
    country: 'Iceland',
    nights: 4,
    price: 920,
    gradient: 'from-sky-600 to-indigo-700',
    blurb: 'Geothermal pools, black-sand beaches and a fair chance of northern lights between September and March.',
    stops: ['Golden Circle loop', 'Blue Lagoon at night', 'Aurora chase from the coast'],
  },
  {
    id: 'oaxaca',
    city: 'Oaxaca',
    country: 'Mexico',
    nights: 6,
    price: 780,
    gradient: 'from-emerald-700 to-teal-800',
    blurb: 'Mole in the markets, mezcal workshops and the Day of the Dead parades in the first days of November.',
    stops: ['Monte Albán at opening', 'Hierve el Agua springs', 'Cooking class at Mercado 20 de Noviembre'],
  },
]

function ExpandingCards() {
  const [selected, setSelected] = useState(null)
  const cardRefs = useRef({})
  const lastOpened = useRef(null)
  const trip = TRIPS.find((t) => t.id === selected)

  function open(id) {
    lastOpened.current = id
    setSelected(id)
  }

  return (
    <LayoutGroup id="trip-cards">
      <div
        className="relative h-[24rem] overflow-hidden rounded-2xl border border-line bg-surface p-3"
        onKeyDown={(e) => e.key === 'Escape' && setSelected(null)}
      >
        <div inert={selected !== null} className="grid grid-cols-2 content-start gap-3">
          {TRIPS.map((t) => (
            <motion.button
              key={t.id}
              ref={(el) => {
                cardRefs.current[t.id] = el
              }}
              type="button"
              layoutId={`trip-${t.id}`}
              onClick={() => open(t.id)}
              // border radius goes in `style`, not a class: Motion can only counter-scale what it can read
              style={{ borderRadius: 16 }}
              className={cn('focus-ring grid h-36 cursor-pointer content-end gap-0.5 overflow-hidden bg-linear-to-br p-3 text-left text-white', t.gradient)}
            >
              <motion.span layoutId={`trip-title-${t.id}`} className="font-display text-lg leading-tight font-semibold">
                {t.city}
              </motion.span>
              <span className="text-xs text-white/85">
                {t.nights} nights · from ${t.price}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence onExitComplete={() => cardRefs.current[lastOpened.current]?.focus()}>
          {trip && (
            <motion.div
              key={trip.id}
              layoutId={`trip-${trip.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="trip-title"
              style={{ borderRadius: 16 }}
              className={cn('absolute inset-3 z-10 overflow-y-auto bg-linear-to-br p-4 text-white sm:p-5', trip.gradient)}
            >
              <motion.h3 layoutId={`trip-title-${trip.id}`} id="trip-title" className="m-0 w-fit font-display text-2xl leading-tight font-semibold">
                {trip.city}
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                className="grid gap-3"
              >
                <p className="m-0 text-sm text-white/85">
                  {trip.country} · {trip.nights} nights
                </p>
                <p className="m-0 max-w-prose text-sm text-pretty">{trip.blurb}</p>
                <ul className="m-0 grid list-none gap-1.5 p-0 text-sm">
                  {trip.stops.map((stop, i) => (
                    <li key={stop} className="flex gap-2">
                      <span aria-hidden="true" className="font-mono text-white/70">
                        {i + 1}
                      </span>
                      {stop}
                    </li>
                  ))}
                </ul>
                <p className="m-0 font-display text-xl font-semibold tabular-nums">From ${trip.price}</p>
              </motion.div>
              <motion.button
                type="button"
                autoFocus
                onClick={() => setSelected(null)}
                aria-label="Close details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="focus-ring absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-full bg-black/25 text-white hover:bg-black/40"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MotionSharedLayout() {
  return (
    <Feature
      id="motion-shared-layout"
      title="One element, two places"
      parts={['layoutId', 'LayoutGroup', 'style={{ borderRadius }}', 'transition', 'AnimatePresence']}
      docs={{ href: 'https://motion.dev/docs/react-layout-animations', label: 'Motion: layout animations' }}
      description={
        <>
          <p>
            Render an element with a <code>layoutId</code> in one place, and another with the same id elsewhere. Motion measures both, then animates
            the visible one from the old box to the new box with transforms.
          </p>
          <p>
            <strong>Plain Tailwind</strong> can only transition properties on one element. It cannot carry an underline from one button to another,
            because they are different nodes.
          </p>
          <p>
            <strong>Reach for Motion</strong> when something should appear to travel, resize or reorder as the markup changes. Keep colour and
            typography in Tailwind classes; keep border radius in <code>style</code> so Motion can counter the stretch.
          </p>
        </>
      }
    >
      <Example
        title="Tabs: a sliding underline"
        lang="jsx"
        code={`<LayoutGroup id="underline-tabs">
  {tabs.map((tab) => (
    <button key={tab.id} role="tab" aria-selected={tab.id === active}
      className="relative px-3 py-3 text-sm font-medium">
      {tab.label}
      {tab.id === active && (
        <motion.span layoutId="underline"
          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />
      )}
    </button>
  ))}
</LayoutGroup>`}
      >
        <UnderlineTabs />
      </Example>

      <Example
        title="Segmented control: a sliding pill"
        lang="jsx"
        code={`{selected && (
  <motion.span layoutId="billing-pill"
    className="absolute inset-0 rounded-full bg-accent"
    transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
)}
<span className="relative">{option.label}</span>`}
      >
        <PillToggle />
      </Example>

      <Example
        title="Card to detail: layoutId on the card and its title"
        lang="jsx"
        code={`<motion.button layoutId={'trip-' + id} style={{ borderRadius: 16 }}
  className="bg-linear-to-br from-orange-700 to-rose-700 p-3 text-white">
  <motion.span layoutId={'trip-title-' + id}>{city}</motion.span>
</motion.button>

<AnimatePresence>
  {trip && (
    <motion.div layoutId={'trip-' + trip.id} style={{ borderRadius: 16 }}
      className="absolute inset-0 bg-linear-to-br from-orange-700 to-rose-700" />
  )}
</AnimatePresence>`}
      >
        <ExpandingCards />
      </Example>
    </Feature>
  )
}
