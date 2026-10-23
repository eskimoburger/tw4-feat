import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { Code } from '../components/Code'
import { Example, Feature } from '../components/Feature'
import { cn } from '../lib/cn'

/*
 * @tailwindcss/typography: the `prose` class family.
 *
 * `prose` styles HTML you do not control (Markdown output, CMS fields, a
 * changelog) without a single class on the <h2>, <ul>, <blockquote> or <pre>
 * inside it. The plugin is registered once in src/index.css:
 *
 *     @plugin "@tailwindcss/typography";
 *
 * `@plugin` resolves an npm package and runs its JavaScript inside Tailwind's
 * compiler. That needs module resolution, so it only works in a build step
 * (Vite here); the CDN script has no way to load a plugin.
 *
 * Below, one article is rendered by two sets of controls: palette + size, and
 * element modifiers (prose-headings:, prose-a:, prose-code:before: ...).
 * Every class is written out in full inside a lookup table, never assembled
 * from pieces, so the scanner can see it.
 */
export const meta = {
  id: 'typography-plugin',
  title: 'Typography plugin',
  group: 'Build-step features',
  order: 300,
  summary: 'The prose class styles untouched article HTML. Switch palettes and sizes, invert it in dark mode, and restyle single tags with prose-a: and prose-headings:.',
  tailwind: [
    '@plugin "@tailwindcss/typography"',
    'prose',
    'prose-slate',
    'prose-lg',
    'dark:prose-invert',
    'prose-headings:',
    'prose-a:',
    'hover:prose-a:underline',
    'prose-code:before:content-none',
    'not-prose',
  ],
}

/* ---------- lookup tables of complete class strings ---------- */

const SIZES = [
  ['sm', 'prose-sm'],
  ['base', 'prose-base'],
  ['lg', 'prose-lg'],
]

const GRAYS = [
  ['slate', 'prose-slate'],
  ['zinc', 'prose-zinc'],
  ['stone', 'prose-stone'],
  ['neutral', 'prose-neutral'],
]

const STYLES = {
  plain: {
    label: 'Plain',
    note: 'No element modifiers: the plugin defaults, inverted in dark mode.',
    classes: 'prose-slate dark:prose-invert',
  },
  tokens: {
    label: 'Project tokens',
    note: 'prose-themed (a @utility in src/index.css) points the plugin variables at the theme tokens, so no dark:prose-invert is needed.',
    classes: 'prose-themed',
  },
  editorial: {
    label: 'Editorial',
    note: 'Display headings, balanced paragraphs, links underlined only on hover, an accent rule on quotes.',
    classes:
      'prose-slate dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-balance prose-p:text-pretty prose-a:font-semibold prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-sky-300 prose-blockquote:border-s-4 prose-blockquote:border-sky-500 prose-blockquote:font-display prose-blockquote:font-medium prose-blockquote:not-italic prose-strong:font-bold',
  },
  docs: {
    label: 'Docs',
    note: 'Ruled h2s, pill-shaped inline code (the backtick quotes removed with before:content-none), a dark code block (with the pill style switched off inside it), a tidy table.',
    classes:
      'prose-slate dark:prose-invert prose-h2:border-b prose-h2:border-line prose-h2:pb-2 prose-h2:font-display prose-h3:font-display prose-a:text-sky-700 dark:prose-a:text-sky-300 prose-code:rounded-md prose-code:bg-accent-soft prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none [&_pre_code]:rounded-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 prose-pre:rounded-xl prose-pre:bg-code-bg prose-th:text-left prose-th:font-display prose-thead:border-line prose-tr:border-line',
  },
}

const STYLE_OPTIONS = Object.entries(STYLES).map(([key, s]) => [key, s.label])

/* ---------- the content: plain HTML, not one class on any tag ---------- */

function ReleaseNotes() {
  return (
    <>
      <h2>Release notes people actually read</h2>
      <p className="lead">
        Most readers have thirty seconds and one question: does this change what I do on Monday? Write the first line for them, and everything below it
        for the few who need the detail.
      </p>

      <h3>Lead with the change, not the ticket</h3>
      <p>
        Say what a reader can now do, then link to the work. Compare <strong>&ldquo;Fixed PLAT-4821&rdquo;</strong> with{' '}
        <strong>&ldquo;Invoices export to CSV again&rdquo;</strong>; only one of them answers the question. The{' '}
        <a href="https://keepachangelog.com/en/1.1.0/" target="_blank" rel="noopener noreferrer">
          Keep a Changelog
        </a>{' '}
        convention is a good starting point.
      </p>
      <ul>
        <li>One sentence per change, in the past tense.</li>
        <li>
          Group by what the reader can do: <code>Added</code>, <code>Changed</code>, <code>Fixed</code>.
        </li>
        <li>Put anything that needs action, such as a migration, at the very top.</li>
      </ul>

      <blockquote>
        <p>If a note needs the ticket to make sense, the note is not finished.</p>
      </blockquote>

      <div className="not-prose my-6 flex items-start gap-3 rounded-xl border border-line bg-stage p-4 text-sm text-ink">
        <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-surface">
          i
        </span>
        <p className="m-0">
          This box lives inside the article but opts out with <code className="rounded bg-accent-soft px-1 font-mono text-[12.5px]">not-prose</code>,
          so none of the typography rules reach it.
        </p>
      </div>

      <h3>A template that holds up</h3>
      <p>
        Keep the shape identical from release to release; readers learn where to look. A minimal version, with the migration step first:
      </p>
      <pre>
        <code>{`## 2.4.0 · 12 March
> Action needed: run \`npm run migrate\` before deploying.

### Added
- CSV export on the invoices page.

### Fixed
- Totals no longer drop the last line item.`}</code>
      </pre>

      <h3>Who reads which section</h3>
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Reader</th>
            <th>Length</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Summary line</td>
            <td>Everyone</td>
            <td>1 sentence</td>
          </tr>
          <tr>
            <td>Migration</td>
            <td>Engineers</td>
            <td>Steps</td>
          </tr>
          <tr>
            <td>Details</td>
            <td>Support</td>
            <td>Short list</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

/* ---------- small controls ---------- */

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

function Labelled({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </div>
  )
}

const PAGE = 'rounded-xl border border-line bg-surface p-5 sm:p-8'

const INDEX_CSS = `@import "tailwindcss";

/* typography: adds prose, prose-sm … prose-2xl, prose-slate …, prose-invert */
@plugin "@tailwindcss/typography";

/* project utility that aims the plugin's variables at our theme tokens */
@utility prose-themed {
  --tw-prose-body: var(--ink);
  --tw-prose-headings: var(--ink);
  --tw-prose-links: var(--accent);
  /* … */
}`

/* ---------- the demo ---------- */

export default function TypographyDemo() {
  const [size, setSize] = useState('base')
  const [gray, setGray] = useState('slate')
  const [style, setStyle] = useState('editorial')

  const sizeClass = SIZES.find(([k]) => k === size)[1]
  const grayClass = GRAYS.find(([k]) => k === gray)[1]
  const current = STYLES[style]

  return (
    <div className="grid gap-6">
      <Feature
        id="prose"
        title="prose: style HTML you did not write"
        since="4.0"
        parts={['prose', 'prose-slate', 'prose-lg', 'dark:prose-invert', 'max-w-none']}
        docs={{ href: 'https://github.com/tailwindlabs/tailwindcss-typography#readme', label: 'Typography plugin readme' }}
        description={
          <>
            <p>
              Add <code>prose</code> to the wrapper and every heading, list, quote, table and code block inside it gets considered type and spacing.
            </p>
            <p>
              <strong>Why it needs a build.</strong> <code>@plugin</code> loads an npm package and runs its JavaScript while Tailwind compiles. The CDN
              pages cannot resolve packages, so they have no prose class at all.
            </p>
          </>
        }
      >
        <Example
          title="Palette and size"
          stageClassName="px-3 py-5 sm:px-5"
          code={`<article class="prose ${grayClass} ${sizeClass} max-w-none dark:prose-invert">\n  <h2>…</h2>  <p>…</p>  <ul>…</ul>  <pre>…</pre>\n</article>`}
          actions={
            <span className="text-xs font-normal text-muted">
              {gray} · {size}
            </span>
          }
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Labelled label="Gray scale">
                <Segmented label="Gray scale" value={gray} onChange={setGray} options={GRAYS.map(([k]) => [k, k])} />
              </Labelled>
              <Labelled label="Size">
                <Segmented label="Size" value={size} onChange={setSize} options={SIZES.map(([k]) => [k, k])} />
              </Labelled>
            </div>
            <div className={PAGE}>
              <article className={cn('prose max-w-none dark:prose-invert', grayClass, sizeClass)}>
                <ReleaseNotes />
              </article>
            </div>
          </div>
        </Example>
      </Feature>

      <Feature
        id="element-modifiers"
        title="Element modifiers: restyle one tag"
        since="4.0"
        parts={['prose-headings:', 'prose-a:', 'prose-code:', 'prose-h2:', 'hover:prose-a:underline', 'prose-code:before:content-none']}
        description={
          <>
            <p>
              Each tag inside <code>prose</code> has a variant: <code>prose-a:</code>, <code>prose-h2:</code>, <code>prose-code:</code>,{' '}
              <code>prose-pre:</code>, and the group <code>prose-headings:</code>. They stack with other variants, so{' '}
              <code>hover:prose-a:underline</code> and <code>dark:prose-a:text-sky-300</code> both work.
            </p>
            <p>
              Pseudo-elements chain on too: <code>prose-code:before:content-none</code> removes the decorative backticks.
            </p>
          </>
        }
      >
        <Example
          title="Four styles, one article"
          stageClassName="px-3 py-5 sm:px-5"
          code={[{ lang: 'html', label: 'classes on <article>', text: `<article class="prose ${current.classes.split(' ').join('\n  ')}">` }]}
        >
          <div className="grid gap-4">
            <Labelled label="Style">
              <Segmented label="Article style" value={style} onChange={setStyle} options={STYLE_OPTIONS} />
            </Labelled>
            <p className="m-0 max-w-prose text-sm text-pretty text-muted" aria-live="polite">
              {current.note}
            </p>
            <div className={PAGE}>
              <article className={cn('prose max-w-none', current.classes)}>
                <ReleaseNotes />
              </article>
            </div>
          </div>
        </Example>

        <div className="overflow-hidden rounded-card border border-line">
          <Code lang="css" label="src/index.css (the one-time setup)">
            {INDEX_CSS}
          </Code>
        </div>
      </Feature>
    </div>
  )
}
