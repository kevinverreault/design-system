import { describe, expect, test } from 'vitest';
import type { HTMLElement } from 'node-html-parser';
import { render } from '../../../test/render';
import Select from './Select.astro';

const options = '<option value="a4">A4</option><option value="a3" selected>A3</option>';

async function renderRoot(props: Record<string, unknown> = {}) {
  return (await render(Select, { props, slots: { default: options } })).firstChild as HTMLElement;
}

async function renderSelect(props: Record<string, unknown> = {}) {
  return (await renderRoot(props)).querySelector('select')!;
}

describe('Select', () => {
  test('renders a native select holding its options, at the medium size by default', async () => {
    const root = await renderRoot();
    const select = root.querySelector('select')!;

    expect(select.querySelectorAll('option').map(option => option.getAttribute('value'))).toEqual(['a4', 'a3']);
    expect(select.querySelector('option[selected]')?.textContent).toBe('A3');
    expect(root.classList.contains('text-md')).toBe(true);
  });

  test('applies the small size without setting the native size attribute', async () => {
    const root = await renderRoot({ size: 'small' });

    expect(root.classList.contains('text-sm')).toBe(true);
    expect(root.querySelector('select')!.hasAttribute('size')).toBe(false);
  });

  // Firefox can't draw on a native select, so the circle and chevron that turn sit on the wrapper.
  test('wraps the native select in a root that takes the size and the class', async () => {
    const root = await renderRoot({ size: 'large', class: 'wide', name: 'format' });
    const select = root.querySelector('select')!;

    expect(root.tagName).toBe('SPAN');
    expect(root.classList.contains('select')).toBe(true);
    expect(root.classList.contains('text-xl')).toBe(true);
    expect(root.classList.contains('wide')).toBe(true);
    expect(root.childNodes.filter(node => node.nodeType === 1)).toEqual([select]);
    expect(select.classList.contains('form-control')).toBe(true);
    expect(select.classList.contains('wide')).toBe(false);
    expect(select.getAttribute('name')).toBe('format');
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
