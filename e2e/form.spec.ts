import { expect, test, type Locator } from '@playwright/test';

const height = (locator: Locator) => locator.evaluate(element => element.getBoundingClientRect().height);

test.describe('Form controls', () => {
  for (const size of ['small', 'medium', 'large']) {
    test(`an Input, a Select and a Button of size ${size} are the same height`, async ({ page }) => {
      await page.goto('/#form-alignment');

      const button = await height(page.locator(`#align-button-${size}`));

      expect(await height(page.locator(`#align-input-${size}`))).toBeCloseTo(button, 1);
      expect(await height(page.locator(`#align-select-${size}`))).toBeCloseTo(button, 1);
    });
  }

  test('clicking a FormField label focuses its control', async ({ page }) => {
    await page.goto('/#input');

    await page.locator('#input-default label').click();

    await expect(page.locator('#input-default input')).toBeFocused();
  });

  test('a control shows a visible focus ring when reached with the keyboard', async ({ page }) => {
    await page.goto('/#label');

    await page.locator('#label-standalone').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');

    const input = page.locator('#label-standalone');
    await expect(input).toBeFocused();
    expect(await input.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  });

  test('a FormField error is announced as the control description', async ({ page }) => {
    await page.goto('/#input');

    const input = page.getByRole('textbox', { name: 'Postal code' });

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter a postal code such as H2X 1Y4.');
  });

  test('a Switch is exposed as a switch and toggles with the keyboard', async ({ page }) => {
    await page.goto('/#switch');

    const toggle = page.getByRole('switch', { name: 'Email me when new prints arrive' });
    await expect(toggle).not.toBeChecked();

    await toggle.focus();
    await page.keyboard.press('Space');

    await expect(toggle).toBeChecked();
  });

  test('a RadioGroup in a FormField is a named radiogroup', async ({ page }) => {
    await page.goto('/#radio-group');

    const group = page.locator('#radio-group-field').getByRole('radiogroup', { name: 'Print size' });
    await group.getByRole('radio', { name: /A3/ }).check();

    await expect(group.getByRole('radio', { name: /A3/ })).toBeChecked();
    await expect(group).toHaveAccessibleDescription('Framing is quoted separately.');
  });

  test('the browser validates required fields natively, without JavaScript', async ({ page }) => {
    await page.goto('/#form-field');

    const form = page.locator('#form-field-demo');
    await form.getByRole('button', { name: 'Send' }).click();

    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
    await expect(form.getByRole('textbox', { name: 'Name' })).toBeFocused();
  });

  test('controls switch colours with the theme', async ({ page }) => {
    await page.goto('/#input');

    const input = page.locator('#input-default').getByRole('textbox', { name: 'Name' });
    const colours = () => input.evaluate(element => {
      const style = getComputedStyle(element);
      return `${style.backgroundColor} ${style.color}`;
    });

    const light = await colours();

    await page.locator('theme-toggle button').click();
    await expect(page.locator('html')).toHaveClass(/theme-dark/);

    await expect.poll(colours).not.toBe(light);
  });
});
