import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Input from './Input.astro';

async function renderInput(props: Record<string, unknown> = {}) {
  return (await render(Input, { props })).querySelector('input')!;
}

describe('Input', () => {
  test('renders a native text input at the medium size by default', async () => {
    const input = await renderInput();

    expect(input.getAttribute('type')).toBe('text');
    expect(input.classList.contains('text-md')).toBe(true);
  });

  test.each([['small', 'text-sm'], ['large', 'text-xl']] as const)('applies the %s size', async (size, expected) => {
    const input = await renderInput({ size });

    expect(input.classList.contains(expected)).toBe(true);
    expect(input.classList.contains('text-md')).toBe(false);
    expect(input.hasAttribute('size')).toBe(false);
  });

  test('passes through native attributes', async () => {
    const input = await renderInput({
      type: 'email', name: 'email', id: 'email', required: true, pattern: '.+@.+', autocomplete: 'email',
      placeholder: 'you@example.com', readonly: true, disabled: true, value: 'a@b.c', class: 'extra'
    });

    expect(input.getAttribute('type')).toBe('email');
    expect(input.getAttribute('name')).toBe('email');
    expect(input.id).toBe('email');
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('pattern')).toBe('.+@.+');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('placeholder')).toBe('you@example.com');
    expect(input.hasAttribute('readonly')).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(input.getAttribute('value')).toBe('a@b.c');
    expect(input.classList.contains('extra')).toBe(true);
  });
});
