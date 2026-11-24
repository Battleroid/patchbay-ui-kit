// Renders the README's header image, light and dark, from a built kit.
//   npm run readme:header            (reads the repo root build)
//   node tools/readme-header.mjs <built-dir> <out-dir>
// The header is drawn with the kit itself: a short description of the kit and of demo.html on the left, and screenshots of
// two component examples (Dashboard light, AppShell dark) on the right. It writes header-light.png and header-dark.png, which
// the README shows through <picture> so GitHub picks the one for the reader's theme. Run it after a visual change and commit
// the images in tools/src/media/readme (the build copies them to media/readme).
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const built = resolve(process.argv[2] || root);
const out = resolve(process.argv[3] || join(root, 'tools/src/media/readme'));
const require = createRequire(join(root, 'package.json'));
const { chromium } = require('@playwright/test');

const components = readdirSync(join(built, 'components')).length;
const url = (p) => pathToFileURL(join(built, p)).href;

async function shot(browser, name, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => { localStorage.setItem('pb-theme', t); localStorage.setItem('pb-edge', 'soft'); }, theme);
  const page = await ctx.newPage();
  await page.goto(url(`components/${name}/example.html`));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  return 'data:image/png;base64,' + png.toString('base64');
}

function banner(theme, light, dark) {
  return `<!doctype html><html lang="en" data-theme="${theme}" data-edge="soft"><head><meta charset="utf-8">
<link rel="stylesheet" href="${url('patchbay.css')}">
<style>
  body { margin: 0; }
  .hdr { box-sizing: border-box; width: 1280px; height: 600px; padding: 56px 0 56px 64px; display: grid; grid-template-columns: 470px 1fr;
         gap: 40px; align-items: center; overflow: hidden; background: var(--surface-sunk); position: relative; }
  .hdr__text { display: grid; gap: 18px; align-content: center; }
  .hdr__name { margin: 0; font: 600 64px/1 var(--font-serif); letter-spacing: -0.02em; color: var(--ink); }
  .hdr__lede { margin: 0; font: 400 21px/1.45 var(--font-serif); color: var(--ink-muted); }
  .hdr__pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .hdr__demo { margin: 6px 0 0; padding: 14px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface);
               font: 400 15px/1.5 var(--font-serif); color: var(--ink); }
  .hdr__demo code { font: 500 14px/1 var(--font-mono); }
  .hdr__shots { position: relative; height: 100%; }
  .hdr__shot { position: absolute; width: 600px; border-radius: 14px; border: 1px solid var(--line); box-shadow: var(--shadow-soft-lg); }
  .hdr__shot--a { top: 0; left: 0; }
  .hdr__shot--b { top: 150px; left: 104px; }
</style></head><body class="pb">
<div class="hdr">
  <div class="hdr__text">
    <h1 class="hdr__name">Patchbay</h1>
    <p class="hdr__lede">A CSS and JavaScript UI kit for self-hosted apps: forms, tables, charts, media, dialogs and app shells.</p>
    <div class="hdr__pills"><span class="pb-pill">${components} components</span><span class="pb-pill">light · dark</span><span class="pb-pill">soft · hard edges</span><span class="pb-pill">strict CSP</span><span class="pb-pill">no build step</span></div>
    <p class="hdr__demo"><b>The demo</b> is <code>demo.html</code>: every component in every state, with the theme and edge switches. Clone the repo and open it in a browser.</p>
  </div>
  <div class="hdr__shots"><img class="hdr__shot hdr__shot--a" src="${light}" alt=""><img class="hdr__shot hdr__shot--b" src="${dark}" alt=""></div>
</div></body></html>`;
}

const browser = await chromium.launch();
const shots = { light: await shot(browser, 'Dashboard', 'light'), dark: await shot(browser, 'AppShell', 'dark') };
mkdirSync(out, { recursive: true });
// The banner is a file:// page, so it may load the build's stylesheet and fonts by file URL.
const tmp = mkdtempSync(join(tmpdir(), 'pb-header-'));
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 600 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  const file = join(tmp, `header-${theme}.html`);
  writeFileSync(file, banner(theme, shots.light, shots.dark));
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.locator('.hdr').screenshot({ path: join(out, `header-${theme}.png`) });
  await ctx.close();
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
console.log(`wrote header-light.png and header-dark.png (${components} components) to ${out}`);
