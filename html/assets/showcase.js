// Showcase behaviour shared by every demo page: top bar + footer navigation,
// the feature index, source listings generated from the live demos, syntax
// colouring, copy buttons, replay buttons, theme and motion toggles.
// None of it is needed for the Tailwind examples themselves to work.
;(function () {
  'use strict'

  const PAGES = [
    ['index.html', 'Overview'],
    ['01-setup.html', 'Setup & engine'],
    ['02-theme.html', 'Theme variables'],
    ['03-directives.html', 'Directives & functions'],
    ['04-container-queries.html', 'Container queries'],
    ['05-selector-variants.html', 'Selector variants'],
    ['06-environment-variants.html', 'Environment & form variants'],
    ['07-motion-transitions.html', 'Motion: transitions'],
    ['08-motion-keyframes.html', 'Motion: keyframes & scroll'],
    ['09-3d-transforms.html', '3D transforms'],
    ['10-gradients.html', 'Gradients'],
    ['11-effects.html', 'Shadows, masks & effects'],
    ['12-dark-mode.html', 'Dark mode & theming'],
    ['13-text-layout.html', 'Text, forms & layout'],
    ['14-v43-utilities.html', 'Scrollbars, zoom & tabs'],
    ['15-migration.html', 'Upgrading from v3'],
  ]
  window.SC_PAGES = PAGES

  const root = document.documentElement
  const here = location.pathname.split('/').pop() || 'index.html'
  const idx = Math.max(
    0,
    PAGES.findIndex(([f]) => f === here),
  )

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k)
      } catch {
        return null
      }
    },
    set(k, v) {
      try {
        v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v)
      } catch {}
    },
  }

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'text') n.textContent = v
      else n.setAttribute(k, v)
    }
    for (const kid of kids) n.append(kid)
    return n
  }

  // ---------- theme + motion preferences ----------
  function applyTheme(v) {
    if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v)
    else root.removeAttribute('data-theme')
  }
  const savedTheme = store.get('sc-theme')
  if (savedTheme) applyTheme(savedTheme)
  if (store.get('sc-motion') === 'paused') root.setAttribute('data-motion', 'paused')

  // ---------- top bar ----------
  function buildTop() {
    const host = document.querySelector('[data-sc-nav]')
    if (!host) return
    const inner = el('div', { class: 'sc-top-inner' })
    const brand = el('a', { class: 'sc-brand', href: 'index.html' }, 'Tailwind v4 Field Guide', el('small', { text: 'v4.3.3' }))

    const pick = el('select', { id: 'sc-page', 'aria-label': 'Jump to page' })
    PAGES.forEach(([f, t], i) => {
      const o = el('option', { value: f, text: (i ? String(i).padStart(2, '0') + ' · ' : '') + t })
      if (i === idx) o.selected = true
      pick.append(o)
    })
    pick.addEventListener('change', () => (location.href = pick.value))

    const theme = el('select', { id: 'sc-theme', 'aria-label': 'Colour theme' })
    for (const [v, t] of [
      ['system', 'Theme: system'],
      ['light', 'Theme: light'],
      ['dark', 'Theme: dark'],
    ])
      theme.append(el('option', { value: v, text: t }))
    theme.value = root.getAttribute('data-theme') || 'system'
    theme.addEventListener('change', () => {
      applyTheme(theme.value)
      store.set('sc-theme', theme.value === 'system' ? null : theme.value)
    })

    const motion = el('button', {
      class: 'sc-btn',
      id: 'sc-motion',
      type: 'button',
      'aria-pressed': String(root.getAttribute('data-motion') === 'paused'),
      text: 'Pause animations',
    })
    motion.addEventListener('click', () => {
      const paused = root.getAttribute('data-motion') !== 'paused'
      paused ? root.setAttribute('data-motion', 'paused') : root.removeAttribute('data-motion')
      motion.setAttribute('aria-pressed', String(paused))
      store.set('sc-motion', paused ? 'paused' : null)
    })

    inner.append(brand, el('span', { class: 'sc-spacer' }), pick, theme, motion)
    host.classList.add('sc-top')
    host.replaceChildren(inner)
  }

  // ---------- footer prev / next ----------
  function buildFoot() {
    const host = document.querySelector('[data-sc-foot]')
    if (!host) return
    const inner = el('div', { class: 'sc-foot-inner' })
    const prev = PAGES[idx - 1]
    const next = PAGES[idx + 1]
    inner.append(
      prev ? el('a', { href: prev[0], text: '← ' + prev[1] }) : el('span'),
      el('a', {
        href: 'https://tailwindcss.com/docs',
        target: '_blank',
        rel: 'noopener',
        text: 'Official docs ↗',
      }),
      next ? el('a', { href: next[0], text: next[1] + ' →' }) : el('span'),
    )
    host.classList.add('sc-foot')
    host.replaceChildren(inner)
  }

  // ---------- feature index chips ----------
  function buildToc() {
    const host = document.querySelector('[data-sc-toc]')
    if (!host) return
    host.classList.add('sc-toc')
    for (const f of document.querySelectorAll('.sc-feature[id]')) {
      const h = f.querySelector('h2')
      if (!h) continue
      const a = el('a', { href: '#' + f.id, text: h.textContent.trim() })
      const v = f.querySelector('.sc-since')
      if (v) a.append(el('span', { class: 'sc-since', 'data-v': v.dataset.v || '', text: v.textContent.trim() }))
      host.append(a)
    }
  }

  // ---------- source listings ----------
  function dedent(s) {
    const lines = s.replace(/\t/g, '  ').split('\n')
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)
    const min = indents.length ? Math.min(...indents) : 0
    return lines.map((l) => l.slice(min)).join('\n')
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Colour the variant part of a class token, e.g. `md:hover:` in `md:hover:bg-sky-500`.
  function hlClassToken(tok) {
    let depth = 0
    let cut = -1
    for (let i = 0; i < tok.length; i++) {
      const c = tok[i]
      if (c === '[' || c === '(') depth++
      else if (c === ']' || c === ')') depth--
      else if (c === ':' && depth === 0) cut = i
    }
    if (cut < 0) return esc(tok)
    return '<span class="t-var">' + esc(tok.slice(0, cut + 1)) + '</span>' + esc(tok.slice(cut + 1))
  }

  function hlTag(tag) {
    const m = tag.match(/^<(\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?)>$/)
    if (!m) return esc(tag)
    let out = '<span class="t-tag">&lt;' + m[1] + m[2] + '</span>'
    out += m[3].replace(/([^\s=]+)(?:(=)("[^"]*"|'[^']*'|[^\s"'>]+))?|(\s+)/g, (all, name, eq, val, ws) => {
      if (ws) return ws
      let s = '<span class="t-attr">' + esc(name) + '</span>'
      if (eq) {
        const q = val[0] === '"' || val[0] === "'" ? val[0] : ''
        const body = q ? val.slice(1, -1) : val
        const inner = name === 'class' ? body.split(/(\s+)/).map((t) => (/^\s+$/.test(t) ? t : hlClassToken(t))).join('') : esc(body)
        s += '=<span class="t-str">' + q + inner + q + '</span>'
      }
      return s
    })
    return out + '<span class="t-tag">' + m[4] + '&gt;</span>'
  }

  function hlHTML(src) {
    let out = ''
    let last = 0
    const re = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g
    let m
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index))
      out += m[0].startsWith('<!--') ? '<span class="t-com">' + esc(m[0]) + '</span>' : hlTag(m[0])
      last = re.lastIndex
    }
    return out + esc(src.slice(last))
  }

  function hlCSS(src) {
    let out = ''
    let last = 0
    const re = /(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(@[\w-]+)|(--[\w-]+(?:-\*)?)/g
    let m
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index))
      const cls = m[1] ? 't-com' : m[2] ? 't-str' : m[3] ? 't-at' : 't-tag'
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>'
      last = re.lastIndex
    }
    return out + esc(src.slice(last))
  }

  function hlJS(src) {
    let out = ''
    let last = 0
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|of|in|new|import|export|from|default|await|async|class|extends)\b/g
    let m
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index))
      const cls = m[1] ? 't-com' : m[2] ? 't-str' : 't-attr'
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>'
      last = re.lastIndex
    }
    return out + esc(src.slice(last))
  }

  function fillCode(pre) {
    let raw
    const from = pre.getAttribute('data-from')
    if (from) {
      const src = document.getElementById(from)
      if (!src) return
      const clone = src.cloneNode(true)
      clone.querySelectorAll('[data-sc-omit]').forEach((n) => n.remove())
      raw = dedent(clone.innerHTML).replace(/=""/g, '')
    } else {
      raw = dedent(pre.textContent)
    }
    pre.dataset.raw = raw
    const lang = pre.getAttribute('data-code') || 'html'
    const html = lang === 'css' ? hlCSS(raw) : lang === 'js' || lang === 'jsx' ? hlJS(raw) : lang === 'html' ? hlHTML(raw) : esc(raw)
    const code = el('code')
    code.innerHTML = html
    pre.replaceChildren(code)

    const btn = el('button', { class: 'sc-copy', type: 'button', text: 'Copy' })
    btn.addEventListener('click', () => {
      const done = () => {
        btn.textContent = 'Copied'
        setTimeout(() => (btn.textContent = 'Copy'), 1400)
      }
      const fallback = () => {
        const r = document.createRange()
        r.selectNodeContents(code)
        const sel = getSelection()
        sel.removeAllRanges()
        sel.addRange(r)
        btn.textContent = 'Selected'
        setTimeout(() => (btn.textContent = 'Copy'), 1400)
      }
      try {
        navigator.clipboard.writeText(pre.dataset.raw).then(done, fallback)
      } catch {
        fallback()
      }
    })
    pre.append(btn)
  }

  // ---------- replay buttons ----------
  // <button class="sc-btn" data-replay="demo-id">Replay</button> re-mounts the
  // demo so CSS animations and @starting-style transitions run again.
  function wireReplay() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-replay]')
      if (!b) return
      const t = document.getElementById(b.getAttribute('data-replay'))
      if (!t) return
      const kids = [...t.childNodes]
      t.replaceChildren()
      void t.offsetWidth
      requestAnimationFrame(() => t.append(...kids.map((k) => k.cloneNode(true))))
    })
  }

  function init() {
    buildTop()
    buildFoot()
    buildToc()
    document.querySelectorAll('pre.sc-code').forEach(fillCode)
    wireReplay()
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init()
})()
