/* @ds-bundle: {"format":4,"namespace":"Falak","components":[]} */
(function () {
  // Lucide paths (ISC licence).
  var P = {
    landmark: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    orbit: '<circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"/><path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"/>',
    'notebook-pen': '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'pen-line': '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'cloud-off': '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
    minus: '<path d="M5 12h14"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'hand-heart': '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
    'skip-forward': '<path d="m6 4 10 8-10 8V4Z"/><path d="M19 5v14"/>'
  };
  function icon(name, cls) {
    var body = P[name] || '';
    if (name === 'check') body = '<path d="M20 6 9 17l-5-5"/>';
    return '<svg class="fk-i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  }
  // 8-point khatam (two squares at 45°) nested three deep — the system's geometry.
  function khatam(cls) {
    var s = '';
    [40, 28, 16].forEach(function (r, i) {
      var w = r * 2;
      s += '<rect x="' + (50 - r) + '" y="' + (50 - r) + '" width="' + w + '" height="' + w + '" opacity="' + (1 - i * 0.25) + '"/>' +
           '<rect x="' + (50 - r) + '" y="' + (50 - r) + '" width="' + w + '" height="' + w + '" transform="rotate(45 50 50)" opacity="' + (1 - i * 0.25) + '"/>';
    });
    return '<svg class="' + (cls || 'fk-khatam') + '" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="0.8" aria-hidden="true">' + s + '<circle cx="50" cy="50" r="46" stroke-dasharray="1 3"/></svg>';
  }
  function icons(root) {
    (root || document).querySelectorAll('i[data-i]').forEach(function (el) {
      var n = el.getAttribute('data-i');
      el.outerHTML = icon(n, el.className + (n === 'check' ? ' chk' : ''));
    });
    (root || document).querySelectorAll('i[data-khatam]').forEach(function (el) { el.outerHTML = khatam(el.className || 'fk-khatam'); });
  }
  // Gliding indicator for .fk-seg and .fk-dock: positions .ind under the active child.
  function glide(root) {
    (root || document).querySelectorAll('.fk-seg, .fk-dock').forEach(function (g) {
      var ind = g.querySelector('.ind');
      if (!ind) { ind = document.createElement('span'); ind.className = 'ind'; g.prepend(ind); }
      var items = g.querySelectorAll('button, a');
      function place() {
        var a = g.querySelector('[aria-selected="true"], [aria-pressed="true"], [aria-current="page"]');
        if (!a) { ind.style.opacity = 0; return; }
        ind.style.opacity = 1;
        ind.style.width = a.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + (a.offsetLeft - parseFloat(getComputedStyle(ind).left)) + 'px)';
      }
      items.forEach(function (b) {
        b.addEventListener('click', function (e) {
          if (b.tagName === 'A') e.preventDefault();
          items.forEach(function (x) {
            ['aria-selected', 'aria-pressed'].forEach(function (k) { if (x.hasAttribute(k)) x.setAttribute(k, x === b ? 'true' : 'false'); });
            if (x.tagName === 'A') { if (x === b) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); }
          });
          place();
        });
      });
      place();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    });
  }
  // Toggle buttons (day-of-week, check circles, week orbs).
  function toggles(root) {
    (root || document).querySelectorAll('.fk-dow button').forEach(function (b) {
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
    });
    (root || document).querySelectorAll('.fk-check').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.classList.toggle('on');
        b.innerHTML = on ? icon('check', 'sm chk') : '';
        var chip = b.parentNode.querySelector('.fk-chip');
        if (chip) { chip.dataset.prev = chip.dataset.prev || chip.textContent; chip.className = 'fk-chip' + (on ? ' done' : ''); chip.textContent = on ? 'Selesai' : chip.dataset.prev === 'Selesai' ? 'Belum' : chip.dataset.prev; }
      });
    });
    (root || document).querySelectorAll('.fk-week').forEach(function (w) {
      var orbs = w.querySelectorAll('.fk-orb');
      orbs.forEach(function (o) { o.addEventListener('click', function () { orbs.forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); }); }); });
    });
  }
  // Countdown in HH:MM:SS, ticking once a second.
  function countdown(el, seconds) {
    function f(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var s = Math.max(0, seconds);
      el.textContent = f(Math.floor(s / 3600)) + ':' + f(Math.floor(s % 3600 / 60)) + ':' + f(s % 60);
      seconds--;
    }
    tick(); return setInterval(tick, 1000);
  }
  // Ripple on press for pills and buttons.
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('.fk-pill, .fk-btn');
    if (!t || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = t.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'fk-ripple'; s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
    t.appendChild(s); setTimeout(function () { s.remove(); }, 650);
  });
  // Task queue demo: Dikerjakan / Lewati advance to the next task with the same motion weight.
  function taskDemo(slot, tasks, render) {
    var i = 0;
    function mount() {
      slot.innerHTML = tasks.length > i ? render(tasks[i]) : render(null);
      icons(slot);
      var card = slot.firstElementChild; card.classList.add('fk-enter');
      slot.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var act = b.getAttribute('data-act');
          if (act === 'reset') { i = 0; mount(); return; }
          if (act === 'done') b.classList.add('is-done');
          setTimeout(function () {
            card.classList.remove('fk-enter');
            card.classList.add(act === 'done' ? 'fk-leave-up' : 'fk-leave-side');
            setTimeout(function () { i++; mount(); }, 420);
          }, act === 'done' ? 520 : 60);
        });
      });
    }
    mount();
  }
  function boot(root) { icons(root); glide(root); toggles(root); }
  window.Falak = { icon: icon, icons: icons, khatam: khatam, glide: glide, toggles: toggles, countdown: countdown, taskDemo: taskDemo, boot: boot, paths: P };
})();
