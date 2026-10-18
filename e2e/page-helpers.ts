import type { Page } from '@playwright/test';

/**
 * Waits until nothing late can shift the layout: web fonts swapped in and every image loaded, since lazy images
 * would only load once scrolled near.
 */
export async function settleLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async image => {
      image.loading = 'eager';
      await image.decode().catch(() => {});
    }));
  });
}
