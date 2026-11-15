# Design System

Astro components and styles, used from source by host projects that include this repository as a git submodule.

## Language

**Host**:
The Astro project that includes the design system as a git submodule and compiles its components.
_Avoid_: Consumer, app, parent project

**Variant**:
A component prop with a fixed set of options, each giving the component a different look (Button's size, decoration, shape). A component can have several.
_Avoid_: Variant for a single option

**Option**:
One value of a variant: `large` is an option of Button's `size` variant.
_Avoid_: Variant, value

**Status variant**:
The options shared by Alert's and Toast's `variant`: info, success, warning, danger. Warning and danger interrupt; info and success wait their turn.
_Avoid_: Severity, level, type
