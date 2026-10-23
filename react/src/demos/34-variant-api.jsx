import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * A component variant API with clsx + tailwind-merge (the cn() helper).
 *
 * The problem is not Tailwind's, it is CSS's: when an element has both `px-4`
 * and `px-2`, the winner is whichever rule comes LAST IN THE STYLESHEET, not
 * whichever class comes last in the attribute. Tailwind sorts its output by
 * property and value, so `cn('px-4', 'px-2')` written as a plain string can
 * leave the 16px padding in place even though the caller asked for 8px.
 *
 * tailwind-merge fixes it at the source: it knows which utilities fight over
 * the same CSS property and drops the earlier one, so the className string
 * itself is unambiguous. src/lib/cn.js is clsx (conditionals) + tailwind-merge
 * (conflicts), extended with this project's custom utilities.
 *
 * Why this is a build-step topic: it is ordinary JavaScript from npm,
 * bundled by Vite and imported like any module. A page loaded from a script tag
 * has no module graph to import clsx or tailwind-merge from. And because the
 * variant tables hold complete class strings, the scanner can still find every
 * class (see the @source inline demo for what happens when they are built up
 * from pieces instead).
 */
export const meta = {
  id: 'variant-api',
  title: 'Variant API with cn() and tailwind-merge',
  group: 'Build-step features',
  order: 304,
  summary: 'Why px-4 followed by px-2 is a bug in plain CSS, how tailwind-merge resolves it, and a typed-feeling variant function for buttons.',
  tailwind: ['cn()', 'clsx', 'tailwind-merge', 'px-2 px-4 → px-2', 'variants({ intent, size })', 'disabled:', 'border-transparent'],
}

/* ---------- 1. plain concatenation vs cn() ---------- */

const BASE = 'rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white'

const OVERRIDES = [
  { value: 'px-2', prop: 'paddingLeft', label: 'padding-left' },
  { value: 'px-8', prop: 'paddingLeft', label: 'padding-left' },
  { value: 'rounded-full', prop: 'borderTopLeftRadius', label: 'border-radius' },
  { value: 'bg-rose-700', prop: 'backgroundColor', label: 'background' },
  { value: 'text-lg', prop: 'fontSize', label: 'font-size' },
]

function readStyle(el, prop) {
  const raw = getComputedStyle(el)[prop]
  if (prop === 'borderTopLeftRadius' && parseFloat(raw) > 1000) return '9999px (full)'
  return raw
}

function Probe({ title, classes, prop, expected, onValue }) {
  const ref = useRef(null)
  const [value, setValue] = useState('')
  useLayoutEffect(() => {
    if (!ref.current) return
    const v = readStyle(ref.current, prop)
    setValue(v)
    onValue?.(v)
  }, [classes, prop, onValue])
  const ok = expected === undefined ? null : value === expected

  return (
    <div className="grid content-start gap-3 rounded-xl border border-line bg-surface p-4">
      <h3 className="m-0 font-mono text-[11px] font-semibold tracking-widest text-muted uppercase">{title}</h3>
      <div className="flex min-h-14 items-center">
        <button ref={ref} type="button" className={classes}>
          Save draft
        </button>
      </div>
      <p className="m-0 font-mono text-[12px] leading-relaxed wrap-anywhere text-muted">class=&quot;{classes}&quot;</p>
      <p className="m-0 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-ink">{value}</span>
        {ok !== null && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
              ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900',
            )}
          >
            {ok ? '✓ override applied' : '✗ override ignored'}
          </span>
        )}
      </p>
    </div>
  )
}

function MergeVsConcat() {
  const [index, setIndex] = useState(0)
  const [truth, setTruth] = useState(undefined)
  const o = OVERRIDES[index]
  const plain = clsx(BASE, o.value)
  const merged = cn(BASE, o.value)
  const pill = useId()

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className="text-[13px] font-semibold">Override passed in by the caller</span>
        <div role="radiogroup" aria-label="Override" className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
          {OVERRIDES.map((item, i) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'focus-ring relative cursor-pointer rounded-lg px-3 py-1 font-mono text-xs font-medium transition-colors motion-reduce:transition-none',
                i === index ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {i === index && (
                <motion.span layoutId={pill} className="absolute inset-0 rounded-lg bg-accent-soft" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
              )}
              <span className="relative">{item.value}</span>
            </button>
          ))}
        </div>
        <p className="m-0 text-xs text-muted">
          Base: <code className="font-mono">{BASE}</code>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Probe title="clsx(base, override)" classes={plain} prop={o.prop} expected={truth} />
        <Probe title="cn(base, override)" classes={merged} prop={o.prop} onValue={setTruth} />
      </div>
      <p className="m-0 text-sm text-pretty text-muted" aria-live="polite">
        Measured {o.label}. The plain string keeps both <code className="rounded bg-accent-soft px-1 font-mono text-[12.5px]">{o.value}</code> and
        its rival, so the browser picks by stylesheet order, not by the order you wrote them. <code className="font-mono text-[12.5px]">cn()</code>{' '}
        removes the loser.
      </p>
    </div>
  )
}

/* ---------- 2. a variant function ---------- */

/**
 * A 12-line stand-in for cva / tailwind-variants: pick one entry from each
 * table, then let cn() resolve any conflicts, className last so callers win.
 */
function variants({ base, variants: table, defaults }) {
  return ({ className, ...props } = {}) =>
    cn(
      base,
      Object.keys(table).map((axis) => table[axis][props[axis] ?? defaults[axis]]),
      className,
    )
}

// Every value is a complete class string: the scanner reads this file as text.
const button = variants({
  base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent font-semibold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none',
  variants: {
    intent: {
      solid: 'bg-sky-700 text-white hover:bg-sky-800',
      soft: 'bg-sky-100 text-sky-900 hover:bg-sky-200',
      outline: 'border-line bg-surface text-ink hover:border-accent',
      danger: 'bg-red-700 text-white hover:bg-red-800',
      ghost: 'text-ink hover:bg-accent-soft',
    },
    size: {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    },
  },
  defaults: { intent: 'solid', size: 'md' },
})

function Button({ intent, size, className, ...props }) {
  return <button type="button" className={button({ intent, size, className })} {...props} />
}

const INTENTS = ['solid', 'soft', 'outline', 'danger', 'ghost']
const SIZES = ['sm', 'md', 'lg']
const CALLER_CLASSES = [
  ['', 'none'],
  ['w-full', 'w-full'],
  ['rounded-full', 'rounded-full'],
  ['px-10', 'px-10'],
  ['uppercase tracking-wider', 'uppercase'],
]

function Chips({ label, value, onChange, options }) {
  const pill = useId()
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        {options.map(([val, text]) => (
          <button
            key={val || 'none'}
            type="button"
            role="radio"
            aria-checked={value === val}
            onClick={() => onChange(val)}
            className={cn(
              'focus-ring relative cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none',
              value === val ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {value === val && (
              <motion.span layoutId={pill} className="absolute inset-0 rounded-lg bg-accent-soft" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
            )}
            <span className="relative">{text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantPlayground() {
  const [intent, setIntent] = useState('soft')
  const [size, setSize] = useState('md')
  const [extra, setExtra] = useState('')
  const [disabled, setDisabled] = useState(false)
  const classes = button({ intent, size, className: extra })
  const usage = `<Button intent="${intent}" size="${size}"${extra ? ` className="${extra}"` : ''}${disabled ? ' disabled' : ''}>Publish</Button>`

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 @xl:grid-cols-2">
        <Chips label="intent" value={intent} onChange={setIntent} options={INTENTS.map((v) => [v, v])} />
        <Chips label="size" value={size} onChange={setSize} options={SIZES.map((v) => [v, v])} />
        <Chips label="className from the caller" value={extra} onChange={setExtra} options={CALLER_CLASSES} />
        <label className="flex w-fit cursor-pointer items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
            className="form-checkbox size-4 rounded border-line bg-surface text-sky-600 focus:ring-sky-600"
          />
          disabled
        </label>
      </div>

      <div className="grid min-h-20 place-items-center rounded-xl border border-line bg-surface p-4">
        <Button intent={intent} size={size} className={extra} disabled={disabled}>
          Publish
        </Button>
      </div>

      <div className="grid gap-1.5 text-xs">
        <code className="block rounded-lg bg-code-bg px-3 py-2 font-mono text-[12px] wrap-anywhere text-code-fg">{usage}</code>
        <AnimatePresence mode="wait" initial={false}>
          <motion.code
            key={classes}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="block rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[12px] leading-relaxed wrap-anywhere text-muted"
          >
            {classes}
          </motion.code>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Matrix() {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="text-xs tracking-wide text-muted uppercase">
            <th scope="col" className="px-3 py-2 font-semibold">
              intent
            </th>
            {SIZES.map((s) => (
              <th key={s} scope="col" className="px-3 py-2 font-mono font-semibold normal-case">
                size=&quot;{s}&quot;
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INTENTS.map((i) => (
            <tr key={i} className="border-t border-line">
              <th scope="row" className="px-3 py-3 font-mono text-xs font-medium">
                {i}
              </th>
              {SIZES.map((s) => (
                <td key={s} className="px-3 py-3">
                  <Button intent={i} size={s}>
                    Publish
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- 3. what tailwind-merge understands ---------- */

const CASES = [
  ['px-4 px-2', 'same property: the last one wins'],
  ['p-4 px-2', 'px refines p, so both stay'],
  ['px-2 p-4', 'p covers px, so px-2 is redundant'],
  ['text-ink text-sm', 'colour and size are different properties'],
  ['text-sm text-lg', 'two sizes'],
  ['bg-surface hover:bg-accent-soft bg-stage', 'variants are tracked separately'],
  ['bg-dots bg-surface', "a custom utility: stock tailwind-merge guesses wrong"],
]

function Result({ children, tone }) {
  return (
    <code
      className={cn(
        'block rounded-md px-2 py-1 font-mono text-[12px] leading-relaxed wrap-anywhere',
        tone === 'good' ? 'bg-emerald-500/10 text-ink' : 'bg-stage text-ink',
      )}
    >
      {children || ' '}
    </code>
  )
}

function MergeTable() {
  const rows = CASES.map(([input, why]) => ({ input, why, stock: twMerge(input), project: cn(input) }))
  const head = 'font-mono text-[10.5px] tracking-widest text-muted uppercase'
  return (
    <div className="@container grid gap-3">
      <div className="hidden gap-3 px-3 @xl:grid @xl:grid-cols-[1.1fr_1fr_1fr]">
        <span className={head}>Input</span>
        <span className={head}>tailwind-merge (stock)</span>
        <span className={head}>cn() in this app</span>
      </div>
      {rows.map((r) => (
        <div key={r.input} className="grid gap-2 rounded-xl border border-line bg-surface p-3 @xl:grid-cols-[1.1fr_1fr_1fr] @xl:items-start @xl:gap-3">
          <div className="grid gap-1">
            <Result>{r.input}</Result>
            <span className="text-xs text-muted">{r.why}</span>
          </div>
          <div className="grid gap-1">
            <span className={cn(head, '@xl:hidden')}>tailwind-merge (stock)</span>
            <Result>{r.stock}</Result>
          </div>
          <div className="grid gap-1">
            <span className={cn(head, '@xl:hidden')}>cn() in this app</span>
            <Result tone={r.stock !== r.project ? 'good' : undefined}>{r.project}</Result>
          </div>
        </div>
      ))}
    </div>
  )
}

function TryIt() {
  const id = useId()
  const [text, setText] = useState('px-2 py-1 px-4 text-sm text-lg bg-dots bg-surface')
  const out = useMemo(() => ({ concat: clsx(text), merged: cn(text) }), [text])
  return (
    <div className="grid gap-3">
      <label htmlFor={id} className="text-[13px] font-semibold">
        Type any classes
      </label>
      <textarea
        id={id}
        rows={2}
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="form-textarea block w-full rounded-lg border-line bg-surface px-3 py-2 font-mono text-[13px] text-ink focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <span className="font-mono text-[10.5px] tracking-widest text-muted uppercase">clsx only</span>
          <Result>{out.concat}</Result>
        </div>
        <div className="grid gap-1">
          <span className="font-mono text-[10.5px] tracking-widest text-muted uppercase">cn()</span>
          <Result tone="good">{out.merged}</Result>
        </div>
      </div>
    </div>
  )
}

/* ---------- the demo ---------- */

const MERGE_CODE = `import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

clsx('px-4 py-2', 'px-2')            // "px-4 py-2 px-2"   both survive: the stylesheet decides
twMerge(clsx('px-4 py-2', 'px-2'))   // "py-2 px-2"        one winner, in the string

// src/lib/cn.js
export const cn = (...inputs) => twMerge(clsx(inputs))`

const VARIANT_CODE = `const button = variants({
  base: 'inline-flex rounded-lg border border-transparent font-semibold …',
  variants: {
    intent: { solid: 'bg-sky-700 text-white …', outline: 'border-line bg-surface …' /* … */ },
    size:   { sm: 'px-3 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' },
  },
  defaults: { intent: 'solid', size: 'md' },
})

// base has border-transparent, outline has border-line: cn() keeps only the second
button({ intent: 'outline', size: 'sm', className: 'w-full' })`

const CN_SOURCE = `// src/lib/cn.js: tailwind-merge has to be told about custom utilities
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-dots': ['bg-dots', { 'bg-dots': [(value) => /^\\d+$/.test(value)] }],
      'focus-ring': ['focus-ring'],
    },
  },
})`

export default function VariantApiDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="why-merge"
        title="Class order does not decide the winner"
        since="core"
        parts={['px-4 px-2', 'cn()', 'clsx', 'tailwind-merge']}
        docs={{ href: 'https://tailwindcss.com/docs/styling-with-utility-classes#managing-style-conflicts', label: 'Managing style conflicts' }}
        description={
          <>
            <p>
              Two classes that set the same property are resolved by the order of their <em>rules in the stylesheet</em>. Tailwind writes those in its
              own order, so some overrides work by luck and others silently fail.
            </p>
            <p>
              <strong>Why it needs a build.</strong> <code>clsx</code> and <code>tailwind-merge</code> are npm packages imported into a component; a
              bundler wires them in. Pick an override and compare the measured result.
            </p>
          </>
        }
      >
        <Example title="clsx alone vs cn()" code={MERGE_CODE} lang="jsx" stageClassName="px-3 py-5 sm:px-5">
          <MergeVsConcat />
        </Example>
      </Feature>

      <Feature
        id="variants"
        title="A variant API for a button"
        since="core"
        parts={['variants({ intent, size })', 'border-transparent → border-line', 'disabled:opacity-50', 'className last']}
        description={
          <>
            <p>
              Tables of complete class strings, one per axis; the component picks one from each, then <code>cn()</code> resolves what clashes and lets
              the caller&apos;s <code>className</code> have the last word.
            </p>
            <p>
              The base has <code>border-transparent</code> and <code>outline</code> has <code>border-line</code>: without merging, both sit on the element.
            </p>
          </>
        }
      >
        <Example title="Playground" code={VARIANT_CODE} lang="jsx" stageClassName="px-3 py-5 sm:px-5">
          <div className="@container">
            <VariantPlayground />
          </div>
        </Example>
        <Example title="Every combination" stageClassName="px-3 py-5 sm:px-5">
          <Matrix />
        </Example>
      </Feature>

      <Feature
        id="conflict-groups"
        title="What tailwind-merge understands"
        since="core"
        parts={['extendTailwindMerge', 'classGroups', 'bg-dots']}
        description={
          <>
            <p>
              It maps every utility to a conflict group. Colours and sizes of <code>text-</code> are different groups; a variant keeps its own slot.
            </p>
            <p>
              Custom utilities are invisible to it. Stock tailwind-merge reads <code>bg-dots</code> as a background colour and drops it next to{' '}
              <code>bg-surface</code>; the app&apos;s <code>cn()</code> is told otherwise (green rows differ from stock).
            </p>
          </>
        }
      >
        <Example title="Same input, three functions" code={CN_SOURCE} lang="jsx" stageClassName="px-3 py-5 sm:px-5">
          <MergeTable />
        </Example>
        <Example title="Try your own" stageClassName="px-3 py-5 sm:px-5">
          <TryIt />
        </Example>
      </Feature>
    </div>
  )
}
