/**
 * Components that render as a single anchor (a linked Card, a linked Button)
 * can't hold another interactive element: nesting one is invalid HTML and
 * gives keyboards and screen readers two stops for one control.
 */
const INTERACTIVE_CONTENT = /<(a|button|input|select|textarea|label|details|summary|iframe|embed|object)\b|<(audio|video)\b[^>]*\scontrols\b|\s(tabindex|contenteditable)\s*=/i;

/** Whether rendered `html` holds a link, button, form control, media controls or tabindex. */
export function containsInteractiveContent(html: string): boolean {
  return INTERACTIVE_CONTENT.test(html);
}
