/* Tema 9 · Funciones de agregación, GROUP BY y HAVING. */
(function (root) {
  const B = 'bancodb', E = 'bd_estudiantes_joins';
  const g = (c) => `style="background:${c}"`;
  const C1 = 'var(--match)', C2 = 'var(--svg-head)', C3 = 'var(--svg-pk)', C4 = 'var(--orphan)';
  const GROUPING = `<div class="cols2"><div><p class="small"><b>1. Filas de clientes</b> (coloreadas por ciudad)</p><div class="tblwrap"><table>
<tr><th>nombre</th><th>ciudad</th></tr>
<tr ${g(C1)}><td>Juan</td><td>Bogotá</td></tr><tr ${g(C1)}><td>Camila</td><td>Bogotá</td></tr>
<tr ${g(C2)}><td>María</td><td>Cali</td></tr><tr ${g(C3)}><td>Pedro</td><td>Medellín</td></tr><tr ${g(C4)}><td>Laura</td><td>Pasto</td></tr></table></div></div>
<div><p class="small"><b>2. GROUP BY ciudad → una fila por grupo</b></p><div class="tblwrap"><table>
<tr><th>ciudad</th><th>COUNT(*)</th></tr>
<tr ${g(C1)}><td>Bogotá</td><td>2</td></tr><tr ${g(C2)}><td>Cali</td><td>1</td></tr><tr ${g(C3)}><td>Medellín</td><td>1</td></tr><tr ${g(C4)}><td>Pasto</td><td>1</td></tr></table></div></div></div>`;

  (root.MODULES = root.MODULES || []).push({
    id: 'agregacion', n: 9, title: 'Funciones de agregación, GROUP BY y HAVING', short: 'Agregación: GROUP BY/HAVING', minutes: 40,
    desc: 'COUNT, SUM, AVG, MIN y MAX; agrupar con GROUP BY; filtrar grupos con HAVING y la diferencia entre WHERE y HAVING.',
    goals: ['Usar COUNT, SUM, AVG, MIN y MAX y saber cómo tratan los NULL.',
      'Agrupar con GROUP BY y aplicar su regla de oro.',
      'Filtrar grupos con HAVING y explicar la diferencia con WHERE.',
      'Conocer el orden lógico en que PostgreSQL ejecuta una consulta.'],
    sections: [
      { id: 'funciones', h: 'Las cinco funciones de agregación', body: [
        '<p>Una función de agregación toma <b>muchas filas</b> y devuelve <b>un solo valor</b>.</p>',
        `<div class="tblwrap"><table><tr><th>Función</th><th>Devuelve</th><th>Ejemplo (bancodb)</th></tr>
<tr><td><code>COUNT(*)</code></td><td>Cuántas filas hay</td><td>Total de clientes registrados</td></tr>
<tr><td><code>COUNT(columna)</code></td><td>Cuántos valores <b>no nulos</b> hay en la columna</td><td>Cuántos préstamos tienen fecha de devolución</td></tr>
<tr><td><code>COUNT(DISTINCT col)</code></td><td>Cuántos valores <b>distintos</b></td><td>En cuántas ciudades hay clientes</td></tr>
<tr><td><code>SUM(col)</code></td><td>Suma</td><td>Saldo total del banco</td></tr>
<tr><td><code>AVG(col)</code></td><td>Promedio</td><td>Salario promedio de los empleados</td></tr>
<tr><td><code>MIN(col)</code> / <code>MAX(col)</code></td><td>Menor / mayor valor (también fechas y textos)</td><td>Cuenta con menor saldo</td></tr></table></div>`,
        { ex: { id: 'agg', db: B, title: 'Laboratorio final: total de clientes y salario promedio', sql: "SELECT COUNT(*) AS total_clientes FROM clientes;\nSELECT AVG(salario) AS salario_promedio,\n       MIN(salario) AS minimo,\n       MAX(salario) AS maximo\nFROM empleados;" } },
        { ex: { id: 'round', db: 'tienda', title: 'Ejemplo de clase con ROUND', sql: 'SELECT COUNT(*) AS total,\n       ROUND(AVG(precio), 2) AS promedio,\n       MIN(precio) AS minimo,\n       MAX(precio) AS maximo\nFROM PRODUCTO;   -- 3 | 190000.00 | 35000.00 | 450000.00' } },
        { key: 'Las funciones de columna <b>ignoran los NULL</b>. Solo <code>COUNT(*)</code> cuenta filas completas, tengan o no NULL.' },
        { ex: { id: 'nulls', db: 'biblioteca', title: 'COUNT(*) vs COUNT(columna) con NULL', sql: 'SELECT COUNT(*)                AS prestamos,\n       COUNT(fecha_devolucion) AS devueltos,\n       COUNT(*) - COUNT(fecha_devolucion) AS activos\nFROM prestamos;' } }
      ] },
      { id: 'groupby', h: 'GROUP BY: un resultado por grupo', body: [
        '<p>Sin GROUP BY, la función se aplica a todas las filas y da un solo valor. Con <b>GROUP BY columna</b>, las filas se juntan en grupos con el mismo valor en esa columna y la función se calcula <b>para cada grupo</b>.</p>',
        GROUPING,
        { ex: { id: 'gb', db: B, title: 'Laboratorio final: cuántos clientes hay por ciudad', sql: 'SELECT ciudad, COUNT(*) AS cantidad\nFROM clientes\nGROUP BY ciudad;' } },
        { ex: { id: 'gb2', db: B, title: 'Laboratorio final: monto total por tipo de transacción', sql: 'SELECT tipo, SUM(monto) AS total, COUNT(*) AS cantidad\nFROM transacciones\nGROUP BY tipo\nORDER BY total DESC;' } },
        { warn: '<b>Regla de oro del GROUP BY:</b> toda columna del SELECT que <b>no</b> esté dentro de una función de agregación <b>debe</b> estar en el GROUP BY. Si no, PostgreSQL da error: <i>must appear in the GROUP BY clause</i>.' },
        { ex: { id: 'gberr', db: B, title: 'Violar la regla → error', sql: 'SELECT ciudad, nombre, COUNT(*)\nFROM clientes\nGROUP BY ciudad;', expectError: 'GROUP BY' } },
        { ex: { id: 'gbjoin', db: E, title: 'GROUP BY con JOIN: promedio de nota por curso', sql: 'SELECT c.nombre_curso, COUNT(*) AS inscritos, ROUND(AVG(i.nota_final), 2) AS promedio\nFROM cursos c\nJOIN inscripciones i ON c.id_curso = i.id_curso\nGROUP BY c.nombre_curso\nORDER BY promedio DESC;' } }
      ] },
      { id: 'having', h: 'HAVING: filtrar grupos', body: [
        '<p><b>HAVING</b> es el WHERE de los grupos: se aplica <b>después</b> de agrupar y puede usar funciones de agregación.</p>',
        { ex: { id: 'hav', db: 'tienda', title: 'Ejemplo de clase: clientes con más de un pedido', sql: 'SELECT id_cliente, COUNT(*) AS num_pedidos\nFROM PEDIDO\nGROUP BY id_cliente\nHAVING COUNT(*) > 1;      -- cliente 1 con 2 pedidos' } },
        `<div class="tblwrap"><table><tr><th></th><th>WHERE</th><th>HAVING</th></tr>
<tr><td>Filtra</td><td>Filas individuales</td><td>Grupos</td></tr>
<tr><td>Cuándo</td><td><b>Antes</b> de agrupar</td><td><b>Después</b> de agrupar</td></tr>
<tr><td>¿Puede usar COUNT, SUM, AVG…?</td><td>❌ No</td><td>✅ Sí</td></tr>
<tr><td>Ejemplo</td><td><code>WHERE tipo = 'Deposito'</code></td><td><code>HAVING SUM(monto) &gt; 1000000</code></td></tr></table></div>`,
        { ex: { id: 'both', db: B, title: 'WHERE y HAVING juntos', sql: "SELECT id_cuenta, SUM(monto) AS total_depositado\nFROM transacciones\nWHERE tipo = 'Deposito'          -- 1) solo filas de depósitos\nGROUP BY id_cuenta               -- 2) agrupa por cuenta\nHAVING SUM(monto) >= 800000;     -- 3) solo cuentas con 800.000 o más", note: 'Cuentas 3 (800.000) y 5 (1.500.000).' } },
        { ex: { id: 'wherr', db: B, title: 'Una agregación en el WHERE → error', sql: 'SELECT numero_cuenta FROM cuentas\nWHERE saldo > AVG(saldo);', expectError: 'aggregate functions are not allowed in WHERE', note: 'Para comparar con el promedio se usa una subconsulta (tema 11).' } },
        { exam: 'Pregunta abierta clásica: "Explique la diferencia entre WHERE y HAVING". WHERE filtra filas antes de agrupar y no admite funciones de agregación; HAVING filtra los grupos después del GROUP BY y sí las admite.' }
      ] },
      { id: 'orden', h: 'Orden lógico de ejecución', body: [
        '<p>Se <b>escribe</b> SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY, pero PostgreSQL lo <b>ejecuta</b> en otro orden:</p>',
        `<div class="tblwrap"><table><tr><th>Paso</th><th>Cláusula</th><th>Qué hace</th></tr>
<tr><td>1</td><td>FROM / JOIN</td><td>Junta las tablas</td></tr><tr><td>2</td><td>WHERE</td><td>Filtra filas</td></tr>
<tr><td>3</td><td>GROUP BY</td><td>Forma grupos</td></tr><tr><td>4</td><td>HAVING</td><td>Filtra grupos</td></tr>
<tr><td>5</td><td>SELECT</td><td>Calcula las columnas y los alias</td></tr><tr><td>6</td><td>ORDER BY</td><td>Ordena (puede usar los alias)</td></tr>
<tr><td>7</td><td>LIMIT</td><td>Recorta</td></tr></table></div>`,
        { tip: 'Por eso un alias del SELECT sí sirve en el ORDER BY (se calcula antes), pero no en el WHERE (se ejecuta antes que el SELECT).' },
        { reveal: { q: 'Escribe: para cada tipo de cuenta (descripcion), el saldo promedio, solo si es mayor a 2 millones.', a: [{ ex: { id: 'rev', db: B, sql: 'SELECT t.descripcion, AVG(c.saldo) AS saldo_promedio\nFROM cuentas c\nJOIN tipos_cuenta t ON c.id_tipo = t.id_tipo\nGROUP BY t.descripcion\nHAVING AVG(c.saldo) > 2000000;' } }] } }
      ] }
    ],
    keys: ['COUNT(*) cuenta filas; COUNT(col) cuenta no nulos; COUNT(DISTINCT col) cuenta distintos.',
      'SUM, AVG, MIN, MAX ignoran los NULL.',
      'GROUP BY: una fila por grupo. Toda columna del SELECT que no esté en una función debe estar en el GROUP BY.',
      'HAVING filtra grupos (después de agrupar, admite funciones); WHERE filtra filas (antes, no las admite).',
      'Orden de ejecución: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.'],
    quiz: [
      { q: '¿Cuál es la diferencia entre WHERE y HAVING?', o: [
        { t: 'WHERE filtra filas antes de agrupar; HAVING filtra grupos después y puede usar COUNT, SUM…', ok: true, why: 'Correcto.' },
        { t: 'Son equivalentes', why: 'Se ejecutan en momentos distintos y HAVING admite agregaciones.' },
        { t: 'HAVING se escribe antes que WHERE', why: 'El orden es WHERE → GROUP BY → HAVING.' },
        { t: 'WHERE solo sirve con GROUP BY', why: 'WHERE funciona con o sin GROUP BY.' }] },
      { q: 'La tabla prestamos tiene 4 filas y 2 de ellas con fecha_devolucion NULL. ¿Cuánto da COUNT(fecha_devolucion)?', o: [
        { t: '2', ok: true, why: 'Correcto: COUNT(columna) no cuenta NULL.' },
        { t: '4', why: 'Eso daría COUNT(*).' },
        { t: '0', why: 'Hay 2 valores no nulos.' },
        { t: 'NULL', why: 'COUNT nunca devuelve NULL; como mínimo devuelve 0.' }] },
      { q: '¿Por qué falla <code>SELECT ciudad, nombre, COUNT(*) FROM clientes GROUP BY ciudad;</code>?', o: [
        { t: 'nombre no está en el GROUP BY ni dentro de una función de agregación', ok: true, why: 'Correcto: en Bogotá hay dos nombres, ¿cuál mostraría?' },
        { t: 'COUNT(*) no se puede usar con GROUP BY', why: 'Es la combinación más común.' },
        { t: 'Falta un HAVING', why: 'HAVING es opcional.' },
        { t: 'Falta un WHERE', why: 'WHERE es opcional.' }] },
      { q: '¿Cómo muestras las cuentas con saldo mayor al promedio?', o: [
        { t: 'WHERE saldo > (SELECT AVG(saldo) FROM cuentas)', ok: true, why: 'Correcto: el promedio se calcula en una subconsulta.' },
        { t: 'WHERE saldo > AVG(saldo)', why: 'Las funciones de agregación no se permiten en el WHERE.' },
        { t: 'HAVING saldo > AVG(saldo) sin GROUP BY', why: 'Sin agrupar, saldo no tiene un único valor por grupo; da error.' },
        { t: 'ORDER BY AVG(saldo)', why: 'Ordenar no filtra.' }] },
      { q: '¿En qué orden se ejecutan estas cláusulas?', o: [
        { t: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY', ok: true, why: 'Correcto.' },
        { t: 'SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY', why: 'Ese es el orden en que se escriben, no en el que se ejecutan.' },
        { t: 'FROM → GROUP BY → WHERE → HAVING → SELECT → ORDER BY', why: 'WHERE va antes de agrupar.' },
        { t: 'WHERE → FROM → SELECT → GROUP BY → ORDER BY → HAVING', why: 'Primero hay que saber de qué tabla (FROM).' }] },
      { q: '¿Qué devuelve <code>SELECT COUNT(DISTINCT ciudad) FROM estudiantes;</code> con los datos de clase?', o: [
        { t: '4 (Pasto, Cali, Bogota, Popayan)', ok: true, why: 'Correcto: cuenta ciudades diferentes.' },
        { t: '7', why: 'Eso es COUNT(*): hay 7 estudiantes.' },
        { t: '3', why: 'Pasto tiene 3 estudiantes, pero hay 4 ciudades distintas.' },
        { t: 'La lista de ciudades', why: 'COUNT devuelve un número; la lista sería SELECT DISTINCT ciudad.' }] }
    ],
    practice: { sql: ['agregacion'], quiz: ['sql', 'lab'], labs: ['biblioteca'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
