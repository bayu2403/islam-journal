# Token sheet

Drop-in for `frontend/src/app/globals.css`: Tailwind v4 `@theme inline` + the four palettes on the existing `html[data-gender]` / `.dark` switches, shadcn names, oklch. Falak is dark-first: default `ThemeProvider` mode to `dark`.

Utilities you get: `bg-card-inverse`, `text-reward`, `bg-glass`, `text-glow`, `font-display`, `font-mono`, `font-arabic`, `ease-spring`, `ease-out-expo`. Load fonts with `next/font/google`: Unbounded, Onest, JetBrains Mono, Noto Naskh Arabic, Reem Kufi — as the CSS variables named in `@theme`. Component recipes (beam, aurora, orbit) live in `components/bundle.css`; copy the `.fk-holo`, `.fk-ground`, `.fk-glass`, `.fk-enter` blocks into `globals.css` as `@layer components`.

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-card-inverse: var(--card-inverse);
  --color-card-inverse-foreground: var(--card-inverse-foreground);
  --color-card-inverse-muted: var(--card-inverse-muted);
  --color-card-inverse-border: var(--card-inverse-border);
  --color-reward: var(--reward);
  --color-reward-ink: var(--reward-ink);
  --color-glow: var(--glow);
  --color-glow-2: var(--glow-2);
  --color-glass: var(--glass);
  --color-grid: var(--grid);
  --color-scrim: var(--scrim);
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
  --duration-instant: 120ms;
  --duration-fast: 220ms;
  --duration-base: 420ms;
  --duration-slow: 900ms;
  --duration-beam: 6s;
  --duration-ambient: 18s;
  --blur-glass: 18px;
  --blur-enter: 8px;
  --shadow-float: 0 18px 40px -12px rgb(3 8 20 / 0.55);
}

html[data-gender="ikhwan"] {
  --background: oklch(0.975 0.008 200);
  --foreground: oklch(0.2 0.03 230);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.47 0.1 182);
  --primary-foreground: oklch(0.99 0.005 200);
  --secondary: oklch(0.93 0.03 190);
  --secondary-foreground: oklch(0.28 0.05 210);
  --muted: oklch(0.945 0.012 210);
  --muted-foreground: oklch(0.5 0.03 225);
  --accent: oklch(0.87 0.12 172);
  --accent-foreground: oklch(0.24 0.05 190);
  --border: oklch(0.2 0.03 230 / 0.1);
  --input: oklch(0.63 0.03 220);
  --ring: oklch(0.47 0.1 182);
  --destructive: oklch(0.52 0.17 30);
  --card-inverse: oklch(0.19 0.035 232);
  --card-inverse-foreground: oklch(0.97 0.01 200);
  --card-inverse-muted: oklch(0.78 0.03 210);
  --card-inverse-border: oklch(0.85 0.14 172 / 0.35);
  --reward: oklch(0.86 0.14 85);
  --reward-ink: oklch(0.52 0.12 70);
  --glow: oklch(0.75 0.14 172 / 0.32);
  --glow-2: oklch(0.7 0.13 225 / 0.26);
  --glass: oklch(1 0 0 / 0.66);
  --grid: oklch(0.47 0.1 182 / 0.07);
  --scrim: oklch(0.2 0.03 230 / 0.45);
  --shadow-glow: 0 0 0 1px oklch(0.47 0.1 182 / 0.18), 0 10px 30px -10px oklch(0.47 0.1 182 / 0.4);
}

html[data-gender="akhwat"] {
  --background: oklch(0.975 0.008 340);
  --foreground: oklch(0.22 0.04 335);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.5 0.15 350);
  --primary-foreground: oklch(0.99 0.005 340);
  --secondary: oklch(0.94 0.03 345);
  --secondary-foreground: oklch(0.3 0.06 340);
  --muted: oklch(0.95 0.012 340);
  --muted-foreground: oklch(0.5 0.04 340);
  --accent: oklch(0.87 0.09 55);
  --accent-foreground: oklch(0.3 0.06 40);
  --border: oklch(0.22 0.04 335 / 0.1);
  --input: oklch(0.63 0.04 340);
  --ring: oklch(0.5 0.15 350);
  --destructive: oklch(0.52 0.17 30);
  --card-inverse: oklch(0.2 0.04 330);
  --card-inverse-foreground: oklch(0.97 0.01 330);
  --card-inverse-muted: oklch(0.79 0.03 335);
  --card-inverse-border: oklch(0.83 0.12 350 / 0.38);
  --reward: oklch(0.87 0.12 85);
  --reward-ink: oklch(0.52 0.1 70);
  --glow: oklch(0.68 0.15 350 / 0.28);
  --glow-2: oklch(0.78 0.1 55 / 0.3);
  --glass: oklch(1 0 0 / 0.66);
  --grid: oklch(0.5 0.15 350 / 0.07);
  --scrim: oklch(0.22 0.04 335 / 0.45);
  --shadow-glow: 0 0 0 1px oklch(0.5 0.15 350 / 0.18), 0 10px 30px -10px oklch(0.5 0.15 350 / 0.38);
}

html[data-gender="ikhwan"].dark {
  --background: oklch(0.16 0.025 230);
  --foreground: oklch(0.96 0.01 200);
  --card: oklch(0.21 0.03 228);
  --card-foreground: var(--foreground);
  --popover: oklch(0.22 0.03 228);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.85 0.14 172);
  --primary-foreground: oklch(0.18 0.04 200);
  --secondary: oklch(0.27 0.035 225);
  --secondary-foreground: oklch(0.95 0.01 200);
  --muted: oklch(0.25 0.03 228);
  --muted-foreground: oklch(0.74 0.03 215);
  --accent: oklch(0.8 0.12 220);
  --accent-foreground: oklch(0.17 0.03 230);
  --border: oklch(0.9 0.03 200 / 0.12);
  --input: oklch(0.52 0.04 220);
  --ring: oklch(0.85 0.14 172);
  --destructive: oklch(0.74 0.15 30);
  --card-inverse: oklch(0.12 0.03 240);
  --card-inverse-foreground: oklch(0.97 0.01 200);
  --card-inverse-muted: oklch(0.77 0.03 210);
  --card-inverse-border: oklch(0.85 0.14 172 / 0.3);
  --reward: oklch(0.86 0.14 85);
  --reward-ink: oklch(0.86 0.14 85);
  --glow: oklch(0.85 0.14 172 / 0.3);
  --glow-2: oklch(0.72 0.14 225 / 0.35);
  --glass: oklch(0.24 0.03 228 / 0.62);
  --grid: oklch(0.85 0.14 172 / 0.07);
  --scrim: oklch(0.08 0.02 230 / 0.72);
  --shadow-glow: 0 0 0 1px oklch(0.85 0.14 172 / 0.25), 0 8px 32px -8px oklch(0.85 0.14 172 / 0.45);
}

html[data-gender="akhwat"].dark {
  --background: oklch(0.16 0.03 330);
  --foreground: oklch(0.96 0.01 330);
  --card: oklch(0.21 0.035 330);
  --card-foreground: var(--foreground);
  --popover: oklch(0.22 0.035 330);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.83 0.12 350);
  --primary-foreground: oklch(0.2 0.05 340);
  --secondary: oklch(0.27 0.04 330);
  --secondary-foreground: oklch(0.95 0.01 330);
  --muted: oklch(0.25 0.035 330);
  --muted-foreground: oklch(0.75 0.03 330);
  --accent: oklch(0.84 0.1 55);
  --accent-foreground: oklch(0.2 0.04 40);
  --border: oklch(0.92 0.03 340 / 0.12);
  --input: oklch(0.54 0.05 330);
  --ring: oklch(0.83 0.12 350);
  --destructive: oklch(0.74 0.15 30);
  --card-inverse: oklch(0.12 0.035 330);
  --card-inverse-foreground: oklch(0.97 0.01 330);
  --card-inverse-muted: oklch(0.78 0.03 330);
  --card-inverse-border: oklch(0.83 0.12 350 / 0.3);
  --reward: oklch(0.87 0.12 85);
  --reward-ink: oklch(0.87 0.12 85);
  --glow: oklch(0.83 0.12 350 / 0.32);
  --glow-2: oklch(0.84 0.1 55 / 0.3);
  --glass: oklch(0.24 0.035 330 / 0.62);
  --grid: oklch(0.83 0.12 350 / 0.07);
  --scrim: oklch(0.08 0.02 330 / 0.72);
  --shadow-glow: 0 0 0 1px oklch(0.83 0.12 350 / 0.25), 0 8px 32px -8px oklch(0.83 0.12 350 / 0.42);
}

@property --fk-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: 0ms !important; }
}
```
