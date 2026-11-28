# Building Patchbay

`tools/build.sh` regenerates everything in this repo from `tools/src`: `patchbay.css`, `patchbay.js`, the icons, every `components/*/example.html`, `demo.html` and `patchbay.zip`.

```sh
tools/build.sh            # writes tools/dist
tools/build.sh .          # writes over the repo root
```

Needs Python 3 and a bash (Git Bash on Windows). `zip` is optional: without it the build skips `patchbay.zip` and says so. No Python packages.

The script looks for a working `python3`, then `python`, then `py`, and skips any that don't run (on Windows `python3` is often a Store stub that only prints "Python was not found"). The generators find their own tree from where they sit, or from `PB_WORK`; nothing is hard-coded, and `tools/src` is never written to (the build runs in `tools/.work`). The zip lands beside the output (`tools/patchbay.zip` for the default `tools/dist`). `tools/dist`, `tools/.work`, `tools/.test-results` and the zip are git-ignored.

## Tests

```sh
npm install
npm test                          # everything, on http://127.0.0.1:4173
PB_PORT=4183 npm test             # another port
npm run test:update               # rewrite the screenshot baselines
```

The specs live in `tests/`. `tests/serve.mjs` is a small Node static server (correct MIME types, Range requests, 127.0.0.1 only; `PB_PORT` and `PB_ROOT` pick the port and folder), so no Python is needed. `tests/kb.mjs` holds keyboard helpers for specs (`tabOrder`, `expectFocus`, `describeActive`, `pressTimes`). The accessibility and screenshot specs run in all four theme and edge combinations: light and dark, soft and hard.

## Where things live

- `src/gen/*.css` are the stylesheet sources, joined in order by `assemble.py` (base, media, controls, viz, cal, forms2, overlay, player, shell, tier2, homelab, extra, more, app).
- `src/ds/project/tokens.json` is the token source; `tokcss_lib.py` turns it into CSS custom properties for both themes.
- `src/gen/icons.py` draws every icon in both cuts.
- `src/gen/pv/<Name>.html` is each component's example markup. Behaviors live in `pv/_*.js` (`_core` first: `pbEsc`, `pbStyled`, `pbVars`, `pbOnDoc`, `pbPlace`, `pbHook`, `pbInit`; then `_pickers`, `_overlay`, `_player`, `_qr`, `_ui`, `_hl`, `_viz2`, `_ix`, `_ts`, `_dt`, `_misc`, `_forms`). `pv/_hooks.js` is the ordered `pbHook(name, selector, fn)` list that `pbInit()` walks.
- `src/gen/scripts.json` says which libs and init files make each component's script. `genjs.py` writes `patchbay.js` and `patchbay.mjs`; `genpv.py` writes every `pv/<Name>.js` (generated, do not edit) as `_core.js` + those libs (plus any lib they call into) + the hooks those libs define + the init files + `pbInit()`. `src/gen/init/i_*.js` hold example-only glue (sample data, fake saves); they call `pbInit(el)` when they need an element bound first.
- `fixture.py` writes `tests/fixtures/csp.html` and `csp-esm.html` from the example markup with inline styles and handlers stripped.
- `build.py` writes the design-system previews, `kit.py` the demo page, `export.py` this repo's layout. `pbroot.py` gives each of them the tree root.
- `src/ds/project/components/<Name>/README.md` are the component docs.

To add a component: write `pv/<Name>.html`, its styles in a `src/gen/*.css` source, its behavior in a `pv/_*.js` lib with a `pbHook` line in `pv/_hooks.js` (and an init file for example-only glue), add it to `scripts.json`, `C` in `build.py` and `SECTIONS` (and `NAMES`) in `kit.py`; then write its README and add a row to `src/ds/project/COMPONENT-GUIDE.md`, which the build checks. The CSP fixture picks up every `pv/*.html` by itself and fails on an id used in two examples. Keep script-built markup free of `style="…"`: use `data-style` and call `pbStyled()` after inserting it. `CLAUDE.md` at the repo root has the full checklist, including removal.

## README header image

`tools/readme-header.mjs` (`npm run readme:header`) draws the README's header, `header-light.png` and `header-dark.png`, from a build with the kit itself: a short description of the kit and of `demo.html`, and screenshots of the Dashboard and AppShell examples. It writes them to `tools/src/media/readme/`, which the build copies to `media/readme/`. Rebuild, run it after a visual change, rebuild again and commit the images: `node tools/readme-header.mjs tools/dist` reads a `tools/dist` build instead of the repo root.
