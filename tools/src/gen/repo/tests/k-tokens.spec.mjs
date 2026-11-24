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

test('reduced motion stops spinners, pulses, stripes and the skeleton; normal motion keeps them', async ({ browser }) => {
  const probe = async (reducedMotion) => {
    const ctx = await browser.newContext({ reducedMotion });
    const page = await ctx.newPage();
    await page.goto('/demo.html');
    const r = await page.evaluate(() => {
      const make = (html) => { const d = document.createElement('div'); d.className = 'pb'; d.innerHTML = html; document.body.append(d); return d.firstElementChild; };
      const out = {};
      const items = {
        spin: '<span class="pb-icon pb-icon--spin"></span>',
        spinner: '<span class="pb-spinner"></span>',
        skel: '<div class="pb-skel"></div>',
        progress: '<progress class="pb-progressbar"></progress>',
        live: '<div class="pb-log"><span class="pb-log__live"></span></div>',
      };
      for (const [k, h] of Object.entries(items)) {
        const el = make(h);
        out[k] = k === 'live' ? getComputedStyle(el.firstElementChild, '::before').animationName : getComputedStyle(el).animationName;
      }
      return out;
    });
    await ctx.close();
    return r;
  };
  const reduce = await probe('reduce');
  for (const [k, v] of Object.entries(reduce)) expect(v, `${k} under reduce`).toBe('none');
  const normal = await probe('no-preference');
  for (const k of ['spin', 'spinner', 'progress', 'live']) expect(normal[k], `${k} normally`).not.toBe('none');
});

test('the active option in a listbox is more than a faint tint', async ({ page }) => {
  await open(page);
  const c = await page.evaluate(() => {
    const l = document.createElement('div'); l.className = 'pb pb-listbox'; l.innerHTML = '<div class="pb-option" data-active>One</div>'; document.body.append(l);
    return getComputedStyle(l.firstElementChild).boxShadow;
  });
  expect(c).toContain('3px');
});

test('a Card marked aria-current shows a tint and a check, not only a ring', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const d = document.createElement('div'); d.className = 'pb pb-card pb-card--outline'; d.setAttribute('aria-current', 'true'); document.body.append(d);
    return { bg: getComputedStyle(d).backgroundColor, check: getComputedStyle(d, '::after').content };
  });
  expect(r.bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(r.check).not.toBe('none');
});

test('EventCalendar agenda chips keep their text on a narrow container', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await open(page);
  const w = await page.evaluate(() => {
    const el = document.querySelector('.pb-evcal__agenda .pb-evcal__ev');
    return el ? el.getBoundingClientRect().width : null;
  });
  if (w !== null) expect(w).toBeGreaterThan(40);
});

test('an ImageViewer video tile always shows its play badge', async ({ page }) => {
  await open(page);
  const c = await page.evaluate(() => {
    const a = document.querySelector('.pb-gallery a[data-kind="video"]');
    return a ? getComputedStyle(a, '::before').content : null;
  });
  if (c !== null) expect(c).not.toBe('none');
});
