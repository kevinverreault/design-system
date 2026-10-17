import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Footer from './Footer.astro';

const groups = [
  { title: 'Portfolio', links: [{ text: 'Oiseaux', path: '/oiseaux' }, { text: 'Paysages', path: '/paysages' }] },
  { title: 'Boutique', links: [{ text: 'Impressions', path: '/impressions' }] },
];

const social = [
  { icon: 'instagram', text: 'Instagram', path: 'https://instagram.com/example' },
  { icon: 'facebook', text: 'Facebook', path: 'https://facebook.com/example' },
];

async function renderFooter(props: Record<string, unknown> = {}) {
  return (await render(Footer, { props: { groups, social, copyright: 'Kevin Verreault 2024', ...props } })).querySelector('footer')!;
}

describe('Footer', () => {
  test('renders each link group with its title and links', async () => {
    const footer = await renderFooter();
    const renderedGroups = footer.querySelectorAll('.footer-group');

    expect(renderedGroups.map(group => group.querySelector('h2')?.textContent.trim())).toEqual(['Portfolio', 'Boutique']);
    expect(renderedGroups[0].querySelectorAll('a').map(link => [link.textContent.trim(), link.getAttribute('href')])).toEqual([
      ['Oiseaux', '/oiseaux'],
      ['Paysages', '/paysages'],
    ]);
  });

  test('renders social links as icons named by their text', async () => {
    const footer = await renderFooter();
    const links = footer.querySelectorAll('.footer-social a');

    expect(links.map(link => link.getAttribute('href'))).toEqual(['https://instagram.com/example', 'https://facebook.com/example']);
    expect(links.map(link => link.getAttribute('aria-label'))).toEqual(['Instagram', 'Facebook']);
    expect(links.every(link => link.querySelector('svg')?.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  test('prefixes the copyright line with ©', async () => {
    const footer = await renderFooter();

    expect(footer.querySelector('.footer-copyright')?.textContent.trim()).toBe('© Kevin Verreault 2024');
  });

  test('throws on a social icon missing from the icon set', async () => {
    await expect(renderFooter({ social: [{ icon: 'myspace', text: 'Myspace', path: '/' }] })).rejects.toThrow(/myspace/);
  });

  test('renders no social list when there are no social links', async () => {
    const footer = await renderFooter({ social: [] });

    expect(footer.querySelector('.footer-social')).toBeNull();
  });

  test('passes through id and class', async () => {
    const footer = await renderFooter({ id: 'site-footer', class: 'extra' });

    expect(footer.id).toBe('site-footer');
    expect(footer.classList.contains('extra')).toBe(true);
  });
});
