import { expect, test } from '@playwright/test';
import { expectLinkedButtonsToMatch } from './button-helpers';
import { chevron } from './form-helpers';

/*
 * Forced colours are active. Playwright emulates them in Chromium and WebKit,
 * but not in Firefox over WebDriver BiDi, which takes a pref instead. Prefs
 * are set at launch, which Playwright allows per file only, so these tests
 * share a file rather than sit with their components.
 */
test.use({ launchOptions: { firefoxUserPrefs: { 'browser.display.document_color_use': 2 } } });
test.beforeEach(({ page }) => page.emulateMedia({ forcedColors: 'active' }));

test('a Select is the native control, with no custom chevron', async ({ page }) => {
  await page.goto('/#select');

  const select = page.locator('#select-default select');
  expect(await select.evaluate(element => getComputedStyle(element).appearance)).toBe('auto');
  expect((await chevron(select)).drawn).toBe(false);
});

test('a linked Button looks the same as a button, in every variant', async ({ page }) => {
  await page.goto('/#interactive-elements');

  await expectLinkedButtonsToMatch(page);
});
