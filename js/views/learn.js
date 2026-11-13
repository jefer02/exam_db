/* Módulos de aprendizaje (ruta #/aprende y #/aprende/<id>). El contenido está en js/data/modules/*.js.
   Cada módulo: { id, n, title, short, desc, minutes, goals[], sections[{id, h, body[]}], keys[], quiz[], practice{} }.
   Bloques de body (string = HTML):
     {tip|warn|key|exam: html, title?}   recuadros
     {ex: {id, db, data, sql, title, note}} ejemplo SQL ejecutable
     {sql: '...'}                         código SQL sin ejecutar
     {diagram: {spec, view: 'chen'|'crow'|'rel'|'ddl'|'tabs', caption}}  diagrama generado con ERD
     {case: 'id', view, caption}          diagrama de un caso de js/data/cases.js
     {stepper: {title, steps: [{h, body: [...]}]}}  tutorial paso a paso
     {reveal: {q, a}}                     piensa primero, luego mira la respuesta
     {cols: [[...], [...]]}               columnas con bloques */
(function () {
  const esc = UI.esc;
  const THEME = { ink: 'var(--ink)', soft: 'var(--soft)', bg: 'var(--card)', head: 'var(--svg-head)', pk: 'var(--svg-pk)', accent: 'var(--accent)', line: 'var(--line2)' };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const steppers = {};
  let seq = 0;

  function diagram(d) {
    let inner;
    try {
      const views = {
        chen: () => `<div class="svgwrap">${ERD.chenSVG(clone(d.spec), THEME)}</div>`,
        crow: () => `<div class="svgwrap">${ERD.crowSVG(ERD.transform(clone(d.spec)), THEME)}</div>`,
        rel: () => `<div class="relschema">${ERD.schemaText(ERD.transform(clone(d.spec))).map((l) => `<div>${l}</div>`).join('')}</div>`,
        ddl: () => UI.code(ERD.ddl(ERD.transform(clone(d.spec))))
      };
      if (d.view === 'tabs') {
        const g = 'dg' + (++seq);
        const tabs = [['chen', 'Chen (E/R)'], ['crow', 'Pata de gallo'], ['rel', 'Modelo relacional'], ['ddl', 'SQL (DDL)']];
        inner = `<div class="tabbar">${tabs.map((t, i) => `<button class="tab${i ? '' : ' on'}" data-act="tab" data-g="${g}" data-k="${t[0]}">${t[1]}</button>`).join('')}</div>
${tabs.map((t, i) => `<div class="tabpane${i ? ' hide' : ''}" data-g="${g}" data-k="${t[0]}">${views[t[0]]()}</div>`).join('')}`;
      } else inner = views[d.view || 'chen']();
    } catch (e) { inner = `<p class="small">No se pudo dibujar el diagrama: ${esc(e.message)}</p>`; }
    return `<div class="diagram">${inner}${d.caption ? `<p class="dcap">${d.caption}</p>` : ''}</div>`;
  }

  function stepper(s, m) {
    const id = 'st' + (++seq);
    steppers[id] = { s, m, i: 0 };
    return `<div class="stepper" id="${id}">${stepperInner(id)}</div>`;
  }
  function stepperInner(id) {
    const { s, m, i } = steppers[id];
    const st = s.steps[i];
    return `<div class="sthead"><b>${s.title ? esc(s.title) : 'Paso a paso'}</b>
<div class="stdots">${s.steps.map((_, k) => `<button class="${k === i ? 'on' : k < i ? 'past' : ''}" data-l="stgo" data-id="${id}" data-k="${k}" aria-label="Paso ${k + 1}">${k + 1}</button>`).join('')}</div></div>
<h4>Paso ${i + 1}. ${st.h}</h4>${blocks(st.body, m)}
<div class="exbar"><button class="btn sm alt" data-l="stgo" data-id="${id}" data-k="${i - 1}"${i ? '' : ' disabled'}>◀ Anterior</button>
<button class="btn sm" data-l="stgo" data-id="${id}" data-k="${i + 1}"${i < s.steps.length - 1 ? '' : ' disabled'}>Siguiente paso ▶</button></div>`;
  }

  const CALL = { tip: 'Consejo', warn: 'Cuidado', key: 'Idea clave', exam: 'En el examen' };
  function block(b, m) {
    if (typeof b === 'string') return b;
    for (const k of Object.keys(CALL)) if (b[k]) return `<div class="callout ${k}"><b>${b.title || CALL[k]}</b>${b[k]}</div>`;
    if (b.ex) return UI.example(Object.assign({ data: 'orig' }, b.ex, { id: m.id + '_' + b.ex.id }));
    if (b.sql) return UI.code(b.sql);
    if (b.diagram) return diagram(b.diagram);
    if (b.case) {
      const c = CASES.find((x) => x.id === b.case);
      return c ? diagram({ spec: c, view: b.view || 'tabs', caption: b.caption }) : '';
    }
    if (b.stepper) return stepper(b.stepper, m);
    if (b.reveal) return `<details class="reveal"><summary>🤔 ${b.reveal.q}</summary><div class="ans">${blocks([].concat(b.reveal.a), m)}</div></details>`;
    if (b.cols) return `<div class="cols${b.cols.length === 3 ? 3 : 2}">${b.cols.map((c) => `<div class="mini">${blocks(c, m)}</div>`).join('')}</div>`;
    return '';
  }
  const blocks = (arr, m) => (arr || []).map((b) => block(b, m)).join('\n');

  /* ---------- práctica relacionada ---------- */
  function practice(m) {
    const p = m.practice || {};
    const s = APP.store, solved = (s.sql && s.sql.status) || {};
    const cards = [];
    (p.sql || []).forEach((t) => {
      const L = SQL_EXERCISES.LIST.filter((e) => e.topic === t);
      if (L.length) cards.push(`<a class="card tile hl" href="#/sql/t/${t}"><b>⌨ Ejercicios SQL · ${esc(SQL_EXERCISES.SQL_TOPICS[t])}</b><span>${L.filter((e) => solved[e.id] === 'ok').length}/${L.length} resueltos · se califican solos</span></a>`);
    });
    (p.quiz || []).forEach((t) => {
      const n = BANK.filter((q) => q.t === t).length;
      const r = (s.topics || {})[t];
      cards.push(`<a class="card tile" href="#/quiz/run/${t}"><b>✎ Quiz: ${esc(TOPICS[t])}</b><span>${n} preguntas${r ? ` · llevas ${Math.round((100 * r.ok) / r.total)} %` : ''}</span></a>`);
    });
    (p.cases || []).forEach((id) => { const c = CASES.find((x) => x.id === id); if (c) cards.push(`<a class="card tile" href="#/caso/${id}"><b>◇ Caso: ${esc(c.title)}</b><span>Hazlo en papel y compara con la solución</span></a>`); });
    (p.labs || []).forEach((id) => { const l = SQLLABS.find((x) => x.id === id); if (l) cards.push(`<a class="card tile" href="#/lab/${id}"><b>⚗ ${esc(l.title)}</b><span>${l.steps.length} pasos con solución</span></a>`); });
    return cards.length ? `<div class="practice">${cards.join('')}</div>` : '';
  }

  /* ---------- páginas ---------- */
  function roadmap() {
    const list = SHELL.modules();
    APP.page('#/aprende', `<h1>Ruta de aprendizaje</h1>
<p>Estudia los temas en este orden: cada uno usa lo que aprendiste en el anterior. Cada tema tiene explicación, ejemplos visuales, SQL que puedes ejecutar, un mini-quiz y ejercicios.</p>
<div class="roadmap">${list.map((m) => {
      const st = SHELL.moduleStatus(m);
      return `<a class="rmitem ${st.k}" href="${m.href || '#/aprende/' + m.id}"><span class="rmnum">${m.n}</span>
<span class="rmtxt"><b>${esc(m.title)}</b><span>${esc(m.desc)}</span></span>
<span class="rmst">${m.minutes ? `≈ ${m.minutes} min<br>` : ''}${st.k === 'done' ? '✔ dominado' : st.total ? `quiz ${st.ok}/${st.total}` : ''}</span></a>`;
    }).join('')}</div>`);
  }

  function moduleView(id) {
    const list = SHELL.modules();
    const i = list.findIndex((x) => x.id === id);
    const m = list[i];
    if (!m) return roadmap();
    if (m.href) { location.hash = m.href; return; }
    const s = APP.store;
    s.seen = s.seen || {}; s.seen[m.id] = s.seen[m.id] || Date.now();
    s.mq = s.mq || {};
    APP.save();
    const prev = list[i - 1], next = list[i + 1];
    const navLink = (x, dir) => (x ? `<a class="btn alt" href="${x.href || '#/aprende/' + x.id}">${dir < 0 ? '← ' : ''}${x.n}. ${esc(x.short || x.title)}${dir > 0 ? ' →' : ''}</a>` : '<span></span>');
    APP.page('#/aprende/' + m.id, `
<div class="modhead"><p class="kicker">Tema ${m.n} de ${list.length}${m.minutes ? ` · ≈ ${m.minutes} min` : ''}</p><h1>${esc(m.title)}</h1></div>
${m.goals ? `<div class="goal"><b>Al terminar este tema sabrás:</b><ul>${m.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
<div class="toc">${m.sections.map((x, k) => `<a href="#s-${x.id}" data-act="goto" data-id="s-${x.id}">${k + 1}. ${esc(x.h)}</a>`).join('')}
${m.keys ? '<a href="#s-keys" data-act="goto" data-id="s-keys">Resumen</a>' : ''}${m.quiz ? '<a href="#s-quiz" data-act="goto" data-id="s-quiz">Mini-quiz</a>' : ''}<a href="#s-prac" data-act="goto" data-id="s-prac">Practicar</a></div>
${m.sections.map((x, k) => `<section class="card msec" id="s-${x.id}"><h2>${k + 1}. ${esc(x.h)}</h2>${blocks(x.body, m)}</section>`).join('')}
${m.keys ? `<section class="card" id="s-keys"><h2>Resumen: lo que debes recordar</h2><ul class="keys">${m.keys.map((k) => `<li>${k}</li>`).join('')}</ul></section>` : ''}
${m.quiz ? `<section class="card" id="s-quiz"><h2>Mini-quiz</h2><p class="small">Cada respuesta explica por qué cada opción es correcta o incorrecta. Con 70 % o más el tema queda como dominado en la barra lateral.</p>
${UI.miniQuiz(m.id, m.quiz, (qi, ok) => { s.mq[m.id] = s.mq[m.id] || {}; s.mq[m.id][qi] = ok; APP.save(); SHELL.refresh(); })}</section>` : ''}
<section class="card" id="s-prac"><h2>Practica este tema</h2>${practice(m) || '<p class="small">Pronto habrá más práctica para este tema.</p>'}</section>
<div class="modnav">${navLink(prev, -1)}${navLink(next, 1)}</div>`);
  }

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-l]');
    if (!el) return;
    if (el.dataset.l === 'stgo') {
      const st = steppers[el.dataset.id]; if (!st) return;
      const k = +el.dataset.k;
      if (k < 0 || k >= st.s.steps.length) return;
      st.i = k;
      const box = document.getElementById(el.dataset.id);
      box.innerHTML = stepperInner(el.dataset.id);
      if (box.getBoundingClientRect().top < 60) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.aprende = (b) => (b ? moduleView(b) : roadmap());
})();
