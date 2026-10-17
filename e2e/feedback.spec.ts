import { expect, test } from '@playwright/test';

test.describe('Toast', () => {
  test('appears in the live region and dismisses after its duration', async ({ page }) => {
    await page.goto('/#toast');

    const region = page.locator('toast-region [aria-live="polite"]');
    const trigger = page.locator('#toast-short');
    const duration = Number(await trigger.getAttribute('data-toast-duration'));

    await trigger.click();
    const shownAt = Date.now();

    const toast = region.locator('.toast', { hasText: 'Saved for two seconds' });
    await expect(toast).toBeVisible();
    await expect(region).toHaveAttribute('role', 'status');

    await expect(toast).toHaveCount(0, { timeout: duration + 3000 });
    expect(Date.now() - shownAt).toBeGreaterThanOrEqual(duration - 250);
  });

  test('announces warnings and errors in an assertive region, like Alert', async ({ page }) => {
    await page.goto('/#toast');

    await page.locator('#toast-success').click();
    await page.locator('#toast-danger').click();
    await page.locator('#toast-info').click();

    const polite = page.locator('toast-region [role="status"][aria-live="polite"] .toast');
    const assertive = page.locator('toast-region [role="alert"][aria-live="assertive"] .toast');
    await expect(polite).toHaveCount(2);
    await expect(polite.nth(0)).toHaveClass(/success/);
    await expect(polite.nth(1)).toHaveClass(/info/);
    await expect(assertive).toHaveCount(1);
    await expect(assertive).toHaveClass(/danger/);
    await expect(assertive).toContainText('Payment declined');
  });

  test('can be dismissed before its duration', async ({ page }) => {
    await page.goto('/#toast');

    await page.locator('#toast-success').click();
    const toast = page.locator('toast-region .toast');
    await expect(toast).toHaveCount(1);

    await toast.getByRole('button', { name: 'Dismiss' }).click();
    await expect(toast).toHaveCount(0);
  });
});
