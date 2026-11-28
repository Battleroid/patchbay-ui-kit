// CollectionCard and MediaList's mixed rows, on the CSP fixture.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/tests/fixtures/csp.html'); });

test('collection card: the cover opens the card, the menu stays its own target', async ({ page }) => {
  const hits = await page.evaluate(() => {
    const card = document.querySelector('[data-fixture="CollectionCard"] .pb-coll');
    card.scrollIntoView({ block: 'center' });
    const at = (el) => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); };
    return {
      cover: at(card.querySelector('.pb-coll__cover')).closest('a, button')?.className,
      menu: at(card.querySelector('.pb-coll__menu')).closest('a, button')?.className,
    };
  });
  expect(hits.cover).toContain('pb-coll__link');
  expect(hits.menu).toContain('pb-coll__menu');
});

test('collection card: the current card is outlined in accent', async ({ page }) => {
  const [cur, other, accent] = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-fixture="CollectionCard"] .pb-coll')];
    const c = cards.find((x) => x.querySelector('[aria-current]'));
    const o = cards.find((x) => x !== c && !x.classList.contains('pb-coll--new'));
    const probe = document.createElement('span'); probe.style.color = 'var(--accent)'; document.body.append(probe);
    const a = getComputedStyle(probe).color; probe.remove();
    return [getComputedStyle(c).borderTopColor, getComputedStyle(o).borderTopColor, a];
  });
  expect(cur).toBe(accent);
  expect(other).not.toBe(accent);
});

test('media list: compact rows cut the middle of a long file name and keep the extension', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await page.reload();
  const r = await page.evaluate(() => {
    const name = [...document.querySelectorAll('[data-fixture="MediaList"] .pb-medialist--compact .pb-mitem__name')].find((n) => n.textContent.includes('proxmox'));
    const stem = name.querySelector('.pb-mitem__stem'), ext = name.querySelector('.pb-mitem__ext');
    const nr = name.getBoundingClientRect(), er = ext.getBoundingClientRect();
    return { cut: stem.scrollWidth > stem.clientWidth, extInside: er.width > 0 && er.right <= nr.right + 1, text: name.textContent };
  });
  expect(r.cut).toBe(true);
  expect(r.extInside).toBe(true);
  expect(r.text).toMatch(/full-archive\.zip$/);
});
