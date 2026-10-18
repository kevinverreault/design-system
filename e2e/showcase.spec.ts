import { expect, test, type Page } from '@playwright/test';
import { settleLayout } from './page-helpers';

/** The showcase container's flow spacing between its sections, in pixels: --flow-space: 2rem. */
const FLOW_SPACE = 32;

const viewports = [{ width: 1280, height: 768 }, { width: 375, height: 812 }];
const themes = ['light', 'dark'] as const;

/** Opens the showcase at `viewport` in `theme`, with its layout settled. */
async function open(page: Page, viewport: { width: number, height: number }, theme: typeof themes[number]) {
  await page.setViewportSize(viewport);
  await page.goto('/');
  if (theme === 'dark') {
    await page.locator('theme-toggle button').click();
    await expect(page.locator('html')).toHaveClass(/theme-dark/);
  }
  await settleLayout(page);
}

/** Measures, in page coordinates, where each top-level demo section starts and ends, and how tall the page is. */
function measureSections(page: Page) {
  return page.locator('.container > section').evaluateAll(sections => ({
    sections: sections.map(section => {
      const { top, bottom } = section.getBoundingClientRect();
      return { id: section.id, top: top + scrollY, bottom: bottom + scrollY };
    }),
    pageHeight: document.documentElement.getBoundingClientRect().height,
  }));
}

test.describe('Showcase', () => {
  for (const viewport of viewports) {
    for (const theme of themes) {
      test(`spaces its sections evenly at ${viewport.width}px wide in ${theme}`, async ({ page }) => {
        await open(page, viewport, theme);

        const { sections } = await measureSections(page);
        const gaps = sections.slice(1).map((section, index) => ({
          after: sections[index].id,
          gap: Math.round(section.top - sections[index].bottom),
        }));

        expect(gaps).toEqual(gaps.map(({ after }) => ({ after, gap: FLOW_SPACE })));
      });

      test(`ends one flow space below the last section at ${viewport.width}px wide in ${theme}`, async ({ page }) => {
        await open(page, viewport, theme);

        const { sections, pageHeight } = await measureSections(page);

        expect(Math.round(pageHeight - sections.at(-1)!.bottom)).toBe(FLOW_SPACE);
      });
    }
  }

  test('gives no Row or Tabs panel a bottom margin, wherever it sits', async ({ page }) => {
    await page.goto('/');

    const margins = await page.locator('.container :is(.row, .tab-panel)').evaluateAll(elements =>
      elements.map(element => ({
        in: element.closest('.container > section')!.id,
        marginBottom: getComputedStyle(element).marginBottom,
      }))
    );

    expect(margins.length).toBeGreaterThan(0);
    expect(margins).toEqual(margins.map(({ in: section }) => ({ in: section, marginBottom: '0px' })));
  });
});
