// Keyboard and accessibility behaviour of the core libraries: fields and validation, tooltip, phone drawer, list keys,
// toasts and announcements, the data-pb-open opener, tabs in the URL fragment, and the pluggable code area and strength meter.
import { test, expect } from '@playwright/test';
import { expectFocus, pressTimes } from './kb.mjs';

const fixture = '/tests/fixtures/csp.html';
async function ready(page, path) {
  await page.goto(path);
  if (path === fixture) await page.waitForFunction(() => window.pbReady === true);
}

test.describe('fields', () => {
  test('a label names the control and the help describes it', async ({ page }) => {
    await page.goto('/components/TextInput/example.html');
    const host = page.locator('#textinput-hostname');
    await expect(host).toHaveAccessibleName('Hostname');
    await expect(host).toHaveAccessibleDescription('Lowercase, no dots.');
    const port = page.locator('#textinput-port');
    await expect(port).toHaveAttribute('aria-invalid', 'true');
    await expect(port).toHaveAccessibleDescription(/Port must be 1–65535/);
  });

  test('validation marks fields, escapes messages, focuses the first error and fires pb:invalid', async ({ page }) => {
    await page.goto('/components/ErrorSummary/example.html');
    const form = page.locator('form[data-validate]');
    const seen = await page.evaluate(() => {
      const f = document.querySelector('form[data-validate]');
      document.getElementById('es-name').dataset.error = '<b>Enter a name</b>';
      window.__k = { invalid: null, other: null };
      f.addEventListener('pb:invalid', (e) => { window.__k.invalid = e.detail.fields.map((x) => x.id); });
      f.addEventListener('submit', (e) => { window.__k.other = e.pbInvalid.length; });
      return true;
    });
    expect(seen).toBe(true);
    await form.getByRole('button', { name: 'Create share' }).click();
    const name = page.locator('#es-name');
    await expectFocus(page, name);
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAccessibleDescription('<b>Enter a name</b>');
    await expect(page.locator('.pb-field__error b')).toHaveCount(0);
    expect(await page.evaluate(() => window.__k)).toEqual({ invalid: ['es-name', 'es-mail', 'es-days'], other: 3 });
    // The summary links to each field.
    const sum = page.locator('.pb-errsum');
    await expect(sum).toBeVisible();
    await sum.getByRole('link').nth(1).click();
    await expectFocus(page, '#es-mail');
    // Fixing a field clears its error and its description.
    await page.locator('#es-mail').fill('alex@lab.home');
    await expect(page.locator('#es-mail')).not.toHaveAttribute('aria-invalid', /./);
    await expect(page.locator('#es-mail-error')).toHaveCount(0);
    expect(await page.locator('#es-mail').getAttribute('aria-describedby')).toBeNull();
  });

  test('a canceled pb:invalid leaves the fields unmarked', async ({ page }) => {
    await page.goto('/components/ErrorSummary/example.html');
    await page.evaluate(() => document.querySelector('form[data-validate]').addEventListener('pb:invalid', (e) => e.preventDefault()));
    await page.getByRole('button', { name: 'Create share' }).click();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await expect(page.locator('.pb-errsum')).toBeHidden();
  });
});

test.describe('tooltip', () => {
  test('shows on hover and keyboard focus, stays while hovered, Esc dismisses', async ({ page }) => {
    await ready(page, fixture);
    const btn = page.locator('[data-fixture="CopyField"] .pb-tip[data-tip]').first();
    const id = await btn.evaluate((b) => b.getAttribute('aria-describedby'));
    const tip = page.locator(`#${id}`);
    await expect(tip).toHaveAttribute('role', 'tooltip');
    await expect(btn).toHaveAccessibleDescription('Copy');
    await btn.hover();
    await expect(tip).toBeVisible();
    // The pointer can move onto the tooltip without it closing (WCAG 1.4.13).
    const b = await tip.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
    await page.waitForTimeout(400);
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await page.mouse.move(0, 0);
    // Keyboard focus shows it too.
    await btn.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
  });
});

test.describe('phone drawer', () => {
  test.use({ viewport: { width: 375, height: 760 } });
  test('focus moves in, the rest is inert, the scrim and Esc close it, a resize leaves nothing inert', async ({ page }) => {
    await page.goto('/components/AppShell/example.html');
    const shell = page.locator('.pb-shell');
    const menu = page.locator('[data-nav-toggle]');
    const first = shell.locator('.pb-shell__nav .pb-nav__item').first();
    // Closed: the drawer's links are out of the tab order.
    expect(await first.evaluate((a) => getComputedStyle(a).visibility)).toBe('hidden');
    await menu.click();
    await expectFocus(page, first);
    expect(await page.locator('.pb-brand').evaluate((a) => !!a.closest('[inert]'))).toBe(true);
    expect(await menu.evaluate((m) => !!m.closest('[inert]'))).toBe(false);
    const scrim = shell.locator('.pb-shell__scrim');
    await expect(scrim).toBeVisible();
    // Tab stays in the drawer (or goes to Menu), never to the content behind it.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => { const a = document.activeElement; return !a.closest('[inert]'); })).toBe(true);
    }
    // In the contained preview the drawer covers most of the shell; click the strip of scrim beside it.
    const sb = await scrim.boundingBox();
    await scrim.click({ position: { x: sb.width - 4, y: 200 } });
    await expect(shell).not.toHaveAttribute('data-nav-open', /.*/);
    await expectFocus(page, menu);
    await expect(page.locator('[inert]')).toHaveCount(0);
    await menu.click();
    await expectFocus(page, first);
    await page.keyboard.press('Escape');
    await expectFocus(page, menu);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await page.setViewportSize({ width: 1280, height: 760 });
    await expect(page.locator('[inert]')).toHaveCount(0);
    await expect(shell).not.toHaveAttribute('data-nav-open', /.*/);
  });
});

test.describe('list keys', () => {
  test('context menu: arrows, Home/End and typeahead, and no double keys after a second pbInit', async ({ page }) => {
    await page.goto('/components/ContextMenu/example.html');
    await page.evaluate(() => { pbInit(); pbInit(document); });
    // The zone's rows are the tab stop now, and the menu opens for the focused row (Escape returns to it).
    const zone = page.locator('[data-contextmenu] > li').first();
    await zone.focus();
    await page.keyboard.press('Shift+F10');
    const items = page.locator('#ctx-1 .pb-menu__item');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(2)).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('c');
    await expect(items.filter({ hasText: 'Copy path' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expectFocus(page, zone);
  });

  test('menu: Home/End after a second pbInit', async ({ page }) => {
    await page.goto('/components/Menu/example.html');
    await page.evaluate(() => pbInit());
    await page.locator('[popovertarget="mnu"]').click();
    const items = page.locator('#mnu [role^=menuitem]');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.last()).toBeFocused();
  });

  test('combobox: arrows open and move the active option, then Home/End, with aria-activedescendant', async ({ page }) => {
    await page.goto('/components/Combobox/example.html');
    const input = page.getByRole('combobox', { name: 'Host' });
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    const active = () => page.evaluate(() => { const i = document.activeElement, a = i.getAttribute('aria-activedescendant'); return a && document.getElementById(a).dataset.value; });
    expect(await active()).toBe('nas-01');
    await pressTimes(page, 'ArrowDown', 2);
    expect(await active()).toBe('pve-02');
    await page.keyboard.press('End');
    expect(await active()).toBe('router');
    await page.keyboard.press('Home');
    expect(await active()).toBe('nas-01');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('pve-01');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('toasts', () => {
  test('the live regions exist before the first toast, and toasts are announced', async ({ page }) => {
    await page.goto('/components/Toast/example.html');
    await expect(page.locator('[data-pb-live="polite"]')).toHaveCount(1);
    await expect(page.locator('[data-pb-live="assertive"]')).toHaveCount(1);
    await page.evaluate(() => pbToast({ title: 'Settings saved', body: 'Applies on restart.' }));
    await expect(page.locator('[data-pb-live="polite"]')).toHaveText('Settings saved. Applies on restart.');
    await page.evaluate(() => pbToast({ variant: 'error', title: 'Backup failed' }));
    await expect(page.locator('[data-pb-live="assertive"]')).toHaveText('Backup failed');
    // An error persists: no timer.
    await expect(page.locator('body > .pb-toasts .pb-toast[data-status="down"] .pb-toast__timer')).toHaveCount(0);
  });

  test('three show at once, the rest wait in order, and an action runs', async ({ page }) => {
    await page.goto('/components/Toast/example.html');
    await page.evaluate(() => { for (let i = 1; i <= 5; i++) pbToast({ title: 'Toast ' + i, timeout: 0, action: i === 1 ? { label: 'Undo', onClick: () => { window.__undo = true; } } : undefined }); });
    const box = page.locator('body > .pb-toasts');
    await expect(box.locator('.pb-toast:visible')).toHaveCount(3);
    await expect(box.locator('.pb-toast[data-queued]')).toHaveCount(2);
    await box.getByRole('button', { name: 'Undo' }).click();
    expect(await page.evaluate(() => window.__undo)).toBe(true);
    await expect(box.locator('.pb-toast:visible')).toHaveCount(3);
    await expect(box.locator('.pb-toast:visible .pb-toast__title')).toHaveText(['Toast 2', 'Toast 3', 'Toast 4']);
    await expect(page.locator('[data-pb-live="polite"]')).toHaveText('Toast 4');
    // Dismissing a toast from the keyboard moves focus on, not to the page top.
    await box.locator('.pb-toast:visible [data-x]').first().focus();
    await page.keyboard.press('Enter');
    await expect(box.locator('.pb-toast:visible .pb-toast__title')).toHaveText(['Toast 3', 'Toast 4', 'Toast 5']);
    expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
  });
});

test.describe('opener', () => {
  test('data-pb-open opens the dialog and fires pb:show with the opener', async ({ page }) => {
    await page.goto('/components/Dialog/example.html');
    await page.evaluate(() => document.getElementById('dlg-form').addEventListener('pb:show', (e) => { window.__opener = e.detail.opener.textContent.trim(); }));
    await page.getByRole('button', { name: 'Form', exact: true }).click();
    await expect(page.locator('#dlg-form')).toHaveJSProperty('open', true);
    expect(await page.evaluate(() => window.__opener)).toBe('Form');
    await page.keyboard.press('Escape');
    await expect(page.locator('#dlg-form')).toHaveJSProperty('open', false);
  });

  test('the palette opens from data-pb-open, filters, and runs a JSON item', async ({ page }) => {
    await page.goto('/components/CommandPalette/example.html');
    await page.evaluate(() => {
      const d = document.getElementById('cmdk');
      d.pbAdd([{ label: 'pages', items: [{ label: 'Audit log', href: '#audit', keywords: 'history' }] }]);
      d.addEventListener('pb:command', (e) => { window.__cmd = e.detail.command; window.__href = e.detail.href; e.preventDefault(); });
    });
    await page.locator('[data-pb-open="#cmdk"]').click();
    const input = page.getByRole('combobox', { name: 'Search commands' });
    await expectFocus(page, input);
    await input.fill('history');
    await expect(page.locator('#cmdk .pb-cmd__item:visible')).toHaveCount(1);
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => [window.__cmd, window.__href])).toEqual(['Audit log', '#audit']);
    await expect(page.locator('#cmdk')).toHaveJSProperty('open', false);
    expect(await page.evaluate(() => location.hash)).toBe('');
  });
});

test('palette: items from the JSON block and from data-cmd-src', async ({ page }) => {
  await page.route('**/cmd-src.json', (r) => r.fulfill({ json: { sections: [{ label: 'admin', items: [{ label: 'Audit log', action: 'audit', keywords: 'history' }] }] } }));
  await page.goto('/components/CommandPalette/example.html');
  await page.evaluate(() => document.getElementById('cmdk').setAttribute('data-cmd-src', 'cmd-src.json'));
  await page.locator('[data-pb-open="#cmdk"]').click();
  const input = page.getByRole('combobox', { name: 'Search commands' });
  await input.fill('alerts');
  await expect(page.locator('#cmdk .pb-cmd__item:visible .pb-cmd__label')).toHaveText(['Notification settings']);
  await input.fill('history');
  await expect(page.locator('#cmdk .pb-cmd__item:visible .pb-cmd__label')).toHaveText(['Audit log']);
  await expect(page.locator('#cmdk .pb-cmd__group:visible')).toHaveText(['admin']);
});

test('toasts: a live region attached in the same task as the first toast still waits before speaking', async ({ page }) => {
  await page.goto('/components/Toast/example.html');
  const r = await page.evaluate(() => new Promise((res) => {
    document.querySelectorAll('[data-pb-live]').forEach((x) => x.remove());
    pbToast({ title: 'Welcome back' });
    const polite = document.querySelector('[data-pb-live="polite"]');
    setTimeout(() => { const early = polite.textContent; setTimeout(() => res([early, polite.textContent]), 250); }, 80);
  }));
  expect(r).toEqual(['', 'Welcome back']);
});

test.describe('tabs', () => {
  test('data-tab-hash restores the tab from the fragment and writes it back; data-hides hides while selected', async ({ page }) => {
    await page.goto('/components/Tabs/example.html#hp2');
    const r = await page.evaluate(() => {
      const w = document.createElement('div');
      w.innerHTML = '<div class="pb-tabs" role="tablist" data-tab-hash><button class="pb-tab" role="tab" aria-selected="true" aria-controls="hp1">One</button>' +
        '<button class="pb-tab" role="tab" aria-selected="false" aria-controls="hp2" data-hides="#hx">Two</button><button class="pb-tab" role="tab" aria-selected="false" aria-controls="hp3">Three</button></div>' +
        '<div id="hp1" role="tabpanel">1</div><div id="hp2" role="tabpanel" hidden>2</div><div id="hp3" role="tabpanel" hidden>3</div><p id="hx">only for one and three</p>';
      document.body.append(w); pbInit(w);
      return [w.querySelector('[aria-selected="true"]').textContent, document.getElementById('hx').hidden];
    });
    expect(r).toEqual(['Two', true]);
    await page.getByRole('tab', { name: 'Three' }).click();
    expect(await page.evaluate(() => [location.hash, document.getElementById('hx').hidden])).toEqual(['#hp3', false]);
    await page.evaluate(() => { location.hash = '#hp1'; });
    await expect(page.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('plug-ins', () => {
  test('the code area follows script writes and reset, and takes a highlighter', async ({ page }) => {
    await page.goto('/components/CodeArea/example.html');
    const code = page.locator('.pb-code').first();
    await code.evaluate((c) => { c.querySelector('textarea').value = 'a: 1\nb: 2\nc: 3'; });
    await expect(code.locator('.pb-code__gutter')).toHaveText('1\n2\n3');
    await expect(code.locator('.pb-code__hl .tok-k')).toHaveText(['a', 'b', 'c']);
    const plain = await page.evaluate(() => {
      pbCodeArea.highlight = (t) => '<span class="tok-s">' + pbEsc(t) + '</span>\n';
      const c = document.querySelector('.pb-code'); c.pbSync(); return c.querySelectorAll('.pb-code__hl .tok-s').length;
    });
    expect(plain).toBe(1);
    // A read-only block gets a Copy button.
    await expect(page.locator('.pb-code').nth(1).getByRole('button', { name: 'Copy' })).toHaveCount(1);
  });

  test('the strength meter takes a scoring function and a pb:strength listener', async ({ page }) => {
    await page.goto('/components/InputTypes/example.html');
    const meter = page.locator('.pb-strength').first();
    const input = page.locator('.pb-field:has(.pb-strength) input').first();
    await page.evaluate(() => {
      pbStrength.score = (v) => ({ level: v.length >= 4 ? 4 : 1, label: v.length >= 4 ? 'long enough' : 'too short' });
      document.addEventListener('pb:strength', (e) => { if (e.detail.value === 'nope') { e.detail.level = 0; e.detail.label = 'blocked'; } });
    });
    await input.fill('abc');
    await expect(meter).toHaveAttribute('data-level', '1');
    await expect(meter.locator(':scope > :last-child')).toHaveText('too short');
    await input.fill('abcd');
    await expect(meter).toHaveAttribute('data-level', '4');
    await input.fill('nope');
    await expect(meter.locator(':scope > :last-child')).toHaveText('blocked');
  });
});

test.describe('k-core follow-up', () => {
  const tabStops = (loc) => loc.evaluate((b) => [...b.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter((x) => x.tabIndex >= 0 && !x.disabled && x.getClientRects().length).length);

  test('log explorer: the lines are one tab stop; Enter reaches the tags; Pause holds new lines', async ({ page }) => {
    await page.goto('/components/LogExplorer/example.html');
    const body = page.locator('.pb-logx .pb-log__body');
    expect(await tabStops(body)).toBe(1);
    const lines = body.locator('.pb-log__line');
    await body.locator('.pb-log__line[tabindex="0"]').focus();
    await page.keyboard.press('Home');
    await expectFocus(page, lines.first());
    await page.keyboard.press('ArrowDown');
    await expectFocus(page, lines.nth(1));
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => document.activeElement.classList.contains('pb-logx__toggle'))).toBe(true);
    await page.keyboard.press('ArrowRight');
    expect(await page.evaluate(() => document.activeElement.classList.contains('pb-log__tag'))).toBe(true);
    await page.keyboard.press('Escape');
    await expectFocus(page, lines.first());
    // The tab stop stays on the line you left, through redraws, while focus is elsewhere.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const kept = await page.evaluate(() => document.activeElement.dataset.id);
    await page.locator('[data-logx-line]').focus();
    await page.evaluate(() => document.querySelector('[data-logx]').pbAppend({ t: Date.now(), labels: { app: 'jellyfin', host: 'nas-01', level: 'info' }, line: 'redraw' }));
    expect(await body.locator('.pb-log__line[tabindex="0"]').getAttribute('data-id')).toBe(kept);
    // Pause: appended lines wait until Resume.
    const pause = page.locator('[data-logx-pause]');
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => document.querySelector('[data-logx]').pbAppend({ t: Date.now(), labels: { app: 'jellyfin', host: 'nas-01', namespace: 'media', container: 'jellyfin-1', level: 'info' }, line: 'held line' }));
    await expect(body.locator('.pb-log__line', { hasText: 'held line' })).toHaveCount(0);
    await pause.click();
    await expect(body.locator('.pb-log__line', { hasText: 'held line' })).toHaveCount(1);
  });

  test('bar chart and histogram: one tab stop, arrows move between bars', async ({ page }) => {
    await page.goto('/components/BarChart/example.html');
    const cols = page.locator('.pb-bars__cols').first();
    expect(await tabStops(cols)).toBe(1);
    const bars = cols.locator('.pb-bars__col');
    await bars.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(bars.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(bars.last()).toBeFocused();
    await page.goto('/components/Histogram/example.html');
    expect(await tabStops(page.locator('.pb-bars__cols').first())).toBe(1);
  });

  test('table tools: one tab stop for the grid, arrows between cells, Enter edits; the resize handle resizes', async ({ page }) => {
    await page.goto('/components/TableTools/example.html');
    const scroll = page.locator('[data-dt] .pb-tablescroll').first();
    expect(await tabStops(scroll)).toBe(1);
    await scroll.locator('[tabindex="0"]').focus();
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => document.activeElement.closest('td,th').tagName)).toBe('TD');
    const edit = scroll.locator('.pb-dt__cell--edit').first();
    await edit.focus();
    await page.keyboard.press('Enter');
    await expect(scroll.locator('.pb-dt__editor')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(scroll.locator('.pb-dt__cell--edit').first()).toBeFocused();
    expect(await tabStops(scroll)).toBe(1);
    // Resize: a separator with a value; arrows change the column's real width.
    const handle = scroll.locator('.pb-dt__resize').nth(1);
    await expect(handle).toHaveAttribute('role', 'separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    const k = await handle.getAttribute('data-k');
    const w0 = (await scroll.locator(`th[data-k="${k}"]`).boundingBox()).width;
    await handle.focus();
    await pressTimes(page, 'ArrowRight', 3);
    await expect.poll(async () => (await scroll.locator(`th[data-k="${k}"]`).boundingBox()).width).toBeGreaterThan(w0 + 30);
    expect(+(await scroll.locator(`th[data-k="${k}"] .pb-dt__resize`).getAttribute('aria-valuenow'))).toBeGreaterThan(w0 + 30);
    const hit = await scroll.locator(`th[data-k="${k}"] .pb-dt__resize`).evaluate((h) => { const s = getComputedStyle(h, '::before'); return h.getBoundingClientRect().width - parseFloat(s.left) - parseFloat(s.right); });
    expect(hit).toBeGreaterThanOrEqual(24);
  });

  test('scroll regions: an overflowing box is reachable and marked, and tables can stack as cards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/components/Heatmap/example.html');
    const box = await page.evaluate(async () => {
      const d = document.createElement('div'); d.setAttribute('data-scroll', ''); d.setAttribute('data-scroll-label', 'Wide text');
      d.style.cssText = 'width:200px;overflow-x:auto;white-space:nowrap'; d.textContent = 'x'.repeat(400); document.body.append(d); pbInit(d);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const a = [d.tabIndex, d.getAttribute('role'), d.getAttribute('aria-label'), d.hasAttribute('data-more-end'), d.hasAttribute('data-more-start')];
      d.scrollLeft = d.scrollWidth; d.dispatchEvent(new Event('scroll'));
      return a.concat([d.hasAttribute('data-more-start'), d.hasAttribute('data-more-end')]);
    });
    expect(box).toEqual([0, 'region', 'Wide text', true, false, true, false]);
    await page.goto('/components/ApiTokens/example.html');
    const stack = page.locator('.pb-tablescroll[data-stack]').first();
    const td = stack.locator('tbody td[data-label]').first();
    expect(await td.evaluate((c) => getComputedStyle(c).display)).toBe('block');
    expect(await stack.evaluate((s) => s.scrollWidth <= s.clientWidth + 1)).toBe(true);
  });

  test('charts: the keyboard read-out is announced; sparklines hidden; diagram links listed; dots named', async ({ page }) => {
    await page.goto('/components/Chart/example.html');
    const svg = page.locator('svg.pb-hoverable').first();
    await svg.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-pb-live="polite"]')).toHaveText(/\S/);
    await page.goto('/components/Sparkline/example.html');
    expect(await page.locator('svg.pb-spark:not([aria-hidden="true"])').count()).toBe(0);
    await page.goto('/components/Diagram/example.html');
    await expect(page.locator('.pb-diagram .pb-sr li')).toHaveCount(4);
    await expect(page.locator('.pb-diagram svg').first()).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.pb-diagram .pb-dot[data-status="down"]').first()).toHaveAccessibleName('down');
  });

  test('dialog: named by its title, page scroll locked while modal', async ({ page }) => {
    await page.goto('/components/Dialog/example.html');
    await page.getByRole('button', { name: 'Form', exact: true }).click();
    await expect(page.locator('#dlg-form')).toHaveAccessibleName('New share');
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  });

  test('value controls: range names and values, dual range units, progress names, time listboxes', async ({ page }) => {
    await page.goto('/components/Range/example.html');
    const r = page.locator('#range-fan-speed');
    await expect(r).toHaveAccessibleName('Fan speed');
    await expect(r).toHaveAttribute('aria-valuetext', '60%');
    await expect(page.locator('output').first()).toHaveAttribute('aria-hidden', 'true');
    const at = await page.evaluate(() => { const r = document.querySelector('#range-snapshots-kept'), t = [...document.querySelectorAll('.pb-range-ticks span')].find((s) => s.textContent === '14'), a = r.getBoundingClientRect(), b = t.getBoundingClientRect(); return (b.left + b.width / 2 - a.left) / a.width; });
    expect(at).toBeGreaterThan(0.4);
    expect(at).toBeLessThan(0.5);
    await page.goto('/components/DualRange/example.html');
    await expect(page.locator('.pb-range2 input').first()).toHaveAttribute('aria-valuetext', /KB|MB|GB/);
    await page.goto('/components/Progress/example.html');
    await expect(page.locator('progress').first()).toHaveAccessibleName('Scrub · tank');
    await page.goto('/components/TimePicker/example.html');
    await page.locator('[data-clock]').first().click();
    const clock = page.locator('.pb-time:popover-open');
    await expect(clock.getByRole('listbox', { name: 'Hour' })).toBeVisible();
    await expect(clock.getByRole('listbox', { name: 'Minute' })).toBeVisible();
    await expect(clock.getByRole('option').first()).toBeAttached();
  });

  test('toasts with an action last at least 10 s, and F8 moves focus into the stack and back', async ({ page }) => {
    await page.goto('/components/Toast/example.html');
    const b = page.getByRole('button', { name: 'Saved' });
    await b.focus();
    await page.evaluate(() => pbToast({ title: '3 files deleted', action: { label: 'Undo' }, timeout: 3000 }));
    const t = page.locator('body > .pb-toasts .pb-toast').last();
    expect(await t.locator('.pb-toast__timer').evaluate((x) => x.style.getPropertyValue('--t'))).toBe('10000ms');
    await page.keyboard.press('F8');
    await expect(t.getByRole('button', { name: 'Undo' })).toBeFocused();
    expect(await t.locator('.pb-toast__timer').evaluate((x) => x.style.animationPlayState)).toBe('paused');
    await page.keyboard.press('F8');
    await expect(b).toBeFocused();
    await expect(page.locator('body > .pb-toasts')).toHaveAttribute('aria-keyshortcuts', 'F8');
  });

  test('context menu: rows are one tab stop, the menu remembers its row and reports it, Tab closes it', async ({ page }) => {
    await page.goto('/components/ContextMenu/example.html');
    const zone = page.locator('[data-contextmenu]').first();
    const rows = zone.locator(':scope > li');
    expect(await tabStops(zone)).toBe(1);
    await rows.first().focus();
    await page.keyboard.press('ArrowDown');
    await expectFocus(page, rows.nth(1));
    await page.evaluate(() => document.querySelector('[data-contextmenu]').addEventListener('pb:command', (e) => { window.__ctx = [e.detail.command, e.detail.row.querySelector('.pb-item__title').textContent]; }));
    await page.keyboard.press('Shift+F10');
    await expect(rows.nth(1)).toHaveAttribute('data-ctx-row', '');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => window.__ctx)).toEqual(['Share…', 'wiring.pdf']);
    await expectFocus(page, rows.nth(1));
    await page.keyboard.press('Shift+F10');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.getElementById('ctx-1').matches(':popover-open'))).toBe(false);
    await expectFocus(page, rows.nth(1));
  });

  test('submit and validation: code input posts its code, tags check a pattern, the date field explains bad input', async ({ page }) => {
    await page.goto('/components/CodeInput/example.html');
    await page.locator('[data-codeinput] input').first().click();
    await page.keyboard.type('123456');
    await expect(page.locator('[data-codeinput] input[type=hidden][name="code"]')).toHaveValue('123456');
    await page.goto('/components/TagInput/example.html');
    const tags = page.locator('[data-tags][data-pattern]');
    const input = tags.locator('input:not([type=hidden])');
    await input.fill('not-a-cidr');
    await page.keyboard.press('Enter');
    await expect(tags.locator('.pb-tag[data-invalid]')).toHaveCount(1);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(/10\.0\.20\.0\/24/);
    await tags.locator('.pb-tag[data-invalid] button').click();
    await expect(input).not.toHaveAttribute('aria-invalid', /./);
    await page.goto('/components/DatePicker/example.html');
    const d = page.locator('#datepicker-expires-on');
    await d.fill('2026-13-45');
    await d.press('Tab');
    await expect(d).toHaveAttribute('aria-invalid', 'true');
    await expect(d).toHaveAccessibleDescription(/yyyy-mm-dd/);
  });
});
