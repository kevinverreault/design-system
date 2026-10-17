import { expect, test, type Page } from '@playwright/test';
import { centre, expectAnchored, scrollToTop, openFrom } from './overlay-helpers';

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
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#sheet');

      const { trigger, dialog } = await openFrom(page, `sheet-${side}-trigger`, `sheet-${side}`);
      const box = (await dialog.boundingBox())!;
      const viewport = page.viewportSize()!;
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
    await page.locator('#gallery-default a').nth(1).click();

    await lightbox.getByRole('button', { name: 'Next photo' }).click();
    await expect(lightbox.locator('figure img')).toHaveAttribute('alt', 'Ridge line at dusk');

    await lightbox.getByRole('button', { name: 'Previous photo' }).click();
    await lightbox.getByRole('button', { name: 'Previous photo' }).click();
    await expect(lightbox.locator('figure img')).toHaveAttribute('alt', 'Mountains at dusk');
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

  test('flips below its trigger when there is no room above', async ({ page }) => {
    await page.goto('/#tooltip');

    const trigger = page.locator('#tooltip-x-twitter-trigger');
    await scrollToTop(trigger);
    await trigger.hover();

    await expectAnchored(trigger, page.locator('#tooltip-x-twitter'), 'below');
  });
});

test.describe('Overlay animations', () => {
  const animationsOnOpen = async (page: Page) => {
    await page.goto('/#dialog');
    await page.locator('#dialog-demo-trigger').click();
    return page.locator('#dialog-demo').evaluate(element => element.getAnimations().length);
  };

  test('animate in by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    expect(await animationsOnOpen(page)).toBeGreaterThan(0);
  });

  test('are off when the visitor prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    expect(await animationsOnOpen(page)).toBe(0);
  });
});
