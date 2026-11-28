import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Every theme x edge combination: axe and the screenshots both run in all four.
const themes = [
  { theme: 'light', edge: 'soft' },
  { theme: 'light', edge: 'hard' },
  { theme: 'dark', edge: 'soft' },
  { theme: 'dark', edge: 'hard' },
];

async function open(page, { theme, edge }) {
  await page.addInitScript(([t, e]) => {
    localStorage.setItem('pb-theme', t);
    localStorage.setItem('pb-edge', e);
  }, [theme, edge]);
  await page.goto('/demo.html');
  await page.evaluate(() => document.fonts.ready);
  // Freeze anything that changes over time so screenshots are stable.
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
}

for (const t of themes) {
  test(`accessibility: ${t.theme} ${t.edge}`, async ({ page }) => {
    await open(page, t);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .disableRules(['target-size'])
      .exclude('iframe')
      .analyze();
    // Target size (WCAG 2.2, 2.5.8) runs on its own: DualRange is two native range inputs laid over one track on purpose, so
    // axe sees two overlapping 100%-wide targets. Its real targets are the two thumbs, which sit apart; everything else is checked.
    const targets = await new AxeBuilder({ page })
      .withRules(['target-size'])
      .exclude('iframe')
      .exclude('.pb-range2 .pb-range')
      .analyze();
    const serious = [...results.violations, ...targets.violations].filter((v) => ['serious', 'critical'].includes(v.impact));
    const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`).join('\n');
    expect(serious, report).toEqual([]);
  });

  test(`screenshots: ${t.theme} ${t.edge}`, async ({ page }) => {
    await open(page, t);
    const ids = await page.$$eval('main section.spec[id]', (els) => els.map((e) => e.id));
    expect(ids.length).toBeGreaterThan(50);
    for (const id of ids) {
      if (['c-logviewer', 'c-logexplorer', 'c-terminal', 'c-uploadqueue', 'c-gauge', 'c-textutils', 'c-timerange', 'c-heatmap'].includes(id)) continue; // live or time-based content
      const el = page.locator(`#${id}`);
      // Scroll without the actionability wait: live demos above (upload queue, terminal) can keep nudging the page, and toHaveScreenshot already waits for a stable image.
      await el.evaluate((e) => e.scrollIntoViewIfNeeded ? e.scrollIntoViewIfNeeded(true) : e.scrollIntoView({ block: "center" }));
      await expect(el).toHaveScreenshot(`${t.theme}-${t.edge}-${id}.png`);
    }
  });
}

test('accessibility at phone width: light soft', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, themes[0]);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .exclude('iframe')
    .exclude('.pb-range2 .pb-range') // two range inputs over one track; see the target-size note above
    .analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`).join('\n');
  expect(serious, report).toEqual([]);
});

test('phone width has no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo.html');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(390);
});

test('no script errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/demo.html');
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test('table of contents: a link for every section, heading links, follows the scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo.html');
  const r = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('main section.spec[id]')].map((s) => s.id);
    const toc = new Set([...document.querySelectorAll('#toc a')].map((a) => a.getAttribute('href').slice(1)));
    const heads = [...document.querySelectorAll('main section.spec[id], main > .band')].filter((s) => {
      const a = s.querySelector(':scope > .spec__meta .hlink, :scope > .band__t .hlink');
      return !a || a.getAttribute('href') !== '#' + s.id;
    }).map((s) => s.id);
    return { missing: ids.filter((i) => !toc.has(i)), heads };
  });
  expect(r.missing).toEqual([]);
  expect(r.heads).toEqual([]);
  await page.locator('#toc a[href="#c-medialist"]').click();
  await expect(page.locator('#toc a[href="#c-medialist"]')).toHaveAttribute('aria-current', 'location');
  await expect(page).toHaveURL(/#c-medialist$/);
  // A short section is marked too, not its taller neighbour.
  for (const id of ['c-skiplink', 'c-badge']) {
    await page.locator(`#toc a[href="#${id}"]`).click();
    await expect(page.locator(`#toc a[href="#${id}"]`)).toHaveAttribute('aria-current', 'location');
  }
  await page.locator('#toc .toc__filter').fill('collection');
  await expect(page.locator('#toc ol ol li:not([hidden])')).toHaveCount(1);
  await page.locator('#toc .toc__filter').press('Enter');
  await expect(page).toHaveURL(/#c-collectioncard$/);
});

test('table of contents at phone width: Contents opens a panel, Esc closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo.html');
  await expect(page.locator('#toc')).toBeHidden();
  await page.locator('.nav__toc').click();
  await expect(page.locator('#toc')).toBeVisible();
  await expect(page.locator('.nav__toc')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#toc .toc__filter')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(page.locator('#toc')).toBeHidden();
  await expect(page.locator('.nav__toc')).toBeFocused();
  await page.locator('.nav__toc').click();
  await page.locator('#toc a[href="#c-dialog"]').click();
  await expect(page.locator('#toc')).toBeHidden();
  await expect(page).toHaveURL(/#c-dialog$/);
  await expect(page.locator('#toc a[href="#c-dialog"]')).toHaveAttribute('aria-current', 'location');
  await expect.poll(() => page.evaluate(() => Math.round(document.getElementById('c-dialog').getBoundingClientRect().top))).toBeLessThan(100);
});
