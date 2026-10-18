import type { Locator } from '@playwright/test';

/**
 * A Select's chevron: how far it has turned, in degrees, how the turn is
 * animated, and whether it is drawn at all. It is the picker icon of a
 * customisable select and the wrapper's ::after elsewhere.
 */
export const chevron = (select: Locator) => select.evaluate(element => {
  const customisable = CSS.supports('appearance', 'base-select');
  const style = customisable
    ? getComputedStyle(element, '::picker-icon')
    : getComputedStyle(element.parentElement!, '::after');
  // Transition lists repeat to the length of transition-property, so pick the entry for rotate.
  const index = style.transitionProperty.split(', ').findIndex(property => property === 'rotate' || property === 'all');
  const forRotate = (list: string) => {
    const entries = list.split(', ');
    return entries[index % entries.length];
  };

  return {
    turn: style.rotate === 'none' ? 0 : parseFloat(style.rotate),
    transition: index === -1 ? 'none' : `${forRotate(style.transitionDuration)} ${forRotate(style.transitionTimingFunction)}`,
    drawn: customisable ? getComputedStyle(element).appearance === 'base-select' : style.content !== 'none',
  };
});
