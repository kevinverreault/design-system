import { ATTRIBUTE_LIST, parseAttributes } from './opening-tag';

export interface ParsedSvg {
  /** The root element's attributes, names as written, values decoded. A boolean attribute is "". */
  attributes: Record<string, string>;
  /** Everything between the root's opening and closing tags, as written. */
  innerHTML: string;
}

/** What an exported SVG may put before its root: an XML prolog, a doctype, comments. */
const PROLOG = /^\s*(?:<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>)/i;

const OPENING_TAG = new RegExp(`^<svg${ATTRIBUTE_LIST}\\s*(/?)>`, "i");

const CLOSING_TAG = "</svg>";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Decodes the XML entities and character references. */
function decode(value: string): string {
  return value.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(amp|lt|gt|quot|apos));/gi, (entity, hex, decimal, name) =>
    hex ? String.fromCodePoint(parseInt(hex, 16))
      : decimal ? String.fromCodePoint(parseInt(decimal, 10))
        : ENTITIES[name.toLowerCase()] ?? entity
  );
}

/** Reads the root `<svg>` of an SVG file's source. Throws when there is none. */
export function parseSvg(source: string): ParsedSvg {
  let rest = source;
  for (let match = PROLOG.exec(rest); match; match = PROLOG.exec(rest)) {
    rest = rest.slice(match[0].length);
  }
  rest = rest.trimStart();

  const opening = OPENING_TAG.exec(rest);
  if (!opening) {
    throw new Error("The source is not an svg: it has no root <svg> element.");
  }

  const [tag, attributeList, selfClosing] = opening;
  const attributes = Object.fromEntries(parseAttributes(attributeList).map(({ name, value, source }) =>
    // parseAttributes lower-cases names; SVG ones are case-sensitive (viewBox), so take the name as written.
    [source.slice(0, name.length), decode(value ?? "")]
  ));

  if (selfClosing) {
    return { attributes, innerHTML: "" };
  }

  const end = rest.toLowerCase().lastIndexOf(CLOSING_TAG);
  if (end < tag.length) {
    throw new Error("The source is not an svg: its root <svg> element is never closed.");
  }

  return { attributes, innerHTML: rest.slice(tag.length, end) };
}
