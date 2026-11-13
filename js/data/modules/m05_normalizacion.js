/* Tema 5 · Normalización (ejemplo VENTAS de CLASE_6_SQL_NORMALIZACION). */
(function (root) {
  // Tabla HTML con clases por celda: cls[fila][col] = 'rep' | 'part' | 'trans'
  const tbl = (caption, head, rows, cls) => `<div class="tblwrap"><table class="ntab"><caption>${caption}</caption>
<tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
${rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${(cls && cls[i] && cls[i][j]) || ''}">${v}</td>`).join('')}</tr>`).join('')}</table></div>`;
  const VH = ['id_pedido', 'id_producto', 'fecha', 'id_cliente', 'nombre_cliente', 'email', 'nombre_producto', 'precio', 'cant.'];
  const V = [
    ['1001', '101', '2026-03-10', '1', 'Ana Torres', 'ana@mail.com', 'Teclado', '85000', '1'],
    ['1001', '102', '2026-03-10', '1', 'Ana Torres', 'ana@mail.com', 'Mouse', '35000', '2'],
    ['1002', '103', '2026-03-12', '1', 'Ana Torres', 'ana@mail.com', 'Monitor', '450000', '1'],
    ['1003', '102', '2026-03-15', '2', 'Luis Pérez', 'luis@mail.com', 'Mouse', '35000', '1']];
  const R = 'rep';
  const VCLS = [[0, 0, 0, R, R, R, 0, 0, 0], [0, 0, 0, R, R, R, R, R, 0], [0, 0, 0, R, R, R, 0, 0, 0], [0, 0, 0, 0, 0, 0, R, R, 0]];
  const VENTAS = tbl('VENTAS (en 1FN, pero con redundancia)', VH, V, VCLS);
  const NO1FN = tbl('PEDIDOS sin normalizar', ['id_pedido', 'fecha', 'cliente', 'productos', 'cantidades'], [
    ['1001', '2026-03-10', 'Ana Torres', '<b>101, 102</b>', '<b>1, 2</b>'], ['1002', '2026-03-12', 'Ana Torres', '103', '1'], ['1003', '2026-03-15', 'Luis Pérez', '102', '1']],
  [[0, 0, 0, R, R]]);
  const PED_CLI = tbl('PEDIDO_CLIENTE', ['<u>id_pedido</u>', 'fecha', 'id_cliente', 'nombre_cliente', 'email'], [
    ['1001', '2026-03-10', '1', 'Ana Torres', 'ana@mail.com'], ['1002', '2026-03-12', '1', 'Ana Torres', 'ana@mail.com'], ['1003', '2026-03-15', '2', 'Luis Pérez', 'luis@mail.com']],
  [[0, 0, 'trans', 'trans', 'trans'], [0, 0, 'trans', 'trans', 'trans'], [0, 0, 'trans', 'trans', 'trans']]);
  const PROD = tbl('PRODUCTO', ['<u>id_producto</u>', 'nombre', 'precio'], [['101', 'Teclado', '85000'], ['102', 'Mouse', '35000'], ['103', 'Monitor', '450000']]);
  const DET = tbl('DETALLE_PEDIDO', ['<u>id_pedido</u>', '<u>id_producto</u>', 'cantidad'], [['1001', '101', '1'], ['1001', '102', '2'], ['1002', '103', '1'], ['1003', '102', '1']]);
  const CLI = tbl('CLIENTE', ['<u>id_cliente</u>', 'nombre', 'email'], [['1', 'Ana Torres', 'ana@mail.com'], ['2', 'Luis Pérez', 'luis@mail.com']]);
  const PED = tbl('PEDIDO', ['<u>id_pedido</u>', 'fecha', 'id_cliente (FK)'], [['1001', '2026-03-10', '1'], ['1002', '2026-03-12', '1'], ['1003', '2026-03-15', '2']]);
  const RECON = `SELECT p.id_pedido, d.id_producto, p.fecha, c.id_cliente,
       c.nombre AS nombre_cliente, c.email,
       pr.nombre AS nombre_producto, pr.precio, d.cantidad
FROM DETALLE_PEDIDO d
JOIN PEDIDO p    ON d.id_pedido = p.id_pedido
JOIN CLIENTE c   ON p.id_cliente = c.id_cliente
JOIN PRODUCTO pr ON d.id_producto = pr.id_producto
ORDER BY p.id_pedido, d.id_producto;`;

  (root.MODULES = root.MODULES || []).push({
    id: 'normalizacion', n: 5, title: 'Normalización: dependencias funcionales, 1FN, 2FN y 3FN', short: 'Normalización', minutes: 50,
    desc: 'Redundancia y anomalías, dependencias funcionales y cómo llevar una tabla "mala" a 1FN, 2FN y 3FN paso a paso.',
    goals: ['Detectar redundancia y explicar las anomalías de inserción, actualización y eliminación.',
      'Escribir las dependencias funcionales de una tabla (X → Y).',
      'Decidir si una tabla cumple 1FN, 2FN y 3FN y justificarlo.',
      'Descomponer una tabla hasta 3FN sin perder información.'],
    sections: [
      { id: 'problema', h: 'El problema: redundancia y anomalías', body: [
        '<p>La <b>normalización</b> organiza las columnas en tablas siguiendo reglas formales (las <b>formas normales</b>) para <b>reducir la redundancia</b> y <b>evitar anomalías</b>. Es la etapa de <i>validación</i> de la metodología.</p>',
        '<p>Mira la tabla del ejemplo de clase. En naranja están los datos repetidos:</p>', VENTAS,
        `<div class="tblwrap"><table><tr><th>Problema</th><th>En VENTAS</th></tr>
<tr><td><b>Redundancia</b></td><td>Los datos de Ana se repiten 3 veces y los del Mouse 2 veces.</td></tr>
<tr><td><b>Anomalía de inserción</b></td><td>No se puede registrar un cliente que todavía no tiene pedidos: la clave exige id_pedido e id_producto.</td></tr>
<tr><td><b>Anomalía de actualización</b></td><td>Cambiar el email de Ana obliga a modificar 3 filas; si se olvida una, los datos quedan inconsistentes.</td></tr>
<tr><td><b>Anomalía de eliminación</b></td><td>Al borrar el pedido 1003 se pierde la única información de Luis Pérez.</td></tr></table></div>`,
        { key: 'Normalizar no es "partir tablas al azar": cada división se justifica con <b>dependencias funcionales</b> y claves, y debe <b>conservar la información</b> (con JOIN se reconstruye la tabla original).' }
      ] },
      { id: 'df', h: 'Dependencias funcionales', body: [
        '<p><b>X → Y</b> ("X determina a Y") significa que cada valor de X tiene <b>un único</b> valor de Y. Si conozco el id_cliente, conozco su nombre y su email: <code>id_cliente → nombre_cliente, email</code>.</p>',
        '<h3>Dependencias de VENTAS</h3>',
        '<div class="mini" style="font-family:ui-monospace,monospace">(id_pedido, id_producto) → cantidad<br>id_pedido → fecha, id_cliente<br>id_producto → nombre_producto, precio<br>id_cliente → nombre_cliente, email</div>',
        `<div class="tblwrap"><table><tr><th>Concepto</th><th>Definición</th><th>En VENTAS</th></tr>
<tr><td>Clave candidata</td><td>Conjunto mínimo de columnas que determina todas las demás</td><td>(id_pedido, id_producto)</td></tr>
<tr><td>Atributo primo</td><td>Atributo que forma parte de alguna clave candidata</td><td>id_pedido, id_producto</td></tr>
<tr><td><span class="badge" style="background:var(--svg-head)">Dependencia parcial</span></td><td>Un atributo no primo depende de <b>solo una parte</b> de una clave compuesta</td><td>id_producto → precio (no necesita id_pedido)</td></tr>
<tr><td><span class="badge" style="background:var(--svg-pk)">Dependencia transitiva</span></td><td>Un atributo no primo depende de la clave <b>a través de otro</b> atributo no primo: A → B → C</td><td>id_pedido → id_cliente → email</td></tr></table></div>`,
        { reveal: { q: 'En la tabla estudiantes de clase, ¿se cumple id_estudiante → ciudad? ¿Y ciudad → id_estudiante?', a: '<p>Sí a la primera: cada estudiante vive en una sola ciudad. No a la segunda: en Pasto viven Carlos, Juan y Daniel, así que conocer la ciudad no determina al estudiante.</p>' } }
      ] },
      { id: 'formas', h: 'Las tres formas normales', body: [
        `<div class="tblwrap"><table><tr><th>Forma</th><th>Condición</th><th>Cómo se corrige</th></tr>
<tr><td><b>1FN</b></td><td>Valores <b>atómicos</b> (una celda = un valor), sin grupos repetitivos, filas identificadas por una clave</td><td>Una fila por cada valor; los multivaluados van a otra tabla</td></tr>
<tr><td><b>2FN</b></td><td>1FN + <b>sin dependencias parciales</b> (ningún atributo no primo depende de parte de una clave compuesta)</td><td>Sacar a otra tabla los atributos que dependen de una parte de la clave, junto con esa parte</td></tr>
<tr><td><b>3FN</b></td><td>2FN + <b>sin dependencias transitivas</b> (ningún atributo no primo depende de otro atributo no primo)</td><td>Sacar a otra tabla los atributos que dependen del atributo intermedio; ese atributo queda como FK</td></tr></table></div>`,
        { tip: 'Si la clave es <b>simple</b> (una sola columna) y la tabla está en 1FN, ya está en 2FN: no puede haber dependencia de "una parte" de la clave.' },
        { exam: 'Frase para memorizar: los atributos deben depender de "la clave (1FN), toda la clave (2FN) y nada más que la clave (3FN)".' }
      ] },
      { id: 'pasos', h: 'Paso a paso: normalizando VENTAS', body: [
        { stepper: { title: 'De la tabla "mala" a 3FN', steps: [
          { h: 'Tabla sin normalizar: no cumple 1FN', body: [NO1FN, '<p>La celda <b>"101, 102"</b> guarda dos productos en un solo campo: no es atómica. No se pueden buscar, sumar ni relacionar bien esos valores.</p>'] },
          { h: '1FN: una fila por cada producto del pedido', body: [VENTAS, '<p>Ahora cada celda tiene un solo valor y la clave es <b>(id_pedido, id_producto)</b>. Cumple 1FN, pero tiene mucha redundancia (en naranja).</p>'] },
          { h: 'Encuentra las dependencias parciales', body: ['<div class="mini" style="font-family:ui-monospace,monospace">(id_pedido, id_producto) → cantidad &nbsp;&nbsp;✔ depende de toda la clave<br><b>id_pedido</b> → fecha, id_cliente, nombre_cliente, email &nbsp;&nbsp;✘ parcial<br><b>id_producto</b> → nombre_producto, precio &nbsp;&nbsp;✘ parcial</div>', '<p>Solo <code>cantidad</code> necesita las dos partes de la clave. Las demás columnas dependen de una sola parte: <b>no cumple 2FN</b>.</p>'] },
          { h: '2FN: separar lo que depende de cada parte de la clave', body: ['<p>Cada grupo de dependencias parciales se va a su propia tabla, con la parte de la clave de la que depende:</p>', { cols: [[PED_CLI], [PROD, DET]] }, '<p>PRODUCTO y DETALLE_PEDIDO ya están bien. Pero en PEDIDO_CLIENTE (en amarillo) los datos de Ana todavía se repiten.</p>'] },
          { h: 'Encuentra la dependencia transitiva', body: ['<div class="mini" style="font-family:ui-monospace,monospace">id_pedido → id_cliente → nombre_cliente, email</div>', '<p>nombre_cliente y email no dependen del pedido, sino del <b>cliente</b> (un atributo que no es clave). Es transitiva: <b>PEDIDO_CLIENTE no cumple 3FN</b>.</p>'] },
          { h: '3FN: el cliente se va a su propia tabla', body: [{ cols: [[CLI, PED], [PROD, DET]] }, '<p>En PEDIDO queda <code>id_cliente</code> como <b>FK</b>. Ahora cada dato se guarda una sola vez: cambiar el email de Ana toca 1 fila, se puede registrar un cliente sin pedidos y borrar el pedido 1003 no borra a Luis.</p>',
            { key: 'Esquema final en 3FN: CLIENTE(<u>id_cliente</u>, nombre, email) · PEDIDO(<u>id_pedido</u>, fecha, id_cliente FK) · DETALLE_PEDIDO(<u>id_pedido, id_producto</u>, cantidad) · PRODUCTO(<u>id_producto</u>, nombre, precio). Es la base <b>tienda</b> de clase.' }] }
        ] } }
      ] },
      { id: 'sql', h: 'Compruébalo con SQL: no se perdió información', body: [
        '<p>Las cuatro tablas en 3FN son la base de práctica <b>tienda</b>. Con un JOIN se reconstruye exactamente la tabla VENTAS original:</p>',
        { ex: { id: 'recon', db: 'tienda', sql: RECON, note: 'Las mismas 4 filas de VENTAS: la descomposición es "sin pérdida".' } },
        { ex: { id: 'update', db: 'tienda', title: 'La anomalía de actualización desapareció', sql: "UPDATE CLIENTE SET email = 'ana.torres@mail.com' WHERE id_cliente = 1;  -- 1 fila\n\nSELECT p.id_pedido, c.nombre, c.email\nFROM PEDIDO p JOIN CLIENTE c ON p.id_cliente = c.id_cliente;", note: 'Una sola fila cambiada y los 2 pedidos de Ana ya muestran el correo nuevo.' } }
      ] },
      { id: 'ejercicios', h: 'Ejercicios para practicar', body: [
        '<h3>Ejercicio de clase: PRODUCTO_CATEGORIA</h3><div class="mini"><p>PRODUCTO_CATEGORIA(<u>id_producto</u>, nombre, precio, id_categoria, nombre_categoria) con id_categoria → nombre_categoria. (a) Lista las dependencias funcionales. (b) ¿Cumple 1FN, 2FN y 3FN? (c) Propón las tablas con PK y FK. (d) Escribe el SQL.</p></div>',
        { reveal: { q: 'Ver la solución', a: ['<p><b>(a)</b> id_producto → nombre, precio, id_categoria; id_categoria → nombre_categoria.<br><b>(b)</b> 1FN sí (valores atómicos). 2FN sí: la clave es simple, no hay dependencias parciales. 3FN <b>no</b>: id_producto → id_categoria → nombre_categoria es transitiva.<br><b>(c)</b> CATEGORIA(<u>id_categoria</u>, nombre_categoria) · PRODUCTO(<u>id_producto</u>, nombre, precio, id_categoria FK).</p>',
          { sql: 'CREATE TABLE CATEGORIA (\n  id_categoria     INTEGER PRIMARY KEY,\n  nombre_categoria VARCHAR(60) NOT NULL\n);\nCREATE TABLE PRODUCTO (\n  id_producto  INTEGER PRIMARY KEY,\n  nombre       VARCHAR(80) NOT NULL,\n  precio       NUMERIC(10,2) NOT NULL CHECK (precio > 0),\n  id_categoria INTEGER NOT NULL REFERENCES CATEGORIA (id_categoria)\n);' }] } },
        '<h3>Con los datos de la Sesión 8</h3><div class="mini"><p>INSCRIPCION_GENERAL(id_estudiante, nombre, ciudad, id_curso, nombre_curso, docente, fecha_inscripcion, nota_final). Un estudiante puede inscribirse en varios cursos. Normaliza hasta 3FN.</p></div>',
        { reveal: { q: 'Ver la solución', a: '<p>Clave: (id_estudiante, id_curso). Dependencias parciales: id_estudiante → nombre, ciudad; id_curso → nombre_curso, docente. Solo fecha_inscripcion y nota_final dependen de la clave completa. Resultado (3FN): <b>estudiantes</b>(<u>id_estudiante</u>, nombre, ciudad) · <b>cursos</b>(<u>id_curso</u>, nombre_curso, docente) · <b>inscripciones</b>(<u>id_estudiante, id_curso</u>, fecha_inscripcion, nota_final). ¡Es justamente la base de los JOINs de clase! (allí inscripciones usa además un id_inscripcion SERIAL como PK).</p>' } },
        { tip: 'Receta para el examen: 1) escribe las dependencias funcionales, 2) encuentra la clave, 3) revisa 1FN → 2FN → 3FN justificando con las dependencias, 4) separa en tablas con PK y FK, 5) verifica que con JOIN se recupera la tabla original.' }
      ] }
    ],
    keys: ['Objetivo: reducir redundancia y evitar anomalías de inserción, actualización y eliminación.',
      'Dependencia funcional X → Y: cada valor de X determina un único valor de Y.',
      '1FN: valores atómicos, sin grupos repetitivos, con clave.',
      '2FN: 1FN + sin dependencias parciales (solo importa si la clave es compuesta).',
      '3FN: 2FN + sin dependencias transitivas (A → B → C con B no clave).',
      'Cada división se justifica con dependencias y no pierde información: con JOIN se reconstruye la tabla original.'],
    quiz: [
      { q: 'Una celda guarda "101, 102" (dos productos). ¿Qué forma normal se incumple?', o: [
        { t: '1FN', ok: true, why: 'Correcto: el valor no es atómico.' },
        { t: '2FN', why: 'La 2FN trata de dependencias parciales; aquí ni siquiera se cumple la 1FN.' },
        { t: '3FN', why: 'La 3FN trata de dependencias transitivas.' },
        { t: 'Ninguna', why: 'Un campo con varios valores incumple la primera forma normal.' }] },
      { q: 'En VENTAS (clave id_pedido + id_producto), <code>id_producto → precio</code> es una dependencia…', o: [
        { t: 'Parcial: precio depende de solo una parte de la clave', ok: true, why: 'Correcto: por eso VENTAS no cumple 2FN.' },
        { t: 'Transitiva', why: 'Transitiva sería a través de un atributo no clave (id_pedido → id_cliente → email).' },
        { t: 'Completa', why: 'Completa sería depender de las dos partes, como la cantidad.' },
        { t: 'Multivaluada', why: 'precio tiene un único valor por producto.' }] },
      { q: '<code>id_pedido → id_cliente → email</code> en PEDIDO_CLIENTE es una dependencia…', o: [
        { t: 'Transitiva: impide la 3FN', ok: true, why: 'Correcto: email depende del cliente, que no es clave de esa tabla.' },
        { t: 'Parcial: impide la 2FN', why: 'La clave de PEDIDO_CLIENTE es simple (id_pedido): no hay dependencias parciales.' },
        { t: 'Válida en 3FN', why: 'Precisamente la 3FN prohíbe ese camino a través de un atributo no clave.' },
        { t: 'Inversa', why: 'Ese término no existe en normalización.' }] },
      { q: 'Si no puedes registrar un cliente hasta que haga su primer pedido, tienes una anomalía de…', o: [
        { t: 'Inserción', ok: true, why: 'Correcto: no puedes insertar un dato sin otro que no tiene relación.' },
        { t: 'Actualización', why: 'La de actualización es tener que cambiar el mismo dato en varias filas.' },
        { t: 'Eliminación', why: 'La de eliminación es perder información al borrar otra.' },
        { t: 'Integridad referencial', why: 'Es un problema de diseño (redundancia), no una violación de FK.' }] },
      { q: 'Una tabla en 1FN cuya clave primaria es una sola columna…', o: [
        { t: 'Está automáticamente en 2FN', ok: true, why: 'Correcto: no hay "parte" de la clave de la que se pueda depender parcialmente.' },
        { t: 'Está automáticamente en 3FN', why: 'Puede tener dependencias transitivas (ver PRODUCTO_CATEGORIA).' },
        { t: 'Nunca puede estar en 2FN', why: 'Al contrario: siempre lo está.' },
        { t: 'Debe dividirse siempre', why: 'Solo si tiene dependencias transitivas.' }] },
      { q: '¿Cómo compruebas que una descomposición no perdió información?', o: [
        { t: 'Uniendo las tablas resultantes con JOIN y verificando que sale la tabla original', ok: true, why: 'Correcto: es una descomposición "sin pérdida".' },
        { t: 'Contando que haya más tablas que antes', why: 'Más tablas no garantiza nada.' },
        { t: 'Verificando que todas las tablas tengan el mismo número de filas', why: 'Las tablas normalizadas suelen tener distinto número de filas.' },
        { t: 'Borrando la tabla original', why: 'Eso no comprueba nada.' }] }
    ],
    practice: { quiz: ['norm'], labs: ['normalizacion'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
