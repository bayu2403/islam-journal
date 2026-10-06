# Navigation

The app shell: a thin sticky top bar and a three-tab bottom nav (Beranda / Jurnal / Profil), both safe-area aware.

- **Top bar**: 48px, sticky at `top: env(safe-area-inset-top)`, `background` at 94% with a 1px `border` bottom. Title only (`title` style); a ghost back arrow appears only on Jurnal's picker sub-views.
- **Bottom nav**: sticky bottom, `card` at 95% + 8px backdrop blur, 1px `border` top, bottom padding `env(safe-area-inset-bottom)`. Icons `house`, `notebook-pen`, `user` at 20px.
- Active tab: `primary` label + icon at stroke 2.4, `aria-current="page"`. Inactive: `muted-foreground` at stroke 1.8. No pill indicator, no badge dots.
- Use next-intl's `Link` from `i18n/routing`, never `next/link`.
