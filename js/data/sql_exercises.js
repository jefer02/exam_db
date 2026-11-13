/* Ejercicios SQL calificados automáticamente (PostgreSQL vía PGlite).
   Campos:
     id, db (id de PRACTICE_DB), data ('orig' = datos del profesor | 'ext' = datos extendidos),
     level ('basico' | 'intermedio' | 'examen'), topic (ver SQL_TOPICS), src ('clase' | 'lab' | 'extra'),
     title, prompt, hint, solution, explain,
     order (opcional): índices de columnas de la solución que deben salir ordenadas (si el enunciado pide ORDER BY),
     check (opcional): consulta que se ejecuta DESPUÉS del código del estudiante (para ejercicios de INSERT/UPDATE/DDL),
     alts (opcional): otras soluciones correctas; tools/verify.js comprueba que el calificador también las acepte.
   Para agregar un ejercicio: copia uno parecido, cambia el id y ejecuta `npm run verify`. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SQL_EXERCISES = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SQL_TOPICS = {
    joins: 'JOINs',
    consultas: 'Consultas (SELECT, WHERE, ORDER BY…)',
    agregacion: 'Agregación (GROUP BY, HAVING)',
    subconsultas: 'Subconsultas',
    ddl: 'DDL (CREATE, ALTER, DROP)',
    dml: 'DML (INSERT, UPDATE, DELETE)'
  };
  const LEVELS = { basico: 'Básico', intermedio: 'Intermedio', examen: 'Tipo examen' };
  const SRC = { clase: 'Visto en clase', lab: 'Laboratorio del curso', extra: 'Práctica extra' };

  const EST = 'bd_estudiantes_joins', BANCO = 'bancodb', BIB = 'biblioteca';
  const L = [];
  const X = (o) => L.push(o);

  /* =============== JOINs de la Sesión 8 (consultas del profesor) =============== */
  X({ id: 'c01', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'Consulta 1 · INNER JOIN de 3 tablas',
    prompt: 'Muestra el nombre de los estudiantes y los cursos en los que están inscritos. Columnas: nombre, nombre_curso.',
    hint: 'estudiantes y cursos no se tocan directamente: pasa por inscripciones (dos INNER JOIN).',
    solution: `SELECT estudiantes.nombre, cursos.nombre_curso
FROM estudiantes
INNER JOIN inscripciones ON estudiantes.id_estudiante = inscripciones.id_estudiante
INNER JOIN cursos ON inscripciones.id_curso = cursos.id_curso;`,
    explain: 'INNER JOIN deja solo las coincidencias. Daniel (sin inscripciones) y "Redes de Computadores" (sin estudiantes) no aparecen. Salen 9 filas: una por inscripción.',
    alts: [`SELECT e.nombre, c.nombre_curso FROM estudiantes e JOIN inscripciones i ON e.id_estudiante = i.id_estudiante JOIN cursos c ON i.id_curso = c.id_curso;`] });
  X({ id: 'c02', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'Consulta 2 · Estudiantes con sus notas',
    prompt: 'Muestra los estudiantes con sus respectivas notas. Columnas: nombre, nota_final.',
    hint: 'Solo necesitas estudiantes e inscripciones, unidas por id_estudiante.',
    solution: `SELECT estudiantes.nombre, inscripciones.nota_final
FROM estudiantes
INNER JOIN inscripciones ON estudiantes.id_estudiante = inscripciones.id_estudiante;`,
    explain: 'Un estudiante inscrito en dos cursos (Carlos, Maria, Juan) aparece dos veces, una por cada nota.' });
  X({ id: 'c03', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'INNER JOIN con alias',
    prompt: 'Muestra estudiantes, cursos y fechas de inscripción usando alias (e, i, c). Columnas: nombre, nombre_curso, fecha_inscripcion.',
    hint: 'FROM estudiantes e INNER JOIN inscripciones i ON … INNER JOIN cursos c ON …',
    solution: `SELECT e.nombre, c.nombre_curso, i.fecha_inscripcion
FROM estudiantes e
INNER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
INNER JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: 'El alias es un nombre corto para la tabla. Una vez que pones alias (estudiantes e), debes usar e.columna, ya no estudiantes.columna.' });
  X({ id: 'c04', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'LEFT JOIN · todos los estudiantes',
    prompt: 'Muestra todos los estudiantes, estén o no inscritos en cursos. Columnas: nombre, nombre_curso.',
    hint: 'La tabla que debe salir completa (estudiantes) va a la IZQUIERDA y se usan dos LEFT JOIN.',
    solution: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
LEFT JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: 'Daniel aparece con nombre_curso = NULL. Si el segundo JOIN fuera INNER, Daniel desaparecería: en una cadena, todos los JOIN después del LEFT deben ser LEFT para conservar las filas sin pareja.' });
  X({ id: 'c05', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'LEFT JOIN · todos los cursos',
    prompt: 'Muestra todos los cursos y sus estudiantes inscritos. Columnas: nombre_curso, nombre.',
    hint: 'Ahora la tabla protagonista es cursos: va primero (izquierda).',
    solution: `SELECT c.nombre_curso, e.nombre
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
LEFT JOIN estudiantes e ON i.id_estudiante = e.id_estudiante;`,
    explain: '"Redes de Computadores" aparece con nombre = NULL porque nadie se inscribió.' });
  X({ id: 'c06', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'RIGHT JOIN · cursos sin estudiantes',
    prompt: 'Muestra todos los cursos, incluso los que no tienen estudiantes, usando RIGHT JOIN desde inscripciones. Columnas: nombre_curso, id_estudiante.',
    hint: 'FROM inscripciones i RIGHT JOIN cursos c ON … (cursos queda a la derecha y sale completa).',
    solution: `SELECT c.nombre_curso, i.id_estudiante
FROM inscripciones i
RIGHT JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: 'RIGHT JOIN conserva todas las filas de la tabla de la derecha (cursos). Es lo mismo que cursos LEFT JOIN inscripciones.',
    alts: [`SELECT c.nombre_curso, i.id_estudiante FROM cursos c LEFT JOIN inscripciones i ON i.id_curso = c.id_curso;`] });
  X({ id: 'c07', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'RIGHT JOIN · inscripciones con nombre',
    prompt: 'Muestra todas las inscripciones y los nombres de los estudiantes. Columnas: nombre, fecha_inscripcion.',
    hint: 'FROM estudiantes e RIGHT JOIN inscripciones i ON …',
    solution: `SELECT e.nombre, i.fecha_inscripcion
FROM estudiantes e
RIGHT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;`,
    explain: 'Todas las inscripciones tienen estudiante, así que aquí el RIGHT JOIN da lo mismo que un INNER JOIN (9 filas). Daniel no sale porque está en la tabla de la izquierda.' });
  X({ id: 'c08', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'clase', title: 'FULL OUTER JOIN',
    prompt: 'Muestra todos los estudiantes y todas las inscripciones, tengan coincidencia o no. Columnas: nombre, id_curso.',
    hint: 'FULL OUTER JOIN = LEFT + RIGHT.',
    solution: `SELECT e.nombre, i.id_curso
FROM estudiantes e
FULL OUTER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante;`,
    explain: 'Salen las 9 coincidencias + Daniel con id_curso NULL. No hay inscripciones sin estudiante, por eso no aparecen filas con nombre NULL.' });

  /* =============== JOINs extra sobre bd_estudiantes_joins =============== */
  X({ id: 'j01', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'Curso y docente de cada inscrito',
    prompt: 'Muestra nombre y apellido del estudiante, el curso y el docente de cada inscripción. Columnas: nombre, apellido, nombre_curso, docente.',
    hint: 'Tres tablas, dos INNER JOIN.',
    solution: `SELECT e.nombre, e.apellido, c.nombre_curso, c.docente
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: 'JOIN a secas es INNER JOIN.' });
  X({ id: 'j02', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'JOIN + WHERE: inscritos en Bases de Datos',
    prompt: 'Muestra el nombre y apellido de los estudiantes inscritos en el curso "Bases de Datos". Columnas: nombre, apellido.',
    hint: 'Une las tres tablas y filtra con WHERE c.nombre_curso = \'Bases de Datos\'.',
    solution: `SELECT e.nombre, e.apellido
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
WHERE c.nombre_curso = 'Bases de Datos';`,
    explain: 'Primero se unen las tablas (FROM/JOIN) y luego WHERE filtra las filas resultantes. Carlos y Maria.',
    alts: [`SELECT e.nombre, e.apellido FROM estudiantes e JOIN inscripciones i ON e.id_estudiante = i.id_estudiante WHERE i.id_curso = 1;`] });
  X({ id: 'j03', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'JOIN + WHERE: estudiantes de Pasto',
    prompt: 'Muestra los estudiantes de Pasto y los cursos que toman. Columnas: nombre, nombre_curso.',
    hint: 'WHERE e.ciudad = \'Pasto\'.',
    solution: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
WHERE e.ciudad = 'Pasto';`,
    explain: 'Daniel también es de Pasto pero no sale: el INNER JOIN lo descarta porque no tiene inscripciones.' });
  X({ id: 'j04', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'CROSS JOIN: todas las combinaciones',
    prompt: 'Genera todas las combinaciones posibles de estudiante y curso (producto cartesiano). Columnas: nombre, nombre_curso.',
    hint: 'CROSS JOIN no lleva ON.',
    solution: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
CROSS JOIN cursos c;`,
    explain: '7 estudiantes × 6 cursos = 42 filas. Es lo que pasa por error cuando olvidas la condición del JOIN (FROM estudiantes, cursos sin WHERE).',
    alts: [`SELECT e.nombre, c.nombre_curso FROM estudiantes e, cursos c;`] });
  X({ id: 'j05', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'Nombre completo con ||',
    prompt: 'Muestra el nombre completo del estudiante ("nombre apellido") en una sola columna llamada estudiante, y el curso. Columnas: estudiante, nombre_curso.',
    hint: "En PostgreSQL se concatena con ||: e.nombre || ' ' || e.apellido AS estudiante.",
    solution: `SELECT e.nombre || ' ' || e.apellido AS estudiante, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: 'AS pone un alias a la columna calculada.',
    alts: [`SELECT CONCAT(e.nombre, ' ', e.apellido) AS estudiante, c.nombre_curso FROM estudiantes e JOIN inscripciones i USING (id_estudiante) JOIN cursos c USING (id_curso);`] });
  X({ id: 'j06', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'Notas bajas, de menor a mayor',
    prompt: 'Muestra estudiante, curso y nota de las inscripciones con nota menor a 4.0, ordenadas de la nota más baja a la más alta. Columnas: nombre, nombre_curso, nota_final.',
    hint: 'WHERE i.nota_final < 4.0 … ORDER BY i.nota_final.',
    solution: `SELECT e.nombre, c.nombre_curso, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
WHERE i.nota_final < 4.0
ORDER BY i.nota_final;`,
    order: [2],
    explain: 'ORDER BY sin ASC/DESC ordena de forma ascendente. Andres 3.5, Juan 3.8, Juan 3.9.' });
  X({ id: 'j07', db: EST, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'Inscripciones por fecha',
    prompt: 'Lista las inscripciones hechas entre el 2025-03-03 y el 2025-03-07 (incluidas) con el nombre del estudiante y del curso, en orden de fecha. Columnas: nombre, nombre_curso, fecha_inscripcion.',
    hint: "BETWEEN '2025-03-03' AND '2025-03-07' incluye los extremos.",
    solution: `SELECT e.nombre, c.nombre_curso, i.fecha_inscripcion
FROM inscripciones i
JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON c.id_curso = i.id_curso
WHERE i.fecha_inscripcion BETWEEN '2025-03-03' AND '2025-03-07'
ORDER BY i.fecha_inscripcion;`,
    order: [2],
    explain: 'El orden de las tablas en un INNER JOIN no cambia el resultado; puedes empezar por inscripciones.' });
  X({ id: 'j08', db: EST, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Estudiantes sin inscripciones (LEFT … IS NULL)',
    prompt: 'Datos extendidos. Muestra el nombre y apellido de los estudiantes que NO están inscritos en ningún curso. Columnas: nombre, apellido.',
    hint: 'LEFT JOIN inscripciones y luego WHERE i.id_inscripcion IS NULL.',
    solution: `SELECT e.nombre, e.apellido
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
WHERE i.id_inscripcion IS NULL;`,
    explain: 'Patrón "anti-join": el LEFT JOIN pone NULL en las columnas de inscripciones cuando no hay pareja; el WHERE … IS NULL se queda solo con esas filas. Resultado: Daniel. Nunca escribas = NULL.',
    alts: [`SELECT nombre, apellido FROM estudiantes WHERE id_estudiante NOT IN (SELECT id_estudiante FROM inscripciones);`,
      `SELECT e.nombre, e.apellido FROM estudiantes e WHERE NOT EXISTS (SELECT 1 FROM inscripciones i WHERE i.id_estudiante = e.id_estudiante);`] });
  X({ id: 'j09', db: EST, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Cursos sin estudiantes',
    prompt: 'Datos extendidos. Muestra los cursos que no tienen ningún estudiante inscrito. Columnas: nombre_curso.',
    hint: 'cursos LEFT JOIN inscripciones … WHERE i.id_curso IS NULL.',
    solution: `SELECT c.nombre_curso
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
WHERE i.id_curso IS NULL;`,
    explain: 'Resultado: Redes de Computadores y Estadistica (este último es un dato extendido).',
    alts: [`SELECT c.nombre_curso FROM inscripciones i RIGHT JOIN cursos c ON c.id_curso = i.id_curso WHERE i.id_inscripcion IS NULL;`] });
  X({ id: 'j10', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Inscritos por curso (incluye ceros)',
    prompt: 'Muestra cada curso con la cantidad de estudiantes inscritos, incluyendo los cursos con 0. Columnas: nombre_curso, inscritos.',
    hint: 'LEFT JOIN + GROUP BY. Cuenta una columna de inscripciones, no COUNT(*).',
    solution: `SELECT c.nombre_curso, COUNT(i.id_inscripcion) AS inscritos
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.id_curso, c.nombre_curso;`,
    explain: 'COUNT(columna) ignora los NULL, por eso Redes da 0. Con COUNT(*) daría 1, porque el LEFT JOIN produce una fila (con NULL) para ese curso. Error típico de examen.' });
  X({ id: 'j11', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Promedio de nota por curso',
    prompt: 'Muestra el promedio de nota final de cada curso que tenga inscritos, redondeado a 2 decimales. Columnas: nombre_curso, promedio.',
    hint: 'JOIN + GROUP BY c.nombre_curso + ROUND(AVG(i.nota_final), 2).',
    solution: `SELECT c.nombre_curso, ROUND(AVG(i.nota_final), 2) AS promedio
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso;`,
    explain: 'Todas las columnas del SELECT que no son funciones de agregación deben ir en el GROUP BY.' });
  X({ id: 'j12', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Cursos con más de un estudiante',
    prompt: 'Muestra los cursos que tienen más de 1 estudiante inscrito y cuántos tienen. Columnas: nombre_curso, cantidad.',
    hint: 'Filtrar grupos = HAVING COUNT(*) > 1.',
    solution: `SELECT c.nombre_curso, COUNT(*) AS cantidad
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso
HAVING COUNT(*) > 1;`,
    explain: 'WHERE filtra filas antes de agrupar; HAVING filtra grupos después. Bases de Datos, Inteligencia Artificial, Programacion Python y Mineria de Datos tienen 2.' });
  X({ id: 'j13', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Estudiantes con más de un curso',
    prompt: 'Muestra los estudiantes inscritos en más de un curso y en cuántos. Columnas: nombre, cursos.',
    hint: 'Agrupa por estudiante (id y nombre) y usa HAVING.',
    solution: `SELECT e.nombre, COUNT(*) AS cursos
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
GROUP BY e.id_estudiante, e.nombre
HAVING COUNT(*) > 1;`,
    explain: 'Agrupar también por la PK evita mezclar dos estudiantes que se llamen igual. Carlos, Maria y Juan.' });
  X({ id: 'j14', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Cursos por estudiante, de mayor a menor',
    prompt: 'Muestra todos los estudiantes (también los que no tienen cursos) con la cantidad de cursos que toman, ordenado de mayor a menor cantidad. Columnas: nombre, cantidad.',
    hint: 'LEFT JOIN + COUNT(i.id_curso) + ORDER BY cantidad DESC.',
    solution: `SELECT e.nombre, COUNT(i.id_curso) AS cantidad
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
GROUP BY e.id_estudiante, e.nombre
ORDER BY cantidad DESC;`,
    order: [1],
    explain: 'Daniel aparece con 0 al final. En ORDER BY puedes usar el alias de la columna.' });
  X({ id: 'j15', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Inscripciones por ciudad',
    prompt: 'Muestra cuántas inscripciones hay por ciudad de los estudiantes. Columnas: ciudad, inscripciones.',
    hint: 'JOIN estudiantes–inscripciones y GROUP BY e.ciudad.',
    solution: `SELECT e.ciudad, COUNT(*) AS inscripciones
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
GROUP BY e.ciudad;`,
    explain: 'Pasto 4, Cali 3, Bogota 1, Popayan 1.' });
  X({ id: 'j16', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Horas totales por estudiante',
    prompt: 'Muestra el total de horas (suma de la duración de sus cursos) de cada estudiante inscrito. Columnas: nombre, horas.',
    hint: 'Tres tablas + SUM(c.duracion) + GROUP BY.',
    solution: `SELECT e.nombre, SUM(c.duracion) AS horas
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
GROUP BY e.id_estudiante, e.nombre;`,
    explain: 'Carlos: 48 + 48 = 96 horas.' });
  X({ id: 'j17', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Nota máxima y mínima por curso',
    prompt: 'Para cada curso con inscritos muestra su docente, la nota máxima y la mínima. Columnas: nombre_curso, docente, maxima, minima.',
    hint: 'Agrupa por nombre_curso y docente.',
    solution: `SELECT c.nombre_curso, c.docente, MAX(i.nota_final) AS maxima, MIN(i.nota_final) AS minima
FROM cursos c
JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso, c.docente;`,
    explain: 'Puedes usar varias funciones de agregación en el mismo SELECT.' });
  X({ id: 'j18', db: EST, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Docentes y estudiantes distintos',
    prompt: 'Muestra cada docente con la cantidad de estudiantes distintos que tiene, incluidos los docentes con 0. Columnas: docente, estudiantes.',
    hint: 'LEFT JOIN + COUNT(DISTINCT i.id_estudiante).',
    solution: `SELECT c.docente, COUNT(DISTINCT i.id_estudiante) AS estudiantes
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.docente;`,
    explain: 'COUNT(DISTINCT x) cuenta valores diferentes y no cuenta NULL. Pedro Ruiz tiene 0.' });
  X({ id: 'j19', db: EST, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'La nota más alta',
    prompt: 'Muestra el estudiante, el curso y la nota de la inscripción con la nota más alta. Columnas: nombre, nombre_curso, nota_final.',
    hint: 'WHERE i.nota_final = (SELECT MAX(nota_final) FROM inscripciones).',
    solution: `SELECT e.nombre, c.nombre_curso, i.nota_final
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
WHERE i.nota_final = (SELECT MAX(nota_final) FROM inscripciones);`,
    explain: 'La subconsulta calcula 4.8 y el WHERE compara cada fila con ese valor. Con ORDER BY nota_final DESC LIMIT 1 también funciona, pero si hubiera empate solo mostraría uno.',
    alts: [`SELECT e.nombre, c.nombre_curso, i.nota_final FROM estudiantes e JOIN inscripciones i ON e.id_estudiante = i.id_estudiante JOIN cursos c ON i.id_curso = c.id_curso ORDER BY i.nota_final DESC LIMIT 1;`] });
  X({ id: 'j20', db: EST, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'SELF JOIN: compañeros de ciudad',
    prompt: 'Datos extendidos. Muestra las parejas de estudiantes que viven en la misma ciudad, sin repetir parejas ni emparejar a alguien consigo mismo. Columnas: estudiante1, estudiante2, ciudad.',
    hint: 'Une estudiantes consigo misma (e1, e2) con ON e1.ciudad = e2.ciudad AND e1.id_estudiante < e2.id_estudiante.',
    solution: `SELECT e1.nombre AS estudiante1, e2.nombre AS estudiante2, e1.ciudad
FROM estudiantes e1
JOIN estudiantes e2 ON e1.ciudad = e2.ciudad AND e1.id_estudiante < e2.id_estudiante;`,
    explain: 'SELF JOIN = la misma tabla dos veces con alias distintos. El "<" evita (Carlos, Carlos) y evita repetir (Juan, Carlos) cuando ya está (Carlos, Juan). Pasto da 3 parejas y Cali (con Valentina) otras 3.' });
  X({ id: 'j21', db: EST, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'FULL JOIN de 3 tablas',
    prompt: 'Datos extendidos. Muestra todos los estudiantes y todos los cursos: los estudiantes sin curso deben salir con curso NULL y los cursos sin estudiantes con nombre NULL. Columnas: nombre, nombre_curso.',
    hint: 'FULL OUTER JOIN dos veces: estudiantes → inscripciones → cursos.',
    solution: `SELECT e.nombre, c.nombre_curso
FROM estudiantes e
FULL OUTER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
FULL OUTER JOIN cursos c ON i.id_curso = c.id_curso;`,
    explain: '10 coincidencias + Daniel (curso NULL) + Redes y Estadistica (nombre NULL) = 13 filas.' });
  X({ id: 'j22', db: EST, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Condición en el ON vs en el WHERE',
    prompt: 'Datos extendidos. Muestra los estudiantes que NO están inscritos en "Bases de Datos" (los que no tienen ningún curso también cuentan). Columnas: nombre, apellido.',
    hint: 'LEFT JOIN con la condición del curso DENTRO del ON (AND i.id_curso = 1) y luego WHERE i.id_inscripcion IS NULL.',
    solution: `SELECT e.nombre, e.apellido
FROM estudiantes e
LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante AND i.id_curso = 1
WHERE i.id_inscripcion IS NULL;`,
    explain: 'Si pones i.id_curso = 1 en el WHERE, el LEFT JOIN se vuelve INNER. Dentro del ON, solo limita con qué filas se empareja. Salen todos excepto Carlos y Maria.',
    alts: [`SELECT nombre, apellido FROM estudiantes WHERE id_estudiante NOT IN (SELECT i.id_estudiante FROM inscripciones i JOIN cursos c ON c.id_curso = i.id_curso WHERE c.nombre_curso = 'Bases de Datos');`] });
  X({ id: 'j23', db: EST, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'Notas por encima del promedio de su curso',
    prompt: 'Muestra estudiante, curso y nota de las inscripciones cuya nota supera el promedio de SU curso. Columnas: nombre, nombre_curso, nota_final.',
    hint: 'Subconsulta correlacionada: (SELECT AVG(i2.nota_final) FROM inscripciones i2 WHERE i2.id_curso = i.id_curso).',
    solution: `SELECT e.nombre, c.nombre_curso, i.nota_final
FROM inscripciones i
JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON c.id_curso = i.id_curso
WHERE i.nota_final > (SELECT AVG(i2.nota_final) FROM inscripciones i2 WHERE i2.id_curso = i.id_curso);`,
    explain: 'La subconsulta se recalcula para cada fila de la consulta externa (usa i.id_curso). Cursos con un solo inscrito nunca cumplen: nadie supera su propio promedio.' });
  X({ id: 'j24', db: EST, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Promedio por curso con NULL',
    prompt: 'Datos extendidos. Para TODOS los cursos muestra cuántas inscripciones tiene y cuántas ya tienen nota (no NULL). Columnas: nombre_curso, inscripciones, con_nota.',
    hint: 'LEFT JOIN; COUNT(i.id_inscripcion) y COUNT(i.nota_final).',
    solution: `SELECT c.nombre_curso, COUNT(i.id_inscripcion) AS inscripciones, COUNT(i.nota_final) AS con_nota
FROM cursos c
LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
GROUP BY c.id_curso, c.nombre_curso;`,
    explain: 'COUNT(columna) no cuenta NULL: Desarrollo Web tiene 2 inscripciones pero solo 1 con nota (Valentina tiene nota NULL).' });

  /* =============== Laboratorio final · bancodb (19 consultas del enunciado) =============== */
  X({ id: 'b01', db: BANCO, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab final 1 · Clientes ordenados por ciudad',
    prompt: 'Muestra nombre, apellido y ciudad de los clientes ordenados por ciudad. Columnas: nombre, apellido, ciudad.',
    hint: 'ORDER BY ciudad.', solution: `SELECT nombre, apellido, ciudad FROM clientes ORDER BY ciudad;`, order: [2],
    explain: 'ORDER BY va siempre al final. ASC es el valor por defecto.' });
  X({ id: 'b02', db: BANCO, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab final 2 · Saldo superior a 5 millones',
    prompt: 'Muestra las cuentas con saldo superior a 5 millones. Columnas: numero_cuenta, saldo.',
    hint: 'WHERE saldo > 5000000 (sin puntos de miles).', solution: `SELECT numero_cuenta, saldo FROM cuentas WHERE saldo > 5000000;`,
    explain: '"Superior a" es > (estricto): la cuenta 20001 tiene exactamente 5.000.000 y no sale.' });
  X({ id: 'b03', db: BANCO, data: 'orig', level: 'basico', topic: 'agregacion', src: 'lab', title: 'Lab final 3 · Total de clientes',
    prompt: 'Muestra el total de clientes registrados. Columna: total_clientes.',
    hint: 'COUNT(*).', solution: `SELECT COUNT(*) AS total_clientes FROM clientes;`, explain: 'COUNT(*) cuenta filas: 5.' });
  X({ id: 'b04', db: BANCO, data: 'orig', level: 'basico', topic: 'agregacion', src: 'lab', title: 'Lab final 4 · Salario promedio',
    prompt: 'Muestra el salario promedio de los empleados. Columna: salario_promedio.',
    hint: 'AVG(salario).', solution: `SELECT AVG(salario) AS salario_promedio FROM empleados;`,
    explain: '(8.500.000 + 3.500.000 + 2.800.000 + 4.200.000) / 4 = 4.750.000.' });
  X({ id: 'b05', db: BANCO, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab final 5 · Clientes con su número de cuenta',
    prompt: 'Muestra los clientes con su número de cuenta. Columnas: nombre, apellido, numero_cuenta.',
    hint: 'clientes JOIN cuentas ON id_cliente.',
    solution: `SELECT cl.nombre, cl.apellido, cu.numero_cuenta
FROM clientes cl
INNER JOIN cuentas cu ON cl.id_cliente = cu.id_cliente;`,
    explain: 'La FK cuentas.id_cliente apunta a clientes.id_cliente: esa es la condición del ON.' });
  X({ id: 'b06', db: BANCO, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab final 6 · Clientes y tipo de cuenta',
    prompt: 'Muestra los clientes y el tipo de cuenta que poseen. Columnas: nombre, apellido, descripcion.',
    hint: 'clientes → cuentas → tipos_cuenta (dos JOIN).',
    solution: `SELECT cl.nombre, cl.apellido, t.descripcion
FROM clientes cl
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
JOIN tipos_cuenta t ON cu.id_tipo = t.id_tipo;`,
    explain: 'La tabla del medio (cuentas) tiene las dos FK: id_cliente e id_tipo.' });
  X({ id: 'b07', db: BANCO, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab final 7 · Empleados y su sucursal',
    prompt: 'Muestra los empleados y la sucursal donde trabajan. Columnas: empleado, sucursal (nombre del empleado y nombre de la sucursal).',
    hint: 'Ambas tablas tienen una columna "nombre": usa alias de tabla y de columna.',
    solution: `SELECT e.nombre AS empleado, s.nombre AS sucursal
FROM empleados e
JOIN sucursales s ON e.id_sucursal = s.id_sucursal;`,
    explain: 'Si escribes solo "nombre" PostgreSQL responde: column reference "nombre" is ambiguous.' });
  X({ id: 'b08', db: BANCO, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab final 8 · Clientes con préstamos',
    prompt: 'Muestra los clientes con préstamos y el valor del préstamo. Columnas: nombre, apellido, monto.',
    hint: 'clientes JOIN prestamos.',
    solution: `SELECT cl.nombre, cl.apellido, p.monto
FROM clientes cl
JOIN prestamos p ON cl.id_cliente = p.id_cliente;`,
    explain: 'INNER JOIN deja fuera a Laura y Camila, que no tienen préstamos.' });
  X({ id: 'b09', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab final 9 · Transacciones de cada cliente',
    prompt: 'Muestra todas las transacciones de cada cliente. Columnas: nombre, apellido, numero_cuenta, tipo, monto.',
    hint: 'clientes → cuentas → transacciones.',
    solution: `SELECT cl.nombre, cl.apellido, cu.numero_cuenta, t.tipo, t.monto
FROM clientes cl
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
JOIN transacciones t ON cu.id_cuenta = t.id_cuenta;`,
    explain: 'Las transacciones no tienen id_cliente: se llega al cliente a través de la cuenta.' });
  X({ id: 'b10', db: BANCO, data: 'orig', level: 'basico', topic: 'agregacion', src: 'lab', title: 'Lab final 10 · Clientes por ciudad',
    prompt: 'Muestra cuántos clientes hay por ciudad. Columnas: ciudad, cantidad.',
    hint: 'GROUP BY ciudad.', solution: `SELECT ciudad, COUNT(*) AS cantidad FROM clientes GROUP BY ciudad;`,
    explain: 'Bogotá 2; Cali, Medellín y Pasto 1.' });
  X({ id: 'b11', db: BANCO, data: 'orig', level: 'basico', topic: 'agregacion', src: 'lab', title: 'Lab final 11 · Monto por tipo de transacción',
    prompt: 'Muestra el monto total por tipo de transacción. Columnas: tipo, total.',
    hint: 'SUM(monto) … GROUP BY tipo.', solution: `SELECT tipo, SUM(monto) AS total FROM transacciones GROUP BY tipo;`,
    explain: 'Deposito 2.800.000, Retiro 550.000, Transferencia 1.000.000.' });
  X({ id: 'b12', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab final 12 · Saldo promedio por tipo de cuenta',
    prompt: 'Muestra el saldo promedio por tipo de cuenta. Columnas: descripcion, saldo_promedio.',
    hint: 'cuentas JOIN tipos_cuenta + GROUP BY descripcion.',
    solution: `SELECT t.descripcion, AVG(c.saldo) AS saldo_promedio
FROM cuentas c
JOIN tipos_cuenta t ON c.id_tipo = t.id_tipo
GROUP BY t.descripcion;`,
    explain: 'Ahorros: (5.000.000 + 9.500.000 + 15.000.000) / 3 ≈ 9.833.333,33. Corriente: 1.025.000.' });
  X({ id: 'b13', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab final 13 · Empleados por sucursal',
    prompt: 'Muestra cuántos empleados tiene cada sucursal. Columnas: sucursal, empleados.',
    hint: 'sucursales JOIN empleados + GROUP BY.',
    solution: `SELECT s.nombre AS sucursal, COUNT(e.id_empleado) AS empleados
FROM sucursales s
LEFT JOIN empleados e ON s.id_sucursal = e.id_sucursal
GROUP BY s.id_sucursal, s.nombre;`,
    explain: 'Con los datos originales INNER y LEFT dan lo mismo (todas las sucursales tienen empleados). LEFT es más seguro: mostraría 0 para una sucursal sin empleados.',
    alts: [`SELECT s.nombre, COUNT(*) FROM empleados e JOIN sucursales s ON e.id_sucursal = s.id_sucursal GROUP BY s.nombre;`] });
  X({ id: 'b14', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab final 14 · Saldo total por ciudad',
    prompt: 'Muestra el saldo total de las cuentas agrupado por ciudad del cliente. Columnas: ciudad, saldo_total.',
    hint: 'clientes JOIN cuentas + SUM(saldo) + GROUP BY ciudad.',
    solution: `SELECT cl.ciudad, SUM(cu.saldo) AS saldo_total
FROM clientes cl
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
GROUP BY cl.ciudad;`,
    explain: 'Bogotá suma las cuentas de Juan y Camila: 20.000.000.' });
  X({ id: 'b15', db: BANCO, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab final 15 · Clientes que poseen préstamos (WHERE)',
    prompt: 'Muestra los clientes que poseen préstamos usando WHERE (sin JOIN). Columnas: nombre, apellido.',
    hint: 'WHERE id_cliente IN (SELECT id_cliente FROM prestamos).',
    solution: `SELECT nombre, apellido FROM clientes
WHERE id_cliente IN (SELECT id_cliente FROM prestamos);`,
    explain: 'IN compara contra la lista que devuelve la subconsulta. Con JOIN un cliente con 2 préstamos saldría 2 veces; con IN sale una vez.',
    alts: [`SELECT c.nombre, c.apellido FROM clientes c WHERE EXISTS (SELECT 1 FROM prestamos p WHERE p.id_cliente = c.id_cliente);`] });
  X({ id: 'b16', db: BANCO, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab final 16 · Saldo superior al promedio',
    prompt: 'Muestra las cuentas con saldo superior al promedio general. Columnas: numero_cuenta, saldo.',
    hint: 'WHERE saldo > (SELECT AVG(saldo) FROM cuentas).',
    solution: `SELECT numero_cuenta, saldo FROM cuentas
WHERE saldo > (SELECT AVG(saldo) FROM cuentas);`,
    explain: 'No se puede escribir WHERE saldo > AVG(saldo): las funciones de agregación no van en el WHERE. El promedio (6.310.000) se calcula en una subconsulta.' });
  X({ id: 'b17', db: BANCO, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab final 17 · Empleado con el salario más alto',
    prompt: 'Muestra el empleado con el salario más alto. Columnas: nombre, salario.',
    hint: 'WHERE salario = (SELECT MAX(salario) FROM empleados).',
    solution: `SELECT nombre, salario FROM empleados
WHERE salario = (SELECT MAX(salario) FROM empleados);`,
    explain: 'Carlos Pérez, 8.500.000.',
    alts: [`SELECT nombre, salario FROM empleados ORDER BY salario DESC LIMIT 1;`] });
  X({ id: 'b18', db: BANCO, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab final 18 · Clientes sin préstamos',
    prompt: 'Muestra los clientes que NO poseen préstamos. Columnas: nombre, apellido.',
    hint: 'NOT IN (SELECT id_cliente FROM prestamos), o LEFT JOIN … IS NULL.',
    solution: `SELECT nombre, apellido FROM clientes
WHERE id_cliente NOT IN (SELECT id_cliente FROM prestamos);`,
    explain: 'Laura y Camila. Ojo: si la subconsulta devolviera algún NULL, NOT IN no devolvería nada; NOT EXISTS o LEFT JOIN … IS NULL no tienen ese problema.',
    alts: [`SELECT c.nombre, c.apellido FROM clientes c LEFT JOIN prestamos p ON c.id_cliente = p.id_cliente WHERE p.id_prestamo IS NULL;`] });
  X({ id: 'b19', db: BANCO, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab final 19 · Cuenta con el menor saldo',
    prompt: 'Muestra la cuenta con el menor saldo. Columnas: numero_cuenta, saldo.',
    hint: 'WHERE saldo = (SELECT MIN(saldo) FROM cuentas).',
    solution: `SELECT numero_cuenta, saldo FROM cuentas
WHERE saldo = (SELECT MIN(saldo) FROM cuentas);`,
    explain: 'La cuenta 20004 con 850.000.',
    alts: [`SELECT numero_cuenta, saldo FROM cuentas ORDER BY saldo ASC LIMIT 1;`] });

  /* =============== JOINs extra sobre bancodb =============== */
  X({ id: 'x01', db: BANCO, data: 'orig', level: 'basico', topic: 'joins', src: 'extra', title: 'Cuentas bloqueadas y su dueño',
    prompt: 'Muestra el nombre y apellido del cliente, el número de cuenta y el saldo de las cuentas en estado "Bloqueada". Columnas: nombre, apellido, numero_cuenta, saldo.',
    hint: "JOIN + WHERE cu.estado = 'Bloqueada'.",
    solution: `SELECT cl.nombre, cl.apellido, cu.numero_cuenta, cu.saldo
FROM clientes cl
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
WHERE cu.estado = 'Bloqueada';`,
    explain: 'Los textos van entre comillas simples y distinguen mayúsculas: "bloqueada" no encontraría nada (usa ILIKE si no quieres distinguir).' });
  X({ id: 'x02', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'JOIN por una columna que no es FK',
    prompt: 'Muestra los clientes que viven en una ciudad donde hay una sucursal del banco, junto con esa sucursal. Columnas: nombre, apellido, sucursal.',
    hint: 'La condición del ON no tiene que ser una FK: cl.ciudad = s.ciudad.',
    solution: `SELECT cl.nombre, cl.apellido, s.nombre AS sucursal
FROM clientes cl
JOIN sucursales s ON cl.ciudad = s.ciudad;`,
    explain: 'Se puede unir por cualquier par de columnas del mismo tipo. Laura (Pasto) no sale porque en los datos originales no hay sucursal en Pasto.' });
  X({ id: 'x03', db: BANCO, data: 'orig', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Préstamo y cuenta de cada cliente',
    prompt: 'Para los clientes con préstamo, muestra el monto del préstamo y su número de cuenta. Columnas: nombre, monto, numero_cuenta.',
    hint: 'prestamos → clientes → cuentas.',
    solution: `SELECT cl.nombre, p.monto, cu.numero_cuenta
FROM prestamos p
JOIN clientes cl ON p.id_cliente = cl.id_cliente
JOIN cuentas cu ON cu.id_cliente = cl.id_cliente;`,
    explain: 'Dos tablas "hijas" (prestamos y cuentas) se unen a través de la tabla "padre" (clientes).' });
  X({ id: 'x04', db: BANCO, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'Total depositado por cliente',
    prompt: 'Muestra cuánto ha depositado en total cada cliente (solo transacciones de tipo "Deposito"), de mayor a menor. Columnas: nombre, apellido, total_depositos.',
    hint: "3 tablas + WHERE t.tipo = 'Deposito' + GROUP BY + ORDER BY … DESC.",
    solution: `SELECT cl.nombre, cl.apellido, SUM(t.monto) AS total_depositos
FROM clientes cl
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
JOIN transacciones t ON cu.id_cuenta = t.id_cuenta
WHERE t.tipo = 'Deposito'
GROUP BY cl.id_cliente, cl.nombre, cl.apellido
ORDER BY total_depositos DESC;`,
    order: [2],
    explain: 'Orden de ejecución: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Camila 1.500.000, Pedro 800.000, Juan 500.000.' });
  X({ id: 'x05', db: BANCO, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'JOIN de 4 tablas',
    prompt: 'Muestra los clientes que tienen un préstamo Y una cuenta de Ahorros, con el monto del préstamo y el saldo de esa cuenta. Columnas: nombre, apellido, monto, saldo.',
    hint: 'clientes, prestamos, cuentas y tipos_cuenta + WHERE t.descripcion = \'Ahorros\'.',
    solution: `SELECT cl.nombre, cl.apellido, p.monto, cu.saldo
FROM clientes cl
JOIN prestamos p ON cl.id_cliente = p.id_cliente
JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
JOIN tipos_cuenta t ON cu.id_tipo = t.id_tipo
WHERE t.descripcion = 'Ahorros';`,
    explain: 'Con N tablas necesitas N−1 condiciones de unión. Juan y Pedro.' });
  X({ id: 'x06', db: BANCO, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'Sucursales con más de un empleado',
    prompt: 'Muestra las sucursales con más de un empleado, con su nómina total y su salario promedio. Columnas: sucursal, nomina, promedio.',
    hint: 'JOIN + GROUP BY + HAVING COUNT(*) > 1.',
    solution: `SELECT s.nombre AS sucursal, SUM(e.salario) AS nomina, AVG(e.salario) AS promedio
FROM sucursales s
JOIN empleados e ON s.id_sucursal = e.id_sucursal
GROUP BY s.id_sucursal, s.nombre
HAVING COUNT(*) > 1;`,
    explain: 'Solo la Sucursal Centro (Carlos y Ana): nómina 12.000.000, promedio 6.000.000.' });
  X({ id: 'x07', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'SELF JOIN: empleado y supervisor',
    prompt: 'Datos extendidos. Muestra cada empleado que tiene supervisor junto al nombre de su supervisor. Columnas: empleado, supervisor.',
    hint: 'empleados e JOIN empleados s ON e.id_supervisor = s.id_empleado.',
    solution: `SELECT e.nombre AS empleado, s.nombre AS supervisor
FROM empleados e
JOIN empleados s ON e.id_supervisor = s.id_empleado;`,
    explain: 'Es la relación reflexiva "Empleado supervisa Empleado" del modelo E/R, implementada con una FK a la misma tabla. Carlos (gerente) no aparece porque su id_supervisor es NULL.' });
  X({ id: 'x08', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'SELF LEFT JOIN: todos los empleados',
    prompt: 'Datos extendidos. Muestra TODOS los empleados con su supervisor (NULL si no tienen). Columnas: empleado, cargo, supervisor.',
    hint: 'Igual que el anterior pero con LEFT JOIN.',
    solution: `SELECT e.nombre AS empleado, e.cargo, s.nombre AS supervisor
FROM empleados e
LEFT JOIN empleados s ON e.id_supervisor = s.id_empleado;`,
    explain: 'Carlos Pérez sale con supervisor NULL.' });
  X({ id: 'x09', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'SELF JOIN: misma sucursal que el supervisor',
    prompt: 'Datos extendidos. Muestra los empleados que trabajan en la misma sucursal que su supervisor. Columnas: empleado, supervisor, sucursal.',
    hint: 'Self join de empleados + JOIN sucursales + WHERE e.id_sucursal = s.id_sucursal.',
    solution: `SELECT e.nombre AS empleado, s.nombre AS supervisor, su.nombre AS sucursal
FROM empleados e
JOIN empleados s ON e.id_supervisor = s.id_empleado
JOIN sucursales su ON e.id_sucursal = su.id_sucursal
WHERE e.id_sucursal = s.id_sucursal;`,
    explain: 'Ana (Centro, supervisada por Carlos) y Jorge (Sur, supervisado por Martha).' });
  X({ id: 'x10', db: BANCO, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Sucursales sin empleados',
    prompt: 'Datos extendidos. Muestra las sucursales que no tienen empleados. Columnas: nombre, ciudad.',
    hint: 'LEFT JOIN empleados … WHERE e.id_empleado IS NULL.',
    solution: `SELECT s.nombre, s.ciudad
FROM sucursales s
LEFT JOIN empleados e ON s.id_sucursal = e.id_sucursal
WHERE e.id_empleado IS NULL;`,
    explain: 'Sucursal Pasto.' });
  X({ id: 'x11', db: BANCO, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Cuentas sin transacciones',
    prompt: 'Datos extendidos. Muestra las cuentas que no tienen ninguna transacción. Columnas: numero_cuenta, saldo.',
    hint: 'cuentas LEFT JOIN transacciones … IS NULL.',
    solution: `SELECT cu.numero_cuenta, cu.saldo
FROM cuentas cu
LEFT JOIN transacciones t ON cu.id_cuenta = t.id_cuenta
WHERE t.id_transaccion IS NULL;`,
    explain: 'La cuenta 20006.' });
  X({ id: 'x12', db: BANCO, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Clientes sin cuenta',
    prompt: 'Datos extendidos. Muestra los clientes que no tienen ninguna cuenta. Columnas: nombre, apellido.',
    hint: 'clientes LEFT JOIN cuentas … IS NULL.',
    solution: `SELECT cl.nombre, cl.apellido
FROM clientes cl
LEFT JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
WHERE cu.id_cuenta IS NULL;`,
    explain: 'Andrés Castro.' });
  X({ id: 'x13', db: BANCO, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'RIGHT JOIN: tipos de cuenta sin cuentas',
    prompt: 'Datos extendidos. Usando RIGHT JOIN desde cuentas, muestra los tipos de cuenta que nadie tiene. Columnas: descripcion.',
    hint: 'FROM cuentas cu RIGHT JOIN tipos_cuenta t ON … WHERE cu.id_cuenta IS NULL.',
    solution: `SELECT t.descripcion
FROM cuentas cu
RIGHT JOIN tipos_cuenta t ON cu.id_tipo = t.id_tipo
WHERE cu.id_cuenta IS NULL;`,
    explain: 'CDT.' });
  X({ id: 'x14', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Cuentas por tipo (incluye ceros)',
    prompt: 'Datos extendidos. Muestra cada tipo de cuenta con cuántas cuentas tiene, incluidos los tipos sin cuentas. Columnas: descripcion, cuentas.',
    hint: 'LEFT JOIN + COUNT(cu.id_cuenta).',
    solution: `SELECT t.descripcion, COUNT(cu.id_cuenta) AS cuentas
FROM tipos_cuenta t
LEFT JOIN cuentas cu ON t.id_tipo = cu.id_tipo
GROUP BY t.id_tipo, t.descripcion;`,
    explain: 'Ahorros 4, Corriente 2, CDT 0. Con COUNT(*) el CDT daría 1 (error típico).' });
  X({ id: 'x15', db: BANCO, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'FULL JOIN clientes y préstamos',
    prompt: 'Datos extendidos. Muestra todos los clientes y todos los préstamos, tengan pareja o no. Columnas: nombre, monto.',
    hint: 'FULL OUTER JOIN.',
    solution: `SELECT cl.nombre, p.monto
FROM clientes cl
FULL OUTER JOIN prestamos p ON cl.id_cliente = p.id_cliente;`,
    explain: 'Laura, Camila y Andrés salen con monto NULL. Como todos los préstamos tienen cliente, no hay filas con nombre NULL.' });
  X({ id: 'x16', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Resumen por cliente con COALESCE',
    prompt: 'Datos extendidos. Para TODOS los clientes muestra cuántas cuentas tienen y su saldo total (0 si no tienen cuentas). Columnas: nombre, apellido, cuentas, saldo_total.',
    hint: 'LEFT JOIN + COUNT(cu.id_cuenta) + COALESCE(SUM(cu.saldo), 0).',
    solution: `SELECT cl.nombre, cl.apellido, COUNT(cu.id_cuenta) AS cuentas, COALESCE(SUM(cu.saldo), 0) AS saldo_total
FROM clientes cl
LEFT JOIN cuentas cu ON cl.id_cliente = cu.id_cliente
GROUP BY cl.id_cliente, cl.nombre, cl.apellido;`,
    explain: 'SUM de puros NULL da NULL; COALESCE lo cambia por 0. María tiene 2 cuentas (1.500.000) y Andrés 0.' });
  X({ id: 'x17', db: BANCO, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Sucursal, empleado y supervisor',
    prompt: 'Datos extendidos. Muestra para cada empleado su sucursal y su supervisor (NULL si no tiene), ordenado por sucursal. Columnas: sucursal, empleado, supervisor.',
    hint: 'JOIN sucursales + LEFT JOIN empleados (self) + ORDER BY.',
    solution: `SELECT su.nombre AS sucursal, e.nombre AS empleado, s.nombre AS supervisor
FROM empleados e
JOIN sucursales su ON e.id_sucursal = su.id_sucursal
LEFT JOIN empleados s ON e.id_supervisor = s.id_empleado
ORDER BY su.nombre;`,
    order: [0],
    explain: 'Puedes mezclar INNER y LEFT en la misma consulta: cada JOIN decide qué pasa con las filas sin pareja en ese paso.' });

  /* =============== Laboratorio · biblioteca =============== */
  X({ id: 'l01', db: BIB, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Libros y autores',
    prompt: 'Lista los libros con su autor. Columnas: titulo, nombre.',
    hint: 'libros JOIN autores ON id_autor.',
    solution: `SELECT l.titulo, a.nombre
FROM libros l
JOIN autores a ON l.id_autor = a.id_autor;`,
    explain: '5 libros, cada uno con su autor.' });
  X({ id: 'l02', db: BIB, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Autor de "Cien años de soledad"',
    prompt: 'Muestra el autor del libro "Cien años de soledad". Columna: nombre.',
    hint: "JOIN + WHERE l.titulo = 'Cien años de soledad'.",
    solution: `SELECT a.nombre
FROM libros l
JOIN autores a ON l.id_autor = a.id_autor
WHERE l.titulo = 'Cien años de soledad';`,
    explain: 'Gabriel García Márquez.' });
  X({ id: 'l03', db: BIB, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Libros de García Márquez',
    prompt: 'Muestra los libros del autor "Gabriel García Márquez". Columna: titulo.',
    hint: 'JOIN + WHERE a.nombre = …',
    solution: `SELECT l.titulo
FROM libros l
JOIN autores a ON l.id_autor = a.id_autor
WHERE a.nombre = 'Gabriel García Márquez';`,
    explain: 'Cien años de soledad y El amor en los tiempos del cólera.' });
  X({ id: 'l04', db: BIB, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Usuarios con préstamos',
    prompt: 'Muestra (sin repetir) los usuarios que tienen o han tenido préstamos. Columna: nombre.',
    hint: 'JOIN + DISTINCT.',
    solution: `SELECT DISTINCT u.nombre
FROM usuarios u
JOIN prestamos p ON u.id_usuario = p.id_usuario;`,
    explain: 'Carlos tiene 2 préstamos: sin DISTINCT saldría dos veces.' });
  X({ id: 'l05', db: BIB, data: 'orig', level: 'basico', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Libros prestados',
    prompt: 'Muestra (sin repetir) los títulos de los libros que se han prestado alguna vez. Columna: titulo.',
    hint: 'libros JOIN prestamos + DISTINCT.',
    solution: `SELECT DISTINCT l.titulo
FROM libros l
JOIN prestamos p ON l.id_libro = p.id_libro;`,
    explain: '4 libros prestados.' });
  X({ id: 'l06', db: BIB, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Libros nunca prestados',
    prompt: 'Muestra los libros que nunca se han prestado. Columna: titulo.',
    hint: 'libros LEFT JOIN prestamos … WHERE p.id_prestamo IS NULL.',
    solution: `SELECT l.titulo
FROM libros l
LEFT JOIN prestamos p ON l.id_libro = p.id_libro
WHERE p.id_prestamo IS NULL;`,
    explain: 'La ciudad y los perros.',
    alts: [`SELECT titulo FROM libros WHERE id_libro NOT IN (SELECT id_libro FROM prestamos);`] });
  X({ id: 'l07', db: BIB, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Préstamos activos con usuario y libro',
    prompt: 'Muestra los usuarios con préstamos activos (sin fecha de devolución) y el libro que tienen. Columnas: nombre, titulo.',
    hint: '3 tablas + WHERE p.fecha_devolucion IS NULL.',
    solution: `SELECT u.nombre, l.titulo
FROM prestamos p
JOIN usuarios u ON p.id_usuario = u.id_usuario
JOIN libros l ON p.id_libro = l.id_libro
WHERE p.fecha_devolucion IS NULL;`,
    explain: 'Ana (Rayuela) y Luis (El amor en los tiempos del cólera). Con el estado del laboratorio también vale WHERE p.estado = \'Activo\'.',
    alts: [`SELECT u.nombre, l.titulo FROM prestamos p JOIN usuarios u ON p.id_usuario = u.id_usuario JOIN libros l ON p.id_libro = l.id_libro WHERE p.estado = 'Activo';`] });
  X({ id: 'l08', db: BIB, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Autores con libros en préstamo',
    prompt: 'Muestra (sin repetir) los autores que tienen libros actualmente en préstamo. Columna: nombre.',
    hint: 'autores → libros → prestamos + IS NULL en fecha_devolucion.',
    solution: `SELECT DISTINCT a.nombre
FROM autores a
JOIN libros l ON a.id_autor = l.id_autor
JOIN prestamos p ON l.id_libro = p.id_libro
WHERE p.fecha_devolucion IS NULL;`,
    explain: 'Julio Cortázar y Gabriel García Márquez.' });
  X({ id: 'l09', db: BIB, data: 'orig', level: 'examen', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Usuario con más préstamos',
    prompt: 'Muestra el usuario con más préstamos y cuántos tiene. Columnas: nombre, prestamos.',
    hint: 'JOIN + GROUP BY + ORDER BY COUNT(*) DESC LIMIT 1.',
    solution: `SELECT u.nombre, COUNT(*) AS prestamos
FROM usuarios u
JOIN prestamos p ON u.id_usuario = p.id_usuario
GROUP BY u.id_usuario, u.nombre
ORDER BY prestamos DESC
LIMIT 1;`,
    explain: 'Carlos Pérez con 2. LIMIT 1 se queda con la primera fila después de ordenar.' });
  X({ id: 'l10', db: BIB, data: 'orig', level: 'examen', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Autores sin libros prestados',
    prompt: 'Muestra los autores que no tienen ningún libro prestado (nunca). Columna: nombre.',
    hint: 'NOT IN de los autores cuyos libros aparecen en prestamos, o LEFT JOIN de 3 tablas + GROUP BY + HAVING COUNT(p.id_prestamo) = 0.',
    solution: `SELECT a.nombre
FROM autores a
WHERE a.id_autor NOT IN (
  SELECT l.id_autor FROM libros l JOIN prestamos p ON l.id_libro = p.id_libro
);`,
    explain: 'Mario Vargas Llosa: su único libro (La ciudad y los perros) nunca se ha prestado.',
    alts: [`SELECT a.nombre FROM autores a LEFT JOIN libros l ON a.id_autor = l.id_autor LEFT JOIN prestamos p ON l.id_libro = p.id_libro GROUP BY a.id_autor, a.nombre HAVING COUNT(p.id_prestamo) = 0;`] });
  X({ id: 'l11', db: BIB, data: 'orig', level: 'basico', topic: 'agregacion', src: 'lab', title: 'Lab biblioteca · Préstamos por estado',
    prompt: 'Cuenta los préstamos por estado. Columnas: estado, cantidad.',
    hint: 'GROUP BY estado.', solution: `SELECT estado, COUNT(*) AS cantidad FROM prestamos GROUP BY estado;`,
    explain: 'Activo 2, Devuelto 2.' });
  X({ id: 'l12', db: BIB, data: 'orig', level: 'intermedio', topic: 'joins', src: 'lab', title: 'Lab biblioteca · Préstamos de febrero y marzo',
    prompt: 'Muestra los préstamos hechos entre el 1 de febrero y el 31 de marzo de 2024 con el título y el usuario, en orden de fecha. Columnas: titulo, nombre, fecha_prestamo.',
    hint: "BETWEEN '2024-02-01' AND '2024-03-31' + ORDER BY.",
    solution: `SELECT l.titulo, u.nombre, p.fecha_prestamo
FROM prestamos p
JOIN libros l ON p.id_libro = l.id_libro
JOIN usuarios u ON p.id_usuario = u.id_usuario
WHERE p.fecha_prestamo BETWEEN '2024-02-01' AND '2024-03-31'
ORDER BY p.fecha_prestamo;`,
    order: [2],
    explain: 'Las fechas se escriben como texto \'AAAA-MM-DD\'.' });
  X({ id: 'y01', db: BIB, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Todos los autores con sus libros',
    prompt: 'Datos extendidos. Muestra todos los autores con sus libros, incluidos los autores sin libros. Columnas: nombre, titulo.',
    hint: 'autores LEFT JOIN libros.',
    solution: `SELECT a.nombre, l.titulo
FROM autores a
LEFT JOIN libros l ON a.id_autor = l.id_autor;`,
    explain: 'Isabel Allende sale con titulo NULL. "Antología de cuentos" no sale: no tiene autor y está en la tabla de la derecha.' });
  X({ id: 'y02', db: BIB, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'FULL JOIN autores y libros',
    prompt: 'Datos extendidos. Muestra todos los autores y todos los libros, tengan pareja o no. Columnas: nombre, titulo.',
    hint: 'FULL OUTER JOIN.',
    solution: `SELECT a.nombre, l.titulo
FROM autores a
FULL OUTER JOIN libros l ON a.id_autor = l.id_autor;`,
    explain: 'Aparecen ambos casos: Isabel Allende con titulo NULL y "Antología de cuentos" con nombre NULL.' });
  X({ id: 'y03', db: BIB, data: 'ext', level: 'intermedio', topic: 'joins', src: 'extra', title: 'Usuarios sin préstamos',
    prompt: 'Datos extendidos. Muestra los usuarios que nunca han pedido un préstamo. Columnas: nombre, correo.',
    hint: 'usuarios LEFT JOIN prestamos … IS NULL.',
    solution: `SELECT u.nombre, u.correo
FROM usuarios u
LEFT JOIN prestamos p ON u.id_usuario = p.id_usuario
WHERE p.id_prestamo IS NULL;`,
    explain: 'María Ruiz.' });
  X({ id: 'y04', db: BIB, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Libros por autor (incluye ceros)',
    prompt: 'Datos extendidos. Muestra cada autor con cuántos libros tiene registrados (0 si no tiene), de mayor a menor. Columnas: nombre, libros.',
    hint: 'LEFT JOIN + COUNT(l.id_libro) + ORDER BY libros DESC.',
    solution: `SELECT a.nombre, COUNT(l.id_libro) AS libros
FROM autores a
LEFT JOIN libros l ON a.id_autor = l.id_autor
GROUP BY a.id_autor, a.nombre
ORDER BY libros DESC;`,
    order: [1],
    explain: 'García Márquez 2, el resto 1 e Isabel Allende 0.' });

  /* =============== Consultas, agregación, subconsultas, DDL y DML =============== */
  const TI = 'tienda', PO = 'polideportivo';
  // Consulta de verificación para ejercicios DDL: describe la estructura de la tabla resultante.
  const STRUCT = (t) => `SELECT a.attname AS columna,
  format_type(a.atttypid, a.atttypmod) AS tipo,
  a.attnotnull AS not_null,
  a.atthasdef AS con_default,
  EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conrelid = a.attrelid AND k.contype = 'p' AND a.attnum = ANY (k.conkey)) AS pk,
  EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conrelid = a.attrelid AND k.contype = 'u' AND a.attnum = ANY (k.conkey)) AS unico,
  EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conrelid = a.attrelid AND k.contype = 'c' AND a.attnum = ANY (k.conkey)) AS con_check,
  (SELECT k.confrelid::regclass::text FROM pg_constraint k WHERE k.conrelid = a.attrelid AND k.contype = 'f' AND a.attnum = ANY (k.conkey) LIMIT 1) AS referencia
FROM pg_attribute a
WHERE a.attrelid = '${t}'::regclass AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY a.attnum;`;
  const NOTX = ' No uses BEGIN/COMMIT: el calificador ya ejecuta tu código dentro de una transacción.';

  // ---- Básico ----
  X({ id: 'k01', db: PO, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab polideportivo · Deportes no olímpicos',
    prompt: 'Muestra los deportes que no son olímpicos. Columnas: nombre_deporte, max_jugadores.',
    hint: 'es_olimpico es BOOLEAN: WHERE es_olimpico = FALSE (o WHERE NOT es_olimpico).',
    solution: `SELECT nombre_deporte, max_jugadores FROM deportes WHERE es_olimpico = FALSE;`,
    explain: 'Con los datos iniciales: Pádel y Yoga.', alts: [`SELECT nombre_deporte, max_jugadores FROM deportes WHERE NOT es_olimpico;`] });
  X({ id: 'k02', db: PO, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab polideportivo · Artículos nuevos con más de 10 unidades',
    prompt: "Muestra los artículos en estado 'Nuevo' con más de 10 unidades. Columnas: articulo, cantidad.",
    hint: 'Dos condiciones unidas con AND.', solution: `SELECT articulo, cantidad FROM inventario WHERE estado = 'Nuevo' AND cantidad > 10;`,
    explain: 'Raquetas Tenis (15) y Pesas 5kg (20).' });
  X({ id: 'k03', db: PO, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab polideportivo · Entrenadores que empiezan por L',
    prompt: 'Muestra los entrenadores cuyo nombre empieza con la letra L. Columnas: nombre, especialidad.',
    hint: "LIKE 'L%'.", solution: `SELECT nombre, especialidad FROM entrenadores WHERE nombre LIKE 'L%';`, explain: 'Lucía Fernández.' });
  X({ id: 'k04', db: BIB, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab biblioteca · Libros publicados después de 1980',
    prompt: 'Muestra los libros publicados después de 1980. Columnas: titulo, anio_publicacion.',
    hint: 'WHERE anio_publicacion > 1980.', solution: `SELECT titulo, anio_publicacion FROM libros WHERE anio_publicacion > 1980;`,
    explain: 'Harry Potter (1997) y El amor en los tiempos del cólera (1985).' });
  X({ id: 'k05', db: BIB, data: 'orig', level: 'basico', topic: 'consultas', src: 'lab', title: 'Lab biblioteca · Usuarios con correo gmail',
    prompt: 'Muestra los usuarios cuyo correo es de gmail. Columnas: nombre, correo.',
    hint: "LIKE '%@gmail.com'.", solution: `SELECT nombre, correo FROM usuarios WHERE correo LIKE '%@gmail.com';`, explain: 'Los tres usuarios del laboratorio usan gmail.' });
  X({ id: 'k06', db: EST, data: 'orig', level: 'basico', topic: 'consultas', src: 'extra', title: 'Ciudades sin repetir y ordenadas',
    prompt: 'Muestra las ciudades donde viven los estudiantes, sin repetir y en orden alfabético. Columna: ciudad.',
    hint: 'DISTINCT + ORDER BY.', solution: `SELECT DISTINCT ciudad FROM estudiantes ORDER BY ciudad;`, order: [0],
    explain: 'Bogota, Cali, Pasto, Popayan. Sin DISTINCT, Pasto saldría 3 veces.' });
  X({ id: 'k07', db: TI, data: 'orig', level: 'basico', topic: 'agregacion', src: 'clase', title: 'Clase de SQL · Estadísticas de precios',
    prompt: 'Muestra cuántos productos hay y el precio promedio, mínimo y máximo. Columnas: total, promedio, minimo, maximo.',
    hint: 'COUNT(*), AVG, MIN y MAX en un mismo SELECT.',
    solution: `SELECT COUNT(*) AS total, AVG(precio) AS promedio, MIN(precio) AS minimo, MAX(precio) AS maximo FROM PRODUCTO;`,
    explain: 'Resultado de la clase: 3 | 190000.00 | 35000.00 | 450000.00.' });
  X({ id: 'k08', db: PO, data: 'orig', level: 'basico', topic: 'dml', src: 'lab', title: 'Lab polideportivo · Ajuste salarial de Natación',
    prompt: 'Actualiza a 35.00 el salario por hora del entrenador de Natación.' + NOTX,
    hint: "UPDATE entrenadores SET salario_hora = 35.00 WHERE especialidad = 'Natación';",
    solution: `UPDATE entrenadores SET salario_hora = 35.00 WHERE especialidad = 'Natación';`,
    check: `SELECT nombre, especialidad, salario_hora FROM entrenadores;`,
    explain: 'Sin WHERE se cambiaría el salario de todos los entrenadores.' });

  // ---- Intermedio ----
  X({ id: 'k09', db: PO, data: 'orig', level: 'intermedio', topic: 'dml', src: 'lab', title: 'Lab polideportivo · Reparaciones',
    prompt: "Los artículos en estado 'Dañado' fueron reparados: cámbialos a 'Nuevo'." + NOTX,
    hint: 'UPDATE … SET estado = … WHERE estado = …', solution: `UPDATE inventario SET estado = 'Nuevo' WHERE estado = 'Dañado';`,
    check: `SELECT articulo, cantidad, estado FROM inventario;`, explain: 'Solo cambia Redes Voleibol.' });
  X({ id: 'k10', db: PO, data: 'orig', level: 'intermedio', topic: 'dml', src: 'lab', title: 'Lab polideportivo · Menores de 10 a membresía Básica',
    prompt: "Pasa a membresía 'Básica' a todos los socios menores de 10 años." + NOTX,
    hint: 'WHERE edad < 10.', solution: `UPDATE socios SET tipo_membresia = 'Básica' WHERE edad < 10;`,
    check: `SELECT nombre, edad, tipo_membresia FROM socios;`, explain: 'Ana López (8 años) pasa de Premium a Básica.' });
  X({ id: 'k11', db: PO, data: 'orig', level: 'intermedio', topic: 'dml', src: 'lab', title: 'Lab polideportivo · Eliminar entrenadores inactivos',
    prompt: 'Elimina los entrenadores que no están activos.' + NOTX,
    hint: 'DELETE FROM … WHERE activo = FALSE.', solution: `DELETE FROM entrenadores WHERE activo = FALSE;`,
    check: `SELECT nombre, activo FROM entrenadores;`, explain: 'Se elimina Juan Kross.', alts: [`DELETE FROM entrenadores WHERE NOT activo;`] });
  X({ id: 'k12', db: PO, data: 'orig', level: 'intermedio', topic: 'ddl', src: 'extra', title: 'Agregar una columna',
    prompt: 'Agrega a la tabla socios la columna telefono de tipo VARCHAR(20) (opcional).' + NOTX,
    hint: 'ALTER TABLE socios ADD COLUMN …', solution: `ALTER TABLE socios ADD COLUMN telefono VARCHAR(20);`,
    check: STRUCT('socios'), explain: 'Las filas existentes quedan con telefono NULL. Se califica la estructura final de la tabla.' });
  X({ id: 'k13', db: EST, data: 'orig', level: 'intermedio', topic: 'agregacion', src: 'extra', title: 'Estudiantes y edad promedio por ciudad',
    prompt: 'Para cada ciudad muestra cuántos estudiantes hay y su edad promedio redondeada a 1 decimal. Columnas: ciudad, cantidad, edad_promedio.',
    hint: 'GROUP BY ciudad + COUNT(*) + ROUND(AVG(edad), 1).',
    solution: `SELECT ciudad, COUNT(*) AS cantidad, ROUND(AVG(edad), 1) AS edad_promedio FROM estudiantes GROUP BY ciudad;`,
    explain: 'Pasto: 3 estudiantes, promedio (20 + 19 + 24) / 3 = 21.0.' });
  X({ id: 'k14', db: BIB, data: 'orig', level: 'intermedio', topic: 'subconsultas', src: 'lab', title: 'Lab biblioteca · Libro más antiguo',
    prompt: 'Muestra el libro (o los libros) más antiguo(s). Columnas: titulo, anio_publicacion.',
    hint: 'WHERE anio_publicacion = (SELECT MIN(anio_publicacion) FROM libros). Ojo con los empates.',
    solution: `SELECT titulo, anio_publicacion FROM libros WHERE anio_publicacion = (SELECT MIN(anio_publicacion) FROM libros);`,
    explain: 'Hay empate: Rayuela y La ciudad y los perros son de 1963. Con ORDER BY … LIMIT 1 solo saldría uno, y la respuesta quedaría incompleta.' });
  X({ id: 'k15', db: BANCO, data: 'orig', level: 'intermedio', topic: 'consultas', src: 'extra', title: 'Columna calculada: valor de la cuota',
    prompt: 'Para cada préstamo muestra el monto, las cuotas y el valor de cada cuota con interés simple, monto × (1 + tasa_interes / 100) / cuotas, redondeado a 2 decimales, de la cuota más alta a la más baja. Columnas: id_prestamo, monto, cuotas, valor_cuota.',
    hint: 'ROUND(monto * (1 + tasa_interes / 100) / cuotas, 2) AS valor_cuota … ORDER BY valor_cuota DESC.',
    solution: `SELECT id_prestamo, monto, cuotas, ROUND(monto * (1 + tasa_interes / 100) / cuotas, 2) AS valor_cuota FROM prestamos ORDER BY valor_cuota DESC;`, order: [3],
    explain: 'Préstamo 3: 15.000.000 × 1,15 / 36 = 479.166,67; préstamo 1: 468.750; préstamo 2: 459.166,67. Los paréntesis importan: sin ellos se divide antes de sumar.' });

  // ---- Tipo examen ----
  X({ id: 'k16', db: TI, data: 'orig', level: 'examen', topic: 'ddl', src: 'clase', title: 'Normalización a SQL: crear CATEGORIA',
    prompt: 'Del ejercicio PRODUCTO_CATEGORIA: crea la tabla CATEGORIA con id_categoria (INTEGER, clave primaria) y nombre_categoria (VARCHAR(60), obligatorio y sin repetirse).' + NOTX,
    hint: 'PRIMARY KEY, NOT NULL y UNIQUE.',
    solution: `CREATE TABLE CATEGORIA (\n  id_categoria INTEGER PRIMARY KEY,\n  nombre_categoria VARCHAR(60) NOT NULL UNIQUE\n);`,
    check: STRUCT('categoria'), explain: 'Se compara la estructura: nombres, tipos, NOT NULL, PK y UNIQUE.' });
  X({ id: 'k17', db: PO, data: 'orig', level: 'examen', topic: 'ddl', src: 'lab', title: 'Lab polideportivo · Crear la tabla eventos',
    prompt: 'Crea la tabla eventos: id_evento (SERIAL, clave primaria), nombre (VARCHAR(100), obligatorio), fecha_evento (DATE) y presupuesto (NUMERIC(12,2)) que no puede ser negativo.' + NOTX,
    hint: 'CHECK (presupuesto >= 0).',
    solution: `CREATE TABLE eventos (\n  id_evento SERIAL PRIMARY KEY,\n  nombre VARCHAR(100) NOT NULL,\n  fecha_evento DATE,\n  presupuesto NUMERIC(12,2) CHECK (presupuesto >= 0)\n);`,
    check: STRUCT('eventos'), explain: 'SERIAL crea un INTEGER NOT NULL con valor por defecto (el contador).' });
  X({ id: 'k18', db: TI, data: 'orig', level: 'examen', topic: 'ddl', src: 'extra', title: 'ALTER TABLE con restricciones',
    prompt: 'Agrega a PRODUCTO la columna stock (INTEGER), obligatoria, con valor por defecto 0 y que no pueda ser negativa.' + NOTX,
    hint: 'ALTER TABLE PRODUCTO ADD COLUMN stock INTEGER NOT NULL DEFAULT 0 CHECK (…);',
    solution: `ALTER TABLE PRODUCTO ADD COLUMN stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);`,
    check: STRUCT('producto'), explain: 'Como la tabla ya tiene filas, el DEFAULT es necesario para que NOT NULL no falle.' });
  X({ id: 'k19', db: BANCO, data: 'orig', level: 'examen', topic: 'ddl', src: 'extra', title: 'Relación reflexiva en SQL',
    prompt: 'Implementa la relación reflexiva "un empleado es supervisado por otro empleado": agrega a empleados la columna id_supervisor (INT, opcional) como clave foránea hacia la misma tabla.' + NOTX,
    hint: 'ALTER TABLE empleados ADD COLUMN id_supervisor INT REFERENCES empleados(id_empleado);',
    solution: `ALTER TABLE empleados ADD COLUMN id_supervisor INT REFERENCES empleados(id_empleado);`,
    check: STRUCT('empleados'), explain: 'Una FK puede apuntar a su propia tabla. Es la base del SELF JOIN.',
    alts: [`ALTER TABLE empleados ADD id_supervisor INT;\nALTER TABLE empleados ADD CONSTRAINT fk_supervisor FOREIGN KEY (id_supervisor) REFERENCES empleados(id_empleado);`] });
  X({ id: 'k20', db: TI, data: 'orig', level: 'examen', topic: 'dml', src: 'extra', title: 'Registrar un pedido completo',
    prompt: 'Registra el pedido 1004 del cliente 2 con fecha 2026-03-20, que incluye 3 teclados (101) y 1 monitor (103).' + NOTX,
    hint: 'Primero el INSERT en PEDIDO y después las dos filas de DETALLE_PEDIDO.',
    solution: `INSERT INTO PEDIDO (id_pedido, fecha, id_cliente) VALUES (1004, '2026-03-20', 2);\nINSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad) VALUES (1004, 101, 3), (1004, 103, 1);`,
    check: `SELECT p.id_pedido, p.fecha, p.id_cliente, d.id_producto, d.cantidad FROM PEDIDO p JOIN DETALLE_PEDIDO d ON p.id_pedido = d.id_pedido WHERE p.id_pedido = 1004;`,
    explain: 'Si insertas primero el detalle, la FK lo rechaza: el pedido 1004 todavía no existe.' });
  X({ id: 'k21', db: BANCO, data: 'orig', level: 'examen', topic: 'dml', src: 'extra', title: 'Transferencia bancaria',
    prompt: "Transfiere 300.000 de la cuenta '20003' a la cuenta '20002' y registra en transacciones una de tipo 'Transferencia' por 300000 en la cuenta de origen (id_cuenta 3)." + NOTX,
    hint: 'Dos UPDATE (saldo = saldo − 300000 y saldo = saldo + 300000) y un INSERT.',
    solution: `UPDATE cuentas SET saldo = saldo - 300000 WHERE numero_cuenta = '20003';\nUPDATE cuentas SET saldo = saldo + 300000 WHERE numero_cuenta = '20002';\nINSERT INTO transacciones (tipo, monto, id_cuenta) VALUES ('Transferencia', 300000, 3);`,
    check: `SELECT numero_cuenta, saldo FROM cuentas UNION ALL SELECT 'transferencias_cuenta_3', COUNT(*) FROM transacciones WHERE tipo = 'Transferencia' AND monto = 300000 AND id_cuenta = 3;`,
    explain: 'En un sistema real irían dentro de BEGIN … COMMIT (atomicidad: todo o nada).' });
  X({ id: 'k22', db: BIB, data: 'orig', level: 'examen', topic: 'dml', src: 'extra', title: 'Registrar una devolución',
    prompt: "El préstamo 2 (Rayuela) se devolvió el 2024-02-15: registra la fecha de devolución y cambia su estado a 'Devuelto'." + NOTX,
    hint: 'Un UPDATE puede cambiar dos columnas: SET a = …, b = …',
    solution: `UPDATE prestamos SET fecha_devolucion = '2024-02-15', estado = 'Devuelto' WHERE id_prestamo = 2;`,
    check: `SELECT id_prestamo, fecha_devolucion, estado FROM prestamos;`, explain: 'Las columnas se separan con coma en el SET.' });
  X({ id: 'k23', db: BANCO, data: 'orig', level: 'examen', topic: 'dml', src: 'extra', title: 'Aumento del 5 % a los asesores',
    prompt: "Aumenta un 5 % el salario de los empleados con cargo 'Asesor'." + NOTX,
    hint: 'SET salario = salario * 1.05.', solution: `UPDATE empleados SET salario = salario * 1.05 WHERE cargo = 'Asesor';`,
    check: `SELECT nombre, cargo, salario FROM empleados;`, explain: 'Ana pasa a 3.675.000 y Martha a 4.410.000.' });
  X({ id: 'k24', db: PO, data: 'orig', level: 'examen', topic: 'dml', src: 'lab', title: 'Lab polideportivo · Eliminar deportes grandes',
    prompt: 'Elimina los deportes que admiten más de 15 jugadores.' + NOTX,
    hint: 'DELETE … WHERE max_jugadores > 15.', solution: `DELETE FROM deportes WHERE max_jugadores > 15;`,
    check: `SELECT nombre_deporte, max_jugadores FROM deportes;`, explain: 'Se eliminan Fútbol 11 (22) y Yoga (20).' });
  X({ id: 'k25', db: BANCO, data: 'orig', level: 'examen', topic: 'agregacion', src: 'extra', title: 'Ciudades con más de 5 millones en cuentas',
    prompt: 'Muestra las ciudades (de los clientes) cuyo saldo total en cuentas supera los 5 millones, de mayor a menor. Columnas: ciudad, saldo_total.',
    hint: 'JOIN clientes–cuentas, GROUP BY ciudad, HAVING SUM(saldo) > 5000000, ORDER BY … DESC.',
    solution: `SELECT cl.ciudad, SUM(cu.saldo) AS saldo_total\nFROM clientes cl JOIN cuentas cu ON cl.id_cliente = cu.id_cliente\nGROUP BY cl.ciudad\nHAVING SUM(cu.saldo) > 5000000\nORDER BY saldo_total DESC;`, order: [1],
    explain: 'Bogotá (20.000.000) y Medellín (9.500.000).' });
  X({ id: 'k26', db: PO, data: 'orig', level: 'examen', topic: 'agregacion', src: 'extra', title: 'Inventario por estado con HAVING',
    prompt: 'Muestra la cantidad total de unidades por estado del inventario, solo para los estados con más de 10 unidades. Columnas: estado, unidades.',
    hint: 'SUM(cantidad) + GROUP BY estado + HAVING.',
    solution: `SELECT estado, SUM(cantidad) AS unidades FROM inventario GROUP BY estado HAVING SUM(cantidad) > 10;`,
    explain: 'Usado 50 y Nuevo 35; Dañado (5) no pasa el HAVING.' });
  X({ id: 'k27', db: BANCO, data: 'orig', level: 'examen', topic: 'subconsultas', src: 'extra', title: 'Clientes por encima del saldo promedio',
    prompt: 'Muestra los clientes cuyo saldo total supera el saldo promedio de todas las cuentas. Columnas: nombre, apellido, saldo_total.',
    hint: 'GROUP BY por cliente + HAVING SUM(saldo) > (SELECT AVG(saldo) FROM cuentas).',
    solution: `SELECT cl.nombre, cl.apellido, SUM(cu.saldo) AS saldo_total\nFROM clientes cl JOIN cuentas cu ON cl.id_cliente = cu.id_cliente\nGROUP BY cl.id_cliente, cl.nombre, cl.apellido\nHAVING SUM(cu.saldo) > (SELECT AVG(saldo) FROM cuentas);`,
    explain: 'El promedio es 6.310.000: superan Pedro (9.500.000) y Camila (15.000.000).' });
  X({ id: 'k28', db: EST, data: 'orig', level: 'examen', topic: 'subconsultas', src: 'extra', title: 'Cursos sobre el promedio general',
    prompt: 'Muestra los cursos cuyo promedio de notas es mayor que el promedio general de todas las notas. Columnas: nombre_curso, promedio (redondeado a 2 decimales).',
    hint: 'HAVING AVG(i.nota_final) > (SELECT AVG(nota_final) FROM inscripciones).',
    solution: `SELECT c.nombre_curso, ROUND(AVG(i.nota_final), 2) AS promedio\nFROM cursos c JOIN inscripciones i ON c.id_curso = i.id_curso\nGROUP BY c.nombre_curso\nHAVING AVG(i.nota_final) > (SELECT AVG(nota_final) FROM inscripciones);`,
    explain: 'El promedio general es 4.22: superan Mineria de Datos (4.35), Inteligencia Artificial y Bases de Datos (4.25) y Desarrollo Web (4.6).' });
  X({ id: 'k29', db: TI, data: 'ext', level: 'examen', topic: 'subconsultas', src: 'extra', title: 'Productos nunca vendidos',
    prompt: 'Datos extendidos. Muestra los productos que nunca se han vendido usando NOT EXISTS. Columnas: id_producto, nombre.',
    hint: 'WHERE NOT EXISTS (SELECT 1 FROM DETALLE_PEDIDO d WHERE d.id_producto = p.id_producto).',
    solution: `SELECT p.id_producto, p.nombre FROM PRODUCTO p\nWHERE NOT EXISTS (SELECT 1 FROM DETALLE_PEDIDO d WHERE d.id_producto = p.id_producto);`,
    explain: 'Audífonos (104).',
    alts: [`SELECT p.id_producto, p.nombre FROM PRODUCTO p LEFT JOIN DETALLE_PEDIDO d ON p.id_producto = d.id_producto WHERE d.id_pedido IS NULL;`] });
  X({ id: 'k30', db: TI, data: 'ext', level: 'examen', topic: 'subconsultas', src: 'extra', title: 'Clientes sin pedidos',
    prompt: 'Datos extendidos. Muestra los clientes que no han hecho ningún pedido. Columnas: nombre, email.',
    hint: 'NOT IN, NOT EXISTS o LEFT JOIN … IS NULL.',
    solution: `SELECT nombre, email FROM CLIENTE WHERE id_cliente NOT IN (SELECT id_cliente FROM PEDIDO);`,
    explain: 'Marta Ruiz. Aquí NOT IN es seguro porque PEDIDO.id_cliente es NOT NULL.',
    alts: [`SELECT c.nombre, c.email FROM CLIENTE c LEFT JOIN PEDIDO p ON c.id_cliente = p.id_cliente WHERE p.id_pedido IS NULL;`] });
  X({ id: 'k31', db: TI, data: 'orig', level: 'examen', topic: 'joins', src: 'clase', title: 'Total de cada pedido',
    prompt: 'Muestra el total de cada pedido (suma de cantidad × precio) con el nombre del cliente, ordenado por número de pedido. Columnas: id_pedido, cliente, total.',
    hint: 'PEDIDO, CLIENTE, DETALLE_PEDIDO y PRODUCTO; SUM(d.cantidad * pr.precio); GROUP BY.',
    solution: `SELECT p.id_pedido, c.nombre AS cliente, SUM(d.cantidad * pr.precio) AS total\nFROM PEDIDO p\nJOIN CLIENTE c ON p.id_cliente = c.id_cliente\nJOIN DETALLE_PEDIDO d ON p.id_pedido = d.id_pedido\nJOIN PRODUCTO pr ON d.id_producto = pr.id_producto\nGROUP BY p.id_pedido, c.nombre\nORDER BY p.id_pedido;`, order: [0],
    explain: 'Pedido 1001: 1 × 85.000 + 2 × 35.000 = 155.000.' });
  X({ id: 'k32', db: TI, data: 'ext', level: 'examen', topic: 'joins', src: 'extra', title: 'Gasto por cliente (incluye ceros)',
    prompt: 'Datos extendidos. Muestra cuánto ha gastado cada cliente (0 si no ha comprado), de mayor a menor. Columnas: nombre, gastado.',
    hint: 'LEFT JOIN en toda la cadena + COALESCE(SUM(…), 0).',
    solution: `SELECT c.nombre, COALESCE(SUM(d.cantidad * pr.precio), 0) AS gastado\nFROM CLIENTE c\nLEFT JOIN PEDIDO p ON c.id_cliente = p.id_cliente\nLEFT JOIN DETALLE_PEDIDO d ON p.id_pedido = d.id_pedido\nLEFT JOIN PRODUCTO pr ON d.id_producto = pr.id_producto\nGROUP BY c.id_cliente, c.nombre\nORDER BY gastado DESC;`, order: [1],
    explain: 'Ana 605.000, Luis 35.000, Marta 0.' });
  X({ id: 'k33', db: TI, data: 'orig', level: 'examen', topic: 'joins', src: 'extra', title: 'Producto más vendido',
    prompt: 'Muestra el producto con más unidades vendidas y cuántas. Columnas: nombre, unidades.',
    hint: 'JOIN + SUM(cantidad) + GROUP BY + ORDER BY … DESC LIMIT 1.',
    solution: `SELECT pr.nombre, SUM(d.cantidad) AS unidades\nFROM PRODUCTO pr JOIN DETALLE_PEDIDO d ON pr.id_producto = d.id_producto\nGROUP BY pr.id_producto, pr.nombre\nORDER BY unidades DESC\nLIMIT 1;`,
    explain: 'Mouse, con 3 unidades.' });
  X({ id: 'k34', db: BANCO, data: 'orig', level: 'examen', topic: 'subconsultas', src: 'extra', title: 'Ganan más que el promedio de su sucursal',
    prompt: 'Muestra los empleados que ganan más que el salario promedio de SU sucursal. Columnas: nombre, salario.',
    hint: 'Subconsulta correlacionada: (SELECT AVG(e2.salario) FROM empleados e2 WHERE e2.id_sucursal = e.id_sucursal).',
    solution: `SELECT e.nombre, e.salario FROM empleados e\nWHERE e.salario > (SELECT AVG(e2.salario) FROM empleados e2 WHERE e2.id_sucursal = e.id_sucursal);`,
    explain: 'Solo Carlos Pérez: en la Sucursal Centro el promedio es 6.000.000. En las otras sucursales hay un solo empleado, que no supera su propio promedio.' });
  X({ id: 'k35', db: BANCO, data: 'orig', level: 'examen', topic: 'consultas', src: 'extra', title: 'Filtro combinado con orden',
    prompt: 'Muestra los clientes de Bogotá o Medellín cuyo correo es de gmail, ordenados por apellido. Columnas: nombre, apellido, ciudad.',
    hint: "Paréntesis en el OR: (ciudad = 'Bogotá' OR ciudad = 'Medellín') AND correo LIKE …",
    solution: `SELECT nombre, apellido, ciudad FROM clientes\nWHERE ciudad IN ('Bogotá', 'Medellín') AND correo LIKE '%@gmail.com'\nORDER BY apellido;`, order: [1],
    explain: 'Fernández, Martínez, Rodríguez.' });
  X({ id: 'k36', db: EST, data: 'ext', level: 'examen', topic: 'agregacion', src: 'extra', title: 'NULL en las agregaciones',
    prompt: 'Datos extendidos. Para el curso "Desarrollo Web" muestra cuántas inscripciones tiene, cuántas tienen nota y el promedio de nota. Columnas: inscripciones, con_nota, promedio.',
    hint: 'COUNT(*), COUNT(nota_final) y AVG(nota_final) con WHERE por el curso.',
    solution: `SELECT COUNT(*) AS inscripciones, COUNT(i.nota_final) AS con_nota, AVG(i.nota_final) AS promedio\nFROM inscripciones i JOIN cursos c ON i.id_curso = c.id_curso\nWHERE c.nombre_curso = 'Desarrollo Web';`,
    explain: '2 inscripciones, 1 con nota, promedio 4.6: AVG ignora la nota NULL de Valentina (no la cuenta como 0).' });

  const byId = {};
  L.forEach((e) => { byId[e.id] = e; });
  return { LIST: L, byId, SQL_TOPICS, LEVELS, SRC };
});
