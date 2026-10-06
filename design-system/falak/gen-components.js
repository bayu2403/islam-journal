const fs = require('fs');
const path = require('path');
const out = (p, s) => { const f = path.join('project', p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

const doc = (marker, title, body, script = '', css = '') => `${marker}
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>${title}</title>${css ? `<style>${css}</style>` : ''}</head>
<body>
${body}
<script>
Falak.boot();
${script}
</script>
</body>
</html>
`;

// ── orbit geometry: prayer times mapped onto a 180° arc ──
const P = [['Subuh', '04:42'], ['Dzuhur', '12:00'], ['Ashar', '15:21'], ['Maghrib', '17:55'], ['Isya', '19:08']];
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const start = mins('04:42'), end = mins('19:08'), now = mins('14:05');
const CX = 170, CY = 176, R = 150;
const pt = (f, r = R) => { const a = Math.PI * (1 - f); return [+(CX + r * Math.cos(a)).toFixed(1), +(CY - r * Math.sin(a)).toFixed(1)]; };
const fNow = (now - start) / (end - start);
const [sx, sy] = pt(fNow);
const orbitSvg = `<svg class="arc" viewBox="0 0 340 206" role="img" aria-label="Posisi matahari: 14:05, antara Dzuhur dan Ashar">
  <line class="horizon" x1="0" y1="${CY}" x2="340" y2="${CY}"/>
  <path class="track" d="M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}"/>
  <path class="prog" pathLength="100" stroke-dasharray="100" d="M${CX - R} ${CY} A${R} ${R} 0 0 1 ${sx} ${sy}"/>
  ${P.map(([n, t]) => {
    const f = (mins(t) - start) / (end - start);
    const [x, y] = pt(f);
    const cls = mins(t) <= now ? 'past' : n === 'Ashar' ? 'next' : '';
    const [lx, ly] = f === 0 || f === 1 ? [x, CY + 20] : pt(f, R + 16);
    return `<circle class="node ${cls}" cx="${x}" cy="${y}" r="${cls === 'next' ? 6 : 5}"/><text class="lbl ${cls}" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
  }).join('\n  ')}
  <circle class="bloom" cx="${sx}" cy="${sy}" r="12"/>
  <circle class="sun" cx="${sx}" cy="${sy}" r="7"/>
</svg>`;

const orbit = (id = 'cd') => `<section class="fk-orbit fk-glass fk-enter" style="--i:1;border-radius:var(--radius-xl);padding:18px" aria-label="Waktu sholat hari ini">
  <div class="fk-orbit-dates">
    <div><span class="fk-hud fk-muted">Masehi</span><span class="v">Sab, 26 Juli 2025</span></div>
    <div><span class="fk-hud fk-muted">Hijriah</span><span class="v">1 Safar 1447</span></div>
  </div>
  <div style="position:relative">
    ${orbitSvg}
    <div class="fk-count"><span class="fk-hud fk-muted">Menuju Ashar · 15:21</span><span class="t" id="${id}">01:16:00</span></div>
  </div>
</section>`;

// ── fragments ──
const akhirat = (t = { title: 'Sholat Ashar berjamaah.', time: 'Ashar · 15:21' }) => `<article class="fk-task fk-holo" aria-label="Task akhirat berikutnya" tabindex="0">
  <i data-khatam></i>
  <div class="fk-task-top">
    <span class="fk-hud"><span class="fk-tag"><i data-i="landmark" class="sm"></i></span>Akhirat</span>
    <span class="fk-hud">${t.time}</span>
  </div>
  <h3 class="fk-h3">${t.title}</h3>
  <p class="fk-task-sum">Jaga takbir pertama 40 hari, dicatat <b>2 pembebasan: dari neraka &amp; dari kemunafikan.</b> <span class="fk-src">HR. Tirmidzi no. 241</span></p>
  <div class="fk-task-actions">
    <button class="fk-pill fk-pill-done" data-act="done"><i data-i="check" class="sm"></i>Dikerjakan</button>
    <button class="fk-pill fk-pill-skip" data-act="skip">Lewati dulu</button>
    <button class="fk-link">Dalil<i data-i="arrow-right" class="sm"></i></button>
  </div>
</article>`;

const dunia = (t = { title: 'Olahraga 30 menit.', time: '16:30', sum: 'Badan bugar, mood naik — energi buat ibadah pun ikut penuh.' }) => `<article class="fk-task fk-dunia" aria-label="Task dunia berikutnya" tabindex="0">
  <div class="fk-task-top">
    <span class="fk-hud"><span class="fk-tag"><i data-i="activity" class="sm"></i></span>Dunia</span>
    ${t.time ? `<span class="fk-hud">${t.time}</span>` : ''}
  </div>
  <h3 class="fk-h3">${t.title}</h3>
  <p class="fk-task-sum">${t.sum}</p>
  <div class="fk-task-actions">
    <button class="fk-pill fk-pill-done" data-act="done"><i data-i="check" class="sm"></i>Dikerjakan</button>
    <button class="fk-pill fk-pill-skip" data-act="skip">Lewati dulu</button>
  </div>
</article>`;

const dua = (compact) => `<article class="fk-dua fk-glass" aria-label="Rekomendasi doa">
  <div class="fk-sect-head"><span class="fk-hud fk-muted">Doa · waktu siang</span>${compact ? '' : '<button class="fk-btn fk-btn-ghost sm"><i data-i="refresh-cw" class="sm"></i>Doa lain</button>'}</div>
  <p class="fk-arabic ${compact ? 'md' : ''}" dir="rtl" lang="ar">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
  ${compact ? '' : '<p class="translit" lang="ar-Latn">Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ‘adhāban-nār.</p>'}
  <p class="meaning">Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.</p>
  <span class="fk-data fk-muted">QS. AL-BAQARAH : 201</span>
</article>`;

const dock = (active) => `<nav class="fk-dock" aria-label="Navigasi utama">
  <a href="#"${active === 'beranda' ? ' aria-current="page"' : ''}><i data-i="orbit"></i>Beranda</a>
  <a href="#"${active === 'jurnal' ? ' aria-current="page"' : ''}><i data-i="notebook-pen"></i>Jurnal</a>
  <a href="#"${active === 'profil' ? ' aria-current="page"' : ''}><i data-i="user"></i>Profil</a>
</nav>`;

const week = `<div class="fk-week" role="tablist" aria-label="Minggu ini">
  ${[['Sen', 21, 26], ['Sel', 22, 27], ['Rab', 23, 28], ['Kam', 24, 29], ['Jum', 25, 30], ['Sab', 26, 1, 'today'], ['Ahd', 27, 2, 'sel']]
    .map(([d, n, h, s]) => `<button class="fk-orb ${s === 'today' ? 'today' : ''}" role="tab" aria-selected="${s === 'sel'}"${s === 'today' ? ' aria-current="date"' : ''}><span class="dn">${d}</span><span class="c">${n}</span><span class="h">${h}</span></button>`).join('\n  ')}
</div>`;

const rows = [
  ['04:42', 'Sholat Subuh', 'Akhirat', 'done'], ['07:00', "Tilawah 1 halaman", 'Akhirat', 'skip'], ['12:00', 'Sholat Dzuhur', 'Akhirat', 'done'],
  ['15:21', 'Sholat Ashar', 'Akhirat', 'live'], ['16:30', 'Olahraga 30 menit', 'Dunia', 'pend'],
];
const allTasks = `<ul class="fk-list fk-glass" style="padding:4px" aria-label="Semua task hari ini">
  ${rows.map(([t, n, c, s], i) => `<li class="fk-row fk-enter" style="--i:${i}"><span class="t">${t}</span><span><span class="name">${n}</span><span class="sub">${c}</span></span><span class="end"><span class="fk-chip ${s === 'done' ? 'done' : s === 'live' ? 'live' : ''}">${s === 'done' ? 'Selesai' : s === 'skip' ? 'Dilewati' : s === 'live' ? 'Berikutnya' : 'Belum'}</span><button class="fk-check ${s === 'done' ? 'on' : ''}" aria-label="${s === 'done' ? 'Batalkan tanda selesai' : 'Tandai sudah dikerjakan'}">${s === 'done' ? '<i data-i="check" class="sm"></i>' : ''}</button></span></li>`).join('\n  ')}
</ul>`;

const feed = `<ul class="fk-feed" aria-label="Riwayat ibadah">
  <li class="fk-enter" style="--i:0"><span class="t">14:00</span><span class="dot"></span><span class="x">Sudah sholat Dzuhur</span></li>
  <li class="fk-enter" style="--i:1"><span class="t">09:12</span><span class="dot skip"></span><span class="x fk-muted">Tilawah dilewati dulu</span></li>
  <li class="fk-enter" style="--i:2"><span class="t">04:58</span><span class="dot"></span><span class="x">Sudah dzikir pagi</span></li>
  <li class="fk-enter" style="--i:3"><span class="t">04:45</span><span class="dot"></span><span class="x">Sudah sholat Subuh</span></li>
</ul>`;

const story = `<section class="fk-story fk-glass" aria-label="Cerita hari ini">
  <label class="fk-hud fk-muted" for="story"><i data-i="pen-line" class="sm"></i>Cerita hari ini</label>
  <textarea id="story" placeholder="Apa yang kamu syukuri hari ini?">Alhamdulillah, sempat ikut kajian ba'da Maghrib. Pelan-pelan saja.</textarea>
  <div class="foot"><span class="fk-data fk-muted fk-saved">Tersimpan</span><span class="fk-data fk-muted">26.07 · 01 SAFAR</span></div>
</section>`;

const templates = `<div class="fk-tpl-row">
  <a class="fk-tpl fk-glass fk-enter" style="--i:0" href="#"><span class="ic"><i data-i="book-open"></i></span><span class="n fk-data fk-muted">12</span><span><p class="fk-title">Catatan ilmu</p><p class="fk-small fk-muted">Faedah kajian hari ini</p></span></a>
  <a class="fk-tpl fk-glass fk-enter" style="--i:1" href="#"><span class="ic"><i data-i="leaf"></i></span><span class="n fk-data fk-muted">4</span><span><p class="fk-title">Journal kesehatan</p><p class="fk-small fk-muted">Tidur, makan, gerak</p></span></a>
  <a class="fk-tpl fk-glass fk-enter" style="--i:2" href="#"><span class="ic"><i data-i="hand-heart"></i></span><span class="n fk-data fk-muted">7</span><span><p class="fk-title">Penghargaan diri</p><p class="fk-small fk-muted">Satu hal baik tentangmu</p></span></a>
</div>`;

const plan = `<div class="fk-plan">
  <div class="fk-glass fk-enter" style="--i:0"><span class="fk-hud fk-muted"><i data-i="landmark" class="sm"></i>Akhirat</span>
    <ul><li>Solat fardhu 5 waktu</li><li>Tahajud</li><li>Dzikir pagi &amp; petang</li></ul></div>
  <div class="fk-glass fk-enter" style="--i:1"><span class="fk-hud fk-muted"><i data-i="activity" class="sm"></i>Dunia</span>
    <ul><li>Olahraga 30 menit</li><li>Setor laporan</li></ul>
    <button class="fk-link" style="margin-top:auto"><i data-i="plus" class="sm"></i>Tambah</button></div>
</div>`;

const greeting = `<header class="fk-enter" style="--i:0;display:flex;flex-direction:column;gap:8px">
  <span class="fk-hud fk-muted">14:05 · Sabtu</span>
  <h1 class="fk-display">Assalamu'alaikum, <span class="fk-grad">Jessica</span></h1>
</header>`;

const beranda = (cd) => `<div class="fk-phone-scroll">
  ${greeting}
  ${orbit(cd)}
  <section class="fk-sect fk-enter" style="--i:2">
    <div class="fk-sect-head"><h2 class="fk-h2">Berikutnya</h2><a class="fk-link" href="#">Semua task<i data-i="arrow-right" class="sm"></i></a></div>
    ${akhirat()}
    ${dunia()}
  </section>
  <div class="fk-enter" style="--i:3">${dua(true)}</div>
</div>
<button class="fk-fab" aria-label="Tambah todo dunia"><i data-i="plus"></i></button>
${dock('beranda')}`;

// ── components ──
const C = {};

C.Button = {
  h: 360, group: 'Actions',
  body: `<div class="fk fk-ground fk-pv">
${['primary', 'glass', 'outline', 'ghost'].map(v => `<div class="fk-pv-row"><span class="fk-pv-cap">${v}</span>
  <button class="fk-btn fk-btn-${v}">Simpan</button>
  <button class="fk-btn fk-btn-${v} is-hover">Hover</button>
  <button class="fk-btn fk-btn-${v} is-active">Pressed</button>
  <button class="fk-btn fk-btn-${v} is-focus">Focus</button>
  <button class="fk-btn fk-btn-${v}" disabled>Disabled</button></div>`).join('\n')}
<div class="fk-pv-row"><span class="fk-pv-cap">fab · icon</span><button class="fk-fab" aria-label="Tambah"><i data-i="plus"></i></button><button class="fk-btn fk-btn-glass icon" aria-label="Kembali"><i data-i="arrow-left"></i></button><span class="fk-small fk-muted">Hover the FAB: it turns 90°. Press anything: ripple.</span></div>
</div>`,
  readme: `# Button

Four variants that move: \`primary\` (solid \`primary\`, a light sweep crosses it on hover and it lifts 1px into \`shadow-glow\`), \`glass\` (\`glass\` + \`blur-glass\`, for actions sitting on the atmosphere), \`outline\` (1px \`input\`), \`ghost\`.

- 40px tall (32px \`sm\`), \`radius-md\`, label 13px/550 Onest.
- Press: scale 0.96 in \`duration-instant\`, release on \`ease-spring\`; a ripple in \`currentColor\` spreads from the pointer (\`Falak\` bundle adds it automatically).
- Focus-visible: 2px solid \`ring\` + 6px \`glow\` halo. Disabled: 40% opacity, desaturated.
- **FAB**: 56px \`primary\` orb with \`shadow-glow\` and a breathing halo ring; rotates 90° on hover. One per screen, bottom-right above the dock.
- One \`primary\` per view. Labels are verbs: Simpan, Tambah, Coba lagi.
`,
};

C.TaskActions = {
  h: 300, group: 'Actions',
  body: `<div class="fk fk-ground fk-pv">
<div class="fk-pv-row"><span class="fk-pv-cap">rest</span><button class="fk-pill fk-pill-done"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip">Lewati dulu</button></div>
<div class="fk-pv-row"><span class="fk-pv-cap">hover</span><button class="fk-pill fk-pill-done is-hover"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip is-hover">Lewati dulu</button></div>
<div class="fk-pv-row"><span class="fk-pv-cap">pressed</span><button class="fk-pill fk-pill-done is-active"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip is-active">Lewati dulu</button></div>
<div class="fk-pv-row"><span class="fk-pv-cap">focus</span><button class="fk-pill fk-pill-done is-focus"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip is-focus">Lewati dulu</button></div>
<div class="fk-pv-row"><span class="fk-pv-cap">disabled</span><button class="fk-pill fk-pill-done" disabled><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip" disabled>Lewati dulu</button></div>
<div class="fk-pv-row"><span class="fk-pv-cap">tap me</span><button class="fk-pill fk-pill-done" id="demo"><i data-i="check" class="sm"></i>Dikerjakan</button><span class="fk-small fk-muted">Check draws itself, a light sweep passes.</span></div>
</div>`,
  script: `var d=document.getElementById('demo');d.addEventListener('click',function(){d.classList.remove('is-done');void d.offsetWidth;d.classList.add('is-done');});`,
  readme: `# TaskActions

The Dikerjakan / Lewati pill pair: two equally valid answers with identical size (38px, 18px padding, \`radius-full\`, 13px/550) and identical motion weight.

- **Dikerjakan**: \`accent\` fill, \`accent-foreground\` label. On tap the check path draws itself (\`duration-base\`) and a light sweep crosses the pill (\`duration-slow\`), then the card exits upward.
- **Lewati dulu**: 1px \`input\` border (\`card-inverse-muted\` on the holo card). On tap the card exits sideways — same duration, same easing. No red, no shake, no "gagal".
- Both lift 1px on hover and ripple on press. Pills stop propagation so the card's dalil sheet doesn't open.
- Never add counters, streak flames, confetti or sounds to completion. The sweep is the whole celebration.
`,
};

C.TaskCard = {
  h: 560, group: 'Beranda',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">
<div id="a"></div>
<div id="d"></div>
</div></div>`,
  script: `
var A=[{title:'Sholat Ashar berjamaah.',time:'Ashar · 15:21'},{title:'Dzikir petang.',time:'Setelah Ashar'},{title:'Sholat Maghrib.',time:'Maghrib · 17:55'}];
var D=[{title:'Olahraga 30 menit.',time:'16:30',sum:'Badan bugar, mood naik — energi buat ibadah pun ikut penuh.'},{title:'Setor laporan mingguan.',time:'',sum:'Selesaikan sebelum Maghrib, biar malam lebih tenang.'}];
var AK=${JSON.stringify(akhirat())}, DU=${JSON.stringify(dunia())};
function empty(){return '<div class="fk-empty fk-glass" style="border-radius:var(--radius-xl)"><div class="khatam-wrap"><i data-khatam class="k"></i><i data-i="check"></i></div><p class="fk-title">Alhamdulillah, semua sudah.</p><button class="fk-btn fk-btn-glass sm" data-act="reset">Ulangi demo</button></div>';}
Falak.taskDemo(document.getElementById('a'),A,function(t){return t?AK.replace('Sholat Ashar berjamaah.',t.title).replace('Ashar · 15:21',t.time):empty();});
Falak.taskDemo(document.getElementById('d'),D,function(t){return t?DU.replace('Olahraga 30 menit.',t.title).replace('16:30',t.time).replace('Badan bugar, mood naik — energi buat ibadah pun ikut penuh.',t.sum):empty();});`,
  readme: `# TaskCard

The signature: one card per category showing only the NEXT task (ordered by real prayer times). Live preview — tap Dikerjakan or Lewati to watch the queue advance.

**Akhirat — holo card.** \`card-inverse\` surface (the deepest surface in every palette), 1px \`card-inverse-border\`, and a conic **border beam** (\`primary\` → \`accent\`) revolving once per \`duration-beam\`. A \`glow\` bloom sits in the top-right corner behind a slowly rotating khatam (8-point star) in \`primary\` at 22%. Text: \`card-inverse-foreground\` headline, \`card-inverse-muted\` HUD and summary. The hadith source is set in JetBrains Mono in \`reward\` — the only place \`reward\` appears.

**Dunia — glass card.** \`glass\` + \`blur-glass\`, 1px \`border\`, \`accent\`-tinted icon tag, no beam.

**Anatomy** (both, 20px padding, \`radius-xl\`): HUD row (26px tag + uppercase category, time right) → \`h3\` headline → \`small\` summary → pill row.

**Motion**: enters with rise + de-blur (\`fk-enter\`, 70ms stagger); hover lifts 2px (holo adds \`shadow-glow\`); Dikerjakan exits up, Lewati exits sideways, both \`duration-base\` on \`ease-in-quart\`; next card enters. Reduced motion: beam, khatam and transitions stop; content swaps instantly.

Rules: one holo card per screen; tap card → DalilSheet; the summary may clamp to 2 lines, the dalil never does.
`,
};

C.PrayerOrbit = {
  h: 360, group: 'Beranda',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">${orbit('cd')}</div></div>`,
  script: `Falak.countdown(document.getElementById('cd'), 4560);`,
  readme: `# PrayerOrbit

The Beranda hero: the day as the sun's arc. Five prayer nodes sit on a 180° orbit spaced by their real times (Aladhan, KEMENAG method); the sun marks now; a countdown names the next prayer. Masehi and Hijriah sit at equal weight across the top.

- Panel: \`glass\`, \`radius-xl\`, 18px padding.
- Track: dashed 1px \`input\`. Progress arc: 2.5px \`primary\` with a \`glow\` drop-shadow, drawn from 0 on load (\`duration-slow\`, \`ease-out-expo\`).
- Nodes: past = filled \`primary\`; next = \`accent\` ring (6px); future = hollow \`input\`. Labels in HUD mono.
- Sun: \`primary\` dot with a \`glow\` bloom pulsing every 2.4s.
- Countdown: \`countdown\` style (JetBrains Mono 40px, tabular), ticks each second; label "Menuju Ashar · 15:21".
- Dates: HUD labels "Masehi" / "Hijriah", values in Unbounded 15px. Hijri from \`Intl\` \`islamic-umalqura\`.
- The \`svg\` carries an \`aria-label\` with the current time and position; the countdown has \`aria-live="off"\` (screen readers get the label, not every tick).
`,
};

C.DalilSheet = {
  h: 700, group: 'Beranda',
  body: `<div class="fk fk-ground" style="height:700px;display:flex;flex-direction:column"><div class="fk-scrim" style="flex:1;padding-top:40px">
<div class="fk-sheet" role="dialog" aria-modal="true" aria-labelledby="dt">
  <div class="fk-grab"></div>
  <div class="fk-sheet-head"><div style="display:flex;flex-direction:column;gap:8px"><span class="fk-hud fk-muted"><i data-i="landmark" class="sm"></i>Dalil · Akhirat</span><h2 class="fk-h1" id="dt">Sholat Ashar berjamaah</h2></div><button class="fk-btn fk-btn-glass icon" aria-label="Tutup"><i data-i="x"></i></button></div>
  <div class="fk-sheet-body">
    <p class="fk-arabic fk-enter" style="--i:1" dir="rtl" lang="ar">مَنْ صَلَّى لِلَّهِ أَرْبَعِينَ يَوْمًا فِي جَمَاعَةٍ يُدْرِكُ التَّكْبِيرَةَ الأُولَى كُتِبَتْ لَهُ بَرَاءَتَانِ بَرَاءَةٌ مِنَ النَّارِ وَبَرَاءَةٌ مِنَ النِّفَاقِ</p>
    <p class="fk-enter" style="--i:2;margin:0">“Barang siapa shalat karena Allah selama empat puluh hari secara berjamaah dengan mendapatkan takbir pertama, maka dicatat baginya dua pembebasan: pembebasan dari neraka dan pembebasan dari kemunafikan.”</p>
    <div class="fk-cite fk-enter" style="--i:3"><span class="fk-src-ink">HR. Tirmidzi no. 241</span><span class="fk-small fk-muted">Dinilai hasan oleh Syaikh Al-Albani.</span></div>
  </div>
</div></div></div>`,
  readme: `# DalilSheet

Bottom sheet with the full dalil — Arabic, translation, citation — verbatim and scrollable. Opened by tapping a TaskCard.

- \`popover\` sheet, \`radius-2xl\` top, \`shadow-float\`, a 1px \`primary\`→\`accent\` light line along its top edge. Scrim: \`scrim\` + 6px backdrop blur.
- Motion: scrim fades (\`duration-fast\`), sheet rises 40px (\`duration-base\`, \`ease-out-expo\`), then Arabic, translation and citation enter in a 70ms stagger.
- Arabic: \`arabic-lg\` Noto Naskh, \`dir="rtl" lang="ar"\`. Translation: \`body\`, quoted, verbatim from \`templates.dalil\`.
- Citation block on \`muted\`: source in \`reward-ink\` mono, grading in \`muted-foreground\`.
- Religious text never gets the gradient, glow, Unbounded or Kufi treatments. Stillness is the respect.
- Preview hadith is sample layout content; production text comes from the DB.
`,
};

C.WeekStrip = {
  h: 170, group: 'Jurnal',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col"><div class="fk-sect-head"><h2 class="fk-h2">Juli 2025</h2><span class="fk-hud fk-muted">Muharram → Safar</span></div>${week}</div></div>`,
  readme: `# WeekStrip

Seven day orbs, Senin to Ahad: Masehi number in a 40px orb (Unbounded), weekday above and Hijriah day below in mono. Click an orb to select it.

- **Today**: \`accent\` orb with a \`glow-2\` halo, \`aria-current="date"\`.
- **Selected**: 2px \`primary\` ring outside a \`background\` gap + \`glow\`, scales to 1.06 on \`ease-spring\`.
- Hover: lifts 2px. Rest: 1px \`border\` outline.
- Header names both calendars when a week spans two hijri months.
`,
};

C.AllTasksList = {
  h: 380, group: 'Beranda',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col"><h2 class="fk-h2">Semua task hari ini</h2>${allTasks}</div></div>`,
  readme: `# AllTasksList

Every task today, time-ordered, on a \`glass\` list. Rows stagger in; check circles toggle with a drawn check and a \`glow\` bloom; late-checking any past row is allowed.

- Row: mono time · name + HUD category · status chip + 30px check.
- Chips (mono, uppercase, with a dot): **Selesai** — \`primary\`-tinted with a glowing dot; **Berikutnya** — blinking \`accent\` dot; **Belum** and **Dilewati** — the SAME neutral \`muted\` chip. Skipped is never red or struck through.
- Checking a row flips its chip to Selesai; unchecking returns it.
`,
};

C.DuaCard = {
  h: 360, group: 'Beranda',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">${dua(false)}</div></div>`,
  readme: `# DuaCard

The dua for the current time of day on a \`glass\` panel: Arabic, transliteration, meaning, source.

- HUD eyebrow names the time slot ("Doa · waktu siang"); ghost "Doa lain" refreshes \`GET /api/duas/current\`.
- Arabic \`arabic-lg\` (compact on Beranda: \`arabic-md\`), right-aligned, RTL.
- Transliteration italic \`muted-foreground\` with \`lang="ar-Latn"\`; meaning \`small\`/\`body\`.
- Source as a mono data line in \`muted-foreground\`. No \`reward\` here, no glow on the text, no animation on the Arabic.
`,
};

C.StoryCard = {
  h: 260, group: 'Profil',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">${story}</div></div>`,
  readme: `# StoryCard

"Cerita hari ini" — one journal entry per day on \`glass\` (upsert via \`/api/notes/today\`).

- Focus-within: border turns \`primary\` with a 4px \`glow\` halo; caret in \`primary\`.
- Onest 15/24 on a borderless textarea. Placeholder invites: "Apa yang kamu syukuri hari ini?"
- Footer: a glowing "Tersimpan" dot (autosave) and the dual date in mono.
`,
};

C.ActivityFeed = {
  h: 230, group: 'Profil',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col"><h2 class="fk-h2">Riwayat ibadah</h2><div class="fk-glass">${feed}</div></div></div>`,
  readme: `# ActivityFeed

Timeline of completions for Profil: mono timestamp · node on a \`primary\` rail fading downward · sentence.

- Done = glowing \`primary\` node; skipped = hollow node, sentence in \`muted-foreground\`.
- Items stagger in on mount. Sentences past-tense, personal, no counts or streaks: "Sudah sholat Dzuhur", "Tilawah dilewati dulu".
`,
};

C.JournalTemplates = {
  h: 460, group: 'Jurnal',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col" style="max-width:420px"><h2 class="fk-h2">Rencana esok hari</h2>${plan}<h2 class="fk-h2">Journal harian</h2>${templates}</div></div>`,
  readme: `# JournalTemplates

"Rencana esok hari" planner tiles and the scrolling "Journal harian" template cards, all on \`glass\`.

- **Planner**: two tiles (Akhirat / Dunia) with HUD headers and \`primary\` bullet dots; only Dunia offers "Tambah". The holo treatment stays exclusive to the Beranda Akhirat card.
- **Template card**: 156×164, 36px icon tile on \`secondary\` with a \`primary\` icon, entry count in mono top-right, title + one-line description. Hover lifts 3px into \`shadow-glow\`. Scroll-snaps; the third card peeks.
`,
};

C.QuickAdd = {
  h: 660, group: 'Jurnal',
  body: `<div class="fk fk-ground" style="height:660px;display:flex;flex-direction:column"><div class="fk-scrim" style="flex:1;padding-top:24px">
<form class="fk-sheet" role="dialog" aria-modal="true" aria-labelledby="qa" onsubmit="event.preventDefault()">
  <div class="fk-grab"></div>
  <div class="fk-sheet-head"><div style="display:flex;flex-direction:column;gap:8px"><span class="fk-hud fk-muted"><i data-i="activity" class="sm"></i>Dunia</span><h2 class="fk-h1" id="qa">Todo baru</h2></div><button type="button" class="fk-btn fk-btn-glass icon" aria-label="Tutup"><i data-i="x"></i></button></div>
  <div class="fk-sheet-body">
    <div class="fk-field"><label class="fk-label" for="qa-t">Judul</label><input class="fk-input" id="qa-t" value="Olahraga 30 menit"></div>
    <div class="fk-field"><label class="fk-label" for="qa-w">Waktu · opsional</label><input class="fk-input" id="qa-w" type="time" value="16:30"></div>
    <div class="fk-field"><span class="fk-label" id="rp">Ulangi</span>
      <div class="fk-seg full" role="tablist" aria-labelledby="rp"><button type="button" role="tab" aria-selected="false">Setiap hari</button><button type="button" role="tab" aria-selected="true">Hari tertentu</button></div>
      <div class="fk-dow" aria-label="Pilih hari">${['S', 'S', 'R', 'K', 'J', 'S', 'A'].map((d, i) => `<button type="button" aria-pressed="${[0, 2, 4].includes(i)}" aria-label="${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'][i]}">${d}</button>`).join('')}</div>
      <span class="fk-help">Senin, Rabu, Jumat</span></div>
  </div>
  <div class="fk-sheet-foot"><button type="button" class="fk-btn fk-btn-glass">Batal</button><button class="fk-btn fk-btn-primary">Simpan</button></div>
</form></div></div>`,
  readme: `# QuickAdd

The sheet the FAB opens for a Dunia todo, with the recurrence picker. Akhirat items come only from system templates.

- Fields: Judul (required), Waktu (optional \`time\`), Ulangi. Labels are mono HUD.
- Recurrence: segmented control with a gliding indicator (\`ease-spring\`); "Hari tertentu" shows seven 40px day orbs that pop to \`primary\` with a \`glow\` when pressed. Helper spells out the selection.
- Footer: glass Batal + primary Simpan, equal width.
- Empty title: \`destructive\` border + a 300ms nudge + "Judulnya diisi dulu, ya."
`,
};

C.Navigation = {
  h: 280, group: 'Shell',
  body: `<div class="fk fk-ground fk-pv" style="gap:24px"><div class="fk-pv-col" style="gap:20px">
  <div class="fk-top" style="position:static;border-radius:var(--radius-lg);border:1px solid var(--border)"><button class="fk-btn fk-btn-ghost icon" aria-label="Kembali"><i data-i="arrow-left"></i></button><span class="ttl">Pilih template</span></div>
  <div style="margin:0 -16px">${dock('beranda')}</div>
  <p class="fk-small fk-muted" style="margin:0">Tap a tab: the indicator glides with a spring.</p>
</div></div>`,
  readme: `# Navigation

A floating glass **dock** (Beranda / Jurnal / Profil) and a thin glass **top bar**.

- Dock: detached 16px from the edges and 12px + safe-area from the bottom, \`radius-2xl\`, \`glass\` + blur + saturate, \`shadow-float\`. The active tab sits on a \`primary\`-tinted capsule that glides between tabs (\`duration-base\`, \`ease-spring\`). Icons \`orbit\`, \`notebook-pen\`, \`user\` at 21px; active = \`primary\`, stroke 2.1, raised 1px.
- Top bar: 52px glass, sticky at \`env(safe-area-inset-top)\`, Unbounded 15px title, optional back button (Jurnal sub-views only).
- Use next-intl's \`Link\` from \`i18n/routing\`.
`,
};

C.FormControls = {
  h: 500, group: 'Primitives',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">
<div class="fk-field"><label class="fk-label" for="f1">Nama</label><input class="fk-input" id="f1" placeholder="Nama panggilan"></div>
<div class="fk-pv-row"><input class="fk-input is-hover" style="flex:1" value="Hover" aria-label="hover"><input class="fk-input is-focus" style="flex:1" value="Focus" aria-label="focus"></div>
<div class="fk-pv-row"><input class="fk-input" style="flex:1" value="Disabled" disabled aria-label="disabled"><input class="fk-input" style="flex:1" aria-invalid="true" value="" aria-label="error"></div>
<span class="fk-error">Judulnya diisi dulu, ya.</span>
<div class="fk-field"><label class="fk-label" for="f2">Catatan</label><textarea class="fk-textarea" id="f2" placeholder="Tulis pelan-pelan…"></textarea><span class="fk-help">Hanya kamu yang bisa membaca ini.</span></div>
<div class="fk-pv-row"><span class="fk-badge primary">Wajib</span><span class="fk-badge">Sunnah</span><span class="fk-badge outline">Harian</span><span class="fk-chip done">Selesai</span><span class="fk-chip live">Berikutnya</span><span class="fk-chip">Dilewati</span></div>
</div></div>`,
  readme: `# FormControls

Input, Textarea, Label, Badge and status Chip.

- Input 46px, \`radius-md\`, 1px \`input\` (≥3.2:1), \`card\` fill, \`primary\` caret. Focus: \`ring\` border + 1px ring + 6px \`glow\` halo, easing in on \`ease-out-expo\`. Invalid: \`destructive\` border and a 300ms nudge.
- Labels are mono HUD, uppercase, tracked, always visible above the field.
- Badge (\`radius-sm\`, mono): \`primary\` Wajib, \`secondary\` Sunnah, \`outline\`. Chip: see AllTasksList.
- Base UI, not Radix: compose with \`render={<El/>}\`.
`,
};

C.TabsMenu = {
  h: 320, group: 'Primitives',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-row" style="align-items:flex-start;gap:28px">
<div style="display:flex;flex-direction:column;gap:14px;min-width:260px">
  <div class="fk-seg" role="tablist"><button role="tab" aria-selected="true">Akhirat</button><button role="tab" aria-selected="false">Dunia</button><button role="tab" aria-selected="false">Semua</button></div>
  <hr class="fk-sep">
  <p class="fk-small fk-muted" style="margin:0">Tap a tab — the lifted indicator glides.</p>
</div>
<div class="fk-menu" role="menu">
  <div class="fk-menu-label fk-hud fk-muted">Task</div>
  <div class="fk-menu-item" role="menuitem"><i data-i="book-open" class="sm"></i>Lihat dalil</div>
  <div class="fk-menu-item is-hover" role="menuitem"><i data-i="clock" class="sm"></i>Ubah waktu</div>
  <div class="fk-menu-item" role="menuitem"><i data-i="rotate-ccw" class="sm"></i>Tandai belum</div>
  <hr class="fk-sep" style="margin:4px 0">
  <div class="fk-menu-item" role="menuitem"><i data-i="minus" class="sm"></i>Nonaktifkan<span class="k fk-badge outline">Dunia</span></div>
</div>
</div></div>`,
  readme: `# TabsMenu

Segmented tabs with a gliding indicator, the dropdown menu, and the separator.

- Tabs: \`muted\` track; the selected indicator is a \`card\` capsule with a hairline and faint \`glow\`, gliding on \`ease-spring\` (\`Falak.glide\`).
- Menu: \`popover\`, \`radius-lg\`, \`shadow-float\`; pops in from 94% scale (\`duration-fast\`). Items 38px, hover \`muted\`.
- Separator: a hairline that fades out at both ends.
`,
};

C.Settings = {
  h: 290, group: 'Profil',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">
<div class="fk-field"><span class="fk-label">Tema</span>
  <div class="fk-seg full" aria-label="Gender"><button aria-pressed="true">Ikhwan</button><button aria-pressed="false">Akhwat</button></div>
  <div class="fk-seg full" aria-label="Mode"><button aria-pressed="true"><i data-i="moon" class="sm"></i>Malam</button><button aria-pressed="false"><i data-i="sun" class="sm"></i>Siang</button></div></div>
<div class="fk-field"><span class="fk-label">Bahasa</span>
  <div class="fk-seg full" aria-label="Bahasa"><button aria-pressed="true" lang="id">ID</button><button aria-pressed="false" lang="en">EN</button><button aria-pressed="false" lang="ms">MS</button></div></div>
</div></div>`,
  readme: `# Settings

Theme (Ikhwan / Akhwat × Malam / Siang) and language (ID / EN / MS) as full-width segmented controls with gliding indicators.

- Malam (dark) is the default and listed first — Falak is dark-first. Gender sets \`html[data-gender]\`, mode toggles \`.dark\`; persist to localStorage (\`mb.gender\`, \`mb.mode\`) and the profile.
- On palette change, crossfade the page background for \`duration-base\`; don't transition every token.
`,
};

C.States = {
  h: 520, group: 'Feedback',
  body: `<div class="fk fk-ground fk-pv"><div class="fk-pv-col">
<div class="fk-empty fk-glass" style="border-radius:var(--radius-xl)"><div class="khatam-wrap"><i data-khatam class="k"></i><i data-i="check"></i></div><p class="fk-title">Alhamdulillah, semua sudah untuk saat ini.</p><p class="fk-small fk-muted">Task berikutnya muncul menjelang Maghrib · 17:55</p></div>
<div class="fk-glass" style="display:flex;flex-direction:column;gap:10px;border-radius:var(--radius-xl);padding:20px" aria-busy="true" aria-label="Memuat"><div class="fk-skel" style="width:40%;height:12px"></div><div class="fk-skel" style="width:85%;height:22px"></div><div class="fk-skel" style="width:70%;height:12px"></div><div style="display:flex;gap:8px"><div class="fk-skel" style="width:120px;height:38px;border-radius:var(--radius-full)"></div><div class="fk-skel" style="width:110px;height:38px;border-radius:var(--radius-full)"></div></div></div>
<div class="fk-note fk-glass" role="status"><i data-i="cloud-off" class="ic"></i><div style="display:flex;flex-direction:column;gap:10px;flex:1"><span class="fk-small">Jadwal sholat belum bisa dimuat. Sementara kami pakai waktu perkiraan.</span><button class="fk-btn fk-btn-glass sm" style="align-self:flex-start"><i data-i="refresh-cw" class="sm"></i>Coba lagi</button></div></div>
<div><span class="fk-toast"><i data-i="check" class="sm"></i>Tersimpan<button class="fk-btn fk-btn-ghost sm">Urungkan</button></span></div>
</div></div>`,
  readme: `# States

Empty, loading, error and toast.

- **Empty**: a slowly rotating khatam around a check, with a \`glow\` drop-shadow; a grateful line + when the next task arrives. No confetti, trophies or counts.
- **Loading**: skeletons shaped like the real card on \`muted\`, with a \`primary\`-tinted shimmer sweep.
- **Error**: \`glass\` note with an \`accent\` \`cloud-off\` icon, plain explanation, what happens meanwhile, glass "Coba lagi". Never red for network errors.
- **Toast**: pill on \`popover\`, springs up from below; offers Urungkan where an action is reversible.
- Reduced motion: shimmer, rotation and spring stop; states still read.
`,
};

C.Motion = {
  h: 420, group: 'Foundations',
  body: `<div class="fk fk-ground fk-pv">
<div class="fk-pv-row" style="align-items:stretch">
  <div class="fk-glass mv" style="flex:1;min-width:160px"><span class="fk-hud fk-muted">Enter · 420ms expo</span><div class="box fk-enter" id="m1"></div><button class="fk-btn fk-btn-glass sm" data-replay="m1">Putar</button></div>
  <div class="fk-glass mv" style="flex:1;min-width:160px"><span class="fk-hud fk-muted">Exit up · done</span><div class="box" id="m2"></div><button class="fk-btn fk-btn-glass sm" data-out="m2" data-c="fk-leave-up">Putar</button></div>
  <div class="fk-glass mv" style="flex:1;min-width:160px"><span class="fk-hud fk-muted">Exit side · skip</span><div class="box" id="m3"></div><button class="fk-btn fk-btn-glass sm" data-out="m3" data-c="fk-leave-side">Putar</button></div>
</div>
<div class="fk-pv-row" style="align-items:stretch">
  <div class="fk-task fk-holo" style="flex:1;min-width:200px;min-height:130px;cursor:default"><i data-khatam></i><span class="fk-hud">Beam · 6s</span><span class="fk-small" style="color:var(--card-inverse-muted)">Conic light on the Akhirat edge</span></div>
  <div class="fk-glass mv" style="flex:1;min-width:200px"><span class="fk-hud fk-muted">Ambient · 18s</span><div class="fk-ground" style="height:80px;border-radius:12px;border:1px solid var(--border)"></div></div>
</div>
</div>`,
  css: `.mv{display:flex;flex-direction:column;gap:12px;align-items:flex-start}.box{width:56px;height:56px;border-radius:16px;background:var(--primary);box-shadow:0 0 24px var(--glow)}`,
  script: `document.querySelectorAll('[data-replay]').forEach(function(b){b.onclick=function(){var e=document.getElementById(b.dataset.replay);e.classList.remove('fk-enter');void e.offsetWidth;e.classList.add('fk-enter');};});
document.querySelectorAll('[data-out]').forEach(function(b){b.onclick=function(){var e=document.getElementById(b.dataset.out);e.className='box '+b.dataset.c;setTimeout(function(){e.className='box fk-enter';},700);};});`,
  readme: `# Motion

Falak moves like the sky: slow ambient light, fast precise responses. Every duration and curve is a token.

| Moment | Duration | Easing |
| --- | --- | --- |
| Press, ripple start | \`duration-instant\` 120ms | \`ease-spring\` release |
| Hover lift, tab glide, chip swap | \`duration-fast\` 220ms | \`ease-out-expo\` / \`ease-spring\` |
| Card enter (rise 14px + de-blur 8px, 70ms stagger), sheet rise, check draw | \`duration-base\` 420ms | \`ease-out-expo\` |
| Card exit after Dikerjakan (up) / Lewati (side) | \`duration-base\` | \`ease-in-quart\` |
| Orbit arc draw, completion light sweep | \`duration-slow\` 900ms | \`ease-out-expo\` |
| Holo border beam revolution | \`duration-beam\` 6s | linear |
| Aurora drift, khatam rotation | \`duration-ambient\` 18s | ease-in-out / linear |

Rules: animate \`transform\`, \`opacity\`, \`filter\` only. Ambient motion lives in the background and the holo card, never on text. Hadith, dua and Arabic never animate beyond their entrance fade. \`prefers-reduced-motion\`: all ambient loops stop, transitions go to 0ms, content still swaps.
`,
};

// ── screens ──
const themes = ['ikhwan-dark', 'akhwat-dark', 'ikhwan-light', 'akhwat-light'];
const tname = { 'ikhwan-dark': 'Ikhwan · Malam', 'akhwat-dark': 'Akhwat · Malam', 'ikhwan-light': 'Ikhwan · Siang', 'akhwat-light': 'Akhwat · Siang' };
const wallCss = `.wall{display:flex;gap:28px;padding:28px;align-items:flex-start;background:var(--background)}.cap{font:500 11px/14px var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted-foreground);margin:0 0 10px}`;

C.ScreenBeranda = {
  h: 1060, width: 1760, group: 'Screens', page: true, css: wallCss,
  body: `<div class="fk wall">
${themes.map((t, i) => `<div data-theme="${t}" class="fk"><p class="cap">${tname[t]}</p><div class="fk-phone fk-ground">${beranda('cd' + i)}</div></div>`).join('\n')}
</div>`,
  script: `[0,1,2,3].forEach(function(i){Falak.countdown(document.getElementById('cd'+i),4560);});`,
};

C.ScreenJurnal = {
  h: 1000, width: 450, group: 'Screens', page: true, css: wallCss,
  body: `<div class="fk wall"><div class="fk-phone fk-ground"><div class="fk-phone-scroll">
  <header class="fk-enter" style="--i:0;display:flex;flex-direction:column;gap:8px"><span class="fk-hud fk-muted">Jurnal</span><h1 class="fk-display">Journal</h1><p class="fk-small fk-muted" style="margin:0">“Mengingat-ingat anugerah Allah membuahkan kecintaan kepada Allah.”</p></header>
  <section class="fk-sect fk-enter" style="--i:1"><div class="fk-sect-head"><h2 class="fk-h2">Juli 2025</h2><span class="fk-hud fk-muted">Muharram → Safar</span></div>${week}</section>
  <section class="fk-sect fk-enter" style="--i:2"><div class="fk-sect-head"><h2 class="fk-h2">Rencana esok hari</h2><span class="fk-data fk-muted">27.07 · 02 SAFAR</span></div>${plan}</section>
  <section class="fk-sect fk-enter" style="--i:3"><h2 class="fk-h2">Journal harian</h2>${templates}</section>
</div>${dock('jurnal')}</div></div>`,
};

C.ScreenProfil = {
  h: 1180, width: 450, group: 'Screens', page: true, css: wallCss,
  body: `<div class="fk wall"><div class="fk-phone fk-ground"><div class="fk-phone-scroll">
  <div class="fk-enter" style="--i:0;display:flex;gap:18px;align-items:center"><div class="fk-avatar">J<span class="cam"><i data-i="camera" class="sm"></i></span></div><div style="display:flex;flex-direction:column;gap:6px"><h1 class="fk-h1">Jessica Pribadi</h1><span class="fk-hud fk-muted">Jakarta · Tamu</span></div></div>
  <div class="fk-note fk-glass fk-enter" style="--i:1"><i data-i="user" class="ic"></i><div style="display:flex;flex-direction:column;gap:10px;flex:1"><span class="fk-small">Simpan catatanmu dengan email, supaya tetap ada di perangkat lain.</span><button class="fk-btn fk-btn-primary sm" style="align-self:flex-start">Buat akun</button></div></div>
  <div class="fk-enter" style="--i:2">${story}</div>
  <section class="fk-sect fk-enter" style="--i:3"><h2 class="fk-h2">Aktivitasku</h2><div class="fk-glass"><span class="fk-hud fk-muted">Riwayat ibadah</span>${feed}</div></section>
  <section class="fk-sect fk-enter" style="--i:4"><h2 class="fk-h2">Pengaturan</h2>
    <div class="fk-seg full"><button aria-pressed="true">Ikhwan</button><button aria-pressed="false">Akhwat</button></div>
    <div class="fk-seg full"><button aria-pressed="true"><i data-i="moon" class="sm"></i>Malam</button><button aria-pressed="false"><i data-i="sun" class="sm"></i>Siang</button></div>
    <div class="fk-seg full"><button aria-pressed="true">ID</button><button aria-pressed="false">EN</button><button aria-pressed="false">MS</button></div>
  </section>
</div>${dock('profil')}</div></div>`,
};

for (const [name, c] of Object.entries(C)) {
  const attrs = [`group="${c.group}"`, `height=${c.h}`];
  if (c.width) attrs.push(`width=${c.width}`);
  if (c.page) attrs.push('page');
  out(`components/${name}/preview.html`, doc(`<!-- @dsCard ${attrs.join(' ')} -->`, name, c.body, c.script || '', c.css || ''));
  if (c.readme) out(`components/${name}/README.md`, c.readme);
}
console.log(Object.keys(C).length, 'components');
