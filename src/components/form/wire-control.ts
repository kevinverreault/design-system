/**
 * FormField receives its control as rendered HTML (the default slot), so it
 * wires ids and aria attributes by rewriting the control's opening tag.
 */
import { ATTRIBUTE_LIST, buildOpeningTag, parseAttributes } from '../../lib/opening-tag';

/** Opening tag of a form control. */
const CONTROL_TAG = new RegExp(String.raw`<(input|select|textarea|fieldset)${ATTRIBUTE_LIST}\s*(\/?)>`, "gi");

/**
 * - `field`: a boxed control (input, select, textarea), labelled above.
 * - `check`: a checkbox or switch, labelled beside it.
 * - `group`: a fieldset (RadioGroup), named through aria-labelledby.
 */
export type ControlKind = "field" | "check" | "group";

export interface ControlWiring {
  /** Id to give the control when it has none. */
  id: string;
  /** Id of the field's label, used to name a group. */
  labelId: string;
  /** Ids of the hint and error, in that order. */
  describedBy: string[];
  invalid: boolean;
}

export interface WiredControl {
  html: string;
  /** The control's id: its own when it had one, the given one otherwise. */
  id: string;
  kind: ControlKind;
}

/** Wires the first visible form control in `html`, or returns undefined when there is none. */
export function wireControl(html: string, wiring: ControlWiring): WiredControl | undefined {
  for (const match of html.matchAll(CONTROL_TAG)) {
    const [tag, element, attributeSource, selfClosing] = match;
    const attributes = parseAttributes(attributeSource);
    const valueOf = (name: string) => attributes.find(attribute => attribute.name === name)?.value;
    const type = valueOf("type")?.toLowerCase();

    if (element.toLowerCase() === "input" && type === "hidden") {
      continue;
    }

    const kind: ControlKind = element.toLowerCase() === "fieldset" ? "group"
      : type === "checkbox" || type === "radio" ? "check"
      : "field";
    const id = valueOf("id") || wiring.id;
    const describedBy = [valueOf("aria-describedby"), ...wiring.describedBy].filter(Boolean).join(" ");

    const added: Record<string, string> = { id };
    if (kind === "group" && !valueOf("aria-labelledby")) added["aria-labelledby"] = wiring.labelId;
    if (describedBy) added["aria-describedby"] = describedBy;
    if (wiring.invalid) added["aria-invalid"] = "true";

    const wired = buildOpeningTag(element, attributes, added, Boolean(selfClosing));
    const start = match.index;

    return { html: html.slice(0, start) + wired + html.slice(start + tag.length), id, kind };
  }

  return undefined;
}
