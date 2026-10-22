import { useState } from 'react'
import { cn } from '../lib/cn'
import { Code } from './Code'

/*
 * Optional layout kit for demos. The registry does not require it; a demo can
 * render anything. These three pieces give every demo the same "spec sheet"
 * look as the HTML edition (notes on the left, live examples on the right).
 *
 *   <Feature id="x" title="…" since="4.2" parts={['@container']} docs={{href, label}}
 *            description={<p>…</p>}>
 *     <Example title="…" code={`…`} lang="html" replay>
 *       …live JSX…
 *     </Example>
 *   </Feature>
 *
 * Layout is container-query driven (@container / @3xl:), so it adapts to the
 * space beside the sidebar instead of to the viewport width.
 */

// Full class strings, so the Tailwind scanner can see them.
const SINCE_STYLE = {
  core: 'text-muted',
  '4.0': 'text-v40',
  4.1: 'text-v41',
  4.2: 'text-v42',
  4.3: 'text-v43',
}

export function SinceBadge({ since = '4.0' }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border border-current px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide whitespace-nowrap',
        SINCE_STYLE[since] ?? SINCE_STYLE['4.0'],
      )}
    >
      {since === 'core' ? 'core' : `v${since}`}
    </span>
  )
}

export function Feature({ id, title, since, parts = [], docs, description, children, className }) {
  return (
    <article id={id} className={cn('@container scroll-mt-24 rounded-card border border-line bg-surface', className)}>
      <div className="grid gap-5 p-5 @3xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] @3xl:items-start @3xl:gap-6">
        <div className="grid min-w-0 gap-2.5 @3xl:sticky @3xl:top-20">
          <h2 className="font-display text-[22px] leading-tight font-semibold tracking-tight text-balance">{title}</h2>
          {since && <SinceBadge since={since} />}
          {description && (
            <div className="grid gap-2 text-pretty [&_a]:text-accent [&_code]:rounded-[5px] [&_code]:bg-accent-soft [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:wrap-anywhere [&_p]:m-0">
              {description}
            </div>
          )}
          {parts.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {parts.map((part) => (
                <li key={part}>
                  <code className="rounded-[5px] bg-accent-soft px-1.5 py-px font-mono text-[12px] wrap-anywhere">{part}</code>
                </li>
              ))}
            </ul>
          )}
          {docs && (
            <p className="m-0 text-[13px] text-muted">
              <a className="text-accent" href={docs.href} target="_blank" rel="noopener noreferrer">
                {docs.label ?? 'Docs'}
              </a>
            </p>
          )}
        </div>
        <div className="grid min-w-0 gap-4">{children}</div>
      </div>
    </article>
  )
}

/** The dotted-grid surface that holds live markup. */
export function Stage({ children, className }) {
  return <div className={cn('min-w-0 overflow-auto bg-stage bg-dots px-4 py-7 text-ink sm:px-5', className)}>{children}</div>
}

/**
 * One live example. `code` is optional: a string, or an array of
 * { lang, label, text } for several snippets (HTML + CSS, say).
 * `replay` adds a Replay button that remounts the children (handy for
 * enter animations).
 */
export function Example({ title, children, code, lang = 'html', replay = false, actions, stageClassName, className }) {
  const [run, setRun] = useState(0)
  const snippets = typeof code === 'string' ? [{ lang, text: code }] : (code ?? [])

  return (
    <figure className={cn('m-0 grid min-w-0 overflow-hidden rounded-card border border-line', className)}>
      <figcaption className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2 text-[13px] font-semibold">
        <span className="min-w-0">{title}</span>
        <span className="flex-1" />
        {actions}
        {replay && (
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-0.5 text-xs font-medium hover:border-accent"
          >
            Replay
          </button>
        )}
      </figcaption>
      <Stage className={stageClassName}>
        <div key={run} className="contents">
          {children}
        </div>
      </Stage>
      {snippets.map((s, i) => (
        <Code key={i} lang={s.lang ?? lang} label={s.label} className="border-t border-code-fg/15">
          {s.text}
        </Code>
      ))}
    </figure>
  )
}
