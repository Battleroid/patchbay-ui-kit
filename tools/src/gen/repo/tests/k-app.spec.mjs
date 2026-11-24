// App patterns: notice, confirm hook, bulk, upload queue, unload guard, autosubmit, busy regions, shortcuts, notify and drop-zone settling.
import { test, expect } from '@playwright/test';

async function load(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/tests/fixtures/csp.html');
  await page.waitForFunction(() => window.pbReady === true);
  return errors;
}
const sec = (page, n) => page.locator(`[data-fixture="${n}"]`);

test('notice: text is escaped, bodyHTML is the opt-in, down is an alert', async ({ page }) => {
  await load(page);
  const out = await page.evaluate(() => {
    const c = document.createElement('div'); document.body.append(c);
    const n = pbNoticeInto(c, { variant: 'down', title: '<b>t</b>', body: '<i>b</i>', actions: [{ label: 'Retry', onClick: () => { window.__clicked = 1; } }, { label: 'Log', href: 'javascript:alert(1)' }], dismissible: true });
    const raw = pbNotice({ title: 'x', bodyHTML: '<code>ok</code>' });
    n.querySelector('[data-i="0"]').click();
    return { role: n.getAttribute('role'), bold: n.querySelectorAll('b,i').length, text: n.querySelector('.pb-notice__title').textContent, raw: /<code>ok<\/code>/.test(raw), clicked: window.__clicked, links: n.querySelectorAll('a').length };
  });
  expect(out).toEqual({ role: 'alert', bold: 0, text: '<b>t</b>', raw: true, clicked: 1, links: 0 });
});

test('confirm hook: cancel does nothing, confirm submits with the button value, type-to-confirm gates', async ({ page }) => {
  await load(page);
  await page.evaluate(() => { window.__subs = []; document.querySelector('[data-fixture="ConfirmAction"] form').addEventListener('submit', (e) => { e.preventDefault(); window.__subs.push(e.submitter.name + '=' + e.submitter.value); }); });
  const s = sec(page, 'ConfirmAction');
  await s.getByRole('button', { name: 'Delete share' }).click();
  const dlg = page.getByRole('dialog', { name: 'Delete this share?' });
  await expect(dlg).toBeVisible();
  await dlg.getByRole('button', { name: 'Cancel' }).click();
  expect(await page.evaluate(() => window.__subs)).toEqual([]);
  await s.getByRole('button', { name: 'Delete share' }).click();
  await page.getByRole('dialog', { name: 'Delete this share?' }).getByRole('button', { name: 'Delete share' }).click();
  await expect.poll(() => page.evaluate(() => window.__subs)).toEqual(['delete=rack-rebuild']);
  // type to confirm
  await s.getByRole('button', { name: 'Revoke key' }).click();
  const d2 = page.getByRole('dialog', { name: 'Revoke the ops key?' });
  const ok = d2.getByRole('button', { name: 'Revoke key' });
  await expect(ok).toBeDisabled();
  await d2.locator('input').fill('ops');
  await expect(ok).toBeEnabled();
  await ok.click();
  await expect.poll(() => page.evaluate(() => window.__subs.length)).toBe(2);
  // a link: confirmed click follows it
  await s.getByRole('link', { name: 'Leave page' }).click();
  await page.getByRole('dialog', { name: 'Leave without saving?' }).getByRole('button', { name: 'Leave' }).click();
  await expect.poll(() => page.url()).toContain('#left');
});

test('bulk: shift-click range, select all matching, grid select all', async ({ page }) => {
  await load(page);
  const t = sec(page, 'BulkActions').locator('[data-bulk]').first();
  const boxes = t.locator('.pb-check[data-row]');
  await boxes.nth(0).uncheck(); await boxes.nth(1).uncheck(); await boxes.nth(3).uncheck();
  await expect(t.locator('.pb-bulkbar')).toBeHidden();
  await boxes.nth(0).click();
  await boxes.nth(3).click({ modifiers: ['Shift'] });
  for (let i = 0; i < 4; i++) await expect(boxes.nth(i)).toBeChecked();
  // all matching is offered once the whole page is selected
  const on = t.locator('[data-bulk-matching]');
  await expect(on).toBeVisible();
  await expect(on).toHaveText('Select all 248 matching');
  const field = t.locator('[data-bulk-matching-field]');
  await expect(field).toBeDisabled();
  await on.click();
  await expect(t.locator('[data-bulk-count]')).toHaveText('All 248 matching selected');
  await expect(field).toBeEnabled();
  const detail = await page.evaluate(() => new Promise((r) => { const s = document.querySelector('[data-fixture="BulkActions"] [data-bulk]'); s.addEventListener('pb:bulk', (e) => r(e.detail), { once: true }); s.querySelector('[data-bulk-action="stop"]').click(); }));
  expect(detail.all).toBe(true); expect(detail.count).toBe(248); expect(detail.action).toBe('stop');
  await boxes.nth(2).uncheck();
  await expect(field).toBeDisabled();
  await expect(t.locator('[data-bulk-count]')).toHaveText('3 selected');
  // grid: select-all box and Space on a tile
  const g = sec(page, 'BulkActions').locator('[data-bulk]').nth(1);
  await g.locator('[data-all]').check();
  await expect(g.locator('[data-bulk-item][data-selected]')).toHaveCount(6);
  await g.locator('[data-all]').uncheck();
  await g.locator('[data-bulk-item]').nth(1).focus();
  await page.keyboard.press('Space');
  await expect(g.locator('[data-bulk-item][data-selected]')).toHaveCount(1);
  await g.locator('[data-bulk-item]').nth(4).focus();
  await page.keyboard.press('Shift+Space');
  await expect(g.locator('[data-bulk-item][data-selected]')).toHaveCount(4);
});

test('upload queue: row states, retry, cancel, remove, cancel all, processing', async ({ page }) => {
  await load(page);
  const out = await page.evaluate(() => {
    const q = document.querySelector('[data-fixture="UploadQueue"] [data-upq]'), ev = [];
    ['cancel', 'retry', 'remove'].forEach((n) => q.addEventListener('pb:' + n, (e) => ev.push(n + ':' + e.detail.name)));
    const a = q.pbAdd({ name: 'a.jpg', size: 1000 }), b = q.pbAdd({ name: 'b.jpg', size: 1000 }), c = q.pbAdd({ name: 'c.jpg', size: 1000 });
    a.start(); a.progress(500, 100); const half = a.li.querySelector('.pb-upq__txt').textContent;
    a.process(); const proc = a.li.dataset.state;
    a.done(); b.start(); b.fail('Disk full');
    const failed = b.li.querySelector('.pb-upq__txt').textContent;
    b.li.querySelector('[data-a=retry]').click(); const afterRetry = b.state;
    c.start(); c.li.querySelector('[data-a=cancel]').click();
    q.pbAdd({ name: 'd.jpg', size: 10 }).start(); q.pbAdd({ name: 'e.jpg', size: 10 });
    q.querySelector('[data-upq-cancel-all]').click();
    const states = q.pbItems().map((i) => i.state).join(',');
    a.li.querySelector('[data-a=remove]').click();
    return { half, proc, failed, afterRetry, ev, states, left: q.pbItems().length };
  });
  expect(out.half).toMatch(/^50%/);
  expect(out.proc).toBe('processing');
  expect(out.failed).toBe('Disk full');
  expect(out.afterRetry).toBe('queued');
  expect(out.ev).toContain('retry:b.jpg'); expect(out.ev).toContain('cancel:c.jpg'); expect(out.ev).toContain('cancel:d.jpg'); expect(out.ev).toContain('remove:a.jpg');
  expect(out.states).toBe('done,canceled,canceled,canceled,canceled');
  expect(out.left).toBe(4);
});

test('unload guard: blocks while a test says so, drops when the owner leaves the DOM', async ({ page }) => {
  await load(page);
  const r = await page.evaluate(() => {
    const el = document.createElement('div'); document.body.append(el); let dirty = true;
    const off = pbGuardUnload(el, () => dirty);
    const fire = () => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; };
    const a = fire(); dirty = false; const b = fire(); dirty = true; const c = fire(); el.remove(); const d = fire();
    const el2 = document.createElement('div'); document.body.append(el2); const off2 = pbGuardUnload(el2, () => true); const e1 = fire(); off2(); const e2 = fire();
    return [a, b, c, d, e1, e2];
  });
  expect(r).toEqual([true, false, true, false, true, false]);
  // the upload queue guards while a transfer runs
  const q = await page.evaluate(() => { const u = document.querySelector('[data-fixture="UploadQueue"] [data-upq]'), it = u.pbAdd({ name: 'z', size: 5 }); it.start(); const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); const x = e.defaultPrevented; it.done(); const e2 = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e2); return [x, e2.defaultPrevented]; });
  expect(q).toEqual([true, false]);
});

test('autosubmit: change submits once, debounced; the button is hidden by script', async ({ page }) => {
  await load(page);
  await page.evaluate(() => { window.__n = 0; document.querySelector('form[data-autosubmit]').addEventListener('submit', (e) => { e.preventDefault(); window.__n++; }); });
  const f = sec(page, 'AutoSubmit').locator('form');
  await expect(f.locator('[data-autosubmit-button]')).toBeHidden();
  await f.locator('select').selectOption('30d');
  await f.locator('input[name=bots]').check();
  await expect.poll(() => page.evaluate(() => window.__n)).toBe(1);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__n)).toBe(1);
});

test('busy: the spinner waits 300 ms and pbBusy sets aria-busy', async ({ page }) => {
  await load(page);
  const r = sec(page, 'BusyRegion').locator('[data-busy-region]');
  await page.evaluate(() => pbBusy(true, '[data-busy-region]'));
  await expect(r).toHaveAttribute('aria-busy', 'true');
  const op = () => r.evaluate((e) => getComputedStyle(e, '::after').opacity);
  expect(await op()).toBe('0');
  await page.waitForTimeout(450);
  expect(await op()).toBe('1');
  expect(await r.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
  await page.evaluate(() => pbBusy(false, '[data-busy-region]'));
  await expect(r).not.toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() => pbBusy(true));
  await expect(page.locator('.pb-busybar')).toBeVisible();
  await page.evaluate(() => pbBusy(false));
  await expect(page.locator('.pb-busybar')).toBeHidden();
});

test('shortcuts: fire outside fields, ignored in inputs, mod combos allowed, ? opens the sheet', async ({ page }) => {
  await load(page);
  await page.evaluate(() => {
    window.__k = [];
    window.__reg = pbShortcuts({ n: { do: () => window.__k.push('n'), desc: 'New thing' }, 'g o': { do: () => window.__k.push('go'), desc: 'Go to overview', group: 'go to' }, 'mod+enter': { do: () => window.__k.push('save'), desc: 'Save' }, '/': '[data-fixture="AutoSubmit"] select' });
  });
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('n');
  await page.keyboard.press('g'); await page.keyboard.press('o');
  expect(await page.evaluate(() => window.__k)).toEqual(['n', 'go']);
  const input = sec(page, 'Shortcuts').locator('input[type=search]').first();
  await input.focus();
  await page.keyboard.press('n');
  expect(await page.evaluate(() => window.__k)).toEqual(['n', 'go']);
  await page.keyboard.press('ControlOrMeta+Enter');
  expect(await page.evaluate(() => window.__k)).toEqual(['n', 'go', 'save']);
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('/');
  expect(await page.evaluate(() => document.activeElement.tagName)).toBe('SELECT');
  expect(await page.locator('[data-fixture="AutoSubmit"] select').getAttribute('aria-keyshortcuts')).toBe('/');
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('?');
  const dlg = page.locator('dialog.pb-keys[open]');
  await expect(dlg).toBeVisible();
  await expect(dlg.getByText('New thing', { exact: true })).toBeVisible();
  await expect(dlg.getByText('Go to overview', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
});

test('notify and drop-zone settings wait for the app instead of faking a result', async ({ page }) => {
  await load(page);
  const n = sec(page, 'NotifySettings').locator('[data-notify]');
  const btn = n.locator('[data-test="email"]');
  await btn.click();
  await expect(btn).toHaveText('Sending…');
  await page.waitForTimeout(1000);
  await expect(btn).toHaveText('Sending…');
  await n.evaluate((e) => e.dispatchEvent(new CustomEvent('pb:saved')));
  await expect(btn).toHaveText('Test');
  await expect(n.locator('[data-notify-status]')).toHaveText('Test sent to email');
  const d = sec(page, 'DropZone').locator('[data-dropset]').first();
  const def = d.locator('[data-dropset-default]');
  await d.locator('.pb-dropset__bar').click();
  await def.click();
  await expect(def).toHaveText('Saving…');
  await page.waitForTimeout(1500);
  await expect(def).toHaveText('Saving…');
  await d.evaluate((e) => e.dispatchEvent(new CustomEvent('pb:saved')));
  await expect(def).toHaveText('Saved');
});

test('share link, ring and teaser hooks render', async ({ page }) => {
  await load(page);
  const s = sec(page, 'ShareLink');
  await expect(s.locator('[data-copy-value]')).toHaveCount(2);
  await expect(s.locator('.pb-sharelink__url')).toHaveCount(1);
  await expect(s.locator('[data-qr] svg').first()).toHaveCount(1);
  const ring = sec(page, 'StorageRing').locator('[data-ring]');
  await expect(ring.first()).toHaveAttribute('aria-label', 'Storage 62% used');
  await expect(ring.nth(1)).toHaveAttribute('data-level', 'warn');
  const t = sec(page, 'MediaState').locator('[data-teaser]');
  await t.hover();
  await expect(t.locator('video.pb-teaser__video')).toHaveCount(1, { timeout: 3000 });
  await page.mouse.move(0, 0);
  await expect(t.locator('video')).toHaveCount(0);
});

test('query filter: no preselect, Tab commits only typed text and moves on, Space never commits', async ({ page }) => {
  await load(page);
  const qf = sec(page, 'QueryFilter').locator('[data-qf]').first();
  const inp = qf.locator('.pb-qf__box input');
  const chips = qf.locator('.pb-qf__chip');
  const before = await chips.count();
  await inp.focus();
  await expect(qf.locator('.pb-qf__menu')).toBeVisible();
  await expect(qf.locator('.pb-qf__opt[aria-selected="true"]')).toHaveCount(0);
  await page.keyboard.press('Tab');
  expect(await inp.evaluate((e) => document.activeElement === e)).toBe(false);
  expect(await chips.count()).toBe(before);
  await inp.focus();
  await page.keyboard.type('status:down');
  await page.keyboard.press('Space');
  expect(await chips.count()).toBe(before);
  await page.keyboard.press('Tab');
  expect(await chips.count()).toBe(before + 1);
  expect(await inp.evaluate((e) => document.activeElement === e)).toBe(false);
  await inp.focus();
  await page.keyboard.press('ArrowDown');
  await expect(qf.locator('.pb-qf__opt[aria-selected="true"]')).toHaveCount(1);
});

test('upload queue: the Add files picker is reachable by keyboard and shows a focus ring', async ({ page }) => {
  await load(page);
  const s = sec(page, 'UploadQueue');
  await s.locator('[data-upq-demo]').focus();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.activeElement.matches('[data-upq-pick]'))).toBe(true);
  const ring = await s.locator('label.pb-btn:has([data-upq-pick])').evaluate((l) => getComputedStyle(l).outlineStyle);
  expect(ring).not.toBe('none');
  const out = await page.evaluate(() => {
    const q = document.querySelector('[data-fixture="UploadQueue"] [data-upq]');
    q.pbItems().slice().forEach((i) => i.remove());
    const a = q.pbAdd({ name: 'a', size: 10 }), b = q.pbAdd({ name: 'b', size: 10 }), c = q.pbAdd({ name: 'c', size: 10 });
    [a, b, c].forEach((i) => i.start()); a.process(); b.process(); c.done();
    const t1 = q.querySelector('.pb-upq__title').firstChild.textContent; const icon = a.li.querySelector('.pb-icon').className;
    a.done(); b.done();
    return [t1, icon, q.querySelector('.pb-upq__title').firstChild.textContent];
  });
  expect(out[0]).toBe('Processing 2 · 1 done');
  expect(out[1]).not.toContain('refresh');
  expect(out[2]).toBe('3 uploaded');
});

test('markdown editor: its own shortcut does not also open the palette; the toolbar is one tab stop', async ({ page }) => {
  await load(page);
  const md = sec(page, 'MarkdownEditor').locator('[data-md]').first();
  const ta = md.locator('textarea');
  await ta.focus();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('dialog.pb-cmd[open]')).toHaveCount(0);
  expect(await ta.inputValue()).toContain('](https://)');
  await expect(md.locator('[data-md-cmd][tabindex="0"]')).toHaveCount(1);
  await md.locator('[data-md-cmd]').first().focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => document.activeElement.dataset.mdCmd)).toBe('italic');
  await expect(md.locator('[data-md-cmd][tabindex="0"]')).toHaveCount(1);
  expect(await md.locator('[data-md-cmd="bold"]').getAttribute('title')).toMatch(/\((⌘|Ctrl\+)B\)/);
});

test('event calendar: the grid moves with the keys, plural labels, phone day targets', async ({ page }) => {
  await load(page);
  const cal = sec(page, 'EventCalendar').locator('[data-evcal]').first();
  const stop = cal.locator('.pb-evcal__day[tabindex="0"]');
  await expect(stop).toHaveCount(1);
  expect(await stop.getAttribute('data-date')).toBe('2026-11-22');
  await stop.focus();
  const cur = () => page.evaluate(() => document.activeElement.dataset.date);
  await page.keyboard.press('ArrowRight');
  expect(await cur()).toBe('2026-11-23');
  await page.keyboard.press('ArrowDown');
  expect(await cur()).toBe('2026-11-30');
  await page.keyboard.press('Home');
  expect(await cur()).toBe('2026-11-29');
  await page.keyboard.press('PageDown');
  expect(await cur()).toBe('2026-12-29');
  await page.keyboard.press('PageUp');
  expect(await cur()).toBe('2026-11-29');
  await expect(cal.locator('.pb-evcal__day[tabindex="0"]')).toHaveCount(1);
  const labels = await cal.locator('.pb-evcal__day').evaluateAll((l) => l.map((x) => x.getAttribute('aria-label')));
  expect(labels.some((t) => /\b1 events\b/.test(t))).toBe(false);
  expect(labels.some((t) => /, 1 event\b/.test(t))).toBe(true);
  expect(labels.some((t) => /failed/.test(t))).toBe(true);
  const withEv = await cal.locator('.pb-evcal__day:has(.pb-evcal__ev)').first().getAttribute('data-date');
  await cal.locator(`.pb-evcal__day[data-date="${withEv}"]`).focus();
  await page.keyboard.press('Enter');
  await expect(cal.locator('.pb-evcal__agenda')).toBeVisible();
  expect(await page.evaluate(() => document.activeElement.closest('li').dataset.date)).toBe(withEv);
  await cal.locator('[data-evcal-view] input[value="month"]').check({ force: true });
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(cal.locator('.pb-evcal__grid .pb-evcal__ev').first()).toBeHidden();
  const hs = await cal.locator('.pb-evcal__day').evaluateAll((l) => l.map((x) => x.getBoundingClientRect().height));
  expect(Math.min(...hs)).toBeGreaterThanOrEqual(44);
});

test('virtual list: End announces the last row through aria-activedescendant', async ({ page }) => {
  await load(page);
  const vl = sec(page, 'VirtualList').locator('[data-vlist]').first();
  await vl.focus();
  await page.keyboard.press('End');
  await page.waitForTimeout(100);
  const r = await vl.evaluate((e) => { const id = e.getAttribute('aria-activedescendant'), row = id && document.getElementById(id); return { role: e.getAttribute('role'), id: !!id, pos: row && row.getAttribute('aria-posinset'), sel: row && row.getAttribute('aria-selected'), rowRole: row && row.getAttribute('role') }; });
  expect(r).toEqual({ role: 'listbox', id: true, pos: '5000', sel: 'true', rowRole: 'option' });
});

test('storage ring: visible percent, named, 24 px target', async ({ page }) => {
  await load(page);
  const b = sec(page, 'StorageRing').getByRole('button', { name: 'Storage 62% used' });
  await expect(b).toContainText('62%');
  const box = await b.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(24); expect(box.height).toBeGreaterThanOrEqual(24);
  await b.click();
  await expect(page.locator('#ring-pop:popover-open')).toHaveCount(1);
});
