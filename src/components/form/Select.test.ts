import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Select from './Select.astro';

const options = '<option value="a4">A4</option><option value="a3" selected>A3</option>';

async function renderSelect(props: Record<string, unknown> = {}) {
  return (await render(Select, { props, slots: { default: options } })).querySelector('select')!;
}

describe('Select', () => {
  test('renders a native select holding its options, at the medium size by default', async () => {
    const select = await renderSelect();

    expect(select.querySelectorAll('option').map(option => option.getAttribute('value'))).toEqual(['a4', 'a3']);
    expect(select.querySelector('option[selected]')?.textContent).toBe('A3');
    expect(select.classList.contains('text-md')).toBe(true);
  });

  test('applies the small size without setting the native size attribute', async () => {
    const select = await renderSelect({ size: 'small' });

    expect(select.classList.contains('text-sm')).toBe(true);
    expect(select.hasAttribute('size')).toBe(false);
  });

  test('passes through native attributes', async () => {
    const select = await renderSelect({ name: 'format', required: true, autocomplete: 'off', disabled: true, id: 'format' });

    expect(select.getAttribute('name')).toBe('format');
    expect(select.hasAttribute('required')).toBe(true);
    expect(select.getAttribute('autocomplete')).toBe('off');
    expect(select.hasAttribute('disabled')).toBe(true);
    expect(select.id).toBe('format');
  });
});
