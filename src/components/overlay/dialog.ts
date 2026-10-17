/**
 * Client side of the native `dialog` overlays (Dialog, AlertDialog, Sheet,
 * Lightbox): fallbacks for invoker commands and `closedby`, and focus return.
 */

const supportsCommands = () => 'command' in HTMLButtonElement.prototype;
const supportsClosedBy = () => 'closedBy' in HTMLDialogElement.prototype;

/**
 * Wraps a dialog's trigger (a button with `commandfor` and
 * `command="show-modal"`). Where invoker commands are unsupported it opens the
 * dialog itself; either way, it returns focus to the trigger when the dialog
 * it opened closes.
 */
export class DialogTrigger extends HTMLElement {
  connectedCallback() {
    const button = this.querySelector<HTMLElement>('[commandfor]');
    const dialog = button && document.getElementById(button.getAttribute('commandfor')!);

    if (!button || !(dialog instanceof HTMLDialogElement)) return;

    button.addEventListener('click', () => {
      if (dialog.open) return;
      if (!supportsCommands()) dialog.showModal();
      returnFocusOnClose(dialog, button);
    });
  }
}

/** Moves focus back to `opener` when `dialog` next closes. */
export function returnFocusOnClose(dialog: HTMLDialogElement, opener: HTMLElement) {
  dialog.addEventListener('close', () => opener.focus(), { once: true });
}

let lightDismissInstalled = false;

/**
 * Where `closedby` is unsupported, closes an open `closedby="any"` dialog on a
 * click outside its box (a click on the backdrop targets the dialog itself).
 */
export function installLightDismissFallback() {
  if (lightDismissInstalled || supportsClosedBy()) return;
  lightDismissInstalled = true;

  document.addEventListener('click', event => {
    const dialog = event.target;

    if (!(dialog instanceof HTMLDialogElement) || !dialog.open || dialog.getAttribute('closedby') !== 'any') return;

    const box = dialog.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;

    if (!inside) dialog.close();
  });
}
