/**
 * Client side of the `popover` overlays (Popover, DropdownMenu, Tooltip):
 * keeps an open popover next to its trigger and the trigger's aria-expanded in
 * step with it.
 */

export type Placement = 'top' | 'bottom';

/** Space between the trigger and the popover, in pixels (the CSS uses 0.5rem). */
const GAP = 8;

let anchorCount = 0;

const supportsAnchorPositioning = () => CSS.supports('position-area', 'block-end');

/**
 * Places `popover` against `anchor` whenever it opens. Where CSS anchor
 * positioning is supported, it only names the anchor and the component's CSS
 * does the placing; otherwise it positions the popover from the anchor's box,
 * flipping it to the other side when it doesn't fit, until it closes.
 */
export function anchorPopover(popover: HTMLElement, anchor: HTMLElement, placement: Placement) {
  if (supportsAnchorPositioning()) {
    const name = `--overlay-anchor-${++anchorCount}`;
    anchor.style.setProperty('anchor-name', name);
    popover.style.setProperty('position-anchor', name);
    return;
  }

  const place = () => {
    const target = anchor.getBoundingClientRect();
    const { width, height } = popover.getBoundingClientRect();
    const below = target.bottom + GAP;
    const above = target.top - GAP - height;
    const fitsBelow = below + height <= window.innerHeight;
    const fitsAbove = above >= 0;
    const top = placement === 'bottom' ? (fitsBelow || !fitsAbove ? below : above) : (fitsAbove || !fitsBelow ? above : below);
    const left = placement === 'bottom' ? target.left : target.left + (target.width - width) / 2;

    Object.assign(popover.style, {
      inset: 'auto',
      margin: '0',
      top: `${Math.max(0, top)}px`,
      left: `${Math.min(Math.max(0, left), window.innerWidth - width)}px`
    });
  };

  popover.addEventListener('toggle', event => {
    const open = (event as ToggleEvent).newState === 'open';
    const listen = open ? window.addEventListener : window.removeEventListener;

    if (open) place();
    listen('scroll', place, { capture: true, passive: true } as AddEventListenerOptions);
    listen('resize', place);
  });
}

/** Mirrors the popover's open state on its trigger's aria-expanded. */
export function syncExpanded(popover: HTMLElement, trigger: HTMLElement) {
  trigger.setAttribute('aria-expanded', 'false');
  popover.addEventListener('toggle', event => {
    trigger.setAttribute('aria-expanded', String((event as ToggleEvent).newState === 'open'));
  });
}
