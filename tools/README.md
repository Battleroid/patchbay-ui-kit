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
- `src/gen/pv/<Name>.html` is each component's example markup; `<Name>.js` is its script. Shared behaviors live in `pv/_*.js` (`_ui`, `_hl`, `_viz2`, `_ix`, `_ts`, `_dt`, `_misc`, `_pickers`, `_overlay`, `_player`, `_qr`). `rebuild_js.sh` rebuilds component scripts from those plus the small init files in `src/gen/init/`.
- `genjs.py` bundles the shared behaviors and `pbInit()` into `patchbay.js`.
- `build.py` writes the design-system previews, `kit.py` the demo page, `export.py` this repo's layout.
- `src/ds/project/components/<Name>/README.md` are the component docs.

To add a component: write `pv/<Name>.html` (and an init file if it needs a script), add it to `C` in `build.py`, `SECTIONS` in `kit.py`, `rebuild_js.sh`, and its `pbInit` hook in `genjs.py`, then write its README.
