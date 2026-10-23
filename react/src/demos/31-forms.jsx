import { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * @tailwindcss/forms with `strategy: "class"`.
 *
 * Registered once in src/index.css:
 *
 *     @plugin "@tailwindcss/forms" {
 *       strategy: "class";
 *     }
 *
 * The plugin's default strategy ("base") restyles every <input>, <select> and
 * <textarea> on the page. "class" is the opt-in version: nothing changes until
 * an element carries form-input, form-select, form-checkbox, form-radio,
 * form-textarea or form-multiselect. That is the safer choice in an app that
 * already has its own inputs (this very shell has a theme <select>).
 *
 * Like typography, the plugin is JavaScript that runs inside Tailwind's
 * compiler, so it needs a build step to be loaded at all.
 */
export const meta = {
  id: 'forms-plugin',
  title: 'Forms plugin (class strategy)',
  group: 'Build-step features',
  order: 301,
  summary: 'form-input, form-select, form-checkbox and friends give native controls a clean, utility-friendly baseline, only where you ask for it.',
  tailwind: [
    '@plugin "@tailwindcss/forms"',
    'strategy: "class"',
    'form-input',
    'form-select',
    'form-checkbox',
    'form-radio',
    'form-textarea',
    'focus:ring-sky-600',
    'placeholder:text-muted',
  ],
}

/* ---------- shared class strings (complete, so the scanner sees them) ---------- */

const INPUT =
  'form-input block w-full rounded-lg border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-sky-600 focus:ring-1 focus:ring-sky-600 disabled:cursor-not-allowed disabled:opacity-60'
const SELECT =
  'form-select block w-full rounded-lg border-line bg-surface py-2 pr-9 pl-3 text-sm text-ink focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
const TEXTAREA =
  'form-textarea block w-full resize-y rounded-lg border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
const CHECK = 'form-checkbox size-4 rounded border-line bg-surface text-sky-600 focus:ring-2 focus:ring-sky-600 focus:ring-offset-0'
const RADIO = 'form-radio size-4 border-line bg-surface text-sky-600 focus:ring-2 focus:ring-sky-600 focus:ring-offset-0'
const BUTTON =
  'focus-ring cursor-pointer rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none'
const GHOST =
  'focus-ring cursor-pointer rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent motion-reduce:transition-none'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children}
      <div className="min-h-5 text-xs">
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p
              key="error"
              id={`${htmlFor}-msg`}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="m-0 font-medium text-red-700 dark:text-red-300"
            >
              {error}
            </motion.p>
          ) : (
            <motion.p key="hint" id={`${htmlFor}-msg`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="m-0 text-muted">
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- 1. bare vs form-* ---------- */

function BareVsClass() {
  const id = useId()
  const cell = 'grid content-start gap-3 rounded-xl border border-dashed border-line bg-surface p-4'
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={cell}>
        <p className="m-0 font-mono text-[11px] tracking-widest text-muted uppercase">No class</p>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor={`${id}-a`}>
          Project name
          <input id={`${id}-a`} type="text" defaultValue="Spring launch" />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor={`${id}-b`}>
          Visibility
          <select id={`${id}-b`} defaultValue="team">
            <option value="team">Team</option>
            <option value="public">Public</option>
          </select>
        </label>
        <p className="m-0 text-xs text-muted">
          Tailwind&apos;s preflight resets form controls and the plugin leaves them alone, so the text field has no visible border at all.
        </p>
      </div>
      <div className={cell}>
        <p className="m-0 font-mono text-[11px] tracking-widest text-accent uppercase">form-input · form-select</p>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor={`${id}-c`}>
          Project name
          <input id={`${id}-c`} type="text" defaultValue="Spring launch" className={INPUT} />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor={`${id}-d`}>
          Visibility
          <select id={`${id}-d`} defaultValue="team" className={SELECT}>
            <option value="team">Team</option>
            <option value="public">Public</option>
          </select>
        </label>
        <p className="m-0 text-xs text-muted">Same elements, one class each, then utilities for the colours: no custom CSS, no appearance hacks.</p>
      </div>
    </div>
  )
}

/* ---------- 2. an account settings form with validation ---------- */

const PLANS = [
  ['solo', '1 to 10 people'],
  ['team', '11 to 50 people'],
  ['org', '51 or more'],
]

function SettingsForm() {
  const uid = useId()
  const [values, setValues] = useState({ name: 'Mara Okafor', email: 'mara@', role: 'design', plan: 'team', bio: '', digest: true, product: false })
  const [touched, setTouched] = useState({})
  const [saved, setSaved] = useState(false)

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValues((s) => ({ ...s, [key]: v }))
    setSaved(false)
  }
  const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }))

  const errors = {
    name: values.name.trim() ? '' : 'Tell us what to call you.',
    email: EMAIL_RE.test(values.email) ? '' : 'Use an address like name@company.com.',
  }
  const show = (key) => (touched[key] ? errors[key] : '')
  const valid = !errors.name && !errors.email

  function onSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true })
    if (valid) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`${uid}-name`} hint="Shown on invoices." error={show('name')}>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            onBlur={touch('name')}
            aria-invalid={Boolean(show('name'))}
            aria-describedby={`${uid}-name-msg`}
            className={cn(INPUT, show('name') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
          />
        </Field>
        <Field label="Work email" htmlFor={`${uid}-email`} hint="We never share it." error={show('email')}>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={set('email')}
            onBlur={touch('email')}
            aria-invalid={Boolean(show('email'))}
            aria-describedby={`${uid}-email-msg`}
            className={cn(INPUT, show('email') && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
          />
        </Field>
      </div>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Role" htmlFor={`${uid}-role`} hint="Used to tailor the onboarding checklist.">
          <select id={`${uid}-role`} value={values.role} onChange={set('role')} className={SELECT}>
            <option value="design">Design</option>
            <option value="eng">Engineering</option>
            <option value="product">Product</option>
            <option value="support">Support</option>
          </select>
        </Field>
        <fieldset className="m-0 grid gap-1.5 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[13px] font-semibold">Team size</legend>
          <div className="grid gap-2">
            {PLANS.map(([key, text]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input type="radio" name={`${uid}-plan`} value={key} checked={values.plan === key} onChange={set('plan')} className={RADIO} />
                {text}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <Field label="Short bio" htmlFor={`${uid}-bio`} hint={`${values.bio.length} of 160 characters`}>
        <textarea
          id={`${uid}-bio`}
          rows={3}
          maxLength={160}
          value={values.bio}
          onChange={set('bio')}
          placeholder="Two sentences about what you work on."
          className={TEXTAREA}
        />
      </Field>

      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="mb-1.5 p-0 text-[13px] font-semibold">Email me about</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={values.digest} onChange={set('digest')} className={CHECK} />
          Weekly digest
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={values.product} onChange={set('product')} className={CHECK} />
          Product updates
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked disabled readOnly className={cn(CHECK, 'cursor-not-allowed opacity-60')} />
          Security alerts (always on)
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button type="submit" className={BUTTON}>
          Save changes
        </button>
        <button
          type="button"
          className={GHOST}
          onClick={() => {
            setValues({ name: '', email: '', role: 'design', plan: 'solo', bio: '', digest: false, product: false })
            setTouched({})
            setSaved(false)
          }}
        >
          Clear form
        </button>
        <AnimatePresence>
          {saved && (
            <motion.span
              role="status"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
              Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

/* ---------- 3. compact filter toolbar ---------- */

const INVOICES = [
  { id: 'INV-2041', client: 'Northwind Traders', amount: 4200, status: 'paid' },
  { id: 'INV-2042', client: 'Fabrikam Studio', amount: 980, status: 'overdue' },
  { id: 'INV-2043', client: 'Contoso Labs', amount: 2150, status: 'draft' },
  { id: 'INV-2044', client: 'Northwind Traders', amount: 640, status: 'overdue' },
  { id: 'INV-2045', client: 'Adventure Works', amount: 7800, status: 'paid' },
  { id: 'INV-2046', client: 'Fabrikam Studio', amount: 1320, status: 'paid' },
]

const STATUS_STYLE = {
  paid: 'bg-emerald-100 text-emerald-900',
  overdue: 'bg-red-100 text-red-900',
  draft: 'bg-slate-200 text-slate-900',
}

function FilterToolbar() {
  const id = useId()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [big, setBig] = useState(false)

  const rows = useMemo(
    () =>
      INVOICES.filter(
        (r) => (status === 'all' || r.status === status) && (!big || r.amount > 1000) && r.client.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [q, status, big],
  )

  return (
    <div className="grid gap-3">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2.5">
        <label htmlFor={`${id}-q`} className="sr-only">
          Search clients
        </label>
        <input
          id={`${id}-q`}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients"
          className={cn(INPUT, 'min-w-0 flex-[2_1_10rem] py-1.5')}
        />
        <label htmlFor={`${id}-s`} className="sr-only">
          Status
        </label>
        <select id={`${id}-s`} value={status} onChange={(e) => setStatus(e.target.value)} className={cn(SELECT, 'w-auto min-w-0 flex-[1_1_8rem] py-1.5')}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 px-1 text-sm whitespace-nowrap">
          <input type="checkbox" checked={big} onChange={(e) => setBig(e.target.checked)} className={CHECK} />
          Over $1,000
        </label>
      </form>

      <ul className="m-0 grid list-none gap-1.5 p-0" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r) => (
            <motion.li
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-muted">{r.id}</span>
              <span className="min-w-0 flex-1 font-medium">{r.client}</span>
              <span className="font-mono tabular-nums">${r.amount.toLocaleString('en-US')}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', STATUS_STYLE[r.status])}>{r.status}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        {rows.length === 0 && <li className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-sm text-muted">No invoices match these filters.</li>}
      </ul>
    </div>
  )
}

/* ---------- the demo ---------- */

const SETUP = `/* src/index.css */
@import "tailwindcss";

@plugin "@tailwindcss/forms" {
  strategy: "class";  /* "base" (the default) would restyle every input globally */
}`

const BARE_CODE = `<!-- before: preflight-reset, nothing visible -->
<input type="text" />

<!-- after: opt in with a class, colour it with utilities -->
<input type="text" class="form-input rounded-lg border-line bg-surface px-3 py-2 focus:border-sky-600 focus:ring-1 focus:ring-sky-600" />
<select class="form-select rounded-lg border-line bg-surface py-2 pr-9 pl-3">…</select>`

const FORM_CODE = `<input type="radio"    class="form-radio    size-4 border-line text-sky-600 focus:ring-sky-600" />
<input type="checkbox" class="form-checkbox size-4 rounded border-line text-sky-600 focus:ring-sky-600" />
<textarea              class="form-textarea rounded-lg border-line bg-surface" rows="3"></textarea>

<!-- text-sky-600 is the checked colour: the plugin fills with currentColor -->`

export default function FormsDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="opt-in"
        title="Opt in per element"
        since="4.0"
        parts={['form-input', 'form-select', 'strategy: "class"']}
        docs={{ href: 'https://github.com/tailwindlabs/tailwindcss-forms#readme', label: 'Forms plugin readme' }}
        description={
          <>
            <p>
              With <code>strategy: &quot;class&quot;</code> a control stays exactly as preflight left it until it has a <code>form-*</code> class.
            </p>
            <p>
              <strong>Why it needs a build.</strong> The options block after <code>@plugin</code> is passed to the plugin&apos;s JavaScript while Tailwind
              compiles. A script tag cannot load or configure an npm plugin.
            </p>
          </>
        }
      >
        <Example title="Bare element vs form-* class" code={BARE_CODE}>
          <BareVsClass />
        </Example>
        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/index.css (the one-time setup)">
            {SETUP}
          </Code>
        </div>
      </Feature>

      <Feature
        id="settings-form"
        title="Every control type, themed with utilities"
        since="4.0"
        parts={['form-checkbox', 'form-radio', 'form-textarea', 'text-sky-600', 'focus:ring-sky-600', 'placeholder:text-muted']}
        description={
          <>
            <p>
              The plugin only normalises: borders, padding, the select chevron, checked-state artwork. Colour comes from utilities:{' '}
              <code>text-sky-600</code> sets the checked fill because the plugin paints with <code>currentColor</code>.
            </p>
            <p>The email field starts invalid. Tab out of it, or press Save, to see the message.</p>
          </>
        }
      >
        <Example title="Account settings" code={FORM_CODE} stageClassName="px-3 py-5 sm:px-5">
          <SettingsForm />
        </Example>
      </Feature>

      <Feature
        id="toolbar"
        title="Compact controls in a toolbar"
        since="4.0"
        parts={['py-1.5', 'flex-[2_1_10rem]', 'w-auto', 'sr-only']}
        description={
          <p>
            Because the classes are plain utilities, the same <code>form-input</code> shrinks to a toolbar cell with <code>py-1.5</code> and flex-basis
            values. Search, filter and check; the list reacts as you type.
          </p>
        }
      >
        <Example
          title="Invoice filters"
          stageClassName="px-3 py-5 sm:px-5"
          code={`<form class="flex flex-wrap items-center gap-2">\n  <input type="search" class="form-input flex-[2_1_10rem] py-1.5 …" />\n  <select class="form-select w-auto flex-[1_1_8rem] py-1.5 …">…</select>\n  <label class="flex items-center gap-2">\n    <input type="checkbox" class="form-checkbox …" /> Over $1,000\n  </label>\n</form>`}
        >
          <FilterToolbar />
        </Example>
      </Feature>
    </div>
  )
}
