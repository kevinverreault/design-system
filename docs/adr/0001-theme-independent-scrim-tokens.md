---
status: proposed
---

# Theme-independent scrim tokens for content that reads against photos

Spec #9 allows one raw-colour exception, the Image credit band, because it reads against the photo rather than the page and must not change with the theme. The overlays need the same kind of tone: a modal backdrop that dims the page in both themes, and a Lightbox whose controls sit on a dark field over photos. Rather than add more raw colours, we added two theme-independent tokens, `--color-scrim` (black) and `--color-on-scrim` (white), and moved the credit band onto them. Any colour that has to read against a photo or dim the page uses these tokens, so the token-only rule has no exceptions left.

## Consequences

`--color-scrim` and `--color-on-scrim` are intentionally *not* redefined under `.theme-dark`. Don't "fix" them to follow the theme: the credit band and the Lightbox would then turn light on photos in light mode.
