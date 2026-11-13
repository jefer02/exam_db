/* Tema 1 · Conceptos base. Formato de bloques: ver js/views/learn.js */
(function (root) {
  (root.MODULES = root.MODULES || []).push({
    id: 'conceptos', n: 1, title: 'Conceptos base: BD, SGBD, tablas y tipos de datos', short: 'Conceptos base', minutes: 25,
    desc: 'Qué es una base de datos, qué hace un SGBD, tabla/registro/campo, tipos de datos y la metodología de diseño del curso.',
    goals: ['Explicar con tus palabras qué es una base de datos y qué es un SGBD (y su diferencia).',
      'Reconocer en una tabla qué es un registro (fila), un campo (columna) y la clave primaria.',
      'Elegir el tipo de dato correcto para cada columna.',
      'Nombrar las etapas de la metodología de diseño: Universo del Discurso → conceptual → lógico → normalización → físico.'],
    sections: [
      { id: 'bd', h: '¿Qué es una base de datos?', body: [
        '<p>Un <b>dato</b> es un valor suelto ("Carlos", 4.5, "2025-03-01"). La <b>información</b> aparece cuando los datos se organizan y relacionan: "Carlos sacó 4.5 en Bases de Datos".</p>',
        '<p>Una <b>base de datos (BD)</b> es una colección <b>organizada</b> de datos <b>relacionados entre sí</b>, guardada para que muchas personas y programas la consulten y la actualicen. Ejemplo del curso: la base <code>bd_estudiantes_joins</code> guarda estudiantes, cursos e inscripciones.</p>',
        { cols: [
          ['<h4>❌ Sin base de datos (archivos o Excel sueltos)</h4><ul><li><b>Redundancia:</b> el correo de un estudiante se copia en cada hoja.</li><li><b>Inconsistencia:</b> se cambia en una hoja y no en las otras.</li><li>Dos personas editando a la vez se pisan los cambios.</li><li>Cualquiera ve o borra cualquier cosa.</li></ul>'],
          ['<h4>✅ Con base de datos</h4><ul><li>Cada dato se guarda <b>una sola vez</b> y se relaciona con claves.</li><li><b>Reglas de integridad:</b> no se puede inscribir a un estudiante que no existe.</li><li>Acceso concurrente controlado (transacciones).</li><li>Permisos por usuario, respaldos y recuperación.</li></ul>']
        ] },
        { key: 'Base de datos = los datos organizados. No es el programa: el programa es el SGBD.' }
      ] },
      { id: 'sgbd', h: 'El SGBD: el programa que administra la base', body: [
        '<p>El <b>Sistema Gestor de Bases de Datos (SGBD)</b> es el software que crea, guarda, protege y consulta la base de datos. Nadie toca los archivos directamente: todo se le pide al SGBD con el lenguaje <b>SQL</b>.</p>',
        '<p>Ejemplos de SGBD relacionales: <b>PostgreSQL</b> (el que usamos en los laboratorios con <code>psql</code>), Oracle, SQL Server y MySQL.</p>',
        `<div class="mini" style="text-align:center;font-weight:600">Usuario o aplicación &nbsp;→&nbsp; <code>SELECT …</code> (SQL) &nbsp;→&nbsp; <span class="badge">SGBD: PostgreSQL</span> &nbsp;→&nbsp; 🗄 Base de datos (tablas)<br><span class="small">← el SGBD devuelve el resultado (filas)</span></div>`,
        '<h3>Funciones del SGBD</h3><ul><li><b>Definir</b> la estructura: tablas, columnas, restricciones (DDL).</li><li><b>Manipular</b> los datos: insertar, modificar, borrar (DML) y consultar (SELECT).</li><li><b>Integridad:</b> hacer cumplir PK, FK, NOT NULL, CHECK…</li><li><b>Concurrencia:</b> que varios usuarios trabajen a la vez sin dañar los datos (transacciones).</li><li><b>Seguridad:</b> usuarios y permisos (GRANT, REVOKE).</li><li><b>Respaldo y recuperación</b> ante fallos.</li></ul>',
        { exam: 'Pregunta típica: "¿Cuál es la diferencia entre BD y SGBD?" → La BD es el conjunto de datos organizados; el SGBD es el software que la administra y controla el acceso a ella.' },
        '<p>En este sitio corre un PostgreSQL real dentro de tu navegador. Pruébalo: este SELECT le pide al SGBD su versión.</p>',
        { ex: { id: 'version', db: 'bd_estudiantes_joins', sql: 'SELECT version();' } }
      ] },
      { id: 'tabla', h: 'Tabla, registro y campo', body: [
        '<p>En el modelo relacional los datos se guardan en <b>tablas</b>: estructuras de dos dimensiones con filas y columnas.</p>',
        `<div class="tblwrap"><table class="anat">
<caption class="small" style="caption-side:top;text-align:left">Tabla <b>estudiantes</b> (datos de clase)</caption>
<tr><th class="hl-col">id_estudiante 🔑</th><th>nombre</th><th>apellido</th><th>edad</th><th>ciudad</th></tr>
<tr><td class="hl-col pkc">1</td><td>Carlos</td><td>Perez</td><td>20</td><td>Pasto</td></tr>
<tr class="hl-row"><td class="hl-col pkc">2</td><td>Maria</td><td>Lopez</td><td>22</td><td>Cali</td></tr>
<tr><td class="hl-col pkc">3</td><td>Juan</td><td>Rodriguez</td><td>19</td><td>Pasto</td></tr>
</table></div>`,
        { cols: [
          ['<h4>Registro = fila = tupla</h4><p>Un ejemplar concreto: la fila verde es <i>la estudiante Maria</i>. Cada registro guarda los datos de una sola cosa.</p>'],
          ['<h4>Campo = columna = atributo</h4><p>Una característica que tienen todos los registros (<code>nombre</code>, <code>edad</code>). Cada campo tiene un <b>tipo de dato</b>.</p>'],
          ['<h4>Clave primaria (PK) 🔑</h4><p>El campo que identifica a cada registro sin repetirse y sin quedar vacío: <code>id_estudiante</code>.</p>']
        ] },
        '<h3>El mismo concepto con nombres distintos</h3>',
        `<div class="tblwrap"><table><tr><th>Modelo E/R (diseño)</th><th>Modelo relacional (teoría)</th><th>SQL (en el SGBD)</th></tr>
<tr><td>Entidad (ESTUDIANTE)</td><td>Relación</td><td>Tabla</td></tr>
<tr><td>Ejemplar / ocurrencia</td><td>Tupla</td><td>Fila / registro</td></tr>
<tr><td>Atributo</td><td>Atributo</td><td>Columna / campo</td></tr>
<tr><td>Dominio</td><td>Dominio</td><td>Tipo de dato + CHECK</td></tr>
<tr><td>Identificador</td><td>Clave primaria</td><td>PRIMARY KEY</td></tr></table></div>`,
        { warn: 'En el modelo relacional, "relación" significa <b>tabla</b>. No la confundas con la "relación" (interrelación) del modelo E/R, que es el rombo que une entidades.' },
        { ex: { id: 'tabla', db: 'bd_estudiantes_joins', title: 'Ver la tabla completa', sql: 'SELECT * FROM estudiantes;', note: '7 registros (filas) y 6 campos (columnas).' } },
        { reveal: { q: 'En la tabla cursos de clase, ¿cuántos registros hay y cuál es su clave primaria?', a: '<p>6 registros (Bases de Datos, Inteligencia Artificial, Programacion Python, Mineria de Datos, Desarrollo Web y Redes de Computadores). La clave primaria es <code>id_curso</code>.</p>' } }
      ] },
      { id: 'tipos', h: 'Tipos de datos', body: [
        '<p>Cada columna admite un solo tipo de dato. Elegirlo bien evita errores y ahorra espacio. Estos son los del curso:</p>',
        `<div class="tblwrap"><table><tr><th>Tipo</th><th>Para qué</th><th>Ejemplo</th></tr>
<tr><td><code>INT</code> / <code>SMALLINT</code> / <code>BIGINT</code></td><td>Enteros (rango normal, menor, amplio)</td><td><code>edad INT</code></td></tr>
<tr><td><code>SERIAL</code></td><td>Entero que se numera solo: 1, 2, 3… (PostgreSQL). Ideal para la PK</td><td><code>id_cliente SERIAL PRIMARY KEY</code></td></tr>
<tr><td><code>NUMERIC(p,s)</code> / <code>DECIMAL(p,s)</code></td><td>Decimales <b>exactos</b>: p dígitos en total, s después del punto. Para dinero y notas</td><td><code>precio NUMERIC(10,2)</code></td></tr>
<tr><td><code>FLOAT</code> / <code>REAL</code></td><td>Decimales aproximados (científicos)</td><td><code>temperatura FLOAT</code></td></tr>
<tr><td><code>CHAR(n)</code></td><td>Texto de longitud <b>fija</b></td><td><code>genero CHAR(1)</code></td></tr>
<tr><td><code>VARCHAR(n)</code> / <code>TEXT</code></td><td>Texto variable con máximo n / sin límite</td><td><code>nombre VARCHAR(100)</code></td></tr>
<tr><td><code>DATE</code> / <code>TIME</code> / <code>TIMESTAMP</code></td><td>Fecha / hora / fecha y hora. Se escriben <code>'AAAA-MM-DD'</code></td><td><code>fecha_nacimiento DATE</code></td></tr>
<tr><td><code>BOOLEAN</code></td><td>Verdadero o falso (TRUE / FALSE)</td><td><code>activo BOOLEAN</code></td></tr>
<tr><td><code>BLOB</code> / <code>JSON</code></td><td>Datos binarios / estructurados</td><td><code>configuracion JSON</code></td></tr></table></div>`,
        { tip: 'Teléfonos, documentos y números de cuenta van como <b>VARCHAR</b>, no como INT: no se suman, pueden empezar por 0 y pueden llevar signos (+57). Dinero siempre <b>NUMERIC</b>, nunca FLOAT.' },
        { ex: { id: 'float', db: 'bd_estudiantes_joins', title: '¿Por qué NUMERIC para dinero?', sql: 'SELECT 0.1::FLOAT + 0.2::FLOAT AS con_float,\n       0.1::NUMERIC + 0.2::NUMERIC AS con_numeric;', note: 'Con FLOAT la suma da 0.30000000000000004 (aproximado). <code>::</code> convierte un valor a otro tipo en PostgreSQL.' } },
        { reveal: { q: '¿Qué tipo usarías para: precio de un producto, fecha de un préstamo, ¿está activo?, número de cédula, nota final (0.0 a 5.0)?', a: '<p><code>NUMERIC(10,2)</code> · <code>DATE</code> · <code>BOOLEAN</code> · <code>VARCHAR(20)</code> · <code>NUMERIC(2,1)</code> o <code>DECIMAL(3,1)</code> (como en la tabla inscripciones de clase).</p>' } }
      ] },
      { id: 'metodologia', h: 'La metodología de diseño del curso', body: [
        '<p>Diseñar una base de datos es ir de la realidad a tablas implementadas, en etapas. Toda esta ruta de aprendizaje sigue ese orden:</p>',
        `<div class="tblwrap"><table><tr><th>Etapa</th><th>Qué produce</th><th>Herramienta</th><th>Tema</th></tr>
<tr><td>1. Universo del Discurso (UD)</td><td>Requisitos: qué datos necesita cada usuario</td><td>Entrevistas, enunciado del problema</td><td>—</td></tr>
<tr><td>2. Modelo conceptual</td><td>Vista abstracta, independiente del SGBD</td><td>Modelo Entidad-Relación (Chen, 1976)</td><td>Tema 2</td></tr>
<tr><td>3. Modelo lógico</td><td>Tablas, claves primarias y foráneas</td><td>Modelo relacional (Codd, 1970), pata de gallo</td><td>Temas 3 y 4</td></tr>
<tr><td>4. Validación</td><td>Quitar redundancia</td><td>Normalización (1FN, 2FN, 3FN)</td><td>Tema 5</td></tr>
<tr><td>5. Modelo físico</td><td>La BD creada en un SGBD concreto</td><td>SQL: CREATE TABLE (DDL)</td><td>Tema 6</td></tr></table></div>`,
        { key: 'Chen = 1976 = modelo Entidad-Relación (conceptual). Codd = 1970 = modelo relacional (lógico), basado en teoría de conjuntos y lógica de predicados.' }
      ] },
      { id: 'sql', h: 'El lenguaje SQL', body: [
        '<p><b>SQL</b> (Structured Query Language) es el lenguaje estándar (ISO/IEC 9075) para hablar con un SGBD relacional. Es <b>declarativo</b>: dices <i>qué</i> datos quieres, no <i>cómo</i> buscarlos. Las palabras clave no distinguen mayúsculas (<code>select</code> = <code>SELECT</code>).</p>',
        `<div class="tblwrap"><table><tr><th>Categoría</th><th>Para qué</th><th>Sentencias</th></tr>
<tr><td><b>DDL</b> (definición)</td><td>Crear, modificar y borrar estructuras</td><td>CREATE, ALTER, DROP, TRUNCATE</td></tr>
<tr><td><b>DML</b> (manipulación)</td><td>Insertar, modificar y borrar filas</td><td>INSERT, UPDATE, DELETE</td></tr>
<tr><td><b>DQL</b> (consulta)</td><td>Consultar sin modificar</td><td>SELECT</td></tr>
<tr><td><b>DCL</b> (control)</td><td>Dar y quitar permisos</td><td>GRANT, REVOKE</td></tr>
<tr><td><b>TCL</b> (transacciones)</td><td>Confirmar o deshacer cambios</td><td>BEGIN, COMMIT, ROLLBACK</td></tr></table></div>`,
        '<h3>Reglas de escritura del curso</h3><ul><li>Tablas con sustantivos (<code>CLIENTE</code>, <code>estudiantes</code>); columnas descriptivas en minúscula con guion bajo: <code>fecha_nacimiento</code>.</li><li>Sin espacios, tildes ni caracteres especiales en los nombres.</li><li>La PK como <code>id_tabla</code>; la FK con el mismo nombre que la PK que referencia (<code>id_carrera</code>).</li><li>No uses palabras reservadas como nombres (<code>ORDER</code>, <code>GROUP</code>, <code>USER</code>).</li><li>Cada sentencia termina en punto y coma <code>;</code>. Los textos van entre comillas <b>simples</b>.</li></ul>'
      ] }
    ],
    keys: ['BD = datos organizados y relacionados; SGBD = software que la administra (PostgreSQL, Oracle, SQL Server, MySQL).',
      'Tabla = relación; fila = registro = tupla; columna = campo = atributo.',
      'La clave primaria identifica cada fila: no se repite y no puede ser NULL.',
      'Dinero y notas: NUMERIC/DECIMAL. Teléfonos y documentos: VARCHAR. Fechas: DATE con formato \'AAAA-MM-DD\'.',
      'Metodología: UD → conceptual (E/R) → lógico (relacional) → normalización → físico (SQL).',
      'DDL (CREATE/ALTER/DROP), DML (INSERT/UPDATE/DELETE), DQL (SELECT), DCL (GRANT/REVOKE), TCL (COMMIT/ROLLBACK).'],
    quiz: [
      { q: '¿Cuál es la diferencia entre una base de datos y un SGBD?', o: [
        { t: 'La BD es el conjunto de datos organizados; el SGBD es el software que la crea, controla y consulta', ok: true, why: 'Correcto: PostgreSQL es un SGBD; bancodb es una base de datos administrada por él.' },
        { t: 'Son lo mismo con distinto nombre', why: 'No: uno es el contenido (datos) y el otro el programa que lo administra.' },
        { t: 'El SGBD es una tabla especial dentro de la BD', why: 'El SGBD no es una tabla; es el programa completo.' },
        { t: 'La BD es el programa y el SGBD los datos', why: 'Es al revés.' }] },
      { q: 'En una tabla, un <b>registro</b> es…', o: [
        { t: 'Una fila: los datos de un ejemplar concreto', ok: true, why: 'Correcto: registro = fila = tupla.' },
        { t: 'Una columna', why: 'Una columna es un campo o atributo.' },
        { t: 'El tipo de dato de una columna', why: 'El tipo de dato define qué valores admite un campo.' },
        { t: 'La clave primaria', why: 'La PK es un campo especial, no un registro.' }] },
      { q: '¿Qué tipo de dato es el más adecuado para el precio de un producto?', o: [
        { t: 'NUMERIC(10,2)', ok: true, why: 'Correcto: decimal exacto con 2 decimales, ideal para dinero.' },
        { t: 'FLOAT', why: 'FLOAT es aproximado (0.1 + 0.2 ≠ 0.3); no sirve para dinero.' },
        { t: 'VARCHAR(10)', why: 'Como texto no podrías sumar ni comparar precios correctamente.' },
        { t: 'BOOLEAN', why: 'BOOLEAN solo guarda verdadero o falso.' }] },
      { q: '¿Cuál es el orden correcto de la metodología de diseño?', o: [
        { t: 'Universo del Discurso → conceptual → lógico → normalización → físico', ok: true, why: 'Correcto: de la realidad a tablas implementadas en el SGBD.' },
        { t: 'Físico → lógico → conceptual → Universo del Discurso', why: 'Es el orden inverso: primero se entiende el problema y al final se implementa.' },
        { t: 'Conceptual → físico → normalización → lógico', why: 'La normalización valida el modelo lógico antes de pasar al físico.' },
        { t: 'Normalización → Universo del Discurso → lógico → físico', why: 'No se puede normalizar sin tener todavía un modelo.' }] },
      { q: '¿A qué categoría de SQL pertenece <code>ALTER TABLE</code>?', o: [
        { t: 'DDL', ok: true, why: 'Correcto: modifica la estructura de una tabla.' },
        { t: 'DML', why: 'DML trabaja con filas (INSERT, UPDATE, DELETE), no con la estructura.' },
        { t: 'DCL', why: 'DCL son permisos: GRANT y REVOKE.' },
        { t: 'TCL', why: 'TCL controla transacciones: COMMIT y ROLLBACK.' }] },
      { q: '¿Quién propuso el modelo relacional y en qué año?', o: [
        { t: 'Edgar F. Codd, 1970', ok: true, why: 'Correcto. Chen propuso el modelo E/R en 1976.' },
        { t: 'Peter Chen, 1976', why: 'Chen propuso el modelo Entidad-Relación, no el relacional.' },
        { t: 'Edgar F. Codd, 1976', why: 'El año es 1970.' },
        { t: 'Peter Chen, 1970', why: 'Mezcla autor y año: Chen es 1976 y E/R.' }] },
      { q: '¿Qué tipo usarías para un número de teléfono como "+57 300 111 2233"?', o: [
        { t: 'VARCHAR(20)', ok: true, why: 'Correcto: no se hacen cálculos con él y lleva signos y espacios.' },
        { t: 'INT', why: 'INT no admite "+" ni espacios y perdería los ceros a la izquierda; además el número puede no caber.' },
        { t: 'NUMERIC(10,2)', why: 'Un teléfono no tiene decimales ni se suma.' },
        { t: 'DATE', why: 'No es una fecha.' }] }
    ],
    practice: { quiz: ['met', 'sql'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
