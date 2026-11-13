/* Vista del módulo de JOINs: Venn interactivo, demo fila por fila, patrones, errores típicos y mini-quiz.
   Ruta: #/joins. Contenido en js/data/joins_module.js. */
(function () {
  const M = window.JOINS_MODULE, esc = UI.esc;
  const st = { pair: 'est_ins', type: 'left', step: -1 }; // step -1 = resultado completo
  const typeByKey = {}; M.TYPES.forEach((t) => { typeByKey[t.key] = t; });
  const pairById = {}; M.DEMO.forEach((p) => { pairById[p.id] = p; });

  /* ---------- cálculo del JOIN en JS (para mostrar fila por fila) ---------- */
  function compute(pair, type) {
    const A = pair.A, B = pair.B;
    const ia = A.cols.indexOf(pair.keyA), ib = B.cols.indexOf(pair.keyB);
    const label = (T, r) => `${T.cols[0]} = ${r[0]} (${r[1]})`;
    const matches = A.rows.map((a) => B.rows.map((b, j) => (a[ia] !== null && a[ia] === b[ib] ? j : -1)).filter((j) => j >= 0));
    const R = new Set(type.regions);
    const rows = [], steps = [];
    if (type.cross) {
      A.rows.forEach((a, i) => {
        const from = rows.length;
        B.rows.forEach((_, j) => rows.push({ ai: i, bj: j, kind: 'match' }));
        steps.push({ focusA: i, hits: B.rows.map((_, j) => j), from, to: rows.length,
          text: `<b>${A.name}</b> fila ${label(A, a)}: se combina con <b>las ${B.rows.length} filas</b> de ${B.name}, tengan o no relación → ${B.rows.length} filas.` });
      });
    } else {
      A.rows.forEach((a, i) => {
        const from = rows.length, m = matches[i];
        let text;
        if (m.length) {
          if (R.has('ab')) { m.forEach((j) => rows.push({ ai: i, bj: j, kind: 'match' })); text = `tiene <b>${m.length}</b> pareja(s) en ${B.name} (${B.cols[0]} ${m.map((j) => B.rows[j][0]).join(', ')}) → produce ${m.length} fila(s).`; }
          else text = `tiene pareja, pero este JOIN solo quiere las filas <i>sin</i> pareja → se descarta.`;
        } else if (R.has('a')) { rows.push({ ai: i, bj: null, kind: 'a' }); text = `<b>no tiene pareja</b> (${pair.keyA} = ${a[ia] === null ? 'NULL' : a[ia]} no aparece en ${B.name}) → se conserva con <b>NULL</b> en las columnas de ${B.name}.`; }
        else text = `<b>no tiene pareja</b> → ${type.key === 'inner' ? 'INNER JOIN la descarta' : 'este JOIN no conserva la tabla izquierda: se descarta'}.`;
        steps.push({ focusA: i, hits: m, from, to: rows.length, text: `<b>${A.name}</b> fila ${label(A, a)}: ${text}` });
      });
      const orph = B.rows.map((_, j) => j).filter((j) => !matches.some((m) => m.includes(j)));
      if (orph.length) {
        const from = rows.length;
        const names = orph.map((j) => label(B, B.rows[j])).join('; ');
        if (R.has('b')) {
          orph.forEach((j) => rows.push({ ai: null, bj: j, kind: 'b' }));
          steps.push({ focusB: orph, from, to: rows.length, text: `Al final, las filas de <b>${B.name}</b> que nadie emparejó (${names}) se agregan con <b>NULL</b> en las columnas de ${A.name}.` });
        } else steps.push({ focusB: orph, from, to: from, text: `Las filas de <b>${B.name}</b> sin pareja (${names}) no entran: este JOIN no conserva la tabla derecha.` });
      } else if (R.has('b')) steps.push({ focusB: [], from: rows.length, to: rows.length, text: `Todas las filas de <b>${B.name}</b> ya tenían pareja: no se agregan filas con NULL a la izquierda.` });
    }
    const inA = A.rows.map((_, i) => rows.some((r) => r.ai === i));
    const inB = B.rows.map((_, j) => rows.some((r) => r.bj === j));
    const hasA = matches.map((m) => m.length > 0);
    const hasB = B.rows.map((_, j) => matches.some((m) => m.includes(j)));
    return { rows, steps, inA, inB, hasA, hasB };
  }

  function sqlFor(pair, type) {
    const A = pair.A, B = pair.B, a = A.alias, b = B.alias;
    const sel = A.cols.map((c) => `${a}.${c}`).concat(B.cols.map((c) => `${b}.${c}`)).join(', ');
    if (type.cross) return `SELECT ${sel}\nFROM ${A.name} ${a}\nCROSS JOIN ${B.name} ${b};`;
    let s = `SELECT ${sel}\nFROM ${A.name} ${a}\n${type.join} ${B.name} ${b} ON ${a}.${pair.keyA} = ${b}.${pair.keyB}`;
    if (type.where === 'b') s += `\nWHERE ${b}.${B.cols[0]} IS NULL`;
    if (type.where === 'a') s += `\nWHERE ${a}.${A.cols[0]} IS NULL`;
    if (type.where === 'ab') s += `\nWHERE ${a}.${A.cols[0]} IS NULL OR ${b}.${B.cols[0]} IS NULL`;
    return s + ';';
  }

  /* ---------- Venn ---------- */
  function venn(type, pair) {
    const R = new Set(type.regions);
    const on = 'var(--venn-on)', off = 'var(--card)';
    // Círculos de radio 80 con centros en x=110 y x=190: se cortan en x=150, y=100±69.28
    const lens = 'M150,30.72 A80,80 0 0,1 150,169.28 A80,80 0 0,1 150,30.72 Z';
    return `<svg class="venn" viewBox="0 0 300 200" role="img" aria-label="Diagrama de Venn de ${esc(type.name)}">
<circle cx="110" cy="100" r="80" data-reg="a" style="fill:${R.has('a') ? on : off}"/>
<circle cx="190" cy="100" r="80" data-reg="b" style="fill:${R.has('b') ? on : off}"/>
<path d="${lens}" data-reg="ab" style="fill:${R.has('ab') ? on : off}"/>
<circle cx="110" cy="100" r="80" class="vline"/><circle cx="190" cy="100" r="80" class="vline"/>
<text x="62" y="105" class="vlbl">A</text><text x="230" y="105" class="vlbl">B</text>
<text x="110" y="194" class="vsub">${esc(pair.A.name)}</text><text x="190" y="194" class="vsub" text-anchor="start" dx="-10">${esc(pair.B.name)}</text>
${type.cross ? '<text x="150" y="20" class="vsub" text-anchor="middle">CROSS JOIN: no es una región, es A × B</text>' : ''}
</svg>`;
  }
  const regionsToType = (set) => {
    const k = ['a', 'ab', 'b'].filter((r) => set.has(r)).join(',');
    return { 'ab': 'inner', 'a,ab': 'left', 'ab,b': 'right', 'a,ab,b': 'full', 'a': 'left_only', 'b': 'right_only', 'a,b': 'full_only' }[k];
  };

  /* ---------- tablas de la demo ---------- */
  function demoTable(T, state, hasPair, focus, hits, side) {
    return `<div class="dtab"><p class="dname">${esc(T.name)} <span class="muted">(${T.alias}) · ${side}</span></p><div class="tblwrap"><table class="res demo">
<tr><th></th>${T.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
${T.rows.map((r, i) => {
      const cls = [hasPair[i] ? 'r-match' : 'r-orphan', state[i] ? 'r-in' : 'r-out', focus.includes(i) ? 'r-focus' : '', hits.includes(i) ? 'r-hit' : ''].join(' ');
      return `<tr class="${cls}"><td class="tag">${state[i] ? '✓' : '✗'}</td>${r.map((v) => (v === null ? '<td class="null">NULL</td>' : `<td>${esc(v)}</td>`)).join('')}</tr>`;
    }).join('')}</table></div></div>`;
  }

  function renderLab() {
    const box = document.getElementById('joinlab');
    if (!box) return;
    const pair = pairById[st.pair], type = typeByKey[st.type];
    const c = compute(pair, type);
    const last = c.steps.length - 1;
    const step = st.step < 0 ? null : c.steps[Math.min(st.step, last)];
    const shown = step ? c.rows.slice(0, step.to) : c.rows;
    const fA = step && step.focusA !== undefined ? [step.focusA] : [];
    const fB = step && step.focusB ? step.focusB : [];
    const hits = step && step.hits ? step.hits : [];
    const cols = pair.A.cols.map((x) => `${pair.A.alias}.${x}`).concat(pair.B.cols.map((x) => `${pair.B.alias}.${x}`));
    const nA = pair.A.cols.length, nB = pair.B.cols.length;
    const resRows = shown.map((r, k) => {
      const a = r.ai === null ? new Array(nA).fill(null) : pair.A.rows[r.ai];
      const b = r.bj === null ? new Array(nB).fill(null) : pair.B.rows[r.bj];
      const fresh = step && k >= step.from;
      return `<tr class="k-${r.kind}${fresh ? ' r-new' : ''}">${a.concat(b).map((v) => (v === null ? '<td class="null">NULL</td>' : `<td>${esc(v)}</td>`)).join('')}</tr>`;
    }).join('');
    const ex = { id: 'demo', db: pair.db, data: pair.data, sql: sqlFor(pair, type) };

    box.innerHTML = `
<div class="labctl">
  <label>Tablas: <select data-j="pair">${M.DEMO.map((p) => `<option value="${p.id}"${p.id === st.pair ? ' selected' : ''}>${esc(p.label)}</option>`).join('')}</select></label>
  <div class="chips">${M.TYPES.map((t) => `<button class="chip${t.key === st.type ? ' on' : ''}" data-j="type" data-k="${t.key}">${esc(t.name)}</button>`).join('')}</div>
</div>
<div class="labtop">
  <div class="vennbox">${venn(type, pair)}<p class="small muted">Toca las regiones del diagrama para combinarlas.</p></div>
  <div><h3>${esc(type.name)}</h3><p>${type.desc}</p><p class="small">${esc(pair.note)}</p>${UI.example(ex)}</div>
</div>
<div class="legend small"><span class="lg l-match">con pareja</span><span class="lg l-orphan">sin pareja</span><span>✓ entra al resultado · ✗ queda fuera</span></div>
<div class="demos">${demoTable(pair.A, c.inA, c.hasA, fA, [], 'izquierda (A)')}${demoTable(pair.B, c.inB, c.hasB, fB.concat(hits), [], 'derecha (B)')}</div>
<div class="stepbar">
  <button class="btn sm alt" data-j="step" data-d="first">⏮ Paso a paso</button>
  <button class="btn sm alt" data-j="step" data-d="-1"${st.step <= 0 ? ' disabled' : ''}>◀ Anterior</button>
  <span class="small">${step ? `Paso ${Math.min(st.step, last) + 1} de ${c.steps.length}` : 'Resultado completo'}</span>
  <button class="btn sm alt" data-j="step" data-d="1"${step && st.step >= last ? ' disabled' : ''}>${step ? 'Siguiente ▶' : ''}${step ? '' : 'Ver paso 1 ▶'}</button>
  <button class="btn sm alt" data-j="step" data-d="all">Ver todo ⏭</button>
</div>
${step ? `<div class="steptext">${step.text}</div>` : ''}
<h4>Resultado: ${shown.length}${step ? ` de ${c.rows.length}` : ''} fila(s)</h4>
<div class="tblwrap"><table class="res demo"><tr>${cols.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${resRows || `<tr><td colspan="${cols.length}" class="muted">(todavía sin filas)</td></tr>`}</table></div>
<p class="small legend"><span class="lg k-match">coincidencia</span><span class="lg k-a">solo izquierda (NULL a la derecha)</span><span class="lg k-b">solo derecha (NULL a la izquierda)</span></p>`;
  }

  /* ---------- página ---------- */
  function view() {
    const store = APP.store;
    store.seen = store.seen || {}; store.seen.joins = Date.now(); APP.save();
    store.mq = store.mq || {};
    const EX = window.SQL_EXERCISES;
    const jx = EX.LIST.filter((e) => e.topic === 'joins');
    const solved = (store.sql && store.sql.status) || {};
    const lvl = Object.keys(EX.LEVELS).map((k) => { const l = jx.filter((e) => e.level === k); return `<a class="card tile" href="#/sql/t/joins/${k}"><b>${EX.LEVELS[k]}</b><span>${l.filter((e) => solved[e.id] === 'ok').length}/${l.length} resueltos</span></a>`; }).join('');

    APP.page('#/joins', `
<section class="hero"><h1>JOINs</h1><p>El tema con más peso del examen. Aquí ves qué hace cada JOIN fila por fila, lo ejecutas en PostgreSQL real y practicas con ejercicios calificados.</p></section>
<div class="toc">
 <a href="#jn-que" data-act="goto" data-id="jn-que">1. Qué es</a><a href="#jn-lab" data-act="goto" data-id="jn-lab">2. Laboratorio visual</a>
 <a href="#jn-tipos" data-act="goto" data-id="jn-tipos">3. Resumen</a><a href="#jn-pat" data-act="goto" data-id="jn-pat">4. Patrones</a>
 <a href="#jn-err" data-act="goto" data-id="jn-err">5. Errores típicos</a><a href="#jn-quiz" data-act="goto" data-id="jn-quiz">6. Mini-quiz</a>
 <a href="#jn-ej" data-act="goto" data-id="jn-ej">7. Ejercicios</a></div>

<section class="card" id="jn-que"><h2>1. ¿Qué es un JOIN?</h2>
<p>Los JOIN permiten obtener datos de <b>varias tablas</b> en una sola consulta. Las tablas se relacionan mediante columnas del mismo tipo de dato: casi siempre la <b>clave primaria (PK)</b> de una tabla y la <b>clave foránea (FK)</b> que la referencia en la otra.</p>
<p>Ejemplo de clase: <code>inscripciones.id_estudiante</code> (FK) apunta a <code>estudiantes.id_estudiante</code> (PK). Para saber el nombre del estudiante de cada inscripción, se unen las dos tablas con esa condición:</p>
${UI.code('SELECT e.nombre, i.nota_final\nFROM estudiantes e                 -- tabla izquierda (A)\nINNER JOIN inscripciones i         -- tabla derecha (B)\n  ON e.id_estudiante = i.id_estudiante;  -- condición: PK = FK')}
<div class="tip"><b>Lo que cambia entre los tipos de JOIN es qué pasa con las filas que NO tienen pareja:</b> INNER las descarta, LEFT conserva las de la izquierda, RIGHT las de la derecha y FULL las de ambas tablas. Donde falta la pareja se pone <b>NULL</b>.</div>
</section>

<section class="card" id="jn-lab"><h2>2. Laboratorio visual: fila por fila</h2>
<p>Elige un tipo de JOIN (o toca las regiones del diagrama) y mira qué filas entran al resultado. Usa <b>Paso a paso</b> para ver cómo PostgreSQL recorre la tabla izquierda fila por fila.</p>
<div id="joinlab"></div></section>

<section class="card" id="jn-tipos"><h2>3. Resumen de los tipos de JOIN</h2>
<div class="tblwrap"><table><tr><th>Tipo</th><th>¿Qué hace?</th><th>¿Qué muestra?</th><th>Sintaxis</th></tr>
${M.SUMMARY.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><code>${esc(r[3])}</code></td></tr>`).join('')}</table></div>
<h3>Receta para escribir un JOIN en el examen</h3>
<ol class="plan">
<li><b>¿Qué columnas</b> pide el enunciado? Escríbelas en el SELECT.</li>
<li><b>¿De qué tablas</b> salen? Si dos tablas no se tocan directamente, busca la tabla intermedia (por ejemplo inscripciones entre estudiantes y cursos).</li>
<li><b>Une por PK = FK</b>: una condición ON por cada tabla nueva (N tablas → N−1 ON).</li>
<li><b>¿Hay que conservar filas sin pareja?</b> Palabras como "todos", "incluso los que no", "sin" → LEFT/RIGHT/FULL. Si no, INNER.</li>
<li><b>¿Busca los que NO tienen relación?</b> → LEFT JOIN … WHERE columna_de_la_derecha IS NULL.</li>
<li>Filtros (WHERE), grupos (GROUP BY / HAVING) y orden (ORDER BY), en ese orden.</li>
<li>Pon <b>alias</b> a cada tabla y úsalos en todas las columnas para evitar ambigüedades.</li></ol>
</section>

<section class="card" id="jn-pat"><h2>4. Patrones que más salen</h2>
<p>Cada ejemplo se ejecuta en PostgreSQL real dentro del navegador. Pulsa <b>Ejecutar</b> o ábrelo en el editor para modificarlo.</p>
${M.PATTERNS.map((p) => UI.example({ id: p.id, db: p.db, data: p.data || 'orig', sql: p.sql, title: p.title, note: p.note })).join('')}
</section>

<section class="card" id="jn-err"><h2>5. Errores típicos (y cómo arreglarlos)</h2>
${M.MISTAKES.map((m) => `<div class="mistake"><h3>${esc(m.title)}</h3>
<div class="twocol"><div><p class="tagbad">✗ Mal</p>${UI.example({ id: m.id + '_mal', db: m.wrong.db, data: 'orig', sql: m.wrong.sql })}</div>
<div><p class="taggood">✓ Bien</p>${UI.example({ id: m.id + '_bien', db: m.fix.db, data: 'orig', sql: m.fix.sql })}</div></div>
<p>${m.why}</p></div>`).join('')}
</section>

<section class="card" id="jn-quiz"><h2>6. Mini-quiz de JOINs</h2>
${UI.miniQuiz('joins', M.QUIZ, (i, ok) => { store.mq.joins = store.mq.joins || {}; store.mq.joins[i] = ok; APP.save(); })}
</section>

<section class="card" id="jn-ej"><h2>7. Ejercicios de JOINs (${jx.length})</h2>
<p>Se califican solos: escribe tu consulta, pulsa <b>Calificar</b> y te dice si sobran o faltan filas o columnas. Incluyen las consultas de la Sesión 8, las del laboratorio final (bancodb) y las del laboratorio Biblioteca.</p>
<div class="grid">${lvl}<a class="card tile hl" href="#/sql/t/joins"><b>Ver todos</b><span>${jx.length} ejercicios</span></a></div>
</section>`);
    renderLab();
  }

  document.addEventListener('click', (ev) => {
    const reg = ev.target.closest('.venn [data-reg]');
    if (reg) {
      const cur = typeByKey[st.type];
      const set = new Set(cur.cross ? [] : cur.regions);
      const r = reg.dataset.reg;
      set.has(r) ? set.delete(r) : set.add(r);
      const k = regionsToType(set);
      if (k) { st.type = k; st.step = -1; renderLab(); }
      return;
    }
    const el = ev.target.closest('[data-j]');
    if (!el) return;
    const j = el.dataset.j;
    if (j === 'type') { st.type = el.dataset.k; st.step = -1; }
    else if (j === 'step') {
      const d = el.dataset.d;
      if (d === 'first') st.step = 0;
      else if (d === 'all') st.step = -1;
      else st.step = Math.max(0, (st.step < 0 ? -1 : st.step) + +d);
    } else return;
    renderLab();
  });
  document.addEventListener('change', (ev) => {
    if (ev.target.matches('[data-j="pair"]')) { st.pair = ev.target.value; st.step = -1; renderLab(); }
  });

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.joins = view;
})();
