// Hijri (islamic-umalqura) date helpers — built on Intl, no dependency.
// Locale variants: id/ms/en all support the u-ca-islamic-umalqura extension.

export type HijriParts = { day: number; month: string; year: number };

export function hijriParts(date: Date, locale = "id"): HijriParts {
  const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: Number(get("day")),
    month: get("month"),
    year: Number(get("year")),
  };
}

// "11 Muharam 1448 H"
export function formatHijri(date: Date, locale = "id"): string {
  const { day, month, year } = hijriParts(date, locale);
  return `${day} ${month} ${year} H`;
}

// Just the hijri day-of-month number (for the journal week strip).
export function hijriDay(date: Date, locale = "id"): number {
  return hijriParts(date, locale).day;
}
