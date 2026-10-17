import { cva, type VariantProps } from 'cva';

/** The edges a Sheet can be attached to. */
export const sheetSides = {
  left: "sheet side-left",
  right: "sheet side-right",
  top: "sheet side-top",
  bottom: "sheet side-bottom"
} as const;

/** Variants of the dialog shell that Dialog, AlertDialog and Sheet share. */
export const dialog = cva("dialog", {
  variants: {
    size: {
      small: "size-small",
      medium: "size-medium",
      large: "size-large"
    },
    side: {
      none: "",
      ...sheetSides
    }
  }
});

export type DialogVariants = VariantProps<typeof dialog>;

export type SheetSide = keyof typeof sheetSides;

export function isSheetSide(side: unknown): side is SheetSide {
  return typeof side === "string" && Object.hasOwn(sheetSides, side);
}
