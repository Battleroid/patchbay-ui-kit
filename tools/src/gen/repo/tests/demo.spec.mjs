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
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('iframe')
      .analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
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
