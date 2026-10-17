/**
 * Components that receive a slot as rendered HTML (FormField's control, an
 * overlay's trigger) wire ids and aria attributes by rewriting the slotted
 * element's opening tag. Doing it at render time keeps the wiring in the
 * HTML, with no client JavaScript.
 */

/**
 * The attribute list of an opening tag, as a regular expression source to
 * build tag patterns from. Quoted attribute values may contain `>`.
 */
export const ATTRIBUTE_LIST = /((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)/.source;

const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

export interface Attribute {
  /** Lower-cased name. */
  name: string;
  /** Unquoted value; undefined for a boolean attribute. */
  value?: string;
  /** The attribute as written. */
  source: string;
}

/** Parses an attribute list matched by `ATTRIBUTE_LIST`. */
export function parseAttributes(source: string): Attribute[] {
  return [...source.matchAll(ATTRIBUTE)].map(([match, name, quoted]) => ({
    name: name.toLowerCase(),
    value: quoted?.replace(/^(["'])(.*)\1$/s, "$2"),
    source: match
  }));
}

/** Rebuilds an opening tag, the `added` attributes replacing any existing ones of the same name. */
export function buildOpeningTag(element: string, attributes: Attribute[], added: Record<string, string>, selfClosing: boolean): string {
  const kept = attributes.filter(attribute => !(attribute.name in added)).map(attribute => ` ${attribute.source}`);
  const additions = Object.entries(added).map(([name, value]) => ` ${name}="${value.replaceAll('"', "&quot;")}"`);

  return `<${element}${kept.join("")}${additions.join("")}${selfClosing ? " /" : ""}>`;
}
