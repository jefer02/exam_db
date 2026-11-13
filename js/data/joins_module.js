/* Contenido del módulo de JOINs (tema prioritario del examen).
   - DEMO: tablas pequeñas (copias exactas de las bases de práctica) para la animación fila por fila.
   - TYPES: tipos de JOIN y las regiones del diagrama de Venn que incluyen.
   - PATTERNS y MISTAKES: ejemplos ejecutables (los verifica tools/verify.js vía EXAMPLES).
   - QUIZ: mini-quiz; cada opción explica por qué es correcta o incorrecta. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JOINS_MODULE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const EST = 'bd_estudiantes_joins';

  /* ---------- datos de la demo fila por fila ---------- */
  const estudiantes = { name: 'estudiantes', alias: 'e', cols: ['id_estudiante', 'nombre', 'ciudad'], rows: [
    [1, 'Carlos', 'Pasto'], [2, 'Maria', 'Cali'], [3, 'Juan', 'Pasto'], [4, 'Laura', 'Bogota'],
    [5, 'Andres', 'Popayan'], [6, 'Sofia', 'Cali'], [7, 'Daniel', 'Pasto']] };
  const inscripciones = { name: 'inscripciones', alias: 'i', cols: ['id_inscripcion', 'id_estudiante', 'id_curso', 'nota_final'], rows: [
    [1, 1, 1, 4.5], [2, 2, 1, 4.0], [3, 3, 2, 3.8], [4, 4, 2, 4.7], [5, 5, 3, 3.5],
    [6, 1, 3, 4.2], [7, 2, 4, 4.8], [8, 3, 4, 3.9], [9, 6, 5, 4.6]] };
  const cursos = { name: 'cursos', alias: 'c', cols: ['id_curso', 'nombre_curso', 'docente'], rows: [
    [1, 'Bases de Datos', 'Cristian Ordoñez'], [2, 'Inteligencia Artificial', 'Laura Benavides'],
    [3, 'Programacion Python', 'Carlos Muñoz'], [4, 'Mineria de Datos', 'Andres Garcia'],
    [5, 'Desarrollo Web', 'Maria Torres'], [6, 'Redes de Computadores', 'Pedro Ruiz']] };
  const autores = { name: 'autores', alias: 'a', cols: ['id_autor', 'nombre'], rows: [
    [1, 'Gabriel García Márquez'], [2, 'Julio Cortázar'], [3, 'J.K. Rowling'], [4, 'Mario Vargas Llosa'], [5, 'Isabel Allende']] };
  const libros = { name: 'libros', alias: 'l', cols: ['id_libro', 'titulo', 'id_autor'], rows: [
    [1, 'Cien años de soledad', 1], [2, 'Rayuela', 2], [3, 'Harry Potter y la piedra filosofal', 3],
    [4, 'La ciudad y los perros', 4], [5, 'El amor en los tiempos del cólera', 1], [6, 'Antología de cuentos', null]] };

  const DEMO = [
    { id: 'est_ins', label: 'estudiantes ↔ inscripciones (clase)', db: EST, data: 'orig', A: estudiantes, B: inscripciones, keyA: 'id_estudiante', keyB: 'id_estudiante',
      note: 'Daniel (id 7) no tiene inscripciones. Todas las inscripciones tienen estudiante.' },
    { id: 'ins_cur', label: 'inscripciones ↔ cursos (clase)', db: EST, data: 'orig', A: inscripciones, B: cursos, keyA: 'id_curso', keyB: 'id_curso',
      note: 'El curso "Redes de Computadores" (id 6) no tiene inscripciones.' },
    { id: 'aut_lib', label: 'autores ↔ libros (biblioteca, datos extendidos)', db: 'biblioteca', data: 'ext', A: autores, B: libros, keyA: 'id_autor', keyB: 'id_autor',
      note: 'Hay huérfanos en los dos lados: Isabel Allende no tiene libros y "Antología de cuentos" no tiene autor (id_autor NULL).' }
  ];

  /* ---------- tipos de JOIN ---------- */
  // regions: a = solo A (izquierda), ab = intersección, b = solo B (derecha)
  const TYPES = [
    { key: 'inner', name: 'INNER JOIN', regions: ['ab'], join: 'INNER JOIN',
      desc: 'Solo las filas que tienen pareja en ambas tablas (la intersección). Es el JOIN por defecto: escribir JOIN es lo mismo que INNER JOIN.' },
    { key: 'left', name: 'LEFT JOIN', regions: ['a', 'ab'], join: 'LEFT JOIN',
      desc: 'Todas las filas de la tabla IZQUIERDA (la del FROM). Si no tienen pareja, las columnas de la derecha salen en NULL.' },
    { key: 'right', name: 'RIGHT JOIN', regions: ['ab', 'b'], join: 'RIGHT JOIN',
      desc: 'Todas las filas de la tabla DERECHA (la del JOIN). Si no tienen pareja, las columnas de la izquierda salen en NULL. A RIGHT JOIN B = B LEFT JOIN A.' },
    { key: 'full', name: 'FULL OUTER JOIN', regions: ['a', 'ab', 'b'], join: 'FULL OUTER JOIN',
      desc: 'Todas las filas de ambas tablas: las coincidencias + las de la izquierda sin pareja + las de la derecha sin pareja (con NULL donde falta).' },
    { key: 'left_only', name: 'LEFT JOIN … WHERE B IS NULL', regions: ['a'], join: 'LEFT JOIN', where: 'b',
      desc: 'Solo las filas de la izquierda SIN pareja. Sirve para preguntas como "estudiantes sin inscripciones" o "clientes sin préstamos".' },
    { key: 'right_only', name: 'RIGHT JOIN … WHERE A IS NULL', regions: ['b'], join: 'RIGHT JOIN', where: 'a',
      desc: 'Solo las filas de la derecha SIN pareja.' },
    { key: 'full_only', name: 'FULL JOIN … WHERE A IS NULL OR B IS NULL', regions: ['a', 'b'], join: 'FULL OUTER JOIN', where: 'ab',
      desc: 'Todo lo que NO coincide, de ambos lados.' },
    { key: 'cross', name: 'CROSS JOIN', regions: [], join: 'CROSS JOIN', cross: true,
      desc: 'Producto cartesiano: cada fila de A con TODAS las de B (filas de A × filas de B). No lleva ON. Casi nunca es lo que quieres: suele aparecer por error al olvidar la condición.' }
  ];

  const SUMMARY = [
    ['INNER JOIN', 'Une registros coincidentes', 'Solo registros relacionados', 'SELECT * FROM A INNER JOIN B ON A.id = B.id;'],
    ['LEFT JOIN', 'Todos los de la izquierda', 'Coincidencias + sin relación de la izquierda', 'SELECT * FROM A LEFT JOIN B ON A.id = B.id;'],
    ['RIGHT JOIN', 'Todos los de la derecha', 'Coincidencias + sin relación de la derecha', 'SELECT * FROM A RIGHT JOIN B ON A.id = B.id;'],
    ['FULL OUTER JOIN', 'Combina LEFT y RIGHT', 'Todos los registros de ambas tablas', 'SELECT * FROM A FULL OUTER JOIN B ON A.id = B.id;'],
    ['CROSS JOIN', 'Combina todo con todo', 'filas(A) × filas(B)', 'SELECT * FROM A CROSS JOIN B;'],
    ['SELF JOIN', 'Une una tabla consigo misma', 'Relaciones reflexivas (supervisor, misma ciudad)', 'SELECT * FROM T t1 JOIN T t2 ON t1.id_jefe = t2.id;']
  ];

  /* ---------- patrones (ejemplos ejecutables) ---------- */
  const PATTERNS = [
    { id: 'p_inner2', title: 'INNER JOIN de 2 tablas · Consulta 2 de clase', db: EST, sql: `SELECT estudiantes.nombre, inscripciones.nota_final
FROM estudiantes
INNER JOIN inscripciones
  ON estudiantes.id_estudiante = inscripciones.id_estudiante;`,
      note: 'La condición ON compara la <b>PK</b> de una tabla con la <b>FK</b> que la referencia en la otra.' },
    { id: 'p_inner3', title: 'INNER JOIN de 3 tablas con alias · Consulta 1 de clase', db: EST, sql: `SELECT e.nombre, c.nombre_curso, i.fecha_inscripcion
FROM estudiantes e
INNER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
INNER JOIN cursos c        ON i.id_curso = c.id_curso;`,
      note: 'Para unir N tablas necesitas N−1 condiciones ON. estudiantes y cursos tienen una relación N:M, así que pasan por la tabla intermedia inscripciones.' },
    { id: 'p_where', title: 'JOIN + WHERE', db: EST, sql: `SELECT e.nombre, c.nombre_curso, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
WHERE i.nota_final >= 4.5;`,
      note: 'Primero se combinan las tablas y después WHERE filtra las filas combinadas.' },
    { id: 'p_group', title: 'JOIN + GROUP BY + HAVING', db: EST, sql: `SELECT c.nombre_curso, COUNT(*) AS inscritos, ROUND(AVG(i.nota_final), 2) AS promedio
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso
HAVING COUNT(*) >= 2
ORDER BY promedio DESC;`,
      note: 'Orden lógico: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.' },
    { id: 'p_anti', title: 'LEFT JOIN … IS NULL: registros sin relación', db: EST, sql: `SELECT e.nombre, e.apellido
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
WHERE i.id_inscripcion IS NULL;`,
      note: 'Daniel no tiene inscripciones: el LEFT JOIN lo conserva con NULL y el WHERE … IS NULL deja solo esas filas.' },
    { id: 'p_count0', title: 'LEFT JOIN + COUNT: contar incluyendo los ceros', db: EST, sql: `SELECT c.nombre_curso, COUNT(i.id_inscripcion) AS inscritos
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.id_curso, c.nombre_curso
ORDER BY inscritos;`,
      note: 'COUNT(columna) no cuenta NULL, por eso "Redes de Computadores" da 0.' },
    { id: 'p_right', title: 'RIGHT JOIN = LEFT JOIN con las tablas al revés', db: EST, sql: `SELECT c.nombre_curso, i.id_estudiante
FROM inscripciones i
RIGHT JOIN cursos c ON i.id_curso = c.id_curso;
-- Equivalente:
-- SELECT c.nombre_curso, i.id_estudiante
-- FROM cursos c LEFT JOIN inscripciones i ON i.id_curso = c.id_curso;` },
    { id: 'p_full3', title: 'FULL OUTER JOIN de 3 tablas', db: EST, data: 'ext', sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
FULL OUTER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
FULL OUTER JOIN cursos c ON i.id_curso = c.id_curso;`,
      note: 'Aparecen Daniel (sin curso) y los cursos sin estudiantes, con NULL al otro lado.' },
    { id: 'p_self', title: 'SELF JOIN: empleado y su supervisor (relación reflexiva)', db: 'bancodb', data: 'ext', sql: `SELECT e.nombre AS empleado, s.nombre AS supervisor
FROM empleados e
LEFT JOIN empleados s ON e.id_supervisor = s.id_empleado;`,
      note: 'La misma tabla aparece dos veces con alias distintos: <b>e</b> hace de empleado y <b>s</b> de supervisor. Es la relación reflexiva "Empleado supervisa" del modelo E/R.' },
    { id: 'p_self2', title: 'SELF JOIN: estudiantes de la misma ciudad', db: EST, sql: `SELECT e1.nombre, e2.nombre, e1.ciudad
FROM estudiantes e1
JOIN estudiantes e2
  ON e1.ciudad = e2.ciudad
 AND e1.id_estudiante < e2.id_estudiante;`,
      note: 'El "&lt;" evita emparejar a alguien consigo mismo y evita repetir la misma pareja al revés.' },
    { id: 'p_cross', title: 'CROSS JOIN', db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
CROSS JOIN cursos c;`,
      note: '7 × 6 = 42 filas.' },
    { id: 'p_4tab', title: 'JOIN de 4 tablas (bancodb)', db: 'bancodb', sql: `SELECT cl.nombre, cu.numero_cuenta, t.descripcion, tr.tipo, tr.monto
FROM clientes cl
JOIN cuentas cu       ON cl.id_cliente = cu.id_cliente
JOIN tipos_cuenta t   ON cu.id_tipo = t.id_tipo
JOIN transacciones tr ON cu.id_cuenta = tr.id_cuenta;`,
      note: 'Sigue el camino de las FK en el diagrama: clientes ← cuentas → tipos_cuenta, y cuentas ← transacciones.' },
    { id: 'p_using', title: 'Atajo: USING cuando la columna se llama igual', db: EST, sql: `SELECT nombre, nombre_curso
FROM estudiantes
JOIN inscripciones USING (id_estudiante)
JOIN cursos USING (id_curso);`,
      note: 'USING (col) equivale a ON A.col = B.col. En el examen es más seguro escribir el ON completo.' }
  ];

  /* ---------- errores típicos ---------- */
  const MISTAKES = [
    { id: 'm_cartesian', title: 'Olvidar la condición de unión → producto cartesiano',
      wrong: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e, cursos c;`, rows: 42 },
      why: 'Sin condición, cada estudiante se combina con todos los cursos: 7 × 6 = 42 filas, casi todas falsas (Daniel aparece "inscrito" en todo).',
      fix: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;`, rows: 9 } },
    { id: 'm_noon', title: 'Escribir JOIN sin ON',
      wrong: { db: EST, sql: `SELECT e.nombre, i.nota_final
FROM estudiantes e
JOIN inscripciones i;`, expectError: 'syntax error' },
      why: 'En PostgreSQL un INNER/LEFT/RIGHT/FULL JOIN exige su condición ON (o USING). Solo CROSS JOIN va sin ON.',
      fix: { db: EST, sql: `SELECT e.nombre, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;` } },
    { id: 'm_ambiguous', title: 'Columna ambigua',
      wrong: { db: EST, sql: `SELECT id_estudiante, nombre, nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;`, expectError: 'ambiguous' },
      why: 'id_estudiante existe en las dos tablas y PostgreSQL no sabe cuál mostrar. Toda columna que se repita entre tablas debe llevar su alias.',
      fix: { db: EST, sql: `SELECT e.id_estudiante, e.nombre, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;` } },
    { id: 'm_alias', title: 'Usar el nombre de la tabla después de ponerle alias',
      wrong: { db: EST, sql: `SELECT estudiantes.nombre, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;`, expectError: 'FROM-clause entry' },
      why: 'Cuando escribes "estudiantes e", la tabla pasa a llamarse e en toda la consulta.',
      fix: { db: EST, sql: `SELECT e.nombre, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;` } },
    { id: 'm_wrongon', title: 'ON con las columnas equivocadas (no da error, pero miente)',
      wrong: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_curso
JOIN cursos c ON i.id_curso = c.id_curso;` },
      why: 'Compara el id del estudiante con el id del curso: se ejecuta sin error, pero empareja filas al azar (Andres aparece en Desarrollo Web, que es de Sofia). Siempre une la PK con la FK que la referencia.',
      fix: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;` } },
    { id: 'm_whereleft', title: 'Un WHERE sobre la tabla derecha convierte el LEFT JOIN en INNER',
      wrong: { db: EST, sql: `SELECT e.nombre, i.nota_final
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
WHERE i.nota_final >= 4.0;` },
      why: 'Daniel tenía nota_final NULL y NULL >= 4.0 no es verdadero, así que el WHERE lo elimina: el LEFT JOIN ya no conserva a nadie. Si quieres a todos los estudiantes y solo las notas ≥ 4.0, pon la condición en el ON.',
      fix: { db: EST, sql: `SELECT e.nombre, i.nota_final
FROM estudiantes e
LEFT JOIN inscripciones i
  ON e.id_estudiante = i.id_estudiante AND i.nota_final >= 4.0;` } },
    { id: 'm_mixleft', title: 'LEFT JOIN seguido de INNER JOIN',
      wrong: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
INNER JOIN cursos c ON i.id_curso = c.id_curso;` },
      why: 'El LEFT conserva a Daniel con i.id_curso = NULL, pero el INNER JOIN siguiente no encuentra curso para NULL y lo elimina. En una cadena, después de un LEFT usa LEFT.',
      fix: { db: EST, sql: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
LEFT JOIN cursos c ON i.id_curso = c.id_curso;` } },
    { id: 'm_countstar', title: 'COUNT(*) con LEFT JOIN cuenta 1 en vez de 0',
      wrong: { db: EST, sql: `SELECT e.nombre, COUNT(*) AS cursos
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
GROUP BY e.id_estudiante, e.nombre;` },
      why: 'Daniel aparece con 1 curso: COUNT(*) cuenta la fila que el LEFT JOIN creó con NULL. Cuenta una columna de la tabla derecha.',
      fix: { db: EST, sql: `SELECT e.nombre, COUNT(i.id_inscripcion) AS cursos
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
GROUP BY e.id_estudiante, e.nombre;` } },
    { id: 'm_eqnull', title: 'Usar = NULL en vez de IS NULL',
      wrong: { db: EST, sql: `SELECT e.nombre
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
WHERE i.id_inscripcion = NULL;`, rows: 0 },
      why: 'Cualquier comparación con NULL da "desconocido", nunca verdadero: la consulta no devuelve nada y no avisa ningún error.',
      fix: { db: EST, sql: `SELECT e.nombre
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
WHERE i.id_inscripcion IS NULL;` } },
    { id: 'm_groupby', title: 'Columna en el SELECT que no está en el GROUP BY',
      wrong: { db: EST, sql: `SELECT c.nombre_curso, c.docente, COUNT(*) AS inscritos
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso;`, expectError: 'GROUP BY' },
      why: 'docente no está agrupado ni dentro de una función de agregación.',
      fix: { db: EST, sql: `SELECT c.nombre_curso, c.docente, COUNT(*) AS inscritos
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso, c.docente;` } }
  ];

  /* ---------- mini-quiz ---------- */
  const QUIZ = [
    { q: 'Con los datos de clase, ¿cuántas filas devuelve <code>estudiantes e LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante</code>?',
      o: [
        { t: '10', ok: true, why: 'Correcto: 9 inscripciones (cada una con su estudiante) + Daniel, que no tiene inscripciones y sale una vez con NULL.' },
        { t: '9', why: 'Ese es el resultado del INNER JOIN: falta Daniel, que el LEFT JOIN conserva.' },
        { t: '7', why: 'Hay 7 estudiantes, pero los que tienen 2 inscripciones (Carlos, Maria, Juan) aparecen 2 veces.' },
        { t: '63', why: '63 = 7 × 9 sería el producto cartesiano (CROSS JOIN), no un LEFT JOIN.' }] },
    { q: '¿Qué consulta muestra los cursos que no tienen ningún estudiante inscrito?',
      o: [
        { t: 'cursos c LEFT JOIN inscripciones i ON c.id_curso = i.id_curso WHERE i.id_curso IS NULL', ok: true, why: 'Correcto: el LEFT conserva todos los cursos y el IS NULL deja los que no encontraron inscripción.' },
        { t: 'cursos c INNER JOIN inscripciones i ON c.id_curso = i.id_curso WHERE i.id_curso IS NULL', why: 'El INNER JOIN ya eliminó los cursos sin inscripciones, así que el resultado es vacío.' },
        { t: 'cursos c LEFT JOIN inscripciones i ON c.id_curso = i.id_curso WHERE i.id_curso = NULL', why: '= NULL nunca es verdadero; hay que usar IS NULL.' },
        { t: 'cursos c RIGHT JOIN inscripciones i ON c.id_curso = i.id_curso WHERE c.id_curso IS NULL', why: 'Ese RIGHT conserva las inscripciones, no los cursos. Buscaría inscripciones sin curso (no hay ninguna).' }] },
    { q: '<code>A RIGHT JOIN B</code> es equivalente a…',
      o: [
        { t: 'B LEFT JOIN A', ok: true, why: 'Correcto: RIGHT conserva la tabla de la derecha (B); al invertir el orden, B queda a la izquierda de un LEFT JOIN.' },
        { t: 'A LEFT JOIN B', why: 'Ese conserva A, no B.' },
        { t: 'A INNER JOIN B', why: 'INNER no conserva las filas sin pareja de ningún lado.' },
        { t: 'A FULL JOIN B', why: 'FULL conserva ambos lados; RIGHT solo el derecho.' }] },
    { q: 'Si <code>clientes</code> tiene 5 filas y <code>prestamos</code> 3, ¿cuántas filas da <code>clientes CROSS JOIN prestamos</code>?',
      o: [
        { t: '15', ok: true, why: 'Correcto: producto cartesiano, 5 × 3.' },
        { t: '8', why: 'No se suman: cada cliente se combina con cada préstamo.' },
        { t: '3', why: 'Ese sería el INNER JOIN por id_cliente (3 clientes con préstamo).' },
        { t: '5', why: 'Ese sería el LEFT JOIN de clientes con préstamos (cada préstamo es de un cliente distinto).' }] },
    { q: 'La consulta <code>SELECT nombre FROM empleados e JOIN sucursales s ON e.id_sucursal = s.id_sucursal;</code> da error. ¿Por qué?',
      o: [
        { t: 'nombre existe en las dos tablas y es ambigua', ok: true, why: 'Correcto: hay que escribir e.nombre o s.nombre.' },
        { t: 'Falta la palabra INNER', why: 'JOIN a secas ya es INNER JOIN.' },
        { t: 'No se pueden usar alias en un JOIN', why: 'Los alias se usan todo el tiempo en los JOIN.' },
        { t: 'Falta un WHERE', why: 'WHERE es opcional; la condición de unión va en el ON.' }] },
    { q: '¿Dónde va la condición que une las tablas en un JOIN?',
      o: [
        { t: 'En la cláusula ON', ok: true, why: 'Correcto: ON indica qué columnas deben coincidir (normalmente PK = FK).' },
        { t: 'En el GROUP BY', why: 'GROUP BY agrupa filas para las funciones de agregación; no une tablas.' },
        { t: 'En el ORDER BY', why: 'ORDER BY solo ordena el resultado.' },
        { t: 'En el HAVING', why: 'HAVING filtra grupos después del GROUP BY.' }] },
    { q: 'Quieres TODOS los estudiantes y, para cada uno, solo sus notas ≥ 4.0 (los demás con NULL). ¿Dónde pones <code>i.nota_final &gt;= 4.0</code>?',
      o: [
        { t: 'En el ON del LEFT JOIN', ok: true, why: 'Correcto: dentro del ON solo decide con qué filas se empareja; los estudiantes sin pareja siguen saliendo.' },
        { t: 'En el WHERE', why: 'En el WHERE elimina las filas con NULL y el LEFT JOIN se comporta como INNER.' },
        { t: 'En el HAVING', why: 'No hay agrupación; HAVING es para filtrar grupos.' },
        { t: 'Es indiferente', why: 'Con INNER JOIN da igual, pero con LEFT JOIN cambia el resultado.' }] },
    { q: '¿Qué JOIN usas para listar a cada empleado junto al nombre de su supervisor, si ambos están en la tabla empleados?',
      o: [
        { t: 'SELF JOIN: empleados e JOIN empleados s ON e.id_supervisor = s.id_empleado', ok: true, why: 'Correcto: la misma tabla dos veces con alias distintos (relación reflexiva).' },
        { t: 'CROSS JOIN empleados', why: 'Combinaría a todos con todos, sin respetar quién supervisa a quién.' },
        { t: 'FULL JOIN sucursales', why: 'Sucursales no dice quién supervisa a quién.' },
        { t: 'No se puede: hay que crear otra tabla', why: 'Una FK a la misma tabla basta, y se consulta con un SELF JOIN.' }] },
    { q: 'Con los datos de clase, ¿cuántas filas devuelve <code>estudiantes e FULL OUTER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante</code>?',
      o: [
        { t: '10', ok: true, why: 'Correcto: 9 coincidencias + Daniel. No hay inscripciones sin estudiante, así que no se agregan filas con nombre NULL.' },
        { t: '16', why: '7 + 9 = 16 sería contar ambas tablas por separado; FULL JOIN no repite las coincidencias.' },
        { t: '9', why: 'Ese es el INNER JOIN.' },
        { t: '11', why: 'Solo hay un huérfano (Daniel).' }] },
    { q: 'Para unir 4 tablas, ¿cuántas condiciones de unión (ON) necesitas como mínimo?',
      o: [
        { t: '3', ok: true, why: 'Correcto: N tablas → N−1 uniones. Si falta una, esa tabla queda en producto cartesiano.' },
        { t: '4', why: 'La primera tabla (la del FROM) no lleva ON.' },
        { t: '2', why: 'Una tabla quedaría sin unir: producto cartesiano.' },
        { t: '6', why: 'No hace falta unir cada par; basta con un camino que conecte todas.' }] }
  ];

  // Lista plana para tools/verify.js: cada patrón y cada versión (mala y corregida) de los errores.
  const EXAMPLES = [];
  PATTERNS.forEach((p) => EXAMPLES.push({ id: p.id, db: p.db, data: p.data || 'orig', sql: p.sql }));
  MISTAKES.forEach((m) => {
    EXAMPLES.push(Object.assign({ id: m.id + '_mal', data: 'orig' }, m.wrong));
    EXAMPLES.push(Object.assign({ id: m.id + '_bien', data: 'orig' }, m.fix));
  });

  return { DEMO, TYPES, SUMMARY, PATTERNS, MISTAKES, QUIZ, EXAMPLES };
});
