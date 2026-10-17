import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Popover from './Popover.astro';

async function renderPopover(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return render(Popover, {
    props: { label: 'Share this print', ...props },
    slots: { trigger: '<button class="button">Share</button>', default: '<p>Copy the link</p>', ...slots }
  });
}

describe('Popover', () => {
  test('renders a popover panel, a non-modal dialog named by its label', async () => {
    const panel = (await renderPopover()).querySelector('[popover]')!;

    expect(panel.getAttribute('popover')).toBe('auto');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-label')).toBe('Share this print');
    expect(panel.querySelector('p')?.textContent).toBe('Copy the link');
  });

  test('wires its trigger to toggle the panel', async () => {
    const root = await renderPopover({ id: 'share' });
    const button = root.querySelector('button')!;

    expect(root.querySelector('[popover]')?.id).toBe('share');
    expect(button.getAttribute('popovertarget')).toBe('share');
    expect(button.getAttribute('aria-controls')).toBe('share');
    expect(button.classList.contains('button')).toBe(true);
  });

  test('gives the panel an id for its trigger when it has none', async () => {
    const root = await renderPopover();
    const panel = root.querySelector('[popover]')!;

    expect(panel.id).toBeTruthy();
    expect(root.querySelector('button')?.getAttribute('popovertarget')).toBe(panel.id);
  });

  test('fails without a trigger element', async () => {
    await expect(render(Popover, { props: { label: 'Share' }, slots: { default: '<p>Body</p>' } })).rejects.toThrow(/trigger/);
  });

  test('fails without a label', async () => {
    await expect(renderPopover({ label: '' })).rejects.toThrow(/label/);
  });

  test('passes through native attributes onto the panel', async () => {
    const panel = (await renderPopover({ class: 'wide', 'data-test': 'x' })).querySelector('[popover]')!;

    expect(panel.classList.contains('wide')).toBe(true);
    expect(panel.getAttribute('data-test')).toBe('x');
  });
});
