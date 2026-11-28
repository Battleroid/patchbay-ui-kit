// AvatarEditor under the strict CSP fixture: pick, crop by keyboard, save (fail, then succeed), remove, undo, and rejected files.
// The fixture has no example glue, so each test plays the server by answering pb:avatar itself.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const PHOTO = fs.readFileSync(new URL('../media/photo-3.jpg', import.meta.url)); // 1200 × 800

async function load(page) {
  const bag = { errors: [] };
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  page.on('pageerror', (e) => bag.errors.push(String(e)));
  await page.goto('/tests/fixtures/csp.html');
  await page.waitForFunction(() => window.pbReady === true);
  // Record every pb:avatar; tests settle them with window.__settle(type, detail).
  await page.evaluate(() => {
    const f = document.querySelector('[data-fixture="AvatarEditor"] [data-avatar-edit]');
    window.__ev = [];
    f.addEventListener('pb:avatar', (e) => window.__ev.push(e.detail));
    window.__settle = (type, detail) => f.dispatchEvent(new CustomEvent(type, { detail }));
  });
  return bag;
}
const field = (page) => page.locator('[data-fixture="AvatarEditor"] [data-avatar-edit]').first();

test('avatar editor: crop by keyboard, a failed save keeps the dialog, a good one updates every synced avatar', async ({ page }) => {
  const bag = await load(page);
  const f = field(page);
  await f.locator('[data-avatar-pick]').setInputFiles({ name: 'rack.jpg', mimeType: 'image/jpeg', buffer: PHOTO });
  const d = f.locator('dialog.pb-avedit');
  await expect(d).toHaveJSProperty('open', true);
  const stage = d.locator('.pb-avedit__stage');
  await expect(stage).toBeFocused();
  await expect(d.locator('.pb-foot__status')).toHaveText('512 × 512 · from 1200 × 800');
  // 800 px short side, 128 minimum: zoom stops at 400% (the cap), and starts at 100%.
  const zoom = d.locator('input[type=range]');
  await expect(zoom).toHaveValue('100');
  await expect(zoom).toHaveAttribute('max', '400');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('+');
  await expect(zoom).toHaveValue('110');
  // The previews are drawn (on the next frame).
  await expect.poll(() => d.locator('.pb-avedit__previews canvas').first().evaluate((c) => c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data[3])).toBe(255);

  await d.locator('[data-save]').click();
  await expect.poll(() => page.evaluate(() => window.__ev.length)).toBe(1);
  const ev = await page.evaluate(async () => {
    const e = window.__ev[0], bmp = await createImageBitmap(e.blob);
    return { action: e.action, type: e.blob.type, w: bmp.width, h: bmp.height, file: e.file.name, crop: e.crop };
  });
  expect(ev).toMatchObject({ action: 'save', type: 'image/webp', w: 512, h: 512, file: 'rack.jpg' });
  // Zoom 1.1 keeps 800/1.1 ≈ 727 px; one step right moves the image 2% of the frame, so the crop moves left of center.
  expect(ev.crop.size).toBe(727);
  expect(ev.crop.rotate).toBe(0);
  expect(ev.crop.x).toBeLessThan((1200 - 727) / 2);
  expect(ev.crop.y).toBe(Math.round(400 - 800 / 1.1 / 2));
  // The saved pixels match the reported crop: the output's center is the source pixel at the crop's center.
  const match = await page.evaluate(async (c) => {
    const src = new Image(); src.src = '../../media/photo-3.jpg'; await src.decode(); // the fixture CSP blocks fetch, not img-src 'self'
    const cv = new OffscreenCanvas(1200, 800), x = cv.getContext('2d'); x.drawImage(src, 0, 0);
    const a = x.getImageData(c.x + c.size / 2, c.y + c.size / 2, 1, 1).data;
    const out = await createImageBitmap(window.__ev[0].blob), o = new OffscreenCanvas(512, 512), y = o.getContext('2d'); y.drawImage(out, 0, 0);
    const b = y.getImageData(256, 256, 1, 1).data;
    return Math.max(...[0, 1, 2].map((i) => Math.abs(a[i] - b[i])));
  }, ev.crop);
  expect(match).toBeLessThan(24);

  // The server fails: the dialog stays open with the message, Save works again.
  await page.evaluate(() => window.__settle('pb:error', { message: 'Upload failed: 413.' }));
  await expect(d).toHaveJSProperty('open', true);
  await expect(d.locator('.pb-foot__status')).toHaveAttribute('data-state', 'error');
  await expect(d.locator('.pb-foot__status')).toContainText('Upload failed: 413.');
  await expect(d.locator('[data-save]')).not.toHaveAttribute('aria-busy', 'true');
  await d.locator('[data-save]').click();
  await expect.poll(() => page.evaluate(() => window.__ev.length)).toBe(2);
  await page.evaluate(() => window.__settle('pb:saved', {}));
  await expect(d).toHaveJSProperty('open', false);

  // The field and the synced header avatar both show the photo; the button and Remove follow.
  const av = f.locator(':scope > .pb-avatar');
  await expect(av.locator('img')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('[data-fixture="AvatarEditor"] [data-avatar-me="alex"] img')).toHaveAttribute('src', /^blob:/);
  await expect(av).toHaveAttribute('aria-label', 'Alex Rivera');
  await expect(f.locator('[data-label]')).toHaveText('Change photo');
  await expect(f.locator('[data-avatar-remove]')).toBeVisible();
  await expect(page.locator('.pb-toast', { hasText: 'Photo updated' })).toHaveCount(1);
  expect(await page.evaluate(() => window.__csp)).toEqual([]);
  expect(bag.errors).toEqual([]);
});

test('avatar editor: remove goes back to initials and keeps the presence dot; Undo asks to restore the old photo', async ({ page }) => {
  const bag = await load(page);
  const f = page.locator('[data-fixture="AvatarEditor"] [data-avatar-edit]').nth(1);
  await page.evaluate(() => {
    const g = document.querySelectorAll('[data-fixture="AvatarEditor"] [data-avatar-edit]')[1];
    window.__ev2 = []; g.addEventListener('pb:avatar', (e) => window.__ev2.push(e.detail));
    window.__settle2 = (type, detail) => g.dispatchEvent(new CustomEvent(type, { detail }));
  });
  const av = f.locator(':scope > .pb-avatar');
  const was = await av.locator('img').getAttribute('src');
  await f.locator('[data-avatar-remove]').click();
  await expect.poll(() => page.evaluate(() => window.__ev2.map((e) => e.action))).toEqual(['remove']);
  await page.evaluate(() => window.__settle2('pb:saved', {}));
  await expect(av.locator('img')).toHaveCount(0);
  await expect(av).toContainText('so');
  await expect(av.locator('.pb-dot')).toHaveCount(1);
  await expect(av).toHaveAttribute('aria-label', 'Sam Okafor, ok');
  await expect(f.locator('[data-avatar-remove]')).toBeHidden();
  await expect(f.locator('[data-avatar-pick]')).toBeFocused();
  await page.locator('.pb-toast', { hasText: 'Photo removed' }).getByRole('button', { name: 'Undo' }).click();
  await expect.poll(() => page.evaluate(() => window.__ev2.map((e) => e.action))).toEqual(['remove', 'restore']);
  expect(await page.evaluate(() => window.__ev2[1].url)).toBe(was);
  await page.evaluate(() => window.__settle2('pb:saved', {})); // a bare pb:saved: the photo the Undo asked for comes back
  await expect(page.locator('.pb-toast', { hasText: 'Photo restored' })).toHaveCount(1);
  await expect(av.locator('img')).toHaveAttribute('src', was);
  await expect(av.locator('.pb-dot')).toHaveCount(1);
  expect(bag.errors).toEqual([]);
});

test('avatar editor: wrong type, too small and unreadable files are refused in the hint, and the dialog stays shut', async ({ page }) => {
  const bag = await load(page);
  const f = field(page), hint = f.locator('.pb-avfield__hint'), pick = f.locator('[data-avatar-pick]');
  await pick.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(hint).toHaveAttribute('data-state', 'error');
  await expect(hint).toHaveText('notes.txt isn’t a PNG, JPEG or WebP image.');
  const tiny = Buffer.from((await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 96; c.getContext('2d').fillRect(0, 0, 96, 96); return c.toDataURL('image/png'); })).split(',')[1], 'base64');
  await pick.setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: tiny });
  await expect(hint).toHaveText('This image is 96 × 96. Use one at least 128 × 128.');
  await pick.setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not a png') });
  await expect(hint).toHaveText('Couldn’t read broken.png. Try exporting it as PNG or JPEG.');
  await expect(f.locator('dialog.pb-avedit')).toHaveCount(0);
  // A good file clears the error.
  await pick.setInputFiles({ name: 'rack.jpg', mimeType: 'image/jpeg', buffer: PHOTO });
  await expect(hint).not.toHaveAttribute('data-state', 'error');
  await expect(f.locator('dialog.pb-avedit')).toHaveJSProperty('open', true);
  expect(bag.errors).toEqual([]);
});

test('avatar editor: rotate swaps the crop axes, Esc cancels without an event, and the dialog fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  const bag = await load(page);
  const f = field(page);
  await f.locator('[data-avatar-pick]').setInputFiles({ name: 'rack.jpg', mimeType: 'image/jpeg', buffer: PHOTO });
  const d = f.locator('dialog.pb-avedit');
  await expect(d).toHaveJSProperty('open', true);
  const box = await d.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  // A portrait crop after a quarter turn: the turned source is 800 × 1200, so y has room and x has none.
  await page.keyboard.press('r');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Escape');
  await expect(d).toHaveJSProperty('open', false);
  await expect(f.locator('[data-avatar-pick]')).toBeFocused();
  expect(await page.evaluate(() => window.__ev.length)).toBe(0);
  await f.locator('[data-avatar-pick]').setInputFiles({ name: 'rack.jpg', mimeType: 'image/jpeg', buffer: PHOTO });
  await expect(d.locator('.pb-avedit__stage')).toBeFocused(); // the photo decodes before the dialog opens
  await page.keyboard.press('r');
  await d.locator('[data-save]').click();
  await expect.poll(() => page.evaluate(() => window.__ev.length)).toBe(1);
  expect(await page.evaluate(() => window.__ev[0].crop)).toEqual({ rotate: 90, x: 0, y: 200, size: 800 });
  expect(bag.errors).toEqual([]);
});

test('avatar editor: drop and paste open the photo; drag and wheel move and zoom it; Esc mid-save leaves Save usable', async ({ page }) => {
  const bag = await load(page);
  const f = field(page), d = f.locator('dialog.pb-avedit'), stage = d.locator('.pb-avedit__stage');
  const b64 = PHOTO.toString('base64');
  // A file dropped on the field: the field lights up while it is over, then the dialog opens.
  await f.evaluate((el, b) => {
    const u = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)), dt = new DataTransfer();
    dt.items.add(new File([u], 'dropped.jpg', { type: 'image/jpeg' }));
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    window.__over = el.dataset.state;
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, b64);
  expect(await page.evaluate(() => window.__over)).toBe('over');
  await expect(stage).toBeFocused();
  await expect(f).not.toHaveAttribute('data-state', 'over');
  // Drag right 40 px and wheel up: the image moves right (the crop moves left) and zooms in.
  const box = await stage.boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 40, cy, { steps: 4 }); await page.mouse.up();
  await page.mouse.wheel(0, -150);
  await expect.poll(() => d.locator('input[type=range]').inputValue().then(Number)).toBeGreaterThan(100);
  // Pasting another image replaces the photo.
  await d.evaluate((el, b) => {
    const u = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)), dt = new DataTransfer();
    dt.items.add(new File([u], 'pasted.jpg', { type: 'image/jpeg' }));
    el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
  }, b64);
  await expect(stage).toBeFocused();
  await expect(d.locator('input[type=range]')).toHaveValue('100'); // a new photo starts fresh
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 40, cy, { steps: 4 }); await page.mouse.up();
  await d.locator('[data-save]').click();
  await expect.poll(() => page.evaluate(() => window.__ev.length)).toBe(1);
  expect(await page.evaluate(() => window.__ev[0].file.name)).toBe('pasted.jpg');
  expect(await page.evaluate(() => window.__ev[0].crop.x)).toBeLessThan(200);
  // Esc while the save is in flight, then the server fails: the reason goes in the hint and Save works next time.
  await page.keyboard.press('Escape');
  await expect(d).toHaveJSProperty('open', false);
  await page.evaluate(() => window.__settle('pb:error', { message: 'Upload failed: 413.' }));
  await expect(f.locator('.pb-avfield__hint')).toHaveText('Upload failed: 413.');
  await f.locator('[data-avatar-pick]').setInputFiles({ name: 'rack.jpg', mimeType: 'image/jpeg', buffer: PHOTO });
  await expect(stage).toBeFocused();
  await expect(d.locator('[data-save]')).not.toHaveAttribute('aria-busy', 'true');
  await expect(d.locator('.pb-foot__status')).not.toHaveAttribute('data-state', 'error');
  await d.locator('[data-save]').click();
  await expect.poll(() => page.evaluate(() => window.__ev.length)).toBe(2);
  expect(await page.evaluate(() => window.__csp)).toEqual([]);
  expect(bag.errors).toEqual([]);
});
