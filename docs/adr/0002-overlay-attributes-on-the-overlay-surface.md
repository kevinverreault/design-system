---
status: accepted
---

# Overlays spread unknown attributes onto the overlay surface, not the root element

The component convention is that unknown attributes go on the root element. An overlay component (Dialog, AlertDialog, Sheet, Lightbox, Popover, DropdownMenu, Tooltip) renders two siblings, its trigger and the overlay itself, inside a `display: contents` custom element that only hosts the script. Unknown attributes go on the overlay surface instead: the `dialog`, the popover panel or the tooltip. `id` has to live there, because `commandfor`, `popovertarget` and `aria-describedby` point at it. `class` and `aria-*` are only useful there too, since a `display: contents` wrapper has no box to style and no role to describe.
