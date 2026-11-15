/**
 * A component's variants: each one maps its options to the classes that
 * give the component that look. `true`/`false` options make a boolean
 * variant.
 */
export type VariantMap = Record<string, Record<string, string>>;

type Option<Key> = Key extends "true" | "false" ? boolean : Key;

/** One option per variant; a variant left null or undefined adds nothing. */
export type VariantSelection<Variants extends VariantMap> = {
  [Variant in keyof Variants]?: Option<keyof Variants[Variant]> | null | undefined;
};

/** The variant props a function made by `variants` accepts. */
export type VariantProps<Classes extends (selection?: any) => string> = Exclude<Parameters<Classes>[0], undefined>;

/**
 * Builds the function that turns a selection of options into the
 * component's classes: the base, then the class of each selected option in
 * the order the variants are declared. An unknown option and an empty class
 * add nothing.
 */
export function variants<Variants extends VariantMap>(base: string, map: Variants) {
  return (selection: VariantSelection<Variants> = {}): string => {
    const classes = [base];

    for (const [variant, options] of Object.entries(map)) {
      const option = selection[variant];
      if (option == null) continue;

      const key = String(option);
      if (Object.hasOwn(options, key)) classes.push(options[key]);
    }

    return classes.filter(Boolean).join(" ");
  };
}
