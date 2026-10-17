import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import RadioGroup from './RadioGroup.astro';

const options = [
  { value: 'a4', label: 'A4' },
  { value: 'a3', label: 'A3' },
  { value: 'a2', label: 'A2', disabled: true }
];

async function renderGroup(props: Record<string, unknown> = {}) {
  return (await render(RadioGroup, { props: { name: 'format', options, ...props } })).querySelector('fieldset')!;
}

describe('RadioGroup', () => {
  test('renders a radiogroup fieldset with one labelled radio per option, sharing the name', async () => {
    const group = await renderGroup();
    const radios = group.querySelectorAll('input');

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(radios.map(radio => radio.getAttribute('type'))).toEqual(['radio', 'radio', 'radio']);
    expect(radios.map(radio => radio.getAttribute('name'))).toEqual(['format', 'format', 'format']);
    expect(radios.map(radio => radio.getAttribute('value'))).toEqual(['a4', 'a3', 'a2']);
    expect(radios.map(radio => radio.closest('label')?.textContent.trim())).toEqual(['A4', 'A3', 'A2']);
  });

  test('checks the radio matching the value', async () => {
    const group = await renderGroup({ value: 'a3' });

    expect(group.querySelectorAll('input[checked]').map(radio => radio.getAttribute('value'))).toEqual(['a3']);
  });

  test('checks nothing without a value', async () => {
    const group = await renderGroup();

    expect(group.querySelectorAll('input[checked]')).toHaveLength(0);
  });

  test('disables individual options', async () => {
    const group = await renderGroup();

    expect(group.querySelectorAll('input[disabled]').map(radio => radio.getAttribute('value'))).toEqual(['a2']);
  });

  test('makes every radio required when the group is required', async () => {
    const group = await renderGroup({ required: true });

    expect(group.querySelectorAll('input[required]')).toHaveLength(3);
    expect(group.hasAttribute('required')).toBe(false);
  });

  test('renders a legend when given one', async () => {
    const group = await renderGroup({ legend: 'Print size' });

    expect(group.querySelector('legend')?.textContent.trim()).toBe('Print size');
  });

  test('passes other attributes such as disabled, id and aria-* to the fieldset', async () => {
    const group = await renderGroup({ disabled: true, id: 'format', 'aria-describedby': 'hint', class: 'extra' });

    expect(group.hasAttribute('disabled')).toBe(true);
    expect(group.id).toBe('format');
    expect(group.getAttribute('aria-describedby')).toBe('hint');
    expect(group.classList.contains('extra')).toBe(true);
  });

  test('can lay its options out horizontally', async () => {
    const group = await renderGroup({ orientation: 'horizontal' });

    expect(group.classList.contains('horizontal')).toBe(true);
  });

  test('throws without options', async () => {
    await expect(renderGroup({ options: [] })).rejects.toThrow(/RadioGroup.*option/i);
  });

  test('throws when the value matches no option', async () => {
    await expect(renderGroup({ value: 'a0' })).rejects.toThrow(/a0/);
  });
});
