import { useId, useRef, useState } from 'react'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * Showing and hiding with transition-discrete.
 *
 * `display: none` has always been an on/off switch, so CSS skipped the
 * transition and the element vanished the instant it was hidden. The
 * `transition-discrete` utility sets transition-behavior: allow-discrete,
 * which lets `display` (and a dialog's top-layer `overlay`) flip at the END of
 * an exit transition and at the START of an entry one. Pair it with `starting:`
 * for the entry and you get a real fade/slide with plain `hidden`, <dialog> or
 * [popover], and no unmount timers in React.
 */
export const meta = {
  id: 'transition-discrete',
  title: 'Show and hide with transition-discrete',
  group: 'Tailwind motion in React',
  order: 120,
  summary: 'Fade out of display:none, animate a native dialog, drawer and popover sheet: transition-discrete plus starting:open: and no unmount timers.',
  tailwind: [
    'transition-discrete',
    'transition-normal',
    'data-[state=closed]:hidden',
    'open:',
    'starting:open:opacity-0',
    'backdrop:',
    'open:backdrop:bg-slate-950/50',
    'translate-x-full',
    'motion-reduce:transition-none',
  ],
}

/* ---------- small shared pieces ---------- */

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

function Switch({ checked, onChange, children }) {
  const id = useId()
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className="focus-ring group relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-muted/50 transition-colors duration-200 aria-checked:bg-accent motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 group-aria-checked:translate-x-5 motion-reduce:transition-none"
        />
      </button>
      <span id={id} className="font-mono text-xs">
        {children}
      </span>
    </span>
  )
}

/* ---------- 1. Plain display:none, with and without transition-discrete ---------- */

function HiddenBanner() {
  const id = useId()
  const [open, setOpen] = useState(true)
  const [discrete, setDiscrete] = useState(true)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id}>
          {open ? 'Hide banner' : 'Show banner'}
        </Button>
        <Switch checked={discrete} onChange={setDiscrete}>
          {discrete ? 'transition-discrete' : 'transition-normal'}
        </Switch>
      </div>

      <div className="min-h-44">
        {/* closed = display:none. With transition-discrete the opacity and scale finish first; with transition-normal the banner just disappears. */}
        <aside
          id={id}
          data-state={open ? 'open' : 'closed'}
          className={`flex items-start gap-3 rounded-xl border border-accent/40 bg-surface p-4 shadow-lg shadow-black/5 transition-all duration-500 ease-out starting:scale-95 starting:opacity-0 data-[state=closed]:hidden data-[state=closed]:scale-95 data-[state=closed]:opacity-0 motion-reduce:transition-none ${
            discrete ? 'transition-discrete' : 'transition-normal'
          }`}
        >
          <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft font-display font-bold text-accent">
            2.14
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold">Harbor 2.14 is ready to install</p>
            <p className="m-0 mt-1 text-[13px] text-pretty text-muted">
              Faster cold starts and a new deploy log viewer. The app restarts once, which takes about ten seconds.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="border-accent bg-accent text-surface hover:bg-accent/90">Restart now</Button>
              <Button onClick={() => setOpen(false)}>Remind me tomorrow</Button>
            </div>
          </div>
        </aside>
      </div>
      <p className="m-0 text-xs text-muted">
        Turn the switch off and hide the banner: the exit snaps because <code className="font-mono">display</code> flips before anything can fade. The entry still fades in
        either way, since <code className="font-mono">starting:</code> alone is enough for that.
      </p>
    </div>
  )
}

/* ---------- 2. Native <dialog>: modal and drawer ---------- */

function ConfirmDialog() {
  const ref = useRef(null)
  const titleId = useId()
  const bodyId = useId()
  const [result, setResult] = useState(null)

  return (
    <div className="grid justify-items-start gap-3">
      <Button
        onClick={() => {
          ref.current.returnValue = '' // returnValue sticks between openings, so reset it
          ref.current.showModal()
        }}
      >
        Delete project…
      </Button>
      <p className="m-0 text-xs text-muted" aria-live="polite">
        {result ? `Last result: ${result}` : 'Open it, then try Escape, the backdrop or a button.'}
      </p>

      {/* m-auto because Preflight zeroes margins; a click on the dialog box itself (not its content) is a click on the backdrop */}
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClose={(e) => setResult(e.currentTarget.returnValue || 'dismissed')}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close('dismissed')}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] translate-y-4 scale-95 rounded-2xl border border-line bg-surface p-0 text-ink opacity-0 shadow-2xl transition-all transition-discrete duration-300 ease-out backdrop:bg-slate-950/0 backdrop:backdrop-blur-none backdrop:transition-all backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:scale-100 open:opacity-100 open:backdrop:bg-slate-950/50 open:backdrop:backdrop-blur-sm starting:open:translate-y-4 starting:open:scale-95 starting:open:opacity-0 starting:open:backdrop:bg-slate-950/0 starting:open:backdrop:backdrop-blur-none motion-reduce:transition-none motion-reduce:backdrop:transition-none"
      >
        <form method="dialog" className="grid gap-4 p-5">
          <h3 id={titleId} className="m-0 font-display text-lg font-semibold">
            Delete harbor-web?
          </h3>
          <p id={bodyId} className="m-0 text-sm text-pretty text-muted">
            This removes 3 environments, 14 deploy hooks and 9 GB of logs, and releases harbor.example.com immediately. It cannot be undone.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              value="cancelled"
              autoFocus
              className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent motion-reduce:transition-none"
            >
              Cancel
            </button>
            <button
              value="deleted"
              className="focus-ring cursor-pointer rounded-lg bg-red-700 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 motion-reduce:transition-none"
            >
              Delete project
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

const ENVIRONMENTS = ['Production', 'Staging', 'Preview branches']

function FilterDrawer() {
  const ref = useRef(null)
  const titleId = useId()
  const [picked, setPicked] = useState(['Production', 'Staging'])
  const toggle = (name) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]))

  return (
    <div className="grid justify-items-start gap-3">
      <Button onClick={() => ref.current.showModal()}>Filters ({picked.length})</Button>
      <p className="m-0 text-xs text-muted" aria-live="polite">
        Showing deploys from: {picked.length ? picked.join(', ') : 'nothing selected'}
      </p>

      {/* same element type, different motion: it slides in from the right edge */}
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,100vw)] max-w-none translate-x-full border-l border-line bg-surface p-0 text-ink shadow-2xl transition-all transition-discrete duration-300 ease-out backdrop:bg-slate-950/0 backdrop:transition-all backdrop:transition-discrete backdrop:duration-300 open:translate-x-0 open:backdrop:bg-slate-950/40 starting:open:translate-x-full starting:open:backdrop:bg-slate-950/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none"
      >
        <form method="dialog" className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h3 id={titleId} className="m-0 font-display text-lg font-semibold">
              Filter deploys
            </h3>
            <button
              aria-label="Close filters"
              className="focus-ring cursor-pointer rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-ink motion-reduce:transition-none"
            >
              Close
            </button>
          </div>
          <div role="group" aria-labelledby={`${titleId}-env`} className="grid flex-1 content-start gap-1 px-5 py-4">
            <p id={`${titleId}-env`} className="m-0 mb-2 font-mono text-[11px] tracking-widest text-muted uppercase">
              Environment
            </p>
            {ENVIRONMENTS.map((name) => (
              <label key={name} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent-soft motion-reduce:transition-none">
                <input type="checkbox" checked={picked.includes(name)} onChange={() => toggle(name)} className="size-4 accent-accent" />
                {name}
              </label>
            ))}
          </div>
          <div className="border-t border-line p-4">
            <button className="focus-ring w-full cursor-pointer rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-accent/90 motion-reduce:transition-none">
              Show results
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

/* ---------- 3. Popover API: a bottom sheet ---------- */

const SHARE = [
  { label: 'Copy link', note: 'harbor.example.com/releases/2.14' },
  { label: 'Send by email', note: 'Opens your mail app with a draft' },
  { label: 'Post to #releases', note: 'Announces it to 38 people in Slack' },
]

function ShareSheet() {
  const sheetId = useId()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(null)

  return (
    <div className="grid justify-items-start gap-3">
      <button
        type="button"
        popoverTarget={sheetId}
        className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-accent motion-reduce:transition-none"
      >
        Share release notes
      </button>
      <p className="m-0 text-xs text-muted" aria-live="polite">
        {done ? `Chosen: ${done}.` : `Sheet is ${open ? 'open' : 'closed'} (read from the toggle event).`}
      </p>

      {/* popover="auto" brings light dismiss (outside click, Escape) and the top layer for free; top-auto stops the UA inset:0 from centring it vertically */}
      <div
        id={sheetId}
        popover="auto"
        onToggle={(e) => setOpen(e.newState === 'open')}
        className="fixed inset-x-0 top-auto bottom-0 m-0 mx-auto w-full max-w-md translate-y-full overflow-hidden rounded-t-2xl border border-line bg-surface p-0 text-ink shadow-2xl transition-all transition-discrete duration-300 ease-out backdrop:bg-slate-950/0 backdrop:transition-all backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:backdrop:bg-slate-950/40 starting:open:translate-y-full starting:open:backdrop:bg-slate-950/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none"
      >
        <div className="grid gap-1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="m-0 px-2 pb-1 font-display text-base font-semibold">Share Harbor 2.14 notes</p>
          {SHARE.map((s) => (
            <button
              key={s.label}
              type="button"
              popoverTarget={sheetId}
              popoverTargetAction="hide"
              onClick={() => setDone(s.label)}
              className="focus-ring grid cursor-pointer gap-0.5 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-accent-soft motion-reduce:transition-none"
            >
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs text-muted">{s.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- the demo ---------- */

export default function TransitionDiscrete() {
  return (
    <div className="grid gap-6">
      <Feature
        title="Fading out of display:none"
        since="4.0"
        parts={['transition-discrete', 'transition-normal', 'data-[state=closed]:hidden', 'starting:opacity-0']}
        docs={{ href: 'https://tailwindcss.com/docs/transition-behavior', label: 'transition-behavior' }}
        description={
          <>
            <p>
              The closed state is the ordinary <code>hidden</code> utility. <code>transition-discrete</code> sets <code>transition-behavior: allow-discrete</code>, so{' '}
              <code>display</code> waits for the opacity and scale to finish before it flips to <code>none</code>.
            </p>
            <p>
              Flip the switch to compare against <code>transition-normal</code>, the browser default.
            </p>
          </>
        }
      >
        <Example
          title="Hide and show a banner"
          lang="jsx"
          code={`<aside data-state={open ? 'open' : 'closed'}
       className="transition-all transition-discrete duration-500
              starting:scale-95 starting:opacity-0
              data-[state=closed]:hidden data-[state=closed]:scale-95 data-[state=closed]:opacity-0
              motion-reduce:transition-none">
  …
</aside>`}
        >
          <HiddenBanner />
        </Example>
      </Feature>

      <Feature
        title="Native dialog and popover"
        since="4.0"
        parts={['open:', 'starting:open:opacity-0', 'backdrop:', 'open:backdrop:bg-slate-950/50', 'transition-discrete']}
        docs={{ href: 'https://tailwindcss.com/docs/hover-focus-and-other-states#starting-style', label: 'The starting variant' }}
        description={
          <>
            <p>
              A closed <code>&lt;dialog&gt;</code> or <code>[popover]</code> is <code>display: none</code> and lives in the top layer once open. The{' '}
              <code>open:</code> variant matches both, and with <code>transition-discrete</code> the browser keeps the element in the top layer until the exit
              animation has played.
            </p>
            <p>
              <code>backdrop:</code> styles the <code>::backdrop</code>, which needs its own <code>transition-*</code> classes because transitions are not
              inherited. React only calls <code>showModal()</code>; there is no <code>isClosing</code> state.
            </p>
          </>
        }
      >
        <Example
          title="Confirm dialog: scale and rise"
          lang="jsx"
          code={`<dialog ref={ref}
  className="m-auto translate-y-4 scale-95 opacity-0
         transition-all transition-discrete duration-300
         open:translate-y-0 open:scale-100 open:opacity-100
         starting:open:translate-y-4 starting:open:scale-95 starting:open:opacity-0
         backdrop:bg-slate-950/0 backdrop:transition-all backdrop:transition-discrete
         open:backdrop:bg-slate-950/50
         starting:open:backdrop:bg-slate-950/0">
  <form method="dialog">…</form>
</dialog>`}
        >
          <ConfirmDialog />
        </Example>

        <Example
          title="Filter drawer: slide from the edge"
          lang="jsx"
          code={`<dialog className="m-0 ml-auto h-dvh max-h-none translate-x-full
               transition-all transition-discrete duration-300
               open:translate-x-0 starting:open:translate-x-full
               backdrop:transition-all backdrop:transition-discrete
               open:backdrop:bg-slate-950/40 starting:open:backdrop:bg-slate-950/0">
  …
</dialog>`}
        >
          <FilterDrawer />
        </Example>

        <Example
          title="Popover bottom sheet"
          lang="jsx"
          code={`<button popoverTarget={id}>Share release notes</button>

<div id={id} popover="auto"
     className="fixed inset-x-0 top-auto bottom-0 m-0 mx-auto translate-y-full
            transition-all transition-discrete duration-300
            open:translate-y-0 starting:open:translate-y-full">
  …
</div>`}
        >
          <ShareSheet />
        </Example>
      </Feature>
    </div>
  )
}
