import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Table from './Table.astro';

const columns = [
  { key: 'size', label: 'Size' },
  { key: 'paper', label: 'Paper' },
  { key: 'price', label: 'Price', align: 'end' }
];

const rows = [
  { size: '20 × 30 cm', paper: 'Matte', price: '45 $' },
  { size: '40 × 60 cm', paper: 'Fine art', price: 120 }
];

async function renderTable(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return render(Table, { props: { caption: 'Print sizes and prices', columns, rows, ...props }, slots });
}

describe('Table', () => {
  test('renders the caption, one column header per column and one row per item', async () => {
    const table = (await renderTable()).querySelector('table')!;

    expect(table.querySelector('caption')?.textContent.trim()).toBe('Print sizes and prices');
    expect(table.querySelectorAll('thead th').map(th => th.textContent.trim())).toEqual(['Size', 'Paper', 'Price']);
    expect(table.querySelectorAll('thead th').every(th => th.getAttribute('scope') === 'col')).toBe(true);
    expect(table.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(table.querySelectorAll('tbody tr')[1].querySelectorAll('td').map(td => td.textContent.trim())).toEqual(['40 × 60 cm', 'Fine art', '120']);
  });

  test('renders an empty cell when a row has no value for a column', async () => {
    const table = (await renderTable({ rows: [{ size: 'A4' }] })).querySelector('table')!;

    expect(table.querySelectorAll('tbody td').map(td => td.textContent.trim())).toEqual(['A4', '', '']);
  });

  test('marks the row header column with th scope="row"', async () => {
    const table = (await renderTable({ rowHeader: 'size' })).querySelector('table')!;
    const firstRow = table.querySelector('tbody tr')!;

    expect(firstRow.querySelector('th')?.getAttribute('scope')).toBe('row');
    expect(firstRow.querySelector('th')?.textContent.trim()).toBe('20 × 30 cm');
    expect(firstRow.querySelectorAll('td')).toHaveLength(2);
  });

  test('fails without a caption', async () => {
    await expect(renderTable({ caption: undefined })).rejects.toThrow(/caption/);
  });

  test('fails when the row header is not one of the columns', async () => {
    await expect(renderTable({ rowHeader: 'format' })).rejects.toThrow(/format/);
  });

  test('aligns a column on its header and cells', async () => {
    const table = (await renderTable()).querySelector('table')!;

    expect(table.querySelectorAll('thead th')[2].classList.contains('align-end')).toBe(true);
    expect(table.querySelector('tbody tr')!.querySelectorAll('td')[2].classList.contains('align-end')).toBe(true);
  });

  test('lets the caption slot replace the caption text', async () => {
    const table = (await renderTable({}, { caption: 'Prices <small>taxes included</small>' })).querySelector('table')!;

    expect(table.querySelector('caption small')?.textContent).toBe('taxes included');
  });

  test('has no striped or hover style by default', async () => {
    const table = (await renderTable()).querySelector('table')!;

    expect(table.classList.contains('striped')).toBe(false);
    expect(table.classList.contains('hover')).toBe(false);
  });

  test('applies the striped and hover styles', async () => {
    const table = (await renderTable({ striped: true, hover: true })).querySelector('table')!;

    expect(table.classList.contains('striped')).toBe(true);
    expect(table.classList.contains('hover')).toBe(true);
  });

  test('passes unknown attributes to the scrolling root around the table', async () => {
    const root = (await renderTable({ id: 'prices', class: 'wide', 'data-test': 'yes' })).querySelector('#prices')!;

    expect(root.classList.contains('wide')).toBe(true);
    expect(root.getAttribute('data-test')).toBe('yes');
    expect(root.querySelector('table')).not.toBeNull();
  });
});
