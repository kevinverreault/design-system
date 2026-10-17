import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Badge from './Badge.astro';

async function renderBadge(props: Record<string, unknown> = {}, text = 'New') {
  return (await render(Badge, { props, slots: { default: text } })).querySelector('.badge')!;
}

describe('Badge', () => {
  test('renders its slot content in an inline element', async () => {
    const badge = await renderBadge();

    expect(badge.tagName).toBe('SPAN');
    expect(badge.textContent.trim()).toBe('New');
  });

  test('is primary by default', async () => {
    const badge = await renderBadge();

    expect(badge.classList.contains('primary')).toBe(true);
  });

  test.each(['primary', 'secondary', 'muted', 'danger', 'outline'] as const)('applies the %s variant', async variant => {
    const badge = await renderBadge({ variant });

    expect(badge.classList.contains(variant)).toBe(true);
  });

  test('passes through native attributes and keeps its own class', async () => {
    const badge = await renderBadge({ id: 'sold-out', class: 'extra', title: 'Sold out' });

    expect(badge.id).toBe('sold-out');
    expect(badge.getAttribute('title')).toBe('Sold out');
    expect(badge.classList.contains('extra')).toBe(true);
    expect(badge.classList.contains('badge')).toBe(true);
  });
});
