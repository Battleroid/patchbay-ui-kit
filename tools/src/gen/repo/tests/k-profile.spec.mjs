// ProfilePage and AvatarEditor on the demo page: axe with their dialogs open, in light soft and dark hard.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [theme, edge] of [['light', 'soft'], ['dark', 'hard']]) {
  test(`profile dialogs pass axe: ${theme} ${edge}`, async ({ page }) => {
    await page.addInitScript(([t, e]) => { localStorage.setItem('pb-theme', t); localStorage.setItem('pb-edge', e); }, [theme, edge]);
    await page.goto('/demo.html');
    const scan = async (inc) => {
      const r = await new AxeBuilder({ page }).include(inc).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      return r.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    };
    await page.locator('#c-avatareditor [data-demo-sample]').first().click();
    await expect(page.locator('#c-avatareditor dialog.pb-avedit')).toHaveJSProperty('open', true);
    expect(await scan('#c-avatareditor dialog.pb-avedit')).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('#c-profilepage [data-pb-open="#profile-pw"]').click();
    await expect(page.locator('#profile-pw')).toHaveJSProperty('open', true);
    expect(await scan('#profile-pw')).toEqual([]);
    await page.keyboard.press('Escape');
    // Signing out a session drops the row and updates the count; with one left, "everywhere else" turns off.
    const s = page.locator('#profile-sessions');
    await s.locator('[data-session-out]').first().click();
    await expect(s.locator('.pb-foot__status')).toHaveText('2 sessions');
    await s.locator('[data-session-out]').first().click();
    await expect(s.locator('.pb-foot__status')).toHaveText('1 session');
    await expect(s.locator('[data-session-all]')).toBeDisabled();
  });
}
