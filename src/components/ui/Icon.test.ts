import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Icon from './Icon.astro';

async function renderIcon(props: Record<string, unknown>) {
  return (await render(Icon, { props })).querySelector('svg')!;
}

describe('Icon', () => {
  test('keeps the attributes of the file’s root svg', async () => {
    const svg = await renderIcon({ icon: 'info' });

    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.classList.contains('lucide-info')).toBe(true);
  });

  test('lets props override and add attributes', async () => {
    const svg = await renderIcon({ icon: 'info', class: 'alert-icon', 'stroke-width': '1', 'aria-hidden': 'true' });

    expect(svg.getAttribute('class')).toBe('alert-icon');
    expect(svg.getAttribute('stroke-width')).toBe('1');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('icon')).toBe(false);
  });

  test('renders the file’s content inside the svg', async () => {
    const svg = await renderIcon({ icon: 'info' });

    expect(svg.querySelector('circle')!.getAttribute('r')).toBe('10');
    expect(svg.querySelectorAll('path').map(path => path.getAttribute('d'))).toEqual(['M12 16v-4', 'M12 8h.01']);
  });

  test('throws for an icon with no file', async () => {
    await expect(render(Icon, { props: { icon: 'no-such-icon' } })).rejects.toThrow(/no-such-icon\.svg not found/);
  });
});
