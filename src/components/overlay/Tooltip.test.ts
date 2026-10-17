import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Tooltip from './Tooltip.astro';

const iconButton = '<button class="button icon" aria-label="Instagram"><svg></svg></button>';

async function renderTooltip(props: Record<string, unknown> = {}, trigger = iconButton) {
  return render(Tooltip, { props: { text: 'Follow on Instagram', ...props }, slots: { default: trigger } });
}

describe('Tooltip', () => {
  test('renders a tooltip with its text', async () => {
    const tooltip = (await renderTooltip()).querySelector('[role="tooltip"]')!;

    expect(tooltip.textContent.trim()).toBe('Follow on Instagram');
    expect(tooltip.getAttribute('popover')).toBe('manual');
  });

  test('describes its trigger through aria-describedby', async () => {
    const root = await renderTooltip();
    const button = root.querySelector('button')!;

    expect(root.getElementById(button.getAttribute('aria-describedby')!)?.textContent.trim()).toBe('Follow on Instagram');
    expect(button.getAttribute('aria-label')).toBe('Instagram');
  });

  test("keeps the trigger's own descriptions", async () => {
    const root = await renderTooltip({ id: 'tip' }, '<button aria-describedby="hint">Share</button>');

    expect(root.querySelector('button')?.getAttribute('aria-describedby')).toBe('hint tip');
  });

  test('fails without a trigger element', async () => {
    await expect(renderTooltip({}, 'Just text')).rejects.toThrow(/element/);
  });

  test('fails without text', async () => {
    await expect(renderTooltip({ text: '' })).rejects.toThrow(/text/);
  });
});
