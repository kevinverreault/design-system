import { expect, test, type Locator } from '@playwright/test';

async function columnsOf(list: Locator) {
  const lefts = await list.locator(':scope > li').evaluateAll(items => items.map(item => Math.round(item.getBoundingClientRect().left)));
  return new Set(lefts).size;
}

test.describe('Card', () => {
  test('a linked card follows its link when its media is clicked', async ({ page }) => {
    await page.goto('/');

    const card = page.locator('#card-linked');
    await card.locator('figure').click();

    await expect(page).toHaveURL(/#card$/);
  });

  test('a linked card is a single tab stop', async ({ page }) => {
    await page.goto('/');

    await page.locator('#card-linked').focus();
    await expect(page.locator('#card-linked')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#card-linked')).not.toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.closest('#card-linked'))).toBeNull();
  });
});

test.describe('Skeleton', () => {
  const runningAnimations = (page: import('@playwright/test').Page) =>
    page.locator('#skeleton-demo .skeleton').first().evaluate(element => element.getAnimations().length);

  test('pulses by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/#skeleton');

    expect(await runningAnimations(page)).toBeGreaterThan(0);
  });
});

test.describe('Gallery', () => {
  test('lays out several columns when wide and one when narrow', async ({ page }) => {
    const gallery = page.locator('#gallery-default');

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#gallery');
    await expect.poll(() => columnsOf(gallery)).toBeGreaterThan(1);

    await page.setViewportSize({ width: 375, height: 800 });
    await expect.poll(() => columnsOf(gallery)).toBe(1);
  });

  test('opens the full-size image through its link when nothing claims the click', async ({ page }) => {
    await page.goto('/#gallery');
    await page.locator('light-box').evaluateAll(lightboxes => lightboxes.forEach(lightbox => lightbox.remove()));

    const link = page.locator('#gallery-default a').nth(1);
    const href = await link.evaluate((element: HTMLAnchorElement) => element.href);
    await link.click();

    await expect(page).toHaveURL(href);
  });

  test('dispatches gallery-open with every image, and stays put when a listener claims it', async ({ page }) => {
    await page.goto('/#gallery');

    await page.evaluate(() => {
      document.addEventListener('gallery-open', event => {
        event.preventDefault();
        const { index, images, trigger } = event.detail;
        (window as any).opened = { index, images, triggerIsLink: trigger === document.querySelectorAll('#gallery-default a')[index] };
      });
    });

    const url = page.url();
    await page.locator('#gallery-default a').nth(1).click();

    const opened = await page.evaluate(() => (window as any).opened);
    expect(opened.index).toBe(1);
    expect(opened.triggerIsLink).toBe(true);
    expect(opened.images).toHaveLength(6);
    expect(opened.images[1]).toMatchObject({ alt: 'Snowfield under a white sky', credit: 'Kevin Verreault 2023', width: 1200, height: 800 });
    expect(opened.images[1].src).toMatch(/\/images\/snow\.jpg$/);
    expect(opened.images[0].src).toMatch(/^http/);
    expect(opened.images[2].credit).toBeUndefined();
    expect(page.url()).toBe(url);
  });
});
