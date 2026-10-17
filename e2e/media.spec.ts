import { expect, test } from '@playwright/test';

test.describe('Image', () => {
  test('loads local and remote sources', async ({ page }) => {
    await page.goto('/#image');

    for (const id of ['#image-local', '#image-remote']) {
      const img = page.locator(`${id} img`);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
    }
  });

  test('lays the credit band across the bottom edge of the image', async ({ page }) => {
    await page.goto('/#image');

    const figure = page.locator('#image-local');
    await figure.scrollIntoViewIfNeeded();
    const image = await figure.locator('img').boundingBox();
    const credit = await figure.locator('figcaption').boundingBox();

    expect(credit).not.toBeNull();
    expect(Math.round(credit!.y + credit!.height)).toBe(Math.round(image!.y + image!.height));
    expect(Math.round(credit!.width)).toBe(Math.round(image!.width));
  });
});
