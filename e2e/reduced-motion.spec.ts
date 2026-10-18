import { expect, test } from '@playwright/test';
import { chevron } from './form-helpers';

/*
 * The visitor prefers reduced motion. Playwright emulates it in Chromium and
 * WebKit, but not in Firefox over WebDriver BiDi, which takes a pref instead.
 * Prefs are set at launch, which Playwright allows per file only, so these
 * tests share a file rather than sit with their components.
 */
test.use({ launchOptions: { firefoxUserPrefs: { 'ui.prefersReducedMotion': 1 } } });
test.beforeEach(({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('a Skeleton stays still', async ({ page }) => {
  await page.goto('/#skeleton');

  expect(await page.locator('#skeleton-demo .skeleton').first().evaluate(element => element.getAnimations().length)).toBe(0);
});

test('overlays open without animating', async ({ page }) => {
  await page.goto('/#dialog');
  await page.locator('#dialog-demo-trigger').click();

  expect(await page.locator('#dialog-demo').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});

test('a Select chevron turns without a transition', async ({ page }) => {
  await page.goto('/#select');

  expect((await chevron(page.locator('#select-default select'))).transition).toBe('none');
});
