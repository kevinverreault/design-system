/**
 * Overlays receive their trigger as rendered HTML (the `trigger` slot, or the
 * default slot for Tooltip), so they wire it to the overlay by rewriting the
 * trigger's opening tag. The wiring is in the HTML, so declarative features
 * (invoker commands, `popovertarget`) work before any script runs.
 */
import { ATTRIBUTE_LIST, buildOpeningTag, parseAttributes } from '../../lib/opening-tag';

/** Opening tag of the first element, after any leading whitespace or comments. */
const FIRST_TAG = new RegExp(String.raw`^((?:\s|<!--[\s\S]*?-->)*)<([a-zA-Z][\w-]*)${ATTRIBUTE_LIST}\s*(\/?)>`);

/** Attributes whose values are id lists: the trigger's own ids are kept. */
const ID_LISTS = new Set(["aria-describedby", "aria-labelledby", "aria-controls"]);

/**
 * Adds `attributes` to the first element of `html`, replacing any of the same
 * name (id lists such as aria-describedby are extended instead). Returns
 * undefined when `html` doesn't start with an element.
 */
export function wireTrigger(html: string, attributes: Record<string, string>): string | undefined {
  const match = html.match(FIRST_TAG);

  if (!match) {
    return undefined;
  }

  const [tag, leading, element, attributeSource, selfClosing] = match;
  const existing = parseAttributes(attributeSource);

  const added = Object.fromEntries(Object.entries(attributes).map(([name, value]) => {
    const current = existing.find(attribute => attribute.name === name)?.value;
    return [name, ID_LISTS.has(name) && current ? `${current} ${value}` : value];
  }));

  return leading + buildOpeningTag(element, existing, added, Boolean(selfClosing)) + html.slice(tag.length);
}
