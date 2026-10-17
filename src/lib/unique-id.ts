let count = 0;

/**
 * A page-unique id, for a component that links its parts (label and control,
 * trigger and overlay) when the author gave it no id.
 */
export function uniqueId(prefix: string): string {
  return `${prefix}-${++count}`;
}
