import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, stagger } from 'motion/react'
import pkg from '../package.json'
import { cn } from './lib/cn'
import { useHashRoute } from './lib/useHashRoute'
import { THEMES, useTheme } from './lib/useTheme'
import { Code } from './components/Code'

/* ==========================================================================
   Demo registry: zero shared edits.
   --------------------------------------------------------------------------
   Every src/demos/*.jsx file is a demo. Drop a file in, it shows up in the
   sidebar, the home view and the router; nothing in this file changes.
   A leading underscore (src/demos/_helpers.jsx) opts a file out, and
   sub-folders are never matched, so helpers have somewhere to live.

   Two globs over the same files: the compiled modules, and their raw text
   (used by the "Source" panel, so the code on screen is the real file).
   ========================================================================== */
const modules = import.meta.glob(['./demos/*.jsx', '!./demos/_*.jsx'], { eager: true })
const sources = import.meta.glob(['./demos/*.jsx', '!./demos/_*.jsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const isRenderable = (c) => typeof c === 'function' || (typeof c === 'object' && c !== null && '$$typeof' in c)

function buildRegistry() {
  const demos = []
  const problems = []
  const seen = new Map()

  for (const path of Object.keys(modules).sort()) {
    const file = path.replace('./demos/', 'src/demos/')
    const { default: Demo, meta } = modules[path]
    const bad = (why) => problems.push(`${file}: ${why}`)

    if (!isRenderable(Demo)) bad('needs a default export (a React component)')
    else if (!meta || typeof meta !== 'object') bad('needs `export const meta = { id, title, group, order, summary, tailwind }`')
    else if (typeof meta.id !== 'string' || !/^[\w-]+$/.test(meta.id)) bad('meta.id must be a URL-safe string (letters, digits, - and _)')
    else if (typeof meta.title !== 'string' || !meta.title) bad('meta.title must be a non-empty string')
    else if (seen.has(meta.id)) bad(`meta.id "${meta.id}" is already used by ${seen.get(meta.id)}`)
    else {
      seen.set(meta.id, file)
      demos.push({
        id: meta.id,
        title: meta.title,
        group: meta.group || 'Demos',
        order: Number.isFinite(meta.order) ? meta.order : 1000,
        summary: meta.summary || '',
        tailwind: Array.isArray(meta.tailwind) ? meta.tailwind.map(String) : [],
        Component: Demo,
        source: sources[path] ?? '',
        file,
      })
    }
  }

  demos.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file))

  // groups are ranked by their lowest-order demo, so "Start" (order 0) comes first
  const byGroup = new Map()
  for (const d of demos) {
    if (!byGroup.has(d.group)) byGroup.set(d.group, [])
    byGroup.get(d.group).push(d)
  }
  const groups = [...byGroup].map(([name, list]) => ({ name, demos: list }))
  groups.sort((a, b) => a.demos[0].order - b.demos[0].order || a.name.localeCompare(b.name))

  problems.forEach((p) => console.warn(`[demo registry] ${p}`))
  return { demos, groups, problems, byId: new Map(demos.map((d) => [d.id, d])) }
}

const registry = buildRegistry()

const TAILWIND_VERSION = pkg.devDependencies.tailwindcss

/* ==========================================================================
   Navigation
   ========================================================================== */
function NavLink({ href, active, onNavigate, children }) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring relative block rounded-lg px-2.5 py-1.5 text-sm text-muted no-underline transition-colors hover:text-ink',
        active && 'font-medium text-ink',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-accent-soft"
          transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
        />
      )}
      <span className="relative">{children}</span>
    </a>
  )
}

function NavList({ groups, activeId, scope, onNavigate }) {
  return (
    <LayoutGroup id={scope}>
      <nav aria-label="Demos" className="grid gap-5">
        <NavLink href="#/" active={activeId === ''} onNavigate={onNavigate}>
          Overview
        </NavLink>
        {groups.map((group) => (
          <div key={group.name} className="grid gap-1">
            <h2 className="m-0 px-2.5 font-mono text-[11px] font-medium tracking-widest text-muted uppercase">{group.name}</h2>
            <ul className="m-0 grid list-none gap-0.5 p-0">
              {group.demos.map((d) => (
                <li key={d.id}>
                  <NavLink href={`#/${d.id}`} active={activeId === d.id} onNavigate={onNavigate}>
                    {d.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  )
}

function ThemeMenu({ theme, setTheme }) {
  return (
    <>
      <label htmlFor="sc-theme-select" className="sr-only">
        Colour theme
      </label>
      <select
        id="sc-theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="form-select focus-ring max-w-full min-w-0 cursor-pointer rounded-lg border-line bg-surface py-1.5 pr-8 pl-2.5 text-[13px] text-ink focus:border-accent focus:ring-0"
      >
        {THEMES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </>
  )
}

function TopBar({ theme, setTheme, menuOpen, setMenuOpen, groups, activeId }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md motion-reduce:backdrop-blur-none">
      <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <a
          href="#/"
          className="focus-ring inline-flex items-baseline gap-2 rounded font-display text-[17px] font-bold tracking-tight text-ink no-underline"
        >
          <span>
            Tailwind v4<span className="hidden sm:inline"> Field Guide</span>
          </span>
          <small className="hidden font-mono text-[11px] font-medium tracking-wider text-muted sm:inline">React · v{TAILWIND_VERSION}</small>
        </a>
        <span className="flex-1" />
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className="focus-ring cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-accent lg:hidden"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <ThemeMenu theme={theme} setTheme={setTheme} />

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-surface p-3 shadow-xl lg:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <NavList groups={groups} activeId={activeId} scope="mobile" onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

/* ==========================================================================
   Pieces shared by the views
   ========================================================================== */
function Chips({ items, max }) {
  if (!items.length) return null
  const shown = max ? items.slice(0, max) : items
  const rest = items.length - shown.length
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {shown.map((item) => (
        <li key={item}>
          <code className="rounded-[5px] bg-accent-soft px-1.5 py-px font-mono text-[12px] wrap-anywhere">{item}</code>
        </li>
      ))}
      {rest > 0 && <li className="self-center text-xs text-muted">+{rest} more</li>}
    </ul>
  )
}

class DemoBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    console.error(`[demo ${this.props.demoId}]`, error)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="rounded-card border border-red-500/40 bg-red-500/10 p-4">
        <p className="m-0 font-semibold text-red-700 dark:text-red-300">This demo crashed while rendering.</p>
        <pre className="mt-2 mb-0 overflow-auto font-mono text-xs whitespace-pre-wrap text-ink">
          {String(this.state.error?.message ?? this.state.error)}
        </pre>
      </div>
    )
  }
}

function SourcePanel({ demo }) {
  const lines = demo.source ? demo.source.trimEnd().split('\n').length : 0
  return (
    <section aria-labelledby="source-heading" className="overflow-hidden rounded-card border border-line">
      <div className="flex flex-wrap items-baseline gap-x-3 border-b border-line bg-surface px-4 py-2.5">
        <h2 id="source-heading" className="m-0 font-display text-base font-semibold">
          Source
        </h2>
        <span className="font-mono text-xs text-muted">
          {demo.file} · {lines} lines
        </span>
      </div>
      <Code lang="jsx" label="jsx" preClassName="max-h-[42rem]">
        {demo.source}
      </Code>
    </section>
  )
}

function PrevNext({ prev, next }) {
  const link =
    'focus-ring grid min-w-0 gap-0.5 rounded-card border border-line bg-surface px-4 py-3 text-ink no-underline transition-colors hover:border-accent'
  return (
    <nav aria-label="Previous and next demo" className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <a href={`#/${prev.id}`} className={link}>
          <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Previous</span>
          <span className="truncate font-medium">{prev.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={`#/${next.id}`} className={cn(link, 'sm:text-right')}>
          <span className="font-mono text-[11px] tracking-widest text-muted uppercase">Next</span>
          <span className="truncate font-medium">{next.title}</span>
        </a>
      )}
    </nav>
  )
}

/* ==========================================================================
   Views
   ========================================================================== */
// Motion 14: delayChildren: stagger() replaces the deprecated staggerChildren
const listVariants = { hidden: {}, show: { transition: { delayChildren: stagger(0.04) } } }
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5, bounce: 0.12 } },
}

function Home() {
  const { demos, groups, problems } = registry
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const visible = useMemo(() => {
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        demos: g.demos.filter((d) => [d.title, d.summary, d.group, d.tailwind.join(' ')].join(' ').toLowerCase().includes(q)),
      }))
      .filter((g) => g.demos.length)
  }, [groups, q])
  const count = visible.reduce((n, g) => n + g.demos.length, 0)

  return (
    <div className="grid gap-8">
      <header className="grid max-w-[72ch] gap-3">
        <p className="m-0 font-mono text-xs tracking-widest text-muted uppercase">
          React edition · Tailwind v{TAILWIND_VERSION} · Motion {pkg.dependencies.motion}
        </p>
        <h1 className="m-0 font-display text-[clamp(30px,5vw,48px)] leading-[1.05] font-bold tracking-[-0.025em] text-balance">
          Tailwind v4 Field Guide
        </h1>
        <p className="m-0 text-[17px] text-pretty text-muted">
          Tailwind CSS v4 features, each built as a live React component, animated with Motion and shown next to its real source. Pick a demo, read the
          code, change it, watch it update.
        </p>
      </header>

      {problems.length > 0 && (
        <aside role="status" className="rounded-card border border-v42/40 bg-v42/10 p-4 text-sm">
          <p className="m-0 font-semibold text-v42">{problems.length} demo file(s) were skipped:</p>
          <ul className="mt-2 mb-0 grid gap-1 pl-5 font-mono text-xs">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="demo-filter" className="sr-only">
          Filter demos
        </label>
        <input
          id="demo-filter"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by title or feature, e.g. container"
          className="form-input focus-ring w-full max-w-md rounded-lg border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:ring-0"
        />
        <p className="m-0 text-sm text-muted" aria-live="polite">
          {count} of {demos.length} demos
        </p>
      </div>

      {demos.length === 0 && <p className="text-muted">No demos yet. Add a file to src/demos/ and it appears here.</p>}
      {demos.length > 0 && count === 0 && <p className="text-muted">Nothing matches "{query}".</p>}

      {visible.map((group) => (
        <section key={group.name} aria-labelledby={`group-${group.name}`} className="grid gap-3">
          <h2 id={`group-${group.name}`} className="m-0 font-display text-xl font-semibold tracking-tight">
            {group.name}
          </h2>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3"
          >
            {group.demos.map((d) => (
              <motion.li key={d.id} variants={itemVariants} className="min-w-0">
                <motion.a
                  href={`#/${d.id}`}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  className="focus-ring grid h-full content-start gap-2 rounded-card border border-line bg-surface p-4 text-ink no-underline transition-colors hover:border-accent"
                >
                  <span className="font-display text-[17px] leading-snug font-semibold tracking-tight">{d.title}</span>
                  {d.summary && <span className="text-sm text-pretty text-muted">{d.summary}</span>}
                  <Chips items={d.tailwind} max={4} />
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      ))}
    </div>
  )
}

function DemoView({ demo }) {
  const { demos } = registry
  const index = demos.indexOf(demo)
  const Demo = demo.Component
  return (
    <div className="grid gap-6">
      <header className="grid max-w-[72ch] gap-3">
        <p className="m-0 font-mono text-xs tracking-widest text-muted uppercase">
          {demo.group} · {String(index + 1).padStart(2, '0')}
        </p>
        <h1 className="m-0 font-display text-[clamp(30px,5vw,48px)] leading-[1.05] font-bold tracking-[-0.025em] text-balance">{demo.title}</h1>
        {demo.summary && <p className="m-0 text-[17px] text-pretty text-muted">{demo.summary}</p>}
        <Chips items={demo.tailwind} />
      </header>
      <DemoBoundary demoId={demo.id}>
        <Demo />
      </DemoBoundary>
      <SourcePanel demo={demo} />
      <PrevNext prev={demos[index - 1]} next={demos[index + 1]} />
    </div>
  )
}

function NotFound({ id }) {
  return (
    <div className="grid max-w-[72ch] gap-3">
      <h1 className="m-0 font-display text-4xl font-bold tracking-tight">No demo called "{id}"</h1>
      <p className="m-0 text-muted">
        The address is a hash route (<code className="rounded-[5px] bg-accent-soft px-1 font-mono text-sm">#/demo-id</code>) and nothing in src/demos/
        has that id.
      </p>
      <p className="m-0">
        <a href="#/" className="text-accent">
          Back to the overview
        </a>
      </p>
    </div>
  )
}

/* ==========================================================================
   App shell
   ========================================================================== */
export default function App() {
  const route = useHashRoute()
  const [theme, setTheme] = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef(null)
  const sideRef = useRef(null)
  const firstRoute = useRef(true)
  const demo = route ? registry.byId.get(route) : null
  const activeId = demo ? demo.id : ''

  // on navigation: close the mobile menu, retitle, reset scroll, move focus to <main>
  useEffect(() => {
    setMenuOpen(false)
    document.title = demo ? `${demo.title} · Tailwind v4 Field Guide` : 'Tailwind v4 Field Guide · React'
    window.scrollTo(0, 0)
    if (firstRoute.current) firstRoute.current = false
    else mainRef.current?.focus({ preventScroll: true })

    // the sidebar scrolls on its own: keep the current demo's link inside it
    const side = sideRef.current
    const link = side?.querySelector('[aria-current="page"]')
    if (side && link) {
      const box = side.getBoundingClientRect()
      const at = link.getBoundingClientRect()
      if (at.top < box.top) side.scrollTop -= box.top - at.top + 12
      else if (at.bottom > box.bottom) side.scrollTop += at.bottom - box.bottom + 12
    }
  }, [route, demo])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    // reducedMotion="user": every Motion animation below honours the OS setting
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <button
          type="button"
          onClick={() => mainRef.current?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-surface"
        >
          Skip to content
        </button>
        <TopBar theme={theme} setTheme={setTheme} menuOpen={menuOpen} setMenuOpen={setMenuOpen} groups={registry.groups} activeId={activeId} />
        <div className="mx-auto grid w-full max-w-[1320px] flex-1 gap-8 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div ref={sideRef} className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-8 pr-2">
              <NavList groups={registry.groups} activeId={activeId} scope="side" />
            </div>
          </aside>
          <main ref={mainRef} tabIndex={-1} className="min-w-0 py-8 pb-16 outline-none">
            {/* opacity only: a transform here would trap position:fixed/sticky inside demos */}
            <motion.div key={route} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {route === '' ? <Home /> : demo ? <DemoView demo={demo} /> : <NotFound id={route} />}
            </motion.div>
          </main>
        </div>
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-x-4 gap-y-1 py-5 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] text-sm text-muted">
            <span>Tailwind v4 Field Guide · React edition</span>
            <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-accent">
              Official Tailwind docs
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
