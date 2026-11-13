/* Tema 2 · Modelo Entidad-Relación y diagramas de Chen.
   Convención de cardinalidad (la de cases.js y erd.js): en una relación {a, b, ca, cb},
   ca = (mín, máx) de ejemplares de B con los que se relaciona UN ejemplar de A; se dibuja junto a A. */
(function (root) {
  const K = (n, t) => ({ n, t: t || 'INT', pk: 1 });
  const A = (n, t, o) => Object.assign({ n, t: t || 'VARCHAR(100)', nn: 1 }, o || {});
  const OPT = (n, t) => ({ n, t: t || 'VARCHAR(100)' });

  // Ejemplo 2 de la guía: biblioteca universitaria (Usuario 1—N Prestamo N—1 Libro)
  const bibEnts = (withAttrs) => [
    { n: 'USUARIO', cp: [0, 0], pos: [0, 0], attrs: withAttrs ? [K('id_usuario', 'SERIAL'), A('nombre'), A('documento', 'VARCHAR(20)', { uq: 1 }), OPT('telefono', 'VARCHAR(20)')] : [] },
    { n: 'PRESTAMO', cp: [1, 0], pos: [1, 0], attrs: withAttrs ? [K('id_prestamo', 'SERIAL'), A('fecha_prestamo', 'DATE'), OPT('fecha_devolucion', 'DATE'), A('estado', 'VARCHAR(10)', { ck: "estado IN ('activo','devuelto','vencido')" })] : [] },
    { n: 'LIBRO', cp: [2, 0], pos: [2, 0], attrs: withAttrs ? [K('id_libro', 'SERIAL'), A('titulo', 'VARCHAR(150)'), A('autor'), A('isbn', 'VARCHAR(20)', { uq: 1 }), OPT('anio', 'INT')] : [] }
  ];
  const bibRels = [
    { n: 'realiza', a: 'USUARIO', b: 'PRESTAMO', ca: [0, 'n'], cb: [1, 1] },
    { n: 'se_presta', a: 'LIBRO', b: 'PRESTAMO', ca: [0, 'n'], cb: [1, 1] }
  ];
  const BIB0 = { entities: bibEnts(false) };
  const BIB1 = { entities: bibEnts(true) };
  const BIB2 = { entities: bibEnts(true), rels: bibRels };

  const PERSONA = { entities: [{ n: 'PERSONA', cp: [0, 0], attrs: [K('id_persona'), A('nombre'), { n: 'telefono', t: 'VARCHAR(20)', multi: 1 }, A('fecha_nacimiento', 'DATE'), { n: 'edad', t: 'INT', derived: 1 }, OPT('pasatiempo', 'VARCHAR(50)')] }] };
  const DEBIL = { entities: [
    { n: 'CLIENTE', cp: [0, 0], pos: [0, 0], attrs: [K('id_cliente'), A('nombre')] },
    { n: 'CUENTA', cp: [1, 0], pos: [1, 0], weak: 1, attrs: [K('num_cuenta'), A('saldo', 'NUMERIC(14,2)')] }],
  rels: [{ n: 'tiene', a: 'CLIENTE', b: 'CUENTA', ca: [0, 'n'], cb: [1, 1], ident: 1 }] };
  const REFLEXIVA = { entities: [{ n: 'EMPLEADO', cp: [0, 0], pos: [0, 0], attrs: [K('id_empleado'), A('nombre'), A('cargo', 'VARCHAR(50)')] }],
    rels: [{ n: 'supervisa', a: 'EMPLEADO', b: 'EMPLEADO', ca: [0, 'n'], cb: [0, 1], fk: 'id_supervisor' }] };
  const UNO_UNO = { entities: [
    { n: 'DECANO', cp: [0, 0], pos: [0, 0], attrs: [K('id_decano'), A('nombre')] },
    { n: 'FACULTAD', cp: [1, 0], pos: [1, 0], attrs: [K('id_facultad'), A('nombre')] }],
  rels: [{ n: 'dirige', a: 'DECANO', b: 'FACULTAD', ca: [1, 1], cb: [1, 1] }] };
  const UNO_N = { entities: [
    { n: 'PROFESOR', cp: [0, 0], pos: [0, 0], attrs: [K('id_profesor'), A('nombre')] },
    { n: 'ASIGNATURA', cp: [1, 0], pos: [1, 0], attrs: [K('codigo', 'VARCHAR(10)'), A('nombre')] }],
  rels: [{ n: 'imparte', a: 'PROFESOR', b: 'ASIGNATURA', ca: [0, 'n'], cb: [1, 1] }] };
  const N_M = { entities: [
    { n: 'ESTUDIANTE', cp: [0, 0], pos: [0, 0], attrs: [K('id_estudiante'), A('nombre')] },
    { n: 'CURSO', cp: [1, 0], pos: [2, 0], attrs: [K('id_curso'), A('nombre_curso')] }],
  rels: [{ n: 'se_matricula', a: 'ESTUDIANTE', b: 'CURSO', ca: [1, 'n'], cb: [0, 'n'], table: 'matricula', pos: [1, 0], attrs: [{ n: 'nota_final', t: 'DECIMAL(3,1)' }] }] };

  (root.MODULES = root.MODULES || []).push({
    id: 'er', n: 2, title: 'Modelo Entidad-Relación y diagramas de Chen', short: 'Modelo E/R (Chen)', minutes: 60,
    desc: 'Entidades, atributos, relaciones, cardinalidad (1:1, 1:N, N:M), herencia y cómo dibujar un diagrama de Chen paso a paso.',
    goals: ['Identificar entidades, atributos y relaciones a partir de un enunciado (técnica de sustantivos y verbos).',
      'Dibujar cada tipo de atributo y de relación en notación de Chen.',
      'Poner cardinalidades (mín, máx) y deducir la correspondencia 1:1, 1:N o N:M.',
      'Dibujar un diagrama de Chen completo paso a paso.',
      'Reconocer herencia, entidades débiles, ternarias y agregación.'],
    sections: [
      { id: 'que', h: '¿Qué es el modelo E/R?', body: [
        '<p>El <b>Modelo Entidad-Relación</b> (Peter Chen, 1976) es el modelo <b>conceptual</b> más usado. Sirve para dibujar <i>qué</i> información necesita el sistema antes de pensar en tablas o en SQL: es independiente del SGBD.</p>',
        '<p>Según el curso, el modelo E/R "permite tener una vista unificada de los datos, adoptando el enfoque más natural del mundo real que consiste en entidades e interrelaciones". Tiene cuatro elementos:</p>',
        `<div class="tblwrap"><table><tr><th>Elemento</th><th>Qué es</th><th>Símbolo en Chen</th></tr>
<tr><td><b>Entidad</b></td><td>Cosa u objeto del que se guarda información</td><td>Rectángulo con el nombre en singular</td></tr>
<tr><td><b>Atributo</b></td><td>Característica de una entidad o relación</td><td>Círculo u óvalo unido a la entidad</td></tr>
<tr><td><b>Relación (interrelación)</b></td><td>Asociación entre entidades</td><td>Rombo con un verbo</td></tr>
<tr><td><b>Dominio</b></td><td>Conjunto de valores posibles de un atributo</td><td>Se indica junto al atributo (ej. genero: F, M)</td></tr></table></div>`
      ] },
      { id: 'entidad', h: 'Entidades', body: [
        '<p>Una <b>entidad</b> es cualquier cosa, objeto o concepto que existe en la realidad, se puede distinguir de los demás y del que queremos guardar información.</p>',
        { cols: [['<h4>Física</h4><p>Ocupa un espacio real: Persona, Libro, Avión, Camión.</p>'], ['<h4>Abstracta</h4><p>Intangible, definida conceptualmente: Viaje, Receta, Préstamo, Matrícula.</p>']] },
        '<p>Cada entidad describe a sus <b>ejemplares</b> (ocurrencias): la entidad PACIENTE tiene el ejemplar "Matías Acosta, 116646, 08/09/2014".</p>',
        '<h3>Entidad fuerte y entidad débil</h3><p>Una entidad <b>fuerte</b> existe por sí misma. Una entidad <b>débil</b> depende de otra para existir y se dibuja con <b>doble rectángulo</b>. Ejemplo del curso: si el CLIENTE no existe, su CUENTA tampoco.</p>',
        { diagram: { spec: DEBIL, view: 'chen', caption: 'CLIENTE (fuerte) y CUENTA (débil, doble rectángulo).' } }
      ] },
      { id: 'atributos', h: 'Atributos y sus tipos', body: [
        '<p>Los atributos se unen a su entidad con una línea, se escriben en minúscula y sin espacios (<code>fecha_nacimiento</code>).</p>',
        `<div class="tblwrap"><table><tr><th>Tipo</th><th>Definición</th><th>Cómo se dibuja</th><th>Ejemplo</th></tr>
<tr><td>Simple / univaluado</td><td>Obligatorio, guarda un único valor</td><td>Círculo simple, línea continua</td><td>nombre</td></tr>
<tr><td>Clave principal</td><td>Identifica de forma única al ejemplar; NO admite nulos</td><td>Círculo relleno ● o nombre <u>subrayado</u></td><td><u>id_persona</u></td></tr>
<tr><td>Clave alternativa</td><td>También identifica de forma única</td><td>Círculo medio relleno ◐</td><td>documento</td></tr>
<tr><td>Compuesto</td><td>Formado por otros atributos</td><td>Círculo del que salen sub-atributos</td><td>fecha_nacimiento = dia, mes, anio</td></tr>
<tr><td>Multivaluado</td><td>Puede guardar varios valores; (n,m) = mínimo y máximo</td><td>Doble círculo (o flecha con (n,m))</td><td>telefono (1,3)</td></tr>
<tr><td>Derivado</td><td>Se calcula a partir de otro</td><td>Círculo con línea punteada</td><td>edad (de fecha_nacimiento)</td></tr>
<tr><td>Opcional</td><td>Puede quedar vacío (nulo)</td><td>Línea punteada</td><td>pasatiempo</td></tr>
<tr><td>Dominio</td><td>Valores posibles predefinidos</td><td>Atributo + lista de valores</td><td>genero: F, M</td></tr></table></div>`,
        { diagram: { spec: PERSONA, view: 'chen', caption: 'PERSONA: id_persona (clave, subrayada), telefono (multivaluado, doble óvalo), edad (derivado, punteado) y pasatiempo (opcional).' } },
        { tip: 'Atributo compuesto: dibuja el óvalo <b>direccion</b> y de él salen <b>calle</b>, <b>numero</b>, <b>ciudad</b>. Al pasar a tablas se guardan solo los sub-atributos.' },
        { warn: 'Ejercicio 1 de la Sesión 4: "apellidos" del cliente. Si son dos apellidos, hay que modelar <b>primer_apellido</b> y <b>segundo_apellido</b> (o un compuesto "apellidos"). Un multivaluado no sirve aquí, porque el orden importa y siempre son dos.' },
        { reveal: { q: '¿Qué tipo de atributo es cada uno? correo de un estudiante (puede tener varios), promedio (se calcula con sus notas), código estudiantil, segundo nombre.', a: '<p>Multivaluado · derivado · clave principal · opcional.</p>' } }
      ] },
      { id: 'relaciones', h: 'Relaciones (interrelaciones)', body: [
        '<p>Una <b>relación</b> es una asociación entre entidades. Se dibuja con un <b>rombo</b> y se nombra con un <b>verbo</b>: un PACIENTE <i>consulta</i> a un DOCTOR.</p>',
        '<ul><li><b>Grado:</b> número de entidades que participan. Binaria (2), ternaria (3).</li><li>Una relación <b>puede tener atributos</b> propios, que no pertenecen a ninguna entidad sola. Ejemplo: en <i>imparte</i> van fecha_inicio y fecha_fin.</li><li>Entre dos entidades puede haber <b>más de una relación</b>: un empleado <i>diseña</i> productos y también <i>fabrica</i> productos.</li><li><b>Relación reflexiva (recursiva):</b> une una entidad consigo misma, usando <b>roles</b> (es_supervisor, es_supervisado).</li></ul>',
        { diagram: { spec: REFLEXIVA, view: 'chen', caption: 'Relación reflexiva: un EMPLEADO supervisa a otros empleados.' } },
        { diagram: { spec: N_M, view: 'chen', caption: 'Relación con atributo propio: la nota_final no es del estudiante ni del curso, es de la matrícula (del par estudiante–curso).' } }
      ] },
      { id: 'cardinalidad', h: 'Cardinalidad y correspondencia', body: [
        '<p><b>Cardinalidad (multiplicidad):</b> número <b>mínimo</b> y <b>máximo</b> de ejemplares de B con los que se relaciona <b>un</b> ejemplar de A. Se escribe en minúscula: <code>(0,1)</code>, <code>(1,1)</code>, <code>(0,n)</code>, <code>(1,n)</code>.</p>',
        '<p><b>Correspondencia:</b> se toman solo los <b>máximos</b> de las dos cardinalidades y se escribe en mayúscula junto al rombo: <b>1:1</b>, <b>1:N</b> o <b>N:M</b>.</p>',
        { key: 'Para cada relación haz <b>dos preguntas</b>, una desde cada lado:<br>1) "Un <b>A</b>, ¿con cuántos <b>B</b> como mínimo y como máximo?"<br>2) "Un <b>B</b>, ¿con cuántos <b>A</b> como mínimo y como máximo?"<br>El mínimo es 0 si la participación es opcional y 1 si es obligatoria.' },
        { stepper: { title: 'Los tres tipos de correspondencia', steps: [
          { h: '1:1 · Un decano dirige una facultad', body: ['<p>Un DECANO dirige ¿cuántas facultades? Mínimo 1, máximo 1 → <b>(1,1)</b>. Una FACULTAD es dirigida por ¿cuántos decanos? Mínimo 1, máximo 1 → <b>(1,1)</b>. Máximos 1 y 1 → <b>1:1</b>.</p>', { diagram: { spec: UNO_UNO, view: 'chen' } }] },
          { h: '1:N · Un profesor imparte asignaturas', body: ['<p>Ejercicio 2 de clase (Instituto): "un profesor imparte varias asignaturas; una asignatura la imparte un solo profesor". Un PROFESOR imparte de 0 a n asignaturas → <b>(0,n)</b>. Una ASIGNATURA la imparte exactamente 1 profesor → <b>(1,1)</b>. Máximos n y 1 → <b>1:N</b>.</p>', { diagram: { spec: UNO_N, view: 'chen' } }] },
          { h: 'N:M · Estudiantes se matriculan en cursos', body: ['<p>Un ESTUDIANTE se matricula en 1 a n cursos → <b>(1,n)</b>. Un CURSO tiene de 0 a n estudiantes → <b>(0,n)</b>. Máximos n y n → <b>N:M</b>. Es la relación entre estudiantes y cursos de la base de clase: por eso existe la tabla <i>inscripciones</i>.</p>', { diagram: { spec: N_M, view: 'chen' } }] }
        ] } },
        { reveal: { q: 'Proyecto de investigación (ejemplo de clase): "Un investigador participa en varios proyectos; un proyecto pertenece a un grupo; un proyecto genera publicaciones". ¿Qué correspondencia tiene cada relación?', a: '<p><b>Participar</b> Investigador–Proyecto: N:M. <b>Pertenecer</b> Proyecto–Grupo: N:1 (un grupo tiene muchos proyectos). <b>Generar</b> Proyecto–Publicación: 1:N. <b>Recibir</b> Proyecto–Entidad financiadora: N:M.</p>' } }
      ] },
      { id: 'pasos', h: 'Cómo dibujar un diagrama de Chen, paso a paso', body: [
        '<p>Ejemplo 2 de la guía del curso, la <b>biblioteca universitaria</b>. Hazlo en papel a la par y compara en cada paso.</p>',
        { stepper: { title: 'Biblioteca universitaria (préstamos)', steps: [
          { h: 'Lee el enunciado y marca sustantivos y verbos', body: [
            '<div class="mini"><p>"Se desea registrar <mark>usuarios</mark>, <mark>libros</mark> y <mark>préstamos</mark> con <i>fecha de préstamo</i>, <i>fecha prevista de devolución</i> y <i>estado</i> (activo, devuelto, vencido). Un usuario puede <u>realizar</u> varios préstamos y un libro puede <u>prestarse</u> varias veces."</p></div>',
            '<p>Los <mark>sustantivos</mark> importantes suelen ser <b>entidades</b>; los que describen algo (fecha, estado) suelen ser <b>atributos</b>; los <u>verbos</u> son <b>relaciones</b>.</p>',
            { tip: 'Descarta los sustantivos que no hay que modelar. Ejemplo: "la empresa" o "la universidad" cuando es el dueño del propio sistema (solo hay una).' }] },
          { h: 'Dibuja las entidades (rectángulos, en singular)', body: [
            '<p>Tres entidades: <b>USUARIO</b>, <b>PRESTAMO</b> y <b>LIBRO</b>. PRESTAMO es una entidad abstracta: no se toca, pero tiene datos propios (fechas, estado).</p>',
            { diagram: { spec: BIB0, view: 'chen' } }] },
          { h: 'Agrega los atributos y subraya la clave', body: [
            '<p>A cada entidad le pones sus características y eliges su <b>clave principal</b> (subrayada). <code>documento</code> e <code>isbn</code> también identifican (claves alternativas). <code>telefono</code>, <code>fecha_devolucion</code> y <code>anio</code> pueden quedar vacíos (opcionales, línea punteada).</p>',
            { diagram: { spec: BIB1, view: 'chen' } }] },
          { h: 'Une las entidades con relaciones (rombos con verbo)', body: [
            '<p>Verbos del enunciado: un usuario <b>realiza</b> préstamos y un libro <b>se presta</b> (en préstamos). Cada rombo une las dos entidades involucradas.</p>',
            { diagram: { spec: BIB2, view: 'chen' } }] },
          { h: 'Pon las cardinalidades (las dos preguntas)', body: [
            `<div class="tblwrap"><table><tr><th>Pregunta</th><th>Respuesta</th><th>Se escribe</th></tr>
<tr><td>Un USUARIO, ¿cuántos préstamos realiza?</td><td>De 0 (recién registrado) a muchos</td><td>(0,n) junto a USUARIO</td></tr>
<tr><td>Un PRESTAMO, ¿cuántos usuarios lo realizan?</td><td>Exactamente 1</td><td>(1,1) junto a PRESTAMO</td></tr>
<tr><td>Un LIBRO, ¿en cuántos préstamos aparece?</td><td>De 0 (nunca prestado) a muchos</td><td>(0,n) junto a LIBRO</td></tr>
<tr><td>Un PRESTAMO, ¿cuántos libros incluye?</td><td>Exactamente 1</td><td>(1,1) junto a PRESTAMO</td></tr></table></div>`,
            '<p>Correspondencias: USUARIO <b>1:N</b> PRESTAMO y LIBRO <b>1:N</b> PRESTAMO. Es el modelo de la guía: Usuario (1) — (N) Prestamo (N) — (1) Libro.</p>',
            { diagram: { spec: BIB2, view: 'chen' } }] },
          { h: 'Revisa antes de entregar', body: [
            '<ul><li>¿Cada entidad tiene clave principal subrayada?</li><li>¿Los nombres de entidad están en singular y los de relación son verbos?</li><li>¿Cada línea de relación tiene su cardinalidad (mín, máx) en los dos lados?</li><li>¿Los atributos que dependen de dos entidades están en la relación y no en una entidad?</li><li>¿Tiene sentido leer cada relación en las dos direcciones?</li></ul>',
            { key: 'En el tema 3 vas a convertir este mismo diagrama a pata de gallo y a SQL.' }] }
        ] } }
      ] },
      { id: 'resuelto', h: 'Ejercicio resuelto de clase: empresa, clientes, productos y proveedores', body: [
        '<div class="mini"><p><b>Enunciado (Sesión 4, Ejercicio 1):</b> Una empresa vende productos a varios clientes (nombre, apellidos, id, dirección, fecha de nacimiento). Cada producto tiene nombre, código y precio unitario. Un cliente compra varios productos y un producto es comprado por varios clientes. Un producto lo suministra un solo proveedor; un proveedor suministra diferentes productos. Del proveedor: nit, nombre, dirección y teléfono (indicativo + número).</p></div>',
        '<p>Inténtalo en papel antes de abrir la solución:</p>',
        { reveal: { q: 'Ver la solución (Chen, pata de gallo, tablas y SQL)', a: [
          '<p><b>Análisis:</b> "empresa" no se modela (es el dueño del sistema). Entidades: CLIENTE, PRODUCTO, PROVEEDOR. Relaciones: <b>compra</b> (CLIENTE–PRODUCTO, N:M) y <b>suministra</b> (PROVEEDOR–PRODUCTO, 1:N). El teléfono del proveedor es compuesto (indicativo + número).</p>',
          { case: 'empresa', view: 'tabs' }] } }
      ] },
      { id: 'extendido', h: 'E/R extendido: herencia, dependencias, ternarias y agregación', body: [
        '<h3>Herencia: generalización / especialización</h3>',
        '<p>Se usa cuando varias entidades comparten atributos: la relación "<b>es un</b>" (triángulo <i>es_un</i>). El <b>supertipo</b> tiene el identificador y los atributos comunes; los <b>subtipos</b> tienen sus atributos propios. Todo ESTUDIANTE <i>es una</i> PERSONA, pero no toda PERSONA es estudiante. El <b>atributo discriminante</b> (tipo) indica a qué subtipo pertenece cada ejemplar.</p>',
        { case: 'colegio', view: 'chen', caption: 'Caso "Colegio": PERSONA es el supertipo de ESTUDIANTE y DOCENTE.' },
        `<div class="tblwrap"><table><tr><th>Tipo</th><th>Significado</th><th>Ejemplo del curso</th></tr>
<tr><td><b>Solapamiento</b></td><td>Un ejemplar puede ser de varios subtipos a la vez</td><td>Una persona es profesor y estudiante</td></tr>
<tr><td><b>Exclusividad</b></td><td>Solo puede ser de UNO de los subtipos (arco)</td><td>Profesor de planta u ocasional</td></tr>
<tr><td><b>Totalidad</b></td><td>Todo ejemplar TIENE que ser de algún subtipo (círculo en la línea)</td><td>Empleado: profesor o administrativo</td></tr>
<tr><td><b>Parcialidad</b></td><td>No es obligatorio ser de algún subtipo</td><td>Docente: especialista, magíster, doctor</td></tr></table></div>`,
        '<h3>Dependencia en existencia y en identificación</h3><ul><li><b>Existencia (E):</b> la entidad débil no puede existir si desaparece la fuerte.</li><li><b>Identificación (ID):</b> además, la débil no se identifica sola. Necesita la clave de la fuerte: la EDICION de un curso se identifica con (codCurso, numEdicion).</li><li>Toda dependencia en identificación es también en existencia, pero no al revés.</li></ul>',
        '<h3>Relaciones ternarias</h3><p>Participan <b>3 entidades</b> obligatoriamente y deben tener <b>6 lecturas coherentes</b> (desde cada entidad hacia las otras dos). Ejemplo: un médico programa una cirugía en un quirófano. Si alguna lectura no tiene sentido, no es ternaria: son dos binarias (Ejercicio 5: "contrata").</p>',
        '<h3>Agregación</h3><p>El modelo E/R no permite relacionar una relación con otra. La <b>agregación</b> encierra una relación y sus entidades en una "entidad compuesta" que sí puede relacionarse. Ejemplo: la explicación (PROFESOR explica ASIGNATURA) <i>usa</i> MEDIOS.</p>',
        '<h3>Restricciones entre relaciones</h3>',
        `<div class="tblwrap"><table><tr><th>Restricción</th><th>Significado</th></tr>
<tr><td>Exclusividad</td><td>Un ejemplar de A participa en R1 <b>o</b> en R2, no en ambas (empleado diseña o fabrica)</td></tr>
<tr><td>Exclusión</td><td>El mismo par (a1, b1) no puede estar en R1 y en R2 (un profesor no imparte y recibe el mismo curso)</td></tr>
<tr><td>Inclusividad</td><td>Para estar en R2, A debió estar antes en R1 con cualquier B (solo imparten los que se capacitaron)</td></tr>
<tr><td>Inclusión</td><td>Para asociar a1 con b1 en R2, ese mismo par debió estar en R1 (divorciarse exige haberse casado)</td></tr></table></div>`
      ] }
    ],
    keys: ['Entidad = rectángulo (sustantivo en singular); atributo = óvalo; relación = rombo (verbo).',
      'Clave principal subrayada; multivaluado = doble óvalo; derivado = punteado; opcional = línea punteada; débil = doble rectángulo.',
      'Cardinalidad (mín,máx) en minúscula: (0,1), (1,1), (0,n), (1,n). Correspondencia (solo máximos) en mayúscula: 1:1, 1:N, N:M.',
      'Para cada relación haz las dos preguntas: "un A, ¿con cuántos B?" y "un B, ¿con cuántos A?".',
      'Los atributos que dependen del par (nota, fecha, cantidad) van en la relación.',
      'Herencia: solapamiento/exclusividad y totalidad/parcialidad. Ternaria: 6 lecturas coherentes. Agregación: relación vista como entidad.'],
    quiz: [
      { q: 'En notación de Chen, ¿cómo se dibuja una relación?', o: [
        { t: 'Con un rombo nombrado con un verbo', ok: true, why: 'Correcto: por ejemplo el rombo "imparte" entre PROFESOR y ASIGNATURA.' },
        { t: 'Con un rectángulo', why: 'El rectángulo es la entidad.' },
        { t: 'Con un óvalo', why: 'El óvalo es un atributo.' },
        { t: 'Con un doble rectángulo', why: 'El doble rectángulo es una entidad débil.' }] },
      { q: 'El atributo <i>edad</i>, que se calcula a partir de <i>fecha_nacimiento</i>, es…', o: [
        { t: 'Derivado (óvalo con línea punteada)', ok: true, why: 'Correcto: se calcula, por eso al pasar a tablas se ignora.' },
        { t: 'Multivaluado', why: 'Multivaluado es el que tiene varios valores (varios teléfonos).' },
        { t: 'Compuesto', why: 'Compuesto es el que se divide en partes (fecha = día, mes, año).' },
        { t: 'Clave principal', why: 'La edad se repite entre personas: no identifica a nadie.' }] },
      { q: 'Un estudiante se matricula en 1 a n cursos y un curso tiene 0 a n estudiantes. ¿Cuál es la correspondencia?', o: [
        { t: 'N:M', ok: true, why: 'Correcto: los dos máximos son n.' },
        { t: '1:N', why: 'Sería 1:N si uno de los máximos fuera 1.' },
        { t: '1:1', why: 'Los máximos no son 1.' },
        { t: '0:N', why: 'La correspondencia usa solo los máximos; el 0 es un mínimo.' }] },
      { q: 'Cardinalidad y correspondencia: ¿cuál es la diferencia?', o: [
        { t: 'La cardinalidad es (mín, máx) de cada lado; la correspondencia usa solo los máximos (1:1, 1:N, N:M)', ok: true, why: 'Correcto: (0,n)-(1,1) da correspondencia 1:N.' },
        { t: 'Son sinónimos', why: 'No: la correspondencia se deduce de las cardinalidades.' },
        { t: 'La correspondencia usa los mínimos', why: 'Usa los máximos.' },
        { t: 'La cardinalidad solo existe en relaciones N:M', why: 'Toda relación tiene cardinalidad en ambos lados.' }] },
      { q: 'En una matrícula, ¿dónde va el atributo <i>nota_final</i>?', o: [
        { t: 'En la relación se_matricula (depende del estudiante Y del curso)', ok: true, why: 'Correcto: un estudiante tiene una nota distinta en cada curso.' },
        { t: 'En ESTUDIANTE', why: 'El estudiante tendría una sola nota para todos sus cursos.' },
        { t: 'En CURSO', why: 'Todos los estudiantes del curso tendrían la misma nota.' },
        { t: 'En una entidad NOTA aparte sin relación', why: 'Perdería con quién y en qué curso se sacó la nota.' }] },
      { q: 'Un EMPLEADO supervisa a otros EMPLEADOS. ¿Qué tipo de relación es?', o: [
        { t: 'Reflexiva (recursiva), con roles supervisor y supervisado', ok: true, why: 'Correcto: es binaria pero ambas puntas son la misma entidad.' },
        { t: 'Ternaria', why: 'Solo participa una entidad (dos veces).' },
        { t: 'Herencia', why: 'Herencia es "es un", no "supervisa".' },
        { t: 'Agregación', why: 'La agregación relaciona una relación con otra entidad.' }] },
      { q: 'En una especialización, "todo empleado tiene que ser profesor o administrativo, pero no ambos" combina…', o: [
        { t: 'Totalidad y exclusividad', ok: true, why: 'Correcto: "tiene que ser alguno" = totalidad; "no ambos" = exclusividad.' },
        { t: 'Parcialidad y solapamiento', why: 'Parcialidad = no es obligatorio; solapamiento = puede ser ambos.' },
        { t: 'Totalidad y solapamiento', why: 'El "pero no ambos" descarta el solapamiento.' },
        { t: 'Parcialidad y exclusividad', why: '"Tiene que ser" descarta la parcialidad.' }] },
      { q: 'Una relación ternaria es correcta cuando…', o: [
        { t: 'Participan 3 entidades y las 6 lecturas tienen sentido', ok: true, why: 'Correcto; si alguna lectura falla, son relaciones binarias separadas.' },
        { t: 'Hay 3 atributos en la relación', why: 'El grado cuenta entidades, no atributos.' },
        { t: 'Una entidad se relaciona 3 veces consigo misma', why: 'Eso serían relaciones reflexivas.' },
        { t: 'Siempre que haya 3 entidades en el diagrama', why: 'Deben participar las 3 en la MISMA relación con lecturas coherentes.' }] }
    ],
    practice: { quiz: ['er', 'avz'], cases: ['empresa', 'instituto', 'biblioteca', 'academico', 'colegio'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
