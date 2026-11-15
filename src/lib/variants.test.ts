import { describe, expect, expectTypeOf, it } from 'vitest';
import { variants, type VariantProps } from './variants';

const button = variants("button", {
  size: {
    small: "text-sm",
    large: "text-xl"
  },
  shape: {
    rectangle: "",
    circle: "circle"
  }
});

const field = variants("form-field", {
  inline: {
    true: "inline"
  },
  invalid: {
    true: "invalid",
    false: "valid"
  }
});

const row = variants("row", {
  columns: {
    1: "columns-1",
    2: "columns-2"
  }
});

describe('variants', () => {
  it('returns the base class alone without a selection', () => {
    expect(button()).toBe('button');
    expect(button({})).toBe('button');
  });

  it('keeps a base made of several classes', () => {
    expect(variants("form-control input", { size: { small: "text-sm" } })({ size: "small" })).toBe('form-control input text-sm');
  });

  it('adds the class of each selected option, in the order the variants are declared', () => {
    expect(button({ shape: "circle", size: "large" })).toBe('button text-xl circle');
  });

  it('adds nothing for a variant left null or undefined', () => {
    expect(button({ size: null, shape: undefined })).toBe('button');
  });

  it('drops an option whose class is empty', () => {
    expect(button({ size: "small", shape: "rectangle" })).toBe('button text-sm');
  });

  it('adds nothing for an unknown option', () => {
    expect(button({ size: "huge" as never })).toBe('button');
    expect(button({ size: "toString" as never })).toBe('button');
  });

  it('picks the true or false option of a boolean variant', () => {
    expect(field({ inline: true, invalid: true })).toBe('form-field inline invalid');
    expect(field({ inline: false, invalid: false })).toBe('form-field valid');
  });

  it('picks a numeric option', () => {
    expect(row({ columns: 2 })).toBe('row columns-2');
  });

  it('ignores props that are not variants', () => {
    expect(button({ size: "small", id: "x" } as never)).toBe('button text-sm');
  });
});

describe('VariantProps', () => {
  it('lists each variant as an optional, nullable option', () => {
    expectTypeOf<VariantProps<typeof button>>().toEqualTypeOf<{
      size?: "small" | "large" | null | undefined;
      shape?: "rectangle" | "circle" | null | undefined;
    }>();
  });

  it('types a true/false variant as a boolean', () => {
    expectTypeOf<VariantProps<typeof field>>().toEqualTypeOf<{
      inline?: boolean | null | undefined;
      invalid?: boolean | null | undefined;
    }>();
  });

  it('keeps numeric options as numbers', () => {
    expectTypeOf<VariantProps<typeof row>>().toEqualTypeOf<{
      columns?: 1 | 2 | null | undefined;
    }>();
  });
});
