/* Exámenes. mc: nº de preguntas MC por tema; open: ids de abiertas; cases: ids de casos de diseño; norm: ids de ejercicios de normalización; sql: ids de labs para escribir consultas */
window.EXAMS = [
  {
    id: 'e1', title: 'Examen 1 · Fundamentos y modelado',
    desc: 'Metodología, Entidad-Relación, ER avanzado y transformación.',
    min: 60,
    mc: { met: 3, er: 7, avz: 6, rel: 6 },
    open: ['o2', 'o3', 'o17'],
    cases: ['veterinaria'],
    norm: []
  },
  {
    id: 'e2', title: 'Examen 2 · Pata de gallo, SQL y normalización',
    desc: 'Diagramas de pata de gallo, DDL/DML/consultas, laboratorios y formas normales.',
    min: 60,
    mc: { pg: 5, sql: 8, lab: 5, norm: 6 },
    open: ['o10', 'o11', 'o14'],
    cases: ['aerolinea'],
    norm: ['n1']
  },
  {
    id: 'e3', title: 'Examen 3 · Simulacro final integral',
    desc: 'Como el real: selección múltiple, preguntas abiertas, diagrama de pata de gallo, código SQL para crear la base de datos y normalización.',
    min: 120,
    mc: { met: 2, er: 4, avz: 4, rel: 5, pg: 3, sql: 6, lab: 3, norm: 4 },
    open: ['o4', 'o6', 'o9', 'o12', 'o15'],
    cases: ['colegio'],
    norm: ['n2']
  }
];
