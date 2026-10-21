(() => {
  const SITE_KEY = '6Ld2mMAbAAAAAM9grHC4aJ6pJT1TtvUz04q4Fvjs';
  const ACTION = 'submit_tramite';
  const STORE_KEY = 'mm-restore-nums';
  const LAST_KEY = 'mm-restore-last'; // case number -> last known status, shown in the suggestions
  const HOST_SELECTORS = ['body > main > div:nth-child(1) > div', 'main', 'body'];
  const REFRESH_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>';
  // special states the original site shows as a plain message instead of the progress view
  const TT_CPI = 24;
  const TT_MIGRACIONES = 111;
  const TT_SUSPENDIDO = 534;

  if (document.getElementById('mm-restore')) return;

  // ---------- UI texts ----------
  const t = {
    title: 'Seguimiento de trámite', placeholder: 'Número de trámite', check: 'Consultar estado',
    confirmDelete: n => `¿Quitar el trámite #${n} de la lista?`, removeTitle: 'Quitar de la lista',
    refresh: 'Actualizar', loading: 'Cargando…', error: 'ERROR',
    status: 'Estado', previous: 'Anterior', delivery: 'Entrega', office: 'Oficina', filed: 'Iniciado', history: 'Historial',
    cpi: 'Iniciaste un trámite para obtener el Certificado de Pre-identificación. Para saber el estado, escribí por WhatsApp al 11-5805-8813 con tu nombre y apellido o N° de ID trámite.',
    migraciones: 'Migraciones está analizando tu trámite.',
    suspendido: 'Tu trámite se encuentra suspendido porque tenés la radicación vencida o próxima a vencer. Acercate a Migraciones para regularizar la situación.',
  };

  const getToken = () => new Promise((ok, no) =>
    grecaptcha.ready(() => grecaptcha.execute(SITE_KEY, { action: ACTION }).then(ok, no)));

  async function fetchTramite(num) {
    const token = await getToken();
    const fd = new FormData();
    fd.append('tramite', String(num).padStart(11, '0'));
    fd.append('token', token);
    fd.append('action', ACTION);
    const r = await fetch('busqueda.php', { method: 'POST', body: fd });
    return r.json();
  }

  // ---------- helpers ----------
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    n.append(...kids.filter(k => k != null));
    return n;
  };

  // texto_cuerpo arrives as HTML (the site puts it in via innerHTML); keep only safe markup
  const safeHtml = html => {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,link,meta,form').forEach(n => n.remove());
    doc.body.querySelectorAll('*').forEach(n => {
      for (const a of [...n.attributes]) {
        if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
      }
      if (n.tagName === 'A') { n.target = '_blank'; n.rel = 'noreferrer'; }
    });
    return doc.body.innerHTML.trim();
  };

  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  };
  const writeJson = (key, v) => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
  };

  // ---------- UI ----------
  const css = `
  #mm-restore{font:14px/1.5 system-ui,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:#1f2933}
  #mm-restore *{box-sizing:border-box}
  #mm-restore h2{margin:0 0 12px;font-size:20px}
  #mm-restore form{display:flex;gap:8px;flex-wrap:wrap}
  #mm-restore .combo{position:relative;flex:1 1 220px}
  #mm-restore input{width:100%;padding:10px;border:1px solid #b8c4ce;border-radius:8px;font:inherit}
  #mm-restore .sugg{position:absolute;left:0;right:0;top:100%;margin-top:4px;z-index:10;max-height:260px;overflow:auto;background:#fff;border:1px solid #d5dde3;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.12)}
  #mm-restore .sugg .item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;cursor:pointer}
  #mm-restore .sugg .item:hover{background:#eef6f8}
  #mm-restore .sugg .last{color:#6b7885;font-size:12px;flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #mm-restore .sugg .x{padding:0 6px;background:none;color:#9aa5b1;font-size:16px;line-height:1}
  #mm-restore .sugg .x:hover{color:#e03131}
  #mm-restore button.sec{margin:0 0 0 8px;padding:3px 10px;background:#eef1f4;color:#1f2933;font-size:12px}
  #mm-restore button.icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;margin:0;border-radius:50%}
  #mm-restore button.icon:hover:not(:disabled){background:#dde5ea}
  #mm-restore .card.loading button.icon svg{animation:mm-spin .8s linear infinite}
  @keyframes mm-spin{to{transform:rotate(360deg)}}
  #mm-restore button{padding:9px 18px;border:0;border-radius:8px;background:#0b7285;color:#fff;font:inherit;cursor:pointer}
  #mm-restore button:disabled{opacity:.6;cursor:wait}
  #mm-restore .card{margin-top:16px;padding:16px;border:1px solid #d5dde3;border-radius:12px;background:#fff;transition:opacity .2s}
  #mm-restore .card.err{border-color:#e03131;background:#fff5f5}
  #mm-restore .card.loading{pointer-events:none;animation:mm-pulse 1s ease-in-out infinite}
  @keyframes mm-pulse{0%,100%{opacity:.85}50%{opacity:.4}}
  #mm-restore .warn{margin-bottom:8px;padding:6px 10px;border-radius:6px;background:#fff5f5;color:#c92a2a;font-size:13px}
  #mm-restore .head{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center}
  #mm-restore .head .meta{margin-right:auto}
  #mm-restore .card{position:relative}
  #mm-restore .head{padding-right:36px}
  #mm-restore .card > .head button.icon{position:absolute;top:12px;right:12px}
  #mm-restore .num{font-weight:700;font-size:16px}
  #mm-restore .meta{color:#6b7885;font-size:13px}
  #mm-restore dl.sum{display:grid;grid-template-columns:auto 1fr;gap:2px 14px;margin:10px 0 0;padding:10px 12px;border-radius:8px;background:#f3f6f8}
  #mm-restore dl.sum dt{color:#6b7885;font-weight:400}
  #mm-restore dl.sum dd{margin:0}
  #mm-restore dl.sum dd.cur{font-weight:700}
  #mm-restore .steps{display:block;width:100%;max-width:620px;height:auto;margin:12px 0}
  #mm-restore .sub{margin-top:14px;padding-top:6px;border-top:1px dashed #d5dde3}
  #mm-restore .panel{padding:14px 16px;border:1px solid #d5dde3;border-radius:12px;background:#fff}
  #mm-restore .state{display:flex;gap:12px;align-items:center;padding-bottom:12px;border-bottom:1px solid #e4e9ed;font-size:20px;font-weight:500}
  #mm-restore .state img{width:30px;height:30px}
  #mm-restore .info{margin-top:16px;padding:12px;border-radius:8px;background:#e3f2fa}
  #mm-restore .body,#mm-restore .histbox{margin-top:14px;padding:14px 16px;background:#d0eaf9}
  #mm-restore .gris{background:#eceff1}
  #mm-restore .verde{background:#d9f0dc}
  #mm-restore .body b{display:block}
  #mm-restore .body .texto_epigrafe_correo{font-style:italic;font-size:13px}
  #mm-restore .histlink{display:block;margin:10px 0 0 auto;padding:0;border:0;background:none;color:#0b6bb0;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
  #mm-restore .histbox{margin-top:8px}
  #mm-restore ul.tl{margin:0;padding:0 0 0 18px;list-style:square;font-size:13px}
  #mm-restore ul.tl li{padding:2px 0}
  #mm-restore ul.tl time{font-style:italic;margin-right:8px}
  @media(max-width:600px){
    #mm-restore{margin:16px auto;padding:0 12px}
    #mm-restore form{flex-direction:column}
    #mm-restore .combo{flex:none;width:100%}
    #mm-restore form > button{width:100%}
    #mm-restore .card{padding:12px}
    #mm-restore dl.sum{grid-template-columns:1fr;gap:0}
    #mm-restore dl.sum dt{font-size:12px}
    #mm-restore dl.sum dd{margin-bottom:8px;overflow-wrap:anywhere}
    #mm-restore dl.sum dd:last-child{margin-bottom:0}
    #mm-restore .panel{padding:12px}
    #mm-restore .state{font-size:18px}
    #mm-restore .body,#mm-restore .histbox{padding:12px}
  }
  `;

  const input = el('input', {
    type: 'text', inputMode: 'numeric', placeholder: t.placeholder, autocomplete: 'off',
  });
  const sugg = el('div', { className: 'sugg', hidden: true });
  const combo = el('div', { className: 'combo' }, input, sugg);
  const btn = el('button', { type: 'submit', textContent: t.check });
  const form = el('form', {}, combo, btn);
  const list = el('div');
  const root = el('section', { id: 'mm-restore' },
    el('style', { textContent: css }),
    el('h2', { textContent: t.title }),
    form,
    list,
  );

  let nums = readJson(STORE_KEY, []);
  let lastStatus = readJson(LAST_KEY, {});
  const cards = new Map();
  const busy = new Set();
  let current = null; // number of the case currently shown

  // ---------- saved cases ----------
  function remember(num, status) {
    if (!nums.includes(num)) nums.push(num);
    if (status) lastStatus[num] = status;
    writeJson(STORE_KEY, nums);
    writeJson(LAST_KEY, lastStatus);
  }

  function forget(num) {
    if (!confirm(t.confirmDelete(num))) return false;
    nums = nums.filter(n => n !== num);
    delete lastStatus[num];
    writeJson(STORE_KEY, nums);
    writeJson(LAST_KEY, lastStatus);
    cards.get(num)?.remove();
    cards.delete(num);
    return true;
  }

  function renderSugg() {
    const q = input.value.replace(/\D/g, '');
    const items = nums.filter(n => n.includes(q));
    sugg.replaceChildren(...items.map(n => el('div', {
      className: 'item',
      onmousedown: e => {
        e.preventDefault(); // keep input focus until the click is handled
        if (e.target.closest('.x')) return;
        pick(n);
      },
    },
      el('b', { textContent: `#${n}` }),
      el('span', { className: 'last', textContent: lastStatus[n] || '' }),
      el('button', {
        type: 'button', className: 'x', title: t.removeTitle, textContent: '×',
        onmousedown: e => e.preventDefault(),
        onclick: () => { if (forget(n)) renderSugg(); },
      }),
    )));
    sugg.hidden = !items.length;
  }

  function pick(num) {
    input.value = '';
    sugg.hidden = true;
    input.blur();
    refresh(num);
  }

  input.addEventListener('focus', renderSugg);
  input.addEventListener('input', renderSugg);
  input.addEventListener('keydown', e => { if (e.key === 'Escape') sugg.hidden = true; });
  document.addEventListener('mousedown', e => { if (!combo.contains(e.target)) sugg.hidden = true; });

  // ---------- card ----------
  function renderStage(ui, d, multi) {
    let tipo = ui.tipo_tramite || d.tipo_tramite || '';
    if (ui.tipo_dni === 'EXPRESS') tipo += ' Exprés';
    if (ui.tipo_dni === '24') tipo += ' 24hs';
    // the type is already in the card header; repeat it only to tell several stages apart or flag express/24h
    const showType = multi || ui.tipo_dni === 'EXPRESS' || ui.tipo_dni === '24';
    const color = ui.class_panel_color || '';

    const panel = el('div', { className: 'panel' },
      el('div', { className: 'state' },
        ui.icon && el('img', { src: `img/iconos/iconos-caja/${ui.icon}`, alt: '' }),
        ui.texto_front || ''),
    );

    const body = el('div', { className: `body ${color}`.trim() });
    body.innerHTML = safeHtml(ui.texto_cuerpo);
    if (body.textContent.trim()) panel.append(body);

    const hist = ui.historico || [];
    if (hist.length) {
      const ul = el('ul', { className: 'tl' });
      hist.forEach(h => ul.append(el('li', {},
        el('time', { textContent: h.FechaCambio || h.fecha || '' }),
        String(h.EstadoMotivo || h.evento || '').replace('/Sin Motivo', ''),
      )));
      const box = el('div', { className: `histbox ${color}`.trim() }, ul);
      const label = `${t.history} ${(ui.texto_front || '').toLowerCase()}`.trim();
      const link = el('button', { type: 'button', className: 'histlink' });
      const sync = () => { link.textContent = `${box.hidden ? '↓' : '↑'} ${label}`; };
      link.onclick = () => { box.hidden = !box.hidden; sync(); };
      sync();
      panel.append(link, box);
    }

    return el('div', { className: 'sub' },
      showType ? el('span', { className: 'meta', textContent: tipo }) : null,
      ui.svg && el('img', { className: 'steps', src: `img/svg/${ui.svg}`, alt: ui.texto_front || '' }),
      panel,
    );
  }

  // everything about the case state in one place: current and previous status, delivery, office, filing date
  function renderSummary(d) {
    // "embalado" -> "Embalado"; "(PAS) en ..." and "eDNI exportado" stay as is (first word is not purely lowercase)
    const cap = str => str.replace(/^(\p{Ll})(\p{Ll}*)(?=\s|$)/u, (_, a, b) => a.toUpperCase() + b);
    const withDate = (str, date) => (str ? `${cap(str)}${date ? ` (${date})` : ''}` : '');
    const rows = [
      [t.status, withDate(d.descripcion_ultimo_estado, d.fecha_ultimo_estado), true],
      [t.previous, withDate(d.descripcion_anteultimo_estado, d.fecha_anteultimo_estado)],
      [t.delivery, d.tipo_retiro],
      [t.office, d.oficina_remitente && d.oficina_remitente.descripcion],
      [t.filed, d.fecha_toma],
    ].filter(r => r[1]);
    const dl = el('dl', { className: 'sum' });
    rows.forEach(([k, v, cur]) => dl.append(
      el('dt', { textContent: k }),
      el('dd', { className: cur ? 'cur' : '', textContent: v }),
    ));
    return dl;
  }

  const renderInfo = (num, text) => el('div', { className: 'card' },
    el('div', { className: 'head' }, el('span', { className: 'num', textContent: `#${num}` })),
    el('div', { className: 'info', textContent: text }));

  const renderErr = (num, msg) => el('div', { className: 'card err' },
    el('div', { className: 'head' }, el('span', { className: 'num', textContent: `#${num} ${t.error}: ` }), String(msg)));

  // returns { card, status }; status is set only when the trámite was found
  function renderOk(num, resp) {
    if (resp.errors) return { card: renderErr(num, resp.errors.title || JSON.stringify(resp.errors)) };
    const d = resp.data;
    if (!d) return { card: renderErr(num, resp.mensaje || JSON.stringify(resp)) };
    const status = d.descripcion_ultimo_estado || '';
    if (d.accion == TT_CPI) return { status, card: renderInfo(num, t.cpi) };
    if (d.id_ultimo_estado == TT_MIGRACIONES) return { status, card: renderInfo(num, t.migraciones) };
    if (d.id_ultimo_estado == TT_SUSPENDIDO) return { status, card: renderInfo(num, t.suspendido) };

    const card = el('div', { className: 'card' },
      el('div', { className: 'head' },
        el('span', { className: 'num', textContent: `#${num}` }),
        el('span', { className: 'meta', textContent: `${d.tipo_tramite || ''} · ${d.descripcion_tramite || ''}` }),
      ),
      renderSummary(d),
    );
    const stages = (d.tramitesUI || []).slice(0, 2);
    stages.forEach(ui => card.append(renderStage(ui, d, stages.length > 1)));
    return { card, status };
  }

  function withActions(num, card) {
    const head = card.querySelector('.head') || card;
    const btn = el('button', {
      type: 'button', className: 'sec icon', title: t.refresh, onclick: () => refresh(num),
    });
    btn.setAttribute('aria-label', t.refresh);
    btn.innerHTML = REFRESH_ICON;
    head.append(btn);
    return card;
  }

  function setLoading(card, on) {
    if (!card) return;
    card.classList.toggle('loading', on);
    card.querySelectorAll('button').forEach(b => { b.disabled = on; });
  }

  async function refresh(num) {
    if (busy.has(num)) return;
    busy.add(num);
    current = num;
    // different case: drop old cards right away and show a loading placeholder
    cards.forEach((c, n) => { if (n !== num) { c.remove(); cards.delete(n); } });
    let old = cards.get(num);
    if (!old) {
      old = el('div', { className: 'card placeholder' },
        el('div', { className: 'head' }, el('span', { className: 'num', textContent: `#${num}` })),
        el('div', { className: 'meta', style: 'margin-top:8px', textContent: t.loading }));
      list.append(old);
      cards.set(num, old);
    }
    setLoading(old, true);
    try {
      let result;
      try {
        result = renderOk(num, await fetchTramite(num));
      } catch (e) {
        result = { card: renderErr(num, (e && e.message) || e) };
      }
      const { card, status } = result;
      if (status !== undefined) remember(num, status);
      if (current !== num) return; // another case was picked while this request was in flight

      // if a refresh fails, keep the data already shown
      if (!old.classList.contains('placeholder') && !old.classList.contains('err') && card.classList.contains('err')) {
        old.querySelector('.warn')?.remove();
        old.prepend(el('div', { className: 'warn', textContent: card.textContent }));
        return;
      }
      withActions(num, card);
      old.replaceWith(card);
      cards.set(num, card);
    } finally {
      busy.delete(num);
      setLoading(cards.get(num), false);
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const m = input.value.match(/\d+/);
    if (!m) return;
    const num = String(Number(m[0]));
    input.value = '';
    sugg.hidden = true;
    btn.disabled = true;
    try { await refresh(num); } finally { btn.disabled = false; }
  });

  // ---------- mount ----------
  const mount = () => {
    for (const sel of HOST_SELECTORS) {
      const host = document.querySelector(sel);
      if (host) { host.prepend(root); return; }
    }
  };
  mount();
})();
