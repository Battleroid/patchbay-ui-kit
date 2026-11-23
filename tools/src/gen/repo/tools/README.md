# Building Patchbay

`tools/build.sh` regenerates everything in this repo from `tools/src`: `patchbay.css`, `patchbay.js`, the icons, every `components/*/example.html`, `demo.html` and the zip.

```sh
tools/build.sh            # writes tools/dist
tools/build.sh .          # writes over the repo root
```

Needs Python 3 and `zip`. No Python packages.

## Where things live

- `src/gen/*.css` are the stylesheet sources, joined in order by `assemble.py` (base, media, controls, viz, cal, forms2, overlay, player, shell, tier2, homelab, extra, more).
- `src/ds/project/tokens.json` is the token source; `tokcss_lib.py` turns it into CSS custom properties for both themes.
- `src/gen/icons.py` draws every icon in both cuts.
- `src/gen/pv/<Name>.html` is each component's example markup. Behaviors live in `pv/_*.js` (`_core` first: `pbEsc`, `pbStyled`, `pbVars`, `pbOnDoc`, `pbPlace`, `pbHook`, `pbInit`; then `_pickers`, `_overlay`, `_player`, `_qr`, `_ui`, `_hl`, `_viz2`, `_ix`, `_ts`, `_dt`, `_misc`, `_forms`). `pv/_hooks.js` is the ordered `pbHook(name, selector, fn)` list that `pbInit()` walks.
- `src/gen/scripts.json` says which libs and init files make each component's script. `genjs.py` writes `patchbay.js` and `patchbay.mjs`; `genpv.py` writes every `pv/<Name>.js` (generated, do not edit) as `_core.js` + those libs (plus any lib they call into) + the hooks those libs define + the init files + `pbInit()`. `src/gen/init/i_*.js` hold example-only glue (sample data, fake saves); they call `pbInit(el)` when they need an element bound first.
- `fixture.py` writes `tests/fixtures/csp.html` and `csp-esm.html` from the example markup with inline styles and handlers stripped.
- `build.py` writes the design-system previews, `kit.py` the demo page, `export.py` this repo's layout.
- `src/ds/project/components/<Name>/README.md` are the component docs.

To add a component: write `pv/<Name>.html`, its behavior in a `pv/_*.js` lib and a `pbHook` line in `pv/_hooks.js` (and an init file for example-only glue), add it to `scripts.json`, `C` in `build.py`, `SECTIONS` in `kit.py` and, if it has a hook, `COMPONENTS` in `fixture.py`; then write its README. Keep script-built markup free of `style="…"`: use `data-style` and call `pbStyled()` after inserting it.
