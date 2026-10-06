const fs = require('fs');
const tokcss = require('../tokcss.js');
const palette = require('../palette.js');
const tok = JSON.parse(fs.readFileSync('project/tokens.json', 'utf8'));
const bundleCss = fs.readFileSync('project/components/bundle.css', 'utf8').replace(/^@import[^\n]*\n/, '');
const bundleJs = fs.readFileSync('project/components/bundle.js', 'utf8');
const FONTS = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Naskh+Arabic:wght@400;500&family=Reem+Kufi:wght@500;600&display=swap';

// Pull live fragments from the system's own previews so the landing stays in sync.
const read = p => fs.readFileSync('project/components/' + p + '/preview.html', 'utf8');
const cut = (src, start, end) => { const i = src.indexOf(start); const j = src.indexOf(end, i); return src.slice(i, j + end.length); };
const orbitSrc = read('PrayerOrbit');
const orbit = cut(orbitSrc, '<section class="fk-orbit', '</section>');
const beranda = read('ScreenBeranda');
const holo = cut(beranda, '<article class="fk-task fk-holo"', '</article>');
const week = cut(read('WeekStrip'), '<div class="fk-week"', '</div>');

const css = `
.fl { background: var(--background); color: var(--foreground); font-family: var(--font-sans); font-size: 16px; line-height: 1.6; overflow-x: clip; }
.fl *, .fl *::before, .fl *::after { box-sizing: border-box; }
.fl-wrap { max-width: 1180px; margin: 0 auto; padding-inline: max(16px, 4vw); }
.fl a { color: inherit; }
.fl-nav { position: sticky; isolation: isolate; top: calc(env(safe-area-inset-top, 0px) + 12px); z-index: 20; margin-top: 12px; }
.fl-nav .bar { display: flex; align-items: center; gap: 20px; height: 60px; padding: 0 8px 0 18px; border-radius: var(--radius-full); background: var(--glass); border: 1px solid var(--border); backdrop-filter: blur(var(--blur-glass)) saturate(150%); -webkit-backdrop-filter: blur(var(--blur-glass)) saturate(150%); box-shadow: var(--shadow-float); }
.fl-mark { display: inline-flex; align-items: center; gap: 10px; font: 600 15px/1 var(--font-display); letter-spacing: -0.01em; text-decoration: none; }
.fl-mark .o { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: var(--primary-foreground); background: var(--primary); box-shadow: 0 0 18px var(--glow); }
.fl-links { display: flex; gap: 22px; margin-left: auto; }
.fl-links a { text-decoration: none; font: 500 11px/1 var(--font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted-foreground); transition: color var(--duration-fast) ease-out; }
.fl-links a:hover { color: var(--foreground); }
.fl-nav .fk-btn { border-radius: var(--radius-full); }

.fl-hero { position: relative; padding-block: 64px 96px; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; }
.fl-h1 { font: 600 clamp(40px, 6vw, 76px)/1.02 var(--font-display); letter-spacing: -0.035em; margin: 20px 0 22px; text-wrap: balance; }
.fl-lead { font-size: 18px; line-height: 1.65; color: var(--muted-foreground); max-width: 32em; margin: 0 0 32px; }
.fl-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.fl-ctas .fk-btn { height: 52px; padding: 0 24px; border-radius: var(--radius-full); font-size: 15px; }
.fl-live { margin-top: 36px; display: flex; flex-wrap: wrap; gap: 10px; }
.fl-live .cell { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; border-radius: var(--radius-lg); }
.fl-live .v { font: 500 18px/1 var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.fl-stage { position: relative; display: grid; place-items: center; min-height: 640px; }
.fl-rings { position: absolute; inset: 50% auto auto 50%; width: 620px; height: 620px; translate: -50% -50%; pointer-events: none; }
.fl-rings span { position: absolute; inset: 0; border-radius: 50%; border: 1px dashed var(--input); opacity: 0.55; animation: fk-rotate 60s linear infinite; }
.fl-rings span:nth-child(2) { inset: 70px; opacity: 0.4; animation-duration: 42s; animation-direction: reverse; }
.fl-rings span:nth-child(3) { inset: 140px; border-style: solid; border-color: var(--border); animation: none; }
.fl-rings i.planet { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 16px var(--glow-2); top: -6px; left: calc(50% - 6px); }
.fl-rings span:nth-child(2) i.planet { background: var(--primary); box-shadow: 0 0 16px var(--glow); width: 9px; height: 9px; top: -4.5px; }
.fl-stage .fk-khatam { position: absolute; width: 520px; height: 520px; color: var(--primary); opacity: 0.12; animation: fk-rotate var(--duration-ambient) linear infinite; }
.fl-phone { position: relative; width: 340px; max-width: 100%; border-radius: 44px; padding: 26px 14px 16px; background: color-mix(in oklch, var(--background) 88%, transparent); border: 1px solid var(--border); box-shadow: var(--shadow-float), 0 0 80px -20px var(--glow); display: flex; flex-direction: column; gap: 14px; animation: fl-float 7s ease-in-out infinite; backdrop-filter: blur(6px); }
@keyframes fl-float { 50% { transform: translateY(-10px); } }
.fl-phone .fk-orbit { padding: 14px !important; }
.fl-phone .fk-count .t { font-size: 30px; line-height: 34px; }

.fl-ticker { border-block: 1px solid var(--border); overflow: hidden; background: color-mix(in oklch, var(--background) 70%, var(--card)); }
.fl-ticker .track { display: flex; width: max-content; animation: fl-marquee 38s linear infinite; }
.fl-ticker .row { display: flex; gap: 40px; padding: 16px 20px; font: 500 12px/1 var(--font-mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted-foreground); white-space: nowrap; }
.fl-ticker .row b { color: var(--foreground); font-weight: 500; }
.fl-ticker .row em { font-style: normal; color: var(--primary); }
@keyframes fl-marquee { to { transform: translateX(-50%); } }

.fl-sect { padding-block: 112px; position: relative; }
.fl-head { max-width: 42em; margin-bottom: 48px; display: flex; flex-direction: column; gap: 16px; }
.fl-h2 { font: 600 clamp(30px, 4vw, 48px)/1.08 var(--font-display); letter-spacing: -0.03em; margin: 0; text-wrap: balance; }
.fl-head p { margin: 0; color: var(--muted-foreground); font-size: 17px; }

.fl-bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.fl-tile { grid-column: span 2; border-radius: var(--radius-xl); padding: 24px; display: flex; flex-direction: column; gap: 18px; position: relative; overflow: hidden; transition: transform var(--duration-fast) var(--ease-out-expo), border-color var(--duration-fast) ease-out, box-shadow var(--duration-fast) ease-out; }
.fl-tile:hover { transform: translateY(-3px); border-color: var(--input); box-shadow: var(--shadow-glow); }
.fl-tile.w3 { grid-column: span 3; }
.fl-tile.w4 { grid-column: span 4; grid-row: span 2; }
.fl-tile h3 { font: 600 20px/1.25 var(--font-display); letter-spacing: -0.02em; margin: 0; }
.fl-tile p { margin: 0; color: var(--muted-foreground); font-size: 15px; }
.fl-tile .demo { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
.fl-tile .fk-orbit { background: transparent; border: 0; backdrop-filter: none; padding: 0 !important; }
.fl-sw { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.fl-sw button { appearance: none; cursor: pointer; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0; overflow: hidden; background: var(--card); color: var(--foreground); text-align: left; font: inherit; transition: transform var(--duration-fast) var(--ease-spring); }
.fl-sw button:hover { transform: translateY(-2px); }
.fl-sw button[aria-pressed="true"] { outline: 2px solid var(--ring); outline-offset: 3px; box-shadow: 0 0 0 7px var(--glow); }
.fl-sw .sky { height: 72px; position: relative; }
.fl-sw .sky i { position: absolute; width: 14px; height: 14px; border-radius: 50%; left: 16px; bottom: 14px; }
.fl-sw .sky b { position: absolute; width: 10px; height: 10px; border-radius: 50%; left: 36px; bottom: 26px; }
.fl-sw .lbl { display: block; padding: 10px 12px; font: 500 10.5px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; }

.fl-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; position: relative; counter-reset: s; }
.fl-steps::before { content: ""; position: absolute; left: 8%; right: 8%; top: 28px; height: 1px; background: linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent); opacity: 0.6; }
.fl-steps li { counter-increment: s; display: flex; flex-direction: column; gap: 12px; padding: 0 8px; }
.fl-steps li::before { content: "0" counter(s); width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font: 500 14px/1 var(--font-mono); background: var(--card-inverse); color: var(--primary); border: 1px solid var(--card-inverse-border); box-shadow: 0 0 24px -4px var(--glow); position: relative; }
.fl-steps h3 { font: 600 19px/1.3 var(--font-display); letter-spacing: -0.02em; margin: 8px 0 0; }
.fl-steps p { margin: 0; color: var(--muted-foreground); }

.fl-faq { display: grid; gap: 10px; max-width: 820px; }
.fl-faq details { border-radius: var(--radius-lg); padding: 0; overflow: hidden; }
.fl-faq summary { cursor: pointer; list-style: none; padding: 20px 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font: 500 16px/1.35 var(--font-display); letter-spacing: -0.01em; }
.fl-faq summary::-webkit-details-marker { display: none; }
.fl-faq summary::after { content: ""; width: 10px; height: 10px; border-right: 1.5px solid var(--primary); border-bottom: 1.5px solid var(--primary); transform: rotate(45deg) translateY(-3px); transition: transform var(--duration-fast) var(--ease-spring); flex: none; }
.fl-faq details[open] summary::after { transform: rotate(-135deg); }
.fl-faq details[open] { border-color: var(--input); }
.fl-faq p { margin: 0; padding: 0 22px 22px; color: var(--muted-foreground); max-width: 62ch; }

.fl-cta { margin-bottom: 96px; padding: clamp(36px, 7vw, 88px) clamp(24px, 6vw, 72px); border-radius: var(--radius-2xl); display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: center; cursor: default; }
.fl-cta:hover { transform: none; }
.fl-cta .fl-h2 { color: var(--card-inverse-foreground); }
.fl-cta p { color: var(--card-inverse-muted); margin: 16px 0 28px; font-size: 17px; }
.fl-cta .fk-arabic { color: var(--card-inverse-foreground); }
.fl-cta .cite { color: var(--card-inverse-muted); text-align: right; font-size: 13px; margin: 0; }
.fl-cta .fk-khatam { width: 320px; height: 320px; right: -60px; top: -60px; }

.fl-foot { border-top: 1px solid var(--border); padding-block: 32px 48px; }
.fl-foot .fl-wrap { display: flex; flex-wrap: wrap; gap: 16px 32px; justify-content: space-between; align-items: center; }
.fl-foot .ctrl { display: flex; gap: 10px; flex-wrap: wrap; }

@media (max-width: 960px) {
  .fl-hero, .fl-cta { grid-template-columns: 1fr; }
  .fl-stage { min-height: 560px; }
  .fl-bento { grid-template-columns: 1fr 1fr; }
  .fl-tile, .fl-tile.w3 { grid-column: span 1; }
  .fl-tile.w4 { grid-column: span 2; grid-row: auto; }
}
@media (max-width: 640px) {
  .fl-links { display: none; }
  .fl-nav .fk-btn { margin-left: auto; }
  .fl-bento { grid-template-columns: 1fr; }
  .fl-tile, .fl-tile.w3, .fl-tile.w4 { grid-column: auto; }
  .fl-steps { grid-template-columns: 1fr; gap: 28px; }
  .fl-steps::before { display: none; }
  .fl-sw { grid-template-columns: 1fr 1fr; }
  .fl-rings { width: 440px; height: 440px; }
  .fl-stage .fk-khatam { width: 380px; height: 380px; }
  .fl-sect { padding-block: 72px; }
  .fl-hero { padding-block: 32px 64px; }
}
@media (prefers-reduced-motion: reduce) {
  .fl *, .fl *::before, .fl *::after { animation: none !important; transition-duration: 0ms !important; }
}
`;

const c = (id, n) => tok.color.tokens.find(x => x.name === n).value[id];
const sw = (id, name) => `<button data-set-g="${id.split('-')[0]}" data-set-m="${id.split('-')[1]}" aria-label="Pakai tema ${name}"><span class="sky" style="background:${c(id, 'background')}"><i style="background:${c(id, 'primary')}"></i><b style="background:${c(id, 'accent')}"></b></span><span class="lbl">${name}</span></button>`;

const tick = `<div class="row"><span><em>●</em> Subuh <b>04:42</b></span><span>Dzuhur <b>12:00</b></span><span>Ashar <b>15:21</b></span><span>Maghrib <b>17:55</b></span><span>Isya <b>19:08</b></span><span>26.07.2025 <b>·</b> 01 Safar 1447</span><span>Metode <b>KEMENAG</b></span><span>Jakarta <b>−6.2° / 106.8°</b></span></div>`;

const body = `<div class="fl fk">
<header class="fl-nav"><div class="fl-wrap"><div class="bar">
  <a class="fl-mark" href="#top"><span class="o"><i data-i="orbit" class="sm"></i></span>Muslim Berislam</a>
  <nav class="fl-links" aria-label="Halaman"><a href="#fitur">Fitur</a><a href="#cara">Cara kerja</a><a href="#tema">Tema</a><a href="#tanya">Tanya</a></nav>
  <a class="fk-btn fk-btn-primary" href="#mulai">Mulai</a>
</div></div></header>

<main id="top">
<div class="fk-ground" style="margin-top:-84px;padding-top:84px"><section class="fl-wrap fl-hero">
  <div class="fk-enter" style="--i:0">
    <span class="fk-hud fk-muted"><span class="fk-chip live" style="height:22px">Langsung</span>Pendamping ibadah harian</span>
    <h1 class="fl-h1">Ibadah harian, <span class="fk-grad">dihitung dari langit.</span></h1>
    <p class="fl-lead">Muslim Berislam membaca posisi matahari hari ini, lalu menunjukkan satu hal yang perlu kamu kerjakan sekarang — dengan dalilnya, tanpa daftar yang menumpuk.</p>
    <div class="fl-ctas"><a class="fk-btn fk-btn-primary" href="#mulai">Mulai sebagai tamu<i data-i="arrow-right" class="sm"></i></a><a class="fk-btn fk-btn-glass" href="#fitur">Lihat fiturnya</a></div>
    <div class="fl-live">
      <div class="cell fk-glass"><span class="fk-hud fk-muted">Menuju Ashar</span><span class="v" id="cd-hero">01:16:00</span></div>
      <div class="cell fk-glass"><span class="fk-hud fk-muted">Masehi</span><span class="v">26.07.2025</span></div>
      <div class="cell fk-glass"><span class="fk-hud fk-muted">Hijriah</span><span class="v">01 Safar 1447</span></div>
    </div>
  </div>
  <div class="fl-stage" aria-label="Contoh tampilan Beranda">
    <div class="fl-rings" aria-hidden="true"><span><i class="planet"></i></span><span><i class="planet"></i></span><span></span></div>
    <i data-khatam></i>
    <div class="fl-phone fk-enter" style="--i:2">
      ${orbit.replace('id="cd"', 'id="cd-phone"')}
      ${holo}
    </div>
  </div>
</section></div>

<div class="fl-ticker" aria-hidden="true"><div class="track">${tick}${tick}</div></div>

<section class="fl-sect" id="fitur"><div class="fl-wrap">
  <div class="fl-head"><span class="fk-hud" style="color:var(--primary)">Fitur</span><h2 class="fl-h2">Instrumen kecil untuk hari yang lurus.</h2><p>Semua yang ada di layar punya satu tugas: membuatmu tahu apa yang berikutnya, lalu memberimu ruang.</p></div>
  <div class="fl-bento">
    <article class="fl-tile fk-glass w4"><div><span class="fk-hud fk-muted">01 · Beranda</span></div><h3>Hari sebagai orbit</h3><p>Lima waktu sholat diletakkan di lintasan matahari sesuai jam sebenarnya di kotamu (metode KEMENAG). Titik terang adalah sekarang; hitung mundur menuju waktu berikutnya.</p><div class="demo">${orbit.replace('id="cd"', 'id="cd-bento"')}</div></article>
    <article class="fl-tile fk-glass"><span class="fk-hud fk-muted">02 · Akhirat</span><h3>Satu tugas, lengkap dengan dalil</h3><div class="demo" id="holo-demo"></div><p>Coba ketuk Dikerjakan atau Lewati.</p></article>
    <article class="fl-tile fk-glass"><span class="fk-hud fk-muted">03 · Kalender</span><h3>Masehi dan Hijriah, sama besar</h3><div class="demo">${week}</div></article>
    <article class="fl-tile fk-glass w3"><span class="fk-hud fk-muted">04 · Dalil</span><h3>Teks utuh, tidak pernah dipotong</h3><div class="demo"><p class="fk-arabic md" dir="rtl" lang="ar" style="color:var(--foreground)">أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ</p><p style="color:var(--foreground)">“Amalan yang paling dicintai Allah adalah yang paling rutin, meskipun sedikit.”</p><span class="fk-src-ink">HR. Bukhari dan Muslim</span></div></article>
    <article class="fl-tile fk-glass w3"><span class="fk-hud fk-muted">05 · Tanpa rasa bersalah</span><h3>Melewati itu boleh</h3><div class="demo"><div class="fk-task-actions" style="margin:0"><button class="fk-pill fk-pill-done" id="pill-demo"><i data-i="check" class="sm"></i>Dikerjakan</button><button class="fk-pill fk-pill-skip">Lewati dulu</button></div><div class="fk-pv-row"><span class="fk-chip done">Selesai</span><span class="fk-chip">Dilewati</span><span class="fk-chip">Belum</span></div></div><p>Dua pilihan dengan ukuran dan gerak yang sama. Tidak ada merah, tidak ada streak yang putus — yang terlewat bisa ditandai nanti.</p></article>
  </div>
</div></section>

<section class="fl-sect" id="cara"><div class="fl-wrap">
  <div class="fl-head"><span class="fk-hud" style="color:var(--primary)">Cara kerja</span><h2 class="fl-h2">Beberapa detik, beberapa kali sehari.</h2></div>
  <ol class="fl-steps">
    <li><h3>Buka saat ada jeda</h3><p>Setelah subuh, di sela kerja, sebelum tidur. Orbit menunjukkan di mana harimu sekarang.</p></li>
    <li><h3>Kerjakan atau lewati</h3><p>Satu ketukan. Kartu berikutnya masuk dengan tenang; yang terlewat menunggu di daftar harian.</p></li>
    <li><h3>Tutup dengan cerita</h3><p>Satu-dua kalimat di Profil. Riwayat ibadahmu tersusun sendiri, tanpa skor.</p></li>
  </ol>
</div></section>

<section class="fl-sect" id="tema"><div class="fl-wrap">
  <div class="fl-head"><span class="fk-hud" style="color:var(--primary)">Tema</span><h2 class="fl-h2">Langit malam atau siang, versi Ikhwan atau Akhwat.</h2><p>Mint dan biru langit untuk Ikhwan, anggrek dan aprikot untuk Akhwat. Pilih satu — seluruh halaman ini ikut berganti.</p></div>
  <div class="fl-sw">${sw('ikhwan-dark', 'Ikhwan · Malam')}${sw('akhwat-dark', 'Akhwat · Malam')}${sw('ikhwan-light', 'Ikhwan · Siang')}${sw('akhwat-light', 'Akhwat · Siang')}</div>
</div></section>

<section class="fl-sect" id="tanya"><div class="fl-wrap">
  <div class="fl-head"><span class="fk-hud" style="color:var(--primary)">Tanya jawab</span><h2 class="fl-h2">Yang sering ditanyakan.</h2></div>
  <div class="fl-faq">
    <details class="fk-glass" open><summary>Apakah harus membuat akun?</summary><p>Tidak. Kamu langsung masuk sebagai tamu dan semua fitur bisa dipakai. Tambahkan email dan kata sandi di Profil kapan saja — seluruh data tamu tetap tersimpan.</p></details>
    <details class="fk-glass"><summary>Dari mana jadwal sholatnya?</summary><p>Dari layanan Aladhan dengan metode KEMENAG, berdasarkan kota dan negara di profilmu. Jika layanan tidak bisa dihubungi, aplikasi memakai waktu perkiraan dan memberi tahu kamu.</p></details>
    <details class="fk-glass"><summary>Bagaimana kalau aku melewatkan sesuatu?</summary><p>Buka "Semua task hari ini" dan tandai kapan saja. Tidak ada streak yang putus dan tidak ada pengingat yang menyalahkan.</p></details>
    <details class="fk-glass"><summary>Apakah animasinya bisa dimatikan?</summary><p>Ya. Aplikasi mengikuti pengaturan "kurangi gerakan" di perangkatmu: cahaya, orbit, dan transisi berhenti, isinya tetap sama.</p></details>
    <details class="fk-glass"><summary>Bahasa apa saja yang tersedia?</summary><p>Bahasa Indonesia, English, dan Bahasa Melayu.</p></details>
  </div>
</div></section>

<section class="fl-wrap" id="mulai"><div class="fl-cta fk-task fk-holo">
  <i data-khatam></i>
  <div><span class="fk-hud">Mulai hari ini</span><h2 class="fl-h2" style="margin-top:16px">Satu langkah kecil, di waktu yang tepat.</h2><p>Tanpa daftar, tanpa iklan. Buka, kerjakan, tenang.</p><a class="fk-btn fk-btn-primary" href="#top" style="height:52px;padding:0 24px;border-radius:var(--radius-full)">Mulai sebagai tamu<i data-i="arrow-right" class="sm"></i></a></div>
  <div><p class="fk-arabic" dir="rtl" lang="ar">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</p><p class="cite">“Karena sesungguhnya bersama kesulitan ada kemudahan.” — QS. Al-Insyirah: 5</p></div>
</div></section>
</main>

<footer class="fl-foot"><div class="fl-wrap">
  <span class="fk-data fk-muted">MUSLIM BERISLAM · FALAK</span>
  <div class="ctrl">
    <div class="fk-seg" aria-label="Gender"><button data-set-g="ikhwan">Ikhwan</button><button data-set-g="akhwat">Akhwat</button></div>
    <div class="fk-seg" aria-label="Mode"><button data-set-m="dark"><i data-i="moon" class="sm"></i>Malam</button><button data-set-m="light"><i data-i="sun" class="sm"></i>Siang</button></div>
  </div>
</div></footer>
</div>`;

const holoTpl = JSON.stringify(holo);
const run = `
Falak.countdown(document.getElementById('cd-hero'), 4560);
Falak.countdown(document.getElementById('cd-phone'), 4560);
Falak.countdown(document.getElementById('cd-bento'), 4560);
(function(){
  var T=${holoTpl};
  var Q=[['Sholat Ashar berjamaah.','Ashar · 15:21'],['Dzikir petang.','Setelah Ashar'],['Sholat Maghrib.','Maghrib · 17:55']];
  Falak.taskDemo(document.getElementById('holo-demo'),Q,function(t){
    if(!t) return '<div class="fk-empty" style="padding:16px"><div class="khatam-wrap"><i data-khatam class="k"></i><i data-i="check"></i></div><p class="fk-title">Alhamdulillah, semua sudah.</p><button class="fk-btn fk-btn-glass sm" data-act="reset">Ulangi</button></div>';
    return T.replace('Sholat Ashar berjamaah.',t[0]).replace('Ashar · 15:21',t[1]);
  });
  var p=document.getElementById('pill-demo');
  p.addEventListener('click',function(){p.classList.remove('is-done');void p.offsetWidth;p.classList.add('is-done');});
})();`;

fs.mkdirSync('project/components/LandingPage', { recursive: true });
fs.writeFileSync('project/components/LandingPage/preview.html', `<!-- @dsCard group="Screens" height=4000 width=1280 page -->
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><title>LandingPage</title><style>${css}</style></head>
<body>
${body}
<script>
Falak.boot();
${palette('data-theme', false)}
${run}
</script>
</body>
</html>
`);

fs.writeFileSync('landing-falak.html', `<title>Muslim Berislam Falak</title>
<meta name="description" content="Ibadah harian, dihitung dari langit: orbit waktu sholat, satu tugas pada satu waktu, dalil utuh.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${tokcss(tok, 'data-palette')}
:root, [data-palette$="-dark"] { color-scheme: dark; }
[data-palette$="-light"] { color-scheme: light; }
html, body { background: var(--background); }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
${bundleCss}
${css}
</style>
${body}
<script>
${bundleJs}
Falak.boot();
${palette('data-palette', true)}
${run}
</script>
`);
console.log('falak landing ok', fs.statSync('landing-falak.html').size, orbit.length, holo.length, week.length);
