import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Row from './Row.astro';

async function renderRow(props: Record<string, unknown> = {}, slot = '<div>A</div>') {
  const root = await render(Row, { props, slots: { default: slot } });
  return root.querySelector('.row')!;
}

describe('Row', () => {
  test('renders a single-column section holding its content by default', async () => {
    const row = await renderRow({}, '<p>Hello</p>');

    expect(row.tagName).toBe('SECTION');
    expect(row.classList.contains('columns-1')).toBe(true);
    expect(row.querySelector('p')?.textContent).toBe('Hello');
  });

  test.each([2, 3] as const)('renders %i columns', async (columns) => {
    const row = await renderRow({ columns });

    expect(row.classList.contains(`columns-${columns}`)).toBe(true);
  });

  test('splits two columns evenly by default', async () => {
    const row = await renderRow({ columns: 2 });

    expect(row.classList.contains('ratio-1-1')).toBe(true);
  });

  test.each([['2:1', 'ratio-2-1'], ['1:2', 'ratio-1-2']] as const)('gives two columns a %s split', async (ratio, expected) => {
    const row = await renderRow({ columns: 2, ratio });

    expect(row.classList.contains(expected)).toBe(true);
    expect(row.classList.contains('ratio-1-1')).toBe(false);
  });

  test.each([1, 3] as const)('throws when ratio is used with %i column(s)', async (columns) => {
    await expect(renderRow({ columns, ratio: '2:1' })).rejects.toThrow(/ratio.*2 columns/i);
  });

  test('throws on an unsupported column count', async () => {
    await expect(renderRow({ columns: 4 })).rejects.toThrow(/columns/i);
  });

  test('uses a medium gap, no background and the contained width by default', async () => {
    const row = await renderRow();

    expect(row.classList.contains('gap-medium')).toBe(true);
    expect(row.classList.contains('background-none')).toBe(true);
    expect(row.classList.contains('width-contained')).toBe(true);
  });

  test.each(['small', 'medium', 'large'] as const)('applies the %s gap', async (gap) => {
    const row = await renderRow({ gap });

    expect(row.classList.contains(`gap-${gap}`)).toBe(true);
  });

  test.each(['background', 'surface', 'primary', 'secondary'] as const)('applies the %s background', async (background) => {
    const row = await renderRow({ background });

    expect(row.classList.contains(`background-${background}`)).toBe(true);
  });

  test('can span the full width', async () => {
    const row = await renderRow({ width: 'full' });

    expect(row.classList.contains('width-full')).toBe(true);
    expect(row.classList.contains('width-contained')).toBe(false);
  });

  test.each(['div', 'article'] as const)('renders as a %s', async (as) => {
    const row = await renderRow({ as });

    expect(row.tagName).toBe(as.toUpperCase());
  });

  test('passes through id, class and aria attributes', async () => {
    const row = await renderRow({ id: 'about', class: 'extra', 'aria-label': 'About' });

    expect(row.id).toBe('about');
    expect(row.classList.contains('extra')).toBe(true);
    expect(row.getAttribute('aria-label')).toBe('About');
  });
});
