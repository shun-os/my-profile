/* ==========================================================
   Shunsuke's Macintosh — 初代Macintosh (System 1) 風デスクトップ
   index.html に直接書いた中身を、JSでウィンドウに移して表示する。
   ライブラリなし・ビルドなし。
   ========================================================== */
(function () {
  'use strict';

  window.__macBooted = true; // index.html の「読み込み失敗なら読み物表示へ戻す」処理を止める

  var doc = document;
  var MENU_H = 20;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var GITHUB_USER = 'shun-os';

  // スマホ（細い画面・指で操作する小さな端末）は「縦並びモード」：全ウィンドウを最初から開いて縦に並べる。
  // 横向きにしても切り替わらないよう、端末の画面サイズでも判定する。
  function computeStack() {
    var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var shortSide = Math.min(window.screen.width || 9999, window.screen.height || 9999);
    return window.innerWidth <= 700 || (coarse && shortSide <= 600);
  }
  var stackMode = computeStack();
  if (stackMode) doc.documentElement.classList.add('stack-mode');
  function small() { return stackMode || window.innerWidth <= 700; }
  function vw() { return window.innerWidth; }
  function vh() { return window.innerHeight; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c);
    });
    return n;
  }

  /* ----------------------------------------------------------
     16×16 ピクセルアート（# = 黒, o = 白, . = 透明）
     ---------------------------------------------------------- */
  var ART = {
    disk: [
      '................',
      '................',
      '................',
      '................',
      '################',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#o###oooooooooo#',
      '#oooooooooooooo#',
      '################',
      '.##..........##.',
      '................',
      '................',
      '................'
    ],
    folder: [
      '................',
      '................',
      '................',
      '.######.........',
      '#oooooo#........',
      '#ooooooo########',
      '#oooooooooooooo#',
      '################',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '################',
      '................',
      '................'
    ],
    doc: [
      '..#########.....',
      '..#ooooooo##....',
      '..#ooooooo#o#...',
      '..#ooooooo#oo#..',
      '..#ooooooo#####.',
      '..#ooooooooooo#.',
      '..#ooooooooooo#.',
      '..#oo#######oo#.',
      '..#ooooooooooo#.',
      '..#oo#######oo#.',
      '..#ooooooooooo#.',
      '..#oo#####oooo#.',
      '..#ooooooooooo#.',
      '..#ooooooooooo#.',
      '..#############.',
      '................'
    ],
    term: [
      '................',
      '.##############.',
      '.#oooooooooooo#.',
      '.##############.',
      '.##############.',
      '.##o###########.',
      '.###o##########.',
      '.####o#########.',
      '.###o##########.',
      '.##o###ooo#####.',
      '.##############.',
      '.##############.',
      '.##############.',
      '.##############.',
      '................',
      '................'
    ],
    app: [
      '.......##.......',
      '......#oo#......',
      '.....#oooo#.....',
      '....#oo##oo#....',
      '...#oo#oo#oo#...',
      '..#oo#oooo#oo#..',
      '.#oo#oo##oo#oo#.',
      '#oo#oo#oo#oo#oo#',
      '#oo#oo#oo#oo#oo#',
      '.#oo#oo##oo#oo#.',
      '..#oo#oooo#oo#..',
      '...#oo#oo#oo#...',
      '....#oo##oo#....',
      '.....#oooo#.....',
      '......#oo#......',
      '.......##.......'
    ],
    trash: [
      '......####......',
      '.....#oooo#.....',
      '.##############.',
      '.#oooooooooooo#.',
      '.##############.',
      '..#oooooooooo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#o#oo#oo#oo#..',
      '..#oooooooooo#..',
      '..############..',
      '................'
    ],
    trashFull: [
      '..........####..',
      '...##....#oooo#.',
      '..#oo#.#######..',
      '.#ooo##ooooo#...',
      '.##############.',
      '.#oooooooooooo#.',
      '.##############.',
      '.#oooooooooooo#.',
      '.#o#oo#oo#oo#o#.',
      '.#o#oo#oo#oo#o#.',
      '.#o#oo#oo#oo#o#.',
      '.#o#oo#oo#oo#o#.',
      '.#o#oo#oo#oo#o#.',
      '.#oooooooooooo#.',
      '..############..',
      '................'
    ],
    apple: [
      '................',
      '........##......',
      '.......##.......',
      '.......#........',
      '..####...####...',
      '.############...',
      '###########.....',
      '##########......',
      '##########......',
      '###########.....',
      '.############...',
      '.#############..',
      '..###########...',
      '...###...###....',
      '................',
      '................'
    ],
    note: [
      '................',
      '.#############..',
      '.#ooooooooooo##.',
      '.#ooooooooooo#o#',
      '.#ooo##oooooo#o#',
      '.#oo#oo#ooooo#o#',
      '.#ooooo#ooooo#o#',
      '.#oooo#oooooo#o#',
      '.#ooo#ooooooo#o#',
      '.#ooooooooooo#o#',
      '.#ooo#ooooooo#o#',
      '.#ooooooooooo#o#',
      '.#############o#',
      '..#oooooooooooo#',
      '..##############',
      '................'
    ],
    happyMac: [
      '.##############.',
      '#oooooooooooooo#',
      '#o############o#',
      '#o#oooooooooo#o#',
      '#o#oo#oooo#oo#o#',
      '#o#oo#oooo#oo#o#',
      '#o#ooooo#oooo#o#',
      '#o#oooo##oooo#o#',
      '#o#oooooooooo#o#',
      '#o#oo#oooo#oo#o#',
      '#o#ooo####ooo#o#',
      '#o#oooooooooo#o#',
      '#o############o#',
      '#oooooooooooooo#',
      '#oooooooooooooo#',
      '#ooooooo#####oo#',
      '#oooooooooooooo#',
      '################',
      '#oooooooooooooo#',
      '################'
    ]
  };

  var artCache = {};
  function art(name) {
    if (artCache[name]) return artCache[name];
    var rows = ART[name];
    var h = rows.length, w = rows[0].length;
    var c = doc.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var ch = rows[y].charAt(x);
        if (ch === '.') continue;
        g.fillStyle = ch === '#' ? '#000' : '#fff';
        g.fillRect(x, y, 1, 1);
      }
    }
    artCache[name] = c.toDataURL();
    return artCache[name];
  }
  function artImg(name, cls) {
    var img = el('img', { src: art(name), alt: '', draggable: 'false', class: cls || null });
    return img;
  }

  /* ----------------------------------------------------------
     中身の定義（どのアイコンが、どのウィンドウを開くか）
     ---------------------------------------------------------- */
  var content = doc.getElementById('content');
  var DEFS = {};
  var KIND = { doc: 'document', folder: 'folder', app: 'application', term: 'shell script', disk: 'disk', trash: 'trash' };

  function docDef(node, extra) {
    var d = {
      id: node.getAttribute('data-win') || node.id,
      title: node.getAttribute('data-title'),
      label: node.getAttribute('data-label') || node.getAttribute('data-title'),
      icon: node.getAttribute('data-icon') || 'doc',
      w: +node.getAttribute('data-w') || 460,
      h: +node.getAttribute('data-h') || 380,
      anchor: node.id,
      node: node,
      build: function () { return node; }
    };
    if (d.icon === 'term') d.cls = 'win-term';
    Object.keys(extra || {}).forEach(function (k) { d[k] = extra[k]; });
    DEFS[d.id] = d;
    return d;
  }

  // 各セクション
  ['profile', 'skills', 'strengths', 'experience', 'activity', 'goals', 'contact'].forEach(function (id) {
    var n = content.querySelector('[data-win="' + id + '"]');
    if (n) docDef(n);
  });

  // プロジェクト（1件 = 1書類）
  var projSection = content.querySelector('[data-win="projects"]');
  var projectIds = [];
  if (projSection) {
    Array.prototype.forEach.call(projSection.querySelectorAll('.project'), function (n) {
      projectIds.push(docDef(n).id);
    });
    DEFS.projects = {
      id: 'projects', title: 'Projects', label: 'Projects', icon: 'folder', folder: true,
      anchor: 'projects', items: projectIds, w: 400, h: 220, noPad: true
    };
  }

  DEFS.apps = { id: 'apps', title: 'Applications', label: 'Applications', icon: 'folder', folder: true, items: ['paint', 'calc', 'notepad', 'puzzle'], w: 380, h: 170, noPad: true };
  DEFS.hd = {
    id: 'hd', title: "Shunsuke HD", label: "Shunsuke HD", icon: 'disk', folder: true, kind: 'disk',
    items: ['profile', 'projects', 'skills', 'strengths', 'experience', 'activity', 'goals', 'contact', 'apps'],
    w: 460, h: 300, noPad: true
  };
  DEFS.trash = { id: 'trash', title: 'Trash', label: 'Trash', icon: 'trash', folder: true, kind: 'trash', items: [], w: 320, h: 180, noPad: true };

  DEFS.paint = { id: 'paint', title: 'MacPaint', label: 'MacPaint', icon: 'app', w: 520, h: 360, noPad: true, build: buildPaint };
  DEFS.calc = { id: 'calc', title: 'Calculator', label: 'Calculator', icon: 'app', w: 200, h: 250, noPad: true, build: buildCalc, fixed: true };
  DEFS.notepad = { id: 'notepad', title: 'Note Pad', label: 'Note Pad', icon: 'app', w: 300, h: 260, noPad: true, build: buildNotePad };
  DEFS.puzzle = { id: 'puzzle', title: 'Puzzle', label: 'Puzzle', icon: 'app', w: 210, h: 260, noPad: true, build: buildPuzzle, fixed: true };

  var DESKTOP_ITEMS = ['hd', 'profile', 'projects', 'skills', 'contact'];

  /* ----------------------------------------------------------
     デスクトップとメニューバー
     ---------------------------------------------------------- */
  var desk = el('div', { class: 'desktop', id: 'desktop' });
  doc.body.appendChild(desk);

  var selectedIcon = null;
  var savedSelection = '';
  var viewMode = 'icon';
  var trashed = [];      // ゴミ箱に入っているデスクトップのアイコン
  var removed = [];      // 「Empty Trash」で消したアイコン（Clean Up で戻る）
  var iconPos = {};      // ユーザーが動かしたデスクトップのアイコン位置

  function portfolioItem(t, id) { return { t: t, a: function () { openItem(id, findIcon(id)); } }; }

  var MENUS = [
    { id: 'apple', art: 'apple', label: 'Apple', items: [
      { t: 'About This Macintosh…', a: aboutMac },
      '-',
      { t: 'Calculator', a: function () { openItem('calc', findIcon('calc')); } },
      { t: 'Note Pad', a: function () { openItem('notepad', findIcon('notepad')); } },
      { t: 'Puzzle', a: function () { openItem('puzzle', findIcon('puzzle')); } },
      { t: 'MacPaint', a: function () { openItem('paint', findIcon('paint')); } }
    ] },
    { id: 'file', label: 'File', items: [
      { t: 'Open', k: '⌘O', a: function () { if (selectedIcon) openItem(selectedIcon.dataset.id, selectedIcon); }, en: function () { return !!selectedIcon; } },
      { t: 'Close', k: '⌘W', a: function () { if (activeWin) closeWin(activeWin); }, en: function () { return !!activeWin; } },
      '-',
      { t: 'Print…', dis: true },
      '-',
      { t: 'Eject', dis: true }
    ] },
    { id: 'edit', label: 'Edit', items: [
      { t: 'Undo', k: '⌘Z', dis: true },
      '-',
      { t: 'Cut', k: '⌘X', dis: true },
      { t: 'Copy', k: '⌘C', a: copySelection, en: function () { return !!savedSelection; } },
      { t: 'Paste', k: '⌘V', dis: true },
      { t: 'Clear', dis: true },
      '-',
      { t: 'Select All', k: '⌘A', a: selectAll, en: function () { return !!activeWin; } }
    ] },
    { id: 'view', label: 'View', items: [
      { t: 'by Icon', en: function () { return !stackMode; }, a: function () { setView('icon'); }, chk: function () { return viewMode === 'icon'; } },
      { t: 'by Name', en: function () { return !stackMode; }, a: function () { setView('list'); }, chk: function () { return viewMode === 'list'; } }
    ] },
    { id: 'portfolio', label: 'Portfolio', items: [
      portfolioItem('profile.md', 'profile'),
      portfolioItem('Projects', 'projects'),
      '-',
      portfolioItem('Skills', 'skills'),
      portfolioItem('Strengths', 'strengths'),
      portfolioItem('Experience', 'experience'),
      portfolioItem('GitHub Activity', 'activity'),
      portfolioItem('Next Goals', 'goals'),
      '-',
      portfolioItem('contact.sh', 'contact')
    ] },
    { id: 'special', label: 'Special', items: [
      { t: 'Clean Up', a: cleanUp, en: function () { return !stackMode; } },
      { t: 'Empty Trash', a: emptyTrash, en: function () { return !stackMode && trashed.length > 0; } },
      '-',
      { t: 'Close All', a: closeAll, en: function () { return stackMode || openWins().length > 0; } },
      { t: 'Restart', a: restart }
    ] }
  ];

  var menubar = el('nav', { class: 'menubar', 'aria-label': 'メニューバー' });
  var openMenuId = null;
  var menuPressing = false;
  var blinking = false;
  var menuEls = {};

  MENUS.forEach(function (m) {
    var title = el('button', { class: 'menu-title', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': m.label },
      [m.art ? artImg(m.art) : m.label]);
    var list = el('ul', { class: 'menu', role: 'menu', hidden: true });
    m.items.forEach(function (it) {
      if (it === '-') { list.appendChild(el('li', { class: 'menu-sep', role: 'separator' })); return; }
      var b = el('button', { class: 'menu-item', type: 'button', role: 'menuitem' },
        [el('span', { text: it.t }), it.k ? el('span', { class: 'menu-key', text: it.k }) : null]);
      it.btn = b;
      b.addEventListener('pointerup', function (e) {
        if (e.button > 0 || b.disabled) return;
        choose(b, it.a);
      });
      b.addEventListener('click', function (e) { if (e.detail === 0 && !b.disabled) choose(b, it.a); }); // キーボード操作
      list.appendChild(el('li', { role: 'none' }, [b]));
    });
    var wrap = el('div', { class: 'menu-top' }, [title, list]);
    menuEls[m.id] = { title: title, list: list, def: m };

    title.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      e.preventDefault();
      menuPressing = true;
      if (openMenuId === m.id) closeMenus(); else openMenu(m.id);
    });
    title.addEventListener('pointerenter', function () { if (openMenuId && openMenuId !== m.id) openMenu(m.id); });
    title.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openMenu(m.id);
        var first = list.querySelector('.menu-item:not(:disabled)');
        if (first) first.focus();
      }
    });
    menubar.appendChild(wrap);
  });

  var clock = el('div', { class: 'menu-clock', 'aria-label': '時計' });
  menubar.appendChild(clock);
  desk.appendChild(menubar);

  // メニューを押してもテキストの選択が消えないようにする
  menubar.addEventListener('mousedown', function (e) { e.preventDefault(); });

  function openMenu(id) {
    if (!openMenuId) {
      var s = window.getSelection ? String(window.getSelection()) : '';
      savedSelection = s;
    }
    closeMenus(true);
    var m = menuEls[id];
    openMenuId = id;
    m.title.classList.add('open');
    m.title.setAttribute('aria-expanded', 'true');
    m.def.items.forEach(function (it) {
      if (!it.btn) return;
      var enabled = !it.dis && (!it.en || it.en());
      it.btn.disabled = !enabled;
      it.btn.classList.toggle('checked', !!(it.chk && it.chk()));
      it.btn.classList.remove('hot', 'blink-off');
    });
    m.list.hidden = false;
    // 画面の右端からはみ出さない
    m.list.style.left = '0px';
    var r = m.list.getBoundingClientRect();
    if (r.right > vw() - 2) m.list.style.left = (vw() - 2 - r.right) + 'px';
  }

  function closeMenus(keepState) {
    Object.keys(menuEls).forEach(function (k) {
      var m = menuEls[k];
      m.list.hidden = true;
      m.title.classList.remove('open');
      m.title.setAttribute('aria-expanded', 'false');
    });
    if (!keepState) openMenuId = null;
  }

  // 選んだ項目は一瞬点滅してから実行する
  function choose(btn, fn) {
    if (blinking) return;
    blinking = true;
    btn.classList.add('hot');
    var n = 0;
    var iv = setInterval(function () {
      btn.classList.toggle('blink-off');
      if (++n >= 6) {
        clearInterval(iv);
        btn.classList.remove('blink-off', 'hot');
        closeMenus();
        blinking = false;
        if (fn) fn();
      }
    }, 45);
  }

  doc.addEventListener('pointerdown', function (e) {
    if (openMenuId && !menubar.contains(e.target)) closeMenus();
  });
  doc.addEventListener('pointerup', function (e) {
    if (menuPressing && openMenuId && !blinking) {
      // 押したままメニューの外で離したら閉じる（クリックで開いた場合はそのまま）
      var t = e.target;
      if (!t.closest || (!t.closest('.menu-title') && !t.closest('.menu-item'))) closeMenus();
    }
    menuPressing = false;
  });

  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ap = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    clock.textContent = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }
  tick();
  setInterval(tick, 10000);

  /* ----------------------------------------------------------
     アイコン
     ---------------------------------------------------------- */
  var deskIcons = {};

  function iconArt(id) {
    if (id === 'trash') return trashed.length ? 'trashFull' : 'trash';
    return DEFS[id].icon;
  }

  function makeIcon(id, onDesktop) {
    var d = DEFS[id];
    var kind = d.kind || (d.folder ? 'folder' : d.icon);
    var b = el('button', { class: 'icon', type: 'button', 'data-id': id, title: d.label },
      [artImg(iconArt(id)), el('span', { class: 'icon-label', text: d.label }), el('span', { class: 'icon-kind', text: KIND[kind] || '' })]);

    var start = null;
    b.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      selectIcon(b);
      start = { x: e.clientX, y: e.clientY, type: e.pointerType };
      if (onDesktop && e.pointerType === 'mouse' && id !== 'hd' && id !== 'trash') startIconDrag(b, e);
    });
    b.addEventListener('pointerup', function (e) {
      // スマホ・タブレットは1回タップで開く
      if (start && start.type !== 'mouse' && Math.abs(e.clientX - start.x) < 10 && Math.abs(e.clientY - start.y) < 10) {
        openItem(id, b);
      }
      start = null;
    });
    b.addEventListener('dblclick', function () { openItem(id, b); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); openItem(id, b); }
    });
    b.addEventListener('click', function (e) { if (e.detail === 0) selectIcon(b); });
    return b;
  }

  function selectIcon(b) {
    if (selectedIcon && selectedIcon !== b) selectedIcon.classList.remove('selected');
    selectedIcon = b;
    if (b) b.classList.add('selected');
  }

  function refreshIconArt(id) {
    Array.prototype.forEach.call(desk.querySelectorAll('.icon[data-id="' + id + '"] img'), function (img) {
      img.src = art(iconArt(id));
    });
  }

  // 見えているアイコンを探す（開くアニメーションの出発点）
  function findIcon(id) {
    var list = desk.querySelectorAll('.icon[data-id="' + id + '"]');
    for (var i = list.length - 1; i >= 0; i--) {
      var r = list[i].getBoundingClientRect();
      if (r.width && list[i].offsetParent) return list[i];
    }
    return null;
  }

  function buildDesktopIcons() {
    if (stackMode) return; // 縦並びモードではデスクトップのアイコンを置かない
    DESKTOP_ITEMS.concat(['trash']).forEach(function (id) {
      var b = makeIcon(id, true);
      deskIcons[id] = b;
      desk.appendChild(b);
    });
    layoutDesktop();
  }

  function layoutDesktop() {
    if (stackMode) return;
    if (small()) { layoutDesktopRow(); return; }
    Object.keys(deskIcons).forEach(function (k) { deskIcons[k].style.width = ''; });
    var W = 92;
    var x = vw() - W - (small() ? 2 : 8);
    var y = MENU_H + 8;
    var step = small() ? 60 : 66;
    DESKTOP_ITEMS.forEach(function (id) {
      var b = deskIcons[id];
      var hidden = trashed.indexOf(id) >= 0 || removed.indexOf(id) >= 0;
      b.hidden = hidden;
      if (hidden) return;
      var p = iconPos[id];
      if (p) {
        b.style.left = clamp(p.x, 0, vw() - W) + 'px';
        b.style.top = clamp(p.y, MENU_H + 2, vh() - 56) + 'px';
      } else {
        b.style.left = x + 'px';
        b.style.top = y + 'px';
        y += step;
      }
    });
    var t = deskIcons.trash;
    var tp = iconPos.trash;
    t.style.left = (tp ? clamp(tp.x, 0, vw() - W) : x) + 'px';
    t.style.top = (tp ? clamp(tp.y, MENU_H + 2, vh() - 56) : Math.max(y, vh() - 60)) + 'px';
  }

  // スマホ：アイコンを画面下に横一列で並べる（ウィンドウに隠れないように）
  var PHONE_DOCK = stackMode ? 8 : 66;
  function layoutDesktopRow() {
    var ids = DESKTOP_ITEMS.filter(function (id) {
      var hidden = trashed.indexOf(id) >= 0 || removed.indexOf(id) >= 0;
      deskIcons[id].hidden = hidden;
      return !hidden;
    }).concat(['trash']);
    var W = Math.min(78, Math.floor((vw() - 4) / ids.length));
    var y = vh() - PHONE_DOCK + 4;
    ids.forEach(function (id, i) {
      var b = deskIcons[id];
      b.style.width = W + 'px';
      b.style.left = (vw() - W * ids.length) / 2 + i * W + 'px';
      b.style.top = y + 'px';
    });
  }

  // マウスでデスクトップのアイコンを動かす（点線の枠だけ動かして、離したら移動）
  function startIconDrag(b, e) {
    var r = b.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY;
    var ghost = null;
    var trashIcon = deskIcons.trash;
    var overTrash = false;
    track(b, e, function (ev) {
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!ghost) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        ghost = el('div', { class: 'ghost ghost-icon' });
        ghost.style.width = r.width + 'px';
        ghost.style.height = r.height + 'px';
        desk.appendChild(ghost);
      }
      ghost.style.left = (r.left + dx) + 'px';
      ghost.style.top = (r.top + dy) + 'px';
      var tr = trashIcon.getBoundingClientRect();
      overTrash = ev.clientX >= tr.left && ev.clientX <= tr.right && ev.clientY >= tr.top && ev.clientY <= tr.bottom;
      trashIcon.classList.toggle('drop-target', overTrash);
    }, function (ev) {
      trashIcon.classList.remove('drop-target');
      if (!ghost) return;
      ghost.remove();
      var id = b.dataset.id;
      if (overTrash) {
        trashed.push(id);
        if (selectedIcon === b) selectIcon(null);
        refreshIconArt('trash');
        layoutDesktop();
        refreshFolder('trash');
        return;
      }
      iconPos[id] = { x: r.left + ev.clientX - sx, y: r.top + ev.clientY - sy };
      layoutDesktop();
    });
  }

  // ポインターを最後まで追いかける共通処理
  function track(target, e, onMove, onUp) {
    try { target.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    function move(ev) { if (ev.pointerId === e.pointerId) onMove(ev); }
    function up(ev) {
      if (ev.pointerId !== e.pointerId) return;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      onUp(ev);
    }
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  // デスクトップの何もない所を押したら選択解除
  desk.addEventListener('pointerdown', function (e) {
    if (e.target === desk) {
      selectIcon(null);
      if (activeWin) { activeWin.el.classList.remove('active'); activeWin = null; }
    }
  });

  /* ----------------------------------------------------------
     ウィンドウ
     ---------------------------------------------------------- */
  var wins = {};
  var activeWin = null;
  var zTop = 10;
  var cascade = 0;

  function openWins() {
    return Object.keys(wins).map(function (k) { return wins[k]; }).filter(function (w) { return !w.el.hidden && !w.inline; });
  }

  // parent を渡すと、その中に「縦並び用のウィンドウ」として置く（スマホ用）
  function createWin(id, parent) {
    var d = DEFS[id];
    var closeBtn = el('button', { class: 'win-close', type: 'button', 'aria-label': d.title + ' を閉じる' });
    var name = el('span', { class: 'win-name', text: d.title });
    var title = el('div', { class: 'win-title' }, [closeBtn, name]);
    var body = el('div', { class: 'win-body' + (d.noPad ? ' no-pad' : '') });
    var resize = d.fixed ? null : el('div', { class: 'win-resize', 'aria-hidden': 'true' });
    var info = d.folder ? el('div', { class: 'win-info' }) : null;
    var w = el('div', { class: 'win' + (d.cls ? ' ' + d.cls : ''), role: 'region', 'aria-label': d.title, hidden: true },
      [title, info, body, resize]);

    var win = { id: id, def: d, el: w, body: body, info: info, src: null, inline: !!parent };
    wins[id] = win;

    if (d.folder) body.appendChild(buildFolder(win));
    else if (d.build) body.appendChild(d.build(win));
    (parent || desk).appendChild(w);

    w.addEventListener('pointerdown', function () { focusWin(win); }, true);
    closeBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

    if (win.inline) {
      // 縦並び：タイトルバー（閉じるボックス含む）をタップすると畳む／開く
      w.classList.add('inline');
      w.hidden = false;
      win.placed = true;
      closeBtn.setAttribute('aria-label', d.title + ' を畳む・開く');
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', 'true');
      var toggle = function () { setCollapsed(win, !w.classList.contains('collapsed')); };
      title.addEventListener('click', toggle);
      title.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      return win;
    }

    closeBtn.addEventListener('click', function () { closeWin(win); });
    title.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || e.target === closeBtn) return;
      startWinDrag(win, e, title);
    });
    if (resize) resize.addEventListener('pointerdown', function (e) { if (e.button === 0) startWinResize(win, e, resize); });
    return win;
  }

  function placeWin(win) {
    var d = win.def;
    var x, y, w, h;
    var top = MENU_H + 4;
    if (small()) {
      w = vw() - 8;
      x = 4;
      y = top + (cascade % 4) * 24;
      h = vh() - y - PHONE_DOCK;
      if (d.fixed || d.folder) h = Math.min(d.h + (d.folder ? 40 : 20), h);
      if (d.fixed) { w = Math.min(w, d.w + 40); x = Math.round((vw() - w) / 2); }
    } else {
      w = Math.min(d.w, vw() - 24);
      h = Math.min(d.h, vh() - top - 12);
      if (d.pos) {
        var p = d.pos();
        x = p.x; y = p.y;
      } else {
        x = 30 + (cascade % 8) * 22;
        y = top + 16 + (cascade % 8) * 20;
      }
      x = clamp(x, 4, vw() - w - 4);
      y = clamp(y, top, Math.max(top, vh() - h - 4));
    }
    cascade++;
    setRect(win.el, x, y, w, h);
  }

  function setRect(n, x, y, w, h) {
    n.style.left = Math.round(x) + 'px';
    n.style.top = Math.round(y) + 'px';
    if (w != null) n.style.width = Math.round(w) + 'px';
    if (h != null) n.style.height = Math.round(h) + 'px';
  }

  function openItem(id, srcEl) {
    var d = DEFS[id];
    if (!d) return;
    closeMenus();
    // 縦並びモードでは、並んでいるウィンドウまでスクロールして開く
    if (stackMode) {
      var target = id === 'projects' ? wins[projectIds[0]] : wins[id];
      if (target && target.inline) { scrollToWin(target); return; }
    }
    var win = wins[id] || createWin(id);
    if (!win.el.hidden) { focusWin(win); return; }
    if (!win.placed) { placeWin(win); win.placed = true; }
    else if (small()) placeWin(win);
    if (d.folder) refreshFolder(id);
    win.src = srcEl || null;
    if (srcEl) srcEl.classList.add('opened');
    var from = srcEl ? srcEl.querySelector('img').getBoundingClientRect() : { left: vw() / 2 - 8, top: vh() / 2 - 8, width: 16, height: 16 };
    // 一瞬だけ表示して大きさを測る
    win.el.hidden = false;
    var to = win.el.getBoundingClientRect();
    win.el.hidden = true;
    zoom(from, to, function () {
      win.el.hidden = false;
      focusWin(win);
      if (d.onOpen) d.onOpen(win);
    });
  }

  function focusWin(win) {
    if (!win || win.el.hidden) return;
    if (win.inline) {
      if (activeWin && activeWin !== win && !activeWin.inline) activeWin.el.classList.remove('active');
      activeWin = win;
      return;
    }
    if (activeWin !== win) {
      if (activeWin) activeWin.el.classList.remove('active');
      activeWin = win;
    }
    win.el.classList.add('active');
    if (+win.el.style.zIndex !== zTop) win.el.style.zIndex = ++zTop;
  }

  function closeWin(win, instant) {
    if (win.el.hidden) return;
    var from = win.el.getBoundingClientRect();
    win.el.hidden = true;
    win.el.classList.remove('active');
    if (win.src) win.src.classList.remove('opened');
    if (activeWin === win) {
      activeWin = null;
      var rest = openWins().sort(function (a, b) { return (+b.el.style.zIndex) - (+a.el.style.zIndex); });
      if (rest[0]) focusWin(rest[0]);
    }
    var target = win.src && win.src.offsetParent ? win.src.querySelector('img').getBoundingClientRect() : null;
    if (target && !instant) zoom(from, target, function () {});
  }

  function closeAll() {
    openWins().forEach(function (w) { closeWin(w, true); });
    if (stackMode) Object.keys(wins).forEach(function (k) { if (wins[k].inline) setCollapsed(wins[k], true); });
  }

  /* ----------------------------------------------------------
     縦並びモード（スマホ）
     ---------------------------------------------------------- */
  var stack = null;
  var STACK_ORDER = ['profile'].concat(projectIds, ['skills', 'strengths', 'experience', 'activity', 'goals', 'contact']);

  function buildStack() {
    stack = el('div', { class: 'stack' });
    desk.appendChild(stack);
    STACK_ORDER.forEach(function (id) { if (DEFS[id]) createWin(id, stack); });
    stack.appendChild(el('p', { class: 'stack-foot', text: '左上の Apple メニューから、電卓・Note Pad・パズル・MacPaint も開けます。' }));
  }

  function setCollapsed(win, on) {
    win.el.classList.toggle('collapsed', on);
    var t = win.el.querySelector('.win-title');
    if (t) t.setAttribute('aria-expanded', on ? 'false' : 'true');
  }

  function scrollToWin(win) {
    setCollapsed(win, false);
    focusWin(win);
    if (!stack) return;
    var top = win.el.getBoundingClientRect().top - stack.getBoundingClientRect().top + stack.scrollTop - 8;
    try { stack.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    catch (e) { stack.scrollTop = top; }
  }

  // アイコンからウィンドウへ枠が広がるアニメーション
  function zoom(from, to, done) {
    if (reduceMotion) { done(); return; }
    var steps = 9, i = 0, trail = [];
    function lerp(a, b, t) { return a + (b - a) * t; }
    function frame() {
      i++;
      var t = i / steps;
      var g = el('div', { class: 'ghost' });
      setRect(g, lerp(from.left, to.left, t), lerp(from.top, to.top, t),
        lerp(from.width, to.width, t), lerp(from.height, to.height, t));
      desk.appendChild(g);
      trail.push(g);
      if (trail.length > 3) trail.shift().remove();
      if (i < steps) requestAnimationFrame(frame);
      else setTimeout(function () { trail.forEach(function (n) { n.remove(); }); done(); }, 16);
    }
    requestAnimationFrame(frame);
  }

  // 初代Macと同じく、ドラッグ中は点線の枠だけ動かし、離したら移動する
  function startWinDrag(win, e, handle) {
    focusWin(win);
    if (small()) return;
    e.preventDefault();
    var r = win.el.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY;
    var ghost = null, nx = r.left, ny = r.top;
    track(handle, e, function (ev) {
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!ghost) {
        if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        ghost = el('div', { class: 'ghost' });
        desk.appendChild(ghost);
      }
      nx = clamp(r.left + dx, 40 - r.width, vw() - 40);
      ny = clamp(r.top + dy, MENU_H, vh() - 20);
      setRect(ghost, nx, ny, r.width, r.height);
    }, function () {
      if (!ghost) return;
      ghost.remove();
      setRect(win.el, nx, ny);
    });
  }

  function startWinResize(win, e, handle) {
    focusWin(win);
    if (small()) return;
    e.preventDefault();
    e.stopPropagation();
    var r = win.el.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY;
    var ghost = null, nw = r.width, nh = r.height;
    track(handle, e, function (ev) {
      if (!ghost) { ghost = el('div', { class: 'ghost' }); desk.appendChild(ghost); }
      nw = clamp(r.width + ev.clientX - sx, 160, vw() - r.left - 2);
      nh = clamp(r.height + ev.clientY - sy, 90, vh() - r.top - 2);
      setRect(ghost, r.left, r.top, nw, nh);
    }, function () {
      if (!ghost) return;
      ghost.remove();
      win.el.style.width = Math.round(nw) + 'px';
      win.el.style.height = Math.round(nh) + 'px';
    });
  }

  /* ----------------------------------------------------------
     フォルダ
     ---------------------------------------------------------- */
  function buildFolder(win) {
    var view = el('div', { class: 'folder-view' + (viewMode === 'list' ? ' list' : '') });
    view.addEventListener('pointerdown', function (e) { if (e.target === view) selectIcon(null); });
    win.view = view;
    return view;
  }

  function refreshFolder(id) {
    var win = wins[id];
    if (!win || !win.view) return;
    var items = id === 'trash' ? trashed.slice() : DEFS[id].items;
    win.view.textContent = '';
    items.forEach(function (it) { win.view.appendChild(makeIcon(it, false)); });
    if (!items.length) win.view.appendChild(el('p', { class: 'folder-empty', text: id === 'trash' ? 'ゴミ箱は空です。' : '' }));
    var kb = items.length * 42 + 128;
    win.info.textContent = '';
    win.info.appendChild(el('span', { text: items.length + (items.length === 1 ? ' item' : ' items') }));
    win.info.appendChild(el('span', { text: kb + 'K in disk' }));
    win.info.appendChild(el('span', { text: (400 - Math.min(kb, 380)) + 'K available' }));
  }

  function setView(mode) {
    viewMode = mode;
    Object.keys(wins).forEach(function (k) {
      if (wins[k].view) wins[k].view.classList.toggle('list', mode === 'list');
    });
  }

  /* ----------------------------------------------------------
     Special メニューなど
     ---------------------------------------------------------- */
  function cleanUp() {
    iconPos = {};
    removed = [];
    layoutDesktop();
  }

  function emptyTrash() {
    var n = trashed.length;
    removed = removed.concat(trashed);
    trashed = [];
    refreshIconArt('trash');
    refreshFolder('trash');
    layoutDesktop();
    alertBox([
      el('p', { text: 'ゴミ箱を空にしました（' + n + ' 項目）。' }),
      el('p', { text: '中身は「Shunsuke HD」にすべて残っています。Special → Clean Up でデスクトップに戻せます。' })
    ]);
  }

  function aboutMac() {
    alertBox(el('div', { class: 'about-mac' }, [
      el('p', {}, [el('strong', { text: "Shunsuke's Macintosh" })]),
      el('p', { text: '熊谷 駿介（kumatani shunsuke）のポートフォリオ。' }),
      el('dl', {}, [
        el('dt', { text: 'System' }), el('dd', { text: '1.0 Portfolio Edition' }),
        el('dt', { text: 'Built with' }), el('dd', { text: 'HTML / CSS / JavaScript（フレームワークなし）' }),
        el('dt', { text: 'Memory' }), el('dd', { text: '128K' }),
        el('dt', { text: 'GitHub' }), el('dd', {}, [el('a', { href: 'https://github.com/' + GITHUB_USER, target: '_blank', rel: 'noopener', text: '@' + GITHUB_USER })])
      ])
    ]), 'happyMac');
  }

  function copySelection() {
    var text = savedSelection;
    if (!text) return;
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    if (!ok && navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
  }

  function selectAll() {
    if (!activeWin) return;
    var sel = window.getSelection();
    var range = doc.createRange();
    range.selectNodeContents(activeWin.body);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function restart() {
    closeAll();
    boot(startupWindows);
  }

  // 初代Mac風の警告ダイアログ
  function alertBox(contentNode, artName) {
    var shade = el('div', { class: 'dialog-shade' });
    var ok = el('button', { class: 'mac-btn default', type: 'button', text: 'OK' });
    var box = el('div', { class: 'dialog', role: 'alertdialog', 'aria-modal': 'true' }, [
      artImg(artName || 'note'),
      el('div', { class: 'dialog-text' }, [].concat(contentNode).concat([el('div', { class: 'dialog-actions' }, [ok])]))
    ]);
    shade.appendChild(box);
    desk.appendChild(shade);
    var prev = doc.activeElement;
    function close() {
      shade.remove();
      doc.removeEventListener('keydown', onKey, true);
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    }
    ok.addEventListener('click', close);
    doc.addEventListener('keydown', onKey, true);
    ok.focus();
  }

  /* ----------------------------------------------------------
     アプリ：MacPaint
     ---------------------------------------------------------- */
  function buildPaint() {
    var W = 480, H = 300;
    var canvas = el('canvas', { class: 'paint-canvas', width: W, height: H, 'aria-label': 'MacPaint のキャンバス' });
    canvas.style.width = W + 'px';
    var g = canvas.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#000';
    g.font = 'bold 14px Geneva, sans-serif';
    g.fillText("Hello from Shunsuke's Macintosh!", 16, 28);

    var tool = 'pencil', size = 1;
    var TOOLS = [
      ['pencil', '✎', '鉛筆'], ['eraser', '▭', '消しゴム'],
      ['line', '╲', '直線'], ['rect', '□', '四角'],
      ['oval', '○', '楕円'], ['spray', '⁙', 'スプレー'],
      ['size', '•', '線の太さ'], ['clear', '✕', 'ぜんぶ消す']
    ];
    var toolBox = el('div', { class: 'paint-tools' });
    var toolBtns = {};
    TOOLS.forEach(function (t) {
      var b = el('button', { class: 'paint-tool' + (t[0] === tool ? ' on' : ''), type: 'button', title: t[2], 'aria-label': t[2], text: t[1] });
      b.addEventListener('click', function () {
        if (t[0] === 'clear') { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); return; }
        if (t[0] === 'size') { size = size === 1 ? 3 : size === 3 ? 6 : 1; b.textContent = size === 1 ? '•' : size === 3 ? '●' : '⬤'; return; }
        tool = t[0];
        Object.keys(toolBtns).forEach(function (k) { toolBtns[k].classList.toggle('on', k === tool); });
      });
      toolBtns[t[0]] = b;
      toolBox.appendChild(b);
    });

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: Math.floor((e.clientX - r.left) * W / r.width), y: Math.floor((e.clientY - r.top) * H / r.height) };
    }
    function dot(x, y, s, color) {
      g.fillStyle = color || '#000';
      var o = Math.floor(s / 2);
      g.fillRect(x - o, y - o, s, s);
    }
    function line(x0, y0, x1, y1, s, color) {
      var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
      for (;;) {
        dot(x0, y0, s, color);
        if (x0 === x1 && y0 === y1) break;
        var e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
    function oval(x0, y0, x1, y1, s) {
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
      var n = Math.max(24, Math.ceil((rx + ry) * 2));
      var px = null, py = null;
      for (var i = 0; i <= n; i++) {
        var a = (i / n) * Math.PI * 2;
        var x = Math.round(cx + rx * Math.cos(a)), y = Math.round(cy + ry * Math.sin(a));
        if (px !== null) line(px, py, x, y, s); else dot(x, y, s);
        px = x; py = y;
      }
    }

    var drawing = null;
    canvas.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      e.preventDefault();
      var p = pos(e);
      drawing = { start: p, last: p, snap: g.getImageData(0, 0, W, H) };
      if (tool === 'pencil') dot(p.x, p.y, size);
      if (tool === 'eraser') dot(p.x, p.y, 12, '#fff');
      track(canvas, e, function (ev) {
        var q = pos(ev);
        var s = drawing.start;
        if (tool === 'pencil') line(drawing.last.x, drawing.last.y, q.x, q.y, size);
        else if (tool === 'eraser') line(drawing.last.x, drawing.last.y, q.x, q.y, 12, '#fff');
        else if (tool === 'spray') {
          for (var i = 0; i < 12; i++) {
            var a = Math.random() * Math.PI * 2, r = Math.random() * 10;
            dot(Math.round(q.x + Math.cos(a) * r), Math.round(q.y + Math.sin(a) * r), 1);
          }
        } else {
          g.putImageData(drawing.snap, 0, 0);
          if (tool === 'line') line(s.x, s.y, q.x, q.y, size);
          if (tool === 'rect') {
            line(s.x, s.y, q.x, s.y, size); line(q.x, s.y, q.x, q.y, size);
            line(q.x, q.y, s.x, q.y, size); line(s.x, q.y, s.x, s.y, size);
          }
          if (tool === 'oval') oval(s.x, s.y, q.x, q.y, size);
        }
        drawing.last = q;
      }, function () { drawing = null; });
    });

    var wrap = el('div', { class: 'paint-canvas-wrap' }, [canvas]);
    return el('div', { class: 'app paint' }, [toolBox, wrap]);
  }

  /* ----------------------------------------------------------
     アプリ：電卓
     ---------------------------------------------------------- */
  function buildCalc(win) {
    var display = el('div', { class: 'calc-display', role: 'status', 'aria-live': 'polite', text: '0' });
    var cur = '0', acc = null, op = null, fresh = true;
    function fmt(n) {
      if (!isFinite(n)) return 'Error';
      var s = String(parseFloat(n.toPrecision(10)));
      if (s.length > 13) s = n.toExponential(6);
      return s;
    }
    function compute() {
      var b = parseFloat(cur), r = acc;
      if (op === '+') r = acc + b;
      if (op === '-') r = acc - b;
      if (op === '*') r = acc * b;
      if (op === '/') r = acc / b;
      acc = r;
      cur = fmt(r);
    }
    function press(k) {
      if (cur === 'Error' && k !== 'C') return;
      if (/[0-9.]/.test(k)) {
        if (fresh) { cur = k === '.' ? '0.' : k; fresh = false; }
        else if (k === '.' && cur.indexOf('.') >= 0) return;
        else if (cur.length < 12) cur = (cur === '0' && k !== '.') ? k : cur + k;
      } else if (k === 'C') { cur = '0'; acc = null; op = null; fresh = true; }
      else if (k === 'E') { cur = '0'; fresh = true; }
      else if (k === '=') { if (op !== null) compute(); op = null; fresh = true; }
      else {
        if (op !== null && !fresh) compute(); else acc = parseFloat(cur);
        op = k; fresh = true;
      }
      display.textContent = cur;
    }
    var LABEL = { '*': '×', '/': '÷', '-': '−' };
    var keys = el('div', { class: 'calc-keys' });
    var keyBtns = {};
    ['C', 'E', '/', '*', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].forEach(function (k) {
      var b = el('button', { class: 'calc-key' + (k === '0' || k === '.' ? ' wide' : ''), type: 'button', text: LABEL[k] || k });
      b.addEventListener('click', function () { press(k); });
      keyBtns[k] = b;
      keys.appendChild(b);
    });
    win.def.onKey = function (e) {
      var k = e.key;
      if (k === 'Enter') k = '=';
      if (k === 'Escape') k = 'C';
      if (k === 'Backspace') k = 'E';
      if (k === 'x' || k === 'X') k = '*';
      if (keyBtns[k]) {
        e.preventDefault();
        press(k);
        keyBtns[k].classList.add('press');
        setTimeout(function () { keyBtns[k].classList.remove('press'); }, 90);
      }
    };
    return el('div', { class: 'app calc' }, [display, keys]);
  }

  /* ----------------------------------------------------------
     アプリ：Note Pad（8ページ。ブラウザ内にだけ保存）
     ---------------------------------------------------------- */
  function buildNotePad() {
    var KEY = 'shunsuke-mac-notepad';
    var pages = ['Note Pad へようこそ。\nここに書いたメモは、このブラウザの中にだけ保存されます。', '', '', '', '', '', '', ''];
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && saved.length === 8) pages = saved;
    } catch (e) { /* 保存できない環境でも動く */ }
    var page = 0;
    var ta = el('textarea', { 'aria-label': 'Note Pad', spellcheck: 'false' });
    var label = el('span', {});
    function show() { ta.value = pages[page]; label.textContent = 'Page ' + (page + 1) + ' / 8'; }
    ta.addEventListener('input', function () {
      pages[page] = ta.value;
      try { localStorage.setItem(KEY, JSON.stringify(pages)); } catch (e) { /* noop */ }
    });
    var prev = el('button', { type: 'button', text: '◀', 'aria-label': '前のページ' });
    var next = el('button', { type: 'button', text: '▶', 'aria-label': '次のページ' });
    prev.addEventListener('click', function () { page = (page + 7) % 8; show(); });
    next.addEventListener('click', function () { page = (page + 1) % 8; show(); });
    show();
    return el('div', { class: 'app notepad' }, [ta, el('div', { class: 'notepad-bar' }, [prev, label, next])]);
  }

  /* ----------------------------------------------------------
     アプリ：15パズル
     ---------------------------------------------------------- */
  function buildPuzzle() {
    var tiles = [];
    var grid = el('div', { class: 'puzzle-grid', role: 'grid', 'aria-label': '15パズル' });
    var msg = el('div', { class: 'puzzle-msg', role: 'status' });
    var moves = 0;
    function neighbors(i) {
      var r = Math.floor(i / 4), c = i % 4, n = [];
      if (r > 0) n.push(i - 4);
      if (r < 3) n.push(i + 4);
      if (c > 0) n.push(i - 1);
      if (c < 3) n.push(i + 1);
      return n;
    }
    function shuffle() {
      tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
      var blank = 15, last = -1;
      for (var k = 0; k < 160; k++) {
        var opts = neighbors(blank).filter(function (n) { return n !== last; });
        var pick = opts[Math.floor(Math.random() * opts.length)];
        tiles[blank] = tiles[pick]; tiles[pick] = 0;
        last = blank; blank = pick;
      }
      moves = 0;
      msg.textContent = '';
      render();
    }
    function solved() {
      for (var i = 0; i < 15; i++) if (tiles[i] !== i + 1) return false;
      return true;
    }
    function render() {
      grid.textContent = '';
      tiles.forEach(function (t, i) {
        var b = el('button', { class: 'puzzle-tile' + (t ? '' : ' blank'), type: 'button', text: t ? String(t) : '', 'aria-label': t ? String(t) : '空き' });
        if (!t) b.tabIndex = -1;
        b.addEventListener('click', function () {
          var blank = tiles.indexOf(0);
          if (neighbors(blank).indexOf(i) < 0) return;
          tiles[blank] = tiles[i]; tiles[i] = 0;
          moves++;
          render();
          if (solved()) msg.textContent = 'クリア！ ' + moves + ' 手';
        });
        grid.appendChild(b);
      });
    }
    var again = el('button', { class: 'mac-btn', type: 'button', text: 'Shuffle' });
    again.addEventListener('click', shuffle);
    shuffle();
    return el('div', { class: 'app puzzle' }, [grid, msg, again]);
  }

  /* ----------------------------------------------------------
     既存機能：GitHubの草・お問い合わせフォーム・プロフィール写真
     ---------------------------------------------------------- */
  function loadContrib() {
    var graphEl = doc.getElementById('contrib-graph');
    var totalEl = doc.getElementById('contrib-total');
    var fallbackEl = doc.getElementById('contrib-fallback');
    if (!graphEl || !totalEl) return;
    totalEl.textContent = 'Loading…';
    if (fallbackEl) fallbackEl.hidden = true;

    // 読み込めないとき：グラフ画像 → それも無理なら案内文とリンク
    var failed = false;
    function fail() {
      if (failed) return;
      failed = true;
      totalEl.textContent = '@' + GITHUB_USER;
      graphEl.textContent = '';
      graphEl.style.display = 'block';
      var img = el('img', { src: 'https://ghchart.rshah.org/000000/' + GITHUB_USER, alt: 'GitHub contributions' });
      img.addEventListener('error', function () {
        img.remove();
        graphEl.style.display = 'none';
        if (fallbackEl) fallbackEl.hidden = false;
      });
      graphEl.appendChild(img);
    }
    // 8秒たっても返ってこなければ諦める
    var timer = setTimeout(fail, 8000);

    fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(function (data) {
        var days = data.contributions || [];
        if (!days.length) throw new Error('no data');
        if (failed) return;
        clearTimeout(timer);
        var frag = doc.createDocumentFragment();
        var offset = new Date(days[0].date).getDay();
        for (var i = 0; i < offset; i++) {
          var pad = doc.createElement('i');
          pad.style.visibility = 'hidden';
          frag.appendChild(pad);
        }
        var total = 0;
        days.forEach(function (d) {
          var c = doc.createElement('i');
          c.setAttribute('data-level', String(+d.level || 0));
          c.title = d.date + ': ' + (+d.count || 0) + ' contributions';
          total += +d.count || 0;
          frag.appendChild(c);
        });
        graphEl.textContent = '';
        graphEl.appendChild(frag);
        totalEl.textContent = total.toLocaleString() + ' contributions in the last year';
        var sc = graphEl.parentNode;
        if (sc) sc.scrollLeft = sc.scrollWidth;
      })
      .catch(function () {
        clearTimeout(timer);
        fail();
      });
  }

  // お問い合わせ（Netlify Forms に fetch で送る。元の script.js と同じ仕組み）
  function setupContactForm() {
    var form = doc.getElementById('contact-form');
    var statusEl = doc.getElementById('contact-status');
    if (!form || !statusEl) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.term-submit');
      btn.disabled = true;
      statusEl.className = 'term-status';
      statusEl.textContent = 'sending...';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error('failed');
          form.reset();
          statusEl.className = 'term-status ok';
          statusEl.textContent = '✔ exit 0 — 送信しました。ありがとうございます!';
        })
        .catch(function () {
          statusEl.className = 'term-status err';
          statusEl.textContent = '✖ exit 1 — 送信に失敗しました。時間をおいてお試しください。';
        })
        .then(function () { btn.disabled = false; });
    });
  }

  // 外部リンクは必ず新しいタブで開く
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="http"]'), function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ----------------------------------------------------------
     キーボード・画面サイズの変化・URLの #
     ---------------------------------------------------------- */
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openMenuId) { closeMenus(); return; }
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    if (!typing && activeWin && activeWin.def.onKey) activeWin.def.onKey(e);
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // PC表示 ⇔ 縦並びが切り替わる幅になったら、作り直す
      if (computeStack() !== stackMode) { location.reload(); return; }
      layoutDesktop();
      openWins().forEach(function (w) {
        var r = w.el.getBoundingClientRect();
        if (small()) {
          var top = clamp(r.top, MENU_H + 4, vh() - 60);
          setRect(w.el, 4, top, vw() - 8, Math.min(r.height, vh() - top - PHONE_DOCK));
        } else {
          setRect(w.el, clamp(r.left, 4 - r.width + 60, vw() - 60), clamp(r.top, MENU_H, vh() - 40));
        }
      });
    }, 120);
  });

  var ANCHORS = {};
  Object.keys(DEFS).forEach(function (k) { if (DEFS[k].anchor) ANCHORS[DEFS[k].anchor] = k; });
  function openFromHash() {
    var id = ANCHORS[decodeURIComponent(location.hash.slice(1))];
    if (id) openItem(id, findIcon(id));
  }
  window.addEventListener('hashchange', openFromHash);

  /* ----------------------------------------------------------
     起動：ニコちゃんMac → Welcome → profile.md と Projects を開く
     ---------------------------------------------------------- */
  DEFS.profile && (DEFS.profile.pos = function () { return { x: 20, y: MENU_H + 12 }; });
  DEFS.projects && (DEFS.projects.pos = function () {
    return { x: Math.min(vw() - 400 - 120, 330), y: Math.min(vh() - 240, MENU_H + 300) };
  });

  function boot(done) {
    var b = el('div', { class: 'boot', role: 'img', 'aria-label': 'Welcome to Shunsuke\'s Macintosh.' });
    var happy = artImg('happyMac', 'boot-happy');
    b.appendChild(happy);
    b.appendChild(el('div', { class: 'boot-skip' }, [el('span', { text: stackMode ? 'タップでスキップ' : 'クリックでスキップ' })]));
    doc.body.appendChild(b);
    var timers = [];
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      b.remove();
      doc.removeEventListener('keydown', finish);
      done();
    }
    b.addEventListener('pointerdown', finish);
    doc.addEventListener('keydown', finish);
    var t1 = reduceMotion ? 300 : 1100;
    var t2 = reduceMotion ? 900 : 1500;
    timers.push(setTimeout(function () {
      happy.remove();
      b.insertBefore(el('div', { class: 'boot-welcome', text: 'Welcome to Shunsuke’s Macintosh.' }), b.firstChild);
    }, t1));
    timers.push(setTimeout(finish, t1 + t2));
  }

  function startupWindows() {
    if (stackMode) { if (location.hash) openFromHash(); return; }
    openItem('profile', findIcon('profile'));
    setTimeout(function () {
      openItem('projects', findIcon('projects'));
      if (location.hash) setTimeout(openFromHash, 300);
    }, reduceMotion ? 0 : 350);
  }

  if (stackMode) buildStack(); else buildDesktopIcons();
  setupContactForm();
  loadContrib();
  boot(startupWindows);
})();
