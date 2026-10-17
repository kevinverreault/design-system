import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Toast from './Toast.astro';

describe('Toast region', () => {
  test('renders an empty polite region and an empty assertive region under a labelled landmark', async () => {
    const root = await render(Toast);
    const landmark = root.querySelector('toast-region section')!;
    const polite = landmark.querySelector('[role="status"]')!;
    const assertive = landmark.querySelector('[role="alert"]')!;

    expect(landmark.getAttribute('aria-label')).toBe('Notifications');
    expect(polite.getAttribute('aria-live')).toBe('polite');
    expect(assertive.getAttribute('aria-live')).toBe('assertive');
    expect(polite.childNodes).toHaveLength(0);
    expect(assertive.childNodes).toHaveLength(0);
  });

  test('accepts a translated landmark name', async () => {
    const root = await render(Toast, { props: { label: 'Notifications du site' } });

    expect(root.querySelector('toast-region section')?.getAttribute('aria-label')).toBe('Notifications du site');
  });

  test('passes through id and class', async () => {
    const region = (await render(Toast, { props: { id: 'toasts', class: 'extra' } })).querySelector('toast-region')!;

    expect(region.id).toBe('toasts');
    expect(region.classList.contains('extra')).toBe(true);
  });
});
