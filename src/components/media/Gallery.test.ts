import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import dusk from '../../assets/showcase/dusk.jpg';
import Gallery from './Gallery.astro';

const heron = { src: 'https://example.com/photos/heron.jpg', alt: 'A heron', credit: 'Kevin Verreault 2024' };
const fox = { src: 'https://example.com/photos/fox.jpg', alt: 'A red fox' };
const hills = { src: dusk, alt: 'Hills at dusk', credit: 'Kevin Verreault 2023' };

async function renderGallery(props: Record<string, unknown>) {
  return (await render(Gallery, { props })).querySelector('.gallery')!;
}

describe('Gallery', () => {
  test('renders a list with one Image per item, in order', async () => {
    const gallery = await renderGallery({ images: [heron, fox, hills] });

    expect(gallery.tagName).toBe('UL');
    expect(gallery.querySelectorAll('li')).toHaveLength(3);
    expect(gallery.querySelectorAll('li figure img').map(img => img.getAttribute('alt'))).toEqual(['A heron', 'A red fox', 'Hills at dusk']);
  });

  test('renders each Image with its credit', async () => {
    const gallery = await renderGallery({ images: [heron, fox, hills] });
    const items = gallery.querySelectorAll('li');

    expect(items[0].querySelector('figcaption')?.textContent.trim()).toBe('© Kevin Verreault 2024');
    expect(items[1].querySelector('figcaption')).toBeNull();
    expect(items[2].querySelector('figcaption')?.textContent.trim()).toBe('© Kevin Verreault 2023');
  });

  test('links each Image to its full-size version', async () => {
    const gallery = await renderGallery({ images: [heron, hills] });
    const links = gallery.querySelectorAll('li > a');

    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe(heron.src);
    expect(links[0].querySelector('figure')).not.toBeNull();
    expect(links[1].getAttribute('href')).toMatch(/_image|\.(webp|jpg)/);
  });

  test('gives every thumbnail the same 3:2 cover crop by default', async () => {
    const figures = (await renderGallery({ images: [heron, hills] })).querySelectorAll('figure');

    expect(figures.every(figure => figure.classList.contains('ratio-3-2') && figure.classList.contains('fit-cover'))).toBe(true);
  });

  test('applies the chosen ratio to every thumbnail', async () => {
    const figures = (await renderGallery({ images: [heron, fox], ratio: '1:1' })).querySelectorAll('figure');

    expect(figures.every(figure => figure.classList.contains('ratio-1-1'))).toBe(true);
  });

  test('uses medium columns and a small gap by default', async () => {
    const gallery = await renderGallery({ images: [heron] });

    expect(gallery.classList.contains('column-width-medium')).toBe(true);
    expect(gallery.classList.contains('gap-small')).toBe(true);
  });

  test('takes a column width and gap', async () => {
    const gallery = await renderGallery({ images: [heron], columnWidth: 'small', gap: 'large' });

    expect(gallery.classList.contains('column-width-small')).toBe(true);
    expect(gallery.classList.contains('gap-large')).toBe(true);
  });

  test('fails when an image has an empty alt, since every image is a link', async () => {
    await expect(renderGallery({ images: [heron, { src: fox.src, alt: '' }] })).rejects.toThrow(/alt/);
  });

  test('passes through native attributes such as id and aria-label', async () => {
    const gallery = await renderGallery({ images: [heron], id: 'oiseaux', class: 'wide', 'aria-label': 'Oiseaux' });

    expect(gallery.id).toBe('oiseaux');
    expect(gallery.classList.contains('wide')).toBe(true);
    expect(gallery.getAttribute('aria-label')).toBe('Oiseaux');
  });
});
