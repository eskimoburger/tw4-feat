import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * Dashboard widgets that respond to their own box, not the screen.
 *
 * `@container` turns an element into a query container, and `@sm:`, `@md:` ...
 * then answer to ITS width. That is what a widget needs: the same component
 * lives in a wide main column, a narrow sidebar or a phone, and always picks
 * the layout that fits the space it was actually given.
 *
 *   @container          width queries         (container-type: inline-size)
 *   @container-size     width AND height      (container-type: size, needs a fixed size)
 *   @container/name     a named container, queried with @md/name:
 *   cqw / cqh / cqmin   length units that are a percentage of the container
 *
 * The panels are resizable (slider, presets, or the native drag handle in the
 * corner) so you can watch the queries fire.
 */
export const meta = {
  id: 'container-widget',
  title: 'Container-query dashboard widgets',
  group: 'Tailwind motion in React',
  order: 160,
  summary: 'A KPI widget, a size-container gauge and nested named containers, each inside a panel you can resize to watch @md:, @container-size and cqmin react.',
  tailwind: [
    '@container',
    '@container-size',
    '@container/grid',
    '@xs:',
    '@md:',
    '@max-xs:',
    '@md/grid:grid-cols-2',
    'text-[clamp(1.75rem,9cqw,3rem)]',
    'size-[min(70cqh,80cqw)]',
    'resize-x',
  ],
}

/* ---------- small shared pieces ---------- */

function Button({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={cn('focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent motion-reduce:transition-none', className)}
    >
      {children}
    </button>
  )
}

function Spark({ data, className }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 120, 36 - ((v - min) / (max - min || 1)) * 32])
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <polygon points={`0,40 ${line} 120,40`} className="fill-accent/15" />
      <polyline
        points={line}
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-accent [vector-effect:non-scaling-stroke]"
      />
    </svg>
  )
}

/**
 * A panel whose width React and the user share: a slider and presets set it,
 * and the native drag handle (resize-x) sets it too. A ResizeObserver reports
 * the real width back, so the slider never drifts. The panel itself is the
 * @container, so what its children see is exactly this width.
 */
function WidthPanel({ initial = 480, min = 240, max = 760, presets, children }) {
  const sliderId = useId()
  const ref = useRef(null)
  const [width, setWidth] = useState(initial)

  // start no wider than the stage, so a phone opens on the narrow layout
  useLayoutEffect(() => {
    const room = ref.current?.parentElement?.clientWidth
    if (room) setWidth((w) => Math.max(min, Math.min(w, Math.floor(room))))
  }, [min])

  useEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label htmlFor={sliderId} className="text-[13px] font-medium">
          Panel width
        </label>
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step="8"
          value={Math.max(min, Math.min(max, width))}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="focus-ring w-40 max-w-full accent-accent"
        />
        <output htmlFor={sliderId} className="min-w-14 font-mono text-xs text-muted">
          {width}px
        </output>
        <span className="flex flex-wrap gap-1.5">
          {presets.map(([label, w]) => (
            <Button key={label} onClick={() => setWidth(w)}>
              {label}
            </Button>
          ))}
        </span>
      </div>
      <p className="m-0 text-xs text-muted">Drag the corner handle on a desktop browser, or use the slider. A panel wider than the stage scrolls sideways.</p>
      <div className="overflow-x-auto">
        <div ref={ref} style={{ width }} className="@container max-w-[48rem] min-w-60 resize-x overflow-hidden pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ---------- 1. KPI widget: width tiers ---------- */

const MRR = [31, 33, 32, 35, 36, 38, 37, 40, 41, 43, 44, 48]

const PLANS = [
  ['Starter', '$6,120', '13%', 'bg-sky-600'],
  ['Team', '$24,880', '52%', 'bg-violet-600'],
  ['Enterprise', '$17,290', '35%', 'bg-emerald-600'],
]

// every tier gets its own chip, lit by its own variant: the proof is written in CSS, not in JS
const TIERS = [
  ['@xs', '@xs:bg-accent @xs:text-surface'],
  ['@sm', '@sm:bg-accent @sm:text-surface'],
  ['@md', '@md:bg-accent @md:text-surface'],
  ['@lg', '@lg:bg-accent @lg:text-surface'],
  ['@xl', '@xl:bg-accent @xl:text-surface'],
]

function RevenueWidget() {
  return (
    <section aria-label="Monthly recurring revenue" className="grid gap-4 rounded-xl border border-line bg-surface p-4 @sm:p-5">
      {/* below @xs the delta drops under the number (@max-xs:); from @xs it sits beside it */}
      <header className="flex items-start justify-between gap-3 @max-xs:flex-col">
        <div className="min-w-0">
          <h4 className="m-0 text-sm font-medium text-muted">Monthly recurring revenue</h4>
          <p className="m-0 mt-1 font-display text-[clamp(1.75rem,9cqw,3rem)] leading-none font-bold tracking-tight">$48,290</p>
        </div>
        <p className="m-0 inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-emerald-800 dark:text-emerald-400">
          <span aria-hidden="true">▲</span> 6.4% <span className="font-normal text-muted">vs last month</span>
        </p>
      </header>

      {/* the trend line appears at @sm */}
      <Spark data={MRR} className="hidden h-16 w-full @sm:block" />

      {/* plans stack as rows, then become three columns at @md */}
      <dl className="m-0 grid gap-2 @md:grid-cols-3">
        {PLANS.map(([plan, amount, share, bar]) => (
          <div key={plan} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5 rounded-lg bg-stage px-3 py-2 @md:grid-cols-1">
            <dt className="text-xs text-muted">{plan}</dt>
            <dd className="m-0 text-sm font-semibold @md:order-last">{amount}</dd>
            <div aria-hidden="true" className="col-span-2 h-1.5 overflow-hidden rounded-full bg-line @md:col-span-1">
              <div className={`h-full rounded-full ${bar}`} style={{ width: share }} />
            </div>
          </div>
        ))}
      </dl>

      {/* extra figures only when there is room: @xl */}
      <dl className="m-0 hidden grid-cols-3 gap-3 border-t border-line pt-3 text-center @xl:grid">
        {[
          ['Avg per account', '$183'],
          ['Churn', '1.2%'],
          ['Net new', '+$2,910'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="m-0 font-display text-base font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="m-0 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
        Active queries
        {TIERS.map(([label, lit]) => (
          <code key={label} className={`rounded-md bg-stage px-1.5 py-0.5 font-mono transition-colors motion-reduce:transition-none ${lit}`}>
            {label}
          </code>
        ))}
      </p>
    </section>
  )
}

/* ---------- 2. @container-size gauge: width, height and cqmin ---------- */

const GAUGE_C = 2 * Math.PI * 42

function GaugeWidget() {
  return (
    <section
      aria-label="Build success rate"
      className="flex h-full w-full items-center justify-center gap-[4cqw] rounded-xl border border-line bg-surface p-[4cqmin]"
    >
      {/* the ring is sized from BOTH axes: 70% of the height, but never more than 80% of the width */}
      <div className="relative grid aspect-square size-[min(70cqh,80cqw)] shrink-0 place-items-center @md:size-[min(78cqh,38cqw)]">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-line" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${GAUGE_C * 0.94} ${GAUGE_C}`}
            className="stroke-accent"
          />
        </svg>
        <p className="relative m-0 grid justify-items-center leading-none">
          <span className="font-display text-[clamp(1rem,17cqmin,3.5rem)] font-bold tracking-tight">94%</span>
          <span className="mt-[1cqmin] text-[clamp(0.625rem,4.5cqmin,0.875rem)] text-muted">builds passed</span>
        </p>
      </div>

      {/* the detail column needs width, so it only exists from @md */}
      <dl className="m-0 hidden gap-[2cqmin] @md:grid">
        <div>
          <dt className="text-xs text-muted">Passed</dt>
          <dd className="m-0 font-display text-[clamp(1rem,8cqmin,1.75rem)] leading-tight font-semibold">188</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Failed</dt>
          <dd className="m-0 font-display text-[clamp(1rem,8cqmin,1.75rem)] leading-tight font-semibold text-red-700 dark:text-red-400">12</dd>
        </div>
        <p className="m-0 hidden text-xs text-muted @2xl:block">Last 30 days, all branches</p>
      </dl>
    </section>
  )
}

const GAUGE_PRESETS = [
  ['Compact', 240, 144],
  ['Square', 320, 320],
  ['Wide', 560, 224],
]

function GaugePanel() {
  const ref = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]
      setSize({ w: Math.round(box?.inlineSize ?? entry.contentRect.width), h: Math.round(box?.blockSize ?? entry.contentRect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const apply = (w, h) => {
    ref.current.style.width = `${w}px`
    ref.current.style.height = `${h}px`
  }

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[13px] font-medium">Panel size</span>
        <span className="flex flex-wrap gap-1.5">
          {GAUGE_PRESETS.map(([label, w, h]) => (
            <Button key={label} onClick={() => apply(w, h)}>
              {label} {w}×{h}
            </Button>
          ))}
        </span>
        <output className="font-mono text-xs text-muted" aria-live="off">
          {size.w} × {size.h} px · 1cqmin = {(Math.min(size.w, size.h) / 100).toFixed(1)}px
        </output>
      </div>
      <p className="m-0 text-xs text-muted">Drag the corner handle to resize in both directions. Presets are the way to do it on a touch screen.</p>
      <div className="overflow-x-auto pb-1">
        {/* a size container has no content-based size, so it needs a width and a height of its own */}
        <div ref={ref} className="@container-size h-64 max-h-[28rem] min-h-32 w-[min(26rem,100%)] max-w-[48rem] min-w-48 resize overflow-hidden">
          <GaugeWidget />
        </div>
      </div>
    </div>
  )
}

/* ---------- 3. Nested named containers ---------- */

const STATS = [
  { label: 'Sessions', value: '12,480', note: '+8% this week', data: [20, 24, 22, 27, 26, 31, 34, 33, 38] },
  { label: 'Conversion', value: '3.9%', note: '+0.3 pt', data: [30, 28, 31, 33, 32, 35, 36, 38, 40] },
  { label: 'p95 latency', value: '284 ms', note: '-18 ms', data: [40, 38, 41, 36, 35, 33, 34, 31, 29] },
]

function StatCard({ stat }) {
  return (
    // each card is its own container named "stat", so it reacts to ITS width: a card in a 3-column grid is narrow even when the panel is wide
    <article className="@container/stat min-w-0 rounded-xl border border-line bg-surface p-3">
      <div className="flex flex-col gap-2 @3xs/stat:flex-row @3xs/stat:items-center @3xs/stat:justify-between">
        <div className="min-w-0">
          <h4 className="m-0 truncate text-xs font-medium text-muted">{stat.label}</h4>
          <p className="m-0 mt-0.5 font-display text-[clamp(1.25rem,12cqw,2rem)] leading-none font-bold tracking-tight">{stat.value}</p>
          <p className="m-0 mt-1 truncate text-xs text-muted">{stat.note}</p>
        </div>
        <Spark data={stat.data} className="h-8 w-full @3xs/stat:w-24 @3xs/stat:shrink-0" />
      </div>
      <p className="m-0 mt-2 font-mono text-[11px] text-muted">
        <span className="@3xs/stat:hidden">card: stacked</span>
        <span className="hidden @3xs/stat:inline">card: side by side</span>
      </p>
    </article>
  )
}

function NestedGrid() {
  return (
    // the grid's own named container sits inside the (unnamed) panel container; the two do not interfere
    <div className="@container/grid">
      <div className="grid grid-cols-1 gap-3 @md/grid:grid-cols-2 @xl/grid:grid-cols-3">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>
      <p className="m-0 mt-3 font-mono text-[11px] text-muted">
        <span className="@md/grid:hidden">grid: 1 column</span>
        <span className="hidden @md/grid:inline @xl/grid:hidden">grid: 2 columns</span>
        <span className="hidden @xl/grid:inline">grid: 3 columns</span>
      </p>
    </div>
  )
}

/* ---------- the demo ---------- */

export default function ContainerWidget() {
  return (
    <div className="grid gap-6">
      <Feature
        title="@container tiers"
        since="4.0"
        parts={['@container', '@xs:', '@sm:', '@md:', '@xl:', '@max-xs:', 'text-[clamp(1.75rem,9cqw,3rem)]', 'resize-x']}
        docs={{ href: 'https://tailwindcss.com/docs/responsive-design#container-queries', label: 'Container queries' }}
        description={
          <>
            <p>
              The panel is the <code>@container</code>. Inside it the widget gains pieces as width allows: a trend line at <code>@sm:</code>, a three-column plan
              split at <code>@md:</code>, extra figures at <code>@xl:</code>. <code>@max-xs:</code> is the reverse, a rule for narrower than a tier.
            </p>
            <p>
              The headline number is <code>clamp(…, 9cqw, …)</code>: <code>cqw</code> is one percent of the container&apos;s width, so the type scales with the
              panel instead of the window.
            </p>
          </>
        }
      >
        <Example
          title="Revenue widget in a resizable panel"
          lang="jsx"
          code={`<div className="@container resize-x overflow-hidden" style={{ width }}>
  <section className="p-4 @sm:p-5">
    <header className="flex justify-between @max-xs:flex-col">
      <p className="text-[clamp(1.75rem,9cqw,3rem)]">$48,290</p>
    </header>
    <Spark className="hidden @sm:block" />
    <dl className="grid gap-2 @md:grid-cols-3">…</dl>
    <dl className="hidden @xl:grid">…</dl>
  </section>
</div>`}
        >
          <WidthPanel initial={480} presets={[['Narrow', 264], ['Medium', 480], ['Wide', 580]]}>
            <RevenueWidget />
          </WidthPanel>
        </Example>
      </Feature>

      <Feature
        title="@container-size and cq units"
        since="4.0"
        parts={['@container-size', 'size-[min(70cqh,80cqw)]', 'text-[clamp(1rem,17cqmin,3.5rem)]', 'p-[4cqmin]', 'resize']}
        docs={{ href: 'https://tailwindcss.com/docs/responsive-design#using-size-containers', label: 'Size containers' }}
        description={
          <>
            <p>
              <code>@container</code> only watches the inline axis. <code>@container-size</code> sets <code>container-type: size</code>, which makes{' '}
              <code>cqh</code> and <code>cqmin</code> meaningful too. The price is that the box can no longer size itself from its content, so it needs a
              width and a height of its own.
            </p>
            <p>
              The ring is <code>min(70cqh, 80cqw)</code> and the type is <code>cqmin</code>-based, so both follow whichever dimension is tighter.
            </p>
          </>
        }
      >
        <Example
          title="Build gauge in a two-way resizable panel"
          lang="jsx"
          code={`<div className="@container-size h-64 w-[26rem] resize overflow-hidden">
  <section className="flex h-full items-center justify-center p-[4cqmin]">
    <div className="size-[min(70cqh,80cqw)] @md:size-[min(78cqh,38cqw)]">
      <span className="text-[clamp(1rem,17cqmin,3.5rem)]">94%</span>
    </div>
    <dl className="hidden @md:grid">…</dl>
  </section>
</div>`}
        >
          <GaugePanel />
        </Example>
      </Feature>

      <Feature
        title="Named, nested containers"
        since="4.0"
        parts={['@container/grid', '@container/stat', '@md/grid:grid-cols-2', '@xl/grid:grid-cols-3', '@3xs/stat:flex-row', '@3xs/stat:w-24']}
        docs={{ href: 'https://tailwindcss.com/docs/responsive-design#named-containers', label: 'Named containers' }}
        description={
          <>
            <p>
              Two containers, two names. <code>@md/grid:</code> asks the panel how many columns to use; <code>@3xs/stat:</code> asks each card how to lay itself out.
            </p>
            <p>
              Widen the panel and watch the cards: the moment the grid goes from one column to two, every card gets narrower and correctly falls back to a
              stacked layout. A viewport breakpoint cannot express that.
            </p>
          </>
        }
      >
        <Example
          title="Stat cards inside a grid"
          lang="jsx"
          code={`<div className="@container/grid">
  <div className="grid grid-cols-1 gap-3 @md/grid:grid-cols-2 @xl/grid:grid-cols-3">
    <article className="@container/stat">
      <div className="flex flex-col @3xs/stat:flex-row">
        <p className="text-[clamp(1.25rem,12cqw,2rem)]">12,480</p>
        <Spark className="w-full @3xs/stat:w-24" />
      </div>
    </article>
  </div>
</div>`}
        >
          <WidthPanel initial={500} min={264} presets={[['1 column', 320], ['2 columns', 500], ['3 columns', 592]]}>
            <NestedGrid />
          </WidthPanel>
        </Example>
      </Feature>
    </div>
  )
}
