/* Componentes compartidos de interfaz: resaltado de SQL, tablas de resultados, explicación de errores,
   carga del motor y de CodeMirror, ejemplos ejecutables y mini-quiz. Expone window.UI. */
(function () {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CM_BASE = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.19/';

  /* ---------- resaltado estático de SQL (bloques de ejemplo) ---------- */
  const KW = ['SELECT', 'FROM', 'WHERE', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'JOIN', 'ON', 'USING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'ILIKE', 'BETWEEN', 'EXISTS', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'DISTINCT', 'CREATE', 'TABLE', 'ALTER', 'ADD', 'DROP', 'TRUNCATE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'CONSTRAINT', 'CASCADE', 'VIEW', 'INDEX', 'BEGIN', 'COMMIT', 'ROLLBACK', 'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COLUMN', 'DATABASE', 'TRUE', 'FALSE'];
  const FN = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'CONCAT', 'UPPER', 'LOWER', 'LENGTH', 'NOW', 'CURRENT_DATE', 'EXTRACT'];
  const TYPES = ['SERIAL', 'INT', 'INTEGER', 'SMALLINT', 'BIGINT', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'TIME', 'TIMESTAMP', 'BOOLEAN', 'NUMERIC', 'DECIMAL', 'FLOAT', 'REAL'];
  const tokRe = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g;
  function hl(sql) {
    let out = '', m;
    tokRe.lastIndex = 0;
    while ((m = tokRe.exec(sql))) {
      if (m[1]) out += `<span class="t-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="t-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="t-num">${m[3]}</span>`;
      else if (m[4]) {
        const u = m[4].toUpperCase();
        out += KW.includes(u) ? `<span class="t-kw">${esc(m[4])}</span>` : FN.includes(u) ? `<span class="t-fn">${esc(m[4])}</span>` : TYPES.includes(u) ? `<span class="t-ty">${esc(m[4])}</span>` : esc(m[4]);
      } else out += esc(m[5]);
    }
    return out;
  }
  const code = (sql) => `<pre class="sql">${hl(sql)}</pre>`;

  /* ---------- tablas de resultados ---------- */
  const cell = (v) => (v === null || v === undefined ? '<td class="null">NULL</td>' : `<td>${esc(GRADER.show(v))}</td>`);
  function table(res, opts) {
    opts = opts || {};
    const max = opts.max || 200;
    const rows = res.rows.slice(0, max);
    const head = `<tr>${res.fields.map((f) => `<th>${esc(f)}</th>`).join('')}</tr>`;
    const body = rows.map((r, i) => `<tr${opts.rowClass ? ` class="${opts.rowClass(r, i) || ''}"` : ''}>${r.map(cell).join('')}</tr>`).join('');
    const more = res.rows.length > max ? `<p class="small">… y ${res.rows.length - max} filas más.</p>` : '';
    return `<div class="tblwrap"><table class="res">${head}${body}</table></div>${more}`;
  }

  /* ---------- errores de PostgreSQL explicados en español ---------- */
  const ERRS = [
    [/column reference "([^"]+)" is ambiguous/, (m) => `Columna ambigua: <b>${m[1]}</b> existe en más de una tabla del FROM. Antepón el alias de la tabla, por ejemplo <code>e.${m[1]}</code>.`],
    [/column "?([^" ]+)"? does not exist/, (m) => `No existe la columna <b>${m[1]}</b>. Revisa el nombre en el esquema (a la derecha), la tilde/mayúsculas y que el alias corresponda a la tabla correcta. Si es un texto, escríbelo entre comillas simples: <code>'${m[1].replace(/^\w+\./, '')}'</code>.`],
    [/relation "([^"]+)" does not exist/, (m) => `No existe la tabla <b>${m[1]}</b> en esta base de datos. Revisa el nombre (en plural/singular) o, si la borraste, pulsa <b>Reiniciar base de datos</b>.`],
    [/invalid reference to FROM-clause entry for table "([^"]+)"/, (m) => `Ya le diste un alias a la tabla <b>${m[1]}</b>: a partir de ahí debes usar el alias (por ejemplo <code>e.nombre</code>), no el nombre completo de la tabla.`],
    [/missing FROM-clause entry for table "([^"]+)"/, (m) => `Usas <b>${m[1]}.</b> pero esa tabla o alias no está en el FROM/JOIN. ¿Olvidaste unir la tabla o escribiste mal el alias?`],
    [/must appear in the GROUP BY clause or be used in an aggregate function/, () => 'Con GROUP BY, toda columna del SELECT que no esté dentro de COUNT/SUM/AVG/MIN/MAX debe aparecer en el GROUP BY.'],
    [/aggregate functions are not allowed in WHERE/, () => 'No puedes usar COUNT/SUM/AVG… en el WHERE. Para filtrar grupos usa HAVING; para comparar con un promedio usa una subconsulta: <code>WHERE x &gt; (SELECT AVG(x) FROM t)</code>.'],
    [/syntax error at end of input/, () => 'La consulta termina incompleta. ¿Falta la condición ON después del JOIN, cerrar un paréntesis o terminar el WHERE?'],
    [/syntax error at or near "([^"]+)"/, (m) => `Error de sintaxis cerca de <b>${esc(m[1])}</b>. Revisa comas (no va coma antes de FROM), paréntesis, el orden de las cláusulas (SELECT, FROM, JOIN … ON, WHERE, GROUP BY, HAVING, ORDER BY) y que cada JOIN tenga su ON.`],
    [/more than one row returned by a subquery used as an expression/, () => 'La subconsulta devuelve varias filas y la comparas con = o &gt;. Usa <code>IN (…)</code> o haz que devuelva un solo valor (MAX, MIN, AVG…).'],
    [/operator does not exist/, () => 'Estás comparando tipos distintos (por ejemplo número con texto). Los textos y fechas van entre comillas simples; los números sin comillas.'],
    [/unterminated quoted string/, () => 'Falta cerrar una comilla simple.'],
    [/invalid input syntax for type (\w+)/, (m) => `Un valor no tiene el formato del tipo <b>${m[1]}</b> (fechas: 'AAAA-MM-DD'; números sin puntos de miles).`],
    [/violates foreign key constraint/, () => 'Integridad referencial: la FK apunta a un registro que no existe (o intentas borrar un registro que otras filas referencian).'],
    [/violates not-null constraint/, () => 'Restricción NOT NULL: esa columna es obligatoria.'],
    [/duplicate key value violates unique constraint/, () => 'Valor duplicado en una PK o columna UNIQUE.'],
    [/violates check constraint/, () => 'El valor no cumple la restricción CHECK de la tabla.'],
    [/division by zero/, () => 'División por cero.']
  ];
  function explainError(err, sql) {
    let tip = '';
    for (const [re, f] of ERRS) { const m = err.message.match(re); if (m) { tip = f(m); break; } }
    let where = '';
    if (err.position && sql) {
      const pos = err.position - 1, start = sql.lastIndexOf('\n', pos - 1) + 1, endI = sql.indexOf('\n', pos);
      const line = sql.slice(start, endI < 0 ? sql.length : endI);
      where = `<pre class="caret">${esc(line)}\n${' '.repeat(Math.max(0, pos - start))}^</pre>`;
    }
    return `<div class="fb bad"><b>Error de PostgreSQL:</b> <code>${esc(err.message)}</code>${where}${tip ? `<p>💡 ${tip}</p>` : ''}${err.hint ? `<p class="small">Sugerencia del motor: ${esc(err.hint)}</p>` : ''}</div>`;
  }

  // Renderiza la salida de SQLENGINE.run: resultados de cada sentencia o el error.
  function runOutput(r, sql) {
    if (r.error) return explainError(r.error, sql);
    const parts = r.results.map((res, i) => {
      if (res.fields.length) return `<p class="small">${res.rows.length} fila(s)${r.results.length > 1 ? ` · sentencia ${i + 1}` : ''}</p>${table(res)}`;
      return '';
    }).filter(Boolean);
    const affected = r.results.filter((x) => !x.fields.length && x.affected).map((x) => x.affected);
    const msg = affected.length ? `<p class="small">✔ Sentencias ejecutadas · filas afectadas: ${affected.join(', ')}</p>` : '';
    return (parts.join('') || (msg ? '' : '<p class="small">✔ Ejecutado (sin filas que mostrar).</p>')) + msg + `<p class="small muted">${r.ms} ms</p>`;
  }

  /* ---------- motor (carga perezosa con aviso) ---------- */
  function engine() {
    const bar = document.getElementById('enginebar');
    if (bar && !bar.dataset.done) bar.classList.remove('hide');
    return SQLENGINE.load().then((e) => {
      if (bar) { bar.dataset.done = '1'; bar.classList.add('hide'); }
      return e;
    }, (err) => {
      if (bar) bar.innerHTML = `⚠ No se pudo cargar PostgreSQL (PGlite). Revisa tu conexión a internet y recarga la página. <small>${esc(err.message)}</small>`;
      throw err;
    });
  }

  /* ---------- CodeMirror (con respaldo a textarea) ---------- */
  let cmLoading = null;
  function loadCSS(href) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
  function loadJS(src) { return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error('No cargó ' + src)); document.head.appendChild(s); }); }
  function loadCM() {
    if (!cmLoading) {
      loadCSS(CM_BASE + 'lib/codemirror.min.css');
      cmLoading = loadJS(CM_BASE + 'lib/codemirror.min.js').then(() => loadJS(CM_BASE + 'mode/sql/sql.min.js')).catch(() => null);
    }
    return cmLoading;
  }
  // Devuelve {get, set, focus}. onRun se llama con Ctrl/Cmd+Enter.
  function editor(textarea, onRun, onChange) {
    const api = { get: () => textarea.value, set: (v) => { textarea.value = v; }, focus: () => textarea.focus() };
    textarea.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun(); } });
    if (onChange) textarea.addEventListener('input', () => onChange(textarea.value));
    loadCM().then(() => {
      if (!window.CodeMirror || !textarea.isConnected) return;
      const cm = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-pgsql', lineNumbers: true, indentUnit: 2, tabSize: 2, lineWrapping: true, matchBrackets: true,
        extraKeys: { 'Ctrl-Enter': onRun, 'Cmd-Enter': onRun, Tab: (c) => c.replaceSelection('  ') }
      });
      if (onChange) cm.on('change', () => onChange(cm.getValue()));
      api.get = () => cm.getValue(); api.set = (v) => cm.setValue(v); api.focus = () => cm.focus();
    });
    return api;
  }

  /* ---------- ejemplos ejecutables ---------- */
  const examples = {};
  // x = {id, db, data, sql, title?, note?}
  function example(x) {
    examples[x.id] = x;
    return `<div class="example" id="ex-${x.id}">${x.title ? `<p class="extitle">${esc(x.title)}</p>` : ''}${code(x.sql)}
<div class="exbar"><button class="btn sm" data-ui="run-ex" data-id="${x.id}">▶ Ejecutar</button>
<button class="btn sm alt" data-ui="open-ex" data-id="${x.id}">Abrir en el editor</button>
<span class="small muted">${esc(x.db)} · ${x.data === 'ext' ? 'datos extendidos' : 'datos originales'}</span></div>
<div class="exout"></div>${x.note ? `<p class="small">${x.note}</p>` : ''}</div>`;
  }
  function openInEditor(x) {
    try { sessionStorage.setItem('bdfp_handoff', JSON.stringify({ db: x.db, data: x.data || 'orig', sql: x.sql })); } catch (e) { /* sin storage */ }
    location.hash = '#/sql/libre';
  }

  /* ---------- mini-quiz ---------- */
  // qs = [{q, o: [{t, ok, why}]}]; cada opción explica por qué es correcta o incorrecta.
  const quizzes = {};
  function miniQuiz(id, qs, onAnswer) {
    quizzes[id] = { qs, onAnswer, ok: 0, done: 0 };
    return `<div class="miniquiz" id="mq-${id}">${qs.map((q, i) => `<div class="mq card" data-i="${i}"><p class="q"><b>${i + 1}.</b> ${q.q}</p>
${q.code ? code(q.code) : ''}<div class="opts">${q.o.map((o, k) => `<button class="opt" data-ui="mq" data-quiz="${id}" data-i="${i}" data-k="${k}"><b>${'ABCDEF'[k]}</b><span>${o.t}</span></button>`).join('')}</div><div class="mqfb"></div></div>`).join('')}
<p class="mqscore small"></p></div>`;
  }
  function mqPick(el) {
    const z = quizzes[el.dataset.quiz]; if (!z) return;
    const i = +el.dataset.i, k = +el.dataset.k, q = z.qs[i];
    const box = el.closest('.mq');
    if (box.dataset.done) return;
    box.dataset.done = '1';
    const ok = !!q.o[k].ok;
    z.done++; if (ok) z.ok++;
    box.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (q.o[j].ok) b.classList.add('good'); else if (j === k) b.classList.add('bad'); });
    box.querySelector('.mqfb').innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? '¡Correcto!' : 'Incorrecto.'}</b><ul class="why">${q.o.map((o, j) => `<li class="${o.ok ? 'w-ok' : j === k ? 'w-bad' : ''}"><b>${'ABCDEF'[j]}.</b> ${o.why}</li>`).join('')}</ul></div>`;
    const sc = box.parentElement.querySelector('.mqscore');
    sc.textContent = `Llevas ${z.ok}/${z.done} correctas de ${z.qs.length}.`;
    if (z.onAnswer) z.onAnswer(i, ok, z);
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', async (ev) => {
    const el = ev.target.closest('[data-ui]');
    if (!el) return;
    const act = el.dataset.ui;
    if (act === 'mq') return mqPick(el);
    if (act === 'run-ex' || act === 'open-ex') {
      const x = examples[el.dataset.id]; if (!x) return;
      if (act === 'open-ex') return openInEditor(x);
      const out = el.closest('.example').querySelector('.exout');
      out.innerHTML = '<p class="small">Ejecutando…</p>';
      try {
        const eng = await engine(); // los ejemplos usan la copia intacta: no tocan lo que hagas en el editor
        out.innerHTML = runOutput(await eng.runSafe(x.db, x.data || 'orig', x.sql), x.sql);
      } catch (e) { out.innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; }
    }
  });

  window.UI = { esc, hl, code, table, explainError, runOutput, engine, editor, example, openInEditor, miniQuiz };
})();
