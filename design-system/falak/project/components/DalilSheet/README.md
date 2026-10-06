# DalilSheet

Bottom sheet with the full dalil — Arabic, translation, citation — verbatim and scrollable. Opened by tapping a TaskCard.

- `popover` sheet, `radius-2xl` top, `shadow-float`, a 1px `primary`→`accent` light line along its top edge. Scrim: `scrim` + 6px backdrop blur.
- Motion: scrim fades (`duration-fast`), sheet rises 40px (`duration-base`, `ease-out-expo`), then Arabic, translation and citation enter in a 70ms stagger.
- Arabic: `arabic-lg` Noto Naskh, `dir="rtl" lang="ar"`. Translation: `body`, quoted, verbatim from `templates.dalil`.
- Citation block on `muted`: source in `reward-ink` mono, grading in `muted-foreground`.
- Religious text never gets the gradient, glow, Unbounded or Kufi treatments. Stillness is the respect.
- Preview hadith is sample layout content; production text comes from the DB.
