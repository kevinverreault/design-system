import { expect, test, type Page } from '@playwright/test';

test.describe('Tabs', () => {
  const tabsIn = (page: Page) => page.locator('#tabs-print-formats');

  test('builds a tab list showing only the first panel', async ({ page }) => {
    await page.goto('/#tabs');

    const tabs = tabsIn(page).getByRole('tab');
    await expect(tabsIn(page).getByRole('tablist')).toHaveAccessibleName('Print formats');
    await expect(tabs).toHaveText(['Small', 'Medium', 'Large']);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(tabsIn(page).getByRole('tabpanel')).toHaveCount(1);
    await expect(tabsIn(page).getByRole('tabpanel')).toHaveAccessibleName('Small');
  });

  test('moves selection with the arrow keys and Home/End, with a roving tabindex', async ({ page }) => {
    await page.goto('/#tabs');

    const tabs = tabsIn(page).getByRole('tab');
    const panel = tabsIn(page).getByRole('tabpanel');

    const expectSelected = async (index: number, name: string) => {
      await expect(tabs.nth(index)).toBeFocused();
      await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
      await expect(tabsIn(page).locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
      await expect(tabs.nth(index)).toHaveAttribute('tabindex', '0');
      await expect(panel).toHaveAccessibleName(name);
    };

    await tabs.nth(0).focus();

    await page.keyboard.press('ArrowRight');
    await expectSelected(1, 'Medium');

    await page.keyboard.press('End');
    await expectSelected(2, 'Large');

    await page.keyboard.press('ArrowRight');
    await expectSelected(0, 'Small');

    await page.keyboard.press('ArrowLeft');
    await expectSelected(2, 'Large');

    await page.keyboard.press('Home');
    await expectSelected(0, 'Small');
  });

  test('moves focus from the selected tab into its panel with Tab', async ({ page }) => {
    await page.goto('/#tabs');

    const tabs = tabsIn(page).getByRole('tab');
    await tabs.nth(1).click();
    await page.keyboard.press('Tab');

    await expect(tabsIn(page).getByRole('tabpanel')).toBeFocused();
    await expect(tabsIn(page).getByRole('tabpanel')).toHaveAccessibleName('Medium');
  });
});
