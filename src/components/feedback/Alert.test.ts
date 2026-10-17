import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Alert from './Alert.astro';

async function renderAlert(props: Record<string, unknown> = {}, slot = 'Your print is on its way.') {
  return (await render(Alert, { props, slots: { default: slot } })).querySelector('.alert')!;
}

describe('Alert', () => {
  test('renders an info status holding its message by default', async () => {
    const alert = await renderAlert();

    expect(alert.classList.contains('info')).toBe(true);
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.textContent).toContain('Your print is on its way.');
  });

  test.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ] as const)('renders the %s variant with role="%s"', async (variant, role) => {
    const alert = await renderAlert({ variant });

    expect(alert.classList.contains(variant)).toBe(true);
    expect(alert.getAttribute('role')).toBe(role);
  });

  test('renders a title above the message', async () => {
    const alert = await renderAlert({ title: 'Order received' });

    expect(alert.querySelector('.alert-title')?.textContent).toBe('Order received');
  });

  test('renders no icon unless one is given', async () => {
    const alert = await renderAlert();

    expect(alert.querySelector('svg')).toBeNull();
  });

  test('renders a decorative leading icon from the icon set', async () => {
    const alert = await renderAlert({ icon: 'info' });
    const icon = alert.querySelector('svg')!;

    expect(icon).not.toBeNull();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  test('throws on an unknown variant', async () => {
    await expect(renderAlert({ variant: 'primary' })).rejects.toThrow(/variant.*primary/i);
  });

  test('passes through id, class and aria attributes', async () => {
    const alert = await renderAlert({ id: 'saved', class: 'extra', 'aria-label': 'Saved' });

    expect(alert.id).toBe('saved');
    expect(alert.classList.contains('extra')).toBe(true);
    expect(alert.getAttribute('aria-label')).toBe('Saved');
  });
});
