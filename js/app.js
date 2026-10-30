/* BD Final Prep – SPA sin dependencias. Rutas por hash. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const LET = 'ABCDEFGH';
  const THEME = { ink: 'var(--ink)', soft: 'var(--soft)', bg: 'var(--card)', head: 'var(--svg-head)', pk: 'var(--svg-pk)', accent: 'var(--accent)', line: 'var(--line2)' };
  const ORIGIN = { taller: 'Taller del curso', clase: 'Visto en clase', lab: 'Laboratorio', extra: 'Práctica extra (mía)' };

  /* ---------- progreso ---------- */
  let store = { topics: {}, wrong: [], exams: [] };
  try { const s = JSON.parse(localStorage.getItem('bdfp') || 'null'); if (s) store = Object.assign(store, s); } catch (e) {}
  const save = () => { try { localStorage.setItem('bdfp', JSON.stringify(store)); } catch (e) {} };
  function record(q, ok) {
    const t = store.topics[q.t] || (store.topics[q.t] = { ok: 0, total: 0 });
    t.total++; if (ok) t.ok++;
    const i = store.wrong.indexOf(q.id);
    if (!ok && i < 0) store.wrong.push(q.id);
    if (ok && i >= 0) store.wrong.splice(i, 1);
    save();
  }
  const qById = {}; BANK.forEach((q) => { qById[q.id] = q; });
  const oById = {}; OPEN.forEach((q) => { oById[q.id] = q; });
  const cById = {}; CASES.forEach((c) => { cById[c.id] = c; });
  const nById = {}; NORM_EX.forEach((c) => { nById[c.id] = c; });

  /* ---------- diagramas ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function caseViews(c) {
    const model = ERD.transform(clone(c));
    return {
      chen: ERD.chenSVG(clone(c), THEME),
      crow: ERD.crowSVG(model, THEME),
      rel: ERD.schemaText(model),
      sql: ERD.ddl(model)
    };
  }
  function caseTabs(c, id, hidden) {
    const v = caseViews(c);
    const tabs = [['chen', 'Chen (E/R)', `<div class="svgwrap">${v.chen}</div>`],
      ['crow', 'Pata de gallo', `<div class="svgwrap">${v.crow}</div>`],
      ['rel', 'Modelo relacional', `<pre>${esc(v.rel)}</pre>`],
      ['sql', 'SQL (DDL)', `<pre>${esc(v.sql)}</pre>`]];
    return `<div class="tabs" data-tabs="${id}">
      <div class="tabbar">${tabs.map((t, i) => `<button class="tab${i ? '' : ' on'}" data-act="tab" data-g="${id}" data-k="${t[0]}">${t[1]}</button>`).join('')}</div>
      ${tabs.map((t, i) => `<div class="tabpane${i ? ' hide' : ''}" data-g="${id}" data-k="${t[0]}">${t[2]}</div>`).join('')}
      ${c.notes && c.notes.length ? `<div class="tip"><b>Notas de diseño:</b><ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    </div>`;
  }

  /* ---------- plantillas ---------- */
  const nav = [['#/', 'Inicio'], ['#/teoria', 'Teoría'], ['#/quiz', 'Quizzes'], ['#/examenes', 'Exámenes'], ['#/casos', 'Casos'], ['#/labs', 'Labs SQL'], ['#/repaso', 'Hoja de repaso']];
  function page(route, body) {
    app.innerHTML = body;
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === route));
    window.scrollTo(0, 0);
  }
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  /* ---------- Inicio ---------- */
  function home() {
    const tot = Object.values(store.topics).reduce((a, t) => ({ ok: a.ok + t.ok, total: a.total + t.total }), { ok: 0, total: 0 });
    page('#/', `
<section class="hero"><h1>Prepárate para el examen final</h1>
<p>Sistemas Transaccionales y BD · Momento 3 (70 %) · examen a mano: selección múltiple, preguntas abiertas, diagramas de pata de gallo y código SQL.</p></section>
<div class="steps">
 <a class="card step" href="#/teoria"><b>1 · Repasa</b><span>Resumen por temas</span></a>
 <a class="card step" href="#/quiz"><b>2 · Quizzes</b><span>${BANK.length} preguntas con explicación</span></a>
 <a class="card step" href="#/casos"><b>3 · Practica diseño</b><span>${CASES.length} casos: Chen, pata de gallo, SQL</span></a>
 <a class="card step" href="#/labs"><b>4 · Labs SQL</b><span>${SQLLABS.length} laboratorios con resultados reales</span></a>
 <a class="card step" href="#/examenes"><b>5 · Exámenes</b><span>Simulacros con modo hoja imprimible</span></a>
</div>
<h2>Tu avance</h2>
<div class="card">${tot.total ? `<p>Respuestas correctas en quizzes: <b>${tot.ok}/${tot.total}</b> (${pct(tot.ok, tot.total)} %). Falladas pendientes: <b>${store.wrong.length}</b>.</p>` : '<p>Aún no has hecho quizzes. Empieza por uno corto.</p>'}
${Object.keys(TOPICS).map((k) => { const t = store.topics[k] || { ok: 0, total: 0 }; return `<div class="bar"><span>${TOPICS[k]}</span><i><u style="width:${pct(t.ok, t.total)}%"></u></i><em>${t.total ? pct(t.ok, t.total) + ' %' : '—'}</em></div>`; }).join('')}
${store.exams.length ? `<h3>Exámenes</h3><ul>${store.exams.slice(-5).reverse().map((e) => `<li>${esc(e.title)} · ${e.ok}/${e.total} (${pct(e.ok, e.total)} %) · ${esc(e.date)}</li>`).join('')}</ul>` : ''}
</div>
<h2>Plan sugerido</h2>
<ol class="plan"><li>Lee la teoría de un tema y haz su quiz hasta sacar más de 85 %.</li><li>Repite “Repasar falladas”.</li><li>Haz cada caso: primero en papel (Chen → pata de gallo → SQL), luego compara con la solución.</li><li>Resuelve los labs sin mirar la solución.</li><li>Termina con los Exámenes 1, 2 y 3 en modo hoja, con tiempo.</li></ol>
<p class="small">Material basado en el contenido del curso. Los casos marcados “Práctica extra” y varias preguntas son material de práctica creado por mí; no son del profesor.</p>`);
  }

  /* ---------- Teoría ---------- */
  function theory() {
    page('#/teoria', `<h1>Teoría resumida</h1><div class="toc">${THEORY.map((t) => `<a href="#t-${t.id}" data-act="goto" data-id="t-${t.id}">${esc(t.title)}</a>`).join('')}</div>
    ${THEORY.map((t) => `<section class="card" id="t-${t.id}"><h2>${esc(t.title)}</h2>${t.html}<p><a class="btn" href="#/quiz/run/${t.id}">Quiz de este tema</a></p></section>`).join('')}`);
  }

  /* ---------- Quiz ---------- */
  let quiz = null;
  function quizMenu() {
    const cnt = {}; BANK.forEach((q) => { cnt[q.t] = (cnt[q.t] || 0) + 1; });
    page('#/quiz', `<h1>Quizzes</h1><p>Respuesta inmediata con explicación. Las opciones se barajan cada vez.</p>
<div class="grid">
${Object.keys(TOPICS).map((k) => { const t = store.topics[k]; return `<a class="card tile" href="#/quiz/run/${k}"><b>${esc(TOPICS[k])}</b><span>${cnt[k] || 0} preguntas${t ? ' · ' + pct(t.ok, t.total) + ' %' : ''}</span></a>`; }).join('')}
<a class="card tile hl" href="#/quiz/run/rapido"><b>⚡ Rápido (10 al azar)</b><span>Todos los temas</span></a>
<a class="card tile hl" href="#/quiz/run/todo"><b>🎯 Todo el banco</b><span>${BANK.length} preguntas</span></a>
<a class="card tile hl" href="#/quiz/run/falladas"><b>🔁 Repasar falladas</b><span>${store.wrong.length} pendientes</span></a>
</div>`);
  }
  function quizRun(mode) {
    let list;
    if (mode === 'rapido') list = shuffle(BANK).slice(0, 10);
    else if (mode === 'todo') list = shuffle(BANK);
    else if (mode === 'falladas') list = shuffle(store.wrong.map((id) => qById[id]).filter(Boolean));
    else list = shuffle(BANK.filter((q) => q.t === mode));
    if (!list.length) return page('#/quiz', `<h1>Quizzes</h1><div class="card"><p>No hay preguntas en esta lista. ${mode === 'falladas' ? '¡Sin falladas pendientes!' : ''}</p><a class="btn" href="#/quiz">Volver</a></div>`);
    quiz = { mode, qs: list.map((q) => ({ q, ord: shuffle(q.o.map((_, i) => i)), pick: null })), i: 0, ok: 0 };
    quizShow();
  }
  function quizShow() {
    const s = quiz.qs[quiz.i];
    if (!s) return quizEnd();
    const q = s.q;
    page('#/quiz', `<div class="qhead"><a href="#/quiz">← Salir</a><span>${quiz.i + 1} / ${quiz.qs.length} · ${esc(TOPICS[q.t])}</span></div>
<div class="bar"><i><u style="width:${pct(quiz.i, quiz.qs.length)}%"></u></i></div>
<div class="card"><p class="q">${esc(q.q)}</p>
<div class="opts">${s.ord.map((oi, k) => `<button class="opt" data-act="pick" data-k="${k}"><b>${LET[k]}</b><span>${esc(q.o[oi])}</span></button>`).join('')}</div>
<div id="fb"></div></div>`);
  }
  function quizPick(k) {
    const s = quiz.qs[quiz.i];
    if (s.pick !== null) return;
    s.pick = k;
    const ok = s.ord[k] === s.q.a;
    if (ok) quiz.ok++;
    record(s.q, ok);
    document.querySelectorAll('.opt').forEach((b, i) => {
      b.disabled = true;
      if (s.ord[i] === s.q.a) b.classList.add('good');
      else if (i === k) b.classList.add('bad');
    });
    $('#fb').innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? '¡Correcto!' : 'Incorrecto.'}</b> ${esc(s.q.e)}</div>
      <button class="btn" data-act="next">${quiz.i + 1 < quiz.qs.length ? 'Siguiente →' : 'Ver resultado'}</button>`;
  }
  function quizEnd() {
    const bad = quiz.qs.filter((s) => s.ord[s.pick] !== s.q.a);
    const p = pct(quiz.ok, quiz.qs.length);
    page('#/quiz', `<h1>Resultado: ${quiz.ok}/${quiz.qs.length} (${p} %)</h1>
<p class="small">${p >= 85 ? 'Excelente: sigue con otro tema.' : p >= 60 ? 'Vas bien; repasa las falladas.' : 'Vuelve a la teoría de este tema y repite.'}</p>
${bad.length ? `<h2>Para repasar</h2>${bad.map((s) => `<div class="card"><p class="q">${esc(s.q.q)}</p><p><b>Correcta:</b> ${esc(s.q.o[s.q.a])}</p><p class="small">${esc(s.q.e)}</p></div>`).join('')}` : '<div class="card">¡Sin errores!</div>'}
<p><a class="btn" href="#/quiz/run/${quiz.mode}">Repetir</a> <a class="btn alt" href="#/quiz">Menú de quizzes</a></p>`);
  }

  /* ---------- Casos ---------- */
  function casesList() {
    const groups = ['taller', 'clase', 'lab', 'extra'];
    page('#/casos', `<h1>Casos de modelado</h1>
<p>Cada caso tiene enunciado y solución oculta: haz primero el Chen, el pata de gallo y el SQL en papel, y luego compara. Cada diagrama está generado desde la misma especificación, así que Chen, pata de gallo, modelo relacional y SQL son coherentes entre sí.</p>
${groups.map((g) => `<h2>${ORIGIN[g]}</h2><div class="grid">${CASES.filter((c) => c.origin === g).map((c) => `<a class="card tile" href="#/caso/${c.id}"><b>${esc(c.title)}</b><span>${c.entities.length} entidades</span></a>`).join('')}</div>`).join('')}`);
  }
  function caseView(id) {
    const c = cById[id];
    if (!c) return casesList();
    page('#/casos', `<p><a href="#/casos">← Casos</a></p><h1>${esc(c.title)}</h1><span class="badge">${ORIGIN[c.origin]}</span>
<div class="card"><h3>Enunciado</h3><p>${esc(c.statement)}</p></div>
<button class="btn" data-act="reveal" data-id="${c.id}">Mostrar solución</button>
<div id="sol-${c.id}" class="hide"></div>`);
  }

  /* ---------- Labs ---------- */
  function labsList() {
    page('#/labs', `<h1>Laboratorios SQL (PostgreSQL)</h1><p>Todas las sentencias se ejecutaron en un PostgreSQL real: los resultados mostrados son los verdaderos.</p>
<div class="grid">${SQLLABS.map((l) => `<a class="card tile" href="#/lab/${l.id}"><b>${esc(l.title)}</b><span>${l.steps.length} pasos</span></a>`).join('')}</div>`);
  }
  function resultTable(s) {
    if (!s.cols) return '';
    return `<div class="svgwrap"><table class="res"><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${s.rows.map((r) => `<tr>${(Array.isArray(r) ? r : s.cols.map((c) => r[c])).map((v) => `<td>${v === null ? '<i>NULL</i>' : esc(v)}</td>`).join('')}</tr>`).join('')}</table></div>`;
  }
  function labView(id) {
    const l = SQLLABS.find((x) => x.id === id);
    if (!l) return labsList();
    let part = '';
    const body = l.steps.map((s, i) => {
      const h = s.part !== part ? `<h2>${esc(s.part)}</h2>` : ''; part = s.part;
      return `${h}<div class="card"><p><b>${i + 1}. ${esc(s.t)}</b></p>
<button class="btn alt" data-act="toggle" data-id="st${i}">Ver solución</button>
<div id="st${i}" class="hide"><pre>${esc(s.sql)}</pre>${s.note ? `<p class="small">${esc(s.note)}</p>` : ''}${resultTable(s)}</div></div>`;
    }).join('');
    page('#/labs', `<p><a href="#/labs">← Labs</a></p><h1>${esc(l.title)}</h1><p>${esc(l.intro)}</p>${body}`);
  }

  /* ---------- Exámenes ---------- */
  let exam = null, timer = null;
  function examsList() {
    page('#/examenes', `<h1>Exámenes</h1>
<p>Simulan el examen real: selección múltiple, abiertas, un caso de diseño (Chen → pata de gallo → SQL) y normalización. Responde en pantalla o usa <b>Imprimir hoja</b> para resolverlo a mano, como será en el examen. Al entregar ves la corrección y el solucionario.</p>
<div class="grid">${EXAMS.map((e) => `<a class="card tile" href="#/examen/${e.id}"><b>${esc(e.title)}</b><span>${esc(e.desc)}</span><span>${e.min} min</span></a>`).join('')}
<a class="card tile hl" href="#/examen/azar"><b>🎲 Examen al azar</b><span>Combina preguntas y casos distintos cada vez</span><span>90 min</span></a></div>`);
  }
  function buildExam(id) {
    let def;
    if (id === 'azar') {
      const topics = Object.keys(TOPICS);
      const mc = {}; topics.forEach((t) => { mc[t] = 3; });
      const cs = shuffle(CASES.map((c) => c.id)).slice(0, 1);
      def = { id: 'azar', title: 'Examen al azar', min: 90, mc, open: shuffle(OPEN.map((o) => o.id)).slice(0, 4), cases: cs, norm: shuffle(NORM_EX.map((n) => n.id)).slice(0, 1) };
    } else def = EXAMS.find((e) => e.id === id);
    if (!def) return null;
    const mcs = [];
    Object.keys(def.mc).forEach((t) => shuffle(BANK.filter((q) => q.t === t)).slice(0, def.mc[t]).forEach((q) => mcs.push(q)));
    return { def, mcs: shuffle(mcs).map((q) => ({ q, ord: shuffle(q.o.map((_, i) => i)) })), submitted: false };
  }
  function examView(id) {
    clearInterval(timer);
    exam = buildExam(id);
    if (!exam) return examsList();
    const d = exam.def;
    let n = 0;
    const mcHtml = exam.mcs.map((s, i) => `<div class="card mcq" data-i="${i}"><p class="q"><b>${++n}.</b> ${esc(s.q.q)}</p>
${s.ord.map((oi, k) => `<label class="opt2"><input type="radio" name="m${i}" value="${k}"><b>${LET[k]}</b><span>${esc(s.q.o[oi])}</span></label>`).join('')}<div class="fbx"></div></div>`).join('');
    const openHtml = d.open.map((oid) => oById[oid]).map((o, i) => `<div class="card"><p class="q"><b>${i + 1}.</b> ${esc(o.q)}</p><textarea class="ans" rows="5" placeholder="Tu respuesta"></textarea><div class="model hide"><b>Respuesta modelo:</b><ul>${o.a.map((x) => `<li>${x}</li>`).join('')}</ul></div></div>`).join('');
    const caseHtml = d.cases.map((cid) => cById[cid]).map((c) => `<div class="card"><h3>${esc(c.title)}</h3><p>${esc(c.statement)}</p>
<p><b>Se pide:</b> (a) diagrama de Chen con cardinalidades; (b) diagrama de pata de gallo; (c) modelo relacional; (d) código SQL para crear la base de datos con sus restricciones.</p>
<div class="paper"></div><button class="btn alt hidep" data-act="reveal" data-id="${c.id}">Ver solución</button><div id="sol-${c.id}" class="hide"></div></div>`).join('');
    const normHtml = d.norm.map((nid) => nById[nid]).map((x) => `<div class="card"><h3>${esc(x.title)}</h3><pre>${esc(x.table)}</pre><p>${esc(x.ask)}</p><div class="paper"></div><div class="model hide"><b>Solución:</b><ul>${x.sol.map((s) => `<li>${s}</li>`).join('')}</ul></div></div>`).join('');
    page('#/examenes', `<p class="hidep"><a href="#/examenes">← Exámenes</a></p>
<div class="examhead"><h1>${esc(d.title)}</h1><div class="hidep"><span id="clock" class="clock"></span>
<button class="btn alt" data-act="print">🖨 Imprimir hoja</button>
<button class="btn alt" data-act="clock">▶ Iniciar cronómetro</button></div></div>
<p class="print-only">Nombre: ______________________ &nbsp; Fecha: ___________ &nbsp; Duración: ${d.min} min</p>
<h2>Parte A · Selección múltiple (${exam.mcs.length})</h2>${mcHtml}
${openHtml ? `<h2>Parte B · Preguntas abiertas (${d.open.length})</h2>${openHtml}` : ''}
${caseHtml ? `<h2>Parte C · Caso de diseño</h2>${caseHtml}` : ''}
${normHtml ? `<h2>Parte D · Normalización</h2>${normHtml}` : ''}
<p class="hidep"><button class="btn big" data-act="submit">Entregar y corregir</button></p><div id="result"></div>`);
  }
  function examSubmit() {
    if (!exam || exam.submitted) return;
    exam.submitted = true; clearInterval(timer);
    let ok = 0; const byT = {};
    document.querySelectorAll('.mcq').forEach((el) => {
      const s = exam.mcs[+el.dataset.i];
      const r = el.querySelector('input:checked');
      const good = r && s.ord[+r.value] === s.q.a;
      if (good) ok++;
      const t = byT[s.q.t] || (byT[s.q.t] = { ok: 0, total: 0 }); t.total++; if (good) t.ok++;
      record(s.q, !!good);
      el.classList.add(good ? 'okq' : 'badq');
      el.querySelectorAll('input').forEach((i) => { i.disabled = true; });
      el.querySelector('.fbx').innerHTML = `<div class="fb ${good ? 'good' : 'bad'}">${good ? '✔ Correcto. ' : (r ? '✘ Incorrecto. ' : '✘ Sin responder. ') }<b>Correcta:</b> ${esc(s.q.o[s.q.a])}<br>${esc(s.q.e)}</div>`;
    });
    document.querySelectorAll('.model').forEach((m) => m.classList.remove('hide'));
    store.exams.push({ title: exam.def.title, ok, total: exam.mcs.length, date: new Date().toLocaleDateString('es-CO') }); save();
    const p = pct(ok, exam.mcs.length);
    $('#result').innerHTML = `<div class="card res-card"><h2>Selección múltiple: ${ok}/${exam.mcs.length} (${p} %)</h2>
${Object.keys(byT).map((k) => `<div class="bar"><span>${esc(TOPICS[k])}</span><i><u style="width:${pct(byT[k].ok, byT[k].total)}%"></u></i><em>${byT[k].ok}/${byT[k].total}</em></div>`).join('')}
<p class="small">Las preguntas abiertas, el caso de diseño y la normalización se autoevalúan: compara tu respuesta con la solución mostrada (se abrieron arriba). Las falladas quedan en “Repasar falladas”.</p>
<a class="btn" href="#/examen/${exam.def.id}">Nuevo intento</a></div>`;
    $('#result').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Hoja de repaso ---------- */
  function cheat() {
    page('#/repaso', `<div class="examhead"><h1>Hoja de repaso</h1><button class="btn alt hidep" data-act="print">🖨 Imprimir</button></div>
<div class="card"><h3>Símbolos de cardinalidad</h3><table><tr><th>Cardinalidad</th><th>Pata de gallo</th><th>Significado</th></tr>
<tr><td>(1,1)</td><td><code>||</code></td><td>exactamente uno</td></tr><tr><td>(0,1)</td><td><code>o|</code></td><td>cero o uno</td></tr><tr><td>(1,n)</td><td><code>|&lt;</code></td><td>uno o muchos</td></tr><tr><td>(0,n)</td><td><code>o&lt;</code></td><td>cero o muchos</td></tr></table></div>
<div class="card"><h3>Checklist para el caso de diseño</h3><ol>
<li>Subraya sustantivos (entidades/atributos) y verbos (relaciones).</li><li>PK de cada entidad; atributos opcionales, multivaluados, derivados.</li><li>Cardinalidad (min,max) en ambos lados de cada relación.</li><li>N:M → tabla asociativa (PK compuesta de dos FK + atributos de la relación).</li><li>1:N → FK en el lado N (NOT NULL si mínimo 1).</li><li>Crea las tablas referenciadas primero; PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT.</li><li>Revisa: ¿cada FK apunta a una PK existente? ¿tipos coinciden?</li></ol></div>
<div class="card"><h3>Plantilla DDL</h3><pre>CREATE TABLE tabla (
  id_tabla SERIAL PRIMARY KEY,
  nombre   VARCHAR(100) NOT NULL,
  precio   NUMERIC(10,2) CHECK (precio &gt; 0),
  estado   VARCHAR(20) DEFAULT 'activo',
  id_otra  INT NOT NULL,
  FOREIGN KEY (id_otra) REFERENCES otra(id_otra)
);</pre></div>
<div class="card"><h3>Orden de una consulta</h3><p><code>SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY</code></p><p>WHERE filtra filas · HAVING filtra grupos · IS NULL (nunca = NULL) · &lt;&gt; es distinto.</p></div>
<div class="card"><h3>Normalización</h3><p>1FN atómico · 2FN sin dependencias parciales · 3FN sin transitivas. Anomalías: inserción, actualización, eliminación.</p></div>
<div class="card"><h3>Generalización (3 opciones)</h3><p>1) Tabla única + discriminante · 2) Supertipo + subtipos con la PK del supertipo · 3) Solo subtipos con atributos comunes.</p></div>
<div class="card"><h3>Datos a memorizar</h3><p>Chen 1976 (E/R) · Codd 1970 (relacional) · SERIAL es de PostgreSQL · DDL/DML/DQL/DCL/TCL · exclusividad/exclusión/inclusividad/inclusión.</p></div>`);
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'pick') quizPick(+el.dataset.k);
    else if (act === 'next') { quiz.i++; quizShow(); }
    else if (act === 'tab') {
      const g = el.dataset.g, k = el.dataset.k;
      document.querySelectorAll(`.tab[data-g="${g}"]`).forEach((b) => b.classList.toggle('on', b === el));
      document.querySelectorAll(`.tabpane[data-g="${g}"]`).forEach((p) => p.classList.toggle('hide', p.dataset.k !== k));
    } else if (act === 'reveal') {
      const box = $('#sol-' + el.dataset.id);
      if (!box.innerHTML) box.innerHTML = caseTabs(cById[el.dataset.id], el.dataset.id);
      box.classList.toggle('hide');
      el.textContent = box.classList.contains('hide') ? 'Mostrar solución' : 'Ocultar solución';
    } else if (act === 'toggle') {
      const b = $('#' + el.dataset.id); b.classList.toggle('hide');
      el.textContent = b.classList.contains('hide') ? 'Ver solución' : 'Ocultar solución';
    } else if (act === 'submit') examSubmit();
    else if (act === 'print') window.print();
    else if (act === 'goto') { ev.preventDefault(); const t = document.getElementById(el.dataset.id); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
    else if (act === 'clock') {
      clearInterval(timer); const end = Date.now() + exam.def.min * 60000;
      const tick = () => { const s = Math.max(0, Math.round((end - Date.now()) / 1000)); const c = $('#clock'); if (c) c.textContent = '⏱ ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); if (!s) clearInterval(timer); };
      tick(); timer = setInterval(tick, 1000);
    }
  });

  /* ---------- router ---------- */
  function route() {
    clearInterval(timer);
    const h = location.hash || '#/';
    const p = h.split('/').filter(Boolean); // ['#','quiz','run','er']
    const a = p[1], b = p[2], c = p[3];
    try {
      if (!a) home();
      else if (a === 'teoria') theory();
      else if (a === 'quiz') (b === 'run' ? quizRun(c) : quizMenu());
      else if (a === 'casos') casesList();
      else if (a === 'caso') caseView(b);
      else if (a === 'labs') labsList();
      else if (a === 'lab') labView(b);
      else if (a === 'examenes') examsList();
      else if (a === 'examen') examView(b);
      else if (a === 'repaso') cheat();
      else home();
    } catch (e) { app.innerHTML = '<div class="card bad">Error: ' + esc(e.message) + '</div>'; console.error(e); }
  }
  window.addEventListener('hashchange', route);
  route();
})();
