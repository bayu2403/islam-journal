# Token sheet

Drop-in for `frontend/src/app/globals.css`: Tailwind v4 `@theme inline` mapping plus the four palette blocks, shadcn names, oklch values. `html[data-gender]` picks the palette, `.dark` the mode — the same switches `ThemeProvider` already sets. New versus the current file: `card-inverse-muted`, `card-inverse-border`, `reward-ink`, `scrim`, darker `input` (≥3:1), and `destructive` per palette. Utilities follow: `bg-card-inverse`, `text-card-inverse-muted`, `text-reward`, `text-reward-ink`, `bg-scrim`, `font-serif`, `font-arabic`.

Load Lora, Geist, Geist Mono and Amiri with `next/font/google` as `--font-lora`, `--font-sans`, `--font-geist-mono`, `--font-amiri`.

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
  --color-scrim: var(--scrim);
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

html[data-gender="ikhwan"] {
  --background: oklch(0.985 0.01 95);
  --foreground: oklch(0.22 0.02 160);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.4 0.09 168);
  --primary-foreground: oklch(0.98 0.01 95);
  --secondary: oklch(0.94 0.05 120);
  --secondary-foreground: oklch(0.3 0.05 150);
  --muted: oklch(0.95 0.02 100);
  --muted-foreground: oklch(0.5 0.02 140);
  --accent: oklch(0.9 0.15 125);
  --accent-foreground: oklch(0.28 0.06 140);
  --border: oklch(0.9 0.02 100);
  --input: oklch(0.64 0.02 120);
  --ring: oklch(0.4 0.09 168);
  --destructive: oklch(0.5 0.16 35);
  --card-inverse: oklch(0.28 0.04 180);
  --card-inverse-foreground: oklch(0.97 0.01 95);
  --card-inverse-muted: oklch(0.8 0.02 170);
  --card-inverse-border: oklch(0.28 0.04 180);
  --reward: oklch(0.75 0.15 65);
  --reward-ink: oklch(0.52 0.13 55);
  --scrim: oklch(0.22 0.02 160 / 0.45);
}

html[data-gender="ikhwan"].dark {
  --background: oklch(0.16 0.015 170);
  --foreground: oklch(0.95 0.01 95);
  --card: oklch(0.24 0.025 172);
  --card-foreground: var(--foreground);
  --popover: oklch(0.24 0.025 172);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.75 0.1 160);
  --primary-foreground: oklch(0.16 0.02 170);
  --secondary: oklch(0.28 0.03 170);
  --secondary-foreground: oklch(0.95 0.01 95);
  --muted: oklch(0.26 0.025 172);
  --muted-foreground: oklch(0.72 0.02 160);
  --accent: oklch(0.85 0.16 125);
  --accent-foreground: oklch(0.2 0.05 140);
  --border: oklch(1 0 0 / 0.12);
  --input: oklch(0.56 0.02 165);
  --ring: oklch(0.75 0.1 160);
  --destructive: oklch(0.72 0.14 35);
  --card-inverse: oklch(0.09 0.02 180);
  --card-inverse-foreground: oklch(0.97 0.01 95);
  --card-inverse-muted: oklch(0.75 0.02 170);
  --card-inverse-border: oklch(1 0 0 / 0.1);
  --reward: oklch(0.8 0.15 70);
  --reward-ink: oklch(0.8 0.15 70);
  --scrim: oklch(0.05 0.01 170 / 0.7);
}

html[data-gender="akhwat"] {
  --background: oklch(0.985 0.008 350);
  --foreground: oklch(0.24 0.03 345);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.45 0.12 350);
  --primary-foreground: oklch(0.98 0.008 350);
  --secondary: oklch(0.95 0.03 10);
  --secondary-foreground: oklch(0.32 0.06 348);
  --muted: oklch(0.96 0.015 10);
  --muted-foreground: oklch(0.5 0.04 348);
  --accent: oklch(0.88 0.08 10);
  --accent-foreground: oklch(0.33 0.06 350);
  --border: oklch(0.91 0.02 350);
  --input: oklch(0.64 0.03 350);
  --ring: oklch(0.45 0.12 350);
  --destructive: oklch(0.5 0.16 35);
  --card-inverse: oklch(0.3 0.06 340);
  --card-inverse-foreground: oklch(0.97 0.008 350);
  --card-inverse-muted: oklch(0.82 0.03 345);
  --card-inverse-border: oklch(0.3 0.06 340);
  --reward: oklch(0.78 0.12 85);
  --reward-ink: oklch(0.52 0.1 75);
  --scrim: oklch(0.24 0.03 345 / 0.45);
}

html[data-gender="akhwat"].dark {
  --background: oklch(0.17 0.025 340);
  --foreground: oklch(0.95 0.01 350);
  --card: oklch(0.25 0.035 342);
  --card-foreground: var(--foreground);
  --popover: oklch(0.25 0.035 342);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.76 0.09 350);
  --primary-foreground: oklch(0.2 0.04 345);
  --secondary: oklch(0.29 0.04 344);
  --secondary-foreground: oklch(0.95 0.01 350);
  --muted: oklch(0.27 0.035 342);
  --muted-foreground: oklch(0.73 0.02 350);
  --accent: oklch(0.8 0.1 10);
  --accent-foreground: oklch(0.22 0.04 350);
  --border: oklch(1 0 0 / 0.12);
  --input: oklch(0.58 0.03 345);
  --ring: oklch(0.76 0.09 350);
  --destructive: oklch(0.72 0.14 35);
  --card-inverse: oklch(0.1 0.03 340);
  --card-inverse-foreground: oklch(0.97 0.008 350);
  --card-inverse-muted: oklch(0.76 0.02 345);
  --card-inverse-border: oklch(1 0 0 / 0.1);
  --reward: oklch(0.82 0.12 85);
  --reward-ink: oklch(0.82 0.12 85);
  --scrim: oklch(0.05 0.02 340 / 0.7);
}
```
