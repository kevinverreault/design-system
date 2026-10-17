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

  test('queues several messages with their variant', async ({ page }) => {
    await page.goto('/#toast');

    await page.locator('#toast-success').click();
    await page.locator('#toast-danger').click();

    const toasts = page.locator('toast-region .toast');
    await expect(toasts).toHaveCount(2);
    await expect(toasts.nth(0)).toHaveClass(/success/);
    await expect(toasts.nth(1)).toHaveClass(/danger/);
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
