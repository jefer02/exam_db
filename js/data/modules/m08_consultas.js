/* Tema 8 · Consultas: SELECT, WHERE, operadores, LIKE, IN, BETWEEN, IS NULL, ORDER BY, DISTINCT, LIMIT, alias. */
(function (root) {
  const B = 'bancodb', E = 'bd_estudiantes_joins';
  (root.MODULES = root.MODULES || []).push({
    id: 'consultas', n: 8, title: 'Consultas: SELECT, WHERE, operadores, ORDER BY, DISTINCT, LIMIT y alias', short: 'Consultas (SELECT/WHERE)', minutes: 40,
    desc: 'Filtrar filas con WHERE, LIKE, IN, BETWEEN e IS NULL; ordenar; quitar repetidos; limitar y poner alias.',
    goals: ['Escribir un SELECT con las columnas pedidas, alias y columnas calculadas.',
      'Filtrar con =, <>, <, >, AND, OR, NOT, LIKE/ILIKE, IN, BETWEEN e IS NULL.',
      'Ordenar por una o varias columnas (ASC/DESC), quitar repetidos con DISTINCT y limitar con LIMIT.',
      'Recordar el orden en que se escriben las cláusulas.'],
    sections: [
      { id: 'select', h: 'SELECT y FROM: qué columnas y de qué tabla', body: [
        { sql: 'SELECT columna1, columna2, ...   -- qué columnas (o * para todas)\nFROM tabla;                      -- de qué tabla' },
        { ex: { id: 'sel', db: B, sql: 'SELECT nombre, apellido, ciudad FROM clientes;' } },
        '<h3>Alias y columnas calculadas</h3><p><code>AS</code> le da otro nombre a una columna o a una tabla. Se pueden calcular columnas con operaciones (+ − * /) y unir textos con <code>||</code>.</p>',
        { ex: { id: 'alias', db: B, sql: "SELECT nombre || ' ' || apellido AS cliente,\n       ciudad AS \"ciudad de residencia\"\nFROM clientes c;", note: 'Si el alias tiene espacios va entre comillas dobles. <code>c</code> es el alias de la tabla (se usará mucho en los JOIN).' } },
        { ex: { id: 'calc', db: B, sql: "SELECT numero_cuenta,\n       saldo,\n       saldo * 0.02 AS interes_mensual\nFROM cuentas;" } },
        { tip: 'En el examen evita <code>SELECT *</code> cuando te piden columnas concretas: escribe exactamente las que pide el enunciado y en ese orden.' }
      ] },
      { id: 'where', h: 'WHERE: filtrar filas', body: [
        `<div class="tblwrap"><table><tr><th>Operador</th><th>Significado</th><th>Ejemplo</th></tr>
<tr><td><code>=</code></td><td>Igual</td><td><code>ciudad = 'Cali'</code></td></tr>
<tr><td><code>&lt;&gt;</code> o <code>!=</code></td><td>Distinto</td><td><code>estado &lt;&gt; 'Activa'</code></td></tr>
<tr><td><code>&lt; &gt; &lt;= &gt;=</code></td><td>Comparaciones</td><td><code>saldo &gt; 5000000</code></td></tr>
<tr><td><code>AND</code> / <code>OR</code> / <code>NOT</code></td><td>Combinar condiciones</td><td><code>edad &gt; 20 AND ciudad = 'Pasto'</code></td></tr></table></div>`,
        { ex: { id: 'w1', db: B, title: 'Laboratorio final: cuentas con saldo superior a 5 millones', sql: 'SELECT numero_cuenta, saldo\nFROM cuentas\nWHERE saldo > 5000000;' } },
        { ex: { id: 'w2', db: B, sql: "SELECT nombre, apellido, ciudad\nFROM clientes\nWHERE ciudad = 'Bogotá' OR ciudad = 'Cali';" } },
        { warn: '<b>AND se evalúa antes que OR.</b> <code>WHERE a OR b AND c</code> significa <code>a OR (b AND c)</code>. Usa paréntesis para dejar clara tu intención.' },
        { ex: { id: 'prec', db: 'polideportivo', title: 'Laboratorio: socios Premium o VIP mayores de 20 años', sql: "SELECT nombre, edad, tipo_membresia\nFROM socios\nWHERE (tipo_membresia = 'Premium' OR tipo_membresia = 'VIP')\n  AND edad > 20;", note: 'Sin paréntesis también saldría Ana López (8 años, Premium): AND se evaluaría primero.' } }
      ] },
      { id: 'like', h: 'LIKE e ILIKE: buscar por patrones de texto', body: [
        `<div class="tblwrap"><table><tr><th>Comodín</th><th>Significa</th><th>Ejemplo</th><th>Encuentra</th></tr>
<tr><td><code>%</code></td><td>Cualquier cantidad de caracteres (incluso ninguno)</td><td><code>nombre LIKE 'L%'</code></td><td>Empieza por L</td></tr>
<tr><td><code>%</code></td><td></td><td><code>correo LIKE '%@gmail.com'</code></td><td>Termina en @gmail.com</td></tr>
<tr><td><code>%</code></td><td></td><td><code>titulo LIKE '%amor%'</code></td><td>Contiene "amor"</td></tr>
<tr><td><code>_</code></td><td>Exactamente un carácter</td><td><code>numero_cuenta LIKE '2000_'</code></td><td>2000 + un carácter</td></tr></table></div>`,
        { ex: { id: 'like1', db: 'polideportivo', title: 'Laboratorio: entrenadores cuyo nombre empieza con L', sql: "SELECT nombre, especialidad\nFROM entrenadores\nWHERE nombre LIKE 'L%';" } },
        { ex: { id: 'like2', db: 'biblioteca', title: 'Laboratorio biblioteca: usuarios con correo de gmail', sql: "SELECT nombre, correo\nFROM usuarios\nWHERE correo LIKE '%@gmail.com';" } },
        { ex: { id: 'ilike', db: 'biblioteca', title: 'ILIKE (PostgreSQL) no distingue mayúsculas', sql: "SELECT titulo FROM libros WHERE titulo LIKE '%harry%';    -- 0 filas: 'harry' ≠ 'Harry'\nSELECT titulo FROM libros WHERE titulo ILIKE '%harry%';   -- 1 fila" } }
      ] },
      { id: 'in', h: 'IN, BETWEEN e IS NULL', body: [
        { cols: [
          ['<h4>IN: está en una lista</h4>', { sql: "WHERE ciudad IN ('Pasto', 'Cali')\n-- = ciudad = 'Pasto' OR ciudad = 'Cali'" }],
          ['<h4>BETWEEN: rango (incluye extremos)</h4>', { sql: 'WHERE edad BETWEEN 20 AND 22\n-- = edad >= 20 AND edad <= 22' }]
        ] },
        { ex: { id: 'in', db: E, sql: "SELECT nombre, ciudad FROM estudiantes\nWHERE ciudad IN ('Pasto', 'Cali');" } },
        { ex: { id: 'btw', db: 'biblioteca', title: 'Laboratorio biblioteca: préstamos entre febrero y marzo de 2024', sql: "SELECT id_prestamo, fecha_prestamo\nFROM prestamos\nWHERE fecha_prestamo BETWEEN '2024-02-01' AND '2024-03-31';" } },
        '<h3>NULL: el valor desconocido</h3><p><b>NULL</b> significa "sin valor" o "desconocido". No es 0 ni texto vacío. Cualquier comparación con NULL (<code>= NULL</code>, <code>&lt;&gt; NULL</code>) da "desconocido" y la fila no sale. Por eso se usa <code>IS NULL</code> / <code>IS NOT NULL</code>.</p>',
        { ex: { id: 'null', db: 'biblioteca', title: 'Laboratorio: préstamos activos (sin fecha de devolución)', sql: 'SELECT id_prestamo, id_libro, fecha_prestamo\nFROM prestamos\nWHERE fecha_devolucion IS NULL;' } },
        { ex: { id: 'eqnull', db: 'biblioteca', title: '= NULL no funciona (0 filas, sin error)', sql: 'SELECT id_prestamo FROM prestamos\nWHERE fecha_devolucion = NULL;', noRows: true } },
        { ex: { id: 'coalesce', db: 'polideportivo', data: 'ext', title: 'COALESCE: mostrar un valor en lugar de NULL', sql: "SELECT nombre,\n       COALESCE(email, 'sin correo') AS email,\n       COALESCE(tipo_membresia, 'Sin plan') AS plan\nFROM socios;" } }
      ] },
      { id: 'order', h: 'ORDER BY, DISTINCT y LIMIT', body: [
        { ex: { id: 'ord', db: B, title: 'Laboratorio final: clientes ordenados por ciudad', sql: 'SELECT nombre, apellido, ciudad\nFROM clientes\nORDER BY ciudad;          -- ASC (ascendente) es el valor por defecto' } },
        { ex: { id: 'ord2', db: E, title: 'Varias columnas: por ciudad y, dentro de cada ciudad, de mayor a menor edad', sql: 'SELECT nombre, ciudad, edad\nFROM estudiantes\nORDER BY ciudad ASC, edad DESC;' } },
        { ex: { id: 'dist', db: E, title: 'DISTINCT: quitar filas repetidas', sql: 'SELECT DISTINCT ciudad\nFROM estudiantes\nORDER BY ciudad;', note: 'Sin DISTINCT, Pasto saldría 3 veces.' } },
        { ex: { id: 'lim', db: B, title: 'LIMIT: las 3 cuentas con más saldo', sql: 'SELECT numero_cuenta, saldo\nFROM cuentas\nORDER BY saldo DESC\nLIMIT 3;', note: '<code>LIMIT n OFFSET m</code> salta m filas y muestra n (paginación). En SQL Server se usa TOP.' } }
      ] },
      { id: 'orden', h: 'El orden de las cláusulas', body: [
        { sql: 'SELECT   columnas, expresiones AS alias\nFROM     tabla [alias]\n[JOIN    otra ON condición]\nWHERE    condición sobre filas\nGROUP BY columnas\nHAVING   condición sobre grupos\nORDER BY columnas [ASC|DESC]\nLIMIT    n;' },
        { key: 'Se <b>escriben</b> en ese orden; si cambias el orden, PostgreSQL da error de sintaxis. ORDER BY y LIMIT van siempre al final.' },
        { reveal: { q: 'Escribe la consulta: nombre y salario de los empleados de bancodb que ganan entre 3 y 5 millones, del mayor al menor salario.', a: [{ ex: { id: 'rev', db: B, sql: 'SELECT nombre, salario\nFROM empleados\nWHERE salario BETWEEN 3000000 AND 5000000\nORDER BY salario DESC;' } }] } }
      ] }
    ],
    keys: ['SELECT columnas FROM tabla WHERE … ORDER BY … LIMIT …; (en ese orden).',
      'AS pone alias; || concatena textos; se pueden calcular columnas.',
      'LIKE: % = cualquier cantidad de caracteres, _ = uno. ILIKE no distingue mayúsculas (PostgreSQL).',
      'IN (lista), BETWEEN a AND b (incluye extremos).',
      'NULL se compara con IS NULL / IS NOT NULL, nunca con =.',
      'AND se evalúa antes que OR: usa paréntesis.',
      'ORDER BY col [ASC|DESC], DISTINCT quita repetidos, LIMIT n limita filas.'],
    quiz: [
      { q: '¿Qué encuentra <code>WHERE nombre LIKE \'%ez\'</code>?', o: [
        { t: 'Nombres que terminan en "ez"', ok: true, why: 'Correcto: % al inicio = cualquier cosa antes.' },
        { t: 'Nombres que empiezan por "ez"', why: 'Eso sería \'ez%\'.' },
        { t: 'Nombres que contienen exactamente "%ez"', why: '% es comodín, no un carácter literal.' },
        { t: 'Nombres de 2 letras', why: 'Eso sería \'__\'.' }] },
      { q: '¿Cómo buscas los préstamos sin fecha de devolución?', o: [
        { t: 'WHERE fecha_devolucion IS NULL', ok: true, why: 'Correcto.' },
        { t: 'WHERE fecha_devolucion = NULL', why: 'Comparar con = NULL nunca es verdadero: devuelve 0 filas.' },
        { t: "WHERE fecha_devolucion = ''", why: 'Un texto vacío no es NULL (y para una fecha ni siquiera es válido).' },
        { t: 'WHERE fecha_devolucion = 0', why: 'NULL no es 0.' }] },
      { q: '<code>WHERE edad BETWEEN 20 AND 22</code> incluye…', o: [
        { t: '20, 21 y 22', ok: true, why: 'Correcto: BETWEEN incluye los dos extremos.' },
        { t: 'Solo 21', why: 'Los extremos también entran.' },
        { t: '20 y 21', why: 'El 22 también entra.' },
        { t: '21 y 22', why: 'El 20 también entra.' }] },
      { q: '¿Qué hace <code>SELECT DISTINCT ciudad FROM estudiantes;</code>?', o: [
        { t: 'Muestra cada ciudad una sola vez', ok: true, why: 'Correcto: DISTINCT elimina las filas repetidas del resultado.' },
        { t: 'Muestra las ciudades ordenadas', why: 'Para ordenar hace falta ORDER BY.' },
        { t: 'Cuenta las ciudades', why: 'Para contar se usa COUNT.' },
        { t: 'Borra las ciudades repetidas de la tabla', why: 'SELECT nunca modifica los datos.' }] },
      { q: '¿Cuál consulta está bien escrita?', o: [
        { t: 'SELECT nombre FROM clientes WHERE ciudad = \'Cali\' ORDER BY nombre;', ok: true, why: 'Correcto: SELECT → FROM → WHERE → ORDER BY.' },
        { t: 'SELECT nombre FROM clientes ORDER BY nombre WHERE ciudad = \'Cali\';', why: 'WHERE debe ir antes de ORDER BY.' },
        { t: 'SELECT nombre WHERE ciudad = \'Cali\' FROM clientes;', why: 'FROM va antes de WHERE.' },
        { t: 'FROM clientes SELECT nombre WHERE ciudad = \'Cali\';', why: 'La consulta empieza con SELECT.' }] },
      { q: '<code>WHERE ciudad = \'Pasto\' OR ciudad = \'Cali\' AND edad &gt; 21</code> equivale a…', o: [
        { t: "ciudad = 'Pasto' OR (ciudad = 'Cali' AND edad > 21)", ok: true, why: 'Correcto: AND tiene prioridad sobre OR.' },
        { t: "(ciudad = 'Pasto' OR ciudad = 'Cali') AND edad > 21", why: 'Para eso hacen falta los paréntesis.' },
        { t: 'Da error de sintaxis', why: 'Es válida; solo hay que saber la precedencia.' },
        { t: "ciudad IN ('Pasto','Cali') AND edad > 21", why: 'Esa es la versión con paréntesis, no la original.' }] },
      { q: '¿Qué hace <code>ORDER BY saldo DESC LIMIT 1</code>?', o: [
        { t: 'Devuelve la fila con el mayor saldo', ok: true, why: 'Correcto: ordena de mayor a menor y se queda con la primera fila.' },
        { t: 'Devuelve la fila con el menor saldo', why: 'Para eso sería ASC.' },
        { t: 'Borra todas menos una fila', why: 'SELECT no borra nada.' },
        { t: 'Devuelve el saldo total', why: 'Para eso se usa SUM.' }] }
    ],
    practice: { sql: ['consultas'], quiz: ['sql', 'lab'], labs: ['biblioteca', 'polideportivo'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
