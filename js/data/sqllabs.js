window.SQLLABS = [
 {
  "id": "biblioteca",
  "title": "Laboratorio 1 · Sistema de biblioteca",
  "origin": "Laboratorio DDL/DML del curso",
  "intro": "Gestión de libros, autores, usuarios y préstamos usando la consola psql de PostgreSQL. Resuelve cada paso por tu cuenta antes de abrir la solución.",
  "steps": [
   {
    "part": "Parte 1 · Crear la base de datos",
    "t": "Crear y conectarse a la base de datos",
    "kind": "psql",
    "sql": "CREATE DATABASE biblioteca;\n\\c biblioteca"
   },
   {
    "part": "Parte 2 · Diseño (DDL)",
    "t": "Crear las 4 tablas (autores, libros, usuarios, prestamos)",
    "kind": "ddl",
    "sql": "CREATE TABLE autores (\n    id_autor     SERIAL PRIMARY KEY,\n    nombre       VARCHAR(100) NOT NULL,\n    nacionalidad VARCHAR(50)\n);\n\nCREATE TABLE libros (\n    id_libro         SERIAL PRIMARY KEY,\n    titulo           VARCHAR(150) NOT NULL,\n    anio_publicacion INT,\n    id_autor         INT,\n    FOREIGN KEY (id_autor) REFERENCES autores(id_autor)\n);\n\nCREATE TABLE usuarios (\n    id_usuario SERIAL PRIMARY KEY,\n    nombre     VARCHAR(100) NOT NULL,\n    correo     VARCHAR(100)\n);\n\nCREATE TABLE prestamos (\n    id_prestamo      SERIAL PRIMARY KEY,\n    id_libro         INT,\n    id_usuario       INT,\n    fecha_prestamo   DATE,\n    fecha_devolucion DATE,\n    FOREIGN KEY (id_libro)   REFERENCES libros(id_libro),\n    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)\n);",
    "note": "Orden: primero las tablas referenciadas (autores, usuarios), luego las que tienen FOREIGN KEY (libros, prestamos)."
   },
   {
    "part": "Parte 3 · Inserción de datos (DML)",
    "t": "Insertar autores, libros, usuarios y préstamos",
    "kind": "dml",
    "sql": "INSERT INTO autores (nombre, nacionalidad) VALUES\n('Gabriel García Márquez', 'Colombiano'),\n('Julio Cortázar', 'Argentino'),\n('J.K. Rowling', 'Británica'),\n('Mario Vargas Llosa', 'Peruano');\n\nINSERT INTO libros (titulo, anio_publicacion, id_autor) VALUES\n('Cien años de soledad', 1967, 1),\n('Rayuela', 1963, 2),\n('Harry Potter y la piedra filosofal', 1997, 3),\n('La ciudad y los perros', 1963, 4),\n('El amor en los tiempos del cólera', 1985, 1);\n\nINSERT INTO usuarios (nombre, correo) VALUES\n('Carlos Pérez', 'carlos@gmail.com'),\n('Ana Torres', 'ana@gmail.com'),\n('Luis Gómez', 'luis@gmail.com');\n\nINSERT INTO prestamos (id_libro, id_usuario, fecha_prestamo, fecha_devolucion) VALUES\n(1, 1, '2024-01-10', '2024-01-20'),\n(2, 2, '2024-02-01', NULL),\n(3, 1, '2024-03-05', '2024-03-15'),\n(5, 3, '2024-03-10', NULL);",
    "note": "Se insertan primero las filas referenciadas (autores, usuarios, libros) y al final los préstamos. NULL en fecha_devolucion = préstamo activo."
   },
   {
    "part": "Parte 4 · Consultas básicas",
    "t": "Listar libros",
    "kind": "query",
    "sql": "SELECT * FROM libros;",
    "cols": [
     "id_libro",
     "titulo",
     "anio_publicacion",
     "id_autor"
    ],
    "rows": [
     [
      "1",
      "Cien años de soledad",
      "1967",
      "1"
     ],
     [
      "2",
      "Rayuela",
      "1963",
      "2"
     ],
     [
      "3",
      "Harry Potter y la piedra filosofal",
      "1997",
      "3"
     ],
     [
      "4",
      "La ciudad y los perros",
      "1963",
      "4"
     ],
     [
      "5",
      "El amor en los tiempos del cólera",
      "1985",
      "1"
     ]
    ]
   },
   {
    "part": "Parte 4 · Consultas básicas",
    "t": "Listar autores",
    "kind": "query",
    "sql": "SELECT * FROM autores;",
    "cols": [
     "id_autor",
     "nombre",
     "nacionalidad"
    ],
    "rows": [
     [
      "1",
      "Gabriel García Márquez",
      "Colombiano"
     ],
     [
      "2",
      "Julio Cortázar",
      "Argentino"
     ],
     [
      "3",
      "J.K. Rowling",
      "Británica"
     ],
     [
      "4",
      "Mario Vargas Llosa",
      "Peruano"
     ]
    ]
   },
   {
    "part": "Parte 4 · Consultas básicas",
    "t": "Libros publicados después de 1980",
    "kind": "query",
    "sql": "SELECT titulo, anio_publicacion\nFROM libros\nWHERE anio_publicacion > 1980;",
    "cols": [
     "titulo",
     "anio_publicacion"
    ],
    "rows": [
     [
      "Harry Potter y la piedra filosofal",
      "1997"
     ],
     [
      "El amor en los tiempos del cólera",
      "1985"
     ]
    ]
   },
   {
    "part": "Parte 4 · Consultas básicas",
    "t": "Usuarios con correo gmail",
    "kind": "query",
    "sql": "SELECT * FROM usuarios\nWHERE correo LIKE '%@gmail.com';",
    "note": "LIKE con % como comodín: cualquier texto antes de @gmail.com.",
    "cols": [
     "id_usuario",
     "nombre",
     "correo"
    ],
    "rows": [
     [
      "1",
      "Carlos Pérez",
      "carlos@gmail.com"
     ],
     [
      "2",
      "Ana Torres",
      "ana@gmail.com"
     ],
     [
      "3",
      "Luis Gómez",
      "luis@gmail.com"
     ]
    ]
   },
   {
    "part": "Parte 4 · Consultas básicas",
    "t": "Préstamos activos (sin devolución)",
    "kind": "query",
    "sql": "SELECT * FROM prestamos\nWHERE fecha_devolucion IS NULL;",
    "note": "Para NULL se usa IS NULL, nunca \"= NULL\".",
    "cols": [
     "id_prestamo",
     "id_libro",
     "id_usuario",
     "fecha_prestamo",
     "fecha_devolucion"
    ],
    "rows": [
     [
      "2",
      "2",
      "2",
      "2024-02-01",
      "NULL"
     ],
     [
      "4",
      "5",
      "3",
      "2024-03-10",
      "NULL"
     ]
    ]
   },
   {
    "part": "Parte 5 · Consultas con relaciones",
    "t": "Autor del libro 'Cien años de soledad'",
    "kind": "query",
    "sql": "SELECT a.nombre\nFROM libros l\nJOIN autores a ON a.id_autor = l.id_autor\nWHERE l.titulo = 'Cien años de soledad';",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Gabriel García Márquez"
     ]
    ]
   },
   {
    "part": "Parte 5 · Consultas con relaciones",
    "t": "Libros del autor 'Gabriel García Márquez'",
    "kind": "query",
    "sql": "SELECT l.titulo\nFROM libros l\nJOIN autores a ON a.id_autor = l.id_autor\nWHERE a.nombre = 'Gabriel García Márquez';",
    "cols": [
     "titulo"
    ],
    "rows": [
     [
      "Cien años de soledad"
     ],
     [
      "El amor en los tiempos del cólera"
     ]
    ]
   },
   {
    "part": "Parte 5 · Consultas con relaciones",
    "t": "Usuarios que tienen préstamos",
    "kind": "query",
    "sql": "SELECT DISTINCT u.nombre\nFROM usuarios u\nJOIN prestamos p ON p.id_usuario = u.id_usuario;",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Carlos Pérez"
     ],
     [
      "Luis Gómez"
     ],
     [
      "Ana Torres"
     ]
    ]
   },
   {
    "part": "Parte 6 · Consultas avanzadas",
    "t": "Libros prestados (alguna vez)",
    "kind": "query",
    "sql": "SELECT DISTINCT l.titulo\nFROM libros l\nJOIN prestamos p ON p.id_libro = l.id_libro;",
    "cols": [
     "titulo"
    ],
    "rows": [
     [
      "El amor en los tiempos del cólera"
     ],
     [
      "Cien años de soledad"
     ],
     [
      "Harry Potter y la piedra filosofal"
     ],
     [
      "Rayuela"
     ]
    ]
   },
   {
    "part": "Parte 6 · Consultas avanzadas",
    "t": "Libros que nunca se han prestado",
    "kind": "query",
    "sql": "SELECT l.titulo\nFROM libros l\nLEFT JOIN prestamos p ON p.id_libro = l.id_libro\nWHERE p.id_prestamo IS NULL;",
    "note": "LEFT JOIN conserva todos los libros; los que no tienen préstamo traen NULL en las columnas de prestamos.",
    "cols": [
     "titulo"
    ],
    "rows": [
     [
      "La ciudad y los perros"
     ]
    ]
   },
   {
    "part": "Parte 6 · Consultas avanzadas",
    "t": "Usuarios con préstamos activos",
    "kind": "query",
    "sql": "SELECT DISTINCT u.nombre\nFROM usuarios u\nJOIN prestamos p ON p.id_usuario = u.id_usuario\nWHERE p.fecha_devolucion IS NULL;",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Ana Torres"
     ],
     [
      "Luis Gómez"
     ]
    ]
   },
   {
    "part": "Parte 6 · Consultas avanzadas",
    "t": "Autores con libros actualmente en préstamo",
    "kind": "query",
    "sql": "SELECT DISTINCT a.nombre\nFROM autores a\nJOIN libros l    ON l.id_autor = a.id_autor\nJOIN prestamos p ON p.id_libro = l.id_libro\nWHERE p.fecha_devolucion IS NULL;",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Gabriel García Márquez"
     ],
     [
      "Julio Cortázar"
     ]
    ]
   },
   {
    "part": "Parte 6 · Consultas avanzadas",
    "t": "Libro más antiguo",
    "kind": "query",
    "sql": "SELECT titulo, anio_publicacion\nFROM libros\nWHERE anio_publicacion = (SELECT MIN(anio_publicacion) FROM libros);",
    "note": "Con la subconsulta aparecen todos los empatados (dos libros de 1963). Con ORDER BY ... LIMIT 1 saldría solo uno.",
    "cols": [
     "titulo",
     "anio_publicacion"
    ],
    "rows": [
     [
      "Rayuela",
      "1963"
     ],
     [
      "La ciudad y los perros",
      "1963"
     ]
    ]
   },
   {
    "part": "Parte 7 · ALTER TABLE",
    "t": "Agregar género a libros, teléfono a usuarios y estado a préstamos",
    "kind": "ddl",
    "sql": "ALTER TABLE libros    ADD genero   VARCHAR(50);\nALTER TABLE usuarios  ADD telefono VARCHAR(20);\nALTER TABLE prestamos ADD estado   VARCHAR(20);"
   },
   {
    "part": "Parte 8 · UPDATE",
    "t": "Actualizar género, teléfono y estado",
    "kind": "dml",
    "sql": "UPDATE libros SET genero = 'Novela'   WHERE id_libro = 1;\nUPDATE libros SET genero = 'Fantasía' WHERE id_libro = 3;\n\nUPDATE usuarios SET telefono = '3001234567' WHERE id_usuario = 1;\n\nUPDATE prestamos SET estado = 'Devuelto' WHERE fecha_devolucion IS NOT NULL;\nUPDATE prestamos SET estado = 'Activo'   WHERE fecha_devolucion IS NULL;",
    "note": "Un UPDATE sin WHERE modifica TODAS las filas: siempre revisa la condición."
   },
   {
    "part": "Parte 9 · Nuevas consultas",
    "t": "Libros del género Novela",
    "kind": "query",
    "sql": "SELECT titulo FROM libros\nWHERE genero = 'Novela';",
    "cols": [
     "titulo"
    ],
    "rows": [
     [
      "Cien años de soledad"
     ]
    ]
   },
   {
    "part": "Parte 9 · Nuevas consultas",
    "t": "Préstamos activos (usando estado)",
    "kind": "query",
    "sql": "SELECT * FROM prestamos\nWHERE estado = 'Activo';",
    "cols": [
     "id_prestamo",
     "id_libro",
     "id_usuario",
     "fecha_prestamo",
     "fecha_devolucion",
     "estado"
    ],
    "rows": [
     [
      "2",
      "2",
      "2",
      "2024-02-01",
      "NULL",
      "Activo"
     ],
     [
      "4",
      "5",
      "3",
      "2024-03-10",
      "NULL",
      "Activo"
     ]
    ]
   },
   {
    "part": "Parte 9 · Nuevas consultas",
    "t": "Préstamos entre febrero y marzo de 2024",
    "kind": "query",
    "sql": "SELECT * FROM prestamos\nWHERE fecha_prestamo BETWEEN '2024-02-01' AND '2024-03-31';",
    "cols": [
     "id_prestamo",
     "id_libro",
     "id_usuario",
     "fecha_prestamo",
     "fecha_devolucion",
     "estado"
    ],
    "rows": [
     [
      "3",
      "3",
      "1",
      "2024-03-05",
      "2024-03-15",
      "Devuelto"
     ],
     [
      "2",
      "2",
      "2",
      "2024-02-01",
      "NULL",
      "Activo"
     ],
     [
      "4",
      "5",
      "3",
      "2024-03-10",
      "NULL",
      "Activo"
     ]
    ]
   },
   {
    "part": "Parte 9 · Nuevas consultas",
    "t": "Conteo de préstamos por estado",
    "kind": "query",
    "sql": "SELECT estado, COUNT(*) AS total\nFROM prestamos\nGROUP BY estado;",
    "cols": [
     "estado",
     "total"
    ],
    "rows": [
     [
      "Devuelto",
      "2"
     ],
     [
      "Activo",
      "2"
     ]
    ]
   },
   {
    "part": "Parte 10 · Análisis final",
    "t": "Usuario con más préstamos",
    "kind": "query",
    "sql": "SELECT u.nombre, COUNT(*) AS total_prestamos\nFROM usuarios u\nJOIN prestamos p ON p.id_usuario = u.id_usuario\nGROUP BY u.id_usuario, u.nombre\nORDER BY total_prestamos DESC\nLIMIT 1;",
    "cols": [
     "nombre",
     "total_prestamos"
    ],
    "rows": [
     [
      "Carlos Pérez",
      "2"
     ]
    ]
   },
   {
    "part": "Parte 10 · Análisis final",
    "t": "Autores sin libros prestados",
    "kind": "query",
    "sql": "SELECT a.nombre\nFROM autores a\nWHERE a.id_autor NOT IN (\n    SELECT l.id_autor\n    FROM libros l\n    JOIN prestamos p ON p.id_libro = l.id_libro\n);",
    "note": "Alternativa: LEFT JOIN encadenados con WHERE p.id_prestamo IS NULL, agrupando por autor.",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Mario Vargas Llosa"
     ]
    ]
   },
   {
    "part": "Parte 10 · Análisis final",
    "t": "Total de préstamos",
    "kind": "query",
    "sql": "SELECT COUNT(*) AS total_prestamos FROM prestamos;",
    "cols": [
     "total_prestamos"
    ],
    "rows": [
     [
      "4"
     ]
    ]
   }
  ]
 },
 {
  "id": "polideportivo",
  "title": "Laboratorio 2 · Polideportivo",
  "origin": "Laboratorio “bases de datos 2” del curso",
  "intro": "La administración del polideportivo digitaliza socios, entrenadores, deportes e inventario. Fases: construir, ajustar, cargar/gestionar datos y sacar reportes.",
  "steps": [
   {
    "part": "Fase 1 · Infraestructura",
    "t": "Crear las 5 tablas",
    "kind": "ddl",
    "sql": "CREATE TABLE socios (\n    id_socio       SERIAL PRIMARY KEY,\n    nombre         VARCHAR(100) NOT NULL,\n    email          VARCHAR(100) UNIQUE,\n    edad           INT,\n    tipo_membresia VARCHAR(10) CHECK (tipo_membresia IN ('Básica','Premium','VIP'))\n);\n\nCREATE TABLE entrenadores (\n    id_entrenador SERIAL PRIMARY KEY,\n    nombre        VARCHAR(100) NOT NULL,\n    especialidad  VARCHAR(50),\n    salario_hora  NUMERIC(8,2),\n    activo        BOOLEAN DEFAULT TRUE\n);\n\nCREATE TABLE deportes (\n    id_deporte     SERIAL PRIMARY KEY,\n    nombre_deporte VARCHAR(50) NOT NULL,\n    es_olimpico    BOOLEAN,\n    max_jugadores  INT\n);\n\nCREATE TABLE inventario (\n    id_articulo SERIAL PRIMARY KEY,\n    articulo    VARCHAR(100) NOT NULL,\n    cantidad    INT,\n    estado      VARCHAR(10) CHECK (estado IN ('Nuevo','Usado','Dañado'))\n);\n\nCREATE TABLE eventos (\n    id_evento    SERIAL PRIMARY KEY,\n    nombre       VARCHAR(100) NOT NULL,\n    fecha_evento DATE,\n    presupuesto  NUMERIC(12,2)\n);",
    "note": "Las 5 tablas no tienen relaciones declaradas en el enunciado: el diagrama son 5 tablas independientes. En el examen podrían pedirte proponer relaciones (p. ej. socio–deporte N:M)."
   },
   {
    "part": "Fase 2 · Ajustes de ingeniería",
    "t": "Bono mensual, restricción de edad y eliminar eventos",
    "kind": "ddl",
    "sql": "-- Gestión de nómina\nALTER TABLE entrenadores ADD COLUMN bono_mensual NUMERIC(8,2);\n\n-- Regla de seguridad: no socios menores de 5 años\nALTER TABLE socios ADD CONSTRAINT ck_socios_edad CHECK (edad >= 5);\n\n-- Optimización: el módulo de eventos se pospone\nDROP TABLE eventos;",
    "note": "ALTER TABLE modifica la estructura; DROP TABLE elimina la tabla completa (estructura y datos)."
   },
   {
    "part": "Fase 3 · Carga de datos",
    "t": "Registro inicial (3–4 filas por tabla)",
    "kind": "dml",
    "sql": "INSERT INTO socios (nombre, email, edad, tipo_membresia) VALUES\n('Carlos Ruiz', 'carlos@mail.com', 25, 'Premium'),\n('Elena Sanz',  'elena@mail.com',  17, 'Básica'),\n('Marcos Peña', 'marcos@mail.com', 40, 'VIP'),\n('Ana López',   'ana@mail.com',     8, 'Premium');\n\nINSERT INTO entrenadores (nombre, especialidad, salario_hora, activo) VALUES\n('Roberto Gómez',   'Natación', 25.00, TRUE),\n('Lucía Fernández', 'Tenis',    30.00, TRUE),\n('Juan Kross',      'Fútbol',   20.00, FALSE);\n\nINSERT INTO deportes (nombre_deporte, es_olimpico, max_jugadores) VALUES\n('Baloncesto', TRUE,  12),\n('Pádel',      FALSE,  4),\n('Fútbol 11',  TRUE,  22),\n('Yoga',       FALSE, 20);\n\nINSERT INTO inventario (articulo, cantidad, estado) VALUES\n('Balones Fútbol', 50, 'Usado'),\n('Raquetas Tenis', 15, 'Nuevo'),\n('Pesas 5kg',      20, 'Nuevo'),\n('Redes Voleibol',  5, 'Dañado');"
   },
   {
    "part": "Fase 3 · Mantenimiento",
    "t": "Ajuste salarial de Natación",
    "kind": "dml",
    "sql": "UPDATE entrenadores\nSET salario_hora = 35.00\nWHERE especialidad = 'Natación';"
   },
   {
    "part": "Fase 3 · Mantenimiento",
    "t": "Reparaciones: 'Dañado' pasa a 'Nuevo'",
    "kind": "dml",
    "sql": "UPDATE inventario\nSET estado = 'Nuevo'\nWHERE estado = 'Dañado';"
   },
   {
    "part": "Fase 3 · Mantenimiento",
    "t": "Socios menores de 10 años → membresía 'Básica'",
    "kind": "dml",
    "sql": "UPDATE socios\nSET tipo_membresia = 'Básica'\nWHERE edad < 10;"
   },
   {
    "part": "Fase 3 · Depuración",
    "t": "Eliminar entrenadores inactivos",
    "kind": "dml",
    "sql": "DELETE FROM entrenadores\nWHERE activo = FALSE;"
   },
   {
    "part": "Fase 3 · Depuración",
    "t": "Eliminar deportes con más de 15 jugadores",
    "kind": "dml",
    "sql": "DELETE FROM deportes\nWHERE max_jugadores > 15;",
    "note": "DELETE sin WHERE borraría todas las filas (la tabla quedaría vacía pero existiría)."
   },
   {
    "part": "Fase 4 · Reportes",
    "t": "Socios Premium o VIP mayores de 20 años",
    "kind": "query",
    "sql": "SELECT * FROM socios\nWHERE tipo_membresia IN ('Premium','VIP')\n  AND edad > 20;",
    "note": "Equivalente: (tipo_membresia = 'Premium' OR tipo_membresia = 'VIP') AND edad > 20 — los paréntesis importan porque AND se evalúa antes que OR.",
    "cols": [
     "id_socio",
     "nombre",
     "email",
     "edad",
     "tipo_membresia"
    ],
    "rows": [
     [
      "1",
      "Carlos Ruiz",
      "carlos@mail.com",
      "25",
      "Premium"
     ],
     [
      "3",
      "Marcos Peña",
      "marcos@mail.com",
      "40",
      "VIP"
     ]
    ]
   },
   {
    "part": "Fase 4 · Reportes",
    "t": "Deportes no olímpicos",
    "kind": "query",
    "sql": "SELECT nombre_deporte\nFROM deportes\nWHERE es_olimpico = FALSE;",
    "cols": [
     "nombre_deporte"
    ],
    "rows": [
     [
      "Pádel"
     ]
    ]
   },
   {
    "part": "Fase 4 · Reportes",
    "t": "Artículos 'Nuevo' con más de 10 unidades",
    "kind": "query",
    "sql": "SELECT * FROM inventario\nWHERE estado = 'Nuevo'\n  AND cantidad > 10;",
    "cols": [
     "id_articulo",
     "articulo",
     "cantidad",
     "estado"
    ],
    "rows": [
     [
      "2",
      "Raquetas Tenis",
      "15",
      "Nuevo"
     ],
     [
      "3",
      "Pesas 5kg",
      "20",
      "Nuevo"
     ]
    ]
   },
   {
    "part": "Fase 4 · Reportes",
    "t": "Entrenadores cuyo nombre empieza con 'L'",
    "kind": "query",
    "sql": "SELECT * FROM entrenadores\nWHERE nombre LIKE 'L%';",
    "cols": [
     "id_entrenador",
     "nombre",
     "especialidad",
     "salario_hora",
     "activo",
     "bono_mensual"
    ],
    "rows": [
     [
      "2",
      "Lucía Fernández",
      "Tenis",
      "30.00",
      "true",
      "NULL"
     ]
    ]
   }
  ]
 },
 {
  "id": "tienda",
  "title": "Laboratorio 3 · Tienda: CREATE, INSERT y consultas",
  "origin": "Clase 6 (SQL y normalización)",
  "intro": "Esquema en 3FN de la clase: CLIENTE, PRODUCTO, PEDIDO y DETALLE_PEDIDO. Incluye las consultas de la presentación (WHERE, ORDER BY, agregaciones, GROUP BY/HAVING) y varias con JOIN para practicar.",
  "steps": [
   {
    "part": "Esquema",
    "t": "Crear las tablas en orden (referenciadas primero)",
    "kind": "ddl",
    "sql": "CREATE TABLE CLIENTE (\n    id_cliente INTEGER PRIMARY KEY,\n    nombre     VARCHAR(80)  NOT NULL,\n    email      VARCHAR(100) NOT NULL UNIQUE\n);\n\nCREATE TABLE PRODUCTO (\n    id_producto INTEGER PRIMARY KEY,\n    nombre      VARCHAR(80)   NOT NULL,\n    precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0)\n);\n\nCREATE TABLE PEDIDO (\n    id_pedido  INTEGER PRIMARY KEY,\n    fecha      DATE    NOT NULL,\n    id_cliente INTEGER NOT NULL,\n    FOREIGN KEY (id_cliente) REFERENCES CLIENTE (id_cliente)\n);\n\nCREATE TABLE DETALLE_PEDIDO (\n    id_pedido   INTEGER NOT NULL,\n    id_producto INTEGER NOT NULL,\n    cantidad    INTEGER NOT NULL CHECK (cantidad > 0),\n    PRIMARY KEY (id_pedido, id_producto),\n    FOREIGN KEY (id_pedido)   REFERENCES PEDIDO (id_pedido),\n    FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)\n);",
    "note": "DETALLE_PEDIDO tiene clave compuesta: cada producto aparece una sola vez por pedido."
   },
   {
    "part": "Datos",
    "t": "Insertar datos de prueba",
    "kind": "dml",
    "sql": "INSERT INTO CLIENTE (id_cliente, nombre, email) VALUES\n(1, 'Ana Torres', 'ana@mail.com'),\n(2, 'Luis Pérez', 'luis@mail.com'),\n(3, 'Marta Ruiz', 'marta@mail.com');\n\nINSERT INTO PRODUCTO (id_producto, nombre, precio) VALUES\n(101, 'Teclado', 85000.00),\n(102, 'Mouse',   35000.00),\n(103, 'Monitor', 450000.00);\n\nINSERT INTO PEDIDO (id_pedido, fecha, id_cliente) VALUES\n(1001, '2026-03-10', 1),\n(1002, '2026-03-12', 1),\n(1003, '2026-03-15', 2);\n\nINSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad) VALUES\n(1001, 101, 1),\n(1001, 102, 2),\n(1002, 103, 1),\n(1003, 102, 1);"
   },
   {
    "part": "Consultas de la clase",
    "t": "SELECT de columnas",
    "kind": "query",
    "sql": "SELECT id_producto, nombre, precio FROM PRODUCTO;",
    "cols": [
     "id_producto",
     "nombre",
     "precio"
    ],
    "rows": [
     [
      "101",
      "Teclado",
      "85000.00"
     ],
     [
      "102",
      "Mouse",
      "35000.00"
     ],
     [
      "103",
      "Monitor",
      "450000.00"
     ]
    ]
   },
   {
    "part": "Consultas de la clase",
    "t": "WHERE: productos con precio mayor a 40000",
    "kind": "query",
    "sql": "SELECT nombre, precio\nFROM PRODUCTO\nWHERE precio > 40000;",
    "cols": [
     "nombre",
     "precio"
    ],
    "rows": [
     [
      "Teclado",
      "85000.00"
     ],
     [
      "Monitor",
      "450000.00"
     ]
    ]
   },
   {
    "part": "Consultas de la clase",
    "t": "ORDER BY: del más caro al más barato",
    "kind": "query",
    "sql": "SELECT nombre, precio\nFROM PRODUCTO\nORDER BY precio DESC;",
    "cols": [
     "nombre",
     "precio"
    ],
    "rows": [
     [
      "Monitor",
      "450000.00"
     ],
     [
      "Teclado",
      "85000.00"
     ],
     [
      "Mouse",
      "35000.00"
     ]
    ]
   },
   {
    "part": "Consultas de la clase",
    "t": "Funciones de agregación",
    "kind": "query",
    "sql": "SELECT COUNT(*)    AS total,\n       AVG(precio) AS promedio,\n       MIN(precio) AS minimo,\n       MAX(precio) AS maximo\nFROM PRODUCTO;",
    "cols": [
     "total",
     "promedio",
     "minimo",
     "maximo"
    ],
    "rows": [
     [
      "3",
      "190000.000000000000",
      "35000.00",
      "450000.00"
     ]
    ]
   },
   {
    "part": "Consultas de la clase",
    "t": "SUM: unidades vendidas",
    "kind": "query",
    "sql": "SELECT SUM(cantidad) AS unidades_vendidas\nFROM DETALLE_PEDIDO;",
    "cols": [
     "unidades_vendidas"
    ],
    "rows": [
     [
      "5"
     ]
    ]
   },
   {
    "part": "Consultas de la clase",
    "t": "GROUP BY + HAVING: clientes con más de un pedido",
    "kind": "query",
    "sql": "SELECT id_cliente, COUNT(*) AS num_pedidos\nFROM PEDIDO\nGROUP BY id_cliente\nHAVING COUNT(*) > 1;",
    "note": "WHERE filtra filas antes de agrupar; HAVING filtra grupos después de agrupar.",
    "cols": [
     "id_cliente",
     "num_pedidos"
    ],
    "rows": [
     [
      "1",
      "2"
     ]
    ]
   },
   {
    "part": "Práctica con JOIN (extra)",
    "t": "Pedidos con el nombre del cliente",
    "kind": "query",
    "extra": true,
    "sql": "SELECT p.id_pedido, p.fecha, c.nombre\nFROM PEDIDO p\nJOIN CLIENTE c ON c.id_cliente = p.id_cliente\nORDER BY p.id_pedido;",
    "cols": [
     "id_pedido",
     "fecha",
     "nombre"
    ],
    "rows": [
     [
      "1001",
      "2026-03-10",
      "Ana Torres"
     ],
     [
      "1002",
      "2026-03-12",
      "Ana Torres"
     ],
     [
      "1003",
      "2026-03-15",
      "Luis Pérez"
     ]
    ]
   },
   {
    "part": "Práctica con JOIN (extra)",
    "t": "Total de cada pedido (cantidad × precio)",
    "kind": "query",
    "extra": true,
    "sql": "SELECT d.id_pedido, SUM(d.cantidad * pr.precio) AS total\nFROM DETALLE_PEDIDO d\nJOIN PRODUCTO pr ON pr.id_producto = d.id_producto\nGROUP BY d.id_pedido\nORDER BY d.id_pedido;",
    "cols": [
     "id_pedido",
     "total"
    ],
    "rows": [
     [
      "1001",
      "155000.00"
     ],
     [
      "1002",
      "450000.00"
     ],
     [
      "1003",
      "35000.00"
     ]
    ]
   },
   {
    "part": "Práctica con JOIN (extra)",
    "t": "Clientes que nunca han hecho un pedido",
    "kind": "query",
    "extra": true,
    "sql": "SELECT c.nombre\nFROM CLIENTE c\nLEFT JOIN PEDIDO p ON p.id_cliente = c.id_cliente\nWHERE p.id_pedido IS NULL;",
    "cols": [
     "nombre"
    ],
    "rows": [
     [
      "Marta Ruiz"
     ]
    ]
   },
   {
    "part": "Práctica con JOIN (extra)",
    "t": "Cuánto ha gastado cada cliente (de mayor a menor)",
    "kind": "query",
    "extra": true,
    "sql": "SELECT c.nombre, SUM(d.cantidad * pr.precio) AS gastado\nFROM CLIENTE c\nJOIN PEDIDO p          ON p.id_cliente  = c.id_cliente\nJOIN DETALLE_PEDIDO d  ON d.id_pedido   = p.id_pedido\nJOIN PRODUCTO pr       ON pr.id_producto = d.id_producto\nGROUP BY c.id_cliente, c.nombre\nORDER BY gastado DESC;",
    "cols": [
     "nombre",
     "gastado"
    ],
    "rows": [
     [
      "Ana Torres",
      "605000.00"
     ],
     [
      "Luis Pérez",
      "35000.00"
     ]
    ]
   },
   {
    "part": "Práctica con JOIN (extra)",
    "t": "Productos vendidos más de una vez (unidades totales)",
    "kind": "query",
    "extra": true,
    "sql": "SELECT pr.nombre, SUM(d.cantidad) AS unidades\nFROM PRODUCTO pr\nJOIN DETALLE_PEDIDO d ON d.id_producto = pr.id_producto\nGROUP BY pr.id_producto, pr.nombre\nHAVING SUM(d.cantidad) > 1;",
    "cols": [
     "nombre",
     "unidades"
    ],
    "rows": [
     [
      "Mouse",
      "3"
     ]
    ]
   }
  ]
 },
 {
  "id": "normalizacion",
  "title": "Laboratorio 4 · Normalización de PRODUCTO_CATEGORIA",
  "origin": "Ejercicio final de la clase 6",
  "intro": "La tienda quiere registrar la categoría de cada producto. Un diseñador propone una sola tabla PRODUCTO_CATEGORIA(id_producto PK, nombre, precio, id_categoria, nombre_categoria). Se pide: dependencias funcionales, formas normales, tablas resultantes y SQL.",
  "steps": [
   {
    "part": "Análisis",
    "t": "Tabla propuesta (sin normalizar completamente)",
    "kind": "ddl",
    "sql": "-- Diseño propuesto: clave primaria id_producto\nCREATE TABLE PRODUCTO_CATEGORIA (\n    id_producto      INTEGER PRIMARY KEY,\n    nombre           VARCHAR(80)   NOT NULL,\n    precio           NUMERIC(10,2) NOT NULL,\n    id_categoria     INTEGER       NOT NULL,\n    nombre_categoria VARCHAR(60)   NOT NULL\n);\n\nINSERT INTO PRODUCTO_CATEGORIA VALUES\n(101, 'Teclado', 85000.00, 10, 'Periféricos'),\n(102, 'Mouse',   35000.00, 10, 'Periféricos'),\n(103, 'Monitor', 450000.00, 20, 'Pantallas');",
    "note": "Dependencias: id_producto → nombre, precio, id_categoria, nombre_categoria (la clave determina todo) y id_categoria → nombre_categoria (adicional). 1FN: sí (valores atómicos, clave definida). 2FN: sí (clave simple: no hay dependencias parciales). 3FN: NO: id_producto → id_categoria → nombre_categoria es una dependencia transitiva. Observa la redundancia: \"Periféricos\" se repite."
   },
   {
    "part": "Normalización a 3FN",
    "t": "Separar CATEGORIA y PRODUCTO",
    "kind": "ddl",
    "sql": "CREATE TABLE CATEGORIA (\n    id_categoria INTEGER PRIMARY KEY,\n    nombre       VARCHAR(60) NOT NULL\n);\n\nCREATE TABLE PRODUCTO (\n    id_producto  INTEGER PRIMARY KEY,\n    nombre       VARCHAR(80)   NOT NULL,\n    precio       NUMERIC(10,2) NOT NULL CHECK (precio > 0),\n    id_categoria INTEGER NOT NULL,\n    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA (id_categoria)\n);",
    "note": "Cada tabla queda con atributos que dependen de la clave completa y solo de la clave. Primero se crea CATEGORIA (la referenciada)."
   },
   {
    "part": "Normalización a 3FN",
    "t": "Migrar los datos sin perder información",
    "kind": "dml",
    "sql": "INSERT INTO CATEGORIA (id_categoria, nombre)\nSELECT DISTINCT id_categoria, nombre_categoria\nFROM PRODUCTO_CATEGORIA;\n\nINSERT INTO PRODUCTO (id_producto, nombre, precio, id_categoria)\nSELECT id_producto, nombre, precio, id_categoria\nFROM PRODUCTO_CATEGORIA;"
   },
   {
    "part": "Verificación",
    "t": "La unión reconstruye la tabla original (sin pérdida)",
    "kind": "query",
    "sql": "SELECT p.id_producto, p.nombre, p.precio, c.id_categoria, c.nombre AS nombre_categoria\nFROM PRODUCTO p\nJOIN CATEGORIA c ON c.id_categoria = p.id_categoria\nORDER BY p.id_producto;",
    "note": "Una buena normalización es una descomposición sin pérdida: el JOIN devuelve exactamente la tabla original.",
    "cols": [
     "id_producto",
     "nombre",
     "precio",
     "id_categoria",
     "nombre_categoria"
    ],
    "rows": [
     [
      "101",
      "Teclado",
      "85000.00",
      "10",
      "Periféricos"
     ],
     [
      "102",
      "Mouse",
      "35000.00",
      "10",
      "Periféricos"
     ],
     [
      "103",
      "Monitor",
      "450000.00",
      "20",
      "Pantallas"
     ]
    ]
   },
   {
    "part": "Verificación",
    "t": "Ahora cambiar el nombre de una categoría toca una sola fila",
    "kind": "dml",
    "sql": "UPDATE CATEGORIA SET nombre = 'Accesorios' WHERE id_categoria = 10;"
   }
  ]
 }
];
