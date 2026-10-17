import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Separator from './Separator.astro';

async function renderSeparator(props: Record<string, unknown> = {}) {
  return (await render(Separator, { props })).querySelector('.separator')!;
}

describe('Separator', () => {
  test('is decorative and horizontal by default', async () => {
    const separator = await renderSeparator();

    expect(separator.getAttribute('role')).toBe('none');
    expect(separator.hasAttribute('aria-orientation')).toBe(false);
    expect(separator.classList.contains('horizontal')).toBe(true);
  });

  test('can be vertical', async () => {
    const separator = await renderSeparator({ orientation: 'vertical' });

    expect(separator.classList.contains('vertical')).toBe(true);
    expect(separator.getAttribute('role')).toBe('none');
  });

  test.each(['horizontal', 'vertical'] as const)('is a %s separator with its orientation when not decorative', async orientation => {
    const separator = await renderSeparator({ decorative: false, orientation });

    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe(orientation);
  });

  test('passes through native attributes', async () => {
    const separator = await renderSeparator({ id: 'divider', class: 'wide' });

    expect(separator.id).toBe('divider');
    expect(separator.classList.contains('wide')).toBe(true);
  });
});
