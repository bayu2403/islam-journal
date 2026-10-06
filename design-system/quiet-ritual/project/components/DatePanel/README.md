# DatePanel

The "Rencana hari ini" panel head: Masehi and Hijriah dates side by side at equal weight, with the next prayer beneath. On Beranda the two TaskCards sit inside it.

- Surface `secondary`, text `secondary-foreground`, `radius-3xl`, 20px padding, 12px gap.
- Two date columns split by a hairline: day numeral in Lora 40px, month + year in Lora 17px, a caption line ("Sabtu · Masehi" / "Hijriah"). Hijriah is right-aligned, same size — neither calendar is a footnote.
- Hijri date from `Intl` `islamic-umalqura` (`src/lib/hijri.ts`). Month names in Indonesian transliteration: Muharram, Safar, Rabiul Awal …
- Prayer row: `sunset` icon, "Sholat berikutnya", name + time in tabular numerals.
- The serif greeting ("Assalamu'alaikum, {nama}") sits above the page, in `display`, with a `small` `muted-foreground` line beneath.
