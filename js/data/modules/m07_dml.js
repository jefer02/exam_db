/* Tema 7 · DML: INSERT, UPDATE, DELETE (y el primer SELECT). */
(function (root) {
  const POLI = 'polideportivo';
  (root.MODULES = root.MODULES || []).push({
    id: 'dml', n: 7, title: 'DML: insertar, modificar y borrar datos (INSERT, UPDATE, DELETE)', short: 'DML: INSERT, UPDATE, DELETE', minutes: 30,
    desc: 'Escribir INSERT de una y varias filas, UPDATE y DELETE con WHERE, y en qué orden insertar cuando hay claves foráneas.',
    goals: ['Escribir INSERT con lista de columnas, varias filas y columnas SERIAL o DEFAULT.',
      'Modificar datos con UPDATE … SET … WHERE, incluso con expresiones.',
      'Borrar filas con DELETE … WHERE sin borrar de más.',
      'Insertar en el orden correcto cuando hay FK (primero el padre).'],
    sections: [
      { id: 'insert', h: 'INSERT: agregar filas', body: [
        { sql: "INSERT INTO tabla (columna1, columna2, ...)\nVALUES (valor1, valor2, ...);\n\n-- varias filas en una sola sentencia\nINSERT INTO PRODUCTO (id_producto, nombre, precio)\nVALUES (101, 'Teclado', 85000.00),\n       (102, 'Mouse',   35000.00),\n       (103, 'Monitor', 450000.00);" },
        '<ul><li>La <b>cantidad y el orden</b> de los valores debe coincidir con la lista de columnas.</li><li>Textos y fechas entre <b>comillas simples</b>: <code>\'Ana Torres\'</code>, <code>\'2026-03-10\'</code>. Números sin comillas y sin puntos de miles: <code>85000.00</code>.</li><li>Las columnas <b>SERIAL</b> y las que tienen <b>DEFAULT</b> se pueden omitir.</li><li>Si un valor viola una restricción (PK repetida, FK inexistente, CHECK), el SGBD <b>rechaza</b> la inserción.</li></ul>',
        { ex: { id: 'ins', db: POLI, title: 'Registro de socios (laboratorio polideportivo)', sql: "INSERT INTO socios (nombre, email, edad, tipo_membresia)\nVALUES ('Diana Ríos', 'diana@mail.com', 31, 'VIP'),\n       ('Tomás Gil',  'tomas@mail.com', 12, 'Básica');\n\nSELECT * FROM socios;", note: 'id_socio es SERIAL: se numeró solo (5 y 6).' } },
        { ex: { id: 'insdef', db: POLI, title: 'Omitir una columna con DEFAULT', sql: "INSERT INTO entrenadores (nombre, especialidad, salario_hora)\nVALUES ('Pablo Mora', 'Atletismo', 27.50);\n\nSELECT nombre, activo FROM entrenadores;", note: 'activo tiene DEFAULT TRUE, así que Pablo quedó activo sin escribirlo.' } },
        { ex: { id: 'insck', db: POLI, title: 'Un socio de 3 años viola el CHECK de edad → error', sql: "INSERT INTO socios (nombre, edad, tipo_membresia)\nVALUES ('Bebé', 3, 'Básica');", expectError: 'check constraint' } },
        '<h3>Orden de inserción con claves foráneas</h3><p>Primero se insertan las filas <b>referenciadas</b> (padre) y después las que las referencian (hijo): primero el CLIENTE, luego su PEDIDO y por último el DETALLE_PEDIDO.</p>',
        { ex: { id: 'insfk', db: 'tienda', title: 'Pedido de un cliente que no existe → error', sql: "INSERT INTO PEDIDO (id_pedido, fecha, id_cliente)\nVALUES (1004, '2026-03-20', 9);", expectError: 'foreign key' } },
        { ex: { id: 'insok', db: 'tienda', title: 'En orden: cliente → pedido → detalle', sql: "INSERT INTO CLIENTE  (id_cliente, nombre, email) VALUES (9, 'Sara Pinto', 'sara@mail.com');\nINSERT INTO PEDIDO   (id_pedido, fecha, id_cliente) VALUES (1004, '2026-03-20', 9);\nINSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad) VALUES (1004, 101, 2);\n\nSELECT * FROM PEDIDO;" } }
      ] },
      { id: 'update', h: 'UPDATE: modificar filas', body: [
        { sql: "UPDATE tabla\nSET columna1 = valor1, columna2 = valor2\nWHERE condición;" },
        { ex: { id: 'upd', db: POLI, title: 'Ajuste salarial de Natación (laboratorio)', sql: "UPDATE entrenadores\nSET salario_hora = 35.00\nWHERE especialidad = 'Natación';\n\nSELECT nombre, especialidad, salario_hora FROM entrenadores;" } },
        { ex: { id: 'updexp', db: POLI, title: 'UPDATE con una expresión: subir 10 % a los activos', sql: "UPDATE entrenadores\nSET salario_hora = salario_hora * 1.10\nWHERE activo = TRUE;\n\nSELECT nombre, salario_hora, activo FROM entrenadores;" } },
        { ex: { id: 'updnowhere', db: POLI, title: '⚠ UPDATE sin WHERE: cambia TODAS las filas', sql: "UPDATE inventario SET estado = 'Nuevo';\n\nSELECT articulo, estado FROM inventario;   -- todo quedó 'Nuevo'", note: 'Los ejemplos corren en una copia que se descarta, así que aquí no pasa nada; en un sistema real sería un desastre.' } },
        { warn: '<b>Antes de un UPDATE o un DELETE, escribe primero un SELECT con el mismo WHERE</b> para ver exactamente qué filas vas a tocar.' }
      ] },
      { id: 'delete', h: 'DELETE: borrar filas', body: [
        { sql: 'DELETE FROM tabla\nWHERE condición;     -- sin WHERE borra TODAS las filas' },
        { ex: { id: 'del', db: POLI, title: 'Eliminar entrenadores inactivos (laboratorio)', sql: 'DELETE FROM entrenadores\nWHERE activo = FALSE;\n\nSELECT nombre, activo FROM entrenadores;' } },
        { ex: { id: 'del2', db: POLI, title: 'Eliminar deportes de más de 15 jugadores (laboratorio)', sql: 'DELETE FROM deportes\nWHERE max_jugadores > 15\nRETURNING nombre_deporte, max_jugadores;   -- muestra lo que se borró' } },
        { ex: { id: 'delfk', db: 'biblioteca', title: 'Borrar un libro que tiene préstamos → error de FK', sql: 'DELETE FROM libros WHERE id_libro = 1;', expectError: 'foreign key' } },
        { reveal: { q: 'Laboratorio polideportivo: escribe la sentencia que pasa a membresía "Básica" a los socios menores de 10 años.', a: { sql: "UPDATE socios\nSET tipo_membresia = 'Básica'\nWHERE edad < 10;" } } }
      ] },
      { id: 'select', h: 'Y para ver los datos: SELECT', body: [
        '<p>SELECT es la sentencia de consulta (DQL): lee datos sin cambiarlos. Su forma mínima es:</p>',
        { ex: { id: 'sel', db: POLI, sql: "SELECT nombre, edad, tipo_membresia\nFROM socios\nWHERE edad >= 18;" } },
        { key: 'En los temas 8 y 9 se estudia SELECT a fondo: filtros, orden, funciones de agregación y agrupación.' }
      ] }
    ],
    keys: ['INSERT INTO t (cols) VALUES (…), (…); — la lista de columnas y la de valores coinciden en cantidad y orden.',
      'SERIAL y las columnas con DEFAULT se pueden omitir en el INSERT.',
      'UPDATE t SET col = valor WHERE …; — sin WHERE cambia todas las filas.',
      'DELETE FROM t WHERE …; — sin WHERE borra todas las filas (la tabla queda).',
      'Con FK: se inserta primero el padre y se borra primero el hijo.',
      'Antes de UPDATE/DELETE, prueba el WHERE con un SELECT.'],
    quiz: [
      { q: '¿Qué hace <code>DELETE FROM socios;</code>?', o: [
        { t: 'Borra todas las filas de socios; la tabla sigue existiendo', ok: true, why: 'Correcto: sin WHERE, DELETE afecta a todas las filas.' },
        { t: 'Borra la tabla socios', why: 'Para borrar la tabla se usa DROP TABLE.' },
        { t: 'Da error porque falta el WHERE', why: 'El WHERE es opcional, por eso es peligroso.' },
        { t: 'No hace nada', why: 'Borra todas las filas.' }] },
      { q: '¿Cuál es la sintaxis correcta de UPDATE?', o: [
        { t: "UPDATE entrenadores SET salario_hora = 35 WHERE especialidad = 'Natación';", ok: true, why: 'Correcto: UPDATE tabla SET columna = valor WHERE condición.' },
        { t: "UPDATE salario_hora = 35 FROM entrenadores WHERE especialidad = 'Natación';", why: 'Falta SET y el orden es incorrecto.' },
        { t: "UPDATE entrenadores (salario_hora) VALUES (35);", why: 'Esa forma se parece a INSERT, no a UPDATE.' },
        { t: "SET entrenadores salario_hora = 35;", why: 'Falta la palabra UPDATE.' }] },
      { q: 'Debes insertar un PEDIDO de un cliente nuevo. ¿En qué orden?', o: [
        { t: 'Primero el CLIENTE y después el PEDIDO', ok: true, why: 'Correcto: la FK del pedido exige que el cliente exista.' },
        { t: 'Primero el PEDIDO y después el CLIENTE', why: 'El INSERT del pedido fallaría por la FK.' },
        { t: 'Da igual', why: 'Con FK el orden sí importa.' },
        { t: 'Hay que desactivar la FK', why: 'No es necesario si se respeta el orden.' }] },
      { q: 'id_socio es SERIAL. ¿Cuál INSERT es correcto?', o: [
        { t: "INSERT INTO socios (nombre, edad) VALUES ('Ana', 20);", ok: true, why: 'Correcto: se omite el SERIAL y PostgreSQL lo numera.' },
        { t: "INSERT INTO socios VALUES ('Ana', 20);", why: 'Sin lista de columnas hay que dar valores para todas, en orden, empezando por id_socio.' },
        { t: "INSERT socios (nombre, edad) = ('Ana', 20);", why: 'Falta INTO y VALUES.' },
        { t: 'INSERT INTO socios (nombre, edad) VALUES ("Ana", 20);', why: 'En SQL los textos van con comillas simples; las dobles son para nombres de columnas.' }] },
      { q: '¿Qué sentencia pertenece al DML?', o: [
        { t: 'UPDATE', ok: true, why: 'Correcto: INSERT, UPDATE y DELETE son DML.' },
        { t: 'ALTER', why: 'ALTER es DDL.' },
        { t: 'GRANT', why: 'GRANT es DCL.' },
        { t: 'TRUNCATE', why: 'TRUNCATE es DDL.' }] }
    ],
    practice: { sql: ['dml'], quiz: ['sql', 'lab'], labs: ['polideportivo', 'biblioteca'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
