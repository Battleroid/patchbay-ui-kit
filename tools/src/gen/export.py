from pbroot import ROOT
import json,re,os,shutil,subprocess
O=ROOT+'/export/patchbay'; shutil.rmtree(ROOT+'/export',ignore_errors=True)
for d in ('fonts','icons/soft','icons/hard','components'): os.makedirs(f'{O}/{d}')
for f in os.listdir(ROOT+'/kit/fonts'): shutil.copy(f'{ROOT}/kit/fonts/{f}',f'{O}/fonts/')
for e in ('soft','hard'):
    for f in os.listdir(f'{ROOT}/icons/{e}'): shutil.copy(f'{ROOT}/icons/{e}/{f}',f'{O}/icons/{e}/')
shutil.copy(ROOT+'/ds/project/tokens.json',O); T=json.load(open(f'{O}/tokens.json'))
import sys; sys.path.insert(0,ROOT+'/gen'); from tokcss_lib import tokens_css
L=['/* Patchbay — tokens and components. Generated from tokens.json. Light and dark themes: data-theme on <html> or any container. */',tokens_css(T,lambda f:'fonts/'+os.path.basename(f))]
open(f'{O}/patchbay.css','w').write('\n'.join(L)+'\n\n'+open(ROOT+'/ds/project/components/bundle.css').read())
shutil.copy(ROOT+'/gen/demo.css',f'{O}/demo.css')
shutil.copy(ROOT+'/gen/patchbay.js',f'{O}/patchbay.js'); shutil.copy(ROOT+'/gen/patchbay.mjs',f'{O}/patchbay.mjs')
shutil.copy(ROOT+'/gen/repo/pb-theme-boot.js',f'{O}/pb-theme-boot.js')
C=ROOT+'/ds/project/components'
for n in sorted(os.listdir(C)):
    if not os.path.isdir(f'{C}/{n}') or n=='Cover': continue
    os.makedirs(f'{O}/components/{n}'); shutil.copy(f'{C}/{n}/README.md',f'{O}/components/{n}/README.md')
    body=open(f'pv/{n}.html').read().strip().replace('{{SAMPLE}}','../../media/sample.mp4').replace('{{POSTER}}','../../media/poster.jpg')
    for i in range(1,7): body=body.replace('{{PHOTO%d}}'%i,'../../media/photo-%d.jpg'%i).replace('{{THUMB%d}}'%i,'../../media/thumb-%d.jpg'%i)
    js=open(f'pv/{n}.js').read().strip() if os.path.exists(f'pv/{n}.js') else ''
    open(f'{O}/components/{n}/example.html','w').write(f'''<!DOCTYPE html>
<html lang="en" data-edge="soft" data-theme="light" data-theme-default="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Patchbay · {n}</title><script src="../../pb-theme-boot.js"></script><link rel="stylesheet" href="../../patchbay.css"><link rel="stylesheet" href="../../demo.css">
<style>body{{margin:0;padding:32px}}</style></head>
<body class="pb">
<!-- Set data-edge="hard" on <html> for the hard variant. pb-theme-boot.js picks the theme: the saved choice, else data-theme-default, else the system. -->
{body}
{('<script>'+chr(10)+js+chr(10)+'</script>') if js else ''}
</body></html>
''')
shutil.copy(ROOT+'/kit/index.html',f'{O}/demo.html')
os.makedirs(f'{O}/media',exist_ok=True)
for f in ['sample.mp4','poster.jpg']+[f'{a}-{i}.jpg' for a in ('photo','thumb') for i in range(1,7)]: shutil.copy(f'{ROOT}/media/{f}',f'{O}/media/{f}')
# The README's header image, light and dark (drawn by tools/readme-header.mjs from a build; see tools/README.md).
if os.path.isdir(f'{ROOT}/media/readme'): shutil.copytree(f'{ROOT}/media/readme',f'{O}/media/readme')
comps=sorted(os.listdir(f'{O}/components'))
import pbscripts as S
EXPORTS=re.findall(r"'(pb\w+)'",re.search(r"EXPORTS=\[(.*?)\]",open(ROOT+'/gen/genjs.py').read(),re.S).group(1))
# The README is an overview built here (component groups follow the demo's sections in kit.py); DESIGN.md is the design guide from ds/project/README.md minus its own intro and setup.
import ast
SECT=ast.literal_eval(re.search(r"SECTIONS=(\[.*?\n\])",open(ROOT+'/gen/kit.py').read(),re.S).group(1))
groups=[[g,[n for n in l if n in comps]] for _,g,l in SECT]
rest=[n for n in comps if not any(n in l for _,l in groups)]
groups[0][1]+=rest # Icons has no demo section of its own; it sits with the foundations.
catalog='\n'.join(f'- **{g}:** '+', '.join(f'[{n}](components/{n}/)' for n in l) for g,l in groups if l)
HOOKS=[h[0] for h in S.hooks()]
guide=open(ROOT+'/ds/project/README.md').read()
if '\n## Content' not in guide: raise SystemExit('export: ds/project/README.md needs its "## Content" section')
guide=guide[guide.index('\n## Content')+1:].replace('\n## ','\n### ')
guide='### '+guide[3:] if guide.startswith('## ') else guide
use=f'''# Patchbay

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="media/readme/header-dark.png">
  <img src="media/readme/header-light.png" alt="Patchbay: a dashboard and an app shell built with the kit, beside a short description of the kit and its demo">
</picture>

Patchbay is a UI kit for small self-hosted apps: status pages, dashboards, file and media sharing, config editors. It looks like a well-kept personal site. Text is set in a serif on warm paper, anything a machine would print is in mono, and a few bright fills carry the color.

It comes in two edges, **soft** (rounded, diffuse shadows) and **hard** (square, ink borders, offset shadows), and two themes, **light** and **dark**. All four share the same tokens, so switching is one attribute.

**See it:** open `demo.html`. It shows every component in every state, with switches for theme and edge, and needs nothing installed or built. Each component also has its own page, `components/<Name>/example.html`, next to a README with its markup and rules.

## Quick start

```html
<!DOCTYPE html>
<html lang="en" data-edge="soft">
<head>
  <meta charset="utf-8">
  <script src="pb-theme-boot.js"></script>
  <link rel="stylesheet" href="patchbay.css">
</head>
<body class="pb">
  <!-- markup copied from components/<Name>/example.html -->
  <script src="patchbay.js" data-pb-auto></script>
</body>
</html>
```

- `patchbay.css` has the tokens, the fonts and every component. Keep `fonts/` next to it.
- `pb-theme-boot.js` applies the saved theme before the page paints, so there's no flash. It must be a plain blocking script in `<head>`, not `defer` or a module.
- `class="pb"` marks the app root (it also resets the body margin).
- `patchbay.js` with `data-pb-auto` runs `pbInit()` once the page has loaded. Without `data-pb-auto`, nothing runs until you call it. For ES modules: `import pbInit, {{ pbToast, pbConfirm }} from './patchbay.mjs'; pbInit();`.

Start an app from [AppShell](components/AppShell/) (skip link, header, nav, page header, footer), and a new screen from one of the page templates. Not sure which component fits? [COMPONENT-GUIDE.md](COMPONENT-GUIDE.md) answers that by job (written for AI agents, useful for anyone). Before building a part, read its README and copy the markup from its example. The examples are self-contained: each carries the script it needs, plus example-only glue such as fake saves and sample data.

## What's in it

{catalog}

Also here: `tokens.json`, the source for every token (each is also a CSS custom property, like `var(--accent)` or `var(--space-4)`; use them instead of raw hex or px); the raw icon SVGs in `icons/soft` and `icons/hard`; app icons and a web manifest in `app-icons/`; and the alert email template, `email/alert.html`.

## Theme, edge and density

- **Edge:** `data-edge="soft"` or `"hard"` on `<html>`, one per app.
- **Theme:** `data-theme="light"` or `"dark"` on `<html>`, or on any container to theme one panel. `pb-theme-boot.js` uses the saved choice (`localStorage` `pb-theme`: `light`, `dark` or `system`), then `<html data-theme-default="light">`, then the system setting, and writes it as `data-theme` and `data-theme-choice` on `<html>`. A ThemeSwitch in the header lets people pick.
- **Density:** `data-density="compact"` on `<html>` or a container, for logs and admin lists.

## Scripting

`pbInit(root = document, {{only, skip}} = {{}})` binds every behavior under `root`, including `root` itself. Each element is bound once, so it's safe to call again after an htmx swap or after you insert markup: `pbInit(el)`. `only` and `skip` take hook names, and `data-pb-skip="name other"` on an ancestor skips those hooks inside it. If one element throws, the error is logged as `[patchbay] name` and the rest still bind. Add your own behavior with `pbHook(name, selector, fn)` before the first `pbInit()`.

`pbToast({{title, body, …}})` and `pbConfirm({{title, body, typeToConfirm, …}})` escape `body` as text. Use `bodyHTML` only for markup you trust, or pass a DOM node as `body`. `pbEsc(s)` escapes `& < > " '`.

<details>
<summary>The {len(HOOKS)} hooks, in the order they bind (<code>pbInit.hooks</code>)</summary>

{", ".join("`"+h+"`" for h in HOOKS)}

</details>

<details>
<summary>Everything <code>patchbay.mjs</code> exports</summary>

`pbInit` (also the default export), {", ".join("`"+e+"`" for e in EXPORTS if e!="pbInit")}

</details>

## Strict CSP

The kit needs no inline script or style. It runs under:

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'
```

- Add `media-src 'self' blob:` for the media player and its captions. Add `connect-src 'self'` (or your origin) for the parts that fetch: the lazy notifications inbox (`data-src`) and the command palette's `data-cmd-src`.
- Keep `img-src data:` (icons are CSS masks on `data:` URIs) and `blob:` (photos in the avatar editor).
- The kit never uses `eval`, `new Function`, inline handlers or `style` attributes. Markup it builds as a string carries its styles in `data-style`, and `pbStyled(container)` moves them into the CSSOM. Call it after inserting your own strings too.
- In your own markup, set custom properties with `data-vars="--w:42%;--c:var(--chart-2)"` (names `--a-z0-9`; values without `;`, `url(` or `expression`). Layouts that need a number take it as an attribute: `.pb-dash > [data-span="1..12"]`, `.pb-steps[data-n]`, `.pb-tabbar[data-n]`, `.pb-qr[data-size=sm|md|lg]`, `.pb-auth--inline`, `.pb-progress[data-value]`.
- `tests/fixtures/csp.html` runs every component under this policy, built from the same markup as the examples. The `pb-demo-*` classes in `demo.css` only lay out the examples, so don't link `demo.css` in your app.

## Working on the kit

Everything in the repo root is generated from `tools/src`. `tools/build.sh .` rebuilds it, and `npm test` runs the accessibility, CSP, layout and screenshot checks. `tools/README.md` covers where things live, how to add a component, and how the header image above is drawn (`npm run readme:header`).

## License

MIT for the code and docs (`LICENSE`). The fonts are under the SIL Open Font License 1.1 (`fonts/OFL.txt`).

## Design guide

How the kit should look, read and fit together (content, color, type, shape, controls, layout, motion and icons) is in [DESIGN.md](DESIGN.md). Follow it when you build on the kit, too.
'''
open(f'{O}/README.md','w').write(use)
# The design guide stands alone beside the README. To fold it back in, write use+guide (with ### headings) to README.md instead.
open(f'{O}/DESIGN.md','w').write('# Patchbay design guide\n\nHow the kit should look, read and fit together. Setup and the component list are in the [README](README.md).\n\n'+guide.replace('\n### ','\n## ').replace('### ','## ',1))
# The component guide for AI agents: every component must have a row in its index table, and every row must be a component.
cg=open(ROOT+'/ds/project/COMPONENT-GUIDE.md').read()
rows=set(re.findall(r'^\| ([A-Z]\w+) \|',cg.split('\n## Every component',1)[-1].split('| --- |',1)[-1],re.M)) # rows below the header
miss=sorted(set(comps)-rows); extra=sorted(rows-set(comps))
if miss or extra: raise SystemExit(f'export: COMPONENT-GUIDE.md index is out of date. Add a row for: {", ".join(miss) or "-"}. Remove the row for: {", ".join(extra) or "-"}.')
open(f'{O}/COMPONENT-GUIDE.md','w').write(cg)
open(f'{O}/index.html','w').write('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Patchbay</title><meta http-equiv="refresh" content="0; url=demo.html"><link rel="canonical" href="demo.html"></head><body><p><a href="demo.html">Patchbay demo</a></p></body></html>\n')

# ---- app icons, email template, licenses, changelog, CI, build tools ----
os.makedirs(f'{O}/app-icons',exist_ok=True)
for f in os.listdir(ROOT+'/appicons'):
    if not f.startswith('_'): shutil.copy(f'{ROOT}/appicons/{f}',f'{O}/app-icons/{f}')
os.makedirs(f'{O}/email',exist_ok=True); shutil.copy(ROOT+'/email/alert.html',f'{O}/email/alert.html')
ofl=open(ROOT+'/gen/repo/OFL-body.txt').read()
open(f'{O}/fonts/OFL.txt','w').write("""Source Serif 4
Copyright 2014-2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name 'Source'.

Obel Mono
Copyright 2026 The Obel Mono Project Authors (https://typographic.systems)

These Font Software files are licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at: https://openfontlicense.org

"""+ofl)
for f in ('LICENSE','CHANGELOG.md','CLAUDE.md'): shutil.copy(f'{ROOT}/gen/repo/{f}',f'{O}/{f}')
shutil.copytree(ROOT+'/gen/repo/.github',f'{O}/.github')
shutil.copytree(ROOT+'/gen/repo/tests',f'{O}/tests')
import fixture; fixture.write(f'{O}/tests/fixtures')
for f in ('package.json','playwright.config.mjs','.gitignore','.gitattributes'): shutil.copy(f'{ROOT}/gen/repo/{f}',f'{O}/{f}')
T=f'{O}/tools'; os.makedirs(f'{T}/src/gen/pv'); os.makedirs(f'{T}/src/gen/init')
skip=('itest','shots','kitshot')
for f in os.listdir(ROOT+'/gen'):
    p=f'{ROOT}/gen/{f}'
    if os.path.isfile(p) and f.endswith(('.py','.css','.sh','.json')) and not f.startswith(skip): shutil.copy(p,f'{T}/src/gen/{f}')
for f in os.listdir(ROOT+'/gen/pv'): shutil.copy(f'{ROOT}/gen/pv/{f}',f'{T}/src/gen/pv/{f}')
for f in os.listdir(ROOT+'/gen/init'): shutil.copy(f'{ROOT}/gen/init/{f}',f'{T}/src/gen/init/{f}')
D=ROOT+'/ds/project'; os.makedirs(f'{T}/src/ds/project/components')
for f in ('tokens.json','README.md','COMPONENT-GUIDE.md','design-system.json'): shutil.copy(f'{D}/{f}',f'{T}/src/ds/project/{f}')
shutil.copytree(f'{D}/fonts',f'{T}/src/ds/project/fonts')
for n in os.listdir(f'{D}/components'):
    if os.path.exists(f'{D}/components/{n}/README.md'):
        os.makedirs(f'{T}/src/ds/project/components/{n}',exist_ok=True); shutil.copy(f'{D}/components/{n}/README.md',f'{T}/src/ds/project/components/{n}/README.md')
os.makedirs(f'{T}/src/kit'); shutil.copytree(ROOT+'/kit/fonts',f'{T}/src/kit/fonts'); shutil.copytree(ROOT+'/kit/media',f'{T}/src/kit/media')
shutil.copytree(ROOT+'/media',f'{T}/src/media'); shutil.copytree(ROOT+'/appicons',f'{T}/src/appicons'); shutil.copytree(ROOT+'/email',f'{T}/src/email')
shutil.copytree(ROOT+'/gen/repo',f'{T}/src/gen/repo')
for f in ('build.sh','README.md','readme-header.mjs'): shutil.copy(f'{ROOT}/gen/repo/tools/{f}',f'{T}/{f}')
os.chmod(f'{T}/build.sh',0o755)
if shutil.which('zip'): subprocess.run(['zip','-qr','patchbay.zip','patchbay','-x','patchbay/tools/*','patchbay/.github/*','patchbay/tests/*'],cwd=ROOT+'/export',check=True)
else: print('note: zip not found, skipping patchbay.zip')
print(len(comps))
