import { expect, type Page } from '@playwright/test';

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

/** Puts the showcase in `theme` through its toggle, whichever theme it starts in. */
export async function useTheme(page: Page, theme: 'light' | 'dark') {
  const html = page.locator('html');
  const isDark = await html.evaluate(element => element.classList.contains('theme-dark'));
  if (isDark !== (theme === 'dark')) await page.locator('theme-toggle button').click();
  await (theme === 'dark' ? expect(html).toHaveClass(/theme-dark/) : expect(html).not.toHaveClass(/theme-dark/));
}
