import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Button from './Button.astro';

describe('Button', () => {
  test('renders a button with its slot content', async () => {
    const button = (await render(Button, { slots: { default: 'Save' } })).querySelector('button');

    expect(button?.textContent?.trim()).toBe('Save');
  });

  test('applies the default variant classes', async () => {
    const button = (await render(Button)).querySelector('button')!;

    expect(button.classList.contains('primary')).toBe(true);
    expect(button.classList.contains('plain')).toBe(true);
    expect(button.classList.contains('text-md')).toBe(true);
  });

  test('applies the chosen variant, decoration, size and shape', async () => {
    const button = (await render(Button, {
      props: { variant: 'danger', decoration: 'outline', size: 'large', shape: 'rounded' }
    })).querySelector('button')!;

    expect(button.classList.contains('danger')).toBe(true);
    expect(button.classList.contains('outline')).toBe(true);
    expect(button.classList.contains('text-xl')).toBe(true);
    expect(button.classList.contains('rounded')).toBe(true);
    expect(button.classList.contains('primary')).toBe(false);
  });

  test('passes through native attributes', async () => {
    const button = (await render(Button, {
      props: { type: 'submit', id: 'save', 'aria-label': 'Save changes' }
    })).querySelector('button')!;

    expect(button.getAttribute('type')).toBe('submit');
    expect(button.id).toBe('save');
    expect(button.getAttribute('aria-label')).toBe('Save changes');
  });
});
