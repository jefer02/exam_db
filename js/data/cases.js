/* Casos de modelado: especificación conceptual (Chen) -> el sitio deriva Pata de Gallo, modelo relacional y DDL.
   Convención de cardinalidad (la del curso): ca = (min,max) junto a la entidad A = cuántos ejemplares de B
   se asocian a UN ejemplar de A. cb = lo mismo para B. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CASES = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const ID = (n) => ({ n, t: 'SERIAL', pk: 1 });
  const S = (n, len, o) => Object.assign({ n, t: 'VARCHAR(' + (len || 100) + ')' }, o || {});
  const N = (n, o) => Object.assign({ n, t: 'NUMERIC(10,2)' }, o || {});
  const I = (n, o) => Object.assign({ n, t: 'INT' }, o || {});
  const D = (n, o) => Object.assign({ n, t: 'DATE' }, o || {});
  const T = (n, o) => Object.assign({ n, t: 'TIMESTAMP' }, o || {});
  const nn = { nn: 1 };

  return [
    /* ====================== TALLER DEL CURSO ====================== */
    {
      id: 'hotel', origin: 'taller', title: 'Gestión de un hotel',
      statement: 'Un hotel necesita un sistema para administrar habitaciones, huéspedes, reservas, empleados, servicios y pagos. Los huéspedes pueden hacer varias reservas y cada reserva puede incluir una o varias habitaciones. Una habitación puede reservarse en distintos períodos, siempre que no existan reservas simultáneas. Los empleados participan en actividades de atención y administración. El sistema conserva fechas de entrada y salida, tarifas, servicios consumidos, estados de las habitaciones y pagos realizados.',
      entities: [
        { n: 'HUESPED', pos: [0, 1], cp: [0, 1], attrs: [ID('id_huesped'), S('nombre', 100, nn), S('documento', 20, { nn: 1, uq: 1 }), S('telefono', 20), S('correo')] },
        { n: 'RESERVA', pos: [1, 1], cp: [1, 1], attrs: [ID('id_reserva'), D('fecha_entrada', nn), D('fecha_salida', { nn: 1, ck: 'fecha_salida > fecha_entrada' })] },
        { n: 'EMPLEADO', pos: [1, 0], cp: [1, 0], attrs: [ID('id_empleado'), S('nombre', 100, nn), S('cargo', 50, nn)] },
        { n: 'PAGO', pos: [0, 0], cp: [0, 0], attrs: [ID('id_pago'), D('fecha_pago', nn), N('monto', { nn: 1, ck: 'monto > 0' }), S('metodo', 30, nn)] },
        { n: 'HABITACION', pos: [3, 1], cp: [2, 1], attrs: [ID('id_habitacion'), S('numero', 10, { nn: 1, uq: 1 }), S('tipo', 30, nn), N('tarifa_noche', { nn: 1, ck: 'tarifa_noche > 0' }), S('estado', 20, { nn: 1, def: "'Disponible'" })] },
        { n: 'SERVICIO', pos: [3, 2], cp: [2, 2], attrs: [ID('id_servicio'), S('nombre', 80, nn), N('precio', { nn: 1, ck: 'precio >= 0' })] }
      ],
      rels: [
        { n: 'realiza', a: 'HUESPED', b: 'RESERVA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'registra', a: 'EMPLEADO', b: 'RESERVA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'genera', a: 'RESERVA', b: 'PAGO', ca: [0, 'n'], cb: [1, 1], cpos: [0.5, 0.5] },
        { n: 'incluye', a: 'RESERVA', b: 'HABITACION', ca: [1, 'n'], cb: [0, 'n'], table: 'detalle_reserva', pos: [2, 1], attrs: [N('tarifa_aplicada', nn)] },
        { n: 'consume', a: 'RESERVA', b: 'SERVICIO', ca: [0, 'n'], cb: [0, 'n'], table: 'consumo_servicio', pos: [2, 2], attrs: [I('cantidad', { nn: 1, ck: 'cantidad > 0' }), D('fecha_consumo', nn)] }
      ],
      notes: [
        'RESERVA–HABITACION es N:M ("cada reserva incluye una o varias habitaciones" y "una habitación se reserva en distintos períodos") → tabla asociativa DETALLE_RESERVA con la tarifa aplicada.',
        'La regla "no pueden existir reservas simultáneas de una habitación" no se puede expresar con un CHECK simple: se controla con lógica de aplicación, un trigger o una restricción EXCLUDE en PostgreSQL. Menciónala como regla del negocio.',
        'El estado de la habitación se modela como atributo de dominio fijo con DEFAULT; si los estados cambiaran con el tiempo sería mejor una tabla ESTADO_HABITACION.',
        'El pago pertenece a una reserva (1,1); una reserva puede tener varios pagos (abonos).'
      ]
    },
    {
      id: 'restaurante', origin: 'taller', title: 'Administración de un restaurante',
      statement: 'Un restaurante necesita gestionar clientes, mesas, empleados, productos, pedidos y pagos. Los clientes realizan varios pedidos y cada pedido contiene varios productos; un producto aparece en muchos pedidos. Los empleados se encargan de pedidos y mesas durante su jornada. Se conserva el historial de pedidos, fechas y horas, cantidades, precios, descuentos y formas de pago.',
      entities: [
        { n: 'CLIENTE', pos: [0, 0], cp: [0, 0], attrs: [ID('id_cliente'), S('nombre', 100, nn), S('telefono', 20), S('correo')] },
        { n: 'EMPLEADO', pos: [1, 0], cp: [1, 0], attrs: [ID('id_empleado'), S('nombre', 100, nn), S('cargo', 50, nn)] },
        { n: 'MESA', pos: [2, 0], cp: [2, 0], attrs: [ID('id_mesa'), I('numero', { nn: 1, uq: 1 }), I('capacidad', { nn: 1, ck: 'capacidad > 0' }), S('ubicacion', 30)] },
        { n: 'PEDIDO', pos: [1, 1], cp: [1, 1], attrs: [ID('id_pedido'), T('fecha_hora', nn), N('descuento', { nn: 1, def: '0', ck: 'descuento >= 0' }), S('forma_pago', 20, { nn: 1, ck: "forma_pago IN ('Efectivo','Tarjeta','Transferencia')" })] },
        { n: 'PRODUCTO', pos: [2, 2], cp: [1, 2], attrs: [ID('id_producto'), S('nombre', 80, nn), N('precio', { nn: 1, ck: 'precio > 0' }), S('categoria', 30)] }
      ],
      rels: [
        { n: 'realiza', a: 'CLIENTE', b: 'PEDIDO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'atiende', a: 'EMPLEADO', b: 'PEDIDO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'ocupa', a: 'MESA', b: 'PEDIDO', ca: [0, 'n'], cb: [0, 1] },
        { n: 'contiene', a: 'PEDIDO', b: 'PRODUCTO', ca: [1, 'n'], cb: [0, 'n'], table: 'detalle_pedido', pos: [1, 2], attrs: [I('cantidad', { nn: 1, ck: 'cantidad > 0' }), N('precio_unitario', nn)] }
      ],
      notes: [
        'PEDIDO–PRODUCTO es N:M: la tabla DETALLE_PEDIDO guarda cantidad y precio_unitario (el precio al momento de la venta, que puede cambiar luego en PRODUCTO).',
        'id_mesa en PEDIDO admite NULL porque hay pedidos para llevar: cardinalidad (0,1) del lado del pedido.',
        'El historial de pedidos se conserva simplemente no borrando filas; la fecha y hora van en PEDIDO (TIMESTAMP).'
      ]
    },
    {
      id: 'gimnasio', origin: 'taller', title: 'Gestión de un gimnasio',
      statement: 'Un gimnasio requiere administrar afiliados, entrenadores, planes, clases, rutinas y pagos. Los afiliados pueden inscribirse en diferentes planes y participar en múltiples clases. Cada clase la dirige un entrenador y tiene varios afiliados. Los entrenadores diseñan rutinas y orientan a distintos afiliados. Se guardan fechas de inscripción, asistencia, tipos de entrenamiento, horarios, costos de los planes y pagos.',
      entities: [
        { n: 'PLAN', pos: [0, 0], cp: [0, 0], attrs: [ID('id_plan'), S('nombre', 60, { nn: 1, uq: 1 }), N('costo', { nn: 1, ck: 'costo > 0' }), I('duracion_meses', nn)] },
        { n: 'AFILIADO', pos: [2, 0], cp: [1, 0.4], attrs: [ID('id_afiliado'), S('nombre', 100, nn), S('documento', 20, { nn: 1, uq: 1 }), S('telefono', 20), D('fecha_nacimiento')] },
        { n: 'PAGO', pos: [3, 0], cp: [2, 0], attrs: [ID('id_pago'), D('fecha_pago', nn), N('monto', { nn: 1, ck: 'monto > 0' })] },
        { n: 'RUTINA', pos: [0, 2], cp: [0, 1.3], attrs: [ID('id_rutina'), S('nombre', 80, nn), S('nivel', 20, nn), { n: 'descripcion', t: 'TEXT' }] },
        { n: 'ENTRENADOR', pos: [1, 2], cp: [1, 2.2], attrs: [ID('id_entrenador'), S('nombre', 100, nn), S('especialidad', 60), S('telefono', 20)] },
        { n: 'CLASE', pos: [2, 2], cp: [2, 1.3], attrs: [ID('id_clase'), S('nombre', 80, nn), S('tipo_entrenamiento', 40, nn), S('dia_semana', 10, nn), { n: 'hora_inicio', t: 'TIME', nn: 1 }] }
      ],
      rels: [
        { n: 'se_inscribe', a: 'AFILIADO', b: 'PLAN', ca: [1, 'n'], cb: [0, 'n'], table: 'inscripcion_plan', pos: [1, 0], attrs: [D('fecha_inscripcion', { pk: 1, nn: 1 }), D('fecha_fin')] },
        { n: 'realiza_pago', a: 'AFILIADO', b: 'PAGO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'asiste', a: 'AFILIADO', b: 'CLASE', ca: [0, 'n'], cb: [0, 'n'], table: 'asistencia', pos: [2, 1], attrs: [D('fecha', { pk: 1, nn: 1 })] },
        { n: 'sigue', a: 'AFILIADO', b: 'RUTINA', ca: [0, 'n'], cb: [0, 'n'], table: 'asignacion_rutina', pos: [1, 1], attrs: [D('fecha_asignacion', { pk: 1, nn: 1 })] },
        { n: 'dirige', a: 'ENTRENADOR', b: 'CLASE', ca: [0, 'n'], cb: [1, 1] },
        { n: 'disena', a: 'ENTRENADOR', b: 'RUTINA', ca: [0, 'n'], cb: [1, 1] }
      ],
      notes: [
        'Inscripción, asistencia y asignación de rutinas son N:M "en el tiempo": la fecha forma parte de la clave primaria para permitir repetir el mismo par en fechas distintas.',
        'Que el entrenador "oriente afiliados" se resuelve a través de las rutinas que diseña y asigna; si el profesor lo exige como relación directa, agrega una N:M ENTRENADOR–AFILIADO.',
        'Si el costo del plan puede cambiar, guarda el costo cobrado en INSCRIPCION_PLAN (histórico).'
      ]
    },
    {
      id: 'vehiculos', origin: 'taller', title: 'Alquiler de vehículos',
      statement: 'Una empresa de alquiler gestiona vehículos, clientes, empleados, reservas, contratos y pagos. Un cliente realiza varias reservas y cada reserva corresponde a un vehículo durante un período específico. Un vehículo participa en distintos contratos a lo largo del tiempo. Los empleados gestionan contratos y reservas. Se almacenan fechas de alquiler y devolución, kilometraje, tarifas, estado del vehículo, seguros, costos adicionales y pagos.',
      entities: [
        { n: 'CLIENTE', pos: [0, 0], cp: [0, 0], attrs: [ID('id_cliente'), S('nombre', 100, nn), S('documento', 20, { nn: 1, uq: 1 }), S('telefono', 20), S('licencia', 20, nn)] },
        { n: 'VEHICULO', pos: [2, 0], cp: [2, 0], attrs: [ID('id_vehiculo'), S('placa', 10, { nn: 1, uq: 1 }), S('marca', 40, nn), S('modelo', 40, nn), I('kilometraje', { nn: 1, ck: 'kilometraje >= 0' }), S('estado', 20, { nn: 1, def: "'Disponible'" }), N('tarifa_dia', { nn: 1, ck: 'tarifa_dia > 0' })] },
        { n: 'RESERVA', pos: [1, 1], cp: [1, 0.9], attrs: [ID('id_reserva'), D('fecha_reserva', nn), D('fecha_inicio', nn), D('fecha_fin', { nn: 1, ck: 'fecha_fin >= fecha_inicio' })] },
        { n: 'EMPLEADO', pos: [0, 2], cp: [0, 2], attrs: [ID('id_empleado'), S('nombre', 100, nn), S('cargo', 50)] },
        { n: 'CONTRATO', pos: [1, 2], cp: [1, 2], attrs: [ID('id_contrato'), D('fecha_alquiler', nn), D('fecha_devolucion'), I('km_inicial', nn), I('km_final'), N('tarifa_pactada', nn), N('costos_adicionales', { nn: 1, def: '0' })] },
        { n: 'PAGO', pos: [2, 2], cp: [2, 2], attrs: [ID('id_pago'), D('fecha_pago', nn), N('monto', { nn: 1, ck: 'monto > 0' }), S('metodo', 30, nn)] },
        { n: 'SEGURO', pos: [2, 3], cp: [1, 3], attrs: [ID('id_seguro'), S('tipo', 50, nn), N('costo', nn)] }
      ],
      rels: [
        { n: 'realiza', a: 'CLIENTE', b: 'RESERVA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'es_reservado_en', a: 'VEHICULO', b: 'RESERVA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'origina', a: 'RESERVA', b: 'CONTRATO', ca: [0, 1], cb: [1, 1] },
        { n: 'gestiona', a: 'EMPLEADO', b: 'CONTRATO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'se_paga_con', a: 'CONTRATO', b: 'PAGO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'incluye', a: 'CONTRATO', b: 'SEGURO', ca: [0, 'n'], cb: [0, 'n'], table: 'contrato_seguro', pos: [1, 3] }
      ],
      notes: [
        'RESERVA–CONTRATO es 1:1 con cardinalidades (0,1) y (1,1): la clave se propaga hacia el lado obligatorio, el CONTRATO, como clave foránea NOT NULL y UNIQUE (regla de transformación 1:1 del curso).',
        'El vehículo llega al contrato a través de la reserva; así, un vehículo participa en muchos contratos a lo largo del tiempo sin repetir la relación. Si tu profesor pide la relación directa, agrega id_vehiculo a CONTRATO.',
        'Los empleados también registran reservas: si el enunciado lo exige, agrega la relación EMPLEADO–RESERVA (1:N).'
      ]
    },
    {
      id: 'ecommerce', origin: 'taller', title: 'Plataforma de comercio electrónico',
      statement: 'Una empresa de comercio electrónico administra clientes, productos, categorías, pedidos, proveedores, envíos y pagos. Los clientes hacen varios pedidos y cada pedido contiene varios productos; un producto aparece en muchos pedidos y puede pertenecer a una categoría. Los proveedores suministran diferentes productos y un producto puede ser suministrado por varios proveedores. Se registran fechas de los pedidos, cantidades, precios, estados de envío, direcciones de entrega, métodos de pago y valores cancelados.',
      entities: [
        { n: 'CLIENTE', pos: [0, 0], cp: [0, 0], attrs: [ID('id_cliente'), S('nombre', 100, nn), S('correo', 100, { nn: 1, uq: 1 }), S('telefono', 20)] },
        { n: 'PEDIDO', pos: [1, 0], cp: [1, 0], attrs: [ID('id_pedido'), D('fecha_pedido', nn), S('estado', 20, { nn: 1, def: "'Pendiente'" }), S('metodo_pago', 30, nn), N('valor_cancelado', { nn: 1, def: '0', ck: 'valor_cancelado >= 0' })] },
        { n: 'ENVIO', pos: [2, 0], cp: [2, 0], attrs: [ID('id_envio'), S('direccion_entrega', 200, nn), S('estado_envio', 20, nn), D('fecha_envio')] },
        { n: 'CATEGORIA', pos: [0, 2], cp: [0, 1.2], attrs: [ID('id_categoria'), S('nombre', 60, { nn: 1, uq: 1 })] },
        { n: 'PRODUCTO', pos: [1, 2], cp: [1, 1.2], attrs: [ID('id_producto'), S('nombre', 100, nn), N('precio', { nn: 1, ck: 'precio > 0' }), I('stock', { nn: 1, def: '0', ck: 'stock >= 0' })] },
        { n: 'PROVEEDOR', pos: [3, 2], cp: [2, 1.2], attrs: [ID('id_proveedor'), S('nombre', 100, nn), S('correo'), S('telefono', 20)] }
      ],
      rels: [
        { n: 'realiza', a: 'CLIENTE', b: 'PEDIDO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'se_despacha_en', a: 'PEDIDO', b: 'ENVIO', ca: [0, 1], cb: [1, 1] },
        { n: 'contiene', a: 'PEDIDO', b: 'PRODUCTO', ca: [1, 'n'], cb: [0, 'n'], table: 'detalle_pedido', pos: [1, 1], attrs: [I('cantidad', { nn: 1, ck: 'cantidad > 0' }), N('precio_unitario', nn)] },
        { n: 'clasifica', a: 'CATEGORIA', b: 'PRODUCTO', ca: [0, 'n'], cb: [0, 1] },
        { n: 'suministra', a: 'PROVEEDOR', b: 'PRODUCTO', ca: [0, 'n'], cb: [1, 'n'], table: 'suministro', pos: [2, 2], attrs: [N('precio_compra')] }
      ],
      notes: [
        'Dos N:M distintas: PEDIDO–PRODUCTO (DETALLE_PEDIDO) y PROVEEDOR–PRODUCTO (SUMINISTRO). Cada una genera su propia tabla asociativa con clave compuesta.',
        'PRODUCTO–CATEGORIA es 1:N con cardinalidad (0,1) del lado del producto ("puede pertenecer a una categoría"): id_categoria admite NULL.',
        'PEDIDO–ENVIO es 1:1 con (0,1)/(1,1): un pedido cancelado puede no tener envío; la FK va en ENVIO, NOT NULL y UNIQUE.',
        'valor_cancelado se interpreta como el valor pagado/abonado del pedido (valores "cancelados" en el sentido de pago).'
      ]
    },

    /* ====================== EJEMPLOS DE CLASE ====================== */
    {
      id: 'ventas', origin: 'clase', title: 'Sistema de ventas de una tienda',
      statement: 'Una tienda necesita registrar sus ventas. Un cliente puede realizar muchas ventas y cada venta pertenece a un solo cliente. Una venta contiene varios productos y un producto aparece en muchas ventas. Cada producto pertenece a una sola categoría y una categoría tiene muchos productos. Cada venta guarda fecha, cliente y total; en cada detalle de venta se registran la cantidad y el precio de venta. Opcional: un empleado registra la venta.',
      entities: [
        { n: 'CLIENTE', pos: [0, 0], cp: [0, 0], attrs: [ID('id_cliente'), S('nombre', 80, nn), S('apellido', 80, nn), S('telefono', 20), S('correo')] },
        { n: 'VENTA', pos: [1, 0], cp: [1, 0], attrs: [ID('id_venta'), D('fecha', nn), N('total', { nn: 1, ck: 'total >= 0' })] },
        { n: 'EMPLEADO', pos: [2, 0], cp: [2, 0], attrs: [ID('id_empleado'), S('nombre', 100, nn)] },
        { n: 'DETALLE_VENTA', pos: [1, 1], cp: [1, 1.1], attrs: [ID('id_detalle'), I('cantidad', { nn: 1, ck: 'cantidad > 0' }), N('precio', nn)] },
        { n: 'PRODUCTO', pos: [1, 2], cp: [1, 2.2], attrs: [ID('id_producto'), S('nombre', 100, nn), N('precio', { nn: 1, ck: 'precio > 0' }), I('stock', { nn: 1, def: '0' })] },
        { n: 'CATEGORIA', pos: [2, 2], cp: [2, 2.2], attrs: [ID('id_categoria'), S('nombre', 60, nn)] }
      ],
      rels: [
        { n: 'realiza', a: 'CLIENTE', b: 'VENTA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'registra', a: 'EMPLEADO', b: 'VENTA', ca: [0, 'n'], cb: [0, 1] },
        { n: 'contiene', a: 'VENTA', b: 'DETALLE_VENTA', ca: [1, 'n'], cb: [1, 1] },
        { n: 'aparece_en', a: 'PRODUCTO', b: 'DETALLE_VENTA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'agrupa', a: 'CATEGORIA', b: 'PRODUCTO', ca: [0, 'n'], cb: [1, 1] }
      ],
      notes: [
        'Aquí la N:M VENTA–PRODUCTO se modeló desde el diagrama de Chen con la entidad DETALLE_VENTA (entidad asociativa) y dos 1:N. Es la solución de la presentación de clase: DETALLE_VENTA tiene su propia clave id_detalle más las FK id_venta e id_producto.',
        'El empleado es opcional: id_empleado en VENTA admite NULL (cardinalidad (0,1)).'
      ]
    },
    {
      id: 'academico', origin: 'clase', title: 'Sistema de gestión académica',
      statement: 'Una universidad registra estudiantes, docentes y cursos. Un estudiante se matricula en varios cursos y un curso tiene varios estudiantes. Cada curso lo dicta un docente. Las calificaciones se asocian a un estudiante y a un curso específico.',
      entities: [
        { n: 'ESTUDIANTE', pos: [0, 0], cp: [0, 0], attrs: [ID('id_estudiante'), S('nombre', 100, nn), S('correo', 100, { nn: 1, uq: 1 })] },
        { n: 'CURSO', pos: [2, 0], cp: [2, 0], attrs: [ID('id_curso'), S('nombre', 100, nn), I('creditos', { nn: 1, ck: 'creditos > 0' })] },
        { n: 'DOCENTE', pos: [2, 1], cp: [2, 1.2], attrs: [ID('id_docente'), S('nombre', 100, nn), S('correo', 100, { nn: 1, uq: 1 })] }
      ],
      rels: [
        { n: 'se_matricula', a: 'ESTUDIANTE', b: 'CURSO', ca: [0, 'n'], cb: [1, 'n'], table: 'matricula', pos: [1, 0], attrs: [D('fecha_matricula', nn), { n: 'nota', t: 'NUMERIC(3,2)', ck: 'nota BETWEEN 0 AND 5' }] },
        { n: 'dicta', a: 'DOCENTE', b: 'CURSO', ca: [0, 'n'], cb: [1, 1] }
      ],
      notes: [
        'La calificación depende del par (estudiante, curso): es un atributo de la relación N:M, por eso vive en MATRICULA.',
        'Una N:M con atributos propios se dibuja en Chen con los atributos colgando del rombo.'
      ]
    },
    {
      id: 'empresa', origin: 'clase', title: 'Empresa, clientes, productos y proveedores',
      statement: 'Una empresa vende productos a varios clientes. De los clientes se guardan nombre, apellidos, id, dirección y fecha de nacimiento. Cada producto tiene nombre, código y precio unitario. Un cliente puede comprar varios productos y un producto puede ser comprado por varios clientes. Los productos son suministrados por proveedores; un producto sólo lo suministra un proveedor y un proveedor puede suministrar varios productos. De cada proveedor: nit, nombre, dirección y teléfono (indicativo y número).',
      entities: [
        { n: 'CLIENTE', pos: [0, 0], cp: [0, 0], attrs: [{ n: 'id_cliente', t: 'VARCHAR(20)', pk: 1 }, S('nombre', 60, nn), S('apellidos', 80, nn), S('direccion', 120), D('fecha_nacimiento')] },
        { n: 'PRODUCTO', pos: [2, 0], cp: [1, 0], attrs: [{ n: 'codigo', t: 'VARCHAR(20)', pk: 1 }, S('nombre', 80, nn), N('precio_unitario', { nn: 1, ck: 'precio_unitario > 0' })] },
        { n: 'PROVEEDOR', pos: [2, 1], cp: [1, 1.3], attrs: [{ n: 'nit', t: 'VARCHAR(20)', pk: 1 }, S('nombre', 80, nn), S('direccion', 120), { n: 'indicativo', t: 'VARCHAR(5)' }, { n: 'numero', t: 'VARCHAR(15)' }] }
      ],
      rels: [
        { n: 'compra', a: 'CLIENTE', b: 'PRODUCTO', ca: [0, 'n'], cb: [0, 'n'], table: 'compra', pos: [1, 0], attrs: [D('fecha', { pk: 1, nn: 1 })] },
        { n: 'suministra', a: 'PROVEEDOR', b: 'PRODUCTO', ca: [0, 'n'], cb: [1, 1] }
      ],
      notes: [
        'No se modela EMPRESA como entidad: es la organización dueña del sistema, tiene una sola instancia y no aporta información que se guarde (pregunta de clase: "¿por qué NO debemos modelar empresa?").',
        'El teléfono es un atributo compuesto (indicativo + número): en el modelo relacional se descompone en dos columnas simples.',
        'Se agregó la fecha a COMPRA como parte de la clave para registrar compras repetidas en el tiempo; si el enunciado no lo pide, la clave puede ser solo (id_cliente, codigo).'
      ]
    },
    {
      id: 'instituto', origin: 'clase', title: 'Instituto: profesores, asignaturas y alumnos',
      statement: 'Un instituto guarda datos de profesores (identificación, nombre, dirección y teléfono). Los profesores imparten asignaturas (código y nombre). Cada alumno se matricula en una o varias asignaturas; del alumno interesa el número de hoja de vida académica, primer y segundo nombre, primer y segundo apellido y fecha de nacimiento. Un profesor puede impartir varias asignaturas, pero una asignatura solo la imparte un profesor. Segundo nombre y segundo apellido son opcionales.',
      entities: [
        { n: 'PROFESOR', pos: [0, 0], cp: [0, 0], attrs: [{ n: 'id_profesor', t: 'VARCHAR(20)', pk: 1 }, S('nombre', 100, nn), S('direccion', 120), S('telefono', 20)] },
        { n: 'ASIGNATURA', pos: [1, 0], cp: [1, 0], attrs: [{ n: 'codigo', t: 'VARCHAR(10)', pk: 1 }, S('nombre', 80, nn)] },
        { n: 'ALUMNO', pos: [3, 0], cp: [2, 0], attrs: [{ n: 'hoja_vida', t: 'VARCHAR(20)', pk: 1 }, S('primer_nombre', 40, nn), S('segundo_nombre', 40), S('primer_apellido', 40, nn), S('segundo_apellido', 40), D('fecha_nacimiento', nn)] }
      ],
      rels: [
        { n: 'imparte', a: 'PROFESOR', b: 'ASIGNATURA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'se_matricula', a: 'ALUMNO', b: 'ASIGNATURA', ca: [1, 'n'], cb: [0, 'n'], table: 'matricula', pos: [2, 0] }
      ],
      notes: [
        'Los atributos opcionales (segundo_nombre, segundo_apellido) se dibujan con línea punteada en Chen y se declaran sin NOT NULL.',
        'El nombre es un atributo compuesto (primer y segundo nombre): se descompone en columnas simples en el modelo relacional.'
      ]
    },
    {
      id: 'biblioteca', origin: 'lab', title: 'Sistema de biblioteca (laboratorio DDL/DML)',
      statement: 'La biblioteca gestiona libros, autores, usuarios y préstamos. Un autor escribe varios libros. Un usuario realiza varios préstamos y un libro puede ser prestado varias veces en distintos momentos. Cada préstamo guarda la fecha de préstamo y la fecha de devolución (NULL mientras el préstamo siga activo).',
      entities: [
        { n: 'AUTOR', table: 'autores', pos: [0, 0], cp: [0, 0], attrs: [ID('id_autor'), S('nombre', 100, nn), S('nacionalidad', 50)] },
        { n: 'LIBRO', table: 'libros', pos: [1, 0], cp: [1, 0], attrs: [ID('id_libro'), S('titulo', 150, nn), I('anio_publicacion')] },
        { n: 'PRESTAMO', table: 'prestamos', pos: [1, 1], cp: [1, 1.2], attrs: [ID('id_prestamo'), D('fecha_prestamo'), D('fecha_devolucion')] },
        { n: 'USUARIO', table: 'usuarios', pos: [0, 1], cp: [0, 1.2], attrs: [ID('id_usuario'), S('nombre', 100, nn), S('correo', 100)] }
      ],
      rels: [
        { n: 'escribe', a: 'AUTOR', b: 'LIBRO', ca: [0, 'n'], cb: [0, 1] },
        { n: 'es_prestado_en', a: 'LIBRO', b: 'PRESTAMO', ca: [0, 'n'], cb: [1, 1] },
        { n: 'realiza', a: 'USUARIO', b: 'PRESTAMO', ca: [0, 'n'], cb: [1, 1] }
      ],
      notes: [
        'Este DDL reproduce exactamente las 4 tablas del laboratorio (autores, libros, usuarios, prestamos): SERIAL como clave y FOREIGN KEY ... REFERENCES.',
        'PRESTAMO es entidad asociativa con clave propia: así un mismo usuario puede pedir el mismo libro más de una vez.'
      ]
    },

    /* ====================== CASOS ADICIONALES (práctica propia) ====================== */
    {
      id: 'veterinaria', origin: 'extra', title: 'Clínica veterinaria',
      statement: 'Una clínica veterinaria registra dueños (con uno o varios teléfonos), mascotas, veterinarios, citas y medicamentos. Un dueño posee varias mascotas y cada mascota tiene un solo dueño. Una mascota tiene muchas citas; cada cita la atiende un veterinario. En una cita se pueden recetar varios medicamentos (con dosis y duración) y un medicamento se receta en muchas citas.',
      entities: [
        { n: 'DUENO', pos: [0, 0], cp: [0, 0], attrs: [ID('id_dueno'), S('nombre', 100, nn), S('documento', 20, { nn: 1, uq: 1 }), { n: 'telefono', t: 'VARCHAR(20)', multi: 1 }] },
        { n: 'MASCOTA', pos: [1, 0], cp: [1, 0], attrs: [ID('id_mascota'), S('nombre', 60, nn), S('especie', 30, nn), S('raza', 40), D('fecha_nacimiento')] },
        { n: 'CITA', pos: [2, 0], cp: [1, 1.1], attrs: [ID('id_cita'), T('fecha_hora', nn), S('motivo', 150, nn), { n: 'diagnostico', t: 'TEXT' }] },
        { n: 'VETERINARIO', pos: [3, 0], cp: [0, 1.1], attrs: [ID('id_veterinario'), S('nombre', 100, nn), S('especialidad', 60)] },
        { n: 'MEDICAMENTO', pos: [3, 1], cp: [2, 1.1], attrs: [ID('id_medicamento'), S('nombre', 80, nn), N('precio', { nn: 1, ck: 'precio >= 0' })] }
      ],
      rels: [
        { n: 'posee', a: 'DUENO', b: 'MASCOTA', ca: [1, 'n'], cb: [1, 1] },
        { n: 'tiene', a: 'MASCOTA', b: 'CITA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'atiende', a: 'VETERINARIO', b: 'CITA', ca: [0, 'n'], cb: [1, 1] },
        { n: 'receta', a: 'CITA', b: 'MEDICAMENTO', ca: [0, 'n'], cb: [0, 'n'], table: 'receta', pos: [2, 1], attrs: [S('dosis', 50, nn), I('duracion_dias', { ck: 'duracion_dias > 0' })] }
      ],
      notes: [
        'El atributo multivaluado telefono (doble óvalo en Chen) se convierte en la tabla DUENO_TELEFONO con clave compuesta (id_dueno, telefono).',
        'La N:M CITA–MEDICAMENTO lleva atributos propios (dosis, duracion_dias): viven en la tabla RECETA.'
      ]
    },
    {
      id: 'colegio', origin: 'extra', title: 'Colegio: generalización y relación reflexiva',
      statement: 'Un colegio registra personas, que pueden ser estudiantes o docentes (todo estudiante y todo docente es una persona; una persona no puede ser ambas cosas). Los docentes dictan cursos (un curso lo dicta un solo docente) y cada docente puede tener un docente coordinador (relación reflexiva). Los estudiantes se matriculan en cursos y reciben una nota por curso.',
      entities: [
        { n: 'PERSONA', pos: [1, 0], cp: [1, 0], attrs: [ID('id_persona'), S('documento', 20, { nn: 1, uq: 1 }), S('nombre', 100, nn), D('fecha_nacimiento')] },
        { n: 'ESTUDIANTE', pos: [0, 1], cp: [0, 1.3], attrs: [S('grado', 10, nn), { n: 'promedio', t: 'NUMERIC(3,2)', ck: 'promedio BETWEEN 0 AND 5' }] },
        { n: 'DOCENTE', pos: [2, 1], cp: [2, 1.3], attrs: [S('titulo', 60), N('salario', { ck: 'salario > 0' })] },
        { n: 'CURSO', pos: [1, 2], cp: [1, 2.6], attrs: [ID('id_curso'), S('nombre', 80, nn), I('creditos', { nn: 1, ck: 'creditos > 0' })] }
      ],
      isa: [{ sup: 'PERSONA', subs: ['ESTUDIANTE', 'DOCENTE'], total: true, excl: true }],
      rels: [
        { n: 'dicta', a: 'DOCENTE', b: 'CURSO', ca: [0, 'n'], cb: [1, 1], fk: 'id_docente' },
        { n: 'coordina', a: 'DOCENTE', b: 'DOCENTE', ca: [0, 1], cb: [0, 'n'], fk: 'id_coordinador' },
        { n: 'se_matricula', a: 'ESTUDIANTE', b: 'CURSO', ca: [0, 'n'], cb: [0, 'n'], table: 'matricula', fkA: 'id_estudiante', pos: [0, 2], attrs: [{ n: 'nota', t: 'NUMERIC(3,2)', ck: 'nota BETWEEN 0 AND 5' }] }
      ],
      notes: [
        'Generalización total y exclusiva con muchos atributos distintos entre subtipos: se aplica la 2.ª opción del curso (una tabla por supertipo y una por subtipo; la clave de PERSONA pasa a los subtipos como PK y FK).',
        'La relación reflexiva COORDINA se transforma con la 1.ª solución del curso: propagar la clave dentro de la misma tabla (id_coordinador, con nombre de rol) — admite NULL porque el coordinador general no tiene coordinador.'
      ]
    },
    {
      id: 'aerolinea', origin: 'extra', title: 'Aerolínea: dos relaciones entre las mismas entidades',
      statement: 'Una aerolínea administra aeropuertos, aviones, vuelos y pasajeros. Cada vuelo sale de un aeropuerto de origen y llega a un aeropuerto de destino, y se realiza con un solo avión. Un aeropuerto es origen o destino de muchos vuelos. Un pasajero reserva varios vuelos y un vuelo tiene varios pasajeros; de cada reserva interesa el asiento y la clase.',
      entities: [
        { n: 'AEROPUERTO', pos: [0, 0], cp: [0, 0], attrs: [{ n: 'codigo_iata', t: 'CHAR(3)', pk: 1 }, S('nombre', 100, nn), S('ciudad', 60, nn)] },
        { n: 'AVION', pos: [2, 0], cp: [2, 0], attrs: [{ n: 'matricula', t: 'VARCHAR(10)', pk: 1 }, S('modelo', 40, nn), I('capacidad', { nn: 1, ck: 'capacidad > 0' })] },
        { n: 'VUELO', pos: [1, 1], cp: [1, 1], attrs: [ID('id_vuelo'), S('numero_vuelo', 10, nn), T('fecha_salida', nn), T('fecha_llegada', nn)] },
        { n: 'PASAJERO', pos: [2, 2], cp: [1, 2.2], attrs: [ID('id_pasajero'), S('documento', 20, { nn: 1, uq: 1 }), S('nombre', 100, nn), S('pais', 40)] }
      ],
      rels: [
        { n: 'sale_de', a: 'VUELO', b: 'AEROPUERTO', ca: [1, 1], cb: [0, 'n'], fk: 'aeropuerto_origen', cpos: [0.45, 0.35] },
        { n: 'llega_a', a: 'VUELO', b: 'AEROPUERTO', ca: [1, 1], cb: [0, 'n'], fk: 'aeropuerto_destino', cpos: [0.45, 0.8] },
        { n: 'se_realiza_con', a: 'VUELO', b: 'AVION', ca: [1, 1], cb: [0, 'n'], fk: 'matricula_avion' },
        { n: 'reserva', a: 'PASAJERO', b: 'VUELO', ca: [0, 'n'], cb: [0, 'n'], table: 'reserva_vuelo', pos: [1, 2], attrs: [S('asiento', 5, nn), S('clase', 20, { nn: 1, def: "'Economica'" })] }
      ],
      notes: [
        'Cuando dos relaciones unen las MISMAS dos entidades hay que darles nombres de columna distintos a las claves foráneas (aeropuerto_origen y aeropuerto_destino), ambas apuntando a codigo_iata.',
        'La tabla de reservas usa clave compuesta (id_pasajero, id_vuelo); si un pasajero pudiera reservar dos veces el mismo vuelo, agrega una clave propia.',
        'Una restricción adicional razonable: CHECK (aeropuerto_origen <> aeropuerto_destino).'
      ]
    }
  ];
});
