import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/cn'

/*
 * <Code> shows a source listing with light syntax colouring and a copy button.
 * The App uses it for every demo's "Source" panel; demos can use it too, to
 * print a CSS / HTML snippet under a live example:
 *
 *   <Code lang="css" label="CSS">{`@theme { --color-brand: oklch(0.6 0.2 250); }`}</Code>
 *
 * The colouring is a ~40-line scanner, not a real parser: every character is
 * emitted either as a token or as plain text, so a wrong guess can only change
 * a colour, never the text you copy.
 */

const JS_KEYWORDS =
  'import|export|default|from|as|const|let|var|function|return|if|else|for|of|in|while|new|typeof|async|await|true|false|null|undefined|class|extends'

const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y
const RULES = {
  jsx: [
    ['com', /\/\*[\s\S]*?\*\/|(?<!:)\/\/[^\n]*/y],
    ['str', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y],
    ['tag', /<\/?[A-Za-z][\w.]*/y],
    ['kw', new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'y')],
    ['attr', /[A-Za-z_][\w-]*(?==)/y],
    ['num', /(?<![\w.-])\d[\d_]*(?:\.\d+)?/y],
  ],
  css: [
    ['com', /\/\*[\s\S]*?\*\//y],
    ['str', STRING],
    ['at', /@[\w-]+/y],
    ['var', /--[\w-]+/y],
    ['num', /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|%|ms|s|deg|vh|vw|dvh|svh|fr)?/y],
  ],
  html: [
    ['com', /<!--[\s\S]*?-->/y],
    ['str', STRING],
    ['tag', /<\/?[A-Za-z][\w-]*/y],
    ['attr', /[:@A-Za-z_][\w:.@-]*(?==)/y],
  ],
  text: [],
}
RULES.js = RULES.jsx
RULES.tsx = RULES.jsx
RULES.ts = RULES.jsx

// Full class strings (not built dynamically) so Tailwind's scanner finds them.
const TOKEN_CLASS = {
  com: 'text-code-comment italic',
  str: 'text-code-str',
  tag: 'text-code-tag',
  attr: 'text-code-attr',
  at: 'text-code-attr',
  var: 'text-code-variant',
  kw: 'text-code-variant',
  num: 'text-code-variant',
}

function tokenize(source, lang) {
  const rules = RULES[lang] ?? RULES.text
  const out = []
  let plain = ''
  let i = 0
  while (i < source.length) {
    let hit = null
    for (const [type, re] of rules) {
      re.lastIndex = i
      const m = re.exec(source)
      if (m && m[0].length > 0) {
        hit = [type, m[0]]
        break
      }
    }
    if (hit) {
      if (plain) out.push([null, plain])
      plain = ''
      out.push(hit)
      i += hit[1].length
    } else {
      plain += source[i]
      i += 1
    }
  }
  if (plain) out.push([null, plain])
  return out
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // clipboard API blocked (insecure context, iframe policy…): fall back
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export function CopyButton({ text, className }) {
  const [state, setState] = useState('idle') // idle | copied | failed
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function onClick() {
    const ok = await copyText(text)
    setState(ok ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 1800)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'focus-ring cursor-pointer rounded-md border border-code-fg/20 bg-code-fg/10 px-2 py-1 font-sans text-[11px] leading-none font-medium tracking-normal text-code-fg normal-case transition-colors hover:bg-code-fg/20',
          className,
        )}
      >
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Copied to clipboard' : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </>
  )
}

export function Code({ children, lang = 'jsx', label, className, preClassName }) {
  const source = typeof children === 'string' ? children.replace(/^\n|\s+$/g, '') : String(children ?? '')
  const tokens = useMemo(() => tokenize(source, lang), [source, lang])

  return (
    <div className={cn('min-w-0 overflow-hidden bg-code-bg text-code-fg', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-code-fg/15 py-2 pr-2 pl-4">
        <span className="min-w-0 truncate font-mono text-[10.5px] tracking-widest text-code-comment uppercase">{label ?? lang}</span>
        <CopyButton text={source} />
      </div>
      <pre
        tabIndex={0}
        aria-label={`${label ?? lang} listing`}
        className={cn(
          'focus-ring m-0 overflow-auto p-4 font-mono text-[12.5px] leading-[1.65] tab-2 wrap-anywhere whitespace-pre-wrap',
          preClassName,
        )}
      >
        <code>
          {tokens.map(([type, text], i) =>
            type ? (
              <span key={i} className={TOKEN_CLASS[type]}>
                {text}
              </span>
            ) : (
              text
            ),
          )}
        </code>
      </pre>
    </div>
  )
}
