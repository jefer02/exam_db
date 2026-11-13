/* Tema 12 · Vistas, índices, transacciones (ACID), procedimientos almacenados y disparadores. */
(function (root) {
  const B = 'bancodb', E = 'bd_estudiantes_joins';
  (root.MODULES = root.MODULES || []).push({
    id: 'avanzado', n: 12, title: 'Vistas, índices, transacciones (ACID), procedimientos y disparadores', short: 'Vistas, índices y transacciones', minutes: 35,
    desc: 'Conceptos que cierran el curso: CREATE VIEW, CREATE INDEX, BEGIN/COMMIT/ROLLBACK, propiedades ACID, procedimientos almacenados y triggers.',
    goals: ['Explicar qué es una vista y crear una.', 'Explicar para qué sirve un índice y su costo.',
      'Explicar qué es una transacción, usar BEGIN/COMMIT/ROLLBACK y definir cada propiedad ACID.',
      'Reconocer un procedimiento almacenado y un disparador (trigger).'],
    sections: [
      { id: 'vistas', h: 'Vistas (CREATE VIEW)', body: [
        '<p>Una <b>vista</b> es una <b>consulta guardada con nombre</b> que se usa como si fuera una tabla. No guarda datos propios: cada vez que la consultas, ejecuta su SELECT con los datos actuales.</p>',
        '<ul><li><b>Simplifica:</b> un JOIN largo se escribe una vez.</li><li><b>Seguridad:</b> se da permiso sobre la vista y no sobre las tablas (por ejemplo, sin la columna salario).</li><li><b>Independencia:</b> si cambian las tablas, se ajusta la vista y los programas siguen igual.</li></ul>',
        { ex: { id: 'vista', db: E, sql: 'CREATE VIEW v_notas AS\nSELECT e.nombre, e.apellido, c.nombre_curso, i.nota_final\nFROM estudiantes e\nJOIN inscripciones i ON e.id_estudiante = i.id_estudiante\nJOIN cursos c ON i.id_curso = c.id_curso;\n\n-- se usa como una tabla:\nSELECT nombre, nombre_curso, nota_final\nFROM v_notas\nWHERE nota_final >= 4.5\nORDER BY nota_final DESC;' } },
        { sql: 'DROP VIEW v_notas;   -- borra la vista (las tablas no se tocan)' }
      ] },
      { id: 'indices', h: 'Índices (concepto)', body: [
        '<p>Un <b>índice</b> es como el índice alfabético de un libro: en vez de leer todas las páginas (recorrer toda la tabla), el SGBD va directo a las filas que busca.</p>',
        { cols: [['<h4>✅ Ventajas</h4><ul><li>Acelera WHERE, JOIN y ORDER BY sobre la columna indexada.</li><li>PRIMARY KEY y UNIQUE crean un índice automáticamente.</li></ul>'], ['<h4>⚠ Costos</h4><ul><li>Ocupa espacio.</li><li>Hace más lentos los INSERT, UPDATE y DELETE (hay que actualizar el índice).</li><li>No conviene en tablas pequeñas o en columnas con pocos valores distintos.</li></ul>']] },
        { ex: { id: 'idx', db: E, sql: "CREATE INDEX idx_estudiantes_ciudad ON estudiantes (ciudad);\n\nSELECT indexname, indexdef\nFROM pg_indexes\nWHERE tablename = 'estudiantes' AND schemaname = current_schema();", note: 'Aparecen el índice de la PK (creado solo) y el nuevo.' } },
        { ex: { id: 'explain', db: E, title: 'EXPLAIN muestra cómo piensa ejecutar la consulta', sql: 'EXPLAIN SELECT * FROM estudiantes WHERE id_estudiante = 3;', note: 'Con 7 filas PostgreSQL puede preferir recorrer la tabla (Seq Scan): para tablas pequeñas es más rápido que usar el índice.' } }
      ] },
      { id: 'tx', h: 'Transacciones: todo o nada', body: [
        '<p>Una <b>transacción</b> es un grupo de operaciones que se ejecutan como <b>una sola unidad</b>: o se hacen todas, o no se hace ninguna. Ejemplo clásico del sistema bancario: una transferencia resta de una cuenta y suma en otra. Si se cae el sistema entre las dos operaciones, no puede desaparecer el dinero.</p>',
        { sql: 'BEGIN;        -- inicia la transacción\n  ...         -- operaciones\nCOMMIT;       -- confirma: los cambios quedan permanentes\n-- o\nROLLBACK;     -- deshace todo lo hecho desde BEGIN' },
        { ex: { id: 'commit', db: B, title: 'Transferencia de 200.000 de la cuenta 20001 a la 20002', sql: "BEGIN;\nUPDATE cuentas SET saldo = saldo - 200000 WHERE numero_cuenta = '20001';\nUPDATE cuentas SET saldo = saldo + 200000 WHERE numero_cuenta = '20002';\nINSERT INTO transacciones (tipo, monto, id_cuenta) VALUES ('Transferencia', 200000, 1);\nCOMMIT;\n\nSELECT numero_cuenta, saldo FROM cuentas WHERE numero_cuenta IN ('20001', '20002');" } },
        { ex: { id: 'rollback', db: B, title: 'ROLLBACK deshace todo', sql: "BEGIN;\nUPDATE cuentas SET saldo = 0;                 -- ¡error grave!\nSELECT numero_cuenta, saldo FROM cuentas;     -- dentro de la transacción: todo en 0\nROLLBACK;\nSELECT numero_cuenta, saldo FROM cuentas;     -- después del ROLLBACK: como antes" } },
        '<h3>Propiedades ACID</h3>',
        `<div class="tblwrap"><table><tr><th>Propiedad</th><th>Significa</th><th>En la transferencia</th></tr>
<tr><td><b>A</b>tomicidad</td><td>Todo o nada</td><td>No puede quedar el débito sin el crédito</td></tr>
<tr><td><b>C</b>onsistencia</td><td>Pasa de un estado válido a otro válido (respeta las restricciones)</td><td>La suma de los saldos no cambia; no se violan PK, FK ni CHECK</td></tr>
<tr><td><b>I</b>slamiento (Isolation)</td><td>Las transacciones simultáneas no se ven a medio terminar</td><td>Otro cajero no ve el dinero "en el aire"</td></tr>
<tr><td><b>D</b>urabilidad</td><td>Lo confirmado (COMMIT) sobrevive a fallos</td><td>Si se va la luz después del COMMIT, la transferencia sigue</td></tr></table></div>`,
        { exam: 'Pregunta abierta típica: "¿Qué es una transacción? Explique las propiedades ACID con un ejemplo." Usa la transferencia bancaria.' }
      ] },
      { id: 'proc', h: 'Procedimientos almacenados y disparadores (triggers)', body: [
        '<p>El contenido programático del curso los incluye al final. Un <b>procedimiento almacenado</b> es un bloque de código guardado en el SGBD que se ejecuta con <code>CALL</code>. Un <b>disparador (trigger)</b> se ejecuta <b>solo</b> cuando ocurre un evento (INSERT, UPDATE o DELETE) sobre una tabla.</p>',
        { ex: { id: 'proc', db: B, title: 'Procedimiento: transferir entre cuentas', sql: "CREATE PROCEDURE transferir(origen VARCHAR, destino VARCHAR, valor NUMERIC)\nLANGUAGE plpgsql AS $$\nBEGIN\n  UPDATE cuentas SET saldo = saldo - valor WHERE numero_cuenta = origen;\n  UPDATE cuentas SET saldo = saldo + valor WHERE numero_cuenta = destino;\nEND;\n$$;\n\nCALL transferir('20005', '20004', 500000);\nSELECT numero_cuenta, saldo FROM cuentas WHERE numero_cuenta IN ('20004', '20005');" } },
        { ex: { id: 'trigger', db: B, title: 'Disparador: auditar cada cambio de saldo', sql: "CREATE TABLE auditoria (\n  id_auditoria   SERIAL PRIMARY KEY,\n  id_cuenta      INT,\n  saldo_anterior NUMERIC(14,2),\n  saldo_nuevo    NUMERIC(14,2)\n);\n\nCREATE FUNCTION registrar_cambio() RETURNS TRIGGER AS $$\nBEGIN\n  INSERT INTO auditoria (id_cuenta, saldo_anterior, saldo_nuevo)\n  VALUES (OLD.id_cuenta, OLD.saldo, NEW.saldo);\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trg_saldo\nAFTER UPDATE OF saldo ON cuentas\nFOR EACH ROW EXECUTE FUNCTION registrar_cambio();\n\nUPDATE cuentas SET saldo = saldo + 100000 WHERE id_cuenta IN (1, 2);\nSELECT * FROM auditoria;   -- el trigger escribió 2 filas solo" } },
        '<h3>DCL: permisos</h3>',
        { sql: "GRANT SELECT ON v_notas TO docente;          -- dar permiso de lectura\nREVOKE SELECT ON v_notas FROM docente;       -- quitarlo" }
      ] }
    ],
    keys: ['Vista = consulta guardada con nombre; se usa como tabla y no guarda datos propios.',
      'Índice = acceso rápido por una columna; acelera búsquedas y hace más lentas las escrituras. La PK y los UNIQUE lo crean solos.',
      'Transacción = todo o nada: BEGIN … COMMIT (confirmar) o ROLLBACK (deshacer).',
      'ACID: Atomicidad, Consistencia, Aislamiento, Durabilidad.',
      'Procedimiento: código guardado que se llama con CALL. Trigger: se ejecuta solo ante INSERT/UPDATE/DELETE.',
      'DCL: GRANT y REVOKE para permisos.'],
    quiz: [
      { q: '¿Qué es una vista?', o: [
        { t: 'Una consulta guardada con nombre que se usa como una tabla', ok: true, why: 'Correcto: no almacena datos propios.' },
        { t: 'Una copia física de una tabla', why: 'La vista ejecuta su consulta cada vez; no copia los datos.' },
        { t: 'Un índice especial', why: 'Los índices aceleran búsquedas; son otra cosa.' },
        { t: 'Un diagrama de la base de datos', why: 'En SQL, una vista es un objeto definido con CREATE VIEW.' }] },
      { q: '¿Qué desventaja tiene crear muchos índices?', o: [
        { t: 'Hacen más lentos los INSERT, UPDATE y DELETE y ocupan espacio', ok: true, why: 'Correcto: cada índice debe actualizarse en cada escritura.' },
        { t: 'Hacen más lentos los SELECT', why: 'Al contrario: los aceleran.' },
        { t: 'Borran datos duplicados', why: 'Un índice normal no borra nada (UNIQUE impide insertar duplicados).' },
        { t: 'Ninguna', why: 'Tienen costo de espacio y de escritura.' }] },
      { q: 'En una transferencia bancaria se ejecutó el débito pero el sistema falló antes del crédito. ¿Qué propiedad garantiza que se deshaga el débito?', o: [
        { t: 'Atomicidad', ok: true, why: 'Correcto: todo o nada.' },
        { t: 'Durabilidad', why: 'La durabilidad protege lo que ya se confirmó con COMMIT.' },
        { t: 'Aislamiento', why: 'El aislamiento trata de transacciones simultáneas.' },
        { t: 'Normalización', why: 'No es una propiedad de las transacciones.' }] },
      { q: '¿Qué hace ROLLBACK?', o: [
        { t: 'Deshace todos los cambios hechos desde el BEGIN', ok: true, why: 'Correcto.' },
        { t: 'Confirma los cambios', why: 'Eso es COMMIT.' },
        { t: 'Borra la tabla', why: 'Eso es DROP TABLE.' },
        { t: 'Reinicia el servidor', why: 'Solo afecta a la transacción actual.' }] },
      { q: 'Un código que se ejecuta automáticamente cada vez que se actualiza una tabla es…', o: [
        { t: 'Un disparador (trigger)', ok: true, why: 'Correcto: se "dispara" ante INSERT, UPDATE o DELETE.' },
        { t: 'Una vista', why: 'Una vista solo se ejecuta cuando la consultas.' },
        { t: 'Un índice', why: 'Un índice no ejecuta código.' },
        { t: 'Un procedimiento almacenado', why: 'El procedimiento se ejecuta cuando lo llamas con CALL.' }] }
    ],
    practice: { quiz: ['sql'] }
  });
})(typeof self !== 'undefined' ? self : globalThis);
