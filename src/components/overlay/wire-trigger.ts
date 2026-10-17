/**
 * Overlays receive their trigger as rendered HTML (the `trigger` slot, or the
 * default slot for Tooltip), so they wire it to the overlay by rewriting the
 * trigger's opening tag, as FormField does for its control. The wiring is in
 * the HTML, so declarative features (invoker commands, `popovertarget`) work
 * before any script runs.
 */

/** Opening tag of the first element, after any leading whitespace or comments. */
const FIRST_TAG = /^((?:\s|<!--[\s\S]*?-->)*)<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

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
  const existing = [...attributeSource.matchAll(ATTRIBUTE)].map(([source, name, quoted]) => ({
    name: name.toLowerCase(),
    value: quoted?.replace(/^(["'])(.*)\1$/s, "$2"),
    source
  }));

  const added = Object.fromEntries(Object.entries(attributes).map(([name, value]) => {
    const current = existing.find(attribute => attribute.name === name)?.value;
    return [name, ID_LISTS.has(name) && current ? `${current} ${value}` : value];
  }));

  const kept = existing.filter(attribute => !(attribute.name in added)).map(attribute => ` ${attribute.source}`);
  const additions = Object.entries(added).map(([name, value]) => ` ${name}="${value.replaceAll('"', "&quot;")}"`);

  return `${leading}<${element}${kept.join("")}${additions.join("")}${selfClosing ? " /" : ""}>${html.slice(tag.length)}`;
}

let overlayCount = 0;

/** A page-unique id for an overlay that wasn't given one. */
export function nextOverlayId(kind: string): string {
  return `${kind}-${++overlayCount}`;
}
