import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Dialog from './Dialog.astro';

const trigger = '<button class="button">Edit profile</button>';

async function renderDialog(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return render(Dialog, { props: { title: 'Edit profile', ...props }, slots: { trigger, default: '<p>Body</p>', ...slots } });
}

describe('Dialog', () => {
  test('renders a native dialog named by its title', async () => {
    const root = await renderDialog();
    const dialog = root.querySelector('dialog')!;
    const title = root.getElementById(dialog.getAttribute('aria-labelledby')!);

    expect(dialog.hasAttribute('role')).toBe(false);
    expect(title?.textContent.trim()).toBe('Edit profile');
    expect(dialog.querySelector('p')?.textContent).toBe('Body');
  });

  test('wires its trigger to open it as a modal through invoker commands', async () => {
    const root = await renderDialog({ id: 'edit-profile' });
    const button = root.querySelector('dialog-trigger button')!;

    expect(button.getAttribute('commandfor')).toBe('edit-profile');
    expect(button.getAttribute('command')).toBe('show-modal');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.classList.contains('button')).toBe(true);
    expect(button.textContent).toBe('Edit profile');
  });

  test('gives itself an id for its trigger when it has none', async () => {
    const root = await renderDialog();
    const dialog = root.querySelector('dialog')!;

    expect(dialog.id).toBeTruthy();
    expect(root.querySelector('dialog-trigger button')?.getAttribute('commandfor')).toBe(dialog.id);
  });

  test('can be dismissed by a click outside (light dismiss)', async () => {
    const dialog = (await renderDialog()).querySelector('dialog')!;

    expect(dialog.getAttribute('closedby')).toBe('any');
  });

  test('links its description through aria-describedby', async () => {
    const root = await renderDialog({ description: 'Changes are saved when you close.' });
    const dialog = root.querySelector('dialog')!;

    expect(root.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe('Changes are saved when you close.');
  });

  test('has no aria-describedby without a description', async () => {
    const dialog = (await renderDialog()).querySelector('dialog')!;

    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
  });

  test('has a named close button that closes it without JavaScript', async () => {
    const dialog = (await renderDialog({ closeLabel: 'Fermer' })).querySelector('dialog')!;
    const close = dialog.querySelector('button[aria-label="Fermer"]');

    expect(close).not.toBeNull();
    expect(close?.closest('form')?.getAttribute('method')).toBe('dialog');
  });

  test('puts the footer in a dialog form, so its buttons close it', async () => {
    const dialog = (await renderDialog({}, { footer: '<button value="save">Save</button>' })).querySelector('dialog')!;
    const save = dialog.querySelector('button[value="save"]')!;

    expect(save.closest('form')?.getAttribute('method')).toBe('dialog');
  });

  test('renders no trigger when none is given', async () => {
    const root = await render(Dialog, { props: { title: 'Edit profile' } });

    expect(root.querySelector('dialog-trigger')).toBeNull();
    expect(root.querySelector('dialog')).not.toBeNull();
  });

  test('fails without a title, its accessible name', async () => {
    await expect(renderDialog({ title: ' ' })).rejects.toThrow(/title/);
  });

  test('fails when the trigger slot holds no element', async () => {
    await expect(renderDialog({}, { trigger: 'Open' })).rejects.toThrow(/trigger/);
  });

  test('passes through native attributes and size', async () => {
    const dialog = (await renderDialog({ id: 'edit', class: 'wide', 'data-test': 'x', size: 'large' })).querySelector('dialog')!;

    expect(dialog.id).toBe('edit');
    expect(dialog.classList.contains('wide')).toBe(true);
    expect(dialog.classList.contains('size-large')).toBe(true);
    expect(dialog.getAttribute('data-test')).toBe('x');
  });
});
