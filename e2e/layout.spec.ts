import { expect, test, type Locator } from '@playwright/test';
import { useTheme } from './page-helpers';

async function columnsOf(row: Locator) {
  const boxes = await row.locator('.pane').evaluateAll(panes =>
    panes.map(pane => pane.getBoundingClientRect()).map(({ left, top }) => ({ left, top }))
  );
  return new Set(boxes.map(box => Math.round(box.left))).size;
}

test.describe('Row', () => {
  test('lays out its panes side by side when wide', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#row');

    await expect.poll(() => columnsOf(page.locator('#row-three-columns'))).toBe(3);
    await expect.poll(() => columnsOf(page.locator('#row-two-columns'))).toBe(2);
  });

  test('stacks its panes into one column when narrow', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 });
    await page.goto('/#row');

    await expect.poll(() => columnsOf(page.locator('#row-three-columns'))).toBe(1);
    await expect.poll(() => columnsOf(page.locator('#row-two-columns'))).toBe(1);
  });

  test('stacks based on its own width, not the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#row');

    await expect.poll(() => columnsOf(page.locator('#row-in-narrow-container'))).toBe(1);
  });
});

test.describe('Theme', () => {
  test('switches Row backgrounds but keeps the Image credit band', async ({ page }) => {
    await page.goto('/');
    await useTheme(page, 'light');

    const band = page.locator('#row-surface');
    const credit = page.locator('#image figcaption').first();
    const background = (locator: Locator) => locator.evaluate(element => getComputedStyle(element).backgroundColor);

    const lightBand = await background(band);
    const lightCredit = await background(credit);

    await useTheme(page, 'dark');

    await expect.poll(() => background(band)).not.toBe(lightBand);
    expect(await background(credit)).toBe(lightCredit);
  });
});
