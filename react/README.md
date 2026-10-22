# Tailwind v4 Field Guide: React edition

Tailwind CSS v4 features as live React components, animated with Motion, each
shown next to its real source. It is the build-step companion to the
no-build HTML pages in `../html`, and shares their visual language (cool mist
neutrals, sky accent, Bricolage Grotesque / IBM Plex).

## Run it

```bash
npm install        # exact, pinned versions (see package.json)
npm run dev        # Vite dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

Node 20.19+ or 22.12+ is required (Vite 8). `dist/` uses relative URLs and
hash routing, so it works from any folder or static host with no server
rewrites.

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
- A demo's own CSS starts with `@reference "../index.css";` so `@apply` and the tokens work without duplicating Tailwind.
- Routes use the URL hash, so do not use `#anchor` links inside a demo.
- A broken demo never takes the app down: invalid `meta` is listed on the home view, and a render error is caught and shown in place.

## Demos

The in-app **Overview** lists every demo and can filter by title or by the
Tailwind classes each one shows. That list is generated, so it is always
current. At the time of writing:

| Demo    | Group | What it shows                                                                                           |
| ------- | ----- | ------------------------------------------------------------------------------------------------------- |
| Welcome | Start | A hero card entering with Motion variants and staggered children, plus a tour of this project and the demo contract |
