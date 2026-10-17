import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Sheet from './Sheet.astro';

async function renderSheet(props: Record<string, unknown> = {}) {
  return render(Sheet, { props: { title: 'Cart', ...props }, slots: { trigger: '<button>Cart</button>', default: '<p>2 prints</p>' } });
}

describe('Sheet', () => {
  test('renders a light-dismissable native dialog opened from its trigger', async () => {
    const root = await renderSheet({ id: 'cart' });
    const dialog = root.querySelector('dialog')!;

    expect(dialog.id).toBe('cart');
    expect(dialog.getAttribute('closedby')).toBe('any');
    expect(root.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Cart');
    expect(root.querySelector('dialog-trigger button')?.getAttribute('commandfor')).toBe('cart');
  });

  test('slides in from the right by default', async () => {
    const dialog = (await renderSheet()).querySelector('dialog')!;

    expect(dialog.classList.contains('side-right')).toBe(true);
  });

  test.each(['left', 'right', 'top', 'bottom'])('takes side="%s"', async side => {
    const dialog = (await renderSheet({ side })).querySelector('dialog')!;

    expect(dialog.classList.contains(`side-${side}`)).toBe(true);
  });

  test('fails with an unknown side', async () => {
    await expect(renderSheet({ side: 'middle' })).rejects.toThrow(/side/);
  });
});
