import { expect, test, type Locator } from '@playwright/test';
import { chevron } from './form-helpers';
import { useTheme } from './page-helpers';

const height = (locator: Locator) => locator.evaluate(element => element.getBoundingClientRect().height);

/**
 * Where a Switch's thumb (its ::before) sits along the track, as fractions of
 * the track width: the thumb is the track's only flex item, offset by its
 * transform. 0 is the track's start edge, 1 its end edge.
 */
const thumbPosition = (locator: Locator) => locator.evaluate(element => {
  const track = getComputedStyle(element);
  const thumb = getComputedStyle(element, '::before');
  const width = element.getBoundingClientRect().width;
  const thumbWidth = parseFloat(thumb.width);
  const inset = parseFloat(track.borderLeftWidth) + parseFloat(track.paddingLeft);
  const free = width - inset - parseFloat(track.borderRightWidth) - parseFloat(track.paddingRight) - thumbWidth;
  const offset = { center: free / 2, 'flex-end': free, end: free }[track.justifyContent] ?? 0;
  const translate = thumb.transform === 'none' ? 0 : new DOMMatrixReadOnly(thumb.transform).m41;
  const start = inset + offset + translate;
  return { start: start / width, centre: (start + thumbWidth / 2) / width, end: (start + thumbWidth) / width };
});

const chevronTurn = async (select: Locator) => (await chevron(select)).turn;

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

  test('a control reached with the keyboard shows focus as a single accent edge, not a second ring', async ({ page }) => {
    await page.goto('/#label');

    const input = page.locator('#label-standalone');
    const edge = () => input.evaluate(element => {
      const style = getComputedStyle(element);
      return { border: style.borderTopColor, outline: style.outlineStyle };
    });
    const accent = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement('span'));
      probe.style.color = 'hsl(var(--color-accent))';
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });

    const resting = await edge();
    await input.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();

    await expect.poll(edge).toEqual({ border: accent, outline: 'none' });
    expect(resting.border).not.toBe(accent);
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

  test('a Switch thumb sits at the start when off and at the end when on, on the track', async ({ page }) => {
    await page.goto('/#switch');

    const off = await thumbPosition(page.getByRole('switch', { name: 'Email me when new prints arrive' }));
    const on = await thumbPosition(page.getByRole('switch', { name: 'On', exact: true }));

    expect(off.centre).toBeLessThan(.3);
    expect(on.centre).toBeGreaterThan(.7);
    for (const thumb of [off, on]) {
      // it may overhang the track a little, never leave it
      expect(thumb.centre).toBeGreaterThan(0);
      expect(thumb.centre).toBeLessThan(1);
      expect(thumb.start).toBeGreaterThan(-.15);
      expect(thumb.end).toBeLessThan(1.15);
    }
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

  test('a script sets and clears a FormField error: its text, the invalid state and the description', async ({ page }) => {
    await page.goto('/#form-field-script');

    const field = page.locator('#form-field-script-demo');
    const input = field.getByRole('textbox', { name: 'Email' });
    const error = field.getByText('Enter an email such as you@example.com.');

    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(error).toBeHidden();

    await input.fill('not an email');
    await input.press('Tab');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('We only use it to answer you. Enter an email such as you@example.com.');
    await expect(error).toBeVisible();

    // Firefox over WebDriver BiDi appends on fill, so empty the field first.
    await input.clear();
    await input.fill('you@example.com');

    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAccessibleDescription('We only use it to answer you.');
    await expect(error).toBeHidden();
  });

  test('a Select chevron turns over while the picker is open from a click, and back on a click outside', async ({ page }) => {
    await page.goto('/#select');

    const select = page.locator('#select-default select');
    expect(await chevronTurn(select)).toBe(0);

    await select.click();
    await expect.poll(() => chevronTurn(select)).toBe(180);

    await page.locator('#select > p').click();
    await expect.poll(() => chevronTurn(select)).toBe(0);
  });

  test('a Select chevron turns over while the picker is open from the keyboard, and back on blur', async ({ page }) => {
    await page.goto('/#select');

    const select = page.locator('#select-default select');
    await select.focus();
    await page.keyboard.press('Space');
    await expect.poll(() => chevronTurn(select)).toBe(180);

    await page.keyboard.press('Tab');
    await expect.poll(() => chevronTurn(select)).toBe(0);
  });

  for (const [close, how] of [['Escape', 'on Escape'], ['pick', 'on a pick']] as const) {
    test(`a Select chevron turns back ${how}`, async ({ page, browserName }) => {
      test.skip(browserName === 'firefox', "Firefox's picker is browser chrome, out of reach of synthetic input");
      await page.goto('/#select');

      const select = page.locator('#select-default select');
      await select.click();
      await expect.poll(() => chevronTurn(select)).toBe(180);

      if (close === 'Escape') {
        await page.keyboard.press('Escape');
      } else {
        await select.getByRole('option', { name: 'Paysages' }).click();
        await expect(select).toHaveValue('landscapes');
      }

      await expect.poll(() => chevronTurn(select)).toBe(0);
    });
  }

  test('a Select draws its own chevron, which turns in 150ms ease-in-out', async ({ page }) => {
    await page.goto('/#select');

    const { drawn, transition } = await chevron(page.locator('#select-default select'));
    expect(drawn).toBe(true);
    expect(transition).toBe('0.15s ease-in-out');
  });

  test('a disabled Select chevron does not turn', async ({ page }) => {
    await page.goto('/#select');

    const disabled = page.locator('#select-disabled select');
    const enabled = page.locator('#select-default select');
    await disabled.click({ force: true });
    // once an enabled Select has had time to turn, the disabled one would have too
    await enabled.click();
    await expect.poll(() => chevronTurn(enabled)).toBe(180);

    expect(await chevronTurn(disabled)).toBe(0);
  });

  test('an open Select popup takes the theme colours', async ({ page }) => {
    await page.goto('/#select');
    test.skip(!(await page.evaluate(() => CSS.supports('appearance', 'base-select'))), 'no customisable select: the native popup follows color-scheme');

    await useTheme(page, 'dark');

    const select = page.locator('#select-default select');
    await select.click();
    await expect(select.locator('option').first()).toBeVisible();

    const colours = await select.evaluate(element => {
      const background = document.body.appendChild(document.createElement('span'));
      background.style.color = 'hsl(var(--color-background))';
      const page = getComputedStyle(background).color;
      background.remove();
      return { page, popup: getComputedStyle(element, '::picker(select)').backgroundColor };
    });

    expect(colours.popup).toBe(colours.page);
  });

  test('controls switch colours with the theme', async ({ page }) => {
    await page.goto('/#input');
    await useTheme(page, 'light');

    const input = page.locator('#input-default').getByRole('textbox', { name: 'Name' });
    const colours = () => input.evaluate(element => {
      const style = getComputedStyle(element);
      return `${style.backgroundColor} ${style.color}`;
    });

    const light = await colours();

    await useTheme(page, 'dark');

    await expect.poll(colours).not.toBe(light);
  });
});
