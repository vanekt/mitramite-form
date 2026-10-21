# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Manifest V3 Chrome extension that restores the trámite status lookup form on https://mitramite.renaper.gob.ar/. The site's own form and result templates were removed from the HTML, but its `busqueda.php` API still works. The extension is two files: `manifest.json` and `content.js`. There is no build step, bundler, package manager, linter or test suite.

## Commands

- Syntax check: `node --check content.js`
- Install/reload: `chrome://extensions` → Developer mode → "Load unpacked" → this folder; press the reload icon after every edit, then reload the page.
- Live check without installing: the `chrome-devtools` MCP server (project-local config) can open the site; navigate to it, then run `content.js` in the page with `evaluate_script` (`sourcePath` + `format: "script"`). The script is idempotent-guarded by `#mm-restore`, so reload the page before re-injecting.

The target site is unreachable from some networks (curl times out); use the browser tooling instead.

## Architecture

- `content.js` runs with `"world": "MAIN"` on purpose. It needs the page's `grecaptcha` global and a same-origin `fetch('busqueda.php')`; an isolated-world content script would see neither. Don't add extension APIs (`chrome.*`) to it.
- Request flow: `grecaptcha.execute(SITE_KEY, {action: 'submit_tramite'})` → POST `FormData` (`tramite` zero-padded to 11 digits, `token`, `action`) to `busqueda.php` → JSON `{data, errors}`. This mirrors the original site's `dist/js/main.js`.
- Rendering follows the original site's logic, driven by API fields rather than local tables:
  - the progress stepper is the image `img/svg/<ui.svg>` (five stages: Inicio, Verificación, Producción, Embalaje, Correo/Retiro; colour = done/current/problem). Stage logic lives server-side; do not guess stages from status text.
  - `ui.icon`, `ui.texto_front`, `ui.class_panel_color` (gris/celeste/verde), `ui.texto_cuerpo` (HTML, passed through `safeHtml`) and `ui.historico` build the panel and history box. `tramitesUI` may hold up to two entries.
  - special cases handled before normal rendering: `data.accion == 24` (CPI), `id_ultimo_estado` 111 (Migraciones) and 534 (suspended), and `response.errors`.
- UI state: one case is shown at a time (`cards` map, `current`, `busy` set guard against races); switching cases removes the old card immediately and shows a loading placeholder. Saved case numbers and their last status live in page `localStorage` (`mm-restore-nums`, `mm-restore-last`) and are offered as a focus dropdown; nothing is fetched on page load.
- All interface text is Spanish and lives in the `t` object at the top of `content.js`. Code comments are English.
- All CSS is an inline template string in `content.js`, scoped under `#mm-restore`, with one mobile breakpoint at 600px.
- The widget mounts into `body > main > div:nth-child(1) > div`, falling back to `main` then `body`.

## Repo notes

- `sources/` (git-ignored) holds a local copy of the original site's `main.js` and `index.html` for reference only; it is third-party code and must not be committed.
