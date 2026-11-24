import { test, expect } from '@playwright/test';

// Tokens, theme fallback, right-to-left and reduced motion. All run against the demo page.
async function open(page, { theme = 'light', edge = 'soft', dir } = {}) {
  await page.addInitScript(([t, e]) => {
    localStorage.setItem('pb-theme', t);
    localStorage.setItem('pb-edge', e);
  }, [theme, edge]);
  await page.goto('/demo.html');
  await page.evaluate(() => document.fonts.ready);
  if (dir) await page.evaluate((d) => document.documentElement.setAttribute('dir', d), dir);
}

test('token families are defined on :root', async ({ page }) => {
  await open(page);
  const v = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(['--pb-text-13', '--pb-dur-1', '--pb-dur-2', '--pb-dur-3', '--pb-ease', '--pb-z-base', '--pb-z-toast', '--pb-focus-width', '--pb-focus-offset', '--pb-focus-color']
      .map((n) => [n, cs.getPropertyValue(n).trim()]));
  });
  for (const [k, val] of Object.entries(v)) expect(val, k).not.toBe('');
  expect(Number(v['--pb-z-toast'])).toBeGreaterThan(Number(v['--pb-z-base']));
});

test('dark system setting applies when the page has no data-theme', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/demo.html');
  await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); });
  const dark = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  expect(dark).toBe('#14120e');
  await page.evaluate(() => { document.documentElement.setAttribute('data-theme', 'light'); });
  const light = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  expect(light).toBe('#faf8f3');
  await ctx.close();
});

for (const width of [1280, 375]) {
  test(`dir=rtl: no extra horizontal overflow and chevrons mirror at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    const ltr = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    const rtl = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(rtl, 'RTL must not overflow more than LTR').toBeLessThanOrEqual(Math.max(ltr, 0) + 1);
    const flip = await page.evaluate(() => {
      const el = document.querySelector('.pb-icon--chevron-right');
      return el ? getComputedStyle(el).scale : null;
    });
    expect(flip).toBe('-1 1');
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
    const back = await page.evaluate(() => getComputedStyle(document.querySelector('.pb-icon--chevron-right')).scale);
    expect(back).toBe('none');
  });
}

test('dir=rtl: a nav count moves from the inline end to the inline start', async ({ page }) => {
  await open(page);
  const pos = () => page.evaluate(() => {
    const c = document.querySelector('.pb-nav__item .pb-count, .pb-nav__item .pb-badge');
    const r = c.getBoundingClientRect(), p = c.closest('.pb-nav__item').getBoundingClientRect();
    return { start: r.left - p.left, end: p.right - r.right };
  });
  const ltr = await pos();
  expect(ltr.end).toBeLessThan(ltr.start);
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  const rtl = await pos();
  expect(rtl.start).toBeLessThan(rtl.end);
});
