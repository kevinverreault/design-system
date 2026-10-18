import { expect, test, type Page } from '@playwright/test';

/** The showcase container's flow spacing between its sections, in pixels: --flow-space: 2rem. */
const FLOW_SPACE = 32;

/** Measures, in page coordinates, where each top-level demo section starts and ends, and how tall the page is. */
function measureSections(page: Page) {
  return page.locator('.container > section').evaluateAll(async sections => {
    await document.fonts.ready;
    return {
      sections: sections.map(section => {
        const { top, bottom } = section.getBoundingClientRect();
        return { id: section.id, top: top + scrollY, bottom: bottom + scrollY };
      }),
      pageHeight: document.documentElement.getBoundingClientRect().height,
    };
  });
}

test.describe('Showcase', () => {
  for (const viewport of [{ width: 1280, height: 768 }, { width: 375, height: 812 }]) {
    test(`spaces its sections evenly at ${viewport.width}px wide`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const { sections } = await measureSections(page);
      const gaps = sections.slice(1).map((section, index) => ({
        after: sections[index].id,
        gap: Math.round(section.top - sections[index].bottom),
      }));

      expect(gaps).toEqual(gaps.map(({ after }) => ({ after, gap: FLOW_SPACE })));
    });

    test(`ends one flow space below the last section at ${viewport.width}px wide`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const { sections, pageHeight } = await measureSections(page);

      expect(Math.round(pageHeight - sections.at(-1)!.bottom)).toBe(FLOW_SPACE);
    });
  }
});
