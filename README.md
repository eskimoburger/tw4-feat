# Tailwind v4 Field Guide

Every feature of Tailwind CSS v4, from v4.0 through v4.3.3, with live examples
and the exact code behind them. Motion gets two full pages plus a React app
built with the [Motion](https://motion.dev) library.

There are two ways to look at it:

| Folder | What it is | How to open it |
| --- | --- | --- |
| [`html/`](html/) | 15 standalone pages plus an overview, using the official `@tailwindcss/browser@4.3.3` build. No install, no build step. | Open `html/index.html` in a browser, or run `npx serve html` |
| [`react/`](react/) | Vite 8 + React 19 + `@tailwindcss/vite` + Motion 14. Covers what needs a real build (`@plugin`, `@reference`, `@source inline()`) and Motion's layout, gesture and scroll animations. | `cd react && npm install && npm run dev` (see [react/README.md](react/README.md)) |

The HTML pages load Tailwind and Google Fonts from a CDN, so they need an
internet connection the first time you open them.

## Pages

| # | Page | Covers |
| --- | --- | --- |
| 01 | [Setup & engine](html/01-setup.html) | Vite, PostCSS, CLI, CDN and webpack setup; `@import "tailwindcss"`; content detection; `@source`, `@source not`, `@source inline()`; prefixes; layers; v4 class syntax such as `bg-(--brand)` and `flex!` |
| 02 | [Theme variables](html/02-theme.html) | `@theme` and every namespace; the single `--spacing` scale; OKLCH palette including mauve, olive, mist and taupe (4.2); breakpoints; fonts |
| 03 | [Directives & functions](html/03-directives.html) | `@utility` with `--value()`, `--modifier()` and `--default()` (4.3); `@variant` (stacked and compound in 4.3); `@custom-variant`; `@apply`; `@reference`; `@plugin`; `@config`; `--alpha()`, `--spacing()`, `--theme()` |
| 04 | [Container queries](html/04-container-queries.html) | `@container`, `@sm:` to `@7xl:`, `@max-*`, ranges, named containers, container units, `@container-size` (4.3) |
| 05 | [Selector variants](html/05-selector-variants.html) | `not-*`, `in-*`, `nth-*`, `has-*`, named `group`/`peer`, `*:` and `**:`, `data-*`, `aria-*`, `supports-*`, pseudo-elements, arbitrary variants |
| 06 | [Environment & form variants](html/06-environment-variants.html) | `user-valid`/`user-invalid`, `open:` on details, dialog and popover, `details-content`, `inert`, `pointer-*`, `motion-*`, `contrast-*`, `forced-colors`, `print`, `noscript` |
| 07 | [Motion: transitions](html/07-motion-transitions.html) | Durations and easing (including `linear()` springs), `transition-discrete`, `starting:` entry animations, dialogs, popovers, accordions, micro-interactions, staggered transitions |
| 08 | [Motion: keyframes & scroll](html/08-motion-keyframes.html) | Built-in and custom `@keyframes`, animation controls, `@property` animations, scroll-driven animations, View Transitions, SVG and text effects |
| 09 | [3D transforms](html/09-3d-transforms.html) | `rotate-x/y/z`, `perspective-*`, `transform-3d`, `backface-hidden`, `translate-z`, flip cards, cubes, pointer tilt |
| 10 | [Gradients](html/10-gradients.html) | `bg-linear-45`, interpolation modifiers like `/oklch`, `bg-radial`, `bg-conic`, colour stops, gradient text, borders, animated gradients |
| 11 | [Shadows, masks & effects](html/11-effects.html) | Shadow scale, `inset-shadow-*`, `inset-ring-*`, `text-shadow-*`, coloured `drop-shadow`, `mask-*`, filters, blend modes, `color-scheme` |
| 12 | [Dark mode & theming](html/12-dark-mode.html) | Media, class and data-attribute strategies; light/dark/system toggle; semantic tokens with `@theme inline`; multi-theme switching; `light-dark()` |
| 13 | [Text, forms & layout](html/13-text-layout.html) | `field-sizing`, `wrap-break-word`, `font-stretch`, `font-features-*`, `items-baseline-last`, safe alignment, logical properties (4.2), sizing, grids, forms |
| 14 | [Scrollbars, zoom & tabs](html/14-v43-utilities.html) | `scrollbar-*` width, colours and gutter, `zoom-*`, `tab-*`, and the 4.3.x patch additions |
| 15 | [Upgrading from v3](html/15-migration.html) | `npx @tailwindcss/upgrade`, renamed and removed utilities, behaviour changes with before/after demos |

Each feature card shows a version badge: `core` for features that predate v4,
or the release that first shipped it (`v4.0`, `v4.1`, `v4.2`, `v4.3`). The
overview page can filter features by release, so "what's new in 4.3" is one
click.

## How the pages are built

- `html/assets/showcase.css` and `html/assets/showcase.js` hold the page frame:
  navigation, theme and pause-animation controls, copy and replay buttons.
  They style only `sc-*` classes, so every class inside a demo is plain
  Tailwind.
- The HTML listing under each example is generated from the live demo's own
  markup, so the code you copy is the code that runs.
- Page-specific Tailwind CSS (`@theme`, `@utility`, `@custom-variant`,
  `@keyframes`) sits in each page's `<style type="text/tailwindcss">` and is
  also printed next to the example that uses it.
- `html/_template.html` is the starting point for a new page.

## How it was checked

- Content comes from the official Tailwind docs, release posts and CHANGELOG
  (tailwindlabs/tailwindcss and tailwindlabs/tailwindcss.com), plus community
  examples found by web search.
- Every page was loaded in headless Chromium with Tailwind 4.3.3, at desktop
  width in light and dark and at 390px. The checks looked for console errors,
  horizontal overflow, and any class that produced no CSS (a typo or a class
  that doesn't exist in v4.3.3).
- A second reviewer re-checked each page against the docs and CHANGELOG for
  class names, version badges, docs links and whether each demo really shows
  its feature.
- The React app builds with `npm run build`, and each demo was exercised in
  headless Chromium.

Browser support follows Tailwind v4 itself: Safari 16.4+, Chrome 111+ and
Firefox 128+. Cards that rely on newer CSS (`@starting-style`, scroll-driven
animations, `interpolate-size`, `field-sizing`, `::details-content`) say so.
