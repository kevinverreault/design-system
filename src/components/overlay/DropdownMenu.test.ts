import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import DropdownMenu from './DropdownMenu.astro';

const items = [
  { text: 'View the photo', path: '/portfolio/heron' },
  { text: 'Add to cart', value: 'add' },
  { text: 'Sold out', value: 'reserve', disabled: true }
];

async function renderMenu(props: Record<string, unknown> = {}) {
  return render(DropdownMenu, {
    props: { label: 'Print actions', items, ...props },
    slots: { trigger: '<button class="button">Actions</button>' }
  });
}

describe('DropdownMenu', () => {
  test('renders a menu popover named by its label', async () => {
    const menu = (await renderMenu()).querySelector('[popover]')!;

    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.getAttribute('aria-label')).toBe('Print actions');
  });

  test('wires its trigger as a menu button', async () => {
    const root = await renderMenu({ id: 'print-actions' });
    const button = root.querySelector('button')!;

    expect(root.querySelector('[role="menu"]')?.id).toBe('print-actions');
    expect(button.getAttribute('popovertarget')).toBe('print-actions');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-controls')).toBe('print-actions');
  });

  test('renders links for items with a path and buttons for items with a value, in order', async () => {
    const menuItems = (await renderMenu()).querySelectorAll('[role="menuitem"]');

    expect(menuItems.map(item => item.textContent.trim())).toEqual(['View the photo', 'Add to cart', 'Sold out']);
    expect(menuItems[0].tagName).toBe('A');
    expect(menuItems[0].getAttribute('href')).toBe('/portfolio/heron');
    expect(menuItems[1].tagName).toBe('BUTTON');
    expect(menuItems[1].getAttribute('value')).toBe('add');
  });

  test('takes items out of the tab order: the arrow keys move between them', async () => {
    const menuItems = (await renderMenu()).querySelectorAll('[role="menuitem"]');

    expect(menuItems.every(item => item.getAttribute('tabindex') === '-1')).toBe(true);
  });

  test('marks disabled items aria-disabled, keeping them reachable', async () => {
    const menuItems = (await renderMenu()).querySelectorAll('[role="menuitem"]');

    expect(menuItems[2].getAttribute('aria-disabled')).toBe('true');
    expect(menuItems[1].hasAttribute('aria-disabled')).toBe(false);
  });

  test('fails without items', async () => {
    await expect(renderMenu({ items: [] })).rejects.toThrow(/item/);
  });

  test('fails when an item has both a path and a value', async () => {
    await expect(renderMenu({ items: [{ text: 'Both', path: '/', value: 'x' }] })).rejects.toThrow(/Both/);
  });

  test('fails without a trigger element', async () => {
    await expect(render(DropdownMenu, { props: { label: 'Actions', items } })).rejects.toThrow(/trigger/);
  });
});
