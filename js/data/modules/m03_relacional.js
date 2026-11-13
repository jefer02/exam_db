/* Tema 3 · Del E/R al modelo relacional y notación pata de gallo. */
(function (root) {
  const K = (n, t) => ({ n, t: t || 'INT', pk: 1 });
  const A = (n, t, o) => Object.assign({ n, t: t || 'VARCHAR(100)', nn: 1 }, o || {});
  const OPT = (n, t) => ({ n, t: t || 'VARCHAR(100)' });

  const MULTI = { entities: [{ n: 'PROVEEDOR', cp: [0, 0], pos: [0, 0], attrs: [K('prov_codigo'), A('nombre'), { n: 'num_telefono', t: 'VARCHAR(20)', multi: 1 }] }] };
  const UNO_N = { entities: [
    { n: 'PROVEEDOR', cp: [0, 0], pos: [0, 0], attrs: [K('nit', 'VARCHAR(15)'), A('nombre')] },
    { n: 'PRODUCTO', cp: [1, 0], pos: [1, 0], attrs: [K('codigo', 'VARCHAR(10)'), A('nombre'), A('precio_unitario', 'NUMERIC(10,2)')] }],
  rels: [{ n: 'suministra', a: 'PROVEEDOR', b: 'PRODUCTO', ca: [0, 'n'], cb: [1, 1] }] };
  const N_M = { entities: [
    { n: 'PROFESOR', cp: [0, 0], pos: [0, 0], attrs: [K('prof_id'), A('nombre')] },
    { n: 'CURSO', cp: [1, 0], pos: [2, 0], attrs: [K('codigo', 'VARCHAR(10)'), A('nombre')] }],
  rels: [{ n: 'imparte', a: 'PROFESOR', b: 'CURSO', ca: [0, 'n'], cb: [1, 'n'], table: 'imparte', pos: [1, 0], attrs: [{ n: 'fecha', t: 'DATE', pk: 1, nn: 1 }] }] };
  const UNO_UNO_A = { entities: [
    { n: 'PROFESOR', cp: [0, 0], pos: [0, 0], attrs: [K('prof_id'), A('nombre')] },
    { n: 'DEPARTAMENTO', cp: [1, 0], pos: [1, 0], attrs: [K('id_departamento'), A('nombre')] }],
  rels: [{ n: 'dirige', a: 'PROFESOR', b: 'DEPARTAMENTO', ca: [0, 1], cb: [1, 1] }] };
  const UNO_UNO_B = { entities: [
    { n: 'HOMBRE', cp: [0, 0], pos: [0, 0], attrs: [K('id_hombre'), A('nombre')] },
    { n: 'MUJER', cp: [1, 0], pos: [2, 0], attrs: [K('id_mujer'), A('nombre')] }],
  rels: [{ n: 'se_casa', a: 'HOMBRE', b: 'MUJER', ca: [0, 1], cb: [0, 1], table: 'se_casa', pos: [1, 0], attrs: [{ n: 'fecha', t: 'DATE', nn: 1 }] }] };
  const REFLEXIVA = { entities: [{ n: 'EMPLEADO', cp: [0, 0], pos: [0, 0], attrs: [K('cod_empleado'), A('nombre')] }],
    rels: [{ n: 'supervisa', a: 'EMPLEADO', b: 'EMPLEADO', ca: [0, 'n'], cb: [0, 1], fk: 'cod_supervisor' }] };
  // Diagrama del laboratorio final (bancodb)
  const BANCO = { entities: [
    { n: 'SUCURSAL', table: 'sucursales', cp: [0, 0], pos: [0, 0], attrs: [K('id_sucursal', 'SERIAL'), A('nombre'), OPT('ciudad', 'VARCHAR(50)'), OPT('direccion', 'VARCHAR(150)')] },
    { n: 'EMPLEADO', table: 'empleados', cp: [1, 0], pos: [1, 0], attrs: [K('id_empleado', 'SERIAL'), A('nombre'), OPT('cargo', 'VARCHAR(50)'), OPT('salario', 'NUMERIC(12,2)')] },
    { n: 'TIPO_CUENTA', table: 'tipos_cuenta', cp: [0, 1], pos: [0, 1], attrs: [K('id_tipo', 'SERIAL'), A('descripcion', 'VARCHAR(50)')] },
    { n: 'CUENTA', table: 'cuentas', cp: [1, 1], pos: [1, 1], attrs: [K('id_cuenta', 'SERIAL'), A('numero_cuenta', 'VARCHAR(20)', { uq: 1 }), OPT('saldo', 'NUMERIC(14,2)'), OPT('fecha_apertura', 'DATE'), OPT('estado', 'VARCHAR(20)')] },
    { n: 'CLIENTE', table: 'clientes', cp: [2, 1], pos: [2, 1], attrs: [K('id_cliente', 'SERIAL'), A('nombre'), A('apellido'), OPT('telefono', 'VARCHAR(20)'), OPT('correo'), OPT('ciudad', 'VARCHAR(50)')] },
    { n: 'TRANSACCION', table: 'transacciones', cp: [1, 2], pos: [1, 2], attrs: [K('id_transaccion', 'SERIAL'), OPT('tipo', 'VARCHAR(30)'), OPT('monto', 'NUMERIC(14,2)'), OPT('fecha', 'DATE')] },
    { n: 'PRESTAMO', table: 'prestamos', cp: [2, 2], pos: [2, 2], attrs: [K('id_prestamo', 'SERIAL'), OPT('monto', 'NUMERIC(14,2)'), OPT('tasa_interes', 'NUMERIC(5,2)'), OPT('fecha_inicio', 'DATE'), OPT('cuotas', 'INT')] }],
  rels: [
    { n: 'trabaja_en', a: 'SUCURSAL', b: 'EMPLEADO', ca: [0, 'n'], cb: [0, 1] },
    { n: 'clasifica', a: 'TIPO_CUENTA', b: 'CUENTA', ca: [0, 'n'], cb: [0, 1] },
    { n: 'posee', a: 'CLIENTE', b: 'CUENTA', ca: [0, 'n'], cb: [0, 1] },
    { n: 'registra', a: 'CUENTA', b: 'TRANSACCION', ca: [0, 'n'], cb: [0, 1] },
    { n: 'solicita', a: 'CLIENTE', b: 'PRESTAMO', ca: [0, 'n'], cb: [0, 1] }] };

  const sym = (k) => {
    const L = '<line x1="0" y1="12" x2="70" y2="12"/>';
    const bar = (x) => `<line x1="${x}" y1="4" x2="${x}" y2="20"/>`;
    const circ = (x) => `<circle cx="${x}" cy="12" r="5" fill="var(--card)"/>`;
    const foot = '<line x1="56" y1="12" x2="70" y2="3"/><line x1="56" y1="12" x2="70" y2="21"/>';
    const body = { one: bar(50) + bar(58), zeroOne: circ(44) + bar(58), oneMany: bar(46) + foot, zeroMany: circ(42) + foot }[k];
    return `<svg viewBox="0 0 74 24" width="74" height="24" style="stroke:var(--ink);stroke-width:1.8;fill:none;vertical-align:middle" aria-hidden="true">${L}${body}</svg>`;
  };

  (root.MODULES = root.MODULES || []).push({
    id: 'relacional', n: 3, title: 'Del E/R a tablas y diagramas de pata de gallo', short: 'E/R → tablas · pata de gallo', minutes: 50,
    desc: 'Reglas para transformar entidades, atributos y relaciones (1:N, N:M, 1:1, reflexiva, herencia) en tablas; notación pata de gallo paso a paso.',
    goals: ['Transformar cualquier diagrama E/R en tablas con PK y FK aplicando las reglas del curso.',
      'Saber dónde va la FK en 1:N, cuándo crear una tabla nueva (N:M) y los tres casos de 1:1.',
      'Leer y dibujar un diagrama de pata de gallo (crow’s foot).',
      'Escribir el modelo relacional en la notación Tabla(pk, atributos, fk).'],
    sections: [
      { id: 'modelo', h: 'El modelo relacional', body: [
        '<p>El <b>modelo relacional</b> (Codd, 1970) organiza los datos en <b>relaciones</b> (tablas) basadas en la teoría de conjuntos. Una relación es una estructura de filas y columnas <b>sin filas repetidas</b> y se llama igual que la entidad de la que viene.</p>',
        '<p>En el examen se escribe así (notación del curso), con la PK subrayada y las FK marcadas:</p>',
        '<div class="mini" style="font-family:ui-monospace,monospace">MATERIA(<u>codigo</u>, nombre, creditos)<br>PRESTAMO(<u>id_prestamo</u>, fecha_prestamo, fecha_devolucion, id_usuario<sup>FK</sup>, id_libro<sup>FK</sup>)</div>',
        '<p>Una <b>clave foránea (FK)</b> es una columna (o combinación de columnas) que establece y exige un vínculo con la PK de otra tabla. Al dibujar las FK como flechas hacia la PK que referencian se obtiene el <b>grafo relacional</b>.</p>'
      ] },
      { id: 'basicas', h: 'Reglas para entidades y atributos', body: [
        `<div class="tblwrap"><table><tr><th>Elemento del E/R</th><th>Se convierte en</th></tr>
<tr><td>Entidad</td><td>Tabla</td></tr>
<tr><td>Atributo simple y univaluado</td><td>Columna</td></tr>
<tr><td>Identificador principal</td><td>Clave primaria (PRIMARY KEY)</td></tr>
<tr><td>Identificador alternativo</td><td>Clave alternativa (UNIQUE)</td></tr>
<tr><td>Atributo derivado</td><td><b>Se ignora</b> (se calcula en la consulta)</td></tr>
<tr><td>Atributo compuesto</td><td>Se descompone en sus atributos simples: fechaNac → dia, mes, anio</td></tr>
<tr><td>Atributo multivaluado</td><td><b>Tabla nueva</b> con la PK de la entidad + el atributo; ambos forman la PK</td></tr>
<tr><td>Dominio que no cambia</td><td>Columna con CHECK: <code>CHECK (genero IN ('F','M'))</code></td></tr>
<tr><td>Dominio que puede crecer</td><td>Tabla nueva (id + valor) referenciada con FK</td></tr></table></div>`,
        '<h3>Ejemplo: atributo multivaluado</h3><p>Un proveedor puede tener varios teléfonos. En una sola columna no caben varios valores (rompería la 1FN), así que se crea la tabla TELEFONO:</p>',
        { diagram: { spec: MULTI, view: 'tabs', caption: 'Cambia de pestaña: Chen → pata de gallo → modelo relacional → SQL. Proveedor(prov_codigo, nombre) y la tabla del teléfono (prov_codigo, num_telefono).' } },
        { tip: 'Evita que la columna se llame igual que la tabla (tabla telefono con columna telefono): usa num_telefono.' }
      ] },
      { id: 'relaciones', h: 'Reglas para las relaciones', body: [
        `<div class="tblwrap"><table><tr><th>Relación</th><th>Regla</th></tr>
<tr><td><b>1:N</b></td><td>La PK del lado <b>1</b> viaja como <b>FK</b> a la tabla del lado <b>N</b> ("en el sentido de la flecha"). Si la participación mínima es 1, la FK es NOT NULL</td></tr>
<tr><td><b>N:M</b></td><td><b>Tabla nueva</b> cuya PK es la unión de las PK de las dos entidades (cada una es FK). Lleva los atributos propios de la relación</td></tr>
<tr><td>1:1 (0,1)–(0,1)</td><td>Conviene crear una tabla nueva, para evitar nulos</td></tr>
<tr><td>1:1 (0,1)–(1,1)</td><td>La PK de la entidad con (1,1) pasa como FK NOT NULL y UNIQUE a la otra</td></tr>
<tr><td>1:1 (1,1)–(1,1)</td><td>Se propaga en cualquier sentido (según los accesos más frecuentes)</td></tr>
<tr><td>Reflexiva</td><td>FK a la misma tabla, con nombre de rol (cod_supervisor), o tabla nueva</td></tr>
<tr><td>Ternaria / n-aria</td><td>Tabla nueva con las PK de todas las entidades + atributos propios</td></tr>
<tr><td>Débil (existencia / identificación)</td><td>FK NOT NULL hacia la fuerte; en identificación, la FK forma parte de la PK</td></tr></table></div>`,
        { key: '<b>1:N → la FK va en el lado N</b> (el de "muchos"). <b>N:M → tabla intermedia.</b> Estas dos reglas resuelven la mayoría de los ejercicios del examen.' },
        { stepper: { title: 'Cada regla con su diagrama', steps: [
          { h: '1:N · la FK va al lado N', body: ['<p>Un proveedor suministra muchos productos y cada producto tiene un solo proveedor. Entonces <code>nit</code> (PK de PROVEEDOR) pasa a PRODUCTO como FK.</p>', { diagram: { spec: UNO_N, view: 'tabs' } }] },
          { h: 'N:M · tabla nueva', body: ['<p>Un profesor imparte varios cursos y un curso lo imparten varios profesores (en distintas fechas). Se crea IMPARTE(prof_id, codigo, fecha): sus claves foráneas forman la PK y la fecha también, porque se puede repetir el par en otra fecha.</p>', { diagram: { spec: N_M, view: 'tabs' } }] },
          { h: '1:1 con (0,1)–(1,1) · FK en el lado obligatorio', body: ['<p>Un profesor dirige como máximo un departamento (0,1) y todo departamento tiene exactamente un director (1,1). Departamento recibe <code>prof_id</code> como FK NOT NULL y UNIQUE (el UNIQUE garantiza el "como máximo 1").</p>', { diagram: { spec: UNO_UNO_A, view: 'tabs' } }] },
          { h: '1:1 con (0,1)–(0,1) · tabla nueva', body: ['<p>Ni todo hombre ni toda mujer está casado. Si pusiéramos la FK en una tabla, quedaría NULL en muchas filas; por eso se crea SE_CASA.</p>', { diagram: { spec: UNO_UNO_B, view: 'tabs' } }] },
          { h: 'Reflexiva · FK a la misma tabla', body: ['<p>EMPLEADO recibe <code>cod_supervisor</code>, que apunta a <code>cod_empleado</code> de la misma tabla. Es lo que usa el SELF JOIN del tema 10.</p>', { diagram: { spec: REFLEXIVA, view: 'tabs' } }] }
        ] } }
      ] },
      { id: 'herencia', h: 'Transformar la herencia (generalización)', body: [
        `<div class="tblwrap"><table><tr><th>Opción</th><th>Estrategia</th><th>Cuándo conviene</th></tr>
<tr><td>Primera</td><td>Una sola tabla con todos los atributos + atributo discriminante (tipo)</td><td>Subtipos con pocos atributos distintos</td></tr>
<tr><td>Segunda</td><td>Tabla del supertipo + una tabla por subtipo; la PK del supertipo pasa a cada subtipo (PK y FK a la vez)</td><td>Muchos atributos distintos; solapamiento y parcialidad</td></tr>
<tr><td>Tercera</td><td>Solo tablas de los subtipos, cada una con los atributos comunes + los propios</td><td>Totalidad y exclusividad</td></tr></table></div>`,
        { case: 'colegio', view: 'tabs', caption: 'Caso "Colegio" resuelto con la segunda opción: PERSONA, y ESTUDIANTE y DOCENTE con id_persona como PK y FK.' },
        { reveal: { q: 'Con la primera opción, ¿cómo quedaría PERSONA → PROFESOR / ESTUDIANTE?', a: '<p>Una sola tabla PERSONA(<u>id_persona</u>, nombre, …, tipo, titulo, salario, grado, promedio) con <code>tipo CHECK (tipo IN (\'P\',\'E\'))</code>. Los atributos del otro subtipo quedan en NULL en cada fila.</p>' } }
      ] },
      { id: 'pg', h: 'Notación pata de gallo (crow’s foot)', body: [
        '<p>En pata de gallo cada entidad se dibuja como una <b>tabla</b> (nombre arriba y columnas abajo, con PK y FK marcadas). En cada extremo de la línea que une dos tablas va un símbolo que dice cuántas filas de <b>esa</b> tabla corresponden a una fila de la otra:</p>',
        `<div class="tblwrap"><table><tr><th>Símbolo</th><th>Nombre</th><th>Significado</th><th>Cardinalidad</th></tr>
<tr><td>${sym('one')}</td><td>Mandatory one</td><td>Exactamente uno</td><td>(1,1)</td></tr>
<tr><td>${sym('zeroOne')}</td><td>Optional one</td><td>Cero o uno</td><td>(0,1)</td></tr>
<tr><td>${sym('oneMany')}</td><td>Mandatory many</td><td>Uno o muchos</td><td>(1,n)</td></tr>
<tr><td>${sym('zeroMany')}</td><td>Optional many</td><td>Cero o muchos</td><td>(0,n)</td></tr></table></div>`,
        { key: 'El símbolo más cercano a la tabla es el <b>máximo</b> (| = uno, pata = muchos); el más lejano es el <b>mínimo</b> (o = cero, | = uno). La <b>pata</b> siempre queda pegada a la tabla que tiene la FK.' },
        '<h3>Cómo se lee: el diagrama de bancodb (laboratorio final)</h3><p>Este es el diagrama del laboratorio final con el que se practican los JOIN. Lee cada línea en voz alta: "un cliente posee cero o muchas cuentas; cada cuenta es de un cliente".</p>',
        { diagram: { spec: BANCO, view: 'crow', caption: 'bancodb en pata de gallo. La pata queda en cuentas, transacciones, prestamos y empleados: son las tablas con FK.' } },
        { reveal: { q: '¿Qué JOIN necesitas para mostrar las transacciones de cada cliente? Mira el diagrama.', a: '<p>No hay línea directa entre clientes y transacciones: el camino es <b>clientes → cuentas → transacciones</b> (dos JOIN: <code>clientes.id_cliente = cuentas.id_cliente</code> y <code>cuentas.id_cuenta = transacciones.id_cuenta</code>). Es el ejercicio b09 del editor.</p>' } }
      ] },
      { id: 'pasos', h: 'Paso a paso: de Chen a tablas, pata de gallo y SQL', body: [
        '<p>Seguimos con el Ejercicio 1 de la Sesión 4 (empresa, clientes, productos y proveedores) que resolviste en el tema 2.</p>',
        { stepper: { title: 'Empresa: de Chen a SQL', steps: [
          { h: 'Parte del diagrama de Chen', body: [{ case: 'empresa', view: 'chen' }, '<p>Relaciones: <b>compra</b> CLIENTE–PRODUCTO es N:M (con fecha) y <b>suministra</b> PROVEEDOR–PRODUCTO es 1:N.</p>'] },
          { h: 'Cada entidad se convierte en una tabla', body: ['<div class="mini" style="font-family:ui-monospace,monospace">CLIENTE(<u>id_cliente</u>, nombre, apellidos, direccion, fecha_nacimiento)<br>PRODUCTO(<u>codigo</u>, nombre, precio_unitario)<br>PROVEEDOR(<u>nit</u>, nombre, direccion, indicativo, numero)</div>', '<p>El teléfono compuesto del proveedor se descompone en indicativo y número.</p>'] },
          { h: 'Relación 1:N → FK en el lado N', body: ['<p><b>suministra</b>: el lado N es PRODUCTO, así que recibe <code>nit</code> como FK (NOT NULL, porque todo producto tiene proveedor).</p><div class="mini" style="font-family:ui-monospace,monospace">PRODUCTO(<u>codigo</u>, nombre, precio_unitario, nit<sup>FK</sup>)</div>'] },
          { h: 'Relación N:M → tabla nueva', body: ['<p><b>compra</b> es N:M, así que se crea una tabla con las dos PK como FK. La fecha también entra en la PK porque un cliente puede comprar el mismo producto otro día.</p><div class="mini" style="font-family:ui-monospace,monospace">COMPRA(<u>id_cliente<sup>FK</sup>, codigo<sup>FK</sup>, fecha</u>)</div>'] },
          { h: 'Dibuja la pata de gallo', body: [{ case: 'empresa', view: 'crow' }, '<p>Cuatro tablas. La pata queda en PRODUCTO (por nit) y en COMPRA (por sus dos FK).</p>'] },
          { h: 'Escribe el SQL (primero las tablas referenciadas)', body: [{ case: 'empresa', view: 'ddl' }, { tip: 'Orden de creación: CLIENTE y PROVEEDOR (no tienen FK) → PRODUCTO (referencia a PROVEEDOR) → COMPRA (referencia a CLIENTE y PRODUCTO). Al revés el SGBD da error: no existe la tabla referenciada.' }] }
        ] } }
      ] },
      { id: 'practica', h: 'Ejercicio de la guía: ventas de una tienda', body: [
        '<div class="mini"><p><b>Desarrolle:</b> CLIENTE(id_cliente, nombre, apellido, teléfono, correo), VENTA(id_venta, fecha, total, id_cliente), DETALLE_VENTA(id_detalle, cantidad, precio, id_venta, id_producto), PRODUCTO(id_producto, nombre, precio, stock, id_categoria), CATEGORIA(id_categoria, nombre). Las relaciones son 1:N; Venta–Producto es N:M y se resuelve con DETALLE_VENTA; un empleado registra la venta (opcional).</p></div>',
        { reveal: { q: 'Dibuja la pata de gallo en papel y luego compara', a: [{ case: 'ventas', view: 'tabs' }] } }
      ] }
    ],
    keys: ['Entidad → tabla; identificador → PK; alternativo → UNIQUE; derivado → se ignora; compuesto → se descompone; multivaluado → tabla nueva.',
      '1:N → la PK del lado 1 pasa como FK al lado N.',
      'N:M → tabla nueva con PK compuesta por las dos FK (+ atributos de la relación).',
      '1:1: (0,1)-(0,1) tabla nueva; (0,1)-(1,1) FK UNIQUE NOT NULL en el lado (1,1); (1,1)-(1,1) en cualquier sentido.',
      'Reflexiva → FK a la misma tabla con nombre de rol. Herencia → 3 opciones (tabla única, supertipo+subtipos, solo subtipos).',
      'Pata de gallo: || uno, o| cero o uno, |< uno o muchos, o< cero o muchos. La pata va en la tabla que tiene la FK.',
      'Crea primero las tablas referenciadas (sin FK) y al final las que tienen FK.'],
    quiz: [
      { q: 'En una relación 1:N entre DEPARTAMENTO (1) y EMPLEADO (N), ¿dónde va la clave foránea?', o: [
        { t: 'En EMPLEADO: id_departamento', ok: true, why: 'Correcto: la FK va en el lado N. Cada empleado guarda el único departamento al que pertenece.' },
        { t: 'En DEPARTAMENTO: id_empleado', why: 'Un departamento tiene muchos empleados: no cabrían en una sola columna.' },
        { t: 'En una tabla nueva obligatoriamente', why: 'La tabla nueva es la regla de N:M, no de 1:N.' },
        { t: 'En ambas tablas', why: 'Duplicaría la información y podría volverse inconsistente.' }] },
      { q: '¿Cómo se transforma una relación N:M entre ESTUDIANTE y CURSO?', o: [
        { t: 'Tabla nueva con id_estudiante e id_curso como FK, que juntas forman la PK', ok: true, why: 'Correcto: es la tabla inscripciones de la base de clase.' },
        { t: 'FK id_curso en ESTUDIANTE', why: 'Un estudiante tiene varios cursos: una sola columna no basta.' },
        { t: 'FK id_estudiante en CURSO', why: 'Un curso tiene varios estudiantes: tampoco cabe.' },
        { t: 'No se puede transformar', why: 'Sí se puede: con una tabla intermedia (asociativa).' }] },
      { q: 'Al pasar al modelo relacional, un atributo <b>derivado</b> como edad…', o: [
        { t: 'Se ignora (se calcula cuando se necesita)', ok: true, why: 'Correcto: guardarlo crearía datos que se desactualizan.' },
        { t: 'Se convierte en tabla nueva', why: 'Eso es para los multivaluados.' },
        { t: 'Se convierte en clave primaria', why: 'La edad no identifica a nadie.' },
        { t: 'Se descompone en partes', why: 'Eso es para los compuestos.' }] },
      { q: 'Un atributo multivaluado <i>telefono</i> de PROVEEDOR se transforma en…', o: [
        { t: 'Una tabla nueva (prov_codigo, num_telefono) con ambos como PK', ok: true, why: 'Correcto: cada teléfono es una fila distinta.' },
        { t: 'Varias columnas telefono1, telefono2, telefono3', why: 'Es un grupo repetitivo: limita la cantidad y rompe la 1FN.' },
        { t: 'Una columna con los teléfonos separados por comas', why: 'Valores no atómicos: rompe la 1FN.' },
        { t: 'Se ignora', why: 'Eso es para los derivados.' }] },
      { q: 'En pata de gallo, el símbolo <b>o&lt;</b> junto a una tabla significa…', o: [
        { t: 'Cero o muchos', ok: true, why: 'Correcto: "o" es el mínimo 0 y la pata el máximo n.' },
        { t: 'Exactamente uno', why: 'Exactamente uno es ||.' },
        { t: 'Cero o uno', why: 'Cero o uno es o|.' },
        { t: 'Uno o muchos', why: 'Uno o muchos es |<.' }] },
      { q: 'En una relación 1:1 donde un lado es (0,1) y el otro (1,1), ¿dónde va la FK?', o: [
        { t: 'En la tabla del lado obligatorio (1,1), como FK NOT NULL y UNIQUE', ok: true, why: 'Correcto: así no quedan nulos y el UNIQUE mantiene el "como máximo uno".' },
        { t: 'Siempre en una tabla nueva', why: 'La tabla nueva conviene cuando ambos lados son (0,1).' },
        { t: 'En el lado (0,1), permitiendo NULL', why: 'Quedarían muchos nulos.' },
        { t: 'No lleva FK', why: 'Toda relación se implementa con alguna FK.' }] },
      { q: '¿En qué orden debes crear las tablas CLIENTE, PEDIDO (FK a CLIENTE) y DETALLE_PEDIDO (FK a PEDIDO y PRODUCTO)?', o: [
        { t: 'CLIENTE y PRODUCTO, luego PEDIDO, luego DETALLE_PEDIDO', ok: true, why: 'Correcto: primero las tablas referenciadas.' },
        { t: 'DETALLE_PEDIDO, PEDIDO, CLIENTE', why: 'Daría error: las FK apuntarían a tablas que todavía no existen.' },
        { t: 'Da igual el orden', why: 'Con FK declaradas en el CREATE TABLE el orden sí importa.' },
        { t: 'PEDIDO, CLIENTE, DETALLE_PEDIDO', why: 'PEDIDO necesita que CLIENTE exista antes.' }] }
    ],
    practice: { quiz: ['rel', 'pg'], cases: ['ventas', 'hotel', 'restaurante', 'ecommerce', 'aerolinea'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
