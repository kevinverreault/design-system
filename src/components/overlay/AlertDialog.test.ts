import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import AlertDialog from './AlertDialog.astro';

async function renderAlertDialog(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return render(AlertDialog, {
    props: { title: 'Delete this print?', description: 'This cannot be undone.', actionLabel: 'Delete', ...props },
    slots: { trigger: '<button>Delete</button>', ...slots }
  });
}

describe('AlertDialog', () => {
  test('renders a native dialog with the alertdialog role, named and described', async () => {
    const root = await renderAlertDialog();
    const dialog = root.querySelector('dialog')!;

    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(root.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Delete this print?');
    expect(root.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe('This cannot be undone.');
  });

  test('has no light dismiss: only Escape or an explicit choice closes it', async () => {
    const dialog = (await renderAlertDialog()).querySelector('dialog')!;

    expect(dialog.getAttribute('closedby')).toBe('closerequest');
    expect(dialog.querySelector('.dialog-close')).toBeNull();
  });

  test('offers a cancel and an action button that close it with their value', async () => {
    const dialog = (await renderAlertDialog({ cancelLabel: 'Annuler' })).querySelector('dialog')!;
    const buttons = dialog.querySelectorAll('form[method="dialog"] button');

    expect(buttons.map(button => [button.textContent.trim(), button.getAttribute('value')])).toEqual([['Annuler', 'cancel'], ['Delete', 'confirm']]);
  });

  test('focuses Cancel first, the safe choice', async () => {
    const cancel = (await renderAlertDialog()).querySelector('button[value="cancel"]')!;

    expect(cancel.hasAttribute('autofocus')).toBe(true);
  });

  test('styles the action as danger by default, or with the given variant', async () => {
    const danger = (await renderAlertDialog()).querySelector('button[value="confirm"]')!;
    const primary = (await renderAlertDialog({ actionVariant: 'primary' })).querySelector('button[value="confirm"]')!;

    expect(danger.classList.contains('danger')).toBe(true);
    expect(primary.classList.contains('primary')).toBe(true);
  });

  test('opens from its trigger', async () => {
    const root = await renderAlertDialog({ id: 'delete-print' });

    expect(root.querySelector('dialog-trigger button')?.getAttribute('commandfor')).toBe('delete-print');
  });

  test('fails without an action label', async () => {
    await expect(renderAlertDialog({ actionLabel: '' })).rejects.toThrow(/actionLabel/);
  });
});
