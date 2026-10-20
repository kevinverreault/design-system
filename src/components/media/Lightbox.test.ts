import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Lightbox from './Lightbox.astro';

async function renderLightbox(props: Record<string, unknown> = {}) {
  return (await render(Lightbox, { props })).querySelector('dialog')!;
}

describe('Lightbox', () => {
  test('renders a closed, light-dismissable native dialog with an accessible name', async () => {
    const dialog = await renderLightbox();

    expect(dialog.hasAttribute('open')).toBe(false);
    expect(dialog.getAttribute('closedby')).toBe('any');
    expect(dialog.getAttribute('aria-label')).toBe('Photo viewer');
  });

  test('has named previous, next and close buttons', async () => {
    const dialog = await renderLightbox();
    const names = dialog.querySelectorAll('button').map(button => button.getAttribute('aria-label'));

    expect(names).toEqual(expect.arrayContaining(['Close', 'Previous photo', 'Next photo']));
  });

  test('takes translated labels', async () => {
    const dialog = await renderLightbox({ label: 'Visionneuse', closeLabel: 'Fermer', previousLabel: 'Photo précédente', nextLabel: 'Photo suivante' });
    const names = dialog.querySelectorAll('button').map(button => button.getAttribute('aria-label'));

    expect(dialog.getAttribute('aria-label')).toBe('Visionneuse');
    expect(names).toEqual(expect.arrayContaining(['Fermer', 'Photo précédente', 'Photo suivante']));
  });

  test('closes from its close button without JavaScript', async () => {
    const dialog = await renderLightbox();

    expect(dialog.querySelector('button[aria-label="Close"]')?.closest('form')?.getAttribute('method')).toBe('dialog');
  });

  test('preloads 2 neighbouring photos by default', async () => {
    const viewer = (await render(Lightbox)).querySelector('light-box')!;

    expect(viewer.getAttribute('data-preload')).toBe('2');
  });

  test('takes the number of neighbouring photos to preload, 0 turning it off', async () => {
    for (const preload of [5, 0]) {
      const viewer = (await render(Lightbox, { props: { preload } })).querySelector('light-box')!;

      expect(viewer.getAttribute('data-preload')).toBe(String(preload));
    }
  });

  test('rejects a preload count that is not a whole number of photos', async () => {
    for (const preload of [-1, 1.5, Number.NaN]) {
      await expect(render(Lightbox, { props: { preload } })).rejects.toThrow(new RegExp(`preload.*'${preload}'`));
    }
  });

  test('passes through native attributes', async () => {
    const dialog = await renderLightbox({ id: 'viewer', class: 'extra' });

    expect(dialog.id).toBe('viewer');
    expect(dialog.classList.contains('extra')).toBe(true);
  });
});
