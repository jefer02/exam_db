/* Verifica todo el SQL del sitio con PostgreSQL real (PGlite, la misma versión que usa el navegador).
   Uso: npm install && npm run verify
   Comprueba:
   - Que las bases de práctica (originales y extendidas) se crean sin errores.
   - Cada ejercicio: campos válidos, solución sin errores y con filas, el calificador acepta la solución
     y sus alternativas (alts) y rechaza una respuesta incorrecta; si tiene `order`, la solución usa ORDER BY.
   - Los ejemplos de los módulos (EXAMPLES): se ejecutan sin error (o fallan si se espera error).
   - Que calificar dentro de BEGIN…ROLLBACK no altera los datos de calificación. */
const path = require('path');
const root = path.join(__dirname, '..');
const P = require(path.join(root, 'js/data/practice_db.js'));
const G = require(path.join(root, 'js/sql/grader.js'));
const { createEngine } = require(path.join(root, 'js/sql/engine.js'));
const EX = require(path.join(root, 'js/data/sql_exercises.js'));
const exampleFiles = ['js/data/joins_module.js'];

let failures = 0;
const fail = (msg) => { failures++; console.log('  ✗ ' + msg); };

(async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const t0 = Date.now();
  const eng = createEngine(PGlite, P, G);
  try { await eng.init(); } catch (e) { console.log('✗ No se pudieron crear las bases de práctica: ' + e.message); process.exit(1); }
  console.log(`✓ Bases de práctica creadas (${P.DBS.map((d) => d.id).join(', ')} × originales/extendidos) en ${Date.now() - t0} ms`);

  // ---------- Ejercicios ----------
  console.log(`\nEjercicios (${EX.LIST.length})`);
  const ids = new Set();
  let okCount = 0, altCount = 0;
  for (const ex of EX.LIST) {
    const where = `[${ex.id}] ${ex.title}`;
    const before = failures;
    if (ids.has(ex.id)) fail(`${where}: id repetido`);
    ids.add(ex.id);
    for (const k of ['db', 'data', 'level', 'topic', 'src', 'title', 'prompt', 'solution', 'explain']) if (!ex[k]) fail(`${where}: falta el campo ${k}`);
    if (!P.byId[ex.db]) { fail(`${where}: base de datos desconocida ${ex.db}`); continue; }
    if (!P.VARIANTS[ex.data]) fail(`${where}: data debe ser orig o ext`);
    if (!EX.LEVELS[ex.level]) fail(`${where}: nivel desconocido ${ex.level}`);
    if (!EX.SQL_TOPICS[ex.topic]) fail(`${where}: tema desconocido ${ex.topic}`);
    const exp = await eng.expected(ex);
    if (exp.error) { fail(`${where}: la solución da error: ${exp.error.message}`); continue; }
    if (!exp.result) { fail(`${where}: la solución no devuelve un resultado (SELECT)`); continue; }
    if (!exp.result.rows.length && !ex.allowEmpty) fail(`${where}: la solución devuelve 0 filas`);
    if (ex.order) {
      if (!/ORDER\s+BY/i.test(ex.solution)) fail(`${where}: tiene order pero la solución no usa ORDER BY`);
      if (ex.order.some((j) => j < 0 || j >= exp.result.fields.length)) fail(`${where}: índice de order fuera de rango`);
    }
    const self = await eng.grade(ex, ex.solution);
    if (!self.ok) fail(`${where}: el calificador no acepta la propia solución (${self.cmp ? self.cmp.message : JSON.stringify(self.user)})`);
    for (const alt of ex.alts || []) {
      altCount++;
      const g = await eng.grade(ex, alt);
      if (!g.ok) fail(`${where}: alternativa rechazada: ${g.cmp ? g.cmp.message : (g.user.error ? g.user.error.message : 'sin filas')}\n      ${alt}`);
    }
    const wrong = await eng.grade(ex, 'SELECT 1 AS x');
    if (wrong.ok) fail(`${where}: el calificador aceptó una respuesta incorrecta`);
    if (failures === before) okCount++;
  }
  console.log(`  ✓ ${okCount}/${EX.LIST.length} ejercicios correctos · ${altCount} soluciones alternativas probadas`);

  // ---------- Seguridad de la calificación ----------
  const ex0 = EX.byId.c01;
  await eng.grade(ex0, 'DELETE FROM inscripciones; DROP TABLE cursos CASCADE; SELECT 1;');
  const after = await eng.grade(ex0, ex0.solution);
  if (!after.ok) fail('Calificar con DELETE/DROP alteró los datos de calificación'); else console.log('  ✓ BEGIN…ROLLBACK protege los datos de calificación');
  await eng.run(ex0.db, 'orig', 'DELETE FROM inscripciones;');
  await eng.reset(ex0.db);
  const cnt = await eng.run(ex0.db, 'orig', 'SELECT COUNT(*) FROM inscripciones;');
  if (cnt.error || cnt.results[0].rows[0][0] !== 9) fail('Reiniciar base de datos no restauró los datos'); else console.log('  ✓ Reiniciar base de datos restaura los datos');

  // ---------- Ejemplos de los módulos ----------
  for (const f of exampleFiles) {
    let mod;
    try { mod = require(path.join(root, f)); } catch (e) { console.log(`\n(omitido ${f}: ${e.message})`); continue; }
    const list = mod.EXAMPLES || [];
    console.log(`\nEjemplos de ${f} (${list.length})`);
    let ok = 0;
    for (const x of list) {
      const r = await eng.runSafe(x.db, x.data || 'orig', x.sql);
      const res = r.results ? r.results.filter((y) => y.fields.length).pop() : null;
      if (x.expectError) {
        if (!r.error) fail(`[${x.id}] se esperaba un error y no lo hubo`);
        else if (x.expectError !== true && !r.error.message.includes(x.expectError)) fail(`[${x.id}] error distinto al esperado: ${r.error.message}`);
        else ok++;
      } else if (r.error) fail(`[${x.id}] error: ${r.error.message}`);
      else if (!res) fail(`[${x.id}] no devolvió un resultado (SELECT)`);
      else if (x.rows !== undefined && res.rows.length !== x.rows) fail(`[${x.id}] devolvió ${res.rows.length} filas, se esperaban ${x.rows}`);
      else if (x.rows === undefined && !res.rows.length) fail(`[${x.id}] no devolvió filas`);
      else ok++;
    }
    console.log(`  ✓ ${ok}/${list.length} ejemplos correctos`);
    // Las tablas de la demo fila por fila deben ser copias exactas de la base de práctica.
    for (const d of mod.DEMO || []) {
      for (const t of [d.A, d.B]) {
        const r = await eng.runSafe(d.db, d.data, `SELECT ${t.cols.join(', ')} FROM ${t.name} ORDER BY 1`);
        const got = r.error ? r.error.message : JSON.stringify(r.results[0].rows.map((x) => x.map(G.canon)));
        const want = JSON.stringify(t.rows.map((x) => x.map(G.canon)));
        if (got !== want) fail(`[demo ${d.id}] la tabla ${t.name} no coincide con ${d.db} (${d.data})`);
      }
    }
    if (mod.DEMO) console.log(`  ✓ Tablas de la demo fila por fila comparadas con la base de práctica`);
  }

  // ---------- Temas de aprendizaje (js/data/modules) ----------
  const fs = require('fs');
  const ERD = require(path.join(root, 'js/erd.js'));
  const CASES = require(path.join(root, 'js/data/cases.js'));
  const modDir = path.join(root, 'js/data/modules');
  globalThis.MODULES = [];
  fs.readdirSync(modDir).filter((f) => f.endsWith('.js')).sort().forEach((f) => require(path.join(modDir, f)));
  const mods = globalThis.MODULES.slice().sort((a, b) => a.n - b.n);
  console.log(`\nTemas de aprendizaje (${mods.length})`);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const nums = mods.map((m) => m.n).join(',');
  if (nums !== mods.map((_, i) => i + 1).join(',')) fail(`los temas no están numerados 1..${mods.length}: ${nums}`);
  let nEx = 0, nDiag = 0, nQ = 0;
  for (const m of mods) {
    const exs = [], diags = [];
    const walk = (b) => {
      if (!b || typeof b !== 'object') return;
      if (Array.isArray(b)) return b.forEach(walk);
      if (b.ex) exs.push(b.ex);
      if (b.diagram) diags.push(b.diagram.spec);
      if (b.case) { const c = CASES.find((x) => x.id === b.case); if (!c) fail(`[${m.id}] caso inexistente ${b.case}`); else diags.push(c); }
      Object.values(b).forEach(walk);
    };
    walk(m.sections);
    const seen = new Set();
    for (const x of exs) {
      if (seen.has(x.id)) fail(`[${m.id}] id de ejemplo repetido ${x.id}`);
      seen.add(x.id);
      if (!P.byId[x.db]) { fail(`[${m.id}/${x.id}] base desconocida ${x.db}`); continue; }
      const r = await eng.runSafe(x.db, x.data || 'orig', x.sql);
      const res = r.results ? r.results.filter((y) => y.fields.length).pop() : null;
      if (x.expectError) {
        if (!r.error) fail(`[${m.id}/${x.id}] se esperaba un error y no lo hubo`);
        else if (!r.error.message.includes(x.expectError)) fail(`[${m.id}/${x.id}] error distinto al esperado: ${r.error.message}`);
      } else if (r.error) fail(`[${m.id}/${x.id}] error: ${r.error.message}\n      ${x.sql.split('\n')[0]}`);
      else if (!x.noRows && (!res || !res.rows.length)) fail(`[${m.id}/${x.id}] no devolvió filas`);
      nEx++;
    }
    for (const s of diags) {
      try { ERD.chenSVG(clone(s)); const md = ERD.transform(clone(s)); ERD.crowSVG(md); ERD.ddl(md); ERD.schemaText(md); nDiag++; }
      catch (e) { fail(`[${m.id}] diagrama con error: ${e.message}`); }
    }
    (m.quiz || []).forEach((q, i) => {
      nQ++;
      const oks = q.o.filter((o) => o.ok).length;
      if (oks !== 1) fail(`[${m.id}] la pregunta ${i + 1} del mini-quiz tiene ${oks} respuestas correctas`);
      if (q.o.some((o) => !o.why)) fail(`[${m.id}] la pregunta ${i + 1} tiene opciones sin explicación`);
    });
    if (m.quizCount && m.quizId === 'joins') {
      const jm = require(path.join(root, 'js/data/joins_module.js'));
      if (jm.QUIZ.length !== m.quizCount) fail(`[${m.id}] quizCount (${m.quizCount}) no coincide con el quiz de JOINs (${jm.QUIZ.length})`);
    }
    for (const t of (m.practice && m.practice.sql) || []) if (!EX.SQL_TOPICS[t]) fail(`[${m.id}] tema SQL desconocido ${t}`);
  }
  console.log(`  ✓ ${nEx} ejemplos ejecutados · ${nDiag} diagramas generados · ${nQ} preguntas de mini-quiz revisadas`);

  // ---------- Resumen ----------
  const by = (k) => EX.LIST.reduce((a, e) => { a[e[k]] = (a[e[k]] || 0) + 1; return a; }, {});
  console.log('\nResumen');
  console.log('  Por nivel:', by('level'));
  console.log('  Por tema: ', by('topic'));
  console.log('  Por datos:', by('data'), '· por origen:', by('src'));
  console.log(`\n${failures ? '✗ ' + failures + ' problema(s)' : '✓ Todo correcto'} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  process.exit(failures ? 1 : 0);
})();
