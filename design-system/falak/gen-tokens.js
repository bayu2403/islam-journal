const T = require('./themes.js');
const fs = require('fs');
const ids = ['ikhwan-dark', 'akhwat-dark', 'ikhwan-light', 'akhwat-light'];
const alias = n => Object.fromEntries(ids.map(i => [i, `{${n}}`]));
const extra = { 'card-foreground': alias('foreground'), 'popover-foreground': alias('foreground') };
const order = [
  ['background', 'Night-sky ground (dark) / lunar ground (light). Carries the aurora + star-grid atmosphere; never a flat default.'],
  ['foreground', 'Body text and headings on background, card, popover, glass. 15.7:1 minimum.'],
  ['card', 'Solid surface: lists, inputs, Dunia card fallback when backdrop-filter is unsupported.'],
  ['card-foreground', 'Text on card. Alias of foreground.'],
  ['popover', 'Sheets, dialogs, dropdown menus.'],
  ['popover-foreground', 'Text on popover. Alias of foreground.'],
  ['primary', 'The signal: mint (Ikhwan) / orchid (Akhwat). Primary action, active dock item, orbit progress arc, the sun node, links, focus ring. Readable as text on background and card (5.9:1 minimum).'],
  ['primary-foreground', 'Label on primary fills. 6.1:1 minimum.'],
  ['secondary', 'Raised quiet fill: secondary button, segmented track, icon chips.'],
  ['secondary-foreground', 'Text on secondary. 11.6:1 minimum.'],
  ['muted', 'Status chips (pending AND skipped share it), skeleton base, hover fill on ghost controls.'],
  ['muted-foreground', 'Secondary text, HUD labels, timestamps on background, card, muted. 5.1:1 minimum.'],
  ['accent', 'Second light: sky-cyan (Ikhwan) / apricot (Akhwat). Today marker in the week strip, the Dikerjakan pill fill, the second stop of every beam.'],
  ['accent-foreground', 'Label on accent fills. 9.1:1 minimum.'],
  ['border', 'Translucent hairline for glass panels, dividers, list rows. Decorative only.'],
  ['input', 'Control border: inputs, outline buttons, Lewati pill, day toggles. 3.2:1 minimum on card and background.'],
  ['ring', 'Focus-visible ring: 2px solid + a 6px glow halo. 5.9:1 minimum.'],
  ['destructive', 'Validation errors only. Never for skipped tasks, never for network trouble.'],
  ['card-inverse', 'The Akhirat "holo" card: the deepest surface on screen in every palette, carrying the rotating border beam and khatam pattern. Reserved for Akhirat tasks.'],
  ['card-inverse-foreground', 'Headline and pill text on card-inverse. 16.7:1 minimum.'],
  ['card-inverse-muted', 'Summary, time and eyebrow on card-inverse. 9.3:1 minimum.'],
  ['card-inverse-border', 'Resting 1px edge of the holo card, under the animated beam.'],
  ['reward', 'Solar gold. ONLY the hadith-source fragment on card-inverse, e.g. (HR. Tirmidzi no. 241). 11.9:1 minimum.'],
  ['reward-ink', 'Same sacred role on popover: the citation line in the dalil sheet. 5.6:1 minimum.'],
  ['glow', 'Primary light as a halo: aurora blob, beam falloff, focus halo, orbit sun bloom. Never under text as a fill.'],
  ['glow-2', 'Accent light as the second aurora blob.'],
  ['glass', 'Translucent panel fill with backdrop-filter blur(18px) saturate(140%): Dunia card, dock, orbit panel, dua card.'],
  ['grid', 'Star-grid and khatam pattern stroke on the ground and inside the holo card.'],
  ['scrim', 'Overlay behind sheets, with a 6px backdrop blur.'],
];
const tokens = order.map(([name, usage]) => ({ name, usage, value: Object.fromEntries(ids.map(i => [i, (extra[name] && extra[name][i]) || T[i][name]])) }));
for (const t of tokens) for (const i of ids) if (!t.value[i]) throw new Error(t.name + i);

const out = {
  name: 'Muslim Berislam Falak', version: 1,
  color: { themes: [
    { id: 'ikhwan-dark', name: 'Ikhwan · Malam' }, { id: 'akhwat-dark', name: 'Akhwat · Malam' },
    { id: 'ikhwan-light', name: 'Ikhwan · Siang' }, { id: 'akhwat-light', name: 'Akhwat · Siang' }], tokens },
  type: {
    fonts: [],
    families: {
      display: 'Unbounded, "Arial Black", system-ui, sans-serif',
      sans: 'Onest, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
      arabic: '"Noto Naskh Arabic", Amiri, "Traditional Arabic", serif',
      kufi: '"Reem Kufi", "Noto Kufi Arabic", sans-serif',
    },
    groups: [
      { name: 'Display (Unbounded)', family: 'display', styles: [
        { name: 'display', fontSize: '32px', lineHeight: '36px', fontWeight: 600, letterSpacing: '-0.02em', sample: 'Assalamu\'alaikum, Jessica', usage: 'Greeting and page titles. One per screen.' },
        { name: 'h1', fontSize: '24px', lineHeight: '28px', fontWeight: 600, letterSpacing: '-0.015em', sample: 'Sholat Ashar', usage: 'Sheet titles, countdown target name.' },
        { name: 'h2', fontSize: '17px', lineHeight: '22px', fontWeight: 500, letterSpacing: '-0.01em', sample: 'Rencana hari ini', usage: 'Section headings.' },
      ] },
      { name: 'Interface (Onest)', family: 'sans', styles: [
        { name: 'h3', fontSize: '19px', lineHeight: '25px', fontWeight: 650, letterSpacing: '-0.01em', sample: 'Sholat Ashar berjamaah.', usage: 'Task card headline.' },
        { name: 'title', fontSize: '15px', lineHeight: '21px', fontWeight: 600, sample: 'Catatan ilmu', usage: 'Card, row and template titles.' },
        { name: 'body', fontSize: '15px', lineHeight: '23px', fontWeight: 400, sample: 'Badan bugar, mood naik — energi buat ibadah pun ikut penuh.', usage: 'Functional copy, translations, form values.' },
        { name: 'small', fontSize: '13px', lineHeight: '19px', fontWeight: 400, sample: 'Mengingat-ingat anugerah Allah membuahkan kecintaan kepada Allah', usage: 'Subtitles, summaries, helper text.' },
        { name: 'label', fontSize: '13px', lineHeight: '16px', fontWeight: 550, sample: 'Dikerjakan', usage: 'Buttons, pills, form labels.' },
      ] },
      { name: 'HUD (JetBrains Mono)', family: 'mono', styles: [
        { name: 'hud', fontSize: '11px', lineHeight: '14px', fontWeight: 500, letterSpacing: '0.14em', sample: 'AKHIRAT · ASHAR 15:21', usage: 'Uppercase eyebrows, category tags, telemetry labels.' },
        { name: 'countdown', fontSize: '40px', lineHeight: '44px', fontWeight: 500, letterSpacing: '-0.03em', sample: '01:16:00', usage: 'Time to the next prayer. tabular-nums, ticks every second.' },
        { name: 'data', fontSize: '12px', lineHeight: '16px', fontWeight: 400, sample: '14:00 · 1 SAFAR 1447', usage: 'Times, dates, feed timestamps.' },
      ] },
      { name: 'Arabic', family: 'arabic', styles: [
        { name: 'arabic-lg', fontSize: '26px', lineHeight: '52px', fontWeight: 400, sample: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', usage: 'Dua and dalil text, Naskh, dir="rtl" lang="ar". Read aloud, 2.0 leading.' },
        { name: 'arabic-md', fontSize: '21px', lineHeight: '40px', fontWeight: 400, sample: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', usage: 'Compact Arabic in cards. Never below 20px.' },
        { name: 'arabic-kufi', family: 'kufi', fontSize: '28px', lineHeight: '36px', fontWeight: 500, sample: 'فَلَك', usage: 'Short ornamental Arabic only (wordmark, section marks). Never for dua or hadith.' },
      ] },
    ],
  },
  spacing: { tokens: [
    { name: 'space-1', value: '4px', usage: 'Base unit.' },
    { name: 'space-2', value: '8px', usage: 'Pill pair gap, icon + label.' },
    { name: 'space-3', value: '12px', usage: 'Stacked cards, list row padding.' },
    { name: 'space-4', value: '16px', usage: 'Page gutter, glass panel padding.' },
    { name: 'space-5', value: '20px', usage: 'Task card padding.' },
    { name: 'space-6', value: '24px', usage: 'Section gap.' },
    { name: 'space-8', value: '32px', usage: 'Top of screen to greeting.' },
    { name: 'space-12', value: '48px', usage: 'Clearance above the floating dock.' },
  ] },
  radius: { tokens: [
    { name: 'radius-sm', value: '8px', usage: 'Chips, icon tiles.' },
    { name: 'radius-md', value: '12px', usage: 'Inputs, buttons, menu items.' },
    { name: 'radius-lg', value: '18px', usage: 'Glass panels, lists, dua card.' },
    { name: 'radius-xl', value: '24px', usage: 'Task cards, orbit panel.' },
    { name: 'radius-2xl', value: '32px', usage: 'Sheets, the floating dock.' },
    { name: 'radius-full', value: '9999px', usage: 'Pills, day orbs, avatar, FAB.' },
  ] },
  shadow: { note: 'Light, not weight: shadows are coloured glow from glow tokens; floating elements add a soft dark drop.', tokens: [
    { name: 'shadow-glow', value: { 'ikhwan-dark': '0 0 0 1px oklch(0.85 0.14 172 / 0.25), 0 8px 32px -8px oklch(0.85 0.14 172 / 0.45)', 'akhwat-dark': '0 0 0 1px oklch(0.83 0.12 350 / 0.25), 0 8px 32px -8px oklch(0.83 0.12 350 / 0.42)', 'ikhwan-light': '0 0 0 1px oklch(0.47 0.1 182 / 0.18), 0 10px 30px -10px oklch(0.47 0.1 182 / 0.4)', 'akhwat-light': '0 0 0 1px oklch(0.5 0.15 350 / 0.18), 0 10px 30px -10px oklch(0.5 0.15 350 / 0.38)' }, usage: 'Hover/lift on interactive glass, primary button, FAB, holo card.' },
    { name: 'shadow-float', value: '0 18px 40px -12px rgb(3 8 20 / 0.55)', usage: 'Dock, sheets, menus.' },
  ] },
  duration: { tokens: [
    { name: 'duration-instant', value: '120ms', usage: 'Press feedback, ripple start.' },
    { name: 'duration-fast', value: '220ms', usage: 'Hover lift, tab indicator glide, chip swap.' },
    { name: 'duration-base', value: '420ms', usage: 'Card enter/exit, sheet rise, check draw.' },
    { name: 'duration-slow', value: '900ms', usage: 'Orbit arc draw on load, completion light-sweep.' },
    { name: 'duration-beam', value: '6s', usage: 'One revolution of the holo border beam.' },
    { name: 'duration-ambient', value: '18s', usage: 'Aurora drift, khatam rotation. Paused under reduced motion.' },
  ] },
  easing: { tokens: [
    { name: 'ease-out-expo', value: 'cubic-bezier(0.16, 1, 0.3, 1)', usage: 'Default for entrances, glides and sheets.' },
    { name: 'ease-spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', usage: 'Tiny overshoot: pill press release, dock indicator, day orb select.' },
    { name: 'ease-in-quart', value: 'cubic-bezier(0.5, 0, 0.75, 0)', usage: 'Exits (card leaving after Dikerjakan / Lewati).' },
  ] },
  blur: { tokens: [
    { name: 'blur-glass', value: '18px', usage: 'backdrop-filter on glass panels and the dock.' },
    { name: 'blur-enter', value: '8px', usage: 'Filter blur a card starts from when it enters.' },
  ] },
};
fs.mkdirSync('project', { recursive: true });
fs.writeFileSync('project/tokens.json', JSON.stringify(out, null, 2));
console.log('ok', tokens.length);
