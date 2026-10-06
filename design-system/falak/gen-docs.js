const fs = require('fs');
const tok = JSON.parse(fs.readFileSync('project/tokens.json', 'utf8'));
const colors = tok.color.tokens;
const sel = {
  'ikhwan-dark': 'html[data-gender="ikhwan"].dark',
  'akhwat-dark': 'html[data-gender="akhwat"].dark',
  'ikhwan-light': 'html[data-gender="ikhwan"]',
  'akhwat-light': 'html[data-gender="akhwat"]',
};
const res = v => v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v;
const plain = f => tok[f].tokens.map(t => `  --${t.name}: ${typeof t.value === 'string' ? t.value : ''};`).filter(l => !l.endsWith(': ;')).join('\n');
let css = `@theme inline {
${colors.map(t => `  --color-${t.name}: var(--${t.name});`).join('\n')}
  --font-display: var(--font-unbounded);
  --font-sans: var(--font-onest);
  --font-mono: var(--font-jetbrains-mono);
  --font-arabic: var(--font-noto-naskh-arabic);
  --font-kufi: var(--font-reem-kufi);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 18px; --radius-xl: 24px; --radius-2xl: 32px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-quart: cubic-bezier(0.5, 0, 0.75, 0);
}

:root {
${plain('duration')}
${plain('blur')}
  --shadow-float: 0 18px 40px -12px rgb(3 8 20 / 0.55);
}
`;
// light blocks first so `.dark` (higher specificity) wins
for (const id of ['ikhwan-light', 'akhwat-light', 'ikhwan-dark', 'akhwat-dark']) {
  const sh = tok.shadow.tokens.find(t => t.name === 'shadow-glow').value[id];
  css += `\n${sel[id]} {\n${colors.map(t => `  --${t.name}: ${res(t.value[id])};`).join('\n')}\n  --shadow-glow: ${sh};\n}\n`;
}
css += `
@property --fk-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: 0ms !important; }
}
`;
fs.writeFileSync('project/token-sheet.md', `# Token sheet

Drop-in for \`frontend/src/app/globals.css\`: Tailwind v4 \`@theme inline\` + the four palettes on the existing \`html[data-gender]\` / \`.dark\` switches, shadcn names, oklch. Falak is dark-first: default \`ThemeProvider\` mode to \`dark\`.

Utilities you get: \`bg-card-inverse\`, \`text-reward\`, \`bg-glass\`, \`text-glow\`, \`font-display\`, \`font-mono\`, \`font-arabic\`, \`ease-spring\`, \`ease-out-expo\`. Load fonts with \`next/font/google\`: Unbounded, Onest, JetBrains Mono, Noto Naskh Arabic, Reem Kufi — as the CSS variables named in \`@theme\`. Component recipes (beam, aurora, orbit) live in \`components/bundle.css\`; copy the \`.fk-holo\`, \`.fk-ground\`, \`.fk-glass\`, \`.fk-enter\` blocks into \`globals.css\` as \`@layer components\`.

\`\`\`css
${css}\`\`\`
`);

const table = fs.readFileSync('table.md', 'utf8').replace('ikhwan-dark | akhwat-dark | ikhwan-light | akhwat-light', 'Ikhwan · Malam | Akhwat · Malam | Ikhwan · Siang | Akhwat · Siang');
fs.writeFileSync('project/accessibility.md', `# Accessibility

WCAG 2 contrast for every text/ground and control/ground pair the components use, computed from the oklch values (translucent tokens composited over their ground). Every pair passes in all four palettes.

${table}
## Glass and glow

- Text never sits on \`glow\`, \`glow-2\` or the aurora directly. Glass panels (\`glass\`, 62–66% opaque) over the atmosphere keep \`foreground\` ≥12:1 and \`muted-foreground\` ≥5:1 in the worst measured spot; where \`backdrop-filter\` is unsupported, \`.fk-glass\` falls back to \`card\`.
- The holo card's beam and khatam sit behind or around text, never under it at more than 22% opacity.
- The greeting name's gradient (\`foreground\` → \`primary\` → \`accent\`) stays ≥5.9:1 at every stop on \`background\`; it's display-size only and never used on religious text.

## Motion

- \`prefers-reduced-motion: reduce\` stops the aurora, beam, khatam rotation, sun pulse, FAB halo, shimmer and blink, and sets every transition to 0ms. Cards still swap and sheets still open, instantly.
- No flashing: every loop is ≤1 cycle per 1.6s and low contrast.
- The countdown ticks visually; screen readers get the orbit's \`aria-label\` instead of per-second announcements.

## Beyond colour

- Arabic: \`dir="rtl" lang="ar"\`, Noto Naskh ≥20px, 2.0 leading; transliteration \`lang="ar-Latn"\`.
- Focus-visible: 2px solid \`ring\` + 6px \`glow\` halo; on the holo card the ring becomes \`card-inverse-foreground\`.
- Status always carries a word (Selesai, Berikutnya, Belum, Dilewati); check buttons carry \`aria-label\`s.
- Touch targets: pills 38px, checks 30px with 8px spacing, dock items a full third of the dock.
`);
console.log('docs ok');
