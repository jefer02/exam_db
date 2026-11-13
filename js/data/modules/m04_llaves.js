/* Tema 4 · Llaves y restricciones de integridad. Los ejemplos con expectError deben fallar (verify.js lo comprueba). */
(function (root) {
  const EST = 'bd_estudiantes_joins', T = 'tienda';
  (root.MODULES = root.MODULES || []).push({
    id: 'llaves', n: 4, title: 'Llaves y restricciones de integridad', short: 'Llaves y restricciones', minutes: 40,
    desc: 'PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT e integridad referencial (ON DELETE / ON UPDATE CASCADE).',
    goals: ['Explicar qué garantiza cada restricción y escribirla en un CREATE TABLE.',
      'Distinguir clave primaria simple y compuesta, y clave natural y artificial (SERIAL).',
      'Explicar la integridad referencial y qué hacen ON DELETE / ON UPDATE CASCADE, SET NULL y RESTRICT.',
      'Reconocer el error que da PostgreSQL cuando se viola cada restricción.'],
    sections: [
      { id: 'porque', h: '¿Para qué sirven las restricciones?', body: [
        '<p>Las <b>restricciones de integridad</b> son reglas que el SGBD hace cumplir <b>siempre</b>, venga de donde venga el dato. Si un INSERT o UPDATE las viola, el SGBD lo <b>rechaza</b> y los datos no cambian.</p>',
        `<div class="tblwrap"><table><tr><th>Restricción</th><th>Función</th><th>Ejemplo</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>Identifica de forma única cada registro (única + no nula)</td><td><code>id INT PRIMARY KEY</code></td></tr>
<tr><td><code>FOREIGN KEY</code></td><td>Relaciona tablas: el valor debe existir en la tabla referenciada</td><td><code>FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera)</code></td></tr>
<tr><td><code>NOT NULL</code></td><td>Impide valores nulos (campo obligatorio)</td><td><code>nombre VARCHAR(100) NOT NULL</code></td></tr>
<tr><td><code>UNIQUE</code></td><td>Evita duplicados (clave alternativa)</td><td><code>correo VARCHAR(150) UNIQUE</code></td></tr>
<tr><td><code>CHECK</code></td><td>Valida una condición</td><td><code>edad INT CHECK (edad &gt;= 0)</code></td></tr>
<tr><td><code>DEFAULT</code></td><td>Valor por defecto si no se indica</td><td><code>activo BOOLEAN DEFAULT TRUE</code></td></tr>
<tr><td><code>SERIAL</code> / <code>IDENTITY</code> / <code>AUTO_INCREMENT</code></td><td>Valores incrementales (PostgreSQL / SQL Server / MySQL)</td><td><code>id SERIAL PRIMARY KEY</code></td></tr></table></div>`,
        '<p>Hay tres tipos de integridad: <b>de entidad</b> (toda fila tiene PK válida), <b>referencial</b> (toda FK apunta a algo que existe) y <b>de dominio</b> (cada valor es del tipo y rango correctos: tipos, NOT NULL, CHECK).</p>'
      ] },
      { id: 'pk', h: 'Clave primaria (PRIMARY KEY)', body: [
        '<p>La PK identifica cada fila: <b>no se puede repetir</b> y <b>no puede ser NULL</b>. Cada tabla tiene una sola PK, que puede ser de una columna (simple) o de varias (compuesta).</p>',
        { ex: { id: 'pkdup', db: EST, title: 'Intentar repetir una PK → error', sql: "INSERT INTO estudiantes (id_estudiante, nombre, apellido)\nVALUES (1, 'Pedro', 'Diaz');", expectError: 'duplicate key' } },
        { ex: { id: 'pknull', db: T, title: 'PK nula → error', sql: "INSERT INTO CLIENTE (id_cliente, nombre, email)\nVALUES (NULL, 'Pedro', 'pedro@mail.com');", expectError: 'not-null' } },
        '<h3>Clave natural y clave artificial (SERIAL)</h3><p>Una clave <b>natural</b> sale de la realidad (cédula, ISBN, NIT). Una <b>artificial</b> la genera el sistema: en PostgreSQL <code>SERIAL</code> crea un contador 1, 2, 3… y no hace falta escribir el id en el INSERT.</p>',
        { ex: { id: 'serial', db: EST, title: 'SERIAL asigna el siguiente número', sql: "INSERT INTO estudiantes (nombre, apellido, ciudad)\nVALUES ('Pedro', 'Diaz', 'Cali')\nRETURNING id_estudiante, nombre;", note: 'RETURNING (de PostgreSQL) muestra la fila insertada: le tocó el id 8.' } },
        '<h3>Clave primaria compuesta</h3><p>En DETALLE_PEDIDO la PK es <code>(id_pedido, id_producto)</code>: cada producto aparece una sola vez por pedido. Se puede repetir el pedido o el producto, pero no la <b>combinación</b>.</p>',
        { sql: 'CREATE TABLE DETALLE_PEDIDO (\n  id_pedido   INTEGER NOT NULL,\n  id_producto INTEGER NOT NULL,\n  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),\n  PRIMARY KEY (id_pedido, id_producto),          -- clave compuesta\n  FOREIGN KEY (id_pedido)   REFERENCES PEDIDO (id_pedido),\n  FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)\n);' },
        { ex: { id: 'pkcomp', db: T, title: 'Repetir la combinación (1001, 101) → error', sql: 'INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad)\nVALUES (1001, 101, 3);', expectError: 'duplicate key' } },
        { ex: { id: 'pkcomp2', db: T, title: 'Mismo pedido, otro producto → permitido', sql: 'INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad)\nVALUES (1001, 103, 1);\nSELECT * FROM DETALLE_PEDIDO WHERE id_pedido = 1001;' } }
      ] },
      { id: 'fk', h: 'Clave foránea (FOREIGN KEY) e integridad referencial', body: [
        '<p>Una FK obliga a que el valor <b>exista</b> como PK en la tabla referenciada (o sea NULL, si la columna lo permite). Así no puede haber una inscripción de un estudiante inexistente.</p>',
        { ex: { id: 'fkbad', db: EST, title: 'Inscribir al estudiante 99, que no existe → error', sql: "INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion)\nVALUES (99, 1, '2025-04-01');", expectError: 'foreign key' } },
        '<p>La regla también protege al borrar. Por defecto (<code>NO ACTION</code> / <code>RESTRICT</code>) no se puede borrar una fila padre que tiene hijos:</p>',
        { ex: { id: 'fkdel', db: EST, title: 'Borrar a Carlos, que tiene inscripciones → error', sql: 'DELETE FROM estudiantes WHERE id_estudiante = 1;', expectError: 'foreign key' } },
        { ex: { id: 'fkdel2', db: EST, title: 'Borrar a Daniel, que no tiene inscripciones → permitido', sql: 'DELETE FROM estudiantes WHERE id_estudiante = 7;\nSELECT COUNT(*) AS estudiantes_que_quedan FROM estudiantes;' } },
        '<h3>ON DELETE y ON UPDATE: qué hacer con los hijos</h3>',
        `<div class="tblwrap"><table><tr><th>Opción</th><th>Al borrar/actualizar el padre…</th></tr>
<tr><td><code>NO ACTION</code> / <code>RESTRICT</code> (por defecto)</td><td>Se rechaza si tiene hijos</td></tr>
<tr><td><code>CASCADE</code></td><td>Borra (o actualiza) también los hijos</td></tr>
<tr><td><code>SET NULL</code></td><td>Pone NULL en la FK de los hijos</td></tr>
<tr><td><code>SET DEFAULT</code></td><td>Pone el valor DEFAULT en la FK de los hijos</td></tr></table></div>`,
        { ex: { id: 'cascade', db: EST, title: 'ON DELETE CASCADE: borrar la facultad borra sus programas', sql: "CREATE TABLE facultad (\n  id_facultad INT PRIMARY KEY,\n  nombre      VARCHAR(50) NOT NULL\n);\nCREATE TABLE programa (\n  id_programa INT PRIMARY KEY,\n  nombre      VARCHAR(50) NOT NULL,\n  id_facultad INT REFERENCES facultad(id_facultad)\n              ON DELETE CASCADE ON UPDATE CASCADE\n);\nINSERT INTO facultad VALUES (1, 'Ingeniería'), (2, 'Salud');\nINSERT INTO programa VALUES (10, 'Ing. Software', 1), (11, 'Ing. Civil', 1), (20, 'Medicina', 2);\n\nDELETE FROM facultad WHERE id_facultad = 1;\nSELECT * FROM programa;   -- solo queda Medicina", note: 'Los ejemplos se ejecutan en una copia que se descarta: puedes correrlos las veces que quieras.' } },
        { ex: { id: 'updcascade', db: EST, title: 'ON UPDATE CASCADE: cambiar la PK actualiza las FK', sql: "CREATE TABLE facultad (id_facultad INT PRIMARY KEY, nombre VARCHAR(50));\nCREATE TABLE programa (\n  id_programa INT PRIMARY KEY, nombre VARCHAR(50),\n  id_facultad INT REFERENCES facultad(id_facultad) ON UPDATE CASCADE\n);\nINSERT INTO facultad VALUES (2, 'Salud');\nINSERT INTO programa VALUES (20, 'Medicina', 2), (21, 'Enfermería', 2);\n\nUPDATE facultad SET id_facultad = 5 WHERE id_facultad = 2;\nSELECT * FROM programa;   -- ahora apuntan a 5" } },
        { ex: { id: 'setnull', db: EST, title: 'ON DELETE SET NULL: los hijos quedan sin padre', sql: "CREATE TABLE docente (id_docente INT PRIMARY KEY, nombre VARCHAR(50));\nCREATE TABLE asignatura (\n  codigo VARCHAR(10) PRIMARY KEY, nombre VARCHAR(50),\n  id_docente INT REFERENCES docente(id_docente) ON DELETE SET NULL\n);\nINSERT INTO docente VALUES (1, 'Cristian Ordoñez');\nINSERT INTO asignatura VALUES ('BD1', 'Bases de Datos', 1), ('BD2', 'Sistemas Transaccionales', 1);\n\nDELETE FROM docente WHERE id_docente = 1;\nSELECT * FROM asignatura;   -- id_docente quedó NULL" } },
        { exam: 'Pregunta típica: "¿Qué pasa si borro un cliente que tiene pedidos?" → Depende de la FK: con la opción por defecto el SGBD rechaza el DELETE; con ON DELETE CASCADE borra también sus pedidos; con ON DELETE SET NULL los pedidos quedan con id_cliente NULL.' }
      ] },
      { id: 'otras', h: 'NOT NULL, UNIQUE, CHECK y DEFAULT', body: [
        '<p>Base <b>tienda</b> de clase: <code>email VARCHAR(100) NOT NULL UNIQUE</code> y <code>precio NUMERIC(10,2) NOT NULL CHECK (precio &gt; 0)</code>.</p>',
        { cols: [
          [{ ex: { id: 'uq', db: T, title: 'UNIQUE: correo repetido → error', sql: "INSERT INTO CLIENTE (id_cliente, nombre, email)\nVALUES (3, 'Otra Ana', 'ana@mail.com');", expectError: 'duplicate key' } }],
          [{ ex: { id: 'nn', db: T, title: 'NOT NULL: sin email → error', sql: "INSERT INTO CLIENTE (id_cliente, nombre)\nVALUES (3, 'Pedro');", expectError: 'not-null' } }]
        ] },
        { ex: { id: 'ck', db: T, title: 'CHECK: precio negativo → error', sql: "INSERT INTO PRODUCTO (id_producto, nombre, precio)\nVALUES (104, 'Cable', -5000);", expectError: 'check constraint' } },
        { ex: { id: 'def', db: T, title: 'DEFAULT: los valores que no escribes se llenan solos', sql: "CREATE TABLE socio_demo (\n  id_socio       SERIAL PRIMARY KEY,\n  nombre         VARCHAR(50) NOT NULL,\n  activo         BOOLEAN DEFAULT TRUE,\n  tipo           VARCHAR(10) DEFAULT 'Básica' CHECK (tipo IN ('Básica','Premium','VIP')),\n  fecha_registro DATE DEFAULT CURRENT_DATE\n);\nINSERT INTO socio_demo (nombre) VALUES ('Ana');\nINSERT INTO socio_demo (nombre, tipo) VALUES ('Luis', 'VIP');\nSELECT * FROM socio_demo;" } },
        { warn: 'UNIQUE permite varios NULL (NULL no es igual a NULL). Si el campo es obligatorio y único, escribe <code>NOT NULL UNIQUE</code>, como email en la tienda.' },
        '<h3>Restricciones con nombre y ALTER TABLE</h3><p>Se pueden declarar en la columna, al final de la tabla o después con ALTER TABLE. Ponerles nombre (<code>ck_</code>, <code>fk_</code>, <code>uq_</code>) ayuda a leer los errores y a borrarlas. Es lo que pide el laboratorio del polideportivo:</p>',
        { sql: "ALTER TABLE socios ADD CONSTRAINT ck_socios_edad CHECK (edad >= 5);\nALTER TABLE socios DROP CONSTRAINT ck_socios_edad;" },
        { ex: { id: 'altck', db: EST, title: 'Agregar un CHECK y probarlo', sql: "ALTER TABLE estudiantes ADD CONSTRAINT ck_edad CHECK (edad >= 15);\nINSERT INTO estudiantes (nombre, apellido, edad) VALUES ('Niño', 'Prueba', 10);", expectError: 'check constraint' } },
        { ex: { id: 'altck2', db: EST, title: 'No se puede agregar un CHECK que los datos actuales ya violan', sql: 'ALTER TABLE estudiantes ADD CONSTRAINT ck_mayores CHECK (edad > 20);', expectError: 'violated by some row', note: 'Juan (19) y Carlos (20) no cumplen edad &gt; 20.' } }
      ] }
    ],
    keys: ['PK = única + no nula; una por tabla; puede ser compuesta (id_pedido, id_producto).',
      'FK = el valor debe existir en la tabla referenciada; protege al insertar y al borrar.',
      'Por defecto no se puede borrar un padre con hijos; CASCADE borra los hijos; SET NULL deja la FK en NULL.',
      'NOT NULL obliga; UNIQUE evita duplicados (permite NULL); CHECK valida una condición; DEFAULT da valor por defecto.',
      'SERIAL (PostgreSQL) genera la PK 1, 2, 3…; se omite en el INSERT.',
      'ALTER TABLE … ADD CONSTRAINT nombre CHECK (…) agrega reglas después de crear la tabla.'],
    quiz: [
      { q: '¿Qué dos condiciones cumple siempre una clave primaria?', o: [
        { t: 'No se repite y no es NULL', ok: true, why: 'Correcto: PRIMARY KEY = UNIQUE + NOT NULL.' },
        { t: 'Es numérica y autoincremental', why: 'Puede ser texto (ISBN, NIT) y no tiene que ser SERIAL.' },
        { t: 'Es una sola columna y empieza en 1', why: 'Puede ser compuesta y tener cualquier valor válido.' },
        { t: 'Apunta a otra tabla', why: 'Eso lo hace la clave foránea.' }] },
      { q: 'La FK inscripciones.id_estudiante no tiene ON DELETE. ¿Qué pasa al borrar un estudiante que tiene inscripciones?', o: [
        { t: 'PostgreSQL rechaza el DELETE (violación de clave foránea)', ok: true, why: 'Correcto: la opción por defecto (NO ACTION) impide dejar hijos huérfanos.' },
        { t: 'Se borran también sus inscripciones', why: 'Eso solo pasa con ON DELETE CASCADE.' },
        { t: 'Las inscripciones quedan con id_estudiante NULL', why: 'Eso solo pasa con ON DELETE SET NULL.' },
        { t: 'Se borra el estudiante y quedan inscripciones huérfanas', why: 'Justamente eso es lo que evita la integridad referencial.' }] },
      { q: '¿Qué restricción usarías para que el correo de un cliente no se repita?', o: [
        { t: 'UNIQUE', ok: true, why: 'Correcto (y NOT NULL si además es obligatorio).' },
        { t: 'CHECK', why: 'CHECK valida una condición de cada fila; no compara contra otras filas.' },
        { t: 'DEFAULT', why: 'DEFAULT solo da un valor cuando no se indica uno.' },
        { t: 'FOREIGN KEY', why: 'La FK relaciona tablas, no evita duplicados.' }] },
      { q: 'Con <code>FOREIGN KEY (id_facultad) REFERENCES facultad ON DELETE CASCADE</code>, al borrar una facultad…', o: [
        { t: 'Se borran automáticamente los programas de esa facultad', ok: true, why: 'Correcto: CASCADE propaga el borrado a los hijos.' },
        { t: 'Se rechaza el borrado', why: 'Ese es el comportamiento por defecto, sin CASCADE.' },
        { t: 'Los programas quedan con id_facultad NULL', why: 'Eso es SET NULL.' },
        { t: 'No pasa nada con los programas', why: 'Quedarían huérfanos: la FK no lo permite.' }] },
      { q: 'En DETALLE_PEDIDO con PRIMARY KEY (id_pedido, id_producto), ¿cuál INSERT falla si ya existe (1001, 101)?', o: [
        { t: '(1001, 101, 5)', ok: true, why: 'Correcto: repite la combinación completa de la PK compuesta.' },
        { t: '(1001, 103, 1)', why: 'Mismo pedido, otro producto: es otra combinación, se permite.' },
        { t: '(1002, 101, 1)', why: 'Otro pedido con el mismo producto: también se permite.' },
        { t: 'Ninguno falla', why: 'La PK compuesta no permite repetir la combinación.' }] },
      { q: '¿Qué hace <code>activo BOOLEAN DEFAULT TRUE</code>?', o: [
        { t: 'Si el INSERT no menciona activo, se guarda TRUE', ok: true, why: 'Correcto: DEFAULT se usa solo cuando no se da un valor.' },
        { t: 'Impide guardar FALSE', why: 'Se puede guardar FALSE escribiéndolo explícitamente.' },
        { t: 'Obliga a escribir activo en cada INSERT', why: 'Al contrario: lo vuelve opcional en el INSERT.' },
        { t: 'Convierte activo en clave primaria', why: 'DEFAULT no tiene relación con la PK.' }] },
      { q: '¿Cuál es la sintaxis correcta para agregar una restricción a una tabla existente?', o: [
        { t: 'ALTER TABLE socios ADD CONSTRAINT ck_edad CHECK (edad >= 5);', ok: true, why: 'Correcto: ALTER TABLE … ADD CONSTRAINT nombre tipo (condición).' },
        { t: 'UPDATE socios SET CHECK (edad >= 5);', why: 'UPDATE modifica datos, no la estructura.' },
        { t: 'INSERT CONSTRAINT INTO socios CHECK (edad >= 5);', why: 'No existe esa sentencia.' },
        { t: 'CREATE CHECK ck_edad ON socios (edad >= 5);', why: 'No existe CREATE CHECK.' }] }
    ],
    practice: { sql: ['ddl'], quiz: ['sql', 'rel'], labs: ['tienda'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
