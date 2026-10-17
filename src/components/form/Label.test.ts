import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Label from './Label.astro';

describe('Label', () => {
  test('renders a native label with its slot content', async () => {
    const label = (await render(Label, { slots: { default: 'Email' } })).querySelector('label')!;

    expect(label.textContent.trim()).toBe('Email');
  });

  test('passes through for, id and class', async () => {
    const label = (await render(Label, { props: { for: 'email', id: 'email-label', class: 'extra' } })).querySelector('label')!;

    expect(label.getAttribute('for')).toBe('email');
    expect(label.id).toBe('email-label');
    expect(label.classList.contains('extra')).toBe(true);
  });
});
