/* Estructura común: barra lateral con la ruta de aprendizaje y su progreso, botón claro/oscuro y menú móvil.
   Expone window.SHELL = { refresh, moduleStatus }. */
(function () {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const mods = () => (window.MODULES || []).slice().sort((a, b) => a.n - b.n);
  const store = () => (window.APP ? APP.store : { seen: {}, mq: {} });

  // Estado de un módulo: 'done' (mini-quiz ≥ 70 % y completo), 'seen' (visitado) o ''.
  function moduleStatus(m) {
    const s = store();
    const qid = m.quizId || m.id;
    const ans = (s.mq || {})[qid] || {};
    const total = m.quizCount || (m.quiz ? m.quiz.length : 0);
    const done = Object.keys(ans).length, ok = Object.values(ans).filter(Boolean).length;
    if (total && done >= total && ok / total >= 0.7) return { k: 'done', ok, total };
    if ((s.seen || {})[m.id] || done) return { k: 'seen', ok, total, done };
    return { k: '', ok, total, done };
  }
  const ICON = { done: '●', seen: '◐', '': '○' };

  const LINKS = [
    ['Practica', [['#/sql', '⌨', 'Editor SQL (ejercicios)'], ['#/quiz', '✎', 'Quizzes por tema'], ['#/casos', '◇', 'Casos de diseño (diagramas)'], ['#/labs', '⚗', 'Laboratorios del curso'], ['#/examenes', '⏱', 'Exámenes']]],
    ['Repasa', [['#/teoria', '≡', 'Resumen teórico'], ['#/repaso', '▤', 'Hoja de repaso']]]
  ];

  function refresh() {
    const side = document.getElementById('side');
    if (!side) return;
    const h = location.hash || '#/';
    const list = mods();
    const st = list.map(moduleStatus);
    const nDone = st.filter((x) => x.k === 'done').length;
    const active = (href) => (h === href || (href !== '#/' && h.startsWith(href + '/')) ? ' on' : '');
    side.innerHTML = `<a href="#/" class="${active('#/').trim()}"><span class="mst">⌂</span>Inicio</a>
<h4>Aprende · ruta recomendada</h4>
<div class="sideprog">${nDone}/${list.length} temas dominados<i><u style="width:${list.length ? Math.round((100 * nDone) / list.length) : 0}%"></u></i></div>
<a href="#/aprende" class="${h === '#/aprende' ? 'on' : ''}"><span class="mst">↦</span>Ver la ruta completa</a>
${list.map((m, i) => {
      const href = m.href || '#/aprende/' + m.id;
      return `<a href="${href}" class="${active(href).trim()}" title="${esc(m.title)}"><span class="mst ${st[i].k}">${ICON[st[i].k]}</span><span class="mnum">${m.n}</span>${esc(m.short || m.title)}</a>`;
    }).join('')}
${LINKS.map(([g, items]) => `<h4>${g}</h4>${items.map(([href, ic, t]) => `<a href="${href}" class="${active(href).trim()}"><span class="mst">${ic}</span>${t}</a>`).join('')}`).join('')}
<p class="small" style="margin:16px 8px 0">○ sin ver · ◐ en curso · ● mini-quiz ≥ 70 %</p>`;
  }

  /* ---------- tema ---------- */
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function paintThemeBtn() {
    const b = document.getElementById('themebtn');
    if (b) { const dark = currentTheme() === 'dark'; b.textContent = dark ? '☀' : '☾'; b.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'; }
  }
  document.getElementById('themebtn').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('bdfp_theme', next); } catch (e) { /* sin storage */ }
    paintThemeBtn();
  });
  paintThemeBtn();

  /* ---------- menú móvil ---------- */
  const side = document.getElementById('side'), scrim = document.getElementById('scrim'), mb = document.getElementById('menubtn');
  const setOpen = (o) => { side.classList.toggle('open', o); scrim.classList.toggle('hide', !o); mb.setAttribute('aria-expanded', String(o)); };
  mb.addEventListener('click', () => setOpen(!side.classList.contains('open')));
  scrim.addEventListener('click', () => setOpen(false));
  side.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  window.addEventListener('hashchange', refresh);
  window.SHELL = { refresh, moduleStatus, modules: mods };
})();
