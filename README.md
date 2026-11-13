# BD Final Prep
Sitio estático (HTML/CSS/JS, sin build ni backend) para estudiar Sistemas Transaccionales y BD (UCC).

## Abrir el sitio
- **Doble clic en `index.html`.** Funciona directamente desde el disco.
- El editor SQL usa **PostgreSQL real en el navegador** ([PGlite](https://pglite.dev) 0.5.13) y CodeMirror 5, cargados desde el CDN jsDelivr con versión fija: necesitas **internet** la primera vez (≈ 5 MB comprimidos; luego quedan en la caché del navegador).
- El progreso se guarda en el navegador (localStorage).

## Estructura
| Carpeta / archivo | Qué contiene |
|---|---|
| `js/data/practice_db.js` | Bases de práctica del curso (`bd_estudiantes_joins`, `bancodb`, `biblioteca`) en dos variantes: datos originales del profesor y datos extendidos |
| `js/data/sql_exercises.js` | Ejercicios SQL calificados (enunciado, pista, solución, explicación) |
| `js/data/joins_module.js` | Contenido del módulo de JOINs (demo fila por fila, patrones, errores típicos, mini-quiz) |
| `js/data/modules/mNN_*.js` | Los 12 temas de la ruta de aprendizaje (explicación, diagramas, ejemplos ejecutables, tutoriales paso a paso, mini-quiz). El formato de los bloques está documentado en `js/views/learn.js` |
| `js/data/*.js` (resto) | Teoría, preguntas, casos de modelado, laboratorios y exámenes |
| `js/sql/engine.js` | Motor: PGlite, esquemas de práctica y calificación (BEGIN…ROLLBACK) |
| `js/sql/grader.js` | Comparación de resultados (filas de más / de menos, columnas, orden) |
| `js/views/*.js` | Vistas nuevas: barra lateral y tema (`shell.js`), temas (`learn.js`), JOINs, editor y componentes compartidos (`ui.js`) |
| `js/erd.js` | Generador de diagramas Chen / pata de gallo y DDL |
| `tools/verify.js` | Ejecuta todas las soluciones y ejemplos en PostgreSQL y valida el calificador |

## Agregar un ejercicio SQL
1. Copia uno parecido en `js/data/sql_exercises.js` y cambia `id`, `prompt`, `solution`…
2. Ejecuta la verificación:
```
npm install
npm run verify
```

## Subir a Vercel
vercel.com → Add New → Project → carpeta del proyecto. Framework: "Other"; sin build command; output directory vacío. (O `npx vercel --prod`.)
