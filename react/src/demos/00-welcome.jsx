import { motion, stagger } from 'motion/react'
import pkg from '../../package.json'
import { Code } from '../components/Code'
import { Example } from '../components/Feature'

/*
 * The starter demo. Every file in src/demos/ follows this shape:
 *   export const meta = { id, title, group, order, summary, tailwind }
 *   export default function SomeDemo() { ... }
 * and is picked up automatically by App.jsx (import.meta.glob).
 */
export const meta = {
  id: 'welcome',
  title: 'Welcome',
  group: 'Start',
  order: 0,
  summary: 'A Motion-animated hero card, plus a tour of how this guide is built and how a new demo plugs in.',
  tailwind: [
    'bg-linear-to-br',
    'size-*',
    'inset-ring',
    'shadow-*/30',
    'bg-white/15',
    '@container',
    '@md:',
    'prose',
    'prose-code:before:content-none',
    'text-balance',
  ],
}

/* ---------- Motion variants: the card enters, then its children stagger in ---------- */
const card = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', duration: 0.7, bounce: 0.2, when: 'beforeChildren', delayChildren: stagger(0.08) },
  },
}
const part = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

const STACK = [
  ['React', pkg.dependencies.react],
  ['Vite', pkg.devDependencies.vite],
  ['Tailwind', pkg.devDependencies.tailwindcss],
  ['Motion', pkg.dependencies.motion],
]

function HeroCard() {
  return (
    <motion.section
      variants={card}
      initial="hidden"
      animate="show"
      className="relative isolate mx-auto max-w-3xl overflow-hidden rounded-3xl bg-linear-to-br from-sky-600 via-sky-700 to-indigo-800 p-6 text-white shadow-2xl shadow-sky-900/30 inset-ring inset-ring-white/20 sm:p-9"
    >
      {/* a slow glowing orb: Motion animates scale/opacity, Tailwind supplies size, blur and colour */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-white/25 blur-3xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.p variants={part} className="m-0 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-mono text-xs tracking-wide">
        <span className="size-1.5 rounded-full bg-lime-300" />
        Tailwind CSS v{pkg.devDependencies.tailwindcss} · Motion {pkg.dependencies.motion}
      </motion.p>
      <motion.h2 variants={part} className="mt-4 mb-0 font-display text-4xl leading-none font-bold tracking-tight text-balance sm:text-5xl">
        Utility CSS, now with a physics engine.
      </motion.h2>
      <motion.p variants={part} className="mt-4 mb-0 max-w-prose text-pretty text-sky-50">
        Every card, list and pointer reaction in this guide is a Tailwind v4 class on a Motion element: Tailwind for what it looks like, Motion for
        how it moves.
      </motion.p>
      <motion.ul variants={part} className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
        {STACK.map(([name, version]) => (
          <motion.li
            key={name}
            whileHover={{ y: -2 }}
            className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs backdrop-blur-sm inset-ring inset-ring-white/25"
          >
            {name} {version}
          </motion.li>
        ))}
      </motion.ul>
      <motion.div variants={part} className="mt-6 flex flex-wrap gap-3">
        <motion.a
          href="#/"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="focus-ring rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 no-underline shadow-lg shadow-sky-950/30"
        >
          Browse all demos
        </motion.a>
        <span className="self-center text-sm text-sky-100">Use Replay above to run the entrance again.</span>
      </motion.div>
    </motion.section>
  )
}

const CONTRACT = `// src/demos/20-my-feature.jsx
import { Feature, Example } from '../components/Feature'
import './20-my-feature.css' // optional: demo-only CSS lives next to the demo

export const meta = {
  id: 'my-feature',            // unique, URL-safe: shown as #/my-feature
  title: 'My feature',
  group: 'Layout',             // sidebar section
  order: 200,                  // sort key (lower first); groups rank by their lowest order
  summary: 'One sentence shown on the home view.',
  tailwind: ['grid-cols-subgrid', '@container'], // classes / features it shows
}

export default function MyFeature() {
  return (
    <Feature title="Subgrid" since="4.0" parts={['grid-cols-subgrid']}>
      <Example title="Aligned rows" code="<div class='grid grid-cols-subgrid'>…</div>">
        {/* live JSX here */}
      </Example>
    </Feature>
  )
}`

const BLOCKS = [
  ['1', '@import "tailwindcss"', 'Theme, preflight and utilities in one line; no tailwind.config.js.'],
  ['2', '@plugin', 'Loads typography (prose) and forms (class strategy) straight from CSS.'],
  ['3', '@source not', 'Keeps the README out of class-name scanning (v4.1).'],
  ['4', '@custom-variant dark', 'Hybrid dark mode: OS setting, or pinned by the theme menu.'],
  ['5-6', ':root vars + @theme inline', 'Semantic tokens that switch per theme, exposed as bg-surface, text-ink, border-line…'],
  ['7', '@theme', 'Static design values: font-display / font-sans / font-mono, radius-card.'],
  ['9', '@utility', 'bg-dots, bg-dots-*, focus-ring, prose-themed: real utilities that work with every variant.'],
]

export default function Welcome() {
  return (
    <div className="grid gap-6">
      <Example title="Hero card: Motion variants with staggered children" replay stageClassName="px-3 py-6 sm:px-6 sm:py-10">
        <HeroCard />
      </Example>

      <div className="@container grid gap-6">
        <article className="prose max-w-none rounded-card border border-line bg-surface p-5 prose-themed sm:p-6 prose-headings:font-display prose-headings:tracking-tight prose-a:no-underline prose-code:rounded-[5px] prose-code:bg-accent-soft prose-code:px-1 prose-code:py-px prose-code:font-mono prose-code:text-[0.85em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
          <h2>What you are looking at</h2>
          <p>
            This is the React edition of the Tailwind v4 Field Guide. It is a real Vite project: Tailwind runs as a build step through{' '}
            <code>@tailwindcss/vite</code>, animations come from <code>motion/react</code>, and every demo is a plain component in{' '}
            <code>src/demos/</code>.
          </p>
          <ol>
            <li>
              Pick a demo from the sidebar (or the menu on a phone). The <strong>Source</strong> panel under it is the demo&apos;s own file, loaded
              with <code>?raw</code>, so what you read is exactly what runs.
            </li>
            <li>
              Switch the theme menu between system, light and dark. Colours come from CSS variables bridged into Tailwind with{' '}
              <code>@theme inline</code>.
            </li>
            <li>
              Open <code>src/index.css</code>: it is the whole Tailwind configuration, one commented block per v4 directive.
            </li>
          </ol>
        </article>

        <section aria-labelledby="blocks-heading" className="overflow-hidden rounded-card border border-line">
          <h2 id="blocks-heading" className="m-0 border-b border-line bg-surface px-4 py-2.5 font-display text-base font-semibold">
            Where the v4 pieces live in <span className="font-mono text-sm font-medium">src/index.css</span>
          </h2>
          <div className="overflow-x-auto bg-surface">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-left text-xs tracking-wide text-muted uppercase">
                  <th className="px-3 py-2 font-semibold">Block</th>
                  <th className="px-3 py-2 font-semibold">Directive</th>
                  <th className="px-3 py-2 font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody>
                {BLOCKS.map(([n, directive, what]) => (
                  <tr key={directive} className="border-t border-line align-top">
                    <td className="px-3 py-2 font-mono text-muted">{n}</td>
                    <td className="px-3 py-2">
                      <code className="rounded-[5px] bg-accent-soft px-1.5 py-px font-mono text-[12.5px] whitespace-nowrap">{directive}</code>
                    </td>
                    <td className="px-3 py-2 min-w-64">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="contract-heading" className="grid gap-3 @3xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] @3xl:items-start">
          <div className="grid gap-2">
            <h2 id="contract-heading" className="m-0 font-display text-[22px] leading-tight font-semibold tracking-tight">
              Adding a demo
            </h2>
            <p className="m-0 text-pretty text-muted">
              Create one file in <code className="rounded-[5px] bg-accent-soft px-1 font-mono text-[12.5px]">src/demos/</code>. No registry to edit:
              the sidebar, home view, router and Source panel all pick it up. Start the filename with an underscore to keep a helper out of the
              registry.
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-card border border-line">
            <Code lang="jsx" label="src/demos/20-my-feature.jsx">
              {CONTRACT}
            </Code>
          </div>
        </section>
      </div>
    </div>
  )
}
