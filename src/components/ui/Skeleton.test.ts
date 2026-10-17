import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Skeleton from './Skeleton.astro';

async function renderSkeleton(props: Record<string, unknown> = {}) {
  return (await render(Skeleton, { props })).querySelector('.skeleton')!;
}

describe('Skeleton', () => {
  test('is a block placeholder hidden from assistive technology', async () => {
    const skeleton = await renderSkeleton();

    expect(skeleton.classList.contains('shape-block')).toBe(true);
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.textContent.trim()).toBe('');
  });

  test.each([['line', 'shape-line'], ['circle', 'shape-circle']] as const)('takes the %s shape', async (shape, expected) => {
    const skeleton = await renderSkeleton({ shape });

    expect(skeleton.classList.contains(expected)).toBe(true);
  });

  test('passes through native attributes such as style for sizing', async () => {
    const skeleton = await renderSkeleton({ id: 'loading-title', class: 'title', style: 'width: 12rem' });

    expect(skeleton.id).toBe('loading-title');
    expect(skeleton.classList.contains('title')).toBe(true);
    expect(skeleton.getAttribute('style')).toContain('12rem');
  });
});
