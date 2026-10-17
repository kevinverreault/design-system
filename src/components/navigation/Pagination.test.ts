import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Pagination from './Pagination.astro';

const items = [
  { text: '1', path: '/oiseaux' },
  { text: '2', path: '/oiseaux/2' },
  { text: '3', path: '/oiseaux/3' },
];

async function renderPagination(props: Record<string, unknown> = {}) {
  return (await render(Pagination, { props: { items, current: 2, ...props } })).querySelector('nav')!;
}

function pageLinks(nav: Awaited<ReturnType<typeof renderPagination>>) {
  return nav.querySelectorAll('.pagination-page');
}

describe('Pagination', () => {
  test('renders a labelled navigation landmark with a link per page', async () => {
    const nav = await renderPagination();
    const pages = pageLinks(nav);

    expect(nav.getAttribute('aria-label')).toBe('Pagination');
    expect(pages.map(page => page.textContent.trim())).toEqual(['1', '2', '3']);
    expect(pages.map(page => page.getAttribute('href'))).toEqual(['/oiseaux', '/oiseaux/2', '/oiseaux/3']);
  });

  test('marks the current page', async () => {
    const nav = await renderPagination({ current: 3 });
    const current = nav.querySelectorAll('[aria-current="page"]');

    expect(current).toHaveLength(1);
    expect(current[0].textContent.trim()).toBe('3');
  });

  test('links previous and next to the neighbouring pages', async () => {
    const nav = await renderPagination({ current: 2 });

    expect(nav.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/oiseaux');
    expect(nav.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/oiseaux/3');
  });

  test('disables previous on the first page and next on the last', async () => {
    const first = await renderPagination({ current: 1 });
    const last = await renderPagination({ current: 3 });

    expect(first.querySelector('[rel="prev"]')).toBeNull();
    expect(first.querySelector('.pagination-previous')?.getAttribute('aria-disabled')).toBe('true');
    expect(first.querySelector('.pagination-previous')?.hasAttribute('href')).toBe(false);
    expect(last.querySelector('[rel="next"]')).toBeNull();
    expect(last.querySelector('.pagination-next')?.getAttribute('aria-disabled')).toBe('true');
  });

  test('accepts translated labels', async () => {
    const nav = await renderPagination({ 'aria-label': 'Pages', previousLabel: 'Précédent', nextLabel: 'Suivant' });

    expect(nav.getAttribute('aria-label')).toBe('Pages');
    expect(nav.querySelector('.pagination-previous')?.textContent).toContain('Précédent');
    expect(nav.querySelector('.pagination-next')?.textContent).toContain('Suivant');
  });

  test.each([0, 4])('throws when the current page %i is out of range', async (current) => {
    await expect(renderPagination({ current })).rejects.toThrow(/current page/i);
  });

  test('passes through id and class', async () => {
    const nav = await renderPagination({ id: 'pages', class: 'extra' });

    expect(nav.id).toBe('pages');
    expect(nav.classList.contains('extra')).toBe(true);
  });
});
