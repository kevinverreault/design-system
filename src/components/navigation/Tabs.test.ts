import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import PrintFormatTabs from '../../../test/fixtures/PrintFormatTabs.astro';
import TabPanel from './TabPanel.astro';

describe('Tabs without JavaScript', () => {
  test('shows every panel with its heading and content', async () => {
    const root = await render(PrintFormatTabs);
    const panels = root.querySelectorAll('.tab-panel');

    expect(panels).toHaveLength(3);
    expect(panels.map(panel => panel.querySelector('.tab-panel-heading')?.textContent.trim())).toEqual(['Small', 'Medium', 'Large']);
    expect(panels.map(panel => panel.querySelector('p')?.textContent)).toEqual(['20 × 30 cm', '40 × 60 cm', '60 × 90 cm']);
    expect(panels.some(panel => panel.hasAttribute('hidden'))).toBe(false);
  });

  test('renders no tab list, so there are no controls that need a script', async () => {
    const root = await render(PrintFormatTabs);

    expect(root.querySelector('[role="tablist"]')).toBeNull();
    expect(root.querySelector('[role="tab"]')).toBeNull();
  });

  test('keeps the tab list name and panel ids for the script to use', async () => {
    const root = await render(PrintFormatTabs);

    expect(root.querySelector('tab-group')?.getAttribute('data-label')).toBe('Print formats');
    expect(root.querySelector('tab-group')?.id).toBe('formats');
    expect(root.querySelectorAll('.tab-panel')[0].id).toBe('small');
  });
});

describe('TabPanel', () => {
  test('uses an h3 heading by default', async () => {
    const panel = (await render(TabPanel, { props: { label: 'Small' } })).querySelector('.tab-panel')!;

    expect(panel.querySelector('.tab-panel-heading')?.tagName).toBe('H3');
  });

  test('uses the chosen heading level', async () => {
    const root = await render(PrintFormatTabs);

    expect(root.querySelectorAll('.tab-panel')[2].querySelector('.tab-panel-heading')?.tagName).toBe('H2');
  });

  test('throws on an unsupported heading level', async () => {
    await expect(render(TabPanel, { props: { label: 'Small', headingLevel: 1 } })).rejects.toThrow(/heading level/i);
  });
});
