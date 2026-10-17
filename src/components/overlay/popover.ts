/**
 * Client side of the `popover` overlays (Popover, DropdownMenu, Tooltip):
 * keeps an open popover next to its trigger and the trigger's aria-expanded in
 * step with it.
 */

export type Placement = 'top' | 'bottom';

let anchorCount = 0;

const supportsAnchorPositioning = () => CSS.supports('position-area', 'block-end');

/**
 * Places `popover` against `anchor` whenever it opens. Where CSS anchor
 * positioning is supported, it only names the anchor and the component's CSS
 * does the placing; otherwise it positions the popover from the anchor's box,
 * flipping it to the other side when it doesn't fit, until it closes. Either
 * way the popover's block margin is the gap to the anchor.
 */
export function anchorPopover(popover: HTMLElement, anchor: HTMLElement, placement: Placement) {
  if (supportsAnchorPositioning()) {
    const name = `--overlay-anchor-${++anchorCount}`;
    anchor.style.setProperty('anchor-name', name);
    popover.style.setProperty('position-anchor', name);
    return;
  }

  const place = () => {
    const gap = parseFloat(getComputedStyle(popover).marginTop) || 0;
    const target = anchor.getBoundingClientRect();
    const { width, height } = popover.getBoundingClientRect();
    const below = target.bottom + gap;
    const above = target.top - gap - height;
    const fitsBelow = below + height <= window.innerHeight;
    const fitsAbove = above >= 0;
    const top = placement === 'bottom' ? (fitsBelow || !fitsAbove ? below : above) : (fitsAbove || !fitsBelow ? above : below);
    const left = placement === 'bottom' ? target.left : target.left + (target.width - width) / 2;

    // `top` places the margin box, so the margin is taken off again.
    Object.assign(popover.style, {
      inset: 'auto',
      top: `${Math.max(0, top) - gap}px`,
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

/**
 * Connects the popover panel matching `selector` inside `root` to the trigger
 * that toggles it (`popovertarget`): places the panel below the trigger and
 * mirrors its open state on the trigger's aria-expanded. Returns both, or
 * undefined when either is missing.
 */
export function connectPanel(root: HTMLElement, selector: string) {
  const panel = root.querySelector<HTMLElement>(selector);
  const trigger = panel && root.querySelector<HTMLElement>(`[popovertarget="${panel.id}"]`);

  if (!panel || !trigger) return undefined;

  anchorPopover(panel, trigger, 'bottom');
  trigger.setAttribute('aria-expanded', 'false');
  panel.addEventListener('toggle', event => {
    trigger.setAttribute('aria-expanded', String((event as ToggleEvent).newState === 'open'));
  });

  return { panel, trigger };
}
