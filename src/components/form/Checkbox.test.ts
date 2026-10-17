import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Checkbox from './Checkbox.astro';

describe('Checkbox', () => {
  test('renders a native checkbox', async () => {
    const input = (await render(Checkbox)).querySelector('input')!;

    expect(input.getAttribute('type')).toBe('checkbox');
    expect(input.hasAttribute('role')).toBe(false);
  });

  test('passes through native attributes', async () => {
    const input = (await render(Checkbox, {
      props: { name: 'newsletter', value: 'yes', checked: true, required: true, disabled: true, id: 'newsletter', class: 'extra' }
    })).querySelector('input')!;

    expect(input.getAttribute('name')).toBe('newsletter');
    expect(input.getAttribute('value')).toBe('yes');
    expect(input.hasAttribute('checked')).toBe(true);
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(input.id).toBe('newsletter');
    expect(input.classList.contains('extra')).toBe(true);
  });
});
