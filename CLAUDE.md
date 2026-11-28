# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Patchbay is a framework-free UI kit (one CSS file, one vanilla JS file) for small self-hosted apps. **Designing a screen with the kit? Read `COMPONENT-GUIDE.md` first**: it says which component to use for each job. Then read that component's `components/<Name>/README.md` and copy markup from its `example.html`. `DESIGN.md` has the visual and writing rules.

## The repo root is generated

Everything at the root (`patchbay.css`, `patchbay.js`, `patchbay.mjs`, `demo.html`, `components/`, `README.md`, `DESIGN.md`, `COMPONENT-GUIDE.md`, this file, `tests/`, `.github/`, `package.json`) is written by the build from `tools/src`. **Edit only under `tools/src`, then rebuild.** A root edit is overwritten by the next build.

```sh
bash tools/build.sh .        # rebuild over the repo root (~3 s; needs Python 3, no packages)
bash tools/build.sh          # build into tools/dist instead (wiped first)
npm install                  # once: Playwright and axe
npm test                     # all specs, against the built root on 127.0.0.1:4173
npx playwright test tests/k-avatar.spec.mjs            # one spec file
npx playwright test -g "avatar editor: rotate"         # tests by name
PB_PORT=4183 npm test                                  # another port
```

Always rebuild before testing; the specs read the root outputs. There's no linter. The checks are the build itself and the Playwright specs. The build fails on:

- a library calling a `pb*` function its component script doesn't include;
- an id used in two examples;
- inline `style`, `on*=` or `<script>` left in example markup;
- a component missing from `COMPONENT-GUIDE.md`'s index.

CI (`.github/workflows/checks.yml`) runs `npx playwright test --grep-invert screenshots`. Screenshot baselines (`tests/__screenshots__/`) aren't committed: CI makes them on its own runner through the workflow's `update_screenshots` input, and a local first run just writes local ones. Don't commit local baselines, and don't run `npm run test:update` to make a diff go away.

## Where things come from

| Source under `tools/src` | Becomes |
| --- | --- |
| `gen/*.css`, joined in `assemble.py` order (base … more, app) | `patchbay.css` |
| `ds/project/tokens.json` (via `tokcss_lib.py`) | the CSS custom properties, light and dark |
| `gen/pv/_*.js` libraries, in `scripts.json` `"bundle"` order, plus `gen/pv/_hooks.js` | `patchbay.js` and `patchbay.mjs` (named exports listed in `genjs.py` `EXPORTS`) |
| `gen/pv/<Name>.html` | `components/<Name>/example.html`, its section of `demo.html`, and the CSP fixtures |
| `gen/pv/<Name>.js` | **generated** by `genpv.py` (tracked, never edit) |
| `gen/init/i_*.js` | example-only glue: sample data, fake saves |
| `ds/project/components/<Name>/README.md` | `components/<Name>/README.md`; its first sentence is the demo subtitle |
| `ds/project/README.md` (from `## Content` on) | `DESIGN.md` |
| the `use` f-string in `gen/export.py` | `README.md` (double every `{` and `}` in it) |
| `ds/project/COMPONENT-GUIDE.md` | `COMPONENT-GUIDE.md` |
| `gen/repo/*` | `CHANGELOG.md`, `LICENSE`, `CLAUDE.md`, `tests/`, `.github/`, `package.json`, `tools/README.md`, … |
| `gen/icons.py` | every icon, both cuts |

`gen/kit.py` builds the demo page (`SECTIONS` groups it, `NAMES` gives display names, a `wide` tuple marks full-width sections). `gen/build.py` writes the design-system preview cards (`C`: group, card height, subtitle, layout). `gen/fixture.py` writes `tests/fixtures/csp*.html` and `hooks.json` from every `pv/*.html` automatically. `tools/README.md` has more on each generator.

## How behavior works

- **Hooks.** `pbInit(root)` walks the ordered `pbHook(name, selector, fn)` list in `_hooks.js` and calls `fn(el)` once per matching element, so calling it again is safe. A test asserts the fixture has markup for every hook.
- **Component scripts.** Each `pv/<Name>.js` is `_core.js` + the libraries named in `scripts.json` + any bundle library defining a function they call (resolved by `pbscripts.component`) + the hooks those libraries define + the init files + `pbInit()`. `["ALL"]` means the whole bundle.
- **Events, not saving.** Components talk through bubbling `pb:*` CustomEvents (`pbEmit`). The kit never saves or uploads anything. It fires an event, waits, and the app settles it by dispatching `pb:saved` or `pb:error` (`detail.message`) on the same element. Section forms (`pbSection` in `_forms.js`) track dirty, busy, saved and error this way.
- **Strings.** Words the kit writes live in `pbStrings`. A library adds its own keys with `Object.assign(pbStrings, Object.assign({key: '…'}, pbStrings))` so app overrides win. `pbT(key, vars)` fills templates and plural forms.

## Rules the tests enforce

- **Strict CSP** (`default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:`):
  - The bundles may not contain `style="`, `setAttribute('style'`, `<style`, `eval`, `new Function`, inline handlers or string `setTimeout`.
  - Markup built as a string carries styles in `data-style`, followed by `pbStyled(container)`.
  - Setting `el.style.setProperty(...)` through the CSSOM is fine, and is how dynamic values (positions, `--pct`) are set.
  - The fixture's CSP has no `connect-src`, so `fetch` fails there; tests load images through `<img>`.
- **Accessibility:** axe runs in all four theme × edge combinations (light/dark × soft/hard), and any serious or critical violation fails. So does sideways scroll at phone width (375px).
- **Examples:**
  - Ids are unique across *all* `pv/*.html`, because the demo and the fixture put every example on one page.
  - Example-only layout goes in `gen/demo.css` as `.pb .pb-demo-<name>-N`, never in `patchbay.css`.
  - Sample media uses the `{{PHOTO1}}`–`{{PHOTO6}}`, `{{THUMB1}}`–`{{THUMB6}}`, `{{SAMPLE}}` and `{{POSTER}}` placeholders.
- **Demo glue:** the demo runs every component's init files once each, so an init file shared by two components runs twice. Scope glue to its own root (`[data-tpl="…"]`) and make it idempotent.
- **`demo.html` from `file://`:** it must work opened straight from disk. A `<canvas>` that draws a `media/` image is tainted there, so embed bytes instead (see `init/i_avatar.js`).

## Adding a component

1. `gen/pv/<Name>.html`: the example markup, every state shown, ids prefixed with the component name.
2. Styles in a `gen/*.css` source (new work usually goes at the end of `app.css`). Tokens only, both edges and themes, plus a `forced-colors` rule if it draws its own borders or fills.
3. Behavior (if any) in a `gen/pv/_*.js` library, or a new one added to `"bundle"` in `scripts.json`. Add a `pbHook('name','selector',fn);` line in `_hooks.js` at the right point in the order. Add any new public function to `EXPORTS` in `genjs.py`.
4. `scripts.json` `"components"`: `"<Name>": [[libs], [init files]]`.
5. `gen/init/i_<name>.js` for example-only glue.
6. `gen/build.py` `C`: group, card height, subtitle, layout. Add the name to the `page` tuple there if it's a full page.
7. `gen/kit.py`: `SECTIONS` (pick the group), `NAMES` if the display name differs, and the `wide` tuple for full-width demos.
8. `ds/project/components/<Name>/README.md`: one-sentence summary, then `## Markup`, `## States`, `## Keys`, `## Events`, `## Do and don't`, in the voice of DESIGN.md's Content section.
9. A row in `ds/project/COMPONENT-GUIDE.md`'s "Every component" table, plus an entry in the decision section where it belongs. If it changes a rule, update `ds/project/README.md` too.
10. A spec in `gen/repo/tests/` for its behavior, using the CSP fixture (`/tests/fixtures/csp.html`, sections at `[data-fixture="<Name>"]`), and a line under `## Unreleased` in `gen/repo/CHANGELOG.md`.
11. Rebuild and run the suite.

## Removing or renaming a component

Delete `gen/pv/<Name>.html` and `gen/pv/<Name>.js`, then remove the component from everywhere it's listed:

- `ds/project/components/<Name>/`
- its `scripts.json` entry
- `C` and the `page` tuple in `build.py`
- `SECTIONS`, `NAMES` and the `wide` tuple in `kit.py`
- its CSS and its init file (unless another component lists it)
- its `COMPONENT-GUIDE.md` row and any mentions in the guide and `ds/project/README.md`
- any specs that use it

Remove its hook and library code only if nothing else uses them; the build reports a missing `pb*` function if something still does. Root builds replace `components/` wholesale, so the old folder disappears. Removing or renaming a component, hook, class, attribute or event goes under `### Breaking` in the changelog.

## Other notes

- The README's header images come from `npm run readme:header` (renders Dashboard and AppShell from a build). Run it after visual changes to those, then rebuild.
- `patchbay.zip` is built only into a separate output folder (`tools/build.sh`), never over the repo.
