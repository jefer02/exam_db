/* Bases de datos de práctica (PostgreSQL vía PGlite).
   Cada base del curso vive en su propio esquema, como si hicieras \c nombre_bd en psql.
   - orig: datos EXACTOS del material del profesor (scripts del curso).
   - ext:  los mismos datos + registros "extra" (marcados con -- EXTRA) para practicar
           SELF JOIN y registros sin relación (NULL en LEFT/RIGHT/FULL JOIN).
   Para agregar una base: añade un objeto a DBS con base (DDL + INSERT) y extra. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PRACTICE_DB = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const DBS = [
    {
      id: 'bd_estudiantes_joins',
      title: 'bd_estudiantes_joins (Sesión 8 · JOINs)',
      source: 'Script bd_estudiantes_joins publicado en la plataforma.',
      base: `
CREATE TABLE estudiantes (
  id_estudiante SERIAL PRIMARY KEY,
  nombre   VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo   VARCHAR(150),
  edad     INT,
  ciudad   VARCHAR(50)
);
CREATE TABLE cursos (
  id_curso     SERIAL PRIMARY KEY,
  nombre_curso VARCHAR(100) NOT NULL,
  duracion     INT,
  docente      VARCHAR(100)
);
CREATE TABLE inscripciones (
  id_inscripcion    SERIAL PRIMARY KEY,
  id_estudiante     INT,
  id_curso          INT,
  fecha_inscripcion DATE,
  nota_final        DECIMAL(3,1),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
  FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);
INSERT INTO estudiantes (nombre, apellido, correo, edad, ciudad) VALUES
 ('Carlos','Perez','carlos@gmail.com',20,'Pasto'),
 ('Maria','Lopez','maria@gmail.com',22,'Cali'),
 ('Juan','Rodriguez','juan@gmail.com',19,'Pasto'),
 ('Laura','Martinez','laura@gmail.com',21,'Bogota'),
 ('Andres','Gomez','andres@gmail.com',23,'Popayan'),
 ('Sofia','Ramirez','sofia@gmail.com',20,'Cali'),
 ('Daniel','Torres','daniel@gmail.com',24,'Pasto');
INSERT INTO cursos (nombre_curso, duracion, docente) VALUES
 ('Bases de Datos',48,'Cristian Ordoñez'),
 ('Inteligencia Artificial',64,'Laura Benavides'),
 ('Programacion Python',48,'Carlos Muñoz'),
 ('Mineria de Datos',56,'Andres Garcia'),
 ('Desarrollo Web',40,'Maria Torres'),
 ('Redes de Computadores',48,'Pedro Ruiz');
INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion, nota_final) VALUES
 (1,1,'2025-03-01',4.5), (2,1,'2025-03-02',4.0), (3,2,'2025-03-03',3.8),
 (4,2,'2025-03-04',4.7), (5,3,'2025-03-05',3.5), (1,3,'2025-03-06',4.2),
 (2,4,'2025-03-07',4.8), (3,4,'2025-03-08',3.9), (6,5,'2025-03-09',4.6);`,
      extra: `
-- EXTRA: estudiante nueva con un curso en progreso (nota aún NULL)
INSERT INTO estudiantes (nombre, apellido, correo, edad, ciudad) VALUES
 ('Valentina','Rojas','valentina@gmail.com',18,'Cali');
INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion, nota_final) VALUES
 (8,5,'2025-03-10',NULL);
-- EXTRA: curso sin estudiantes y sin docente asignado
INSERT INTO cursos (nombre_curso, duracion, docente) VALUES ('Estadistica',32,NULL);`,
      notes: {
        orig: 'Daniel (id 7) no tiene inscripciones y "Redes de Computadores" (id 6) no tiene estudiantes.',
        ext: 'Además: Valentina (id 8) inscrita en Desarrollo Web con nota NULL y el curso "Estadistica" (id 7) sin estudiantes ni docente.'
      }
    },
    {
      id: 'bancodb',
      title: 'bancodb (Laboratorio final)',
      source: 'Laboratorio final de bases de datos: diagrama e INSERT del enunciado.',
      base: `
CREATE TABLE sucursales (
  id_sucursal SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  ciudad      VARCHAR(50),
  direccion   VARCHAR(150)
);
CREATE TABLE empleados (
  id_empleado SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  cargo       VARCHAR(50),
  salario     NUMERIC(12,2),
  id_sucursal INT,
  FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal)
);
CREATE TABLE clientes (
  id_cliente SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  apellido   VARCHAR(100) NOT NULL,
  telefono   VARCHAR(20),
  correo     VARCHAR(100),
  ciudad     VARCHAR(50)
);
CREATE TABLE tipos_cuenta (
  id_tipo     SERIAL PRIMARY KEY,
  descripcion VARCHAR(50) NOT NULL
);
CREATE TABLE cuentas (
  id_cuenta      SERIAL PRIMARY KEY,
  numero_cuenta  VARCHAR(20) NOT NULL UNIQUE,
  saldo          NUMERIC(14,2) DEFAULT 0,
  fecha_apertura DATE,
  estado         VARCHAR(20),
  id_cliente     INT,
  id_tipo        INT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_tipo) REFERENCES tipos_cuenta(id_tipo)
);
CREATE TABLE transacciones (
  id_transaccion SERIAL PRIMARY KEY,
  tipo      VARCHAR(30),
  monto     NUMERIC(14,2),
  fecha     DATE DEFAULT CURRENT_DATE,
  id_cuenta INT,
  FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
);
CREATE TABLE prestamos (
  id_prestamo  SERIAL PRIMARY KEY,
  monto        NUMERIC(14,2),
  tasa_interes NUMERIC(5,2),
  fecha_inicio DATE,
  cuotas       INT,
  id_cliente   INT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);
INSERT INTO sucursales(nombre, ciudad, direccion) VALUES
 ('Sucursal Centro','Bogotá','Cra 10 #20-30'),
 ('Sucursal Norte','Medellín','Calle 50 #40-20'),
 ('Sucursal Sur','Cali','Av 5 Norte #12-10');
INSERT INTO empleados(nombre, cargo, salario, id_sucursal) VALUES
 ('Carlos Pérez','Gerente',8500000,1), ('Ana Torres','Asesor',3500000,1),
 ('Luis Gómez','Cajero',2800000,2), ('Martha Díaz','Asesor',4200000,3);
INSERT INTO clientes(nombre, apellido, telefono, correo, ciudad) VALUES
 ('Juan','Rodríguez','3001112233','juan@gmail.com','Bogotá'),
 ('María','López','3004445566','maria@gmail.com','Cali'),
 ('Pedro','Martínez','3019998877','pedro@gmail.com','Medellín'),
 ('Laura','García','3025556677','laura@gmail.com','Pasto'),
 ('Camila','Fernández','3048887766','camila@gmail.com','Bogotá');
INSERT INTO tipos_cuenta(descripcion) VALUES ('Ahorros'), ('Corriente');
INSERT INTO cuentas(numero_cuenta, saldo, fecha_apertura, estado, id_cliente, id_tipo) VALUES
 ('20001',5000000,'2024-01-10','Activa',1,1), ('20002',1200000,'2024-02-11','Activa',2,2),
 ('20003',9500000,'2024-03-15','Activa',3,1), ('20004',850000,'2024-03-20','Bloqueada',4,2),
 ('20005',15000000,'2024-04-05','Activa',5,1);
INSERT INTO transacciones(tipo, monto, id_cuenta) VALUES
 ('Deposito',500000,1), ('Retiro',200000,1), ('Transferencia',1000000,2),
 ('Deposito',800000,3), ('Retiro',350000,4), ('Deposito',1500000,5);
INSERT INTO prestamos(monto, tasa_interes, fecha_inicio, cuotas, id_cliente) VALUES
 (10000000,12.5,'2024-01-15',24,1), (5000000,10.2,'2024-02-20',12,2),
 (15000000,15.0,'2024-03-10',36,3);`,
      extra: `
-- EXTRA: relación reflexiva "Empleado supervisa Empleado" (codSupervisor, como en clase)
ALTER TABLE empleados ADD COLUMN id_supervisor INT REFERENCES empleados(id_empleado);
UPDATE empleados SET id_supervisor = 1 WHERE id_empleado IN (2, 3, 4);
INSERT INTO empleados(nombre, cargo, salario, id_sucursal, id_supervisor) VALUES
 ('Jorge Ruiz','Cajero',2900000,3,4);
-- EXTRA: sucursal sin empleados, tipo de cuenta sin cuentas, cliente sin cuenta ni préstamo
INSERT INTO sucursales(nombre, ciudad, direccion) VALUES ('Sucursal Pasto','Pasto','Calle 18 #25-40');
INSERT INTO tipos_cuenta(descripcion) VALUES ('CDT');
INSERT INTO clientes(nombre, apellido, telefono, correo, ciudad) VALUES
 ('Andrés','Castro','3051234567','andres@gmail.com','Pasto');
-- EXTRA: segunda cuenta de María, sin transacciones
INSERT INTO cuentas(numero_cuenta, saldo, fecha_apertura, estado, id_cliente, id_tipo) VALUES
 ('20006',300000,'2024-05-02','Activa',2,1);`,
      notes: {
        orig: 'Laura y Camila no tienen préstamos. Todas las sucursales tienen empleados y todas las cuentas tienen transacciones.',
        ext: 'Además: columna empleados.id_supervisor (Carlos supervisa a Ana, Luis y Martha; Martha supervisa a Jorge), "Sucursal Pasto" sin empleados, tipo "CDT" sin cuentas, cliente Andrés sin cuenta ni préstamo y la cuenta 20006 sin transacciones.'
      }
    },
    {
      id: 'biblioteca',
      title: 'biblioteca (Laboratorio DDL/DML)',
      source: 'Laboratorio_bases_datos_ddl_dml_estudiantes: CREATE, INSERT, ALTER y UPDATE del laboratorio.',
      base: `
CREATE TABLE autores (
  id_autor     SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  nacionalidad VARCHAR(50)
);
CREATE TABLE libros (
  id_libro         SERIAL PRIMARY KEY,
  titulo           VARCHAR(150) NOT NULL,
  anio_publicacion INT,
  id_autor         INT,
  FOREIGN KEY (id_autor) REFERENCES autores(id_autor)
);
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  correo     VARCHAR(100)
);
CREATE TABLE prestamos (
  id_prestamo      SERIAL PRIMARY KEY,
  id_libro         INT,
  id_usuario       INT,
  fecha_prestamo   DATE,
  fecha_devolucion DATE,
  FOREIGN KEY (id_libro) REFERENCES libros(id_libro),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
INSERT INTO autores (nombre, nacionalidad) VALUES
 ('Gabriel García Márquez','Colombiano'), ('Julio Cortázar','Argentino'),
 ('J.K. Rowling','Británica'), ('Mario Vargas Llosa','Peruano');
INSERT INTO libros (titulo, anio_publicacion, id_autor) VALUES
 ('Cien años de soledad',1967,1), ('Rayuela',1963,2),
 ('Harry Potter y la piedra filosofal',1997,3), ('La ciudad y los perros',1963,4),
 ('El amor en los tiempos del cólera',1985,1);
INSERT INTO usuarios (nombre, correo) VALUES
 ('Carlos Pérez','carlos@gmail.com'), ('Ana Torres','ana@gmail.com'), ('Luis Gómez','luis@gmail.com');
INSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_devolucion) VALUES
 (1,1,'2024-01-10','2024-01-20'), (2,2,'2024-02-01',NULL),
 (3,1,'2024-03-05','2024-03-15'), (5,3,'2024-03-10',NULL);
-- Parte 2 del laboratorio: ALTER y UPDATE
ALTER TABLE libros ADD genero VARCHAR(50);
ALTER TABLE usuarios ADD telefono VARCHAR(20);
ALTER TABLE prestamos ADD estado VARCHAR(20);
UPDATE libros SET genero = 'Novela'   WHERE id_libro = 1;
UPDATE libros SET genero = 'Fantasía' WHERE id_libro = 3;
UPDATE usuarios SET telefono = '3001234567' WHERE id_usuario = 1;
UPDATE prestamos SET estado = 'Devuelto' WHERE fecha_devolucion IS NOT NULL;
UPDATE prestamos SET estado = 'Activo'   WHERE fecha_devolucion IS NULL;`,
      extra: `
-- EXTRA: autora sin libros, libro sin autor registrado y usuaria sin préstamos
INSERT INTO autores (nombre, nacionalidad) VALUES ('Isabel Allende','Chilena');
INSERT INTO libros (titulo, anio_publicacion, id_autor, genero) VALUES ('Antología de cuentos',2001,NULL,'Cuento');
INSERT INTO usuarios (nombre, correo) VALUES ('María Ruiz','maria@gmail.com');`,
      notes: {
        orig: 'Estado final del laboratorio (incluye ALTER/UPDATE). "La ciudad y los perros" nunca se ha prestado.',
        ext: 'Además: Isabel Allende sin libros, "Antología de cuentos" sin autor (id_autor NULL) y María Ruiz sin préstamos.'
      }
    }
  ];

  DBS.push(
    {
      id: 'tienda',
      title: 'tienda (Fundamentos de SQL y normalización)',
      source: 'CLASE_6_SQL_NORMALIZACION: CREATE TABLE de CLIENTE, PRODUCTO, PEDIDO y DETALLE_PEDIDO; los pedidos son los de la tabla VENTAS del ejemplo de normalización.',
      base: `
CREATE TABLE CLIENTE (
  id_cliente INTEGER PRIMARY KEY,
  nombre     VARCHAR(80)  NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE PRODUCTO (
  id_producto INTEGER PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL,
  precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0)
);
CREATE TABLE PEDIDO (
  id_pedido  INTEGER PRIMARY KEY,
  fecha      DATE NOT NULL,
  id_cliente INTEGER NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES CLIENTE (id_cliente)
);
CREATE TABLE DETALLE_PEDIDO (
  id_pedido   INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (id_pedido, id_producto),
  FOREIGN KEY (id_pedido)   REFERENCES PEDIDO (id_pedido),
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)
);
INSERT INTO CLIENTE (id_cliente, nombre, email) VALUES
 (1, 'Ana Torres', 'ana@mail.com'), (2, 'Luis Pérez', 'luis@mail.com');
INSERT INTO PRODUCTO (id_producto, nombre, precio) VALUES
 (101, 'Teclado', 85000.00), (102, 'Mouse', 35000.00), (103, 'Monitor', 450000.00);
INSERT INTO PEDIDO (id_pedido, fecha, id_cliente) VALUES
 (1001, '2026-03-10', 1), (1002, '2026-03-12', 1), (1003, '2026-03-15', 2);
INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad) VALUES
 (1001, 101, 1), (1001, 102, 2), (1002, 103, 1), (1003, 102, 1);`,
      extra: `
-- EXTRA: clienta sin pedidos y producto que nunca se ha vendido
INSERT INTO CLIENTE (id_cliente, nombre, email) VALUES (3, 'Marta Ruiz', 'marta@mail.com');
INSERT INTO PRODUCTO (id_producto, nombre, precio) VALUES (104, 'Audífonos', 120000.00);`,
      notes: {
        orig: 'Es el esquema en 3FN que resulta de normalizar la tabla VENTAS de la clase. Ana tiene 2 pedidos y Luis 1.',
        ext: 'Además: Marta Ruiz (cliente 3) sin pedidos y el producto 104 "Audífonos" que nunca se ha vendido.'
      }
    },
    {
      id: 'polideportivo',
      title: 'polideportivo (Laboratorio 2)',
      source: 'Laboratorio bases de datos 2: tablas de las fases 1 y 2 (con bono_mensual, la restricción de edad y sin la tabla eventos) y el registro inicial de la fase 3.',
      base: `
CREATE TABLE socios (
  id_socio       SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(100) UNIQUE,
  edad           INT,
  tipo_membresia VARCHAR(10) CHECK (tipo_membresia IN ('Básica','Premium','VIP'))
);
CREATE TABLE entrenadores (
  id_entrenador SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  especialidad  VARCHAR(50),
  salario_hora  NUMERIC(8,2),
  activo        BOOLEAN DEFAULT TRUE
);
CREATE TABLE deportes (
  id_deporte     SERIAL PRIMARY KEY,
  nombre_deporte VARCHAR(50) NOT NULL,
  es_olimpico    BOOLEAN,
  max_jugadores  INT
);
CREATE TABLE inventario (
  id_articulo SERIAL PRIMARY KEY,
  articulo    VARCHAR(100) NOT NULL,
  cantidad    INT,
  estado      VARCHAR(10) CHECK (estado IN ('Nuevo','Usado','Dañado'))
);
ALTER TABLE entrenadores ADD COLUMN bono_mensual NUMERIC(8,2);
ALTER TABLE socios ADD CONSTRAINT ck_socios_edad CHECK (edad >= 5);
INSERT INTO socios (nombre, email, edad, tipo_membresia) VALUES
 ('Carlos Ruiz','carlos@mail.com',25,'Premium'), ('Elena Sanz','elena@mail.com',17,'Básica'),
 ('Marcos Peña','marcos@mail.com',40,'VIP'), ('Ana López','ana@mail.com',8,'Premium');
INSERT INTO entrenadores (nombre, especialidad, salario_hora, activo) VALUES
 ('Roberto Gómez','Natación',25.00,TRUE), ('Lucía Fernández','Tenis',30.00,TRUE),
 ('Juan Kross','Fútbol',20.00,FALSE);
INSERT INTO deportes (nombre_deporte, es_olimpico, max_jugadores) VALUES
 ('Baloncesto',TRUE,12), ('Pádel',FALSE,4), ('Fútbol 11',TRUE,22), ('Yoga',FALSE,20);
INSERT INTO inventario (articulo, cantidad, estado) VALUES
 ('Balones Fútbol',50,'Usado'), ('Raquetas Tenis',15,'Nuevo'),
 ('Pesas 5kg',20,'Nuevo'), ('Redes Voleibol',5,'Dañado');`,
      extra: `
-- EXTRA: socio sin correo ni membresía y entrenadora sin especialidad (para practicar IS NULL)
INSERT INTO socios (nombre, email, edad, tipo_membresia) VALUES ('Sofía Mora', NULL, 30, NULL);
INSERT INTO entrenadores (nombre, especialidad, salario_hora, activo, bono_mensual) VALUES ('Laura Mejía', NULL, 28.00, TRUE, 150.00);`,
      notes: {
        orig: 'Estado del laboratorio antes de las actualizaciones de la fase 3 (salario de Natación, reparaciones, borrados).',
        ext: 'Además: Sofía Mora sin correo ni membresía (NULL) y Laura Mejía sin especialidad y con bono.'
      }
    }
  );

  const VARIANTS = { orig: 'Datos originales del profesor', ext: 'Datos extendidos' };
  const byId = {};
  DBS.forEach((d) => { byId[d.id] = d; });
  // Nombre del esquema de PostgreSQL. prefix 'g_' = copia intacta usada solo para calificar.
  const schema = (db, variant, grading) => (grading ? 'g_' : '') + db + '_' + variant;
  const seedSQL = (db, variant) => byId[db].base + (variant === 'ext' ? '\n' + byId[db].extra : '');
  return { DBS, VARIANTS, byId, schema, seedSQL };
});
