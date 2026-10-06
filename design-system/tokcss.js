// Compiles a design-system tokens.json into CSS the way the DS page's tokens.css does,
// but keyed on a chosen attribute so a standalone page can switch palettes itself.
module.exports = function tokcss(tok, attr) {
  const themes = tok.color.themes.map(t => t.id);
  const first = themes[0];
  const val = (t, id) => {
    const v = typeof t.value === 'string' ? t.value : (t.value[id] ?? t.value[first]);
    return v.startsWith('{') ? `var(--${v.slice(1, -1)})` : v;
  };
  const perTheme = id => [
    ...tok.color.tokens.map(t => `  --${t.name}: ${val(t, id)};`),
    ...((tok.shadow && tok.shadow.tokens) || []).map(t => `  --${t.name}: ${val(t, id)};`),
  ].join('\n');
  let css = `:root, [${attr}="${first}"] {\n${perTheme(first)}\n}\n`;
  for (const id of themes.slice(1)) css += `[${attr}="${id}"] {\n${perTheme(id)}\n}\n`;
  const flat = [];
  for (const [k, fam] of Object.entries(tok)) {
    if (['color', 'type', 'shadow', 'name', 'version'].includes(k) || !fam || !fam.tokens) continue;
    for (const t of fam.tokens) flat.push(`  --${t.name}: ${t.value};`);
  }
  for (const [k, v] of Object.entries(tok.type.families)) flat.push(`  --font-${k}: ${v};`);
  css += `:root {\n${flat.join('\n')}\n}\n`;
  return css;
};
