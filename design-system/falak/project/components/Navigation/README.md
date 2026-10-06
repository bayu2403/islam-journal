# Navigation

A floating glass **dock** (Beranda / Jurnal / Profil) and a thin glass **top bar**.

- Dock: detached 16px from the edges and 12px + safe-area from the bottom, `radius-2xl`, `glass` + blur + saturate, `shadow-float`. The active tab sits on a `primary`-tinted capsule that glides between tabs (`duration-base`, `ease-spring`). Icons `orbit`, `notebook-pen`, `user` at 21px; active = `primary`, stroke 2.1, raised 1px.
- Top bar: 52px glass, sticky at `env(safe-area-inset-top)`, Unbounded 15px title, optional back button (Jurnal sub-views only).
- Use next-intl's `Link` from `i18n/routing`.
