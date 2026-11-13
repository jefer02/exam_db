/* Tema 11 · Subconsultas. */
(function (root) {
  const B = 'bancodb', E = 'bd_estudiantes_joins';
  (root.MODULES = root.MODULES || []).push({
    id: 'subconsultas', n: 11, title: 'Subconsultas: en WHERE, IN, EXISTS y en FROM', short: 'Subconsultas', minutes: 40,
    desc: 'Consultas dentro de otras consultas: comparar con un valor calculado, IN/NOT IN, EXISTS, tablas derivadas y cuándo usar JOIN.',
    goals: ['Usar una subconsulta escalar para comparar con un promedio, máximo o mínimo.',
      'Filtrar con IN / NOT IN y con EXISTS / NOT EXISTS (y conocer la trampa de NOT IN con NULL).',
      'Usar una subconsulta en el FROM (tabla derivada) con alias.',
      'Decidir cuándo conviene una subconsulta y cuándo un JOIN.'],
    sections: [
      { id: 'que', h: '¿Qué es una subconsulta?', body: [
        '<p>Una <b>subconsulta</b> es un SELECT escrito entre paréntesis dentro de otra consulta. Primero se resuelve la de adentro y su resultado lo usa la de afuera.</p>',
        `<div class="tblwrap"><table><tr><th>Dónde va</th><th>Qué devuelve</th><th>Se usa con</th></tr>
<tr><td>En el WHERE (escalar)</td><td>Un solo valor</td><td><code>= &lt; &gt;</code> …</td></tr>
<tr><td>En el WHERE (lista)</td><td>Una columna con varias filas</td><td><code>IN</code>, <code>NOT IN</code></td></tr>
<tr><td>En el WHERE (existencia)</td><td>"¿Hay alguna fila?"</td><td><code>EXISTS</code>, <code>NOT EXISTS</code></td></tr>
<tr><td>En el FROM</td><td>Una tabla temporal (derivada)</td><td>Necesita alias</td></tr>
<tr><td>En el SELECT</td><td>Un valor por fila</td><td>Columna calculada</td></tr></table></div>`
      ] },
      { id: 'escalar', h: 'Subconsulta escalar: comparar con un valor calculado', body: [
        '<p>Es la solución a "mayor que el promedio", "el más alto" o "el más bajo", porque las funciones de agregación no se permiten en el WHERE.</p>',
        { ex: { id: 'prom', db: B, title: 'Laboratorio final: cuentas con saldo superior al promedio', sql: 'SELECT numero_cuenta, saldo\nFROM cuentas\nWHERE saldo > (SELECT AVG(saldo) FROM cuentas);   -- (6.310.000)' } },
        { ex: { id: 'max', db: B, title: 'Laboratorio final: empleado con el salario más alto', sql: 'SELECT nombre, salario\nFROM empleados\nWHERE salario = (SELECT MAX(salario) FROM empleados);' } },
        { ex: { id: 'min', db: B, title: 'Laboratorio final: cuenta con el menor saldo', sql: 'SELECT numero_cuenta, saldo\nFROM cuentas\nWHERE saldo = (SELECT MIN(saldo) FROM cuentas);' } },
        { warn: 'Si la subconsulta usada con <code>=</code> devuelve más de una fila, PostgreSQL da error: <i>more than one row returned by a subquery</i>. En ese caso usa IN.' },
        { ex: { id: 'err', db: B, title: 'Subconsulta de varias filas con = → error', sql: 'SELECT nombre FROM clientes\nWHERE id_cliente = (SELECT id_cliente FROM prestamos);', expectError: 'more than one row' } }
      ] },
      { id: 'in', h: 'IN y NOT IN: pertenecer a una lista', body: [
        { ex: { id: 'in', db: B, title: 'Laboratorio final: clientes que poseen préstamos', sql: 'SELECT nombre, apellido\nFROM clientes\nWHERE id_cliente IN (SELECT id_cliente FROM prestamos);' } },
        { ex: { id: 'notin', db: B, title: 'Laboratorio final: clientes que NO poseen préstamos', sql: 'SELECT nombre, apellido\nFROM clientes\nWHERE id_cliente NOT IN (SELECT id_cliente FROM prestamos);' } },
        { warn: '<b>Trampa de NOT IN:</b> si la subconsulta devuelve algún <b>NULL</b>, <code>NOT IN</code> no devuelve <b>nada</b>, porque comparar con NULL da "desconocido". Míralo con datos reales: en la biblioteca extendida hay un libro sin autor (id_autor NULL).' },
        { cols: [
          [{ ex: { id: 'trampa', db: 'biblioteca', data: 'ext', title: '✗ NOT IN con un NULL en la lista: 0 filas', sql: 'SELECT nombre FROM autores\nWHERE id_autor NOT IN (SELECT id_autor FROM libros);', noRows: true } }],
          [{ ex: { id: 'arreglo', db: 'biblioteca', data: 'ext', title: '✓ NOT EXISTS: Isabel Allende', sql: 'SELECT a.nombre FROM autores a\nWHERE NOT EXISTS (\n  SELECT 1 FROM libros l WHERE l.id_autor = a.id_autor\n);' } }]
        ] },
        { tip: 'Si usas NOT IN, agrega <code>WHERE columna IS NOT NULL</code> en la subconsulta. O usa NOT EXISTS / LEFT JOIN … IS NULL, que no tienen el problema.' }
      ] },
      { id: 'exists', h: 'EXISTS y NOT EXISTS: subconsultas correlacionadas', body: [
        '<p><b>EXISTS (subconsulta)</b> es verdadero si la subconsulta devuelve al menos una fila. Normalmente es <b>correlacionada</b>: usa una columna de la consulta de afuera (<code>a.id_autor</code>), así que se evalúa una vez por cada fila externa.</p>',
        { ex: { id: 'exists', db: E, title: 'Estudiantes que tienen al menos una nota mayor o igual a 4.5', sql: 'SELECT e.nombre\nFROM estudiantes e\nWHERE EXISTS (\n  SELECT 1 FROM inscripciones i\n  WHERE i.id_estudiante = e.id_estudiante\n    AND i.nota_final >= 4.5\n);' } },
        { ex: { id: 'corr', db: E, title: 'Correlacionada en el WHERE: notas por encima del promedio de su propio curso', sql: 'SELECT i.id_estudiante, i.id_curso, i.nota_final\nFROM inscripciones i\nWHERE i.nota_final > (\n  SELECT AVG(i2.nota_final) FROM inscripciones i2\n  WHERE i2.id_curso = i.id_curso\n);' } }
      ] },
      { id: 'from', h: 'Subconsulta en el FROM (tabla derivada) y en el SELECT', body: [
        '<p>Una subconsulta en el FROM funciona como una tabla temporal. <b>Necesita alias</b>. Sirve para hacer "un cálculo sobre otro cálculo".</p>',
        { ex: { id: 'from', db: 'tienda', title: 'Promedio de pedidos por cliente', sql: 'SELECT ROUND(AVG(t.num_pedidos), 2) AS promedio_pedidos\nFROM (\n  SELECT id_cliente, COUNT(*) AS num_pedidos\n  FROM PEDIDO\n  GROUP BY id_cliente\n) AS t;', note: 'Ana tiene 2 pedidos y Luis 1: el promedio es 1.5.' } },
        { tip: 'Desde PostgreSQL 16 la subconsulta del FROM puede ir sin alias, pero en versiones anteriores (y en otros SGBD) es obligatorio. En el examen ponlo siempre: <code>FROM (…) AS t</code>.' },
        { ex: { id: 'sel', db: B, title: 'Subconsulta en el SELECT: número de cuentas de cada cliente', sql: 'SELECT c.nombre,\n       (SELECT COUNT(*) FROM cuentas cu WHERE cu.id_cliente = c.id_cliente) AS cuentas\nFROM clientes c;' } }
      ] },
      { id: 'vsjoin', h: '¿Subconsulta o JOIN?', body: [
        `<div class="tblwrap"><table><tr><th>Situación</th><th>Mejor opción</th><th>Por qué</th></tr>
<tr><td>Necesitas mostrar columnas de varias tablas</td><td><b>JOIN</b></td><td>La subconsulta en el WHERE solo filtra; no agrega columnas</td></tr>
<tr><td>Comparar con un valor calculado (promedio, máximo)</td><td><b>Subconsulta escalar</b></td><td>No se puede poner AVG en el WHERE</td></tr>
<tr><td>"Los que tienen" algo relacionado</td><td>IN / EXISTS o JOIN + DISTINCT</td><td>Con JOIN un cliente con 2 préstamos sale 2 veces</td></tr>
<tr><td>"Los que NO tienen" algo relacionado</td><td>NOT EXISTS o LEFT JOIN … IS NULL</td><td>Evitan la trampa de NOT IN con NULL</td></tr>
<tr><td>Cálculo sobre un resultado agrupado</td><td><b>Subconsulta en el FROM</b></td><td>Por ejemplo, un promedio de conteos</td></tr></table></div>`,
        '<p>Las tres formas de "clientes sin préstamos" dan lo mismo:</p>',
        { ex: { id: 'tres', db: B, sql: "-- 1) NOT IN\nSELECT nombre FROM clientes WHERE id_cliente NOT IN (SELECT id_cliente FROM prestamos);\n-- 2) NOT EXISTS\nSELECT c.nombre FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM prestamos p WHERE p.id_cliente = c.id_cliente);\n-- 3) LEFT JOIN … IS NULL\nSELECT c.nombre FROM clientes c LEFT JOIN prestamos p ON c.id_cliente = p.id_cliente WHERE p.id_prestamo IS NULL;", note: 'Laura y Camila, tres veces.' } }
      ] }
    ],
    keys: ['Subconsulta = SELECT entre paréntesis dentro de otra consulta.',
      'Escalar (un valor) con = < >: la solución a "mayor que el promedio", "el máximo", "el mínimo".',
      'IN / NOT IN con una lista; NOT IN falla si la lista tiene NULL.',
      'EXISTS / NOT EXISTS: "¿hay alguna fila relacionada?", normalmente correlacionada.',
      'En el FROM es una tabla derivada y lleva alias.',
      'Para mostrar columnas de varias tablas, JOIN; para filtrar por un cálculo, subconsulta.'],
    quiz: [
      { q: '¿Cómo muestras el empleado con el salario más alto?', o: [
        { t: 'WHERE salario = (SELECT MAX(salario) FROM empleados)', ok: true, why: 'Correcto: subconsulta escalar.' },
        { t: 'WHERE salario = MAX(salario)', why: 'No se permiten agregaciones en el WHERE.' },
        { t: 'GROUP BY salario HAVING MAX(salario)', why: 'HAVING necesita una condición, y agrupar por salario no tiene sentido aquí.' },
        { t: 'SELECT MAX(nombre) FROM empleados', why: 'MAX de nombre es el último alfabéticamente, no el de mayor salario.' }] },
      { q: '<code>WHERE id NOT IN (SELECT id_autor FROM libros)</code> no devuelve nada aunque hay autores sin libros. ¿Por qué?', o: [
        { t: 'La subconsulta devuelve un NULL y NOT IN con NULL nunca es verdadero', ok: true, why: 'Correcto: usa NOT EXISTS o filtra los NULL.' },
        { t: 'NOT IN no existe en PostgreSQL', why: 'Sí existe.' },
        { t: 'Hay que usar = en vez de NOT IN', why: '= con varias filas da error.' },
        { t: 'Falta un GROUP BY', why: 'No hay agregación.' }] },
      { q: '¿Qué hace EXISTS?', o: [
        { t: 'Devuelve verdadero si la subconsulta tiene al menos una fila', ok: true, why: 'Correcto: no importa qué columnas devuelva (por eso SELECT 1).' },
        { t: 'Verifica que una tabla exista', why: 'Eso sería consultar el catálogo (information_schema).' },
        { t: 'Cuenta las filas de la subconsulta', why: 'Para contar se usa COUNT.' },
        { t: 'Verifica que una columna no sea NULL', why: 'Eso es IS NOT NULL.' }] },
      { q: 'Una subconsulta en el FROM…', o: [
        { t: 'Funciona como una tabla temporal y debe llevar alias', ok: true, why: 'Correcto: FROM (SELECT …) AS t.' },
        { t: 'Solo puede devolver un valor', why: 'Puede devolver muchas filas y columnas.' },
        { t: 'No puede usar GROUP BY', why: 'Puede; es su uso típico.' },
        { t: 'Modifica la tabla original', why: 'Un SELECT nunca modifica datos.' }] },
      { q: 'Necesitas el nombre del cliente Y el monto de su préstamo. ¿Qué usas?', o: [
        { t: 'Un JOIN entre clientes y prestamos', ok: true, why: 'Correcto: para mostrar columnas de las dos tablas hace falta JOIN.' },
        { t: 'WHERE id_cliente IN (SELECT id_cliente FROM prestamos)', why: 'Eso filtra clientes pero no muestra el monto.' },
        { t: 'EXISTS', why: 'EXISTS solo dice si hay préstamo, no cuál.' },
        { t: 'HAVING', why: 'HAVING filtra grupos.' }] }
    ],
    practice: { sql: ['subconsultas'], quiz: ['sql'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
