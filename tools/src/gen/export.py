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
<title>Patchbay · {n}</title><script src="../../pb-theme-boot.js"></script><link rel="stylesheet" href="../../patchbay.css">
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
comps=sorted(os.listdir(f'{O}/components'))
import pbscripts as S
use=f'''# Patchbay

**Demo:** [battleroid.github.io/patchbay-ui-kit](https://battleroid.github.io/patchbay-ui-kit/) (or open `demo.html` locally).

## Setup

- **CSS:** link `patchbay.css` (tokens, fonts, every component). Fonts load from `fonts/` beside it; keep the two together. There is no `tokens.css` or `components/bundle.css` any more; it is all in `patchbay.css`.
- **Theme without a flash:** put `<script src="pb-theme-boot.js"></script>` in `<head>` before the stylesheet (a plain blocking script, not `defer` or a module). It applies the saved choice (`localStorage` `pb-theme`: `light`, `dark` or `system`), else `<html data-theme-default="light">`, else the system setting, as `data-theme` and `data-theme-choice` on `<html>`.
- **Root:** `class="pb"` on the app root (the body margin is reset there), `data-edge="soft"` or `data-edge="hard"` on `<html>`.
- **Behaviors, classic script:** `<script src="patchbay.js" data-pb-auto></script>` at the end of `<body>` runs `pbInit()` on DOMContentLoaded. Without `data-pb-auto` nothing runs until you call `pbInit()`.
- **Behaviors, ES module:** `import pbInit, {{ pbToast, pbConfirm }} from './patchbay.mjs'; pbInit();`. Exports: `pbInit` (also the default), `pbConfirm`, `pbToast`, `pbInbox`, `pbTheme`, `pbPlace`, `pbCalendar`, `pbClock`, `pbQRSvg`, `pbQRCode`, `pbVirtual`, `pbAnsi`, `pbCronParse`, `pbSection`, `pbHook`, `pbEsc`, `pbStyled`.
- **`pbInit(root = document, {{only, skip}} = {{}})`** binds every hook under `root` (and `root` itself) once per element, so it is safe to call again after an htmx swap or for markup you insert: `pbInit(el)`. `only` and `skip` take hook names; `data-pb-skip="name other"` on an ancestor skips those hooks below it. One element that throws logs `[patchbay] name` and the rest still bind. `pbInit.hooks` lists the names in order: {", ".join("`"+h[0]+"`" for h in S.hooks())}. Register your own with `pbHook(name, selector, fn)` before calling `pbInit()`.
- **Strict CSP, no inline style needed:** the kit runs under `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'` (add `media-src 'self' blob:` for the media player and its captions). It never uses `eval`, `new Function`, inline handlers or `style` attributes. Markup it builds as a string carries styles in `data-style`, which `pbStyled(container)` moves into the CSSOM right after insertion; call it after inserting your own strings too. In your markup, set custom properties with `data-vars="--w:42%;--c:var(--chart-2)"` (names `--a-z0-9`, values without `;`, `url(` or `expression`), and use the attribute forms for layout: `.pb-dash > [data-span="1..12"]`, `.pb-steps[data-n]`, `.pb-tabbar[data-n]`, `.pb-qr[data-size=sm|md|lg]`, `.pb-auth--inline`, `.pb-progress[data-value]`. `tests/fixtures/csp.html` is every component under that policy.
- **Script helpers:** `pbToast({{title, body, bodyHTML, …}})` and `pbConfirm({{title, body, bodyHTML, typeToConfirm, …}})` treat `body` as text and escape it; `bodyHTML` is the explicit opt-in for markup you trust; a DOM Node as `body` is appended. `pbEsc(s)` escapes `& < > " '`.
- Start every app from `components/AppShell` (header, nav, page header, footer, skip link).
- Before building a part, read `components/<Name>/README.md` for its markup and rules, and copy the markup from `components/<Name>/example.html`.
- Each component's README names its markup hooks (`data-cal`, `data-clock`, `data-combo`, `data-tags`, `data-codeinput`, `data-copy`, `data-kv`, …). `components/<Name>/example.html` files are self-contained: each carries its own copy of the script it needs, built from the same sources as `patchbay.js`, plus example-only glue (fake saves, sample data).
- Form sections keep their Save/Discard buttons inside the panel (see `components/Fieldset`).
- Tokens: `tokens.json` is the source; every value is also a CSS custom property (`var(--accent)`, `var(--space-4)`, `var(--radius-md)`). Use tokens, never raw hex or px.
- Icons: `<span class="pb-icon pb-icon--NAME"></span>` (paints in `currentColor`). Raw SVGs are in `icons/soft` and `icons/hard`.
- `demo.html` shows every component on one page; `index.html` opens it, so GitHub Pages serves the demo at the site root.
- Density: `data-density="compact"` on `<html>` or a container for dense views.
- App icons and a web manifest are in `app-icons/`; the alert email template is `email/alert.html`.
- `tools/build.sh` rebuilds everything from `tools/src` (see `tools/README.md`). `npm test` runs the accessibility, layout and screenshot checks against `demo.html`.
- License: MIT for the code and docs (`LICENSE`); the fonts are under the SIL Open Font License 1.1 (`fonts/OFL.txt`).
- Components: {", ".join(comps)}.

'''
open(f'{O}/README.md','w').write(use+open(ROOT+'/ds/project/README.md').read())
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
for f in ('LICENSE','CHANGELOG.md'): shutil.copy(f'{ROOT}/gen/repo/{f}',f'{O}/{f}')
shutil.copytree(ROOT+'/gen/repo/.github',f'{O}/.github')
shutil.copytree(ROOT+'/gen/repo/tests',f'{O}/tests')
import fixture; fixture.write(f'{O}/tests/fixtures')
for f in ('package.json','playwright.config.mjs','.gitignore'): shutil.copy(f'{ROOT}/gen/repo/{f}',f'{O}/{f}')
T=f'{O}/tools'; os.makedirs(f'{T}/src/gen/pv'); os.makedirs(f'{T}/src/gen/init')
skip=('itest','shots','kitshot')
for f in os.listdir(ROOT+'/gen'):
    p=f'{ROOT}/gen/{f}'
    if os.path.isfile(p) and f.endswith(('.py','.css','.sh','.json')) and not f.startswith(skip): shutil.copy(p,f'{T}/src/gen/{f}')
for f in os.listdir(ROOT+'/gen/pv'): shutil.copy(f'{ROOT}/gen/pv/{f}',f'{T}/src/gen/pv/{f}')
for f in os.listdir(ROOT+'/gen/init'): shutil.copy(f'{ROOT}/gen/init/{f}',f'{T}/src/gen/init/{f}')
D=ROOT+'/ds/project'; os.makedirs(f'{T}/src/ds/project/components')
for f in ('tokens.json','README.md','design-system.json'): shutil.copy(f'{D}/{f}',f'{T}/src/ds/project/{f}')
shutil.copytree(f'{D}/fonts',f'{T}/src/ds/project/fonts')
for n in os.listdir(f'{D}/components'):
    if os.path.exists(f'{D}/components/{n}/README.md'):
        os.makedirs(f'{T}/src/ds/project/components/{n}',exist_ok=True); shutil.copy(f'{D}/components/{n}/README.md',f'{T}/src/ds/project/components/{n}/README.md')
os.makedirs(f'{T}/src/kit'); shutil.copytree(ROOT+'/kit/fonts',f'{T}/src/kit/fonts'); shutil.copytree(ROOT+'/kit/media',f'{T}/src/kit/media')
shutil.copytree(ROOT+'/media',f'{T}/src/media'); shutil.copytree(ROOT+'/appicons',f'{T}/src/appicons'); shutil.copytree(ROOT+'/email',f'{T}/src/email')
shutil.copytree(ROOT+'/gen/repo',f'{T}/src/gen/repo')
for f in ('build.sh','README.md'): shutil.copy(f'{ROOT}/gen/repo/tools/{f}',f'{T}/{f}')
os.chmod(f'{T}/build.sh',0o755)
if shutil.which('zip'): subprocess.run(['zip','-qr','patchbay.zip','patchbay','-x','patchbay/tools/*','patchbay/.github/*','patchbay/tests/*'],cwd=ROOT+'/export',check=True)
else: print('note: zip not found, skipping patchbay.zip')
print(len(comps))
