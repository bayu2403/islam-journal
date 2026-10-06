const fs = require('fs');
const path = require('path');
const out = (p, s) => { const f = path.join('project', p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

const doc = (marker, title, body, extraCss = '') => `${marker}
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>${title}</title>${extraCss ? `<style>${extraCss}</style>` : ''}</head>
<body>
${body}
<script>MB.icons();</script>
</body>
</html>
`;

// ── shared fragments ─────────────────────────────────────
const akhiratCard = (o = {}) => `<article class="mb-task mb-task-akhirat" aria-label="Task akhirat berikutnya">
  <div class="mb-task-top">
    <span class="mb-eyebrow"><span class="mb-eyebrow-chip"><i data-i="landmark" class="sm"></i></span>Akhirat</span>
    <span class="mb-task-time"><i data-i="clock" class="sm"></i>Ashar · 15:21</span>
  </div>
  <h3 class="mb-h3">Sholat Ashar berjamaah.</h3>
  <p class="mb-task-sum">Jaga takbir pertama 40 hari, dicatat <b>2 pembebasan: dari neraka &amp; dari kemunafikan.</b> <span class="mb-src">(HR. Tirmidzi no. 241)</span></p>
  <div class="mb-task-actions">
    <button class="mb-pill mb-pill-done ${o.doneState || ''}"><i data-i="check" class="sm"></i>Dikerjakan</button>
    <button class="mb-pill mb-pill-skip ${o.skipState || ''}">Lewati dulu</button>
    <button class="mb-link">Lihat dalil<i data-i="chevron-right" class="sm"></i></button>
  </div>
</article>`;

const duniaCard = (o = {}) => `<article class="mb-task mb-task-dunia" aria-label="Task dunia berikutnya">
  <div class="mb-task-top">
    <span class="mb-eyebrow"><span class="mb-eyebrow-chip"><i data-i="activity" class="sm"></i></span>Dunia</span>
    <span class="mb-task-time"><i data-i="clock" class="sm"></i>16:30</span>
  </div>
  <h3 class="mb-h3">Olahraga 30 menit.</h3>
  <p class="mb-task-sum">Badan bugar, mood naik — energi buat ibadah pun ikut penuh.</p>
  <div class="mb-task-actions">
    <button class="mb-pill mb-pill-done ${o.doneState || ''}"><i data-i="check" class="sm"></i>Dikerjakan</button>
    <button class="mb-pill mb-pill-skip ${o.skipState || ''}">Lewati dulu</button>
  </div>
</article>`;

const datePanel = (inner = '') => `<section class="mb-panel" aria-label="Tanggal hari ini">
  <div class="mb-dates">
    <div class="mb-date"><span class="n">26</span><span class="m">Juli 2025</span><span class="y">Sabtu · Masehi</span></div>
    <hr>
    <div class="mb-date hijri"><span class="n">1</span><span class="m">Safar 1447</span><span class="y">Hijriah</span></div>
  </div>
  <div class="mb-prayer"><span style="display:inline-flex;align-items:center;gap:6px"><i data-i="sunset" class="sm"></i>Sholat berikutnya</span><span>Ashar <strong>15:21</strong></span></div>
  ${inner}
</section>`;

const duaCard = (compact) => `<article class="mb-dua" aria-label="Rekomendasi doa">
  <span class="mb-eyebrow mb-muted">Rekomendasi doa hari ini</span>
  <p class="mb-arabic ${compact ? 'md' : ''}" dir="rtl" lang="ar">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
  ${compact ? '' : '<p class="translit" lang="ar-Latn">Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ‘adhāban-nār.</p>'}
  <p class="meaning">Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.</p>
  <div class="foot"><span>QS. Al-Baqarah: 201</span>${compact ? '' : '<button class="mb-btn mb-btn-ghost"><i data-i="rotate-ccw" class="sm"></i>Doa lain</button>'}</div>
</article>`;

const nav = (active) => `<nav class="mb-nav" aria-label="Navigasi utama">
  <a href="#"${active === 'beranda' ? ' aria-current="page"' : ''}><i data-i="house"></i>Beranda</a>
  <a href="#"${active === 'jurnal' ? ' aria-current="page"' : ''}><i data-i="notebook-pen"></i>Jurnal</a>
  <a href="#"${active === 'profil' ? ' aria-current="page"' : ''}><i data-i="user"></i>Profil</a>
</nav>`;

const week = `<div class="mb-week" role="tablist" aria-label="Minggu ini">
  ${[['Sen', 21, 26], ['Sel', 22, 27], ['Rab', 23, 28], ['Kam', 24, 29], ['Jum', 25, 30], ['Sab', 26, 1, 'today'], ['Ahad', 27, 2, 'selected']]
    .map(([d, n, h, s]) => `<button class="mb-day ${s || ''}" role="tab" aria-selected="${s === 'selected'}"${s === 'today' ? ' aria-current="date"' : ''}><span class="dn">${d}</span><span class="c">${n}</span><span class="h">${h}</span></button>`).join('\n  ')}
</div>`;

const allTasks = `<ul class="mb-list" aria-label="Semua task hari ini">
  <li class="mb-row"><span class="t">04:42</span><span><span class="name">Sholat Subuh</span><span class="sub">Akhirat</span></span><span class="end"><span class="mb-chip done">Selesai</span><button class="mb-check on" aria-label="Batalkan tanda selesai"><i data-i="check" class="sm"></i></button></span></li>
  <li class="mb-row"><span class="t">07:00</span><span><span class="name">Baca Al-Qur'an 1 halaman</span><span class="sub">Akhirat</span></span><span class="end"><span class="mb-chip">Dilewati</span><button class="mb-check" aria-label="Tandai sudah dikerjakan"></button></span></li>
  <li class="mb-row"><span class="t">12:00</span><span><span class="name">Sholat Dzuhur</span><span class="sub">Akhirat</span></span><span class="end"><span class="mb-chip done">Selesai</span><button class="mb-check on" aria-label="Batalkan tanda selesai"><i data-i="check" class="sm"></i></button></span></li>
  <li class="mb-row"><span class="t">15:21</span><span><span class="name">Sholat Ashar</span><span class="sub">Akhirat</span></span><span class="end"><span class="mb-chip">Belum</span><button class="mb-check" aria-label="Tandai sudah dikerjakan"></button></span></li>
  <li class="mb-row"><span class="t">16:30</span><span><span class="name">Olahraga 30 menit</span><span class="sub">Dunia</span></span><span class="end"><span class="mb-chip">Belum</span><button class="mb-check" aria-label="Tandai sudah dikerjakan"></button></span></li>
</ul>`;

const feed = `<ul class="mb-feed" aria-label="Riwayat ibadah">
  <li><span class="t">14:00</span><span class="dot"></span><span class="x">Sudah sholat Dzuhur</span></li>
  <li><span class="t">09:12</span><span class="dot skip"></span><span class="x mb-muted">Baca Al-Qur'an dilewati dulu</span></li>
  <li><span class="t">04:58</span><span class="dot"></span><span class="x">Sudah dzikir pagi</span></li>
  <li><span class="t">04:45</span><span class="dot"></span><span class="x">Sudah sholat Subuh</span></li>
</ul>`;

const story = `<section class="mb-story" aria-label="Cerita hari ini">
  <label class="mb-eyebrow mb-muted" for="story"><i data-i="pen-line" class="sm"></i>Cerita hari ini</label>
  <textarea id="story" placeholder="Apa yang kamu syukuri hari ini?">Alhamdulillah, sempat ikut kajian ba'da Maghrib. Pelan-pelan saja.</textarea>
  <div class="foot"><span>Tersimpan otomatis</span><span class="mb-num">26 Juli · 1 Safar</span></div>
</section>`;

const templates = `<div class="mb-tpl-row">
  <a class="mb-tpl" href="#"><span class="ic"><i data-i="book-open"></i></span><span><p class="mb-title">Catatan ilmu</p><p class="mb-small mb-muted">Faedah kajian hari ini</p></span></a>
  <a class="mb-tpl" href="#"><span class="ic"><i data-i="leaf"></i></span><span><p class="mb-title">Journal kesehatan</p><p class="mb-small mb-muted">Tidur, makan, gerak</p></span></a>
  <a class="mb-tpl" href="#"><span class="ic"><i data-i="hand-heart"></i></span><span><p class="mb-title">Journal penghargaan diri</p><p class="mb-small mb-muted">Satu hal baik tentangmu</p></span></a>
</div>`;

const plan = `<div class="mb-plan">
  <div class="mb-card"><span class="mb-eyebrow mb-muted"><span class="mb-eyebrow-chip"><i data-i="landmark" class="sm"></i></span>Akhirat</span>
    <ul><li>Solat fardhu 5 waktu</li><li>Tahajud</li><li>Dzikir pagi &amp; petang</li></ul></div>
  <div class="mb-card"><span class="mb-eyebrow mb-muted"><span class="mb-eyebrow-chip"><i data-i="activity" class="sm"></i></span>Dunia</span>
    <ul><li>Olahraga 30 menit</li><li>Setor laporan</li></ul>
    <button class="mb-link" style="margin-top:auto"><i data-i="plus" class="sm"></i>Tambah</button></div>
</div>`;

const berandaBody = `<div class="mb-phone-scroll">
  <header style="display:flex;flex-direction:column;gap:4px">
    <h1 class="mb-display">Assalamu'alaikum, Jessica</h1>
    <p class="mb-small mb-muted" style="margin:0">Ayo mulai hari dengan berdoa.</p>
  </header>
  ${duaCard(true)}
  <section class="mb-sect">
    <div class="mb-sect-head"><h2 class="mb-h2">Rencana hari ini</h2></div>
    ${datePanel(akhiratCard() + '\n' + duniaCard())}
    <a class="mb-btn mb-btn-outline lg" href="#" style="width:100%;justify-content:space-between">Semua task hari ini<i data-i="chevron-right" class="sm"></i></a>
  </section>
</div>
<button class="mb-fab" aria-label="Tambah todo dunia"><i data-i="plus"></i></button>
${nav('beranda')}`;

const phoneCss = `.mb-phone{height:auto;min-height:844px}.mb-phone-scroll{padding-bottom:40px}`;

// ── components ───────────────────────────────────────────
const C = {};

C.Button = {
  h: 300, group: 'Actions',
  body: `<div class="mb mb-pv">
${['primary', 'secondary', 'outline', 'ghost'].map(v => `<div class="mb-pv-row"><span class="mb-pv-cap">${v}</span>
  <button class="mb-btn mb-btn-${v}">Simpan</button>
  <button class="mb-btn mb-btn-${v} is-hover">Hover</button>
  <button class="mb-btn mb-btn-${v} is-active">Pressed</button>
  <button class="mb-btn mb-btn-${v} is-focus">Focus</button>
  <button class="mb-btn mb-btn-${v}" disabled>Disabled</button></div>`).join('\n')}
<div class="mb-pv-row"><span class="mb-pv-cap">sizes</span><button class="mb-btn mb-btn-primary lg">Simpan rencana</button><button class="mb-btn mb-btn-outline icon" aria-label="Kembali"><i data-i="arrow-left"></i></button><button class="mb-fab" aria-label="Tambah"><i data-i="plus"></i></button></div>
</div>`,
  readme: `# Button

Four quiet variants for everything that is not a task decision. \`primary\` (solid \`primary\` fill, \`primary-foreground\` label) at most once per view — Simpan, Masuk, Upgrade akun. \`secondary\` on \`secondary\` for supporting actions, \`outline\` (1px \`input\` border) for neutral choices like Batal, \`ghost\` for toolbar and inline actions.

- Height 32px (\`h-8\`), 12px side padding, \`radius-lg\`, label style \`label\` at 13px/500. Large: 40px for full-width actions.
- Hover is a tint shift only (~14% toward \`foreground\`); pressed a little deeper. No scale, no shadow pop.
- Focus-visible: 2px solid \`ring\`, 2px offset. Disabled: 50% opacity, no pointer events.
- The quick-add FAB is the one button that floats: 48px \`radius-full\`, \`primary\` fill, \`shadow-float\`.
- Consumer provides: the label (verb first, sentence case: "Simpan rencana", not "OK"), an optional leading lucide icon, and an \`aria-label\` for icon-only buttons.
- Don't use a button for Dikerjakan / Lewati — those are [TaskActions](../TaskActions/README.md) pills.
`,
};

C.TaskActions = {
  h: 230, group: 'Actions',
  body: `<div class="mb mb-pv">
<div class="mb-pv-row"><span class="mb-pv-cap">rest</span><button class="mb-pill mb-pill-done"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="mb-pill mb-pill-skip">Lewati dulu</button></div>
<div class="mb-pv-row"><span class="mb-pv-cap">hover</span><button class="mb-pill mb-pill-done is-hover"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="mb-pill mb-pill-skip is-hover">Lewati dulu</button></div>
<div class="mb-pv-row"><span class="mb-pv-cap">pressed</span><button class="mb-pill mb-pill-done is-active"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="mb-pill mb-pill-skip is-active">Lewati dulu</button></div>
<div class="mb-pv-row"><span class="mb-pv-cap">focus</span><button class="mb-pill mb-pill-done is-focus"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="mb-pill mb-pill-skip is-focus">Lewati dulu</button></div>
<div class="mb-pv-row"><span class="mb-pv-cap">disabled</span><button class="mb-pill mb-pill-done" disabled><i data-i="check" class="sm"></i>Dikerjakan</button><button class="mb-pill mb-pill-skip" disabled>Lewati dulu</button></div>
</div>`,
  readme: `# TaskActions

The Dikerjakan / Lewati pill pair — the only decision on a task card, and two equally valid answers. Both pills are 32px tall, 16px side padding, \`radius-full\`, label 12px/500: identical size and weight, so skipping never reads as the lesser choice.

- **Dikerjakan**: \`accent\` fill, \`accent-foreground\` label, a leading check icon. Posts status \`done\`.
- **Lewati dulu**: 1px \`input\` border on light cards; on the Akhirat card the border becomes \`card-inverse-muted\` and the label \`card-inverse-foreground\`. Posts status \`skipped\`.
- Neither pill ever turns red, strikes through, shakes or celebrates. After a tap the card swaps to the next task with a 200ms fade (\`duration-base\`); nothing else moves.
- Pills stop click propagation: tapping one never also opens the dalil dialog.
- Copy: "Lewati dulu" (skip for now) — never "Gagal", "Batal", "Skip".
`,
};

C.TaskCard = {
  h: 520, group: 'Beranda',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">
${akhiratCard()}
${duniaCard()}
</div></div>`,
  readme: `# TaskCard

The signature component: one card per category showing only the NEXT task, ordered by real prayer time. The whole card is a tap target that opens the [DalilDialog](../DalilDialog/README.md); its pills do not.

**Anatomy** (both variants, 20px padding, 8px internal gap, \`radius-2xl\`): eyebrow row (24px icon chip + uppercase \`eyebrow\` label, time on the right) → \`h3\` headline → one-line \`body\`-small summary → [TaskActions](../TaskActions/README.md) row (+ "Lihat dalil" link on Akhirat).

**Akhirat** — \`card-inverse\` surface, \`card-inverse-foreground\` headline, \`card-inverse-muted\` eyebrow, time and summary, \`card-inverse-border\` edge (a hairline only in dark palettes). The summary's hadith source sits in \`reward\` — the only place \`reward\` ever appears on screen. Time comes from the prayer schedule (Aladhan, KEMENAG method), shown as "Ashar · 15:21". Icon: \`landmark\`.

**Dunia** — \`card\` surface, 1px \`border\`, \`muted-foreground\` eyebrow and summary. Optional \`scheduled_time\`; omit the time slot entirely when there is none. Icon: \`activity\` (or \`leaf\`) — not \`sparkles\`.

Rules:
- Exactly one Akhirat card per screen; \`card-inverse\` is never used for anything else.
- Summary may clamp to two lines on the card; the full dalil is always available in the dialog, verbatim.
- No shadow, no left-border stripe, no gradient. Pressed feedback is a tint, not a scale.
- Empty category: see [States](../States/README.md) — calm copy, no confetti.
`,
};

C.DalilDialog = {
  h: 720, group: 'Beranda',
  body: `<div class="mb" style="height:720px;display:flex;flex-direction:column"><div class="mb-scrim" style="flex:1;padding-top:40px">
<div class="mb-sheet" role="dialog" aria-modal="true" aria-labelledby="dt">
  <div class="mb-grab"></div>
  <div class="mb-sheet-head"><div style="display:flex;flex-direction:column;gap:4px"><span class="mb-eyebrow mb-muted">Dalil · Akhirat</span><h2 class="mb-h1" id="dt">Sholat Ashar berjamaah</h2></div><button class="mb-btn mb-btn-ghost icon" aria-label="Tutup"><i data-i="x"></i></button></div>
  <div class="mb-sheet-body">
    <p class="mb-arabic" dir="rtl" lang="ar">مَنْ صَلَّى لِلَّهِ أَرْبَعِينَ يَوْمًا فِي جَمَاعَةٍ يُدْرِكُ التَّكْبِيرَةَ الأُولَى كُتِبَتْ لَهُ بَرَاءَتَانِ بَرَاءَةٌ مِنَ النَّارِ وَبَرَاءَةٌ مِنَ النِّفَاقِ</p>
    <p style="margin:0">“Barang siapa shalat karena Allah selama empat puluh hari secara berjamaah dengan mendapatkan takbir pertama, maka dicatat baginya dua pembebasan: pembebasan dari neraka dan pembebasan dari kemunafikan.”</p>
    <p class="mb-cite"><span class="mb-src-ink">HR. Tirmidzi no. 241</span><br><span class="mb-muted">Dinilai hasan oleh Syaikh Al-Albani.</span></p>
  </div>
</div></div></div>`,
  readme: `# DalilDialog

A bottom sheet that shows the full dalil for a task: Arabic, Indonesian translation and the citation with its grading — in full, scrollable, never truncated.

- Surface \`popover\` over \`scrim\`, top corners \`radius-3xl\`, \`shadow-sheet\`, max-height 85% of the viewport, body scrolls.
- Head: eyebrow "Dalil · Akhirat", template name in \`h1\` (Lora), ghost close button with \`aria-label="Tutup"\`.
- Arabic in \`arabic-lg\` with \`dir="rtl" lang="ar"\`. Translation in \`body\`, quoted, verbatim from the DB \`dalil\` field.
- Citation line: the source in \`reward-ink\` (the light-ground twin of \`reward\`), grading beneath in \`muted-foreground\`.
- Never style hadith text as display type, never gradient, never italic-serif decoration. No Lora on the hadith itself.
- Motion: 200ms fade + 8px rise; none under reduced motion. Focus is trapped; Escape and the scrim close it.
- Preview content is sample text for layout; production strings come verbatim from the \`templates.dalil\` column.
`,
};

C.DatePanel = {
  h: 260, group: 'Beranda',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">
<header style="display:flex;flex-direction:column;gap:4px"><h1 class="mb-display">Assalamu'alaikum, Jessica</h1><p class="mb-small mb-muted" style="margin:0">Ayo mulai hari dengan berdoa.</p></header>
${datePanel()}
</div></div>`,
  readme: `# DatePanel

The "Rencana hari ini" panel head: Masehi and Hijriah dates side by side at equal weight, with the next prayer beneath. On Beranda the two TaskCards sit inside it.

- Surface \`secondary\`, text \`secondary-foreground\`, \`radius-3xl\`, 20px padding, 12px gap.
- Two date columns split by a hairline: day numeral in Lora 40px, month + year in Lora 17px, a caption line ("Sabtu · Masehi" / "Hijriah"). Hijriah is right-aligned, same size — neither calendar is a footnote.
- Hijri date from \`Intl\` \`islamic-umalqura\` (\`src/lib/hijri.ts\`). Month names in Indonesian transliteration: Muharram, Safar, Rabiul Awal …
- Prayer row: \`sunset\` icon, "Sholat berikutnya", name + time in tabular numerals.
- The serif greeting ("Assalamu'alaikum, {nama}") sits above the page, in \`display\`, with a \`small\` \`muted-foreground\` line beneath.
`,
};

C.WeekStrip = {
  h: 150, group: 'Jurnal',
  body: `<div class="mb mb-pv"><div class="mb-pv-col"><h2 class="mb-h2">Juli · Muharram–Safar</h2>${week}</div></div>`,
  readme: `# WeekStrip

Seven days, Senin to Ahad, each showing its Masehi number in a 40px circle and its Hijriah day beneath in \`caption\`.

- **Today**: \`accent\` circle, \`accent-foreground\` numeral, \`aria-current="date"\`.
- **Selected** (the day being planned — usually tomorrow for "Rencana esok hari"): 2px \`primary\` ring inside the circle and a \`primary\` day name. Today and selected can coincide.
- Hover: \`muted\` fill. Focus: 2px \`ring\` outline.
- Days are \`role="tab"\` buttons in a \`tablist\`; swipe or arrow keys move a week.
- Month header lists both calendars when the week spans two hijri months ("Juli · Muharram–Safar").
`,
};

C.AllTasksList = {
  h: 330, group: 'Beranda',
  body: `<div class="mb mb-pv"><div class="mb-pv-col"><h2 class="mb-h2">Semua task hari ini</h2>${allTasks}</div></div>`,
  readme: `# AllTasksList

"Semua task hari ini": every task for the day, time-ordered, with a status chip and a check button so the user can mark a skipped or missed task as done later.

- \`card\` list with 1px \`border\` dividers, rows 12px × 16px: time (tabular, \`muted-foreground\`) · name + category · status chip + check.
- Status chips: **Selesai** on \`secondary\`; **Belum** and **Dilewati** share the same neutral \`muted\` chip — only the word differs. Never red, never strikethrough, never a warning icon.
- Check button: 28px circle, 1px \`input\` border; checked = \`primary\` fill with a white check. Tapping a checked row sets status back to \`pending\`.
- Late-checking is allowed for any past row; no "terlambat" labels.
`,
};

C.DuaCard = {
  h: 330, group: 'Beranda',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">${duaCard(false)}</div></div>`,
  readme: `# DuaCard

The dua recommendation for the current time of day: Arabic, transliteration, meaning and source, all verbatim.

- \`card\` surface, 1px \`border\`, \`radius-xl\`, 16px padding.
- Eyebrow "Rekomendasi doa hari ini" in \`muted-foreground\`.
- Arabic: \`arabic-lg\` (full view) or \`arabic-md\` (Beranda compact), \`dir="rtl" lang="ar"\`, right-aligned.
- Transliteration: \`small\`, italic, \`muted-foreground\`, \`lang="ar-Latn"\`. Meaning: \`body\`.
- Source (Qur'an or hadith reference) in \`muted-foreground\` at the foot. \`reward\` is NOT used here — it belongs to the Akhirat card's hadith fragment only.
- "Doa lain" ghost button refreshes \`GET /api/duas/current\`.
`,
};

C.StoryCard = {
  h: 250, group: 'Profil',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">${story}</div></div>`,
  readme: `# StoryCard

"Cerita hari ini" — a calm, paper-like journal field, one entry per day (upsert via \`/api/notes/today\`).

- \`card\` surface with 1px \`border\`; the whole card takes the \`ring\` border on focus-within.
- Textarea set in Lora 15px on 28px ruled lines (a 1px \`border\` rule every line) — the one place serif carries running text, because it is the user's own writing, not UI.
- Placeholder is an invitation: "Apa yang kamu syukuri hari ini?" Never a prompt that implies a missed day.
- Footer: "Tersimpan otomatis" and the dual date.
`,
};

C.ActivityFeed = {
  h: 210, group: 'Profil',
  body: `<div class="mb mb-pv"><div class="mb-pv-col"><h2 class="mb-h2">Riwayat ibadah</h2>${feed}</div></div>`,
  readme: `# ActivityFeed

"Riwayat ibadah" on Profil: completion events, newest first, as a quiet timeline.

- Row: time in Geist Mono 12px \`muted-foreground\` · 7px dot · sentence. Done = \`primary\` dot; skipped = hollow dot with the sentence in \`muted-foreground\`.
- Sentences are past-tense and personal: "Sudah sholat Dzuhur", "Baca Al-Qur'an dilewati dulu". No counts, streaks or percentages.
- Group by day with a dual-calendar day header when the feed spans days.
`,
};

C.JournalTemplates = {
  h: 440, group: 'Jurnal',
  body: `<div class="mb mb-pv"><div class="mb-pv-col" style="max-width:420px">
<h2 class="mb-h2">Rencana esok hari</h2>
${plan}
<h2 class="mb-h2">Journal harian</h2>
${templates}
</div></div>`,
  readme: `# JournalTemplates

Two Jurnal blocks: the "Rencana esok hari" planner tiles and the horizontally scrolling "Journal harian" template cards.

- **Planner tiles**: two light \`card\` tiles side by side, Akhirat and Dunia, each with an eyebrow and the scheduled items. The Akhirat tile stays light — \`card-inverse\` belongs to the Beranda task card only. Only Dunia has "Tambah" (users cannot create custom Akhirat todos).
- **Template card**: 148px wide, \`radius-xl\`, 1px \`border\`, 32px icon chip on \`secondary\`, \`title\` + one-line \`small\` description. Scroll-snaps; the third card peeks to signal more.
- Template names are i18n keys (\`SystemTemplates.*\`); descriptions come from messages files in all three locales.
`,
};

C.QuickAdd = {
  h: 640, group: 'Jurnal',
  body: `<div class="mb" style="height:640px;display:flex;flex-direction:column"><div class="mb-scrim" style="flex:1;padding-top:24px">
<form class="mb-sheet" role="dialog" aria-modal="true" aria-labelledby="qa" onsubmit="event.preventDefault()">
  <div class="mb-grab"></div>
  <div class="mb-sheet-head"><h2 class="mb-h1" id="qa">Tambah todo dunia</h2><button type="button" class="mb-btn mb-btn-ghost icon" aria-label="Tutup"><i data-i="x"></i></button></div>
  <div class="mb-sheet-body">
    <div class="mb-field"><label class="mb-label" for="qa-t">Judul</label><input class="mb-input" id="qa-t" value="Olahraga 30 menit"></div>
    <div class="mb-field"><label class="mb-label" for="qa-w">Waktu <span class="mb-muted">(opsional)</span></label><input class="mb-input" id="qa-w" type="time" value="16:30"></div>
    <div class="mb-field"><span class="mb-label" id="rp">Ulangi</span>
      <div class="mb-seg full" role="tablist" aria-labelledby="rp"><button type="button" role="tab" aria-selected="false">Setiap hari</button><button type="button" role="tab" aria-selected="true">Hari tertentu</button></div>
      <div class="mb-dow" aria-label="Pilih hari">${['S', 'S', 'R', 'K', 'J', 'S', 'A'].map((d, i) => `<button type="button" aria-pressed="${[0, 2, 4].includes(i)}" aria-label="${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'][i]}">${d}</button>`).join('')}</div>
      <span class="mb-help">Senin, Rabu, Jumat</span></div>
  </div>
  <div class="mb-sheet-foot"><button type="button" class="mb-btn mb-btn-outline lg">Batal</button><button class="mb-btn mb-btn-primary lg">Simpan</button></div>
</form></div></div>`,
  readme: `# QuickAdd

The bottom sheet opened by the + FAB to add a Dunia todo, with the recurrence picker inside it. Akhirat items are never created here — they come from system templates.

- Fields: Judul (required), Waktu (optional \`time\` input), Ulangi.
- **Recurrence picker**: a full-width segmented control (Setiap hari / Hari tertentu); "Hari tertentu" reveals seven 36px day toggles (S S R K J S A), pressed = \`primary\` fill. A helper line spells out the selection ("Senin, Rabu, Jumat").
- Footer: outline "Batal" + primary "Simpan", both 40px.
- Validation: only an empty title errors — \`aria-invalid\`, \`destructive\` border and a one-line message ("Judulnya diisi dulu, ya.").
`,
};

C.Navigation = {
  h: 250, group: 'Shell',
  body: `<div class="mb mb-pv" style="gap:24px">
<div class="mb-pv-col" style="gap:0;border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden">
  <div class="mb-top" style="position:static"><button class="mb-btn mb-btn-ghost icon" aria-label="Kembali" style="margin-left:-8px"><i data-i="arrow-left"></i></button><span class="ttl">Pilih template</span></div>
  <div style="height:40px;background:var(--background)"></div>
  ${nav('beranda')}
</div>
<div class="mb-pv-col" style="gap:0;border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden">${nav('jurnal')}</div>
</div>`,
  readme: `# Navigation

The app shell: a thin sticky top bar and a three-tab bottom nav (Beranda / Jurnal / Profil), both safe-area aware.

- **Top bar**: 48px, sticky at \`top: env(safe-area-inset-top)\`, \`background\` at 94% with a 1px \`border\` bottom. Title only (\`title\` style); a ghost back arrow appears only on Jurnal's picker sub-views.
- **Bottom nav**: sticky bottom, \`card\` at 95% + 8px backdrop blur, 1px \`border\` top, bottom padding \`env(safe-area-inset-bottom)\`. Icons \`house\`, \`notebook-pen\`, \`user\` at 20px.
- Active tab: \`primary\` label + icon at stroke 2.4, \`aria-current="page"\`. Inactive: \`muted-foreground\` at stroke 1.8. No pill indicator, no badge dots.
- Use next-intl's \`Link\` from \`i18n/routing\`, never \`next/link\`.
`,
};

C.FormControls = {
  h: 470, group: 'Primitives',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">
<div class="mb-field"><label class="mb-label" for="f1">Nama</label><input class="mb-input" id="f1" placeholder="Nama panggilan"></div>
<div class="mb-pv-row"><input class="mb-input is-hover" style="flex:1" value="Hover" aria-label="hover"><input class="mb-input is-focus" style="flex:1" value="Focus" aria-label="focus"></div>
<div class="mb-pv-row"><input class="mb-input" style="flex:1" value="Disabled" disabled aria-label="disabled"><div class="mb-field" style="flex:1"><input class="mb-input" aria-invalid="true" value="" aria-label="error"></div></div>
<span class="mb-error">Judulnya diisi dulu, ya.</span>
<div class="mb-field"><label class="mb-label" for="f2">Catatan</label><textarea class="mb-textarea" id="f2" placeholder="Tulis pelan-pelan…"></textarea><span class="mb-help">Hanya kamu yang bisa membaca ini.</span></div>
<div class="mb-pv-row"><span class="mb-badge">Sunnah</span><span class="mb-badge primary">Wajib</span><span class="mb-badge outline">Harian</span><span class="mb-chip done">Selesai</span><span class="mb-chip">Belum</span><span class="mb-chip">Dilewati</span></div>
</div></div>`,
  readme: `# FormControls

Input, Textarea, Label, Badge, status Chip and helper/error text — the shadcn primitives restyled to the system.

- **Input**: 40px, \`radius-lg\`, 1px \`input\` border (≥3:1), \`card\` fill. Hover darkens the border; focus-visible = 2px \`ring\` outline + \`ring\` border; disabled 50%; invalid = \`destructive\` border + \`mb-error\` line.
- **Textarea**: same skin, min 88px, vertical resize.
- **Label**: \`label\` style, always visible above the field — never placeholder-as-label.
- **Badge** (\`radius-sm\`, 20px): \`secondary\` default, \`primary\` for Wajib, \`outline\`. **Chip** (\`radius-full\`, 22px): statuses. Dilewati and Belum share the neutral \`muted\` chip.
- Error copy is gentle and specific: "Judulnya diisi dulu, ya." Never "Error!" or "Invalid".
- Base UI, not Radix: compose with \`render={<El/>}\`, not \`asChild\`.
`,
};

C.TabsMenu = {
  h: 300, group: 'Primitives',
  body: `<div class="mb mb-pv"><div class="mb-pv-row" style="align-items:flex-start;gap:24px">
<div style="display:flex;flex-direction:column;gap:12px;min-width:260px">
  <div class="mb-seg" role="tablist"><button role="tab" aria-selected="true">Akhirat</button><button role="tab" aria-selected="false">Dunia</button></div>
  <hr class="mb-sep">
  <p class="mb-small mb-muted" style="margin:0">Tabs switch views in place; the selected tab lifts onto <code>card</code>.</p>
</div>
<div class="mb-menu" role="menu">
  <div class="mb-menu-label">Task</div>
  <div class="mb-menu-item" role="menuitem"><i data-i="book-open" class="sm"></i>Lihat dalil</div>
  <div class="mb-menu-item is-hover" role="menuitem"><i data-i="clock" class="sm"></i>Ubah waktu</div>
  <div class="mb-menu-item" role="menuitem"><i data-i="rotate-ccw" class="sm"></i>Tandai belum</div>
  <hr class="mb-sep" style="margin:4px 0">
  <div class="mb-menu-item" role="menuitem"><i data-i="minus" class="sm"></i>Nonaktifkan<span class="k">Dunia</span></div>
</div>
</div></div>`,
  readme: `# TabsMenu

Tabs (a segmented control on \`muted\`) and the dropdown menu, plus the separator.

- **Tabs**: track \`muted\`, 3px inset; triggers 30px, \`radius-md\`; selected trigger lifts onto \`card\` with a 1px \`border\` ring. No underline animation.
- **Dropdown menu**: \`popover\` with 1px \`border\`, \`radius-xl\`, \`shadow-sheet\` (it floats). Items 34px, hover \`muted\`. Group labels use \`eyebrow\`. "Nonaktifkan" deactivates a Dunia todo — it is not styled destructive because it is reversible.
- **Separator**: 1px \`border\`.
`,
};

C.Settings = {
  h: 270, group: 'Profil',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">
<div class="mb-field"><span class="mb-label">Tema</span>
  <div class="mb-seg full" role="radiogroup" aria-label="Gender"><button aria-pressed="true">Ikhwan</button><button aria-pressed="false">Akhwat</button></div>
  <div class="mb-seg full" role="radiogroup" aria-label="Mode"><button aria-pressed="true"><i data-i="sun" class="sm"></i>Terang</button><button aria-pressed="false"><i data-i="moon" class="sm"></i>Gelap</button></div></div>
<div class="mb-field"><span class="mb-label" style="display:inline-flex;gap:6px;align-items:center"><i data-i="languages" class="sm"></i>Bahasa</span>
  <div class="mb-seg full" role="radiogroup" aria-label="Bahasa"><button aria-pressed="true">ID</button><button aria-pressed="false">EN</button><button aria-pressed="false">MS</button></div></div>
</div></div>`,
  readme: `# Settings

Theme switcher (Ikhwan / Akhwat × Terang / Gelap) and language switcher (ID / EN / MS) on Profil, as full-width segmented controls.

- Two independent segments for theme: gender sets \`html[data-gender]\`, mode toggles \`.dark\`. Persist to localStorage (\`mb.gender\`, \`mb.mode\`) and the profile.
- Language segment switches the next-intl locale via the locale-aware router; labels are the codes, with \`lang\` attributes on each option.
- Changing theme swaps tokens instantly — no transition on colour change (avoids a flash of mixed palettes).
`,
};

C.States = {
  h: 470, group: 'Feedback',
  body: `<div class="mb mb-pv"><div class="mb-pv-col">
<div class="mb-empty"><span class="ic"><i data-i="check" class="lg"></i></span><p class="mb-title">Alhamdulillah, semua sudah untuk saat ini.</p><p class="mb-small mb-muted">Task berikutnya muncul menjelang Maghrib, 17:55.</p></div>
<div class="mb-card" style="display:flex;flex-direction:column;gap:10px" aria-busy="true" aria-label="Memuat"><div class="mb-skel" style="width:40%;height:12px"></div><div class="mb-skel" style="width:85%;height:20px"></div><div class="mb-skel" style="width:70%;height:12px"></div><div style="display:flex;gap:8px"><div class="mb-skel" style="width:112px;height:32px;border-radius:var(--radius-full)"></div><div class="mb-skel" style="width:96px;height:32px;border-radius:var(--radius-full)"></div></div></div>
<div class="mb-note" role="status"><i data-i="cloud-off" class="ic"></i><div style="display:flex;flex-direction:column;gap:8px;flex:1"><span>Jadwal sholat belum bisa dimuat. Sementara kami pakai waktu perkiraan.</span><button class="mb-btn mb-btn-outline" style="align-self:flex-start"><i data-i="refresh-cw" class="sm"></i>Coba lagi</button></div></div>
</div></div>`,
  readme: `# States

Empty, loading and error states — all calm.

- **Empty** ("all tasks done for now"): dashed \`border\` on \`card\`, a 40px \`secondary\` circle with a check, a grateful line and when the next task arrives. No confetti, no trophy, no streak count.
- **Loading**: skeleton blocks on \`muted\` shaped like the real card (eyebrow, headline, summary, two pills), a slow 1.6s opacity breathe that stops under reduced motion.
- **Error**: a \`muted\` note with a \`cloud-off\` icon, what happened in plain words, what the app is doing meanwhile (fallback prayer times), and an outline "Coba lagi". Never red for network or server errors; \`destructive\` is for validation only.
`,
};

// ── screens ──────────────────────────────────────────────
const themes = ['ikhwan-light', 'ikhwan-dark', 'akhwat-light', 'akhwat-dark'];
const themeNames = { 'ikhwan-light': 'Ikhwan · Terang', 'ikhwan-dark': 'Ikhwan · Gelap', 'akhwat-light': 'Akhwat · Terang', 'akhwat-dark': 'Akhwat · Gelap' };

C.ScreenBeranda = {
  h: 1280, width: 1720, group: 'Screens', page: true, css: phoneCss + `.wall{display:flex;gap:24px;padding:24px;align-items:flex-start}.cap{font:600 11px/14px var(--font-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted-foreground);margin:0 0 8px}`,
  body: `<div class="mb wall">
${themes.map(t => `<div data-theme="${t}" class="mb" style="background:transparent"><p class="cap">${themeNames[t]}</p><div class="mb-phone">${berandaBody}</div></div>`).join('\n')}
</div>`,
};

C.ScreenJurnal = {
  h: 1000, width: 440, group: 'Screens', page: true, css: phoneCss + '.wall{padding:24px}',
  body: `<div class="mb wall"><div class="mb-phone"><div class="mb-phone-scroll">
  <header style="display:flex;flex-direction:column;gap:4px"><h1 class="mb-display">Journal</h1><p class="mb-small mb-muted" style="margin:0">“Mengingat-ingat anugerah Allah membuahkan kecintaan kepada Allah.”</p></header>
  <section class="mb-sect"><h2 class="mb-h2">Juli · Muharram–Safar</h2>${week}</section>
  <section class="mb-sect"><div class="mb-sect-head"><h2 class="mb-h2">Rencana esok hari</h2><span class="mb-caption mb-muted">Ahad, 27 Juli · 2 Safar</span></div>${plan}</section>
  <section class="mb-sect"><h2 class="mb-h2">Journal harian</h2>${templates}</section>
</div>${nav('jurnal')}</div></div>`,
};

C.ScreenProfil = {
  h: 1100, width: 440, group: 'Screens', page: true, css: phoneCss + '.wall{padding:24px}',
  body: `<div class="mb wall"><div class="mb-phone"><div class="mb-phone-scroll">
  <h1 class="mb-display">Profil</h1>
  <div style="display:flex;gap:16px;align-items:center"><div class="mb-avatar">J<span class="cam"><i data-i="camera" class="sm"></i></span></div><div><p class="mb-h2" style="font-family:var(--font-serif)">Jessica Pribadi</p><p class="mb-small mb-muted" style="margin:0">Jakarta · Tamu</p></div></div>
  <div class="mb-note"><i data-i="user" class="ic"></i><div style="display:flex;flex-direction:column;gap:8px;flex:1"><span>Simpan catatanmu dengan email, supaya tetap ada di perangkat lain.</span><button class="mb-btn mb-btn-primary" style="align-self:flex-start">Buat akun</button></div></div>
  ${story}
  <section class="mb-sect"><h2 class="mb-h2">Aktivitasku</h2><div class="mb-card"><p class="mb-title" style="margin-bottom:4px">Riwayat ibadahku</p>${feed}</div></section>
  <section class="mb-sect"><h2 class="mb-h2">Pengaturan</h2>
    <div class="mb-seg full"><button aria-pressed="true">Ikhwan</button><button aria-pressed="false">Akhwat</button></div>
    <div class="mb-seg full"><button aria-pressed="true"><i data-i="sun" class="sm"></i>Terang</button><button aria-pressed="false"><i data-i="moon" class="sm"></i>Gelap</button></div>
    <div class="mb-seg full"><button aria-pressed="true">ID</button><button aria-pressed="false">EN</button><button aria-pressed="false">MS</button></div>
  </section>
</div>${nav('profil')}</div></div>`,
};

for (const [name, c] of Object.entries(C)) {
  const attrs = [`group="${c.group}"`, `height=${c.h}`];
  if (c.width) attrs.push(`width=${c.width}`);
  if (c.page) attrs.push('page');
  out(`components/${name}/preview.html`, doc(`<!-- @dsCard ${attrs.join(' ')} -->`, name, c.body, c.css || ''));
  if (c.readme) out(`components/${name}/README.md`, c.readme);
}
console.log(Object.keys(C).length, 'components');
