import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Switch from './Switch.astro';

describe('Switch', () => {
  test('renders a checkbox with the switch role', async () => {
    const input = (await render(Switch)).querySelector('input')!;

    expect(input.getAttribute('type')).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
  });

  test('passes through native attributes', async () => {
    const input = (await render(Switch, { props: { name: 'dark', checked: true, disabled: true, id: 'dark' } })).querySelector('input')!;

    expect(input.getAttribute('name')).toBe('dark');
    expect(input.hasAttribute('checked')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(input.id).toBe('dark');
  });
});
