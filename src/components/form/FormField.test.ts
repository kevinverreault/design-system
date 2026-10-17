import { describe, expect, test } from 'vitest';
import type { HTMLElement } from 'node-html-parser';
import { render } from '../../../test/render';
import Checkbox from './Checkbox.astro';
import FormField from './FormField.astro';
import Input from './Input.astro';
import RadioGroup from './RadioGroup.astro';
import Select from './Select.astro';
import Switch from './Switch.astro';
import Textarea from './Textarea.astro';

type Component = Parameters<typeof render>[0];

/** Renders a control on its own, to hand its HTML to FormField's default slot. */
async function controlHtml(component: Component, props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return (await render(component, { props, slots })).toString();
}

async function renderField(props: Record<string, unknown>, control: string) {
  return (await render(FormField, { props, slots: { default: control } })).querySelector('.form-field')!;
}

function describedBy(control: HTMLElement, field: HTMLElement) {
  return (control.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(id => field.querySelector(`#${id}`)?.textContent.trim());
}

describe('FormField', () => {
  test('labels the control: the label points at the control id', async () => {
    const field = await renderField({ label: 'Email' }, await controlHtml(Input, { name: 'email' }));
    const input = field.querySelector('input')!;
    const label = field.querySelector('label')!;

    expect(input.id).not.toBe('');
    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.textContent.trim()).toBe('Email');
  });

  test.each([
    ['Textarea', Textarea, 'textarea', {}],
    ['Select', Select, 'select', { default: '<option>A4</option>' }]
  ] as const)('labels a %s', async (_, component, selector, slots) => {
    const field = await renderField({ label: 'Field' }, await controlHtml(component, { name: 'x' }, slots));
    const control = field.querySelector(selector)!;

    expect(field.querySelector('label')!.getAttribute('for')).toBe(control.id);
  });

  test('keeps an id the control already has', async () => {
    const field = await renderField({ label: 'Email' }, await controlHtml(Input, { id: 'contact-email' }));

    expect(field.querySelector('input')!.id).toBe('contact-email');
    expect(field.querySelector('label')!.getAttribute('for')).toBe('contact-email');
  });

  test('gives each field its own ids', async () => {
    const first = await renderField({ label: 'A', hint: 'a' }, '<input>');
    const second = await renderField({ label: 'B', hint: 'b' }, '<input>');

    const [firstInput, secondInput] = [first.querySelector('input')!, second.querySelector('input')!];

    expect(firstInput.id).not.toBe(secondInput.id);
    expect(firstInput.getAttribute('aria-describedby')).not.toBe(secondInput.getAttribute('aria-describedby'));
  });

  test('describes the control with its hint', async () => {
    const field = await renderField({ label: 'Email', hint: 'We never share it.' }, await controlHtml(Input));
    const input = field.querySelector('input')!;

    expect(describedBy(input, field)).toEqual(['We never share it.']);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  test('describes the control with its hint and error, and marks it invalid', async () => {
    const field = await renderField({ label: 'Email', hint: 'We never share it.', error: 'Enter a valid email.' }, await controlHtml(Input));
    const input = field.querySelector('input')!;

    expect(describedBy(input, field)).toEqual(['We never share it.', 'Enter a valid email.']);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  test('marks the field as being in error', async () => {
    const field = await renderField({ label: 'Email', error: 'Required.' }, await controlHtml(Input));

    expect(field.classList.contains('invalid')).toBe(true);
  });

  test('adds no description or invalid state without hint or error', async () => {
    const field = await renderField({ label: 'Email' }, await controlHtml(Input));
    const input = field.querySelector('input')!;

    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(field.textContent.trim()).toBe('Email');
  });

  test('keeps an existing aria-describedby and adds its own ids after it', async () => {
    const field = await renderField({ label: 'Email', error: 'Required.' }, await controlHtml(Input, { 'aria-describedby': 'elsewhere' }));
    const ids = field.querySelector('input')!.getAttribute('aria-describedby')!.split(' ');

    expect(ids[0]).toBe('elsewhere');
    expect(field.querySelector(`#${ids[1]}`)?.textContent.trim()).toBe('Required.');
  });

  test('keeps the control native attributes', async () => {
    const field = await renderField({ label: 'Email' }, await controlHtml(Input, { type: 'email', name: 'email', required: true, pattern: 'a>b', autocomplete: 'email' }));
    const input = field.querySelector('input')!;

    expect(input.getAttribute('type')).toBe('email');
    expect(input.getAttribute('name')).toBe('email');
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('pattern')).toBe('a>b');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  test('wires the visible control, not a hidden input before it', async () => {
    const field = await renderField({ label: 'Email' }, '<input type="hidden" name="token" value="x"><input name="email">');
    const visible = field.querySelector('input[name="email"]')!;

    expect(field.querySelector('label')!.getAttribute('for')).toBe(visible.id);
    expect(field.querySelector('input[type="hidden"]')!.hasAttribute('id')).toBe(false);
  });

  test.each([['Checkbox', Checkbox], ['Switch', Switch]] as const)('lays a %s out inline, beside its label', async (_, component) => {
    const field = await renderField({ label: 'Subscribe', hint: 'Monthly.' }, await controlHtml(component, { name: 'subscribe' }));
    const input = field.querySelector('input')!;

    expect(field.classList.contains('inline')).toBe(true);
    expect(field.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(describedBy(input, field)).toEqual(['Monthly.']);
  });

  test('names a RadioGroup through aria-labelledby, since a fieldset cannot be the target of a label', async () => {
    const options = [{ value: 'a4', label: 'A4' }, { value: 'a3', label: 'A3' }];
    const field = await renderField(
      { label: 'Print size', hint: 'Paper size.', error: 'Pick one.' },
      await controlHtml(RadioGroup, { name: 'size', options })
    );
    const group = field.querySelector('fieldset')!;
    const labelId = group.getAttribute('aria-labelledby')!;

    expect(field.querySelector(`#${labelId}`)?.textContent.trim()).toBe('Print size');
    expect(field.querySelector('label[for]')).toBeNull();
    expect(describedBy(group, field)).toEqual(['Paper size.', 'Pick one.']);
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.querySelectorAll('input[aria-invalid]')).toHaveLength(0);
  });

  test('passes attributes through to its root', async () => {
    const field = await renderField({ label: 'Email', id: 'email-field', class: 'extra' }, '<input>');

    expect(field.id).toBe('email-field');
    expect(field.classList.contains('extra')).toBe(true);
  });

  test('throws when its slot holds no form control', async () => {
    await expect(renderField({ label: 'Email' }, '<p>Nothing to label</p>')).rejects.toThrow(/FormField 'Email'.*control/);
  });
});
