import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Breadcrumbs from './Breadcrumbs.astro';

const items = [
  { text: 'Accueil', path: '/' },
  { text: 'Portfolio', path: '/portfolio' },
  { text: 'Oiseaux', path: '/portfolio/oiseaux' },
];

async function renderBreadcrumbs(props: Record<string, unknown> = {}) {
  return (await render(Breadcrumbs, { props: { items, ...props } })).querySelector('nav')!;
}

describe('Breadcrumbs', () => {
  test('renders a labelled navigation landmark with an ordered list of links', async () => {
    const nav = await renderBreadcrumbs();
    const links = nav.querySelectorAll('ol > li a');

    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(links.map(link => link.textContent.trim())).toEqual(['Accueil', 'Portfolio', 'Oiseaux']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/', '/portfolio', '/portfolio/oiseaux']);
  });

  test('marks the last item as the current page', async () => {
    const nav = await renderBreadcrumbs();
    const current = nav.querySelectorAll('[aria-current="page"]');

    expect(current).toHaveLength(1);
    expect(current[0].textContent.trim()).toBe('Oiseaux');
  });

  test('accepts a translated label', async () => {
    const nav = await renderBreadcrumbs({ 'aria-label': "Fil d'Ariane" });

    expect(nav.getAttribute('aria-label')).toBe("Fil d'Ariane");
  });

  test('throws when there are no items', async () => {
    await expect(renderBreadcrumbs({ items: [] })).rejects.toThrow(/at least one item/i);
  });

  test('passes through id and class', async () => {
    const nav = await renderBreadcrumbs({ id: 'trail', class: 'extra' });

    expect(nav.id).toBe('trail');
    expect(nav.classList.contains('extra')).toBe(true);
  });
});
