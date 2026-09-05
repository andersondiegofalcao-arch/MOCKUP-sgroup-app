/* ============ Sgroup — mockup interativo ============ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return String(n).length < 2 ? '0' + n : String(n); };
  var hhmm = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

  /* ---------- Relógio da status bar ---------- */
  function tick() { $('#sb-time').textContent = hhmm(new Date()); }
  tick();
  setInterval(tick, 30000);

  /* ---------- Navegação ---------- */
  var currentTab = 'screen-home';
  var stack = [];

  function activeId() {
    var s = $('.screen.active');
    return s ? s.id : currentTab;
  }
  function render(id) {
    $$('.screen').forEach(function (el) {
      var on = el.id === id;
      el.classList.toggle('active', on);
      if (on) el.scrollTop = 0;
    });
    $$('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === currentTab);
    });
  }
  function goTab(id) { currentTab = id; stack = []; render(id); }
  function goStack(id) { stack.push(activeId()); render(id); }
  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('tab')) { goTab(id); } else { goStack(id); }
  }
  function goBack() { render(stack.pop() || currentTab); }

  /* ---------- Sheets, modais e toast ---------- */
  function openSheet(id) { closeSheets(); $('#' + id).classList.add('open'); }
  function closeSheets() { $$('.sheet.open').forEach(function (s) { s.classList.remove('open'); }); }
  $$('.sheet').forEach(function (s) {
    s.addEventListener('click', function (e) { if (e.target === s) closeSheets(); });
  });

  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- Delegação de cliques ---------- */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-go]'))) {
      go(el.dataset.go);
      if (el.dataset.go === 'screen-notifications') {
        var d = $('.bell .dot');
        if (d) d.remove();
      }
      return;
    }
    if (e.target.closest('[data-back]')) { goBack(); return; }
    if ((el = e.target.closest('[data-assist]'))) { openAssistSheet(el.dataset.assist); return; }
    if ((el = e.target.closest('[data-doc]'))) { toast('Abrindo "' + el.dataset.doc + '" (demonstração)'); return; }
    if ((el = e.target.closest('[data-toast]'))) { toast(el.dataset.toast); return; }
    if (e.target.closest('[data-close]')) { closeSheets(); return; }
  });

  /* ---------- Fluxo de assistência ---------- */
  var selType = 'Guincho';

  function openAssistSheet(type) {
    selType = type || 'Guincho';
    $$('#assist-chips .chip').forEach(function (c) {
      c.classList.toggle('sel', c.dataset.type === selType);
    });
    openSheet('sheet-assist');
  }
  $('#btn-request').addEventListener('click', function () { openAssistSheet(selType); });
  $$('#assist-chips .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      selType = c.dataset.type;
      $$('#assist-chips .chip').forEach(function (x) { x.classList.toggle('sel', x === c); });
    });
  });

  var etaT = null, stepT = null, eta = 25, stepIdx = 1;
  var stepEls = function () { return $$('#track-steps .step'); };

  function resetTrack() {
    clearInterval(etaT);
    clearInterval(stepT);
    eta = 25;
    stepIdx = 1;
    var now = hhmm(new Date());
    stepEls().forEach(function (el, i) {
      el.classList.remove('done', 'current');
      var sm = el.querySelector('small');
      if (i === 0) { el.classList.add('done'); sm.textContent = now; }
      else if (i === 1) { el.classList.add('current'); sm.textContent = now; }
      else { sm.textContent = '—'; }
    });
    $('#track-eta').textContent = eta + ' min';
    $('#track-status').textContent = 'Em andamento';
  }

  $('#btn-confirm-assist').addEventListener('click', function () {
    closeSheets();
    $('#track-type').textContent = selType;
    var chip = $$('#assist-chips .chip').filter(function (c) { return c.dataset.type === selType; })[0];
    if (chip) $('#track-ic use').setAttribute('href', '#' + chip.dataset.ic);
    $('#track-protocol').textContent = '#' + (4200 + Math.floor(Math.random() * 700)) + '-2026';
    resetTrack();
    go('screen-tracking');
    toast('Solicitação enviada com sucesso ✓');

    stepT = setInterval(function () {
      var els = stepEls();
      if (stepIdx >= els.length - 1) { clearInterval(stepT); return; }
      els[stepIdx].classList.remove('current');
      els[stepIdx].classList.add('done');
      stepIdx++;
      els[stepIdx].classList.add('current');
      els[stepIdx].querySelector('small').textContent = hhmm(new Date());
      if (stepIdx === els.length - 1) {
        els[stepIdx].classList.remove('current');
        els[stepIdx].classList.add('done');
        $('#track-status').textContent = 'Concluída';
        $('#track-eta').textContent = 'Chegou';
        clearInterval(etaT);
        clearInterval(stepT);
      }
    }, 9000);

    etaT = setInterval(function () {
      if (eta > 6) { eta--; $('#track-eta').textContent = eta + ' min'; }
    }, 4000);
  });

  $('#btn-cancel').addEventListener('click', function () { openSheet('modal-cancel'); });
  $('#btn-cancel-confirm').addEventListener('click', function () {
    clearInterval(etaT);
    clearInterval(stepT);
    closeSheets();
    goTab('screen-assist');
    toast('Solicitação cancelada');
  });

  /* ---------- Comunicar evento ---------- */
  var evType = null, fotos = 0, docs = 0;

  $$('.etype').forEach(function (b) {
    b.addEventListener('click', function () {
      evType = b.dataset.ev;
      $$('.etype').forEach(function (x) { x.classList.toggle('sel', x === b); });
      $('#btn-send-event').classList.remove('disabled');
    });
  });

  $('#att-photo').addEventListener('click', function () {
    fotos++;
    this.classList.add('done');
    this.querySelector('small').textContent = fotos + (fotos === 1 ? ' foto adicionada' : ' fotos adicionadas');
  });
  $('#att-doc').addEventListener('click', function () {
    docs++;
    this.classList.add('done');
    this.querySelector('small').textContent = docs + (docs === 1 ? ' documento anexado' : ' documentos anexados');
  });
  $('#att-loc').addEventListener('click', function () {
    this.classList.add('done');
    this.querySelector('small').textContent = 'Localização compartilhada';
  });

  $('#btn-send-event').addEventListener('click', function () {
    if (!evType) { toast('Selecione o tipo de evento'); return; }
    $('#ev-protocol').textContent = '#' + (7800 + Math.floor(Math.random() * 199)) + '-2026';
    openSheet('sheet-event-success');
  });
  $('#btn-ev-done').addEventListener('click', function () {
    closeSheets();
    resetEvent();
    goTab('screen-home');
  });
  function resetEvent() {
    evType = null; fotos = 0; docs = 0;
    $$('.etype').forEach(function (x) { x.classList.remove('sel'); });
    $('#ev-desc').value = '';
    [['#att-photo', 'Nenhuma foto adicionada'],
     ['#att-doc', 'Nenhum documento anexado'],
     ['#att-loc', 'Usar minha localização atual']].forEach(function (p) {
      var el = $(p[0]);
      el.classList.remove('done');
      el.querySelector('small').textContent = p[1];
    });
    $('#btn-send-event').classList.add('disabled');
  }

  /* ---------- PIX ---------- */
  var PIX_CODE = '00020126580014BR.GOV.BCB.PIX0136sgroup-demo-2f8a-4c1b-9e7d-mockpay5204000053039865406280.005802BR5911SGROUP DEMO6009FORTALEZA62070503***6304A1B2';

  $('#btn-pix').addEventListener('click', function () { openSheet('sheet-pix'); });
  $('#btn-copy-pix').addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PIX_CODE).then(
        function () { toast('Código PIX copiado ✓'); },
        function () { toast('Código PIX copiado ✓'); }
      );
    } else {
      toast('Código PIX copiado ✓');
    }
  });

  function buildQR() {
    var svg = $('#qr');
    if (!svg) return;
    var n = 25, cell = 8, seed = 987654321;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var sq = function (x, y, w, color, r) {
      return '<rect x="' + x + '" y="' + y + '" width="' + (w * cell) + '" height="' + (w * cell) + '" rx="' + r + '" fill="' + color + '"/>';
    };
    var out = '';
    var inFinder = function (r, c) {
      return (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    };
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (inFinder(r, c)) continue;
        if (rnd() > 0.52) {
          out += '<rect x="' + (c * cell) + '" y="' + (r * cell) + '" width="' + cell + '" height="' + cell + '" rx="2" fill="#0A2557"/>';
        }
      }
    }
    var fp = function (x, y) {
      out += sq(x, y, 7, '#0A2557', 12) + sq(x + cell, y + cell, 5, '#FFFFFF', 8) + sq(x + 2 * cell, y + 2 * cell, 3, '#0A2557', 6);
    };
    fp(0, 0);
    fp((n - 7) * cell, 0);
    fp(0, (n - 7) * cell);
    svg.setAttribute('viewBox', '0 0 ' + n * cell + ' ' + n * cell);
    svg.innerHTML = out;
  }
  buildQR();

  /* ---------- Financeiro ---------- */
  var swDebit = $('#sw-debit');
  if (swDebit) {
    swDebit.addEventListener('change', function () {
      toast(this.checked ? 'Débito automático ativado' : 'Débito automático desativado');
    });
  }

  /* ---------- Sair ---------- */
  $('#btn-logout').addEventListener('click', function () { openSheet('modal-logout'); });
  $('#btn-logout-confirm').addEventListener('click', function () {
    closeSheets();
    goTab('screen-home');
    $('#screen-home').classList.remove('boot');
    var lg = $('#screen-login');
    lg.classList.remove('gone');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { lg.classList.remove('out'); });
    });
    toast('Sessão encerrada');
  });

  /* ---------- Login ---------- */
  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#login-email').value.trim().toLowerCase();
    var pass = $('#login-pass').value;
    if (email !== 'joao.silva@email.com' || pass !== '1234') {
      var card = $('.login-card');
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      toast('E-mail ou senha inválidos');
      return;
    }
    var btn = $('#btn-login');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Entrando…';
    setTimeout(function () {
      $('#screen-login').classList.add('out');
      $('#screen-home').classList.add('boot');
      toast('Bem-vindo, João!');
      setTimeout(function () {
        $('#screen-login').classList.add('gone');
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }, 650);
    }, 950);
  });

  /* ---------- Central de push (teste) ---------- */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function pushHTML(title, msg) {
    return '<div class="push-head"><img src="img/logo.png" alt=""><span class="push-app">Sgroup</span><span class="push-time">agora</span></div>' +
      (title ? '<strong>' + esc(title) + '</strong>' : '') +
      (msg ? '<p>' + esc(msg) + '</p>' : '');
  }
  function sendPush(title, msg) {
    /* heads-up dentro do celular */
    var hu = document.createElement('div');
    hu.className = 'headsup-card';
    hu.innerHTML = pushHTML(title, msg);
    $('#headsup').appendChild(hu);
    var kill = function () {
      hu.classList.add('hide');
      setTimeout(function () { hu.remove(); }, 350);
    };
    hu.addEventListener('click', kill);
    setTimeout(kill, 5200);
    /* painel esquerdo */
    var out = $('#push-out');
    if (out) {
      var empty = $('#push-out-empty');
      if (empty) empty.remove();
      var card = document.createElement('div');
      card.className = 'push-card';
      card.innerHTML = pushHTML(title, msg);
      card.title = 'Clique para dispensar';
      card.addEventListener('click', function () { card.remove(); });
      out.insertBefore(card, out.firstChild);
      while (out.children.length > 3) out.removeChild(out.lastChild);
    }
  }
  var pushBtn = $('#btn-push');
  if (pushBtn) {
    pushBtn.addEventListener('click', function () {
      var title = $('#push-title').value.trim();
      var msg = $('#push-msg').value.trim();
      if (!title && !msg) { toast('Escreva um título ou uma mensagem'); return; }
      sendPush(title, msg);
    });
  }

  /* ---------- Boas-vindas ---------- */
  $('#btn-welcome-login').addEventListener('click', function () {
    var w = $('#screen-welcome');
    w.classList.add('out');
    var lg = $('#screen-login');
    lg.classList.remove('reveal');
    void lg.offsetWidth;
    lg.classList.add('reveal');
    setTimeout(function () { w.classList.add('gone'); }, 520);
  });
  $('#btn-login-back').addEventListener('click', function () {
    var w = $('#screen-welcome');
    w.classList.remove('gone');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { w.classList.remove('out'); });
    });
  });

  /* ---------- Arrastar carrossel com o mouse ---------- */
  $$('.promo-scroll').forEach(function (sc) {
    var down = false, dragged = false, startX = 0, startLeft = 0;
    sc.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; dragged = false;
      startX = e.clientX; startLeft = sc.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !dragged) { dragged = true; sc.classList.add('dragging'); }
      if (dragged) sc.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      sc.classList.remove('dragging');
    });
    sc.addEventListener('click', function (e) {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
    }, true);
  });

  /* ---------- Carrossel automático (loop infinito em uma direção) ---------- */
  $$('.promo-scroll').forEach(function (sc) {
    var originals = Array.prototype.slice.call(sc.children);
    if (!originals.length) return;
    originals.forEach(function (el) {
      var c = el.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      sc.appendChild(c);
    });
    var wrap = sc.children[originals.length].offsetLeft - sc.children[0].offsetLeft;
    var holdUntil = 0, pos = -1;
    function tick() {
      if (Date.now() >= holdUntil && !document.hidden && wrap > 0) {
        sc.classList.add('auto');
        if (pos < 0) pos = sc.scrollLeft;
        pos += 0.55;
        if (pos >= wrap) pos -= wrap;
        sc.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) {
      sc.addEventListener(ev, function () {
        holdUntil = Date.now() + 4000;
        pos = -1;
        sc.classList.remove('auto');
      }, { passive: true });
    });
  });

  /* ---------- Cotação por placa ---------- */
  var quotePlate = 'ABC1D23';
  function openOvl(id) { $('#' + id).classList.add('open'); }
  function closeOvl(id) { $('#' + id).classList.remove('open'); }
  $('#btn-welcome-quote').addEventListener('click', function () { openOvl('screen-quote'); });
  $('#btn-quote-back').addEventListener('click', function () { closeOvl('screen-quote'); });
  $('#q-plate').addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  function plateGo() {
    var v = $('#q-plate').value.trim();
    if (v.length < 7) { toast('Digite a placa completa'); return; }
    quotePlate = v;
    $('#q-result').hidden = true;
    $('#q-loading').hidden = false;
    setTimeout(function () {
      $('#q-loading').hidden = true;
      $('#q-plate-out').textContent = quotePlate;
      $('#q-result').hidden = false;
    }, 1400);
  }
  $('#btn-plate-go').addEventListener('click', plateGo);
  $('#q-plate').addEventListener('keydown', function (e) { if (e.key === 'Enter') plateGo(); });
  $('#btn-quote-go').addEventListener('click', function () {
    var name = $('#q-name').value.trim();
    if (!name) { toast('Digite como deseja ser chamado'); return; }
    openOvl('screen-chat');
    startChat(name);
  });
  $('#btn-chat-back').addEventListener('click', function () { closeOvl('screen-chat'); });

  /* ---------- Chat com a consultora ---------- */
  var chatTimers = [];
  function later(fn, ms) { chatTimers.push(setTimeout(fn, ms)); }
  function chatScroll() { var b = $('#chat-body'); b.scrollTop = b.scrollHeight; }
  function addBubble(cls, html) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.innerHTML = html;
    $('#chat-body').appendChild(d);
    chatScroll();
    return d;
  }
  function themSays(text, delay, typeMs) {
    later(function () {
      var t = document.createElement('div');
      t.className = 'typing';
      t.innerHTML = '<i></i><i></i><i></i>';
      $('#chat-body').appendChild(t);
      chatScroll();
      later(function () { t.remove(); addBubble('them', esc(text)); }, typeMs || 1500);
    }, delay);
  }
  function startChat(name) {
    chatTimers.forEach(clearTimeout);
    chatTimers = [];
    $('#chat-body').innerHTML = '';
    var first = name.split(' ')[0];
    addBubble('me', esc('Oi, sou ' + name + '! Tenho um Volkswagen T-Cross 200 TSI, placa ' + quotePlate + '.'));
    later(function () {
      addBubble('me',
        '<div>Gostaria de uma cotação de proteção, por favor. 🙏</div>' +
        '<div class="veh-mini"><img src="img/tcross.png" alt="">' +
        '<strong>Volkswagen T-Cross 200 TSI</strong>' +
        '<span>2023/2024 • Placa ' + esc(quotePlate) + '</span>' +
        '<span>FIPE 005510-7 • R$ 128.459,00</span></div>');
    }, 800);
    themSays('Oi, ' + first + '! Sou Jéssica Leão, sou Consultora Sgroup e irei lhe atender. 😊', 2100, 1700);
    themSays('Já localizei seu T-Cross pela tabela FIPE (005510-7 • R$ 128.459,00). Vou preparar sua cotação agora mesmo…', 5000, 1900);
    themSays('Prontinho! Sua proteção completa fica a partir de R$ 189,90/mês, com assistência 24h, guincho de até 200 km e carro reserva. Posso seguir com a sua adesão?', 8600, 2200);
  }
  var canned = [
    'Perfeito! Vou registrar aqui e te envio o resumo da adesão. 🚀',
    'Ótimo! Qualquer dúvida, estou à disposição por aqui.',
    'Combinado! 😊'
  ];
  var cannedIdx = 0;
  function chatSend() {
    var inp = $('#chat-text');
    var v = inp.value.trim();
    if (!v) return;
    inp.value = '';
    addBubble('me', esc(v));
    themSays(canned[cannedIdx++ % canned.length], 600, 1400);
  }
  $('#btn-chat-send').addEventListener('click', chatSend);
  $('#chat-text').addEventListener('keydown', function (e) { if (e.key === 'Enter') chatSend(); });

  /* ---------- Sgroup Score (velocímetro) ---------- */
  var SCORE = 870, SCORE_MAX = 1000;
  var GCX = 110, GCY = 122;
  function gx(r, t) { return GCX + r * Math.sin((-120 + 240 * t) * Math.PI / 180); }
  function gy(r, t) { return GCY - r * Math.cos((-120 + 240 * t) * Math.PI / 180); }
  function buildGauge() {
    var svg = $('#gauge');
    if (!svg) return;
    var R = 88, s = '';
    s += '<defs><linearGradient id="fireG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#EBBC4F"/><stop offset=".55" stop-color="#F59E0B"/><stop offset="1" stop-color="#EF4444"/></linearGradient></defs>';
    var arc = 'M' + gx(R, 0).toFixed(1) + ' ' + gy(R, 0).toFixed(1) + ' A' + R + ' ' + R + ' 0 1 1 ' + gx(R, 1).toFixed(1) + ' ' + gy(R, 1).toFixed(1);
    s += '<path d="' + arc + '" fill="none" stroke="#22406F" stroke-width="11" stroke-linecap="round"/>';
    s += '<path d="M' + gx(R, .75).toFixed(1) + ' ' + gy(R, .75).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + gx(R, 1).toFixed(1) + ' ' + gy(R, 1).toFixed(1) + '" fill="none" stroke="rgba(239,68,68,.35)" stroke-width="11" stroke-linecap="round"/>';
    s += '<path id="gauge-prog" d="' + arc + '" pathLength="100" fill="none" stroke="url(#fireG)" stroke-width="11" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="100"/>';
    for (var v = 0; v <= SCORE_MAX; v += 50) {
      var t = v / SCORE_MAX, major = v % 250 === 0;
      var col = v >= 750 ? '#FF9A62' : (major ? '#C8D8F5' : '#3B5685');
      s += '<line x1="' + gx(major ? 66 : 73, t).toFixed(1) + '" y1="' + gy(major ? 66 : 73, t).toFixed(1) + '" x2="' + gx(80, t).toFixed(1) + '" y2="' + gy(80, t).toFixed(1) + '" stroke="' + col + '" stroke-width="' + (major ? 2.5 : 1.5) + '" stroke-linecap="round"/>';
      if (major) {
        s += '<text x="' + gx(52, t).toFixed(1) + '" y="' + (gy(52, t) + 4).toFixed(1) + '" fill="#9DB9E8" font-size="11" font-weight="700" text-anchor="middle">' + v + '</text>';
      }
    }
    s += '<g id="gauge-needle"><line x1="' + GCX + '" y1="' + GCY + '" x2="' + GCX + '" y2="' + (GCY - 70) + '" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="' + GCX + '" cy="' + GCY + '" r="7" fill="#fff"/><circle cx="' + GCX + '" cy="' + GCY + '" r="3" fill="#0A2557"/></g>';
    svg.innerHTML = s;
  }
  buildGauge();
  var scoreRaf;
  function animateGauge() {
    var n = $('#gauge-needle'), p = $('#gauge-prog'), num = $('#score-num');
    if (!n) return;
    n.style.transition = 'none';
    p.style.transition = 'none';
    n.style.transform = 'rotate(-120deg)';
    p.style.strokeDashoffset = '100';
    void n.getBoundingClientRect();
    n.style.transition = '';
    p.style.transition = '';
    n.style.transform = 'rotate(' + (-120 + 240 * SCORE / SCORE_MAX) + 'deg)';
    p.style.strokeDashoffset = String(100 - 100 * SCORE / SCORE_MAX);
    cancelAnimationFrame(scoreRaf);
    var t0 = performance.now();
    (function count(now) {
      var k = Math.min(1, (now - t0) / 1400);
      var e = 1 - Math.pow(1 - k, 3);
      num.textContent = Math.round(SCORE * e);
      if (k < 1) scoreRaf = requestAnimationFrame(count);
    })(performance.now());
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-go="screen-finance"],[data-tab="screen-finance"]')) {
      setTimeout(animateGauge, 420);
    }
  });
})();
