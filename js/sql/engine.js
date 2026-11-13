/* Motor SQL: PostgreSQL real en el navegador con PGlite (WebAssembly), sin servidor.
   - Esquemas de práctica: <bd>_orig y <bd>_ext. "Ejecutar" trabaja aquí y los cambios (INSERT, DELETE,
     DROP…) persisten hasta pulsar "Reiniciar base de datos".
   - Esquemas de calificación: g_<bd>_<variante>. Se califica dentro de BEGIN … ROLLBACK, así que nada
     de lo que escribas puede dañar los datos con los que se compara.
   createEngine(PGlite, PRACTICE_DB, GRADER) es común al navegador y a tools/verify.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SQLENGINE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const PGLITE_URL = 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.13/dist/index.js';
  const TX_WORDS = /\b(BEGIN|COMMIT|ROLLBACK|START\s+TRANSACTION|SAVEPOINT|END\s*;)/i;
  const stripComments = (s) => s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

  function createEngine(PGlite, P, G) {
    let db = null;
    let queue = Promise.resolve();
    // PGlite tiene una sola conexión: serializamos todo para que una calificación (BEGIN…ROLLBACK)
    // nunca se mezcle con otra consulta.
    const lock = (fn) => { const p = queue.then(fn, fn); queue = p.catch(() => {}); return p; };
    const toResult = (r) => ({ fields: r.fields.map((f) => f.name), rows: r.rows, affected: r.affectedRows || 0 });
    const lastSelect = (rs) => { for (let i = rs.length - 1; i >= 0; i--) if (rs[i].fields.length) return rs[i]; return null; };
    const errInfo = (e) => ({ message: e.message, position: e.position ? +e.position : null, hint: e.hint || null, detail: e.detail || null, code: e.code || null });
    const solCache = {};

    async function seed(dbId, variant, grading) {
      const s = P.schema(dbId, variant, grading);
      await db.exec(`DROP SCHEMA IF EXISTS ${s} CASCADE; CREATE SCHEMA ${s}; SET search_path TO ${s};`);
      await db.exec(P.seedSQL(dbId, variant));
    }
    async function init() {
      if (db) return;
      db = await PGlite.create();
      for (const d of P.DBS) for (const v of Object.keys(P.VARIANTS)) { await seed(d.id, v, false); await seed(d.id, v, true); }
    }
    // Reinicia los esquemas de práctica (los de calificación nunca cambian).
    const reset = (dbId) => lock(async () => {
      for (const d of P.DBS) if (!dbId || d.id === dbId) for (const v of Object.keys(P.VARIANTS)) await seed(d.id, v, false);
    });

    // Ejecuta en el esquema de práctica. Devuelve todos los resultados (uno por sentencia).
    const run = (dbId, variant, sql) => lock(async () => {
      const t = Date.now();
      try {
        await db.exec(`SET search_path TO ${P.schema(dbId, variant)}`);
        const rs = await db.exec(sql, { rowMode: 'array' });
        return { results: rs.map(toResult), ms: Date.now() - t };
      } catch (e) { return { error: errInfo(e), ms: Date.now() - t }; }
    });

    // Como run, pero sobre la copia intacta y dentro de BEGIN…ROLLBACK: para los ejemplos de la teoría,
    // que deben dar siempre el mismo resultado sin tocar lo que el estudiante hizo en el editor.
    // Si el ejemplo usa BEGIN/COMMIT/ROLLBACK (tema de transacciones) no puede ir dentro de otra
    // transacción: se ejecuta en un esquema temporal recién creado y luego se elimina.
    const runSafe = (dbId, variant, sql) => lock(async () => {
      const t = Date.now();
      if (TX_WORDS.test(stripComments(sql))) {
        const s = 'tmp_' + P.schema(dbId, variant);
        try {
          await db.exec(`DROP SCHEMA IF EXISTS ${s} CASCADE; CREATE SCHEMA ${s}; SET search_path TO ${s};`);
          await db.exec(P.seedSQL(dbId, variant));
          const rs = await db.exec(sql, { rowMode: 'array' });
          return { results: rs.map(toResult), ms: Date.now() - t };
        } catch (e) { return { error: errInfo(e), ms: Date.now() - t }; }
        finally {
          try { await db.exec('ROLLBACK'); } catch (e) { /* sin transacción abierta */ }
          await db.exec(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
        }
      }
      try {
        await db.exec('BEGIN');
        await db.exec(`SET LOCAL search_path TO ${P.schema(dbId, variant, true)}`);
        const rs = await db.exec(sql, { rowMode: 'array' });
        return { results: rs.map(toResult), ms: Date.now() - t };
      } catch (e) { return { error: errInfo(e), ms: Date.now() - t }; }
      finally { try { await db.exec('ROLLBACK'); } catch (e) { /* sin transacción abierta */ } }
    });

    // Ejecuta en el esquema de calificación dentro de una transacción que siempre se revierte.
    async function sandbox(ex, sql) {
      try {
        await db.exec('BEGIN');
        await db.exec(`SET LOCAL search_path TO ${P.schema(ex.db, ex.data, true)}`);
        const rs = await db.exec(sql, { rowMode: 'array' });
        let r = lastSelect(rs);
        if (ex.check) r = lastSelect(await db.exec(ex.check, { rowMode: 'array' }));
        return r ? { result: toResult(r) } : { noRows: true };
      } catch (e) { return { error: errInfo(e) }; }
      finally { try { await db.exec('ROLLBACK'); } catch (e) { /* sin transacción abierta */ } }
    }

    const expected = (ex) => lock(async () => {
      if (!solCache[ex.id]) solCache[ex.id] = await sandbox(ex, ex.solution);
      return solCache[ex.id];
    });

    // Califica: { ok, user: {result|error|noRows}, expected, cmp }
    async function grade(ex, sql) {
      if (!stripComments(sql).trim()) return { ok: false, empty: true };
      if (TX_WORDS.test(stripComments(sql))) return { ok: false, user: { error: { message: 'Para calificar no uses BEGIN/COMMIT/ROLLBACK: el calificador ya ejecuta tu código dentro de una transacción.' } } };
      const exp = await expected(ex);
      if (exp.error || !exp.result) throw new Error(`La solución del ejercicio ${ex.id} falló: ${exp.error ? exp.error.message : 'sin filas'}`);
      const user = await lock(() => sandbox(ex, sql));
      if (user.error || user.noRows) return { ok: false, user, expected: exp.result };
      const cmp = G.compare(user.result, exp.result, { order: ex.order });
      return { ok: cmp.ok, user, expected: exp.result, cmp };
    }

    // Tablas, columnas, PK, FK y número de filas del esquema de práctica (refleja tus ALTER/DROP).
    const schemaInfo = (dbId, variant) => lock(async () => {
      const s = P.schema(dbId, variant);
      const cols = await db.query(`SELECT c.relname AS t, a.attname AS col, format_type(a.atttypid, a.atttypmod) AS type, a.attnum AS n, a.attnotnull AS nn
        FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace ns ON ns.oid = c.relnamespace
        WHERE ns.nspname = $1 AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.oid, a.attnum`, [s]);
      const cons = await db.query(`SELECT c.relname AS t, k.contype AS kind, k.conkey AS cols, f.relname AS ft, k.confkey AS fcols, k.confrelid AS fid, k.conrelid AS id
        FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid JOIN pg_namespace ns ON ns.oid = c.relnamespace
        LEFT JOIN pg_class f ON f.oid = k.confrelid WHERE ns.nspname = $1 AND k.contype IN ('p','f','u')`, [s]);
      const tables = [], byName = {};
      cols.rows.forEach((r) => {
        let t = byName[r.t];
        if (!t) { t = byName[r.t] = { name: r.t, columns: [], count: 0 }; tables.push(t); }
        t.columns.push({ name: r.col, type: r.type, n: r.n, notNull: r.nn, pk: false, unique: false, fk: null });
      });
      const colByNum = (t, n) => (byName[t] ? byName[t].columns.find((c) => c.n === n) : null);
      cons.rows.forEach((k) => {
        k.cols.forEach((n, i) => {
          const c = colByNum(k.t, n); if (!c) return;
          if (k.kind === 'p') c.pk = true;
          else if (k.kind === 'u') c.unique = true;
          else { const fc = colByNum(k.ft, k.fcols[i]); c.fk = { table: k.ft, column: fc ? fc.name : '?' }; }
        });
      });
      for (const t of tables) {
        const r = await db.query(`SELECT count(*)::int AS n FROM ${s}."${t.name}"`);
        t.count = r.rows[0].n;
      }
      return tables;
    });

    return { init, reset, run, runSafe, grade, expected, schemaInfo };
  }

  // Cargador del navegador: importa PGlite desde el CDN (versión fija) una sola vez.
  let loading = null;
  function load() {
    if (!loading) {
      loading = import(PGLITE_URL).then(async (m) => {
        const eng = createEngine(m.PGlite, self.PRACTICE_DB, self.GRADER);
        await eng.init();
        return eng;
      });
      loading.catch(() => { loading = null; });
    }
    return loading;
  }
  return { createEngine, load, PGLITE_URL };
});
