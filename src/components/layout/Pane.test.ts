import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Pane from './Pane.astro';

async function renderPane(props: Record<string, unknown> = {}) {
  const root = await render(Pane, { props, slots: { default: '<p>Content</p>' } });
  return root.querySelector('.pane')!;
}

describe('Pane', () => {
  test('renders its content aligned to the start on both axes by default', async () => {
    const pane = await renderPane();

    expect(pane.querySelector('p')?.textContent).toBe('Content');
    expect(pane.classList.contains('align-start')).toBe(true);
    expect(pane.classList.contains('valign-start')).toBe(true);
  });

  test('centres both axes with the center shorthand', async () => {
    const pane = await renderPane({ center: true });

    expect(pane.classList.contains('align-center')).toBe(true);
    expect(pane.classList.contains('valign-center')).toBe(true);
  });

  test.each(['start', 'center', 'end'] as const)('aligns horizontally to %s', async (align) => {
    const pane = await renderPane({ align });

    expect(pane.classList.contains(`align-${align}`)).toBe(true);
    expect(pane.classList.contains('valign-start')).toBe(true);
  });

  test.each(['start', 'center', 'end'] as const)('aligns vertically to %s', async (valign) => {
    const pane = await renderPane({ valign });

    expect(pane.classList.contains(`valign-${valign}`)).toBe(true);
    expect(pane.classList.contains('align-start')).toBe(true);
  });

  test('lets an explicit axis override the center shorthand', async () => {
    const pane = await renderPane({ center: true, valign: 'end' });

    expect(pane.classList.contains('align-center')).toBe(true);
    expect(pane.classList.contains('valign-end')).toBe(true);
  });

  test('passes through id, class and aria attributes', async () => {
    const pane = await renderPane({ id: 'photo', class: 'extra', 'aria-label': 'Photo' });

    expect(pane.id).toBe('photo');
    expect(pane.classList.contains('extra')).toBe(true);
    expect(pane.getAttribute('aria-label')).toBe('Photo');
  });
});
