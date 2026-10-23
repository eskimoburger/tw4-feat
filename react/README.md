# Tailwind v4 Field Guide: React edition

Tailwind CSS v4 features as live React components, animated with Motion, each
shown next to its real source. It is the build-step companion to the
no-build HTML pages in `../html`, and shares their visual language (cool mist
neutrals, sky accent, Bricolage Grotesque / IBM Plex).

## Run it

```bash
npm install        # exact, pinned versions (see package.json)
npm run dev        # Vite dev server with hot reload   -> http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve dist/ locally               -> http://localhost:4173
```

Node 20.19+ or 22.12+ is required (Vite 8). `dist/` uses relative URLs and
hash routing, so any static host or folder works with no server rewrites
(for example `https://example.com/field-guide/`). It does have to be *served*:
opening `dist/index.html` by double-click (`file://`) shows a blank page,
because browsers block module scripts there. Use `npm run preview` or any
static file server. (The no-build pages in `../html` do open from disk, given network access for their CDN script.)

The build prints a "chunks are larger than 500 kB" notice: every demo and its
`?raw` source ship in one JavaScript file (about 1.1 MB, 307 kB gzipped) so the
overview can list them all without a loading step. It is a notice, not an
error.

## Stack (pinned)

| Package                  | Version | Role                                         |
| ------------------------ | ------- | -------------------------------------------- |
| vite                     | 8.2.4   | dev server and bundler                       |
| @vitejs/plugin-react     | 6.1.2   | JSX transform and Fast Refresh               |
| react / react-dom        | 19.3.0  | UI                                           |
| tailwindcss              | 4.3.3   | styling                                      |
| @tailwindcss/vite        | 4.3.3   | Tailwind as a Vite plugin (no PostCSS step)  |
| @tailwindcss/typography  | 0.5.20  | `prose` classes                              |
| @tailwindcss/forms       | 0.5.11  | `form-*` classes (class strategy)            |
| motion                   | 14.0.0  | animation (`import { motion } from "motion/react"`) |
| clsx, tailwind-merge     | 2.1.1, 3.7.0 | the `cn()` helper in `src/lib/cn.js`    |

Plain JavaScript and JSX; there is no TypeScript.

## How it is laid out

```
index.html               font links, pre-paint theme script
vite.config.js           react() + tailwindcss() plugins, base: './'
src/
  main.jsx               React entry
  App.jsx                demo registry, hash router, sidebar/menu, home view, Source panel
  index.css              the whole Tailwind v4 setup (no tailwind.config.js)
  lib/cn.js              clsx + tailwind-merge helper (knows our custom utilities)
  lib/useTheme.js        system / light / dark, saved in localStorage
  lib/useHashRoute.js    "#/demo-id" routing
  components/Code.jsx    highlighted listing with a copy button
  components/Feature.jsx optional spec-sheet layout kit: Feature, Example, Stage
  demos/                 one file per demo; add a file and it appears
```

### `src/index.css`

Read it top to bottom; each block has a comment header.

1. `@import "tailwindcss"`: the engine
2. `@plugin`: typography and forms (`strategy: "class"`)
3. `@source not`: keeps this README out of class scanning
4. `@custom-variant dark`: hybrid dark mode (OS setting, or pinned by the theme menu via `data-theme` on `<html>`)
5. `:root` / `[data-theme]` variables: semantic tokens that switch per theme
6. `@theme inline`: bridges the tokens into utilities (`bg-surface`, `text-ink`, `border-line` ...)
7. `@theme`: fonts (`font-display`, `font-sans`, `font-mono`) and `rounded-card`
8. `@layer base`: page defaults with `@apply`
9. `@utility`: `bg-dots`, `bg-dots-*`, `focus-ring`, `prose-themed`

Demo-specific CSS never goes in this file.

## Adding a demo

Create `src/demos/<NN>-<name>.jsx`. The registry in `App.jsx` finds it with
`import.meta.glob`, so there is nothing else to edit: the sidebar, the home
view, the router and the Source panel (the file's own text, loaded with
`?raw`) all update.

```jsx
import { Feature, Example } from '../components/Feature'
import './20-my-feature.css' // optional, demo-only CSS next to the demo

export const meta = {
  id: 'my-feature', // unique and URL-safe: the page is #/my-feature
  title: 'My feature',
  group: 'Layout', // sidebar section
  order: 200, // lower first; groups rank by their lowest order
  summary: 'One sentence for the home view.',
  tailwind: ['grid-cols-subgrid', '@container'], // classes / features it shows
}

export default function MyFeature() {
  return (
    <Feature title="Subgrid" since="4.0" parts={['grid-cols-subgrid']}>
      <Example title="Aligned rows">{/* live JSX */}</Example>
    </Feature>
  )
}
```

Rules:

- A file starting with `_` (for example `_shared.jsx`) is not a demo. Sub-folders are not scanned either.
- A demo's own CSS starts with `@reference "../index.css";` so `@apply` and the tokens work without duplicating Tailwind. (The one exception is `33-source-inline.css`: `@source inline()` needs a real entry point that emits CSS, and its header comment explains why.)
- Routes use the URL hash, so do not use `#anchor` links inside a demo.
- A broken demo never takes the app down: invalid `meta` is listed on the home view, and a render error is caught and shown in place.

## Demos

25 demos in four groups. The in-app **Overview** (`#/`) lists them from each
file's `meta` and can filter by title or by the Tailwind classes a demo shows,
so it is always current; this table was generated from the same `meta` blocks.
Every demo page ends with a **Source** panel holding the demo's own file
verbatim, with a Copy button.

| # | Route | Demo | Group | File | What it shows |
| -- | ----- | ---- | ----- | ---- | ------------- |
| 1 | `#/welcome` | Welcome | Start | `00-welcome.jsx` | A Motion-animated hero card, plus a tour of how this guide is built and how a new demo plugs in. |
| 2 | `#/state-variants` | State-driven transitions | Tailwind motion in React | `10-state-variants.jsx` | React flips one attribute (aria-expanded, aria-checked or data-state); Tailwind variants on that attribute do all of the animating. |
| 3 | `#/starting-style` | Entry animations with starting: | Tailwind motion in React | `11-starting-style.jsx` | Elements React mounts (toasts, inbox rows, swapped panels) animate in from @starting-style, and out through a data-leaving flag. |
| 4 | `#/transition-discrete` | Show and hide with transition-discrete | Tailwind motion in React | `12-transition-discrete.jsx` | Fade out of display:none, animate a native dialog, drawer and popover sheet: transition-discrete plus starting:open: and no unmount timers. |
| 5 | `#/stagger-list` | Staggered lists with CSS variables | Tailwind motion in React | `13-stagger-list.jsx` | Each item gets style={{ "--i": index }} and delay-[calc(var(--i)*60ms)]: open and close menus, replayable grids, word reveals and sibling-index(). |
| 6 | `#/sliding-tabs` | Tabs with a sliding indicator | Tailwind motion in React | `14-sliding-tabs.jsx` | The active tab is a CSS variable: the indicator slides with translate-x-[calc(var(--tab)*100%)], or with measured --x and --w for tabs of unequal width. |
| 7 | `#/flip-card` | 3D flip cards | Tailwind motion in React | `15-flip-card.jsx` | perspective, transform-3d, rotate-y-180 and backface-hidden: a state-driven card flip, a flashcard deck with two axes, and a staggered flip-all grid. |
| 8 | `#/container-widget` | Container-query dashboard widgets | Tailwind motion in React | `16-container-widget.jsx` | A KPI widget, a size-container gauge and nested named containers, each inside a panel you can resize to watch @md:, @container-size and cqmin react. |
| 9 | `#/motion-gestures` | Gestures: hover, tap and focus | Motion library + Tailwind | `20-motion-gestures.jsx` | whileHover, whileTap and whileFocus on Tailwind-styled buttons, cards and inputs. Plain hover: and transition utilities are enough for colour and simple transforms; reach for Motion when a press needs spring physics or a parent hover must drive its children. |
| 10 | `#/motion-presence` | AnimatePresence: modal, toasts, steps | Motion library + Tailwind | `21-motion-presence.jsx` | AnimatePresence keeps a removed element mounted until its exit animation ends: a modal, a toast stack and a step wizard. Tailwind v4 can animate things in with starting:, but only Motion can animate them out of the DOM. |
| 11 | `#/motion-shared-layout` | Shared layout: layoutId | Motion library + Tailwind | `22-motion-shared-layout.jsx` | Give two elements the same layoutId and Motion glides one into the other: a tab underline, a billing pill and a card that grows into its detail view. CSS transitions cannot move an element between two places in the DOM, so this is where Motion earns its keep. |
| 12 | `#/motion-layout-grid` | Layout reflow: filter, sort, expand | Motion library + Tailwind | `23-motion-layout-grid.jsx` | Add the layout prop and siblings glide to their new slots when a grid is filtered, a list is re-sorted or an accordion opens. A CSS transition cannot animate a change in grid position, so use Motion for reflow; for a single height change, plain Tailwind is enough. |
| 13 | `#/motion-reorder` | Reorder: drag to sort | Motion library + Tailwind | `24-motion-reorder.jsx` | Reorder.Group and Reorder.Item turn a state array into a drag-to-sort list: a handle-driven task queue and a wrapping filter bar. Use Motion when sorting is a gesture; a native sortable library or plain buttons are fine when it is only a settings form. |
| 14 | `#/motion-drag` | Drag: constraints, elastic and snap | Motion library + Tailwind | `25-motion-drag.jsx` | drag, dragConstraints, dragElastic and dragSnapToOrigin on Tailwind-styled elements: a constrained box, a slide-to-confirm control and swipe-to-archive rows. CSS has no pointer-driven movement at all, so any draggable UI is a job for Motion. |
| 15 | `#/motion-scroll` | Scroll-linked: progress and parallax | Motion library + Tailwind | `26-motion-scroll.jsx` | useScroll feeds a reading-progress bar, a parallax hero and a carousel indicator, all reading a scroll container instead of the page. Tailwind already covers snap points and sticky headers; use Motion when a value must follow the scroll position. |
| 16 | `#/motion-inview-stagger` | whileInView: staggered reveals | Motion library + Tailwind | `27-motion-inview-stagger.jsx` | whileInView plus variants and stagger() reveal content as it scrolls into view: grouped lists, a grid that ripples from any origin and a timeline. Tailwind's starting: variant can fade something in on mount, but only Motion knows when an element enters the viewport. |
| 17 | `#/motion-spring-counter` | useSpring: animated numbers | Motion library + Tailwind | `28-motion-spring-counter.jsx` | useSpring turns a changing number into a physical one: KPI tiles that count up on scroll, a live price that eases between values and progress rings with three different springs. CSS can transition a custom property but cannot format or round it, so numbers are Motion territory. |
| 18 | `#/motion-springs-keyframes` | Springs, tweens and keyframes | Motion library + Tailwind | `29-motion-springs-keyframes.jsx` | Race springs against tweens, interrupt them mid-flight, play keyframe sequences with custom times and tune a spring against its own curve. Tailwind's animate-* utilities are enough for a spinner or a ping; reach for Motion when timing, interruption or choreography matters. |
| 19 | `#/typography-plugin` | Typography plugin | Build-step features | `30-typography.jsx` | The prose class styles untouched article HTML. Switch palettes and sizes, invert it in dark mode, and restyle single tags with prose-a: and prose-headings:. |
| 20 | `#/forms-plugin` | Forms plugin (class strategy) | Build-step features | `31-forms.jsx` | form-input, form-select, form-checkbox and friends give native controls a clean, utility-friendly baseline, only where you ask for it. |
| 21 | `#/reference-apply` | @reference, @apply and @variant | Build-step features | `32-reference-apply.jsx` | Style named components in a plain CSS file that borrows the app theme: @reference imports nothing twice, @apply inlines utilities, @variant adds hover and dark. |
| 22 | `#/source-inline` | @source inline() safelist | Build-step features | `33-source-inline.jsx` | A colour picker that builds bg-${color}-${shade} at runtime only works because a brace-expanded @source inline() line tells the compiler those classes exist. |
| 23 | `#/variant-api` | Variant API with cn() and tailwind-merge | Build-step features | `34-variant-api.jsx` | Why px-4 followed by px-2 is a bug in plain CSS, how tailwind-merge resolves it, and a typed-feeling variant function for buttons. |
| 24 | `#/runtime-theming` | Runtime theming with CSS variables | Build-step features | `35-runtime-theming.jsx` | A brand colour picker and a live --spacing density slider: React writes custom properties, @theme inline tokens and spacing utilities follow. |
| 25 | `#/functional-utility` | Functional @utility with --value() | Build-step features | `36-functional-utility.jsx` | Define auto-grid-*, text-stroke-* and glow-* once in CSS, then use auto-grid-56/6 or hover:glow-24/accent like any built-in class. |

Groups, in sidebar order:

- **Start**: the welcome page and how the project is wired.
- **Tailwind motion in React**: what Tailwind alone can animate (state
  variants, `starting:`, `transition-discrete`, CSS-variable staggers, 3D
  transforms, container queries), with React only flipping an attribute.
- **Motion library + Tailwind**: where plain CSS stops and Motion 14 takes over
  (gestures, `AnimatePresence`, `layoutId`, `Reorder`, drag, scroll-linked
  values, `whileInView`, `useSpring`, springs and keyframes).
- **Build-step features**: what only a bundler gives you (`@plugin`, `@reference`
  and `@apply`, `@source inline()`, `cn()` with tailwind-merge, runtime theming,
  functional `@utility`).
