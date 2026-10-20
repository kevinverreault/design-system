import { expect, test, type Locator, type Page } from '@playwright/test';

/*
 * Every photo of the /lightbox-preload Gallery has URLs of its own
 * (`?photo=N`), so a fetch names the photo it loads. Photo numbers start
 * at 1; Gallery positions at 0.
 *
 * Fetches are read from Resource Timing rather than from request events:
 * Firefox reports an image served from its image cache as a request, though
 * nothing is fetched.
 */

/** The URL of every fetch of a photo, with its photo number, in fetch order. */
function photoFetches(page: Page) {
  return page.evaluate(() => performance.getEntriesByType('resource').flatMap(entry => {
    const photo = new URL(entry.name).searchParams.get('photo');
    return photo ? [{ photo: Number(photo), url: entry.name }] : [];
  }));
}

/** Opens photo `photo` in the Lightbox and waits for it to load. */
async function open(page: Page, photo: number) {
  const image = page.locator('#lightbox-preload figure img');

  await page.locator('#preload-gallery a').nth(photo - 1).click();
  await shows(image, photo);

  return image;
}

/** Waits for the Lightbox `image` to show photo `photo`, loaded. */
async function shows(image: Locator, photo: number) {
  await expect(image).toHaveAttribute('alt', `Snowfield ${photo}`);
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
}

test.describe('Lightbox preloading', () => {
  for (const { photo, preloaded } of [
    { photo: 3, preloaded: [2, 4] },
    { photo: 5, preloaded: [1, 4] },
    { photo: 1, preloaded: [2, 5] },
  ]) {
    test(`loads the photos after and before photo ${photo} when it opens, wrapping around`, async ({ page }) => {
      await page.goto('/lightbox-preload');

      await open(page, photo);

      await expect.poll(async () => (await photoFetches(page)).map(fetch => fetch.photo).filter(other => other !== photo).sort()).toEqual(preloaded);
    });
  }

  test('preloads each photo with its srcset, not only its fallback', async ({ page }) => {
    await page.goto('/lightbox-preload');

    await open(page, 3);

    await expect.poll(async () => (await photoFetches(page)).filter(fetch => fetch.photo === 4).map(fetch => new URL(fetch.url).searchParams.has('w'))).toEqual([true]);
  });

  for (const { key, to, next } of [
    { key: 'ArrowRight', to: 4, next: 5 },
    { key: 'ArrowLeft', to: 2, next: 1 },
  ]) {
    test(`shows photo ${to} without fetching it again after stepping with ${key}, then preloads photo ${next}`, async ({ page }) => {
      await page.goto('/lightbox-preload');
      const fetchesOf = async (photo: number) => (await photoFetches(page)).filter(fetch => fetch.photo === photo).map(fetch => fetch.url);

      const image = await open(page, 3);
      await expect.poll(() => fetchesOf(to)).toHaveLength(1);
      const [preload] = await fetchesOf(to);

      await page.keyboard.press(key);
      await shows(image, to);

      expect(await image.evaluate((element: HTMLImageElement) => element.currentSrc)).toBe(preload);
      expect(await fetchesOf(to)).toEqual([preload]);
      // The step preloads the photo now beyond it.
      await expect.poll(() => fetchesOf(next)).toHaveLength(1);
    });
  }
});
