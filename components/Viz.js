'use client';
import React, { useMemo } from 'react';
const h = React.createElement;

export default function Viz({ f }) {
  const fld = useMemo(() => {
    if (!f.field) return null;
    const o = [];
    for (let i = 0; i < 25; i++)
      for (let j = 0; j < 25; j++) {
        const x = i * 4,
          y = j * 4,
          [k, s] = f.field(x + 2, y + 2);
        o.push(
          h('rect', {
            key: i * 25 + j,
            x,
            y: 96 - y,
            width: 4.05,
            height: 4.05,
            style: { fill: `var(--p${k})`, opacity: 0.07 + 0.3 * s }
          })
        );
      }
    return o;
  }, [f]);

  const st = (c, w, d) => ({
    stroke: `var(${c || '--mu'})`,
    strokeWidth: w || 0.4,
    strokeDasharray: d,
    fill: 'none'
  });

  return h(
    'svg',
    { viewBox: '-2 -2 104 104', role: 'img', 'aria-label': f.t },
    h('rect', {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      style: { fill: 'none', stroke: 'var(--bd)', strokeWidth: 0.5 }
    }),
    fld,
    [25, 50, 75].map(v =>
      h(
        'g',
        { key: v, style: { stroke: 'var(--bd)', strokeWidth: 0.15 } },
        h('line', { x1: v, y1: 0, x2: v, y2: 100 }),
        h('line', { x1: 0, y1: v, x2: 100, y2: v })
      )
    ),
    h(
      'g',
      { key: f.t, className: 'fadein' },
      (f.polys || []).map((py, i) =>
        h('polygon', {
          key: 'py' + i,
          points: py.pts.map(pt => `${pt[0]},${100 - pt[1]}`).join(' '),
          style: {
            fill: py.fill ? `var(${py.fill})` : py.rawFill || 'none',
            stroke: py.col ? `var(${py.col})` : undefined,
            strokeWidth: py.w || 0.4,
            opacity: py.opacity ?? 1
          }
        })
      ),
      (f.rects || []).map((r, i) =>
        h('rect', {
          key: 'r' + i,
          x: r.x,
          y: 100 - (r.y + r.h),
          width: r.w,
          height: r.h,
          rx: r.rx || 0,
          style: {
            fill: r.fill ? `var(${r.fill})` : r.rawFill || 'none',
            stroke: r.col ? `var(${r.col})` : undefined,
            strokeWidth: r.sw || 0.4,
            opacity: r.opacity ?? 1
          }
        })
      ),
      (f.lines || []).map((l, i) =>
        h('line', {
          key: 'l' + i,
          x1: l.a[0],
          y1: 100 - l.a[1],
          x2: l.b[0],
          y2: 100 - l.b[1],
          style: st(l.col, l.w, l.dash)
        })
      ),
      (f.circles || []).map((c, i) =>
        h('ellipse', {
          key: 'e' + i,
          cx: c.x,
          cy: 100 - c.y,
          rx: c.rx,
          ry: c.ry,
          style: c.fill
            ? {
                fill: `var(${c.fill})`,
                stroke: `var(${c.col || '--mu'})`,
                strokeWidth: c.w || 0.6,
                opacity: c.opacity ?? 1
              }
            : st(c.col, c.w || 0.6, c.dash || '2 1.5')
        })
      ),
      (f.texts || []).map((t, i) =>
        h(
          'text',
          {
            key: 't' + i,
            x: t.x,
            y: 100 - t.y,
            textAnchor: t.anchor || 'middle',
            dominantBaseline: t.baseline || 'middle',
            style: {
              fill: t.col ? `var(${t.col})` : t.rawCol || 'var(--tx)',
              fontSize: t.size || 3,
              fontFamily: 'var(--mono)',
              fontWeight: t.weight || 600,
              opacity: t.opacity ?? 1
            }
          },
          t.text
        )
      )
    ),
    (f.pts || []).map((p, i) =>
      h(
        'g',
        {
          key: 'p' + i,
          className: 'pt',
          style: { transform: `translate(${p.x}px,${100 - p.y}px)` }
        },
        h('circle', {
          r: p.r || (p.big ? 2.8 : 1.7),
          style: p.h
            ? { fill: 'var(--cd)', stroke: `var(--p${p.c})`, strokeWidth: 0.6 }
            : {
                fill: `var(--p${p.c})`,
                stroke: p.big ? 'var(--tx)' : 'var(--cd)',
                strokeWidth: p.big ? 0.5 : 0.25
              }
        }),
        p.ring && h('circle', { r: 3.2, style: st('--tx', 0.4) })
      )
    )
  );
}
