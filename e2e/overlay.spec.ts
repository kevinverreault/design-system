import { expect, test, type Page } from '@playwright/test';
import { centre, expectAnchored, hoverInPlace, scrollToTop, openFrom } from './overlay-helpers';

test.describe('Dialog', () => {
  test('opens from its trigger, closes on Escape and returns focus to the trigger', async ({ page }) => {
    await page.goto('/#dialog');

    const { trigger, dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo');
    await expect(dialog).toHaveAccessibleName('Order a print');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes on a click outside', async ({ page }) => {
    await page.goto('/#dialog');

    const { trigger, dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo');
    await page.mouse.click(5, 5);

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes from its close button and its footer buttons', async ({ page }) => {
    await page.goto('/#dialog');

    let { dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();

    ({ dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo'));
    await dialog.getByRole('button', { name: 'Add to cart' }).click();
    await expect(dialog).toBeHidden();
    expect(await dialog.evaluate((element: HTMLDialogElement) => element.returnValue)).toBe('order');
  });
});

test.describe('Dialog sizes', () => {
  test('grow from small to large', async ({ page }) => {
    await page.goto('/#dialog');

    const widths: number[] = [];
    for (const size of ['small', 'medium', 'large']) {
      const dialog = page.locator(`#dialog-${size}`);
      await page.locator(`[commandfor="dialog-${size}"]`).click();
      await expect(dialog).toBeVisible();
      widths.push((await dialog.boundingBox())!.width);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }

    expect(widths[0]).toBeLessThan(widths[1]);
    expect(widths[1]).toBeLessThan(widths[2]);
  });
});

test.describe('AlertDialog', () => {
  test('opens from its trigger with Cancel focused, and closes on Escape', async ({ page }) => {
    await page.goto('/#alert-dialog');

    const { trigger, dialog } = await openFrom(page, 'alert-dialog-demo-trigger', 'alert-dialog-demo');
    await expect(dialog).toHaveRole('alertdialog');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('does not close on a click outside', async ({ page }) => {
    await page.goto('/#alert-dialog');

    const { dialog } = await openFrom(page, 'alert-dialog-demo-trigger', 'alert-dialog-demo');
    await page.mouse.click(5, 5);

    await expect(dialog).toBeVisible();
  });

  test('reports the choice through its return value', async ({ page }) => {
    await page.goto('/#alert-dialog');

    const { trigger, dialog } = await openFrom(page, 'alert-dialog-demo-trigger', 'alert-dialog-demo');
    await dialog.getByRole('button', { name: 'Delete' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.locator('#alert-dialog-result')).toHaveText('confirm');
    await expect(trigger).toBeFocused();
  });
});

test.describe('Sheet', () => {
  for (const side of ['left', 'right', 'top', 'bottom'] as const) {
    test(`side="${side}" opens along its edge, closes on Escape and returns focus`, async ({ page }) => {
      await page.goto('/#sheet');

      const { trigger, dialog } = await openFrom(page, `sheet-${side}-trigger`, `sheet-${side}`);
      await dialog.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
      const box = (await dialog.boundingBox())!;
      // The viewport without its scrollbar, which Firefox keeps beside a modal.
      const viewport = await page.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }));
      const gaps = { left: box.x, top: box.y, right: viewport.width - box.x - box.width, bottom: viewport.height - box.y - box.height };

      expect(Math.round(gaps[side])).toBe(0);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }
});

test.describe('Lightbox', () => {
  test('opens from a Gallery image with its credit, and moves with the arrow keys', async ({ page }) => {
    await page.goto('/#gallery');

    const links = page.locator('#gallery-default a');
    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');

    await links.nth(0).click();
    await expect(lightbox).toBeVisible();
    await expect(page).toHaveURL(/#gallery$/);
    await expect(image).toHaveAttribute('alt', 'Mountains at dusk');
    await expect(lightbox.locator('figcaption')).toHaveText('© Kevin Verreault 2024');
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);

    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'Snowfield under a white sky');
    await expect(lightbox.locator('figcaption')).toHaveText('© Kevin Verreault 2023');

    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'Ridge line at dusk');
    await expect(lightbox.locator('figcaption')).toHaveCount(0);

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(image).toHaveAttribute('alt', 'Fresh snow');
  });

  test('moves with its previous and next buttons', async ({ page }) => {
    await page.goto('/#gallery');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    // The viewer takes the size of its photo, so its buttons only stay put once the photo has loaded.
    const showing = async (alt: string) => {
      await expect(image).toHaveAttribute('alt', alt);
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
    };

    await page.locator('#gallery-default a').nth(1).click();
    await showing('Snowfield under a white sky');

    await lightbox.getByRole('button', { name: 'Next photo' }).click();
    await showing('Ridge line at dusk');

    await lightbox.getByRole('button', { name: 'Previous photo' }).click();
    await showing('Snowfield under a white sky');
    await lightbox.getByRole('button', { name: 'Previous photo' }).click();
    await showing('Mountains at dusk');
  });

  test('shows a link\'s srcset, sizes and caption, under the photo', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const link = page.locator('#lightbox-captioned a').nth(0);

    await link.click();
    await expect(lightbox).toBeVisible();
    await expect(image).toHaveAttribute('srcset', (await link.getAttribute('data-srcset'))!);
    await expect(image).toHaveAttribute('sizes', 'calc(100vw - 4rem)');
    await expect(lightbox.locator('figcaption')).toHaveText('The last light over the hills, an hour after sunset.');
  });

  test('loads a srcset candidate narrower than the fallback on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#lightbox');

    const image = page.locator('#lightbox-demo figure img');
    await page.locator('#lightbox-captioned a').nth(0).click();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);

    const { currentSrc, candidates, fallback } = await image.evaluate((element: HTMLImageElement) => ({
      currentSrc: element.currentSrc,
      candidates: element.srcset.split(', ').map(candidate => new URL(candidate.split(' ')[0], location.href).href),
      fallback: element.src,
    }));

    expect(candidates).toContain(currentSrc);
    expect(currentSrc).not.toBe(fallback);
  });

  test('keeps each photo\'s own srcset, caption and credit when moving', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const caption = lightbox.locator('.lightbox-caption');
    const credit = lightbox.locator('.image-credit');

    await page.locator('#lightbox-captioned a').nth(0).click();
    await expect(image).toHaveAttribute('alt', 'Hills under an orange sky');

    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'A snowfield');
    await expect(image).not.toHaveAttribute('srcset');
    await expect(image).not.toHaveAttribute('sizes');
    await expect(lightbox.locator('figcaption')).toHaveText('Fresh snow under a white winter sky.');
    await expect(credit).toHaveCount(0);

    await lightbox.getByRole('button', { name: 'Next photo' }).click();
    await expect(image).toHaveAttribute('alt', 'A ridge line at dusk');
    await expect(image).toHaveAttribute('srcset', /600w.*900w.*1200w/);
    await expect(caption).toHaveCount(0);
    await expect(lightbox.locator('figcaption')).toHaveText('© Kevin Verreault 2023');

    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'Tracks across a snowfield');
    await expect(caption).toHaveText(/^A morning after the first big storm/);
    await expect(credit).toHaveText('© Kevin Verreault 2022');

    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'Hills under an orange sky');
    await expect(caption).toHaveText('The last light over the hills, an hour after sunset.');
    await expect(credit).toHaveText('© Kevin Verreault 2024');
  });

  for (const viewport of [{ width: 1280, height: 768 }, { width: 375, height: 812 }]) {
    test(`lays a credit across the photo and its caption under it, inside a ${viewport.width}px viewport`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/#lightbox');

      const lightbox = page.locator('#lightbox-demo');
      const image = lightbox.locator('figure img');

      await page.locator('#lightbox-captioned a').nth(0).click();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
      await expect(lightbox.locator('.image-credit')).toHaveText('© Kevin Verreault 2024');

      const photo = (await image.boundingBox())!;
      const credit = (await lightbox.locator('.image-credit').boundingBox())!;
      const caption = (await lightbox.locator('figcaption').boundingBox())!;
      const dialog = (await lightbox.boundingBox())!;

      expect(Math.round(credit.y + credit.height)).toBe(Math.round(photo.y + photo.height));
      expect(Math.round(credit.width)).toBe(Math.round(photo.width));
      expect(caption.y).toBeGreaterThanOrEqual(Math.floor(photo.y + photo.height));
      expect(Math.round(caption.width)).toBeLessThanOrEqual(Math.round(photo.width));
      expect(dialog.y).toBeGreaterThanOrEqual(0);
      expect(Math.round(dialog.y + dialog.height)).toBeLessThanOrEqual(viewport.height);
    });
  }

  test('gives a caption that overflows a tab stop, to scroll it with the keyboard', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const caption = lightbox.locator('.lightbox-caption');

    await page.locator('#lightbox-captioned a').nth(3).click();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
    expect(await caption.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await expect(caption).toHaveAttribute('tabindex', '0');

    await expect(lightbox.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(caption).toBeFocused();
    await expect(caption).toHaveCSS('outline-style', 'solid');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => caption.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await expect(image).toHaveAttribute('alt', 'Tracks across a snowfield');
  });

  test('leaves a caption that fits out of the tab order', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const caption = lightbox.locator('.lightbox-caption');

    await page.locator('#lightbox-captioned a').nth(0).click();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
    await expect(caption).not.toHaveAttribute('tabindex');

    await expect(lightbox.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(lightbox.getByRole('button', { name: 'Previous photo' })).toBeFocused();
  });

  test('re-checks whether a caption overflows when the viewport resizes', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const caption = lightbox.locator('.lightbox-caption');

    await page.locator('#lightbox-captioned a').nth(0).click();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBeGreaterThan(0);
    await expect(caption).not.toHaveAttribute('tabindex');

    // A photo narrowed to a few words a line pushes the caption past three lines.
    const viewport = page.viewportSize()!;
    await page.setViewportSize({ width: 120, height: viewport.height });
    await expect(caption).toHaveAttribute('tabindex', '0');

    await page.setViewportSize(viewport);
    await expect(caption).not.toHaveAttribute('tabindex');
  });

  test('keeps focus in the viewer when moving from a focused caption', async ({ page }) => {
    await page.goto('/#lightbox');

    const lightbox = page.locator('#lightbox-demo');
    const image = lightbox.locator('figure img');
    const caption = lightbox.locator('.lightbox-caption');

    await page.locator('#lightbox-captioned a').nth(3).click();
    await expect(caption).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('Tab');
    await expect(caption).toBeFocused();

    // The next photo's caption fits: it holds focus until Tab moves on, then leaves the tab order.
    await page.keyboard.press('ArrowRight');
    await expect(image).toHaveAttribute('alt', 'Hills under an orange sky');
    await expect(caption).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(lightbox.getByRole('button', { name: 'Previous photo' })).toBeFocused();
    await expect(caption).not.toHaveAttribute('tabindex');

    // A photo without a caption hands focus to the close button, where it starts when the viewer opens.
    await page.keyboard.press('Shift+Tab');
    await expect(lightbox.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(image).toHaveAttribute('alt', 'Tracks across a snowfield');
    await expect(caption).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('Tab');
    await expect(caption).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(image).toHaveAttribute('alt', 'A ridge line at dusk');
    await expect(lightbox.getByRole('button', { name: 'Close' })).toBeFocused();
  });

  test('closes on Escape and returns focus to the image that opened it', async ({ page }) => {
    await page.goto('/#gallery');

    const trigger = page.locator('#gallery-default a').nth(2);
    const lightbox = page.locator('#lightbox-demo');

    await trigger.click();
    await expect(lightbox).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(lightbox).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('Popover', () => {
  test('opens below its trigger and closes on a second click', async ({ page }) => {
    await page.goto('/#popover');

    const trigger = page.locator('#popover-demo-trigger');
    const popover = page.locator('#popover-demo');

    await centre(trigger);
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAccessibleName('Print details');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expectAnchored(trigger, popover, 'below');

    await trigger.click();
    await expect(popover).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes on Escape and on a click outside', async ({ page }) => {
    await page.goto('/#popover');

    const trigger = page.locator('#popover-demo-trigger');
    const popover = page.locator('#popover-demo');

    await trigger.click();
    await expect(popover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();

    await trigger.click();
    await expect(popover).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(popover).toBeHidden();
  });
});

test.describe('DropdownMenu', () => {
  const setUp = async (page: Page) => {
    await page.goto('/#dropdown-menu');
    const trigger = page.locator('#dropdown-menu-demo-trigger');
    const menu = page.locator('#dropdown-menu-demo');
    return { trigger, menu, items: menu.getByRole('menuitem') };
  };

  test('opens on a click with the first item focused, below its trigger', async ({ page }) => {
    const { trigger, menu, items } = await setUp(page);

    await centre(trigger);
    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveRole('menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(items.first()).toBeFocused();
    await expectAnchored(trigger, menu, 'below');
  });

  test('moves with the arrow keys, Home and End, wrapping around', async ({ page }) => {
    const { trigger, items } = await setUp(page);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(items.nth(0)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();

    await page.keyboard.press('End');
    await expect(items.nth(4)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(items.nth(4)).toBeFocused();

    await page.keyboard.press('Home');
    await expect(items.nth(0)).toBeFocused();
  });

  test('opens on the first item with ArrowDown and on the last with ArrowUp', async ({ page }) => {
    const { trigger, menu, items } = await setUp(page);

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu).toBeVisible();
    await expect(items.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();

    await page.keyboard.press('ArrowUp');
    await expect(menu).toBeVisible();
    await expect(items.last()).toBeFocused();
  });

  test('closes on Escape and returns focus to its trigger', async ({ page }) => {
    const { trigger, menu } = await setUp(page);

    await trigger.click();
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes on Tab and moves focus on from its trigger', async ({ page }) => {
    const { trigger, menu, items } = await setUp(page);

    await trigger.click();
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('Tab');

    await expect(menu).toBeHidden();
    await expect(trigger).not.toBeFocused();
    expect(await trigger.evaluate(element => {
      const focused = document.activeElement!;
      return focused !== document.body && Boolean(element.compareDocumentPosition(focused) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);
  });

  test('runs an item with Enter, then closes', async ({ page }) => {
    const { trigger, menu } = await setUp(page);

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(menu).toBeHidden();
    await expect(page.locator('#dropdown-menu-result')).toHaveText('add');
    await expect(trigger).toBeFocused();
  });

  test('keeps disabled items reachable but inert', async ({ page }) => {
    const { trigger, menu, items } = await setUp(page);

    await trigger.click();
    await items.nth(3).focus();
    await page.keyboard.press('Enter');

    await expect(menu).toBeVisible();
    await expect(page.locator('#dropdown-menu-result')).toHaveText('none');
  });
});

test.describe('Tooltip', () => {
  test('shows above its trigger on hover and hides when the pointer leaves', async ({ page }) => {
    await page.goto('/#tooltip');

    const trigger = page.locator('#tooltip-instagram-trigger');
    const tooltip = page.locator('#tooltip-instagram');

    await expect(tooltip).toBeHidden();
    await centre(trigger);
    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('Follow on Instagram');
    await expectAnchored(trigger, tooltip, 'above');

    await page.mouse.move(5, 5);
    await expect(tooltip).toBeHidden();
  });

  test('shows on keyboard focus, describes its trigger, and hides on blur or Escape', async ({ page }) => {
    await page.goto('/#tooltip');

    const trigger = page.locator('#tooltip-facebook-trigger');
    const tooltip = page.locator('#tooltip-facebook');

    await page.locator('#tooltip-instagram-trigger').focus();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAccessibleDescription('Follow on Facebook');

    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();

    await trigger.blur();
    await trigger.focus();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(tooltip).toBeHidden();
  });

  test('shows on hover and on focus of a linked Button, which it describes', async ({ page }) => {
    await page.goto('/#interactive-elements');

    const trigger = page.locator('#button-link-instagram');
    const tooltip = page.locator('#tooltip-button-link-instagram');

    await expect(trigger).toHaveAttribute('href', 'https://www.instagram.com/');
    await centre(trigger);
    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await expectAnchored(trigger, tooltip, 'above');

    await page.mouse.move(5, 5);
    await expect(tooltip).toBeHidden();

    await trigger.focus();
    await expect(tooltip).toBeVisible();
    await expect(trigger).toHaveAccessibleDescription('Follow on Instagram');
  });

  test('flips below its trigger when there is no room above', async ({ page }) => {
    await page.goto('/#tooltip');

    const trigger = page.locator('#tooltip-x-twitter-trigger');
    await scrollToTop(trigger);
    await hoverInPlace(trigger);

    await expectAnchored(trigger, page.locator('#tooltip-x-twitter'), 'below');
  });
});

test.describe('Overlay animations', () => {
  test('animate in by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/#dialog');
    await page.locator('#dialog-demo-trigger').click();

    // The animation's name rather than the running animation, which can be over by the time it is read.
    expect(await page.locator('#dialog-demo').evaluate(element => getComputedStyle(element).animationName)).toBe('dialog-in');
  });
});
