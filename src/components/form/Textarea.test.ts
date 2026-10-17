import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Textarea from './Textarea.astro';

async function renderTextarea(props: Record<string, unknown> = {}) {
  return (await render(Textarea, { props })).querySelector('textarea')!;
}

describe('Textarea', () => {
  test('renders a native textarea at the medium size by default', async () => {
    const textarea = await renderTextarea();

    expect(textarea.classList.contains('text-md')).toBe(true);
    expect(textarea.textContent).toBe('');
  });

  test('renders its value as the initial content', async () => {
    const textarea = await renderTextarea({ value: 'Hello <there>' });

    expect(textarea.textContent).toBe('Hello <there>');
    expect(textarea.hasAttribute('value')).toBe(false);
  });

  test('applies the large size', async () => {
    const textarea = await renderTextarea({ size: 'large' });

    expect(textarea.classList.contains('text-xl')).toBe(true);
  });

  test('passes through native attributes', async () => {
    const textarea = await renderTextarea({ name: 'message', rows: 6, required: true, maxlength: 500, readonly: true, autocomplete: 'off' });

    expect(textarea.getAttribute('name')).toBe('message');
    expect(textarea.getAttribute('rows')).toBe('6');
    expect(textarea.hasAttribute('required')).toBe(true);
    expect(textarea.getAttribute('maxlength')).toBe('500');
    expect(textarea.hasAttribute('readonly')).toBe(true);
    expect(textarea.getAttribute('autocomplete')).toBe('off');
  });
});
