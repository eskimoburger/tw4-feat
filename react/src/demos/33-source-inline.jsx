import { useEffect, useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'
import './33-source-inline.css'
// The stylesheet's own text, for the listing at the bottom (`?raw` = the file as a string).
import cssSource from './33-source-inline.css?raw'

/*
 * @source inline(): safelisting class names that only exist at runtime.
 *
 * Every demo below builds class names from variables: `bg-${color}-${shade}`.
 * To Tailwind's scanner that is not a class, it is a template literal, so it
 * generates nothing for it. 33-source-inline.css lists the names it should
 * generate anyway, with brace expansion.
 *
 * Two details of how it is set up (the .css file explains why):
 *   - the classes carry a `dyn:` prefix, because this demo's stylesheet is a
 *     second Tailwind entry point and the prefix keeps its classes from
 *     colliding with the main stylesheet's. Your own safelist would not need it;
 *   - "does the stylesheet have it?" is answered by reading the real CSSOM,
 *     not by a hard-coded yes/no.
 */
export const meta = {
  id: 'source-inline',
  title: '@source inline() safelist',
  group: 'Build-step features',
  order: 303,
  summary: 'A colour picker that builds bg-${color}-${shade} at runtime only works because a brace-expanded @source inline() line tells the compiler those classes exist.',
  tailwind: ['@source inline()', '{hover:,}bg-{rose,sky}-{100..900..200}', 'brace expansion', 'source(none)', 'prefix(dyn)', 'dynamic class names'],
}

const PALETTES = ['rose', 'amber', 'emerald', 'sky', 'violet', 'slate']
const SHADES = [100, 300, 500, 700, 900]
const SAFELISTED = ['rose', 'violet', 'sky']
const NOT_SAFELISTED = ['fuchsia', 'cyan', 'lime']

/* ---------- reading the real stylesheet ---------- */

/** Every selector in every readable stylesheet, one big string. */
function indexSelectors() {
  const found = []
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.selectorText) found.push(rule.selectorText)
      if (rule.cssRules) walk(rule.cssRules)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules)
    } catch {
      // a cross-origin sheet (Google Fonts) cannot be read: skip it
    }
  }
  return found.join('\n')
}

function hasRule(index, className) {
  const selector = `.${CSS.escape(className)}`
  let from = 0
  for (;;) {
    const at = index.indexOf(selector, from)
    if (at === -1) return false
    const next = index[at + selector.length]
    // `.bg-rose-50` must not match `.bg-rose-500`, or `.bg-rose-500\/50`
    if (!next || !/[\w\\-]/.test(next)) return true
    from = at + 1
  }
}

function useRuleCheck() {
  const [index, setIndex] = useState(null)
  useEffect(() => setIndex(indexSelectors()), [])
  return (className) => (index === null ? null : hasRule(index, className))
}

function Verdict({ ok, className }) {
  if (ok === null) return null
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
        ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900',
      )}
    >
      <span aria-hidden="true">{ok ? '✓' : '✗'}</span>
      <span className="sr-only">{ok ? 'CSS exists for' : 'No CSS for'} {className}</span>
      {ok ? 'CSS found' : 'no CSS'}
    </span>
  )
}

/* ---------- 1. the picker ---------- */

function Picker() {
  const [color, setColor] = useState('rose')
  const [step, setStep] = useState(2)
  const check = useRuleCheck()
  const id = useId()
  const shade = SHADES[step]
  const live = `dyn:bg-${color}-${shade}`

  return (
    <div className="grid gap-5">
      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-semibold">Colour</legend>
        <div className="flex flex-wrap gap-2.5">
          {PALETTES.map((name) => {
            const active = name === color
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                aria-label={name}
                title={name}
                onClick={() => setColor(name)}
                className={cn(
                  'focus-ring size-9 cursor-pointer rounded-full ring-offset-2 ring-offset-surface transition-shadow motion-reduce:transition-none',
                  `dyn:bg-${name}-500`,
                  active ? 'ring-2 ring-ink' : 'hover:ring-2 hover:ring-line',
                )}
              />
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor={`${id}-shade`} className="flex items-baseline justify-between text-[13px] font-semibold">
          Shade <span className="font-mono text-xs font-medium text-muted">{shade}</span>
        </label>
        <input
          id={`${id}-shade`}
          type="range"
          min={0}
          max={SHADES.length - 1}
          step={1}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-full cursor-pointer accent-sky-600"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted" aria-hidden="true">
          {SHADES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      <div className={cn('grid min-h-32 content-end rounded-xl p-3 transition-colors duration-300 motion-reduce:transition-none', live)}>
        <p className="m-0 w-fit rounded-lg bg-surface/90 px-2.5 py-1 font-mono text-xs text-ink">{live}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['Paid', 'Pending', 'In review'].map((label) => (
          <button
            key={label}
            type="button"
            className={cn(
              'focus-ring cursor-pointer rounded-full px-3.5 py-1 text-sm font-semibold transition-colors motion-reduce:transition-none',
              `dyn:bg-${color}-100 dyn:text-${color}-900 dyn:hover:bg-${color}-300`,
            )}
          >
            {label}
          </button>
        ))}
        <span className="font-mono text-xs wrap-anywhere text-muted">dyn:bg-{'${color}'}-100 dyn:text-{'${color}'}-900 dyn:hover:bg-{'${color}'}-300</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Stylesheet has</span>
        <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[12.5px]">.{live}</code>
        <Verdict ok={check(live)} className={live} />
      </div>
    </div>
  )
}

/* ---------- 2. same code, different names ---------- */

function NameGroup({ title, names, note }) {
  const check = useRuleCheck()
  return (
    <div className="grid content-start gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="grid gap-0.5">
        <h3 className="m-0 text-[13px] font-semibold">{title}</h3>
        <p className="m-0 text-xs text-muted">{note}</p>
      </div>
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {names.map((name) => {
          const cls = `dyn:bg-${name}-700`
          const ok = check(cls)
          return (
            <li key={name} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span
                aria-hidden="true"
                className={cn('size-10 shrink-0 rounded-lg', cls, ok === false && 'border border-dashed border-muted')}
              />
              <span className="grid min-w-0 gap-1">
                <code className="font-mono text-xs wrap-anywhere">dyn:bg-{name}-700</code>
                <Verdict ok={ok} className={cls} />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------- 3. brace expansion playground ---------- */

const RANGE = /^(-?\d+)\.\.(-?\d+)(?:\.\.(\d+))?$/

function splitTop(text) {
  const parts = []
  let depth = 0
  let last = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') depth--
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(last, i))
      last = i + 1
    }
  }
  parts.push(text.slice(last))
  return parts
}

/** A small brace expander: {a,b}, nesting, and {start..end..step} number ranges. */
function expand(pattern, budget = { left: 400 }) {
  let depth = 0
  let start = -1
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (pattern[i] === '}' && depth > 0) {
      depth--
      if (depth === 0) {
        const inner = pattern.slice(start + 1, i)
        const pre = pattern.slice(0, start)
        const post = pattern.slice(i + 1)
        let options = splitTop(inner)
        const range = options.length === 1 && RANGE.exec(options[0])
        if (range) {
          const a = Number(range[1])
          const b = Number(range[2])
          const step = Math.max(1, Number(range[3] ?? 1))
          options = []
          for (let n = a; a <= b ? n <= b : n >= b; n += a <= b ? step : -step) {
            options.push(String(n))
            if (options.length > 500) break
          }
        }
        return options.flatMap((option) => expand(pre + option + post, budget))
      }
    }
  }
  if (budget.left-- <= 0) return []
  return [pattern]
}

const PRESETS = [
  ['dyn:{hover:,}bg-{rose,sky}-{100..900..200}', 'ranges + variants'],
  ['dyn:text-{emerald,fuchsia}-500', 'one colour is missing'],
  ['dyn:bg-slate-{50,100,150,200}', 'only some shades'],
]

function Playground() {
  const id = useId()
  const [pattern, setPattern] = useState(PRESETS[0][0])
  const check = useRuleCheck()
  const classes = useMemo(() => expand(pattern.trim()), [pattern])
  const found = classes.filter((c) => check(c)).length
  const shown = classes.slice(0, 48)

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor={id} className="text-[13px] font-semibold">
          Pattern for <code className="font-mono text-[12.5px]">@source inline(&quot;…&quot;)</code>
        </label>
        <input
          id={id}
          type="text"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="form-input block w-full rounded-lg border-line bg-surface px-3 py-2 font-mono text-[13px] text-ink focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESETS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPattern(value)}
              className="focus-ring cursor-pointer rounded-full border border-line bg-surface px-3 py-1 text-xs hover:border-accent"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="m-0 text-sm" aria-live="polite">
        <strong>{classes.length}</strong> {classes.length === 1 ? 'class' : 'classes'}, <strong>{found}</strong> already in this build&apos;s stylesheet.
      </p>

      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        <AnimatePresence initial={false}>
          {shown.map((cls) => {
            const ok = check(cls)
            return (
              <motion.li
                key={cls}
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.14 }}
                className={cn(
                  'rounded-md border px-2 py-0.5 font-mono text-[11.5px]',
                  ok ? 'border-emerald-600/40 bg-emerald-500/10 text-ink' : 'border-dashed border-muted text-muted',
                )}
              >
                {ok ? '✓ ' : '✗ '}
                {cls}
              </motion.li>
            )
          })}
        </AnimatePresence>
        {classes.length > shown.length && <li className="self-center text-xs text-muted">+{classes.length - shown.length} more</li>}
        {classes.length === 0 && <li className="text-sm text-muted">Nothing to expand: check the braces.</li>}
      </ul>
    </div>
  )
}

/* ---------- the demo ---------- */

const PICKER_CODE = [
  {
    lang: 'jsx',
    label: 'the component: a template literal',
    text: `const live = \`dyn:bg-\${color}-\${shade}\`   // "dyn:bg-rose-500" exists only at runtime

<div className={live}>…</div>
<button className={\`dyn:bg-\${color}-100 dyn:text-\${color}-900 dyn:hover:bg-\${color}-300\`}>Paid</button>`,
  },
  {
    lang: 'css',
    label: 'the safelist (33-source-inline.css)',
    text: `@source inline("dyn:{hover:,}bg-{rose,amber,emerald,sky,violet,slate}-{100..900..200}");
@source inline("dyn:text-{rose,amber,emerald,sky,violet,slate}-{100..900..200}");`,
  },
]

const GROUP_CODE = `// identical code for both lists
names.map((name) => <span className={\`dyn:bg-\${name}-700\`} />)

@source inline("dyn:…bg-{rose,amber,emerald,sky,violet,slate}-…")   // fuchsia, cyan, lime are not in it`

export default function SourceInlineDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="picker"
        title="A picker that builds class names"
        since="4.1"
        parts={['@source inline()', 'dyn:bg-${color}-${shade}', '{hover:,}', '{100..900..200}']}
        docs={{ href: 'https://tailwindcss.com/docs/detecting-classes-in-source-files#safelisting-specific-utilities', label: 'Safelisting in the docs' }}
        description={
          <>
            <p>
              Tailwind generates CSS only for class names it can read in your files. <code>{'bg-${color}-500'}</code> is an expression, not a class, so
              by itself it produces nothing.
            </p>
            <p>
              <strong>Why it needs a build.</strong> A bundler compiles the CSS before your code runs. The CDN script instead watches the live DOM and
              would generate the class the moment it appears, so the problem, and the fix, only exist in a build step.
            </p>
            <p>
              The line is expanded like a shell glob and lives in this demo&apos;s own small stylesheet, listed at the bottom. The <code>dyn:</code>{' '}
              prefix only exists because that stylesheet is a second entry point next to the app&apos;s: it keeps the two from clashing.
            </p>
          </>
        }
      >
        <Example title="Colour and shade, assembled at runtime" code={PICKER_CODE} stageClassName="px-3 py-5 sm:px-5">
          <Picker />
        </Example>
      </Feature>

      <Feature
        id="blind-spot"
        title="What the scanner cannot see"
        since="4.1"
        parts={['@source inline()', 'dyn:bg-${name}-700', 'prefix(dyn)']}
        description={
          <>
            <p>
              Left list: names the safelist mentions. Right list: the same line of code, but fuchsia, cyan and lime are not in the safelist, so no CSS
              exists for them and the swatch stays empty.
            </p>
            <p>
              The badges read the real stylesheet (the CSSOM), not a hard-coded answer. In an app without a safelist the same thing happens to every
              class that is only ever assembled from pieces.
            </p>
          </>
        }
      >
        <Example title="Same code, different names" code={GROUP_CODE} stageClassName="px-3 py-5 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <NameGroup title="In the safelist" names={SAFELISTED} note="Generated at build time." />
            <NameGroup title="Not in the safelist" names={NOT_SAFELISTED} note="Not in the @source inline list." />
          </div>
        </Example>
      </Feature>

      <Feature
        id="expansion"
        title="Brace expansion, live"
        since="4.1"
        parts={['{a,b}', '{start..end..step}', '{hover:,focus:,}', 'nested braces']}
        description={
          <p>
            The pattern is expanded before anything else happens, so one line can name hundreds of classes. Edit it to see the list and which of the
            results this build already contains. <code>{'{hover:,}'}</code> expands to an empty string and to <code>hover:</code>.
          </p>
        }
      >
        <Example title="Expand a pattern" stageClassName="px-3 py-5 sm:px-5">
          <Playground />
        </Example>

        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/demos/33-source-inline.css (imported with ?raw)" preClassName="max-h-[34rem]">
            {cssSource}
          </Code>
        </div>
      </Feature>
    </div>
  )
}
