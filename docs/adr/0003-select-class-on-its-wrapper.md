---
status: accepted
---

# Select puts `class` on its wrapper and every other attribute on the native select

The component convention is that unknown attributes go on the root element. Select's root is a wrapper span around the native `select`, because Firefox draws no pseudo-elements on a native select, so the chevron circle that turns while the picker is open is the wrapper's `::after`. `class` goes on the wrapper: it lays out like the select did on its own (a block the select fills), so layout classes and rules such as `.parent > .select` size the whole control, circle included. Every other attribute (`id`, `name`, `required`, `aria-*`, `disabled`) goes on the native `select`, because labels, forms, FormField's wiring and assistive technology all need them there.
