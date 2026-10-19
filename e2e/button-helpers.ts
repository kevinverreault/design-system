import { expect, type Page } from '@playwright/test';

/** What tells a Button apart from its neighbours, on the element and on its `::after` (the underline). */
const PROPERTIES = [
  'display', 'box-sizing', 'width', 'height', 'padding-top', 'padding-left', 'vertical-align',
  'color', 'background-color', 'border-top-color', 'border-top-style', 'border-top-width', 'border-top-left-radius',
  'font-family', 'font-size', 'font-style', 'font-weight', 'line-height', 'letter-spacing', 'word-spacing',
  'text-align', 'text-decoration-line', 'text-indent', 'text-shadow', 'text-transform', 'cursor'
];
const AFTER_PROPERTIES = ['content', 'position', 'width', 'height', 'bottom', 'background-color'];

/**
 * Expects every Button of the showcase's Button section to look the same as a
 * linked Button: each is copied into an anchor with the same attributes and
 * content, placed beside it, and their computed styles compared at rest and
 * focused. The pair sits in a wrapper whose text styles a button doesn't
 * inherit and an anchor would. Transitions are off, so that none catches one
 * of them mid-way.
 */
export async function expectLinkedButtonsToMatch(page: Page) {
  await page.addStyleTag({ content: '*, *::after { transition: none !important; }' });

  const { compared, differences } = await page.locator('#interactive-elements').evaluate((section, [properties, afterProperties]) => {
    const style = (element: Element, pseudo?: string) => {
      const computed = getComputedStyle(element, pseudo);
      return (pseudo ? afterProperties : properties).map(property => `${pseudo ?? ''}${property}: ${computed.getPropertyValue(property)}`);
    };
    const state = (element: HTMLElement) => [...style(element), ...style(element, '::after')];
    const buttons = section.querySelectorAll<HTMLButtonElement>('button.button');
    const found: string[] = [];

    for (const button of buttons) {
      const anchor = document.createElement('a');
      for (const { name, value } of button.attributes) {
        if (name !== 'id' && name !== 'type') anchor.setAttribute(name, value);
      }
      anchor.href = '#interactive-elements';
      anchor.innerHTML = button.innerHTML;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: contents; color: red; font: italic bold 30px serif; letter-spacing: 3px; word-spacing: 5px; text-transform: uppercase; text-indent: 2em; text-shadow: 1px 1px red; text-align: right;';
      button.replaceWith(wrapper);
      wrapper.append(button, anchor);

      for (const focused of [false, true]) {
        if (focused) button.focus();
        const expected = state(button);
        if (focused) anchor.focus();
        const actual = state(anchor);

        actual.forEach((value, index) => {
          if (value !== expected[index]) found.push(`${button.className}${focused ? ' (focused)' : ''}: ${value}, button has ${expected[index]}`);
        });
      }

      wrapper.replaceWith(button);
    }

    return { compared: buttons.length, differences: found };
  }, [PROPERTIES, AFTER_PROPERTIES]);

  // The variant grid alone has 20 buttons; fewer means the section moved or changed.
  expect(compared).toBeGreaterThan(20);
  expect(differences).toEqual([]);
}
