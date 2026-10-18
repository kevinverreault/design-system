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

  test('reserves the height of an image without a ratio before its file loads', async ({ page }) => {
    // Stall every image request, so that the layout is the one before any file arrives.
    await page.route('**/*', route => route.request().resourceType() === 'image' ? new Promise(() => {}) : route.continue());
    await page.goto('/#image');

    for (const id of ['#image-local', '#image-remote']) {
      const img = page.locator(`${id} img`);
      const { width, height, ratio } = await img.evaluate((element: HTMLImageElement) => ({
        ...element.getBoundingClientRect().toJSON(),
        ratio: Number(element.getAttribute('width')) / Number(element.getAttribute('height')),
      }));

      expect(await img.evaluate((element: HTMLImageElement) => element.complete)).toBe(false);
      expect(height).toBeCloseTo(width / ratio, 0);
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
