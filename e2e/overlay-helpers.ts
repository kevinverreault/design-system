import { expect, type Locator, type Page } from '@playwright/test';

/** Gap between a popover and its trigger, in pixels: the --space-xs margin. */
const POPOVER_GAP = 8;

/** Opens a dialog from its trigger and checks it is shown as a modal. */
export async function openFrom(page: Page, triggerId: string, dialogId: string) {
  const trigger = page.locator(`#${triggerId}`);
  const dialog = page.locator(`#${dialogId}`);

  await trigger.click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);

  return { trigger, dialog };
}

/**
 * Scrolls `trigger` to the middle of the viewport, so that its popover has room on both sides and doesn't flip.
 * Late layout shifts (web fonts swapping in, images loading) can move it afterwards, so it scrolls again
 * until the trigger stays put for a couple of frames.
 */
export async function centre(trigger: Locator) {
  await trigger.evaluate(async element => {
    const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;

    for (let attempt = 0; attempt < 10; attempt++) {
      element.scrollIntoView({ block: 'center' });
      const top = element.getBoundingClientRect().top;
      await frame();
      if (element.getBoundingClientRect().top === top) return;
    }
  });
}

/** Scrolls `trigger` to the top of the viewport, leaving no room above it; the page gets room below to allow it. */
export async function scrollToTop(trigger: Locator) {
  await trigger.evaluate(async element => {
    await document.fonts.ready;
    document.body.style.paddingBottom = '100vh';
    element.scrollIntoView({ block: 'start' });
  });
}

/** Checks that `popover` sits one gap below (or above) `trigger` and overlaps it horizontally. */
export async function expectAnchored(trigger: Locator, popover: Locator, side: 'below' | 'above') {
  await popover.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  const anchor = (await trigger.boundingBox())!;
  const box = (await popover.boundingBox())!;
  const gap = side === 'below' ? box.y - (anchor.y + anchor.height) : anchor.y - (box.y + box.height);

  expect(Math.round(gap)).toBe(POPOVER_GAP);
  expect(box.x).toBeLessThanOrEqual(anchor.x + anchor.width);
  expect(box.x + box.width).toBeGreaterThanOrEqual(anchor.x);
}
