import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Link from './Link.astro';

describe('Link', () => {
  test('renders an anchor with its href and slot content', async () => {
    const anchor = (await render(Link, { props: { href: '/contact' }, slots: { default: 'Contact' } })).querySelector('a')!;

    expect(anchor.getAttribute('href')).toBe('/contact');
    expect(anchor.textContent.trim()).toBe('Contact');
  });

  test('passes through attributes such as id, target and aria-*', async () => {
    const anchor = (await render(Link, {
      props: { href: 'https://example.com', id: 'external', target: '_blank', rel: 'noopener', 'aria-label': 'Example site' }
    })).querySelector('a')!;

    expect(anchor.id).toBe('external');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noopener');
    expect(anchor.getAttribute('aria-label')).toBe('Example site');
  });

  test('merges a custom class with the variant classes', async () => {
    const anchor = (await render(Link, { props: { href: '/', variant: 'primary', class: 'extra' } })).querySelector('a')!;

    expect(anchor.classList.contains('primary')).toBe(true);
    expect(anchor.classList.contains('extra')).toBe(true);
  });
});
