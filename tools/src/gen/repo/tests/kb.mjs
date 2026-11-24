// Keyboard helpers shared by spec files: import { tabOrder, expectFocus, describeActive, pressTimes } from './kb.mjs'.
// Every helper takes a Playwright `page` and works on the page's real focus, not on DOM guesses.
import { expect } from '@playwright/test';

/** A short description of document.activeElement: `button#save`, `input[name=q]`, `div[role=option]`, or 'body'. */
export function describeActive(page) {
  return page.evaluate(() => {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    if (!el || el === document.body) return 'body';
    const tag = el.localName;
    const id = el.id ? `#${el.id}` : '';
    const attr = el.getAttribute('name') ? `[name=${el.getAttribute('name')}]` : el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : '';
    return tag + id + attr;
  });
}

/** Press a key n times (default 1). */
export async function pressTimes(page, key, n = 1) {
  for (let i = 0; i < n; i++) await page.keyboard.press(key);
}

/** Press Tab up to `max` times and return the described focus stops, in order. Stops early when focus returns to the first stop. */
export async function tabOrder(page, max = 20) {
  const seen = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const d = await describeActive(page);
    if (seen.length && d === seen[0]) break;
    seen.push(d);
  }
  return seen;
}

/** Assert focus is on the element matched by `target` (a selector or Locator), with a readable failure message. */
export async function expectFocus(page, target) {
  const loc = typeof target === 'string' ? page.locator(target) : target;
  await expect(loc, `focus is on ${await describeActive(page)}`).toBeFocused();
}
