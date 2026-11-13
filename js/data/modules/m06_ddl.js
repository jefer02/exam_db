/* Tema 6 · DDL: CREATE, ALTER, DROP, TRUNCATE. */
(function (root) {
  const COLS = (t) => `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = '${t}' AND table_schema = current_schema()
ORDER BY ordinal_position;`;
  (root.MODULES = root.MODULES || []).push({
    id: 'ddl', n: 6, title: 'DDL: crear y modificar la estructura (CREATE, ALTER, DROP, TRUNCATE)', short: 'DDL: CREATE, ALTER, DROP', minutes: 35,
    desc: 'Escribir CREATE TABLE completos, modificarlos con ALTER TABLE, y diferenciar DROP, TRUNCATE y DELETE.',
    goals: ['Escribir un CREATE TABLE con tipos, PK, FK y restricciones, en el orden correcto.',
      'Modificar una tabla con ALTER TABLE (agregar, quitar, renombrar columnas y restricciones).',
      'Diferenciar DROP TABLE, TRUNCATE y DELETE.',
      'Usar los comandos básicos de psql (\\c, \\dt, \\d).'],
    sections: [
      { id: 'create', h: 'CREATE DATABASE y CREATE TABLE', body: [
        '<p>El <b>DDL</b> (Data Definition Language) crea y cambia la <b>estructura</b>: bases de datos, tablas, columnas y restricciones. No trabaja con filas.</p>',
        '<p>En los laboratorios con <code>psql</code> primero se crea la base y luego uno se conecta a ella:</p>',
        { sql: 'CREATE DATABASE biblioteca;\n\\c biblioteca          -- comando de psql: conectarse\n\\dt                    -- listar tablas\n\\d libros              -- ver la estructura de una tabla' },
        '<h3>Anatomía de un CREATE TABLE</h3>',
        { sql: "CREATE TABLE nombre_tabla (\n  columna1  TIPO  [restricciones],      -- una línea por columna, separadas por comas\n  columna2  TIPO  [restricciones],\n  ...\n  [restricciones de tabla]             -- PK compuesta, FK, CHECK de varias columnas\n);                                     -- sin coma antes del paréntesis final\n\nCREATE TABLE libros (\n  id_libro         SERIAL PRIMARY KEY,\n  titulo           VARCHAR(150) NOT NULL,\n  anio_publicacion INT CHECK (anio_publicacion > 0),\n  id_autor         INT,\n  FOREIGN KEY (id_autor) REFERENCES autores(id_autor)\n);" },
        { ex: { id: 'crear', db: 'polideportivo', title: 'Crear la tabla eventos del laboratorio y ver su estructura', sql: `CREATE TABLE eventos (
  id_evento    SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  fecha_evento DATE,
  presupuesto  NUMERIC(12,2) CHECK (presupuesto >= 0)
);
-- equivalente a \\d eventos en psql:
${COLS('eventos')}` } },
        { warn: 'Errores típicos al escribir un CREATE TABLE a mano: coma después de la última columna, olvidar el tipo de dato, escribir la FK antes de crear la tabla referenciada y usar comillas dobles en vez de simples para los textos.' },
        { ex: { id: 'orden', db: 'tienda', title: 'Crear la tabla hija antes que la padre → error', sql: 'CREATE TABLE pedido_x (\n  id_pedido  INT PRIMARY KEY,\n  id_cliente INT REFERENCES cliente_x(id_cliente)   -- cliente_x todavía no existe\n);', expectError: 'does not exist' } }
      ] },
      { id: 'alter', h: 'ALTER TABLE: modificar una tabla existente', body: [
        `<div class="tblwrap"><table><tr><th>Quiero…</th><th>Sentencia</th></tr>
<tr><td>Agregar una columna</td><td><code>ALTER TABLE entrenadores ADD COLUMN bono_mensual NUMERIC(8,2);</code></td></tr>
<tr><td>Eliminar una columna</td><td><code>ALTER TABLE entrenadores DROP COLUMN bono_mensual;</code></td></tr>
<tr><td>Renombrar una columna</td><td><code>ALTER TABLE socios RENAME COLUMN email TO correo;</code></td></tr>
<tr><td>Cambiar el tipo</td><td><code>ALTER TABLE socios ALTER COLUMN nombre TYPE VARCHAR(150);</code></td></tr>
<tr><td>Poner/quitar NOT NULL</td><td><code>ALTER TABLE socios ALTER COLUMN email SET NOT NULL;</code> / <code>DROP NOT NULL</code></td></tr>
<tr><td>Poner un DEFAULT</td><td><code>ALTER TABLE socios ALTER COLUMN tipo_membresia SET DEFAULT 'Básica';</code></td></tr>
<tr><td>Agregar una restricción</td><td><code>ALTER TABLE socios ADD CONSTRAINT ck_socios_edad CHECK (edad &gt;= 5);</code></td></tr>
<tr><td>Agregar una FK</td><td><code>ALTER TABLE libros ADD CONSTRAINT fk_autor FOREIGN KEY (id_autor) REFERENCES autores(id_autor);</code></td></tr>
<tr><td>Quitar una restricción</td><td><code>ALTER TABLE socios DROP CONSTRAINT ck_socios_edad;</code></td></tr>
<tr><td>Renombrar la tabla</td><td><code>ALTER TABLE socios RENAME TO miembros;</code></td></tr></table></div>`,
        { ex: { id: 'add', db: 'polideportivo', title: 'Agregar y renombrar columnas', sql: "ALTER TABLE entrenadores ADD COLUMN telefono VARCHAR(20);\nALTER TABLE entrenadores RENAME COLUMN salario_hora TO pago_hora;\nSELECT * FROM entrenadores;", note: 'Las filas que ya existían quedan con telefono = NULL.' } },
        { ex: { id: 'lab', db: 'biblioteca', title: 'Laboratorio Biblioteca: ALTER + UPDATE', sql: "-- (en la base de práctica ya se hizo; aquí se repite sobre una columna nueva)\nALTER TABLE libros ADD COLUMN idioma VARCHAR(30) DEFAULT 'Español';\nUPDATE libros SET idioma = 'Inglés' WHERE id_libro = 3;\nSELECT titulo, genero, idioma FROM libros;" } },
        { ex: { id: 'notnull', db: 'polideportivo', title: 'SET NOT NULL falla si ya hay filas con NULL', sql: 'ALTER TABLE entrenadores ALTER COLUMN bono_mensual SET NOT NULL;', expectError: 'contains null values' } }
      ] },
      { id: 'drop', h: 'DROP, TRUNCATE y DELETE: ¿cuál borra qué?', body: [
        `<div class="tblwrap"><table><tr><th>Sentencia</th><th>Tipo</th><th>Qué borra</th><th>¿Queda la tabla?</th></tr>
<tr><td><code>DELETE FROM t WHERE …;</code></td><td>DML</td><td>Las filas que cumplen el WHERE (todas si no hay WHERE)</td><td>Sí</td></tr>
<tr><td><code>TRUNCATE TABLE t;</code></td><td>DDL</td><td>Todas las filas, de golpe (más rápido, no admite WHERE)</td><td>Sí, vacía</td></tr>
<tr><td><code>DROP TABLE t;</code></td><td>DDL</td><td>La tabla completa: estructura + datos + restricciones</td><td>No</td></tr></table></div>`,
        { cols: [
          [{ ex: { id: 'trunc', db: 'polideportivo', title: 'TRUNCATE: la tabla queda vacía', sql: 'TRUNCATE TABLE inventario;\nSELECT COUNT(*) AS filas FROM inventario;' } }],
          [{ ex: { id: 'drop', db: 'polideportivo', title: 'DROP: la tabla deja de existir', sql: 'DROP TABLE inventario;\nSELECT * FROM inventario;', expectError: 'does not exist' } }]
        ] },
        '<p>Si otra tabla tiene una FK que apunta a la que quieres borrar, PostgreSQL no te deja:</p>',
        { ex: { id: 'dropfk', db: 'tienda', title: 'DROP de una tabla referenciada → error', sql: 'DROP TABLE CLIENTE;', expectError: 'depend' } },
        { ex: { id: 'dropcas', db: 'tienda', title: 'DROP … CASCADE quita también las FK que apuntaban a ella', sql: "DROP TABLE CLIENTE CASCADE;\n-- PEDIDO sigue existiendo, pero ya no tiene la FK hacia CLIENTE:\nSELECT constraint_name, constraint_type\nFROM information_schema.table_constraints\nWHERE table_name = 'pedido' AND table_schema = current_schema();" } },
        { tip: '<code>DROP TABLE IF EXISTS t;</code> no da error si la tabla no existe: es útil al comienzo de los scripts de laboratorio.' },
        { exam: 'Pregunta típica: "Diferencia entre DELETE, TRUNCATE y DROP". DELETE (DML) borra filas y admite WHERE; TRUNCATE (DDL) vacía la tabla completa; DROP (DDL) elimina la tabla con su estructura.' }
      ] }
    ],
    keys: ['DDL = estructura: CREATE, ALTER, DROP, TRUNCATE.',
      'CREATE TABLE: columna TIPO restricciones, separadas por comas, sin coma al final; las tablas referenciadas van primero.',
      'ALTER TABLE: ADD COLUMN, DROP COLUMN, RENAME COLUMN … TO, ALTER COLUMN … TYPE / SET NOT NULL / SET DEFAULT, ADD/DROP CONSTRAINT.',
      'DELETE borra filas (con WHERE); TRUNCATE vacía la tabla; DROP elimina la tabla.',
      'No se puede DROP una tabla referenciada por una FK, salvo con CASCADE.',
      'psql: CREATE DATABASE x; \\c x; \\dt; \\d tabla.'],
    quiz: [
      { q: '¿Qué sentencia agrega la columna telefono a la tabla clientes?', o: [
        { t: 'ALTER TABLE clientes ADD COLUMN telefono VARCHAR(20);', ok: true, why: 'Correcto: ALTER TABLE … ADD COLUMN nombre tipo.' },
        { t: 'UPDATE clientes ADD telefono VARCHAR(20);', why: 'UPDATE cambia valores de filas, no la estructura.' },
        { t: 'INSERT INTO clientes COLUMN telefono;', why: 'INSERT agrega filas, no columnas.' },
        { t: 'CREATE COLUMN telefono IN clientes;', why: 'No existe CREATE COLUMN.' }] },
      { q: '¿Cuál de estas sentencias elimina la tabla completa, incluida su estructura?', o: [
        { t: 'DROP TABLE inventario;', ok: true, why: 'Correcto: después de DROP la tabla ya no existe.' },
        { t: 'TRUNCATE TABLE inventario;', why: 'TRUNCATE borra las filas, pero la tabla queda (vacía).' },
        { t: 'DELETE FROM inventario;', why: 'DELETE borra filas; la estructura queda.' },
        { t: 'ALTER TABLE inventario DROP;', why: 'No es una sentencia válida.' }] },
      { q: 'TRUNCATE pertenece a…', o: [
        { t: 'DDL', ok: true, why: 'Correcto: aunque vacía datos, opera sobre la tabla completa y no admite WHERE.' },
        { t: 'DML', why: 'DELETE es el equivalente DML (fila por fila, con WHERE).' },
        { t: 'DCL', why: 'DCL son permisos.' },
        { t: 'DQL', why: 'DQL es SELECT.' }] },
      { q: '¿Qué error tiene este CREATE TABLE? <code>CREATE TABLE t ( id INT PRIMARY KEY, nombre VARCHAR(50), );</code>', o: [
        { t: 'Sobra la coma después de la última columna', ok: true, why: 'Correcto: PostgreSQL da error de sintaxis cerca de ")".' },
        { t: 'Falta NOT NULL en nombre', why: 'NOT NULL es opcional.' },
        { t: 'INT no puede ser PRIMARY KEY', why: 'Sí puede.' },
        { t: 'Falta un DEFAULT', why: 'DEFAULT es opcional.' }] },
      { q: 'Intentas <code>DROP TABLE clientes;</code> pero cuentas tiene una FK hacia clientes. ¿Qué pasa?', o: [
        { t: 'PostgreSQL lo rechaza porque otros objetos dependen de la tabla', ok: true, why: 'Correcto: habría que borrar antes la FK, o usar CASCADE.' },
        { t: 'Se borran clientes y cuentas', why: 'Ni siquiera con CASCADE se borra la tabla cuentas: solo se quita su FK.' },
        { t: 'Se borra clientes y las cuentas quedan con NULL', why: 'Eso sería ON DELETE SET NULL al borrar filas, no al borrar la tabla.' },
        { t: 'Se borra sin problema', why: 'La dependencia de la FK lo impide.' }] },
      { q: '¿Qué comando de psql te conecta a la base biblioteca?', o: [
        { t: '\\c biblioteca', ok: true, why: 'Correcto: \\c (connect) cambia de base de datos en psql.' },
        { t: 'USE biblioteca;', why: 'USE es de MySQL / SQL Server, no de PostgreSQL.' },
        { t: 'OPEN biblioteca;', why: 'No existe.' },
        { t: 'SELECT biblioteca;', why: 'SELECT consulta datos; no conecta.' }] }
    ],
    practice: { sql: ['ddl'], quiz: ['sql', 'lab'], labs: ['polideportivo', 'tienda', 'biblioteca'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
