import { expect, test } from '@playwright/test';
import { centre, clickInPlace, expectAnchored, hoverInPlace, scrollToTop, openFrom } from './overlay-helpers';

/*
 * The browsers under test support invoker commands, `closedby` and CSS anchor
 * positioning natively. Each block below takes one feature away before the
 * page loads (hiding it from feature detection and cancelling or overriding
 * the browser's own handling), so the overlays must work through their
 * script fallbacks.
 */

test.describe('Without invoker commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      delete (HTMLButtonElement.prototype as Partial<HTMLButtonElement>).command;
      delete (HTMLButtonElement.prototype as Partial<HTMLButtonElement>).commandForElement;
      window.addEventListener('command', event => event.preventDefault(), true);
    });
  });

  test('a Dialog opens from its trigger and returns focus to it on Escape', async ({ page }) => {
    await page.goto('/#dialog');

    const { trigger, dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo');
    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('Without closedby', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).closedBy;
      window.addEventListener('cancel', event => event.preventDefault(), true);
    });
  });

  test('a Dialog closes on a click outside', async ({ page }) => {
    await page.goto('/#dialog');

    const { trigger, dialog } = await openFrom(page, 'dialog-demo-trigger', 'dialog-demo');
    await page.mouse.click(5, 5);

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('an AlertDialog stays open on a click outside', async ({ page }) => {
    await page.goto('/#alert-dialog');

    const { dialog } = await openFrom(page, 'alert-dialog-demo-trigger', 'alert-dialog-demo');
    await page.mouse.click(5, 5);

    await expect(dialog).toBeVisible();
  });
});

test.describe('Without CSS anchor positioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS) as (...args: string[]) => boolean;
      CSS.supports = ((...args: string[]) => !args[0].includes('position-area') && supports(...args)) as typeof CSS.supports;

      document.addEventListener('DOMContentLoaded', () => {
        const override = document.createElement('style');
        override.textContent = '* { position-area: none !important; }';
        document.head.append(override);
      });
    });
  });

  test('a Popover opens one gap below its trigger', async ({ page }) => {
    await page.goto('/#popover');

    const trigger = page.locator('#popover-demo-trigger');
    await centre(trigger);
    await trigger.click();

    await expectAnchored(trigger, page.locator('#popover-demo'), 'below');
  });

  test('a DropdownMenu opens below its trigger, and above it when there is no room below', async ({ page }) => {
    await page.goto('/#dropdown-menu');

    const trigger = page.locator('#dropdown-menu-demo-trigger');
    const menu = page.locator('#dropdown-menu-demo');
    await centre(trigger);
    await trigger.click();
    await expectAnchored(trigger, menu, 'below');

    await page.keyboard.press('Escape');
    await trigger.evaluate(element => element.scrollIntoView({ block: 'end' }));
    await clickInPlace(trigger);
    await expectAnchored(trigger, menu, 'above');
  });

  test('a Tooltip shows above its trigger, and below it when there is no room above', async ({ page }) => {
    await page.goto('/#tooltip');

    const trigger = page.locator('#tooltip-instagram-trigger');
    const tooltip = page.locator('#tooltip-instagram');
    await centre(trigger);
    await trigger.hover();
    await expectAnchored(trigger, tooltip, 'above');

    await page.mouse.move(5, 5);
    await expect(tooltip).toBeHidden();
    await scrollToTop(trigger);
    await hoverInPlace(trigger);
    await expectAnchored(trigger, tooltip, 'below');
  });
});
