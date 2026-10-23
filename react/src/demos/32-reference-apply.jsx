import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'
import './32-reference-apply.css'
// The stylesheet's own text, for the listing at the bottom. `?raw` returns the file
// as a string and skips CSS processing, so what you read is what the build compiled.
import cssSource from './32-reference-apply.css?raw'

/*
 * Plain-CSS components with @reference, @apply and @variant.
 *
 * Not every piece of UI wants to be a long class list. A design-system button,
 * a prose-like callout or third-party markup you cannot add classes to is
 * easier to style as a named class in a stylesheet. Tailwind v4 lets that
 * stylesheet use the project's theme, tokens, variants and utilities:
 *
 *   @reference "../index.css";      look things up, emit nothing
 *   @apply px-4 py-2 rounded-lg;    inline any utilities
 *   @variant hover { ... }          wrap any block in any variant
 *
 * The CSS lives in 32-reference-apply.css next to this file (listed below).
 */
export const meta = {
  id: 'reference-apply',
  title: '@reference, @apply and @variant',
  group: 'Build-step features',
  order: 302,
  summary: 'Style named components in a plain CSS file that borrows the app theme: @reference imports nothing twice, @apply inlines utilities, @variant adds hover and dark.',
  tailwind: ['@reference', '@apply', '@variant hover', '@variant dark', '@variant focus-visible', '@variant motion-reduce', '@layer components', 'border-s-*', 'bg-v43/10'],
}

const TONES = [
  ['info', 'Info'],
  ['success', 'Success'],
  ['warning', 'Warning'],
  ['danger', 'Danger'],
]

const COPY = {
  info: ['Your export is queued', 'Large workspaces take a few minutes. We will email a download link when it is ready.'],
  success: ['Payment received', 'Invoice INV-2041 was paid in full. A receipt is on its way to billing@northwind.example.'],
  warning: ['Card expires next month', 'Update the payment method before 1 April to avoid an interruption to your plan.'],
  danger: ['Deploy failed on step 3', 'The migration timed out after 90 seconds. The previous release is still serving traffic.'],
}

function Segmented({ label, value, onChange, options }) {
  const pill = useId()
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map(([val, text]) => {
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(val)}
            className={cn(
              'focus-ring relative cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span layoutId={pill} className="absolute inset-0 rounded-lg bg-accent-soft" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />
            )}
            <span className="relative">{text}</span>
          </button>
        )
      })}
    </div>
  )
}

/* The callout component as markup: no utility classes at all. */
function Callout({ tone, children }) {
  const [title, body] = COPY[tone]
  return (
    <div className="ra-callout" data-tone={tone} role="note">
      <h3 className="ra-callout__title">{title}</h3>
      <p className="ra-callout__body">{body}</p>
      {children}
    </div>
  )
}

function CalloutExample() {
  const [tone, setTone] = useState('warning')
  return (
    <div className="grid gap-4">
      <Segmented label="Tone" value={tone} onChange={setTone} options={TONES} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tone} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
          <Callout tone={tone}>
            <p className="m-0 text-[13px]">
              <a className="ra-callout__link" href="https://tailwindcss.com/docs/functions-and-directives#reference-directive" target="_blank" rel="noopener noreferrer">
                Read the @reference docs
              </a>
            </p>
          </Callout>
        </motion.div>
      </AnimatePresence>
      <div className="grid gap-2 sm:grid-cols-2">
        {TONES.map(([key]) => (
          <div key={key} className="ra-callout" data-tone={key}>
            <span className="font-mono text-xs text-muted">data-tone=&quot;{key}&quot;</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ButtonExample() {
  const [disabled, setDisabled] = useState(false)
  const variants = [
    ['primary', 'Save draft'],
    ['outline', 'Cancel'],
    ['danger', 'Delete project'],
  ]
  return (
    <div className="grid gap-5">
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} className="form-checkbox size-4 rounded border-line bg-surface text-sky-600 focus:ring-sky-600" />
        Disable all buttons
      </label>
      {['sm', undefined, 'lg'].map((size) => (
        <div key={size ?? 'md'} className="grid gap-2">
          <span className="font-mono text-[11px] tracking-widest text-muted uppercase">{size ? `data-size="${size}"` : 'default size'}</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {variants.map(([variant, label]) => (
              <button key={variant} type="button" disabled={disabled} data-size={size} className={`ra-btn ra-btn--${variant}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="m-0 text-xs text-muted">Hover, press, tab to focus: each state is a @variant block in the stylesheet.</p>
    </div>
  )
}

function LayerExample() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-2">
        <span className="font-mono text-[11px] tracking-widest text-muted uppercase">.ra-callout</span>
        <div className="ra-callout" data-tone="info">
          <p className="ra-callout__body m-0">Padding comes from the component class (p-4).</p>
        </div>
      </div>
      <div className="grid gap-2">
        <span className="font-mono text-[11px] tracking-widest text-muted uppercase">.ra-callout + p-8 rounded-3xl</span>
        <div className="ra-callout rounded-3xl p-8" data-tone="info">
          <p className="ra-callout__body m-0">Utilities in markup win, because the component sits in @layer components.</p>
        </div>
      </div>
    </div>
  )
}

const MARKUP = `<div class="ra-callout" data-tone="warning" role="note">
  <h3 class="ra-callout__title">Card expires next month</h3>
  <p class="ra-callout__body">Update the payment method before 1 April…</p>
</div>`

const BUTTON_MARKUP = `<button class="ra-btn ra-btn--primary">Save draft</button>
<button class="ra-btn ra-btn--outline" data-size="sm">Cancel</button>
<button class="ra-btn ra-btn--danger" data-size="lg" disabled>Delete project</button>`

const LAYER_MARKUP = `<div class="ra-callout" data-tone="info">…</div>
<div class="ra-callout rounded-3xl p-8" data-tone="info">…</div>

/* both rules exist; the second wins because utilities > components */`

export default function ReferenceApplyDemo() {
  return (
    <div className="grid gap-6">
      <Feature
        id="callout"
        title="A component class that reads the theme"
        since="4.0"
        parts={['@reference', '@apply', '@variant dark', 'border-s-v43', 'bg-v43/10']}
        docs={{ href: 'https://tailwindcss.com/docs/functions-and-directives#reference-directive', label: '@reference in the docs' }}
        description={
          <>
            <p>
              <code>@apply</code> and <code>@variant</code> are compiler instructions, not CSS. In a standalone file they only work if Tailwind can find
              the theme and your custom variants, which is what <code>@reference &quot;../index.css&quot;</code> does.
            </p>
            <p>
              <strong>Why it needs a build.</strong> Tailwind expands every <code>@apply</code> and <code>@variant</code> while bundling and writes plain
              CSS. The CDN script only processes a <code>&lt;style type=&quot;text/tailwindcss&quot;&gt;</code> block inline.
            </p>
          </>
        }
      >
        <Example title="Callout: four tones from one class" code={MARKUP} stageClassName="px-3 py-5 sm:px-5">
          <CalloutExample />
        </Example>
      </Feature>

      <Feature
        id="button"
        title="States with @variant"
        since="4.0"
        parts={['@variant hover', '@variant active', '@variant disabled', '@variant motion-reduce', '-translate-y-px']}
        description={
          <p>
            Inside a rule, <code>@variant hover {'{ … }'}</code> wraps whatever is in it with that variant, including <code>focus-visible</code>,{' '}
            <code>disabled</code> and <code>motion-reduce</code>. The markup stays one word long.
          </p>
        }
      >
        <Example title="Button family: three looks, three sizes" code={BUTTON_MARKUP} stageClassName="px-3 py-5 sm:px-5">
          <ButtonExample />
        </Example>
      </Feature>

      <Feature
        id="layers"
        title="Why the component sits in @layer components"
        since="4.0"
        parts={['@layer components', 'p-8', 'rounded-3xl']}
        description={
          <p>
            Rules outside any <code>@layer</code> beat every layered rule, utilities included, so <code>p-8</code> could never override them. Putting
            components in <code>@layer components</code> keeps the usual order: base, components, then utilities.
          </p>
        }
      >
        <Example title="The same callout, with and without a utility override" code={LAYER_MARKUP} stageClassName="px-3 py-5 sm:px-5">
          <LayerExample />
        </Example>

        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/demos/32-reference-apply.css (imported with ?raw)" preClassName="max-h-[34rem]">
            {cssSource}
          </Code>
        </div>
      </Feature>
    </div>
  )
}
