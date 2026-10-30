/* Resumen teórico por tema (basado en el contenido del curso). html = contenido. */
window.THEORY = [
  {
    id: 'met', title: '1. Metodología de diseño', html: `
<p>Diseñar una base de datos es pasar de la realidad a un esquema implementado, por niveles de abstracción decrecientes:</p>
<ol>
<li><b>Universo del Discurso (UD):</b> la parte de la realidad que interesa, vista por los usuarios.</li>
<li><b>Modelo conceptual (E/R, Chen 1976):</b> entidades, atributos y relaciones. Independiente del SGBD.</li>
<li><b>Modelo lógico (relacional, Codd 1970):</b> tablas, claves primarias y foráneas.</li>
<li><b>Normalización:</b> perfecciona el relacional (1FN, 2FN, 3FN).</li>
<li><b>Modelo físico:</b> implementación en un SGBD concreto (DDL, índices, restricciones).</li>
</ol>
<div class="tip"><b>Memoriza:</b> Chen = 1976 = conceptual · Codd = 1970 = relacional (conjuntos y lógica de predicados).</div>
<p>Evaluación: Momento 1 = 0 %, Momento 2 = 30 %, <b>Momento 3 = 70 %</b>.</p>`
  },
  {
    id: 'er', title: '2. Modelo Entidad-Relación', html: `
<h4>Entidades</h4>
<ul><li><b>Fuerte:</b> existe por sí misma (rectángulo).</li><li><b>Débil:</b> depende de otra (doble rectángulo). Dependencia en <b>existencia</b> o en <b>identificación</b>.</li></ul>
<h4>Atributos</h4>
<table><tr><th>Tipo</th><th>Significado</th><th>Al pasar a relacional</th></tr>
<tr><td>Simple</td><td>Un solo valor indivisible</td><td>Columna</td></tr>
<tr><td>Compuesto</td><td>Se divide en partes (fecha: día, mes, año)</td><td>Varias columnas</td></tr>
<tr><td>Multivaluado</td><td>Varios valores (teléfonos)</td><td>Tabla nueva</td></tr>
<tr><td>Derivado</td><td>Se calcula (edad)</td><td>Se ignora</td></tr>
<tr><td>Opcional</td><td>Puede quedar vacío</td><td>Columna sin NOT NULL</td></tr>
<tr><td>Clave principal</td><td>Identifica al ejemplar</td><td>PRIMARY KEY</td></tr>
<tr><td>Clave alternativa</td><td>Otro identificador posible</td><td>UNIQUE</td></tr>
<tr><td>Dominio</td><td>Valores posibles</td><td>CHECK o tabla con FK</td></tr></table>
<h4>Relaciones</h4>
<ul><li><b>Grado:</b> nº de entidades (binaria, ternaria…). <b>Reflexiva:</b> una entidad con ella misma (roles).</li>
<li><b>Cardinalidad (min,max):</b> (0,1), (1,1), (0,n), (1,n).</li>
<li><b>Correspondencia:</b> sale de los máximos → 1:1, 1:N, N:M.</li></ul>
<div class="tip"><b>Cómo leer:</b> la cardinalidad escrita junto a una entidad dice con cuántos ejemplares de la otra se relaciona <i>cada</i> ejemplar de esa entidad.</div>
<h4>Del enunciado al modelo</h4>
<p>Sustantivos → entidades o atributos; verbos → relaciones. No se modela la organización dueña del sistema si solo hay una instancia. Los atributos que dependen del par (fecha de reserva, cantidad) van en la relación.</p>`
  },
  {
    id: 'avz', title: '3. E/R avanzado', html: `
<h4>Dependencias</h4>
<ul><li><b>Existencia:</b> la débil no puede existir sin la fuerte.</li>
<li><b>Identificación:</b> además, la débil necesita la clave de la fuerte para identificarse (Edición = cod_Curso + num_Edicion).</li>
<li>Identificación ⊂ existencia (toda identificación es existencia, no al revés).</li></ul>
<h4>Generalización / especialización (“es un”)</h4>
<ul><li>Supertipo con atributos comunes y clave; subtipos con atributos propios.</li>
<li><b>Solapamiento</b> (puede ser varios) vs <b>exclusividad</b> (solo uno).</li>
<li><b>Totalidad</b> (debe ser algún subtipo) vs <b>parcialidad</b> (no es obligatorio).</li></ul>
<h4>Ternarias y agregación</h4>
<p>Ternaria: tres entidades y 6 lecturas coherentes (normalmente N:M). Agregación: cuando hay que relacionar una <i>interrelación</i> con otra entidad.</p>
<h4>Restricciones entre interrelaciones</h4>
<table><tr><th>Restricción</th><th>Idea</th></tr>
<tr><td>Exclusividad</td><td>Un ejemplar de A usa R1 <i>o</i> R2, no ambas.</td></tr>
<tr><td>Exclusión</td><td>El mismo par (a,b) no puede estar en R1 y en R2.</td></tr>
<tr><td>Inclusividad</td><td>Para estar en R2, A tuvo que estar en R1 (con cualquier B).</td></tr>
<tr><td>Inclusión</td><td>Para estar en R2, el par (a,b) debió estar en R1.</td></tr></table>
<p>Se implementan con restricciones adicionales en SQL (CHECK).</p>`
  },
  {
    id: 'rel', title: '4. Transformación al modelo relacional', html: `
<table><tr><th>Elemento</th><th>Regla</th></tr>
<tr><td>Entidad</td><td>Tabla; identificador = PK; alternativos = UNIQUE</td></tr>
<tr><td>Derivado</td><td>Se ignora</td></tr>
<tr><td>Compuesto</td><td>Se descompone</td></tr>
<tr><td>Multivaluado</td><td>Tabla con PK (clave de la entidad + atributo)</td></tr>
<tr><td>Dominio fijo</td><td>CHECK</td></tr>
<tr><td>Dominio que crece</td><td>Tabla nueva + FK</td></tr>
<tr><td>1:N</td><td>Clave del lado 1 viaja como FK al lado N (NOT NULL si la participación mínima es 1)</td></tr>
<tr><td>N:M</td><td>Tabla nueva, PK = concatenación de ambas claves (ambas FK) + atributos de la relación</td></tr>
<tr><td>1:1 (0,1)-(0,1)</td><td>Tabla nueva</td></tr>
<tr><td>1:1 (0,1)-(1,1)</td><td>FK (UNIQUE, NOT NULL) en la tabla de participación obligatoria</td></tr>
<tr><td>1:1 (1,1)-(1,1)</td><td>FK en cualquier sentido según accesos</td></tr>
<tr><td>Reflexiva 1:N</td><td>FK a la misma tabla (o tabla aparte)</td></tr>
<tr><td>n-aria</td><td>Tabla con las claves de todas las entidades</td></tr>
<tr><td>Débil (identificación)</td><td>PK = clave de la fuerte + discriminador; FK NOT NULL</td></tr></table>
<h4>Generalización: 3 opciones</h4>
<ol><li><b>Tabla única</b> con atributo discriminante (pocos atributos distintos). Discriminante NOT NULL si es total.</li>
<li><b>Supertipo + subtipos</b> con la clave del supertipo (solapamiento/parcialidad, muchos atributos distintos).</li>
<li><b>Solo subtipos</b> con atributos comunes (totalidad y exclusividad).</li></ol>`
  },
  {
    id: 'pg', title: '5. Diagramas de Pata de Gallo', html: `
<p>Cada entidad es una <b>tabla</b> con sus columnas (PK y FK marcadas). Las líneas llevan en el extremo el símbolo de cardinalidad:</p>
<table><tr><th>Símbolo</th><th>Significado</th></tr>
<tr><td><code>||</code></td><td>Exactamente uno (1,1)</td></tr>
<tr><td><code>o|</code></td><td>Cero o uno (0,1)</td></tr>
<tr><td><code>|&lt;</code></td><td>Uno o muchos (1,n)</td></tr>
<tr><td><code>o&lt;</code></td><td>Cero o muchos (0,n)</td></tr></table>
<ul><li>La FK queda en la tabla del lado “patas” (N).</li>
<li>Las N:M se convierten en tabla asociativa con dos relaciones 1:N (ej. DETALLE_VENTA).</li>
<li>El símbolo que se dibuja en el extremo de una entidad refleja cuántos ejemplares de ESA entidad corresponden a uno de la otra.</li>
<li>Dos relaciones entre las mismas entidades → dos FK con nombres distintos (origen/destino).</li></ul>
<div class="tip">Paso a paso en el examen: 1) lista entidades, 2) atributos y PK, 3) relaciones con su (min,max), 4) N:M → tabla asociativa, 5) coloca las FK, 6) dibuja símbolos.</div>`
  },
  {
    id: 'sql', title: '6. SQL', html: `
<h4>Clasificación</h4>
<p><b>DDL</b> CREATE/ALTER/DROP · <b>DML</b> INSERT/UPDATE/DELETE · <b>DQL</b> SELECT · <b>DCL</b> GRANT/REVOKE · <b>TCL</b> COMMIT/ROLLBACK.</p>
<h4>Tipos y restricciones</h4>
<p>INT, SERIAL (PostgreSQL), NUMERIC(p,s), VARCHAR(n), CHAR(n), DATE, TIMESTAMP, BOOLEAN. PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, DEFAULT.</p>
<pre>CREATE TABLE cliente (
  id_cliente SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  correo     VARCHAR(100) UNIQUE
);
CREATE TABLE pedido (
  id_pedido  SERIAL PRIMARY KEY,
  fecha      DATE DEFAULT CURRENT_DATE,
  total      NUMERIC(10,2) CHECK (total >= 0),
  id_cliente INT NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);
CREATE TABLE detalle_pedido (
  id_pedido   INT,
  id_producto INT,
  cantidad    INT CHECK (cantidad > 0),
  PRIMARY KEY (id_pedido, id_producto),
  FOREIGN KEY (id_pedido)   REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);</pre>
<div class="tip">Crea primero las tablas referenciadas; inserta primero las filas referenciadas.</div>
<h4>Consultas</h4>
<pre>SELECT   columnas / agregados
FROM     tabla [JOIN otra ON ...]
WHERE    filtro de filas
GROUP BY columnas
HAVING   filtro de grupos
ORDER BY columna [ASC|DESC];</pre>
<ul><li>Operadores: = &lt;&gt; &lt; &gt; &lt;= &gt;= AND OR NOT IN BETWEEN LIKE ('L%', '%@gmail.com') IS NULL.</li>
<li>Agregados: COUNT, SUM, AVG, MIN, MAX (ignoran NULL salvo COUNT(*)).</li>
<li>Modificar: <code>ALTER TABLE t ADD col tipo;</code> <code>ALTER TABLE t ADD CONSTRAINT ck CHECK (...);</code> <code>UPDATE t SET c=v WHERE ...;</code> <code>DELETE FROM t WHERE ...;</code> <code>DROP TABLE t;</code></li>
<li>psql: <code>CREATE DATABASE x;</code> <code>\\c x</code> <code>\\dt</code> <code>\\d tabla</code></li></ul>`
  },
  {
    id: 'norm', title: '7. Normalización', html: `
<p>Objetivo: reducir redundancia y evitar anomalías de <b>inserción</b>, <b>actualización</b> y <b>eliminación</b>.</p>
<table><tr><th>Forma</th><th>Condición</th></tr>
<tr><td>1FN</td><td>Valores atómicos, sin grupos repetitivos, clave definida.</td></tr>
<tr><td>2FN</td><td>1FN + ningún atributo no primo depende de PARTE de una clave compuesta.</td></tr>
<tr><td>3FN</td><td>2FN + ningún atributo no primo depende de otro atributo no primo (sin transitividad).</td></tr></table>
<div class="tip"><b>Receta:</b> 1) lista las dependencias funcionales, 2) halla la clave, 3) revisa 1FN → 2FN → 3FN, 4) separa y verifica que el JOIN reconstruye la tabla original.</div>
<p><b>Atributo primo:</b> pertenece a alguna clave candidata. Con clave simple, 1FN ⇒ 2FN.</p>`
  }
];
