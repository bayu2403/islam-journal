const fs = require('fs');
const tok = JSON.parse(fs.readFileSync('project/tokens.json', 'utf8')).color.tokens;
const sel = {
  'ikhwan-light': 'html[data-gender="ikhwan"]',
  'ikhwan-dark': 'html[data-gender="ikhwan"].dark',
  'akhwat-light': 'html[data-gender="akhwat"]',
  'akhwat-dark': 'html[data-gender="akhwat"].dark',
};
const resolve = (v) => v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v;
let css = `@theme inline {
${tok.map(t => `  --color-${t.name}: var(--${t.name});`).join('\n')}
  --font-serif: var(--font-lora);
  --font-arabic: var(--font-amiri);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root { --radius: 0.625rem; }
`;
for (const [id, s] of Object.entries(sel)) {
  css += `\n${s} {\n${tok.map(t => `  --${t.name}: ${resolve(t.value[id])};`).join('\n')}\n}\n`;
}
const md = `# Token sheet

Drop-in for \`frontend/src/app/globals.css\`: Tailwind v4 \`@theme inline\` mapping plus the four palette blocks, shadcn names, oklch values. \`html[data-gender]\` picks the palette, \`.dark\` the mode — the same switches \`ThemeProvider\` already sets. New versus the current file: \`card-inverse-muted\`, \`card-inverse-border\`, \`reward-ink\`, \`scrim\`, darker \`input\` (≥3:1), and \`destructive\` per palette. Utilities follow: \`bg-card-inverse\`, \`text-card-inverse-muted\`, \`text-reward\`, \`text-reward-ink\`, \`bg-scrim\`, \`font-serif\`, \`font-arabic\`.

Load Lora, Geist, Geist Mono and Amiri with \`next/font/google\` as \`--font-lora\`, \`--font-sans\`, \`--font-geist-mono\`, \`--font-amiri\`.

\`\`\`css
${css}\`\`\`
`;
fs.writeFileSync('project/token-sheet.md', md);
console.log('ok');
