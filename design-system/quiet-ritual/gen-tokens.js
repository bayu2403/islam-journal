const T = require('./themes.js');
const fs = require('fs');
const ids = ['ikhwan-light', 'ikhwan-dark', 'akhwat-light', 'akhwat-dark'];
const all = v => Object.fromEntries(ids.map(i => [i, v]));
const extra = {
  'card-foreground': all('{foreground}'),
  'popover-foreground': all('{foreground}'),
  border: { 'ikhwan-light': 'oklch(0.9 0.02 100)', 'ikhwan-dark': 'oklch(1 0 0 / 0.12)', 'akhwat-light': 'oklch(0.91 0.02 350)', 'akhwat-dark': 'oklch(1 0 0 / 0.12)' },
  'card-inverse-border': { 'ikhwan-light': 'oklch(0.28 0.04 180)', 'ikhwan-dark': 'oklch(1 0 0 / 0.1)', 'akhwat-light': 'oklch(0.3 0.06 340)', 'akhwat-dark': 'oklch(1 0 0 / 0.1)' },
  scrim: { 'ikhwan-light': 'oklch(0.22 0.02 160 / 0.45)', 'ikhwan-dark': 'oklch(0.05 0.01 170 / 0.7)', 'akhwat-light': 'oklch(0.24 0.03 345 / 0.45)', 'akhwat-dark': 'oklch(0.05 0.02 340 / 0.7)' },
};
const order = [
  ['background', 'Page ground (warm ivory / deep night). A named ground per palette, never a default near-white.'],
  ['foreground', 'Body text and headings on background, card, popover and muted. 13.9–17.2:1 across palettes.'],
  ['card', 'Standard and Dunia card surface. Pure white in light palettes.'],
  ['card-foreground', 'Text on card. Alias of foreground.'],
  ['popover', 'Dialogs, dropdown menus, bottom sheets.'],
  ['popover-foreground', 'Text on popover. Alias of foreground.'],
  ['primary', 'Deep emerald (Ikhwan) / deep plum (Akhwat). Primary button, active nav tab, links, selected day, focus ring source. As text on card: 7.2:1 minimum.'],
  ['primary-foreground', 'Label on primary fills. 7.5–9.1:1.'],
  ['secondary', 'Soft sage / soft rose. The Rencana hari ini date panel, secondary button, planner tiles.'],
  ['secondary-foreground', 'Text on secondary. 11:1 minimum.'],
  ['muted', 'Quiet fills: status chips (pending AND skipped share it), skeletons, hover tint on ghost and outline.'],
  ['muted-foreground', 'Secondary text (subtitles, meta, timestamps) on background, card and muted. 5.2:1 minimum.'],
  ['accent', 'Fresh lime / soft rose. Dikerjakan pill, today circle in the week strip. A fill only, never text on a light ground.'],
  ['accent-foreground', 'Label on accent fills. 8.3:1 minimum.'],
  ['border', 'Hairline 1px for cards, list dividers, separators. Decorative: never the only cue that something is a control.'],
  ['input', 'Control border: inputs, textareas, outline buttons, the Lewati pill on light grounds. 3.2:1 minimum on card and background.'],
  ['ring', 'Focus-visible ring, 2px solid with 2px offset. 7.2:1 minimum on every ground.'],
  ['destructive', 'Real validation failures and irreversible deletes only. Never for skipped or missed tasks.'],
  ['card-inverse', 'The dark well reserved for the Akhirat task card, and nothing else. In dark palettes it sits BELOW background so it still reads as a well.'],
  ['card-inverse-foreground', 'Headline and pill labels on card-inverse. 12.8:1 minimum.'],
  ['card-inverse-muted', 'Summary line, time meta, AKHIRAT eyebrow and Lewati pill on card-inverse. 7.7:1 minimum.'],
  ['card-inverse-border', 'The Akhirat card edge. Equal to the card in light palettes (invisible); a faint hairline in dark ones where the well sits near the ground.'],
  ['reward', 'Warm amber / champagne gold. ONLY the hadith-source fragment on card-inverse, e.g. (HR. Tirmidzi no. 241). 6.2:1 minimum. Never decorative.'],
  ['reward-ink', 'The same sacred role on light grounds: the citation line in the dalil dialog. Darker amber in light palettes (5.6:1), equal to reward in dark.'],
  ['scrim', 'Overlay behind dialogs and bottom sheets.'],
];
const tokens = order.map(([name, usage]) => {
  const value = {};
  for (const id of ids) {
    value[id] = (extra[name] && extra[name][id]) || T[id][name];
    if (!value[id]) throw new Error(name + ' ' + id);
  }
  return { name, value, usage };
});

const out = {
  name: 'Muslim Berislam',
  version: 1,
  color: {
    themes: [
      { id: 'ikhwan-light', name: 'Ikhwan · Terang' },
      { id: 'ikhwan-dark', name: 'Ikhwan · Gelap' },
      { id: 'akhwat-light', name: 'Akhwat · Terang' },
      { id: 'akhwat-dark', name: 'Akhwat · Gelap' },
    ],
    tokens,
  },
  type: {
    fonts: [],
    families: {
      serif: 'Lora, Georgia, serif',
      sans: 'Geist, ui-sans-serif, system-ui, sans-serif',
      arabic: 'Amiri, "Noto Naskh Arabic", "Traditional Arabic", serif',
      mono: '"Geist Mono", ui-monospace, monospace',
    },
    groups: [
      {
        name: 'Moments (serif)', family: 'serif', styles: [
          { name: 'display', fontSize: '30px', lineHeight: '36px', fontWeight: 700, sample: "Assalamu'alaikum, Jessica", usage: 'Beranda greeting and page titles (Profil, Journal). clamp(1.5rem, 4vw, 1.875rem) in code.' },
          { name: 'h1', fontSize: '24px', lineHeight: '30px', fontWeight: 700, sample: '26 Juli · 1 Safar', usage: 'Date numerals in the date panel, dialog titles.' },
          { name: 'h2', fontSize: '20px', lineHeight: '26px', fontWeight: 700, sample: 'Rencana hari ini', usage: 'Section headings: Rencana hari ini, Aktivitasku, Journal harian.' },
        ],
      },
      {
        name: 'Interface (sans)', family: 'sans', styles: [
          { name: 'h3', fontSize: '18px', lineHeight: '24px', fontWeight: 700, letterSpacing: '-0.01em', sample: 'Sholat Ashar berjamaah.', usage: 'Task card headline. Sans, not serif: it is an action, not a moment.' },
          { name: 'title', fontSize: '15px', lineHeight: '22px', fontWeight: 600, sample: 'Catatan ilmu', usage: 'Card and template titles, list row titles.' },
          { name: 'body', fontSize: '14px', lineHeight: '21px', fontWeight: 400, sample: 'Badan bugar, mood naik — energi buat ibadah pun ikut penuh.', usage: 'All functional copy: summaries, translations, form values.' },
          { name: 'small', fontSize: '13px', lineHeight: '19px', fontWeight: 400, sample: 'Mengingat-ingat anugerah Allah membuahkan kecintaan kepada Allah', usage: 'Subtitles, meta lines, helper text.' },
          { name: 'label', fontSize: '12px', lineHeight: '16px', fontWeight: 500, letterSpacing: '0.02em', sample: 'Waktu', usage: 'Form labels, pill and small button labels.' },
          { name: 'eyebrow', fontSize: '11px', lineHeight: '14px', fontWeight: 600, letterSpacing: '0.12em', sample: 'AKHIRAT', usage: 'Uppercase category chips (AKHIRAT / DUNIA). Always uppercase, always tracked.' },
          { name: 'caption', fontSize: '12px', lineHeight: '16px', fontWeight: 400, sample: '14:00 · Sudah sholat Dzuhur', usage: 'Timestamps, week-strip day names, hijri sub-numerals. tabular-nums for times.' },
        ],
      },
      {
        name: 'Arabic (Naskh)', family: 'arabic', styles: [
          { name: 'arabic-lg', fontSize: '26px', lineHeight: '52px', fontWeight: 400, sample: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', usage: 'Dua card and dalil dialog Arabic. dir="rtl" lang="ar". Read aloud, so 2.0 leading.' },
          { name: 'arabic-md', fontSize: '21px', lineHeight: '40px', fontWeight: 400, sample: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', usage: 'Inline Arabic in lists and compact cards. Never below 20px.' },
        ],
      },
    ],
  },
  spacing: {
    tokens: [
      { name: 'space-1', value: '4px', usage: 'Base unit. Icon-to-label gap inside chips.' },
      { name: 'space-2', value: '8px', usage: 'Gap between paired pills (Dikerjakan / Lewati), icon + text.' },
      { name: 'space-3', value: '12px', usage: 'Gap between stacked cards inside a panel; list row vertical padding.' },
      { name: 'space-4', value: '16px', usage: 'Page gutter; standard card padding.' },
      { name: 'space-5', value: '20px', usage: 'Task card and date panel padding.' },
      { name: 'space-6', value: '24px', usage: 'Gap between page sections.' },
      { name: 'space-8', value: '32px', usage: 'Top of page to greeting; empty-state padding.' },
      { name: 'space-10', value: '40px', usage: 'Bottom clearance above the bottom nav.' },
    ],
  },
  radius: {
    tokens: [
      { name: 'radius-sm', value: '0.375rem', usage: 'Icon chips, small badges.' },
      { name: 'radius-md', value: '0.5rem', usage: 'Dropdown items, tab triggers.' },
      { name: 'radius-lg', value: '0.625rem', usage: 'Base (--radius). Buttons, inputs.' },
      { name: 'radius-xl', value: '0.875rem', usage: 'Standard cards, dua card, template cards.' },
      { name: 'radius-2xl', value: '1.125rem', usage: 'Akhirat and Dunia task cards.' },
      { name: 'radius-3xl', value: '1.375rem', usage: 'Date panel, dialog and sheet top corners.' },
      { name: 'radius-4xl', value: '1.625rem', usage: 'Phone-frame mocks only.' },
      { name: 'radius-full', value: '9999px', usage: 'Dikerjakan / Lewati pills, week-strip day circles, avatar.' },
    ],
  },
  shadow: {
    note: 'Flat unless floating. Cards, rows and chips never take a shadow.',
    tokens: [
      { name: 'shadow-float', value: '0 4px 12px -2px rgb(20 30 25 / 0.18)', usage: 'The quick-add + button only.' },
      { name: 'shadow-sheet', value: '0 -8px 32px -8px rgb(10 15 12 / 0.28)', usage: 'Dialog and bottom-sheet surface over the scrim.' },
    ],
  },
  duration: {
    tokens: [
      { name: 'duration-fast', value: '150ms', usage: 'Hover tint, pill press, tab change. ease-out.' },
      { name: 'duration-base', value: '200ms', usage: 'Dialog fade + 8px slide, card swap after Dikerjakan / Lewati. ease-out. 0ms under prefers-reduced-motion.' },
    ],
  },
};
fs.mkdirSync('project', { recursive: true });
fs.writeFileSync('project/tokens.json', JSON.stringify(out, null, 2));
console.log('tokens', tokens.length);
