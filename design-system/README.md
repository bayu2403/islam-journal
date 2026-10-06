# Muslim Berislam — design systems

Two alternative design systems for the Muslim Berislam app, each with a landing page.
Both cover 4 palettes (ikhwan / akhwat × light / dark) and pass WCAG AA contrast.

| System | Folder | Design system artifact | Landing page |
|---|---|---|---|
| **The Quiet Ritual** — calm, paper-like, serif | `quiet-ritual/` | https://claude.ai/artifact/EktavrQx6pH8kSyiLFdmra | https://claude.ai/artifact/MQtxkAHE8QA3YhM7LEXcrF |
| **Falak** — modern, animated, glass + orbit motif | `falak/` | https://claude.ai/artifact/FjYBYHBBu4Cjgx8y2sjfhT | https://claude.ai/artifact/MwZxwTG4RANu7mREKi4wPi |

## Layout

```
design-system/
  tokcss.js        compiles tokens.json → CSS keyed on a theme attribute
  palette.js       inline gender/mode switcher used by the landing pages
  quiet-ritual/    and  falak/
    project/       the published design system (tokens.json, docs .md, components/*/preview.html, bundle.css/js)
    landing-*.html standalone landing page (open directly in a browser)
    themes.js      palette source (oklch)
    gen-*.js       generators that write project/ and the landing page
    contrast.js    WCAG contrast checks
```

## Regenerate

Run from inside `quiet-ritual/` or `falak/` (Node 18+):

```bash
node gen-tokens.js       # themes.js → project/tokens.json
node gen-components.js   # component previews + bundle
node gen-landing.js      # LandingPage preview + standalone landing-*.html
```

Quiet Ritual also has `gen-sheet.js`; Falak has `gen-docs.js` (token sheet + accessibility tables).
