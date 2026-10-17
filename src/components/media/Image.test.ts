import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import dusk from '../../assets/showcase/dusk.jpg';
import Image from './Image.astro';

const remote = 'https://example.com/photos/heron.jpg';

async function renderFigure(props: Record<string, unknown>, slots: Record<string, string> = {}) {
  return (await render(Image, { props, slots })).querySelector('figure')!;
}

describe('Image', () => {
  test('renders a remote source as a figure holding an image', async () => {
    const img = (await renderFigure({ src: remote, alt: 'A heron' })).querySelector('img')!;

    expect(img.getAttribute('src')).toBe(remote);
    expect(img.getAttribute('alt')).toBe('A heron');
  });

  test('renders no figcaption when there is no credit', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron' });

    expect(figure.querySelector('figcaption')).toBeNull();
  });

  test('renders a local asset through Astro image optimisation', async () => {
    const img = (await renderFigure({ src: dusk, alt: 'Dusk over the hills' })).querySelector('img')!;

    expect(img.getAttribute('alt')).toBe('Dusk over the hills');
    expect(img.getAttribute('srcset')).toBeTruthy();
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  test('fails when alt is missing', async () => {
    await expect(renderFigure({ src: remote })).rejects.toThrow(/alt/);
  });

  test('allows an empty alt for decorative images', async () => {
    const img = (await renderFigure({ src: remote, alt: '' })).querySelector('img')!;

    expect(img.getAttribute('alt')).toBe('');
  });

  test('renders a plain-text credit in a figcaption with a © prefix', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron', credit: 'Kevin Verreault 2024' });

    expect(figure.querySelector('figcaption')?.textContent.trim()).toBe('© Kevin Verreault 2024');
  });

  test('lets the credit slot override the credit text', async () => {
    const figure = await renderFigure(
      { src: remote, alt: 'A heron', credit: 'Ignored' },
      { credit: '<a href="/bio">Photo by Kevin</a>' }
    );
    const caption = figure.querySelector('figcaption')!;

    expect(caption.querySelector('a')?.getAttribute('href')).toBe('/bio');
    expect(caption.textContent).not.toContain('Ignored');
  });

  test('renders a figcaption from the credit slot alone', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron' }, { credit: 'Studio K' });

    expect(figure.querySelector('figcaption')?.textContent.trim()).toBe('Studio K');
  });

  test('keeps the natural aspect ratio and covers by default', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron' });

    expect(figure.classList.contains('ratio-auto')).toBe(true);
    expect(figure.classList.contains('fit-cover')).toBe(true);
  });

  test.each([['1:1', 'ratio-1-1'], ['3:2', 'ratio-3-2'], ['16:9', 'ratio-16-9']] as const)('applies the %s ratio', async (ratio, expected) => {
    const figure = await renderFigure({ src: remote, alt: 'A heron', ratio });

    expect(figure.classList.contains(expected)).toBe(true);
  });

  test('can contain the image instead of covering', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron', fit: 'contain' });

    expect(figure.classList.contains('fit-contain')).toBe(true);
    expect(figure.classList.contains('fit-cover')).toBe(false);
  });

  test('passes unknown attributes such as id, class and aria-* to the figure', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron', id: 'heron', class: 'hero', 'aria-label': 'Heron photo', 'data-index': '3' });
    const img = figure.querySelector('img')!;

    expect(figure.id).toBe('heron');
    expect(figure.classList.contains('hero')).toBe(true);
    expect(figure.getAttribute('aria-label')).toBe('Heron photo');
    expect(figure.getAttribute('data-index')).toBe('3');
    expect(img.id).toBe('');
    expect(img.hasAttribute('aria-label')).toBe(false);
  });

  test('passes image attributes such as loading, width and height to the img', async () => {
    const figure = await renderFigure({ src: remote, alt: 'A heron', loading: 'eager', width: 600, height: 400, fetchpriority: 'high' });
    const img = figure.querySelector('img')!;

    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('width')).toBe('600');
    expect(img.getAttribute('height')).toBe('400');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(figure.hasAttribute('loading')).toBe(false);
  });
});
