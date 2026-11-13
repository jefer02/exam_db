/* Editor SQL con calificación automática.
   Rutas: #/sql (lista) · #/sql/t/<tema>[/<nivel>] (lista filtrada) · #/sql/<id> (ejercicio) · #/sql/libre (editor libre).
   Progreso en APP.store.sql = { status: {id: 'ok'|'bad'}, tries: {id: n}, draft: {id: sql}, sawSolution: {id: true} }. */
(function () {
  const EX = window.SQL_EXERCISES, P = window.PRACTICE_DB, esc = UI.esc;
  const THEME = { ink: 'var(--ink)', soft: 'var(--soft)', bg: 'var(--card)', head: 'var(--svg-head)', pk: 'var(--svg-pk)', accent: 'var(--accent)', line: 'var(--line2)' };
  const LS_FILTER = 'bdfp_sqlfilter';
  let filter = { level: '', topic: '', db: '', state: '', q: '' };
  try { filter = Object.assign(filter, JSON.parse(localStorage.getItem(LS_FILTER) || '{}')); } catch (e) { /* sin storage */ }
  // Estado de la página actual (ejercicio o editor libre)
  let cur = null;

  const S = () => {
    const s = APP.store;
    s.sql = s.sql || {};
    ['status', 'tries', 'draft', 'sawSolution'].forEach((k) => { s.sql[k] = s.sql[k] || {}; });
    return s.sql;
  };
  const badge = (t, cls) => `<span class="badge ${cls || ''}">${esc(t)}</span>`;
  const icon = (id) => ({ ok: '✅', bad: '❌' }[S().status[id]] || '○');

  function filtered() {
    const s = S();
    const q = filter.q.trim().toLowerCase();
    return EX.LIST.filter((e) => (!filter.level || e.level === filter.level) && (!filter.topic || e.topic === filter.topic) && (!filter.db || e.db === filter.db) &&
      (!filter.state || (filter.state === 'ok' ? s.status[e.id] === 'ok' : filter.state === 'bad' ? s.status[e.id] === 'bad' : s.status[e.id] !== 'ok')) &&
      (!q || (e.title + ' ' + e.prompt + ' ' + e.id).toLowerCase().includes(q)));
  }

  /* ---------- lista ---------- */
  function list(topic, level) {
    if (topic !== undefined) { filter.topic = topic || ''; filter.level = level || ''; }
    const s = S();
    const total = EX.LIST.length, ok = EX.LIST.filter((e) => s.status[e.id] === 'ok').length;
    const opt = (obj, val) => Object.keys(obj).map((k) => `<option value="${k}"${k === val ? ' selected' : ''}>${esc(obj[k])}</option>`).join('');
    const dbs = {}; P.DBS.forEach((d) => { dbs[d.id] = d.id; });
    APP.page('#/sql', `<h1>Editor SQL · ejercicios calificados</h1>
<p>PostgreSQL real dentro del navegador (PGlite): la misma sintaxis que en clase (SERIAL, ILIKE, ::, BOOLEAN…). Escribe tu consulta, pulsa <b>Calificar</b> y compara con la solución oculta.</p>
<div class="card"><div class="bar"><span>Resueltos</span><i><u style="width:${Math.round((100 * ok) / total)}%"></u></i><em>${ok}/${total}</em></div>
${Object.keys(EX.LEVELS).map((k) => { const l = EX.LIST.filter((e) => e.level === k); const o = l.filter((e) => s.status[e.id] === 'ok').length; return `<div class="bar"><span>${EX.LEVELS[k]}</span><i><u style="width:${Math.round((100 * o) / l.length)}%"></u></i><em>${o}/${l.length}</em></div>`; }).join('')}
<p><a class="btn alt" href="#/sql/libre">Abrir editor libre</a></p></div>
<div class="filters">
 <select data-f="level"><option value="">Todos los niveles</option>${opt(EX.LEVELS, filter.level)}</select>
 <select data-f="topic"><option value="">Todos los temas</option>${opt(EX.SQL_TOPICS, filter.topic)}</select>
 <select data-f="db"><option value="">Todas las bases</option>${opt(dbs, filter.db)}</select>
 <select data-f="state"><option value="">Todos</option>${opt({ pend: 'Pendientes', ok: 'Resueltos', bad: 'Fallados' }, filter.state)}</select>
 <input data-f="q" type="search" placeholder="Buscar…" value="${esc(filter.q)}">
</div>
<div id="exlist"></div>`);
    renderList();
  }
  function renderList() {
    const box = document.getElementById('exlist'); if (!box) return;
    const L = filtered();
    if (!L.length) { box.innerHTML = '<div class="card">No hay ejercicios con estos filtros.</div>'; return; }
    box.innerHTML = Object.keys(EX.LEVELS).map((lv) => {
      const g = L.filter((e) => e.level === lv);
      if (!g.length) return '';
      return `<h2>${EX.LEVELS[lv]} (${g.length})</h2><div class="exrows">${g.map((e) => `<a class="exrow" href="#/sql/${e.id}"><span class="st">${icon(e.id)}</span>
<span class="exid">${e.id}</span><span class="extitle2">${esc(e.title)}</span>
<span class="exb">${badge(EX.SQL_TOPICS[e.topic].split(' (')[0])}${badge(e.db, 'db')}${e.data === 'ext' ? badge('extendidos', 'ext') : ''}${e.src !== 'extra' ? badge(EX.SRC[e.src], 'src') : ''}</span></a>`).join('')}</div>`;
    }).join('');
  }

  /* ---------- panel de esquema ---------- */
  function shortType(t) {
    return t.replace('character varying', 'VARCHAR').replace(/^character\b/, 'CHAR').replace(/^integer$/, 'INT').replace(/^timestamp without time zone$/, 'TIMESTAMP')
      .replace(/^(numeric|date|boolean|text|bigint|smallint|real|double precision)/, (m) => m.toUpperCase());
  }
  function diagram(tables) {
    const model = { tables: {}, order: [] };
    const cols3 = 2;
    tables.forEach((t, i) => {
      model.tables[t.name] = { name: t.name, label: t.name, pk: t.columns.filter((c) => c.pk).map((c) => c.name),
        cols: t.columns.map((c) => ({ n: c.name, t: shortType(c.type) })), pos: [i % cols3, Math.floor(i / cols3) * 1.2],
        fks: t.columns.filter((c) => c.fk).map((c) => ({ cols: [c.name], ref: c.fk.table, refCols: [c.fk.column], refSym: c.notNull ? 'one' : 'zeroOne', childSym: 'zeroMany' })) };
      model.order.push(t.name);
    });
    Object.values(model.tables).forEach((t) => { t.fks = t.fks.filter((f) => model.tables[f.ref]); });
    try { return `<div class="svgwrap">${ERD.crowSVG(model, THEME)}</div>`; } catch (e) { return `<p class="small">No se pudo dibujar el diagrama: ${esc(e.message)}</p>`; }
  }
  async function renderSchema() {
    const box = document.getElementById('schema'); if (!box || !cur) return;
    const d = P.byId[cur.db];
    const head = `<div class="schemahead"><b>${esc(d.id)}</b>
<div class="seg">${Object.keys(P.VARIANTS).map((v) => `<button class="${v === cur.variant ? 'on' : ''}" data-e="variant" data-v="${v}">${P.VARIANTS[v]}</button>`).join('')}</div>
${cur.ex && cur.ex.data !== cur.variant ? `<p class="warn small">⚠ Este ejercicio se califica con <b>${P.VARIANTS[cur.ex.data].toLowerCase()}</b>; ahora estás ejecutando sobre otros datos.</p>` : ''}
<p class="small muted">${esc(d.notes[cur.variant])}</p>
<div class="tabbar"><button class="tab${cur.tab === 'tablas' ? ' on' : ''}" data-e="tab" data-k="tablas">Tablas</button><button class="tab${cur.tab === 'diagrama' ? ' on' : ''}" data-e="tab" data-k="diagrama">Diagrama</button>
<button class="btn sm alt right" data-e="reset" title="Vuelve a crear las tablas con sus datos iniciales">↺ Reiniciar base de datos</button></div></div>`;
    box.innerHTML = head + '<p class="small">Cargando esquema…</p>';
    let tables;
    try { tables = await (await UI.engine()).schemaInfo(cur.db, cur.variant); } catch (e) { box.innerHTML = head + `<p class="small">Sin motor SQL: ${esc(e.message)}</p>`; return; }
    const body = !tables.length ? '<p class="small">No hay tablas (¿hiciste DROP?). Pulsa <b>Reiniciar base de datos</b>.</p>'
      : cur.tab === 'diagrama' ? diagram(tables) + '<p class="small muted">Pata de gallo: la "pata" (muchos) va en la tabla con la FK.</p>'
        : tables.map((t) => `<div class="stable"><button class="sname" data-e="peek" data-t="${esc(t.name)}" title="Ver los datos">${esc(t.name)} <span class="muted">${t.count} filas · ver datos</span></button>
<ul>${t.columns.map((c) => `<li><span class="cn${c.pk ? ' pk' : ''}">${c.pk ? '🔑 ' : ''}${esc(c.name)}</span> <span class="ct">${esc(shortType(c.type))}${c.notNull && !c.pk ? ' NOT NULL' : ''}${c.unique ? ' UNIQUE' : ''}</span>${c.fk ? `<span class="fk">→ ${esc(c.fk.table)}.${esc(c.fk.column)}</span>` : ''}</li>`).join('')}</ul></div>`).join('');
    box.innerHTML = head + body;
  }

  /* ---------- ejercicio / editor libre ---------- */
  function idePage(route, top, opts) {
    APP.page(route, `${top}
<div class="ide">
  <div class="ide-main">
    <textarea id="sqlin" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
    <div class="idebar">
      <button class="btn" data-e="run" title="Ctrl + Enter">▶ Ejecutar</button>
      ${opts.grade ? '<button class="btn good" data-e="grade">✓ Calificar</button><button class="btn alt" data-e="hint">💡 Pista</button><button class="btn alt" data-e="sol">👁 Ver solución</button>' : ''}
      <span class="small muted">Ctrl + Enter ejecuta</span>
    </div>
    <div id="hintbox"></div><div id="grade"></div><div id="out"></div>
  </div>
  <aside class="ide-side" id="schema"></aside>
</div>${opts.foot || ''}`);
    cur.ed = UI.editor(document.getElementById('sqlin'), () => run(), (v) => { if (cur.ex) { S().draft[cur.ex.id] = v; APP.saveSoon(); } });
    cur.ed.set(opts.initial);
    renderSchema();
  }

  function exercise(id) {
    const ex = EX.byId[id];
    if (!ex) return list();
    const s = S();
    cur = { ex, db: ex.db, variant: ex.data, tab: 'tablas' };
    const L = filtered(), i = L.findIndex((e) => e.id === id);
    const prev = i > 0 ? L[i - 1] : null, next = i >= 0 && i < L.length - 1 ? L[i + 1] : null;
    const top = `<div class="qhead"><a href="#/sql">← Ejercicios</a><span>${icon(id)} ${ex.id}</span></div>
<h1>${esc(ex.title)}</h1>
<p>${badge(EX.LEVELS[ex.level], 'lv-' + ex.level)}${badge(EX.SQL_TOPICS[ex.topic])}${badge(EX.SRC[ex.src], 'src')}${ex.order ? badge('el orden importa', 'warnb') : ''}</p>
<div class="card prompt"><p>${esc(ex.prompt)}</p><p class="small muted">Base: <b>${esc(ex.db)}</b> · se califica con <b>${P.VARIANTS[ex.data].toLowerCase()}</b>${ex.order ? ' · se revisa el orden de las filas' : ' · el orden de las filas no importa'}.</p></div>`;
    const foot = `<div class="exnav">${prev ? `<a class="btn alt" href="#/sql/${prev.id}">← ${esc(prev.id)}</a>` : '<span></span>'}${next ? `<a class="btn alt" href="#/sql/${next.id}">${esc(next.id)} →</a>` : ''}</div>`;
    idePage('#/sql', top, { grade: true, foot, initial: s.draft[id] || `-- ${ex.prompt.split('. Columnas')[0]}\n` });
  }

  function free() {
    let hand = null;
    try { hand = JSON.parse(sessionStorage.getItem('bdfp_handoff') || 'null'); sessionStorage.removeItem('bdfp_handoff'); } catch (e) { /* sin storage */ }
    const prevDb = cur && !cur.ex ? cur : null;
    cur = { ex: null, db: hand ? hand.db : prevDb ? prevDb.db : 'bd_estudiantes_joins', variant: hand ? hand.data : prevDb ? prevDb.variant : 'orig', tab: 'tablas' };
    const top = `<div class="qhead"><a href="#/sql">← Ejercicios</a><span>Editor libre</span></div><h1>Editor libre</h1>
<p>Base de datos: <select data-e="db">${P.DBS.map((d) => `<option value="${d.id}"${d.id === cur.db ? ' selected' : ''}>${esc(d.title)}</option>`).join('')}</select></p>
<p class="small">Puedes ejecutar cualquier SQL de PostgreSQL: SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP… Si dañas los datos, pulsa <b>Reiniciar base de datos</b>.</p>`;
    idePage('#/sql', top, { grade: false, initial: hand ? hand.sql : (prevDb && prevDb.last) || 'SELECT * FROM estudiantes;' });
  }

  async function run() {
    const out = document.getElementById('out'); if (!out || !cur) return;
    const sql = cur.ed.get();
    if (!cur.ex) cur.last = sql;
    out.innerHTML = '<p class="small">Ejecutando…</p>';
    try {
      const eng = await UI.engine();
      const r = await eng.run(cur.db, cur.variant, sql);
      out.innerHTML = `<h3>Resultado <span class="small muted">(${P.VARIANTS[cur.variant].toLowerCase()})</span></h3>` + UI.runOutput(r, sql);
      if (!r.error && /\b(create|alter|drop|insert|update|delete|truncate)\b/i.test(sql)) renderSchema();
    } catch (e) { out.innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; }
  }

  function diffTables(cmp) {
    const t = (rows, title, cls) => (rows.length ? `<div class="diff ${cls}"><p><b>${title}</b> (${rows.length})</p>${UI.table({ fields: cmp.expectedFields, rows }, { max: 8 })}</div>` : '');
    return t(cmp.extra, 'Filas de más (están en tu resultado y no deberían)', 'd-extra') + t(cmp.missing, 'Filas que faltan (deberían estar y no están)', 'd-missing');
  }
  async function grade() {
    const box = document.getElementById('grade'); if (!box || !cur || !cur.ex) return;
    const ex = cur.ex, s = S(), sql = cur.ed.get();
    box.innerHTML = '<p class="small">Calificando…</p>';
    let g;
    try { g = await (await UI.engine()).grade(ex, sql); } catch (e) { box.innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; return; }
    if (g.empty) { box.innerHTML = '<div class="fb bad">Escribe una consulta primero.</div>'; return; }
    s.tries[ex.id] = (s.tries[ex.id] || 0) + 1;
    if (g.ok) s.status[ex.id] = 'ok';
    else if (s.status[ex.id] !== 'ok') s.status[ex.id] = 'bad';
    APP.save();
    const L = filtered(), i = L.findIndex((e) => e.id === ex.id), next = L[i + 1];
    const warn = g.cmp && g.cmp.warnings.length ? `<ul class="small">${g.cmp.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '';
    if (g.ok) {
      box.innerHTML = `<div class="fb good"><b>✅ ${esc(g.cmp.message)}</b>${warn}<p>${esc(ex.explain)}</p>
<details><summary>Ver la solución de referencia</summary>${UI.code(ex.solution)}</details>
${next ? `<p><a class="btn" href="#/sql/${next.id}">Siguiente ejercicio →</a></p>` : ''}</div>`;
      return;
    }
    let body;
    if (g.user.error) body = UI.explainError(g.user.error, sql);
    else if (g.user.noRows) body = '<div class="fb bad">Tu código no termina en un SELECT, así que no hay resultado que comparar.</div>';
    else body = `<div class="fb bad"><b>❌ ${esc(g.cmp.message)}</b>${g.cmp.hints.length ? `<ul>${g.cmp.hints.map((h) => `<li>💡 ${esc(h)}</li>`).join('')}</ul>` : ''}${warn}</div>${diffTables(g.cmp)}`;
    box.innerHTML = body + `<details class="expected"><summary>Ver el resultado esperado (${g.expected.rows.length} filas)</summary>${UI.table(g.expected)}</details>`;
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', async (ev) => {
    const el = ev.target.closest('[data-e]');
    if (!el || !cur) return;
    const a = el.dataset.e;
    if (a === 'run') run();
    else if (a === 'grade') grade();
    else if (a === 'hint') document.getElementById('hintbox').innerHTML = `<div class="tip">💡 ${esc(cur.ex.hint || 'Relee el enunciado: ¿qué columnas, de qué tablas y qué filas?')}</div>`;
    else if (a === 'sol') {
      if (S().status[cur.ex.id] !== 'ok' && !confirm('¿Ver la solución? Intenta primero: en el examen no la tendrás.')) return;
      S().sawSolution[cur.ex.id] = true; APP.save();
      document.getElementById('hintbox').innerHTML = `<div class="card sol"><h3>Solución</h3>${UI.code(cur.ex.solution)}<p>${esc(cur.ex.explain)}</p>
<button class="btn sm alt" data-e="copysol">Copiar al editor</button></div>`;
    } else if (a === 'copysol') cur.ed.set(cur.ex.solution);
    else if (a === 'variant') { cur.variant = el.dataset.v; renderSchema(); }
    else if (a === 'tab') { cur.tab = el.dataset.k; renderSchema(); }
    else if (a === 'reset') {
      if (!confirm(`¿Reiniciar ${cur.db}? Se borran tus cambios (INSERT, UPDATE, DELETE, DROP…) y vuelven los datos iniciales.`)) return;
      await (await UI.engine()).reset(cur.db);
      document.getElementById('out').innerHTML = '<div class="fb good">✔ Base de datos reiniciada.</div>';
      renderSchema();
    } else if (a === 'peek') {
      const sql = `SELECT * FROM ${el.dataset.t};`;
      const out = document.getElementById('out');
      const r = await (await UI.engine()).run(cur.db, cur.variant, sql);
      out.innerHTML = `<h3>${esc(el.dataset.t)}</h3>${UI.runOutput(r, sql)}`;
    }
  });
  document.addEventListener('change', (ev) => {
    const f = ev.target.dataset.f;
    if (f) { filter[f] = ev.target.value; try { localStorage.setItem(LS_FILTER, JSON.stringify(filter)); } catch (e) { /* sin storage */ } renderList(); return; }
    if (ev.target.dataset.e === 'db' && cur) { cur.db = ev.target.value; renderSchema(); }
  });
  document.addEventListener('input', (ev) => {
    if (ev.target.dataset.f === 'q') { filter.q = ev.target.value; renderList(); }
  });

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.sql = (b, c, d) => {
    if (!b) return list();
    if (b === 't') return list(c, d);
    if (b === 'libre') return free();
    return exercise(b);
  };
})();
