import { expect, test, type Page } from '@playwright/test';

/*
 * Astro's ClientRouter calls preventDefault() on every same-origin link click
 * from a bubbling listener on the document, registered before any Gallery
 * script. A Gallery link must still open the Lightbox there, without the
 * router fetching the photo as a page.
 */

/** Records on `window.routed` whether the router started a navigation. */
async function watchRouter(page: Page) {
  await page.evaluate(() => {
    (window as any).routed = false;
    document.addEventListener('astro:before-preparation', () => (window as any).routed = true);
  });
}

test.describe('Gallery under the ClientRouter', () => {
  for (const { name, links } of [
    { name: 'a Gallery image', links: '#gallery-routed a' },
    { name: 'a site gallery image', links: '#host-gallery-routed a' },
  ]) {
    test(`opens ${name} in the Lightbox instead of navigating`, async ({ page }) => {
      await page.goto('/client-router');
      await watchRouter(page);

      const url = page.url();
      const link = page.locator(links).first();
      const lightbox = page.locator('#lightbox-routed');
      await link.click();

      await expect(lightbox).toBeVisible();
      await expect(lightbox.locator('figure img')).toHaveAttribute('src', await link.evaluate((element: HTMLAnchorElement) => element.href));
      expect(page.url()).toBe(url);
      expect(await page.evaluate(() => (window as any).routed)).toBe(false);
    });
  }

  test('leaves a modified click to the browser, which opens the photo in a new tab', async ({ page, context }) => {
    await page.goto('/client-router');
    await watchRouter(page);

    const url = page.url();
    const link = page.locator('#gallery-routed a').nth(1);
    const href = await link.evaluate((element: HTMLAnchorElement) => element.href);
    const [tab] = await Promise.all([context.waitForEvent('page'), link.click({ modifiers: ['ControlOrMeta'] })]);

    await expect(tab).toHaveURL(href);
    await expect(page.locator('#lightbox-routed')).toBeHidden();
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => (window as any).routed)).toBe(false);
  });
});
