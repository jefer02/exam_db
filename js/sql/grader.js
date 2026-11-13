/* Calificador de consultas: compara el resultado del estudiante con el de la solución.
   Resultado = { fields: [nombres], rows: [[valores]] }. Puro: se usa en el navegador y en tools/verify.js.
   - Columnas: mismo número; si están en otro orden se alinean por contenido (y se avisa).
   - Filas: se comparan como multiconjunto (el orden se ignora) salvo que el ejercicio tenga `order`
     (índices de columnas de la solución por las que se ordena); entonces la secuencia de esas
     columnas debe coincidir (así los empates no importan).
   - Números: se comparan redondeados a 2 decimales (AVG sin ROUND = ROUND(AVG, 2)). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GRADER = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const NUM = /^-?\d+(\.\d+)?$/;

  function canon(v) {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) {
      const iso = v.toISOString();
      return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso;
    }
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'bigint') v = Number(v);
    if (typeof v === 'string' && NUM.test(v.trim())) v = Number(v);
    if (typeof v === 'number') { const r = Math.round(v * 100) / 100; return 'n:' + (Object.is(r, -0) ? 0 : r); }
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
  const rowKey = (r) => JSON.stringify(r.map(canon));
  const colKey = (rows, j) => rows.map((r) => JSON.stringify(canon(r[j]))).sort().join('|');

  // Para mostrar valores en la interfaz.
  function show(v) {
    if (v === null || v === undefined) return 'NULL';
    const c = canon(v);
    return c.startsWith('n:') ? c.slice(2) : c;
  }

  // Devuelve map[j] = índice de columna del usuario que corresponde a la columna j de la solución.
  function alignColumns(user, sol) {
    const n = sol.fields.length;
    const uKeys = user.fields.map((_, k) => colKey(user.rows, k));
    const sKeys = sol.fields.map((_, j) => colKey(sol.rows, j));
    const map = new Array(n).fill(-1), used = new Array(n).fill(false);
    const lc = (s) => String(s).toLowerCase();
    for (let j = 0; j < n; j++) { // 1) mismo nombre y mismo contenido
      for (let k = 0; k < n; k++) if (!used[k] && lc(user.fields[k]) === lc(sol.fields[j]) && uKeys[k] === sKeys[j]) { map[j] = k; used[k] = true; break; }
    }
    for (let j = 0; j < n; j++) { // 2) mismo contenido
      if (map[j] >= 0) continue;
      for (let k = 0; k < n; k++) if (!used[k] && uKeys[k] === sKeys[j]) { map[j] = k; used[k] = true; break; }
    }
    if (map.every((k) => k >= 0)) return { map, matched: true };
    return { map: sol.fields.map((_, j) => j), matched: false };
  }

  function multisetDiff(a, b) { // filas de a que no están en b (respetando repeticiones)
    const cnt = new Map();
    b.forEach((r) => { const k = rowKey(r); cnt.set(k, (cnt.get(k) || 0) + 1); });
    const out = [];
    a.forEach((r) => { const k = rowKey(r); const c = cnt.get(k) || 0; if (c > 0) cnt.set(k, c - 1); else out.push(r); });
    return out;
  }

  function compare(user, sol, opts) {
    opts = opts || {};
    const res = { ok: false, warnings: [], hints: [], missing: [], extra: [], expectedFields: sol.fields, userFields: user.fields };
    if (user.fields.length !== sol.fields.length) {
      res.colsMismatch = true;
      res.message = `Columnas diferentes: se esperaban ${sol.fields.length} columna(s) (${sol.fields.join(', ')}) y tu consulta devuelve ${user.fields.length} (${user.fields.join(', ') || 'ninguna'}).`;
      if (user.fields.length > sol.fields.length) res.hints.push('Selecciona solo las columnas que pide el enunciado (evita SELECT *).');
      return res;
    }
    const { map, matched } = alignColumns(user, sol);
    if (matched && map.some((k, j) => k !== j)) res.warnings.push('Tus columnas están en otro orden que la solución; se aceptó, pero en el examen respeta el orden pedido.');
    const rows = user.rows.map((r) => map.map((k) => r[k]));
    const renamed = map.map((k, j) => [user.fields[k], sol.fields[j]]).filter(([u, s]) => String(u).toLowerCase() !== String(s).toLowerCase());
    if (renamed.length) res.warnings.push('Nombres de columna distintos (no afecta la nota): ' + renamed.map(([u, s]) => `"${u}" ↔ "${s}"`).join(', ') + '.');

    res.missing = multisetDiff(sol.rows, rows);
    res.extra = multisetDiff(rows, sol.rows);
    const hasNull = (r) => r.some((v) => v === null || v === undefined);
    if (res.missing.length || res.extra.length) {
      res.message = `Filas diferentes: esperadas ${sol.rows.length}, obtuviste ${rows.length}` +
        (res.extra.length ? ` · ${res.extra.length} de más` : '') + (res.missing.length ? ` · ${res.missing.length} de menos` : '') + '.';
      const setU = new Set(rows.map(rowKey)), setS = new Set(sol.rows.map(rowKey));
      const sameSet = setU.size === setS.size && [...setU].every((k) => setS.has(k));
      if (sameSet) res.hints.push('Tienes las mismas filas pero repetidas un número distinto de veces: ¿falta o sobra DISTINCT (o un JOIN que duplica filas)?');
      else if (res.extra.length && res.extra.every(hasNull) && !res.missing.length) res.hints.push('Te sobran filas con NULL: ¿usaste LEFT/RIGHT/FULL JOIN cuando se pedía INNER JOIN?');
      else if (res.missing.length && res.missing.every(hasNull) && !res.extra.length) res.hints.push('Te faltan filas con NULL: necesitas un LEFT/RIGHT/FULL JOIN, o hay un WHERE que elimina las filas sin pareja.');
      if (sol.rows.length && rows.length >= sol.rows.length * 3 && res.extra.length) res.hints.push('Tienes muchas más filas de las esperadas: ¿producto cartesiano? Revisa que cada JOIN tenga su condición ON correcta.');
      if (!rows.length) res.hints.push('Tu consulta no devolvió filas: revisa el WHERE (mayúsculas, tildes y comillas en los textos).');
      if (!matched && !sameSet && !res.hints.length) res.hints.push('Revisa también qué columnas seleccionas: alguna no coincide con lo pedido.');
      return res;
    }
    if (opts.order && opts.order.length) {
      const pick = (r) => JSON.stringify(opts.order.map((j) => canon(r[j])));
      const a = rows.map(pick), b = sol.rows.map(pick);
      if (a.some((k, i) => k !== b[i])) {
        res.orderBad = true;
        res.message = 'Las filas son correctas, pero el orden no es el pedido. Revisa el ORDER BY (ASC/DESC y la columna).';
        return res;
      }
    }
    res.ok = true;
    res.message = `¡Correcto! ${sol.rows.length} fila(s) y ${sol.fields.length} columna(s) coinciden.`;
    return res;
  }

  return { compare, canon, show };
});
