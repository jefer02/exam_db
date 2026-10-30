/* ERD helpers: conceptual spec -> relational model -> DDL, crow's foot SVG, Chen SVG.
   Pure functions (no DOM) so they run in the browser and in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ERD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_THEME = {
    ink: '#1f2937', soft: '#6b7280', bg: '#ffffff', head: '#e0ecff', pk: '#fff4d6',
    accent: '#2563eb', line: '#374151'
  };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lower = (s) => s.toLowerCase();
  const fkType = (t) => (/^SERIAL$/i.test(t) ? 'INT' : /^BIGSERIAL$/i.test(t) ? 'BIGINT' : t);

  /* ---------- Conceptual -> relational ---------- */
  function transform(spec) {
    const tables = {};
    const order = [];
    const ents = {};
    const tname = (e) => e.table || lower(e.n);
    spec.entities.forEach((e) => { ents[e.n] = e; });

    function addTable(name, label) {
      const t = { name, label: label || name.toUpperCase(), cols: [], pk: [], fks: [], pos: null };
      tables[name] = t; order.push(name); return t;
    }
    const col = (t, c) => { t.cols.push(c); return c; };
    const pkCols = (t) => t.cols.filter((c) => t.pk.includes(c.n));

    // 1. entities (and multivalued attributes)
    spec.entities.forEach((e) => {
      const t = addTable(tname(e), e.n);
      t.pos = e.pos; t.entity = e.n;
    });
    const isaSubs = {};
    (spec.isa || []).forEach((g) => g.subs.forEach((s) => { isaSubs[s] = g; }));

    spec.entities.forEach((e) => {
      const t = tables[tname(e)];
      if (isaSubs[e.n]) {
        const sup = tables[tname(ents[isaSubs[e.n].sup])];
        pkCols(sup).forEach((c) => {
          col(t, { n: c.n, t: fkType(c.t), nn: true });
          t.pk.push(c.n);
        });
        t.fks.push({ cols: pkCols(sup).map((c) => c.n), ref: sup.name, refCols: pkCols(sup).map((c) => c.n), nn: true, refSym: 'one', childSym: 'zeroOne', cascade: true, kind: 'isa' });
      }
      (e.attrs || []).forEach((a) => {
        if (a.derived) return;
        if (a.multi) {
          const mt = addTable(tname(e) + '_' + a.n, (e.n + '_' + a.n).toUpperCase());
          const eCols = pkCols(t);
          mt.pos = a.pos || (e.pos ? [e.pos[0], e.pos[1] + 1] : null);
          eCols.forEach((c) => { col(mt, { n: c.n, t: fkType(c.t), nn: true }); mt.pk.push(c.n); });
          col(mt, { n: a.n, t: a.t, nn: true }); mt.pk.push(a.n);
          mt.fks.push({ cols: eCols.map((c) => c.n), ref: t.name, refCols: eCols.map((c) => c.n), nn: true, refSym: 'one', childSym: a.multi === 1 ? 'oneMany' : 'zeroMany', cascade: true, kind: 'multi' });
          return;
        }
        col(t, { n: a.n, t: a.t, nn: !!a.nn, uq: !!a.uq, ck: a.ck, def: a.def });
        if (a.pk) t.pk.push(a.n);
      });
    });

    function propagate(child, parent, o) {
      const pcols = pkCols(parent);
      const names = pcols.map((c, i) => (o.fk && pcols.length === 1 ? o.fk : o.fk ? o.fk + '_' + c.n : c.n));
      pcols.forEach((c, i) => {
        col(child, { n: names[i], t: fkType(c.t), nn: !!o.nn, uq: !!o.uq });
        if (o.ident) child.pk.push(names[i]);
      });
      child.fks.push({ cols: names, ref: parent.name, refCols: pcols.map((c) => c.n), nn: !!o.nn, refSym: o.refSym, childSym: o.childSym, cascade: !!o.ident, kind: o.kind || 'rel', unique: !!o.uq });
    }

    // 2. relationships
    (spec.rels || []).forEach((r) => {
      if (r.ents) { // n-ary (ternary...) -> new table with all keys
        const t = addTable(r.table || r.n, (r.table || r.n).toUpperCase());
        t.pos = r.pos || null;
        r.ents.forEach((en) => {
          const p = tables[tname(ents[en])];
          const before = t.cols.length;
          propagate(t, p, { nn: true, ident: true, refSym: 'one', childSym: 'zeroMany', kind: 'nary' });
        });
        (r.attrs || []).forEach((a) => { col(t, { n: a.n, t: a.t, nn: !!a.nn, ck: a.ck, def: a.def }); if (a.pk) t.pk.push(a.n); });
        return;
      }
      const A = tables[tname(ents[r.a])], B = tables[tname(ents[r.b])];
      const maxA = r.ca[1], maxB = r.cb[1];
      const minA = r.ca[0], minB = r.cb[0];
      if (maxA === 'n' && maxB === 'n') { // N:M -> associative table
        const t = addTable(r.table || r.n, (r.table || r.n).toUpperCase());
        t.pos = r.pos || null;
        propagate(t, A, { nn: true, ident: true, fk: r.fkA, refSym: 'one', childSym: minA === 1 ? 'oneMany' : 'zeroMany', kind: 'nm' });
        propagate(t, B, { nn: true, ident: true, fk: r.fkB, refSym: 'one', childSym: minB === 1 ? 'oneMany' : 'zeroMany', kind: 'nm' });
        (r.attrs || []).forEach((a) => { col(t, { n: a.n, t: a.t, nn: !!a.nn, ck: a.ck, def: a.def }); if (a.pk) t.pk.push(a.n); });
        t.assoc = true;
      } else if (maxA === 1 && maxB === 'n') { // FK in A -> B
        propagate(A, B, { nn: minA === 1, fk: r.fk, ident: r.ident, refSym: minA === 1 ? 'one' : 'zeroOne', childSym: minB === 1 ? 'oneMany' : 'zeroMany' });
      } else if (maxA === 'n' && maxB === 1) { // FK in B -> A
        propagate(B, A, { nn: minB === 1, fk: r.fk, ident: r.ident, refSym: minB === 1 ? 'one' : 'zeroOne', childSym: minA === 1 ? 'oneMany' : 'zeroMany' });
      } else { // 1:1
        if (minA === 0 && minB === 0) {
          const t = addTable(r.table || r.n, (r.table || r.n).toUpperCase());
          t.pos = r.pos || null;
          propagate(t, A, { nn: true, ident: true, refSym: 'zeroOne', childSym: 'zeroOne', kind: 'nm' });
          propagate(t, B, { nn: true, uq: true, refSym: 'zeroOne', childSym: 'zeroOne', kind: 'nm' });
          t.assoc = true;
        } else {
          const aSide = minA === 1; // mandatory side holds the FK
          const child = aSide ? A : B, parent = aSide ? B : A;
          const cMin = aSide ? minA : minB, pMin = aSide ? minB : minA;
          propagate(child, parent, { nn: true, uq: true, fk: r.fk, refSym: 'one', childSym: pMin === 1 ? 'one' : 'zeroOne' });
        }
      }
    });

    // order for DDL: referenced tables first
    const sorted = [], seen = {};
    const visit = (n) => {
      if (seen[n]) return; seen[n] = 1;
      tables[n].fks.forEach((f) => { if (f.ref !== n) visit(f.ref); });
      sorted.push(n);
    };
    order.forEach(visit);
    return { tables, order: sorted };
  }

  /* ---------- DDL text ---------- */
  function ddl(model) {
    return model.order.map((n) => {
      const t = model.tables[n];
      const w = Math.max(...t.cols.map((c) => c.n.length)) + 1;
      const lines = t.cols.map((c) => {
        let s = c.n.padEnd(w) + c.t;
        const single = t.pk.length === 1 && t.pk[0] === c.n;
        if (single) s += ' PRIMARY KEY';
        else if (c.nn) s += ' NOT NULL';
        if (c.uq && !single) s += ' UNIQUE';
        if (c.def !== undefined) s += ' DEFAULT ' + c.def;
        if (c.ck) s += ' CHECK (' + c.ck + ')';
        return s;
      });
      if (t.pk.length > 1) lines.push('PRIMARY KEY (' + t.pk.join(', ') + ')');
      t.fks.forEach((f) => {
        lines.push('FOREIGN KEY (' + f.cols.join(', ') + ') REFERENCES ' + f.ref + '(' + f.refCols.join(', ') + ')' + (f.cascade ? ' ON DELETE CASCADE' : ''));
      });
      return 'CREATE TABLE ' + t.name + ' (\n    ' + lines.join(',\n    ') + '\n);';
    }).join('\n\n');
  }

  /* ---------- Relational schema as text (grafo relacional) ---------- */
  function schemaText(model) {
    return model.order.map((n) => {
      const t = model.tables[n];
      const fkCols = new Set(); t.fks.forEach((f) => f.cols.forEach((c) => fkCols.add(c)));
      const parts = t.cols.map((c) => {
        let s = c.n;
        if (t.pk.includes(c.n)) s = '<u>' + s + '</u>';
        if (fkCols.has(c.n)) s += ' <sup>FK</sup>';
        return s;
      });
      return '<b>' + t.name + '</b> ( ' + parts.join(', ') + ' )';
    });
  }

  /* ---------- Crow's foot SVG ---------- */
  const TW = 252, HEAD = 28, ROW = 21;

  function crowSVG(model, theme) {
    const C = Object.assign({}, DEFAULT_THEME, theme || {});
    const names = model.order;
    const tabs = names.map((n) => model.tables[n]);
    tabs.forEach((t) => { t.h = HEAD + t.cols.length * ROW + 6; });

    // positions
    const rows = {};
    tabs.forEach((t, i) => { if (!t.pos) t.pos = [i % 3, Math.floor(i / 3) * 1.2]; });
    const rowKeys = [...new Set(tabs.map((t) => t.pos[1]))].sort((a, b) => a - b);
    const rowY = {}; let y = 24;
    rowKeys.forEach((k, idx) => {
      rowY[k] = y;
      const mx = Math.max(...tabs.filter((t) => t.pos[1] === k).map((t) => t.h));
      const next = rowKeys[idx + 1];
      // fractional rows may sit near each other: advance by tallest + gap
      y += mx + 72;
    });
    tabs.forEach((t) => { t.x = 24 + t.pos[0] * (TW + 110); t.y = rowY[t.pos[1]]; });
    const hasSelf = tabs.some((t) => t.fks.some((f) => f.ref === t.name));
    const W = Math.max(...tabs.map((t) => t.x + TW)) + (hasSelf ? 90 : 40);
    const H = Math.max(...tabs.map((t) => t.y + t.h)) + 40;

    // connections
    const conns = [];
    tabs.forEach((t) => t.fks.forEach((f) => {
      const p = model.tables[f.ref];
      conns.push({ child: t, parent: p, f });
    }));

    // choose sides
    conns.forEach((c) => {
      const a = c.child, b = c.parent;
      if (a === b) { c.self = true; return; }
      const gapX = a.x + TW < b.x ? 'ab' : b.x + TW < a.x ? 'ba' : null;
      if (gapX) {
        c.mode = 'h';
        c.sa = gapX === 'ab' ? 'R' : 'L';
        c.sb = gapX === 'ab' ? 'L' : 'R';
      } else {
        c.mode = 'v';
        c.sa = a.y < b.y ? 'B' : 'T';
        c.sb = a.y < b.y ? 'T' : 'B';
      }
    });
    // spread anchors
    const slots = {};
    conns.forEach((c, i) => {
      if (c.self) return;
      [['a', c.child, c.sa, c.parent], ['b', c.parent, c.sb, c.child]].forEach(([k, t, side, other]) => {
        const key = t.name + '|' + side;
        (slots[key] = slots[key] || []).push({ c, k, other });
      });
    });
    Object.keys(slots).forEach((key) => {
      const arr = slots[key];
      const side = key.split('|')[1];
      arr.sort((p, q) => (side === 'L' || side === 'R') ? (p.other.y - q.other.y) : (p.other.x - q.other.x));
      arr.forEach((s, i) => { s.c['off' + s.k] = (i + 1) / (arr.length + 1); });
    });
    const anchor = (t, side, off) => {
      if (side === 'L') return { x: t.x, y: t.y + HEAD + 6 + (t.h - HEAD - 12) * off, dx: -1, dy: 0 };
      if (side === 'R') return { x: t.x + TW, y: t.y + HEAD + 6 + (t.h - HEAD - 12) * off, dx: 1, dy: 0 };
      if (side === 'T') return { x: t.x + TW * (0.15 + 0.7 * off), y: t.y, dx: 0, dy: -1 };
      return { x: t.x + TW * (0.15 + 0.7 * off), y: t.y + t.h, dx: 0, dy: 1 };
    };

    const stroke = `stroke:${C.line};stroke-width:1.6;fill:none`;
    let out = '';

    function sym(p, kind) {
      // p: anchor with outward direction (dx,dy); symbol drawn along the line
      const nx = -p.dy, ny = p.dx;
      const at = (d, s) => [p.x + p.dx * d + nx * s, p.y + p.dy * d + ny * s];
      let g = '';
      const L = (a, b) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" style="${stroke}"/>`;
      const circ = (d) => { const c = at(d, 0); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="5" style="stroke:${C.line};stroke-width:1.6;fill:${C.bg}"/>`; };
      const foot = () => L(at(15, 0), at(0, 8)) + L(at(15, 0), at(0, -8)) + L(at(15, 0), at(0, 0));
      if (kind === 'one') g += L(at(9, -7), at(9, 7)) + L(at(15, -7), at(15, 7));
      else if (kind === 'zeroOne') g += L(at(9, -7), at(9, 7)) + circ(19);
      else if (kind === 'oneMany') g += foot() + L(at(21, -7), at(21, 7));
      else if (kind === 'zeroMany') g += foot() + circ(25);
      return g;
    }

    conns.forEach((c) => {
      let pa, pb, path;
      if (c.self) {
        const t = c.child;
        pa = { x: t.x + TW, y: t.y + HEAD + 8 + 0.3 * (t.h - HEAD), dx: 1, dy: 0 };
        pb = { x: t.x + TW, y: t.y + HEAD + 8 + 0.7 * (t.h - HEAD), dx: 1, dy: 0 };
        const ox = t.x + TW + 46;
        path = `M${pa.x},${pa.y} L${ox},${pa.y} L${ox},${pb.y} L${pb.x},${pb.y}`;
      } else {
        pa = anchor(c.child, c.sa, c.offa); pb = anchor(c.parent, c.sb, c.offb);
        if (c.mode === 'h') {
          const mx = (pa.x + pb.x) / 2 + (c.offa - 0.5) * 30;
          path = `M${pa.x},${pa.y} L${mx},${pa.y} L${mx},${pb.y} L${pb.x},${pb.y}`;
        } else {
          const my = (pa.y + pb.y) / 2 + (c.offa - 0.5) * 24;
          path = `M${pa.x},${pa.y} L${pa.x},${my} L${pb.x},${my} L${pb.x},${pb.y}`;
        }
      }
      out += `<path d="${path}" style="${stroke}"/>`;
      out += sym(pa, c.f.childSym) + sym(pb, c.f.refSym);
    });

    // tables on top
    tabs.forEach((t) => {
      const fkCols = new Set(); t.fks.forEach((f) => f.cols.forEach((x) => fkCols.add(x)));
      out += `<g>`;
      out += `<rect x="${t.x}" y="${t.y}" width="${TW}" height="${t.h}" rx="6" style="fill:${C.bg};stroke:${C.ink};stroke-width:1.6"/>`;
      out += `<path d="M${t.x},${t.y + HEAD} L${t.x},${t.y + 6} Q${t.x},${t.y} ${t.x + 6},${t.y} L${t.x + TW - 6},${t.y} Q${t.x + TW},${t.y} ${t.x + TW},${t.y + 6} L${t.x + TW},${t.y + HEAD} Z" style="fill:${C.head};stroke:${C.ink};stroke-width:1.6"/>`;
      out += `<text x="${t.x + TW / 2}" y="${t.y + 19}" text-anchor="middle" style="font:700 13px sans-serif;fill:${C.ink}">${esc(t.label)}</text>`;
      t.cols.forEach((c, i) => {
        const cy = t.y + HEAD + 3 + i * ROW;
        const isPk = t.pk.includes(c.n), isFk = fkCols.has(c.n);
        if (isPk) out += `<rect x="${t.x + 1}" y="${cy}" width="${TW - 2}" height="${ROW}" style="fill:${C.pk}"/>`;
        const tag = (isPk ? 'PK' : '') + (isPk && isFk ? ',' : '') + (isFk ? 'FK' : '');
        out += `<text x="${t.x + 8}" y="${cy + 15}" style="font:700 10px sans-serif;fill:${C.accent}">${tag}</text>`;
        out += `<text x="${t.x + 46}" y="${cy + 15}" style="font:${isPk ? 700 : 400} 12px sans-serif;fill:${C.ink}">${esc(c.n)}</text>`;
        out += `<text x="${t.x + TW - 8}" y="${cy + 15}" text-anchor="end" style="font:400 10px sans-serif;fill:${C.soft}">${esc(fkType(c.t))}</text>`;
      });
      out += `</g>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="sans-serif"><rect width="${W}" height="${H}" style="fill:${C.bg}"/>${out}</svg>`;
  }

  /* ---------- Chen SVG ---------- */
  function textW(s, px) { return s.length * px * 0.58; }

  function chenSVG(spec, theme) {
    const C = Object.assign({}, DEFAULT_THEME, theme || {});
    const CX = 470, CY = 400; // grid spacing
    const ents = {};
    spec.entities.forEach((e) => {
      const p = e.cp || e.pos || [0, 0];
      e.cx = 260 + p[0] * CX;
      e.cy = 210 + p[1] * CY;
      e.w = Math.max(110, textW(e.n, 14) + 34); e.h = 40;
      ents[e.n] = e;
    });
    const rels = (spec.rels || []).map((r) => {
      const o = Object.assign({}, r);
      const list = r.ents ? r.ents.map((n) => ents[n]) : [ents[r.a], ents[r.b]];
      if (r.cpos) { o.cx = 260 + r.cpos[0] * CX; o.cy = 210 + r.cpos[1] * CY; }
      else if (r.a === r.b) { o.cx = list[0].cx + list[0].w / 2 + 130; o.cy = list[0].cy - 10; }
      else { o.cx = list.reduce((s, e) => s + e.cx, 0) / list.length; o.cy = list.reduce((s, e) => s + e.cy, 0) / list.length; }
      o.dw = Math.max(110, textW(r.n, 12) + 50); o.dh = 58;
      o.list = list;
      return o;
    });
    const isas = (spec.isa || []).map((g) => {
      const sup = ents[g.sup], subs = g.subs.map((s) => ents[s]);
      const sx = subs.reduce((s, e) => s + e.cx, 0) / subs.length, sy = subs.reduce((s, e) => s + e.cy, 0) / subs.length;
      const o = { g, sup, subs, tx: (sup.cx + sx) / 2, ty: (sup.cy + sy) / 2 };
      return o;
    });

    // block directions per entity
    const blocked = {};
    const ang = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
    const block = (e, a) => { (blocked[e.n] = blocked[e.n] || []).push(a); };
    rels.forEach((r) => r.list.forEach((e) => { if (r.a === r.b) { block(e, 0); block(e, 0.5); block(e, -0.5); } else block(e, ang(e.cx, e.cy, r.cx, r.cy)); }));
    isas.forEach((i) => { block(i.sup, ang(i.sup.cx, i.sup.cy, i.tx, i.ty)); i.subs.forEach((s) => block(s, ang(s.cx, s.cy, i.tx, i.ty))); });

    const adiff = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
    let out = '';
    const ST = `stroke:${C.line};stroke-width:1.4;fill:none`;
    const lines = [], shapes = [], texts = [];

    // attributes
    const attrShapes = [];
    spec.entities.forEach((e) => {
      const attrs = (e.attrs || []);
      const n = attrs.length;
      const SLOTS = 24;
      const cand = [];
      for (let i = 0; i < SLOTS; i++) {
        const a = (i / SLOTS) * 2 * Math.PI - Math.PI;
        const bl = (blocked[e.n] || []).some((b) => adiff(a, b) < 0.5);
        cand.push({ a, bl, i });
      }
      const free = cand.filter((c) => !c.bl);
      const chosen = [];
      const pool = free.length >= n ? free : cand;
      // greedy farthest-point selection
      if (n > 0) {
        // start with the slot pointing up-left-ish (angle -pi/2) closest
        let first = pool.slice().sort((p, q) => adiff(p.a, -Math.PI / 2) - adiff(q.a, -Math.PI / 2))[0];
        chosen.push(first);
        while (chosen.length < n) {
          let best = null, bd = -1;
          pool.forEach((c) => {
            if (chosen.includes(c)) return;
            const d = Math.min(...chosen.map((s) => adiff(s.a, c.a)));
            if (d > bd) { bd = d; best = c; }
          });
          if (!best) break;
          chosen.push(best);
        }
      }
      // order chosen angles around circle so that attrs are assigned deterministically
      chosen.sort((p, q) => p.a - q.a);
      let prevA = null, prevF = 1;
      attrs.forEach((a, idx) => {
        const slot = chosen[idx] || chosen[chosen.length - 1];
        let f = 1;
        if (prevA !== null && Math.abs(slot.a - prevA) < 0.9 && prevF === 1) f = 1.5;
        prevA = slot.a; prevF = f;
        const rx = 165 * f + (chosen[idx] ? 0 : 60), ry = 108 * f;
        const w = Math.max(70, textW(a.n, 12) + 26), h = 28;
        const px = e.cx + Math.cos(slot.a) * rx, py = e.cy + Math.sin(slot.a) * ry;
        attrShapes.push({ a, e, px, py, w, h });
      });
    });

    // draw lines first
    attrShapes.forEach((s) => {
      const opt = !s.a.nn && !s.a.pk && !s.a.derived && !s.a.multi;
      out += `<line x1="${s.e.cx}" y1="${s.e.cy}" x2="${s.px}" y2="${s.py}" style="${ST};${opt ? 'stroke-dasharray:5 4' : ''}"/>`;
    });
    rels.forEach((r) => {
      r.list.forEach((e, idx) => {
        if (r.a === r.b) {
          // self relation: two lines to the diamond (rol labels)
          out += `<line x1="${e.cx + e.w / 2}" y1="${e.cy - 8}" x2="${r.cx - r.dw / 2}" y2="${r.cy - 8}" style="${ST}"/>`;
          out += `<line x1="${e.cx + e.w / 2}" y1="${e.cy + 8}" x2="${r.cx}" y2="${r.cy + r.dh / 2}" style="${ST}"/>`;
          return;
        }
        out += `<line x1="${e.cx}" y1="${e.cy}" x2="${r.cx}" y2="${r.cy}" style="${ST}"/>`;
      });
    });
    isas.forEach((i) => {
      out += `<line x1="${i.sup.cx}" y1="${i.sup.cy}" x2="${i.tx}" y2="${i.ty}" style="${ST}"/>`;
      i.subs.forEach((s) => { out += `<line x1="${i.tx}" y1="${i.ty}" x2="${s.cx}" y2="${s.cy}" style="${ST}"/>`; });
    });

    // attribute ovals
    attrShapes.forEach((s) => {
      const a = s.a;
      const dash = a.derived ? 'stroke-dasharray:5 4;' : '';
      out += `<ellipse cx="${s.px}" cy="${s.py}" rx="${s.w / 2}" ry="${s.h / 2}" style="fill:${C.bg};stroke:${C.ink};stroke-width:1.4;${dash}"/>`;
      if (a.multi) out += `<ellipse cx="${s.px}" cy="${s.py}" rx="${s.w / 2 - 4}" ry="${s.h / 2 - 4}" style="fill:none;stroke:${C.ink};stroke-width:1.2"/>`;
      out += `<text x="${s.px}" y="${s.py + 4}" text-anchor="middle" style="font:400 12px sans-serif;fill:${C.ink};${a.pk ? 'text-decoration:underline;font-weight:700' : ''}">${esc(a.n)}</text>`;
    });

    // entities
    spec.entities.forEach((e) => {
      const weak = !!e.weak;
      out += `<rect x="${e.cx - e.w / 2}" y="${e.cy - e.h / 2}" width="${e.w}" height="${e.h}" style="fill:${C.head};stroke:${C.ink};stroke-width:1.8"/>`;
      if (weak) out += `<rect x="${e.cx - e.w / 2 + 5}" y="${e.cy - e.h / 2 + 5}" width="${e.w - 10}" height="${e.h - 10}" style="fill:none;stroke:${C.ink};stroke-width:1.4"/>`;
      out += `<text x="${e.cx}" y="${e.cy + 5}" text-anchor="middle" style="font:700 14px sans-serif;fill:${C.ink}">${esc(e.n)}</text>`;
    });
    // relationships
    const relAttrs = [];
    rels.forEach((r) => {
      const hw = r.dw / 2, hh = r.dh / 2;
      out += `<polygon points="${r.cx},${r.cy - hh} ${r.cx + hw},${r.cy} ${r.cx},${r.cy + hh} ${r.cx - hw},${r.cy}" style="fill:#fff4d6;stroke:${C.ink};stroke-width:1.6"/>`;
      if (r.weakRel) out += `<polygon points="${r.cx},${r.cy - hh + 6} ${r.cx + hw - 10},${r.cy} ${r.cx},${r.cy + hh - 6} ${r.cx - hw + 10},${r.cy}" style="fill:none;stroke:${C.ink};stroke-width:1.2"/>`;
      out += `<text x="${r.cx}" y="${r.cy + 4}" text-anchor="middle" style="font:600 12px sans-serif;fill:${C.ink}">${esc(r.n)}</text>`;
      // relationship attributes
      (r.attrs || []).forEach((a, i) => {
        let ux = 1, uy = 0;
        if (!r.ents && r.a !== r.b) {
          ux = r.list[1].cx - r.list[0].cx; uy = r.list[1].cy - r.list[0].cy;
          const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
        }
        let nx = -uy, ny = ux;
        if (ny < 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
        const side = i % 2 ? -1 : 1, k = 80 + Math.floor(i / 2) * 36;
        const px = r.cx + nx * side * k, py = r.cy + ny * side * k;
        const w = Math.max(70, textW(a.n, 12) + 26);
        relAttrs.push({ px, py, w });
        out = `<line x1="${r.cx}" y1="${r.cy}" x2="${px}" y2="${py}" style="${ST}"/>` + out;
        out += `<ellipse cx="${px}" cy="${py}" rx="${w / 2}" ry="14" style="fill:${C.bg};stroke:${C.ink};stroke-width:1.4"/>`;
        out += `<text x="${px}" y="${py + 4}" text-anchor="middle" style="font:400 12px sans-serif;fill:${C.ink}">${esc(a.n)}</text>`;
      });
      // cardinality labels near each entity
      const lab = (e, card, k) => {
        if (!card) return;
        let dx = r.cx - e.cx, dy = r.cy - e.cy;
        if (r.a === r.b) { dx = 1; dy = k ? 0.6 : -0.6; }
        const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        // start from entity boundary
        const bw = e.w / 2, bh = e.h / 2;
        const t = Math.min(dx ? bw / Math.abs(dx) : 1e9, dy ? bh / Math.abs(dy) : 1e9);
        const x = e.cx + dx * (t + 26) + (-dy) * 12, y = e.cy + dy * (t + 26) + dx * 12;
        out += `<text x="${x}" y="${y + 4}" text-anchor="middle" style="font:700 12px sans-serif;fill:${C.accent}">(${card[0]},${card[1]})</text>`;
      };
      if (!r.ents) { lab(r.list[0], r.ca, 0); lab(r.list[1], r.cb, 1); }
      else if (r.cards) r.list.forEach((e, i) => lab(e, r.cards[i], i));
      // correspondence tag
      if (!r.ents) {
        const nm = r.ca[1] === 'n' && r.cb[1] === 'n';
        const tag = nm ? 'N:M' : (r.ca[1] === 1 && r.cb[1] === 1) ? '1:1' : '1:N';
        out += `<text x="${r.cx + hw * 0.62}" y="${r.cy - hh * 0.62}" text-anchor="start" style="font:700 11px sans-serif;fill:${C.soft}">${tag}</text>`;
      } else {
        out += `<text x="${r.cx + hw * 0.62}" y="${r.cy - hh * 0.62}" text-anchor="start" style="font:700 11px sans-serif;fill:${C.soft}">N:M:P</text>`;
      }
    });
    // isa triangles
    isas.forEach((i) => {
      const tx = i.tx, ty = i.ty;
      const label = (i.g.total ? 'T' : 'P') + (i.g.excl ? ',E' : ',S');
      out += `<polygon points="${tx},${ty - 22} ${tx + 26},${ty + 18} ${tx - 26},${ty + 18}" style="fill:#e8f7ee;stroke:${C.ink};stroke-width:1.6"/>`;
      out += `<text x="${tx}" y="${ty + 12}" text-anchor="middle" style="font:700 10px sans-serif;fill:${C.ink}">es un</text>`;
      out += `<text x="${tx + 38}" y="${ty - 4}" style="font:700 10px sans-serif;fill:${C.soft}">${label}</text>`;
    });

    // bounds
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const grow = (x1, y1, x2, y2) => { minX = Math.min(minX, x1); minY = Math.min(minY, y1); maxX = Math.max(maxX, x2); maxY = Math.max(maxY, y2); };
    spec.entities.forEach((e) => grow(e.cx - e.w / 2, e.cy - e.h / 2, e.cx + e.w / 2, e.cy + e.h / 2));
    attrShapes.forEach((s) => grow(s.px - s.w / 2, s.py - s.h / 2, s.px + s.w / 2, s.py + s.h / 2));
    rels.forEach((r) => grow(r.cx - r.dw / 2, r.cy - r.dh / 2, r.cx + r.dw / 2 + 30, r.cy + r.dh / 2));
    relAttrs.forEach((s) => grow(s.px - s.w / 2, s.py - 14, s.px + s.w / 2, s.py + 14));
    isas.forEach((i) => grow(i.tx - 40, i.ty - 25, i.tx + 60, i.ty + 20));
    const pad = 30;
    const vx = minX - pad, vy = minY - pad, W = maxX - minX + pad * 2, H = maxY - minY + pad * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${W} ${H}" width="${W}" height="${H}" font-family="sans-serif"><rect x="${vx}" y="${vy}" width="${W}" height="${H}" style="fill:${C.bg}"/>${out}</svg>`;
  }

  return { transform, ddl, schemaText, crowSVG, chenSVG, DEFAULT_THEME };
});
