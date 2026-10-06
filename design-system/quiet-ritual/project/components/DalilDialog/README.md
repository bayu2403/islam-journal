# DalilDialog

A bottom sheet that shows the full dalil for a task: Arabic, Indonesian translation and the citation with its grading — in full, scrollable, never truncated.

- Surface `popover` over `scrim`, top corners `radius-3xl`, `shadow-sheet`, max-height 85% of the viewport, body scrolls.
- Head: eyebrow "Dalil · Akhirat", template name in `h1` (Lora), ghost close button with `aria-label="Tutup"`.
- Arabic in `arabic-lg` with `dir="rtl" lang="ar"`. Translation in `body`, quoted, verbatim from the DB `dalil` field.
- Citation line: the source in `reward-ink` (the light-ground twin of `reward`), grading beneath in `muted-foreground`.
- Never style hadith text as display type, never gradient, never italic-serif decoration. No Lora on the hadith itself.
- Motion: 200ms fade + 8px rise; none under reduced motion. Focus is trapped; Escape and the scrim close it.
- Preview content is sample text for layout; production strings come verbatim from the `templates.dalil` column.
