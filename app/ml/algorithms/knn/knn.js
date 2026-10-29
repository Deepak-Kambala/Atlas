import { blobs, dist } from '../common';

/**
 * k-Nearest Neighbors (KNN) Simulation Engine
 * Instance-based learning: classifies queries by majority vote of the k closest neighbors.
 */
export function knnEngine(r, k) {
  const P = blobs(r, [[25, 30], [72, 30], [50, 75]], 18, 10);
  const q = { x: 35 + r() * 30, y: 35 + r() * 30, c: 5, big: 1 };

  const D = P.map(p => ({ p, d: dist(p, q) })).sort((a, b) => a.d - b.d);
  const N = D.slice(0, k);
  const v = [0, 0, 0];
  N.forEach(n => v[n.p.c]++);
  const win = v.indexOf(Math.max(...v));
  const nm = ['orange', 'blue', 'green'];

  const cls = (x, y) => {
    const t = [0, 0, 0];
    P.map(p => ({ c: p.c, d: Math.hypot(p.x - x, p.y - y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .forEach(n => t[n.c]++);
    const m = Math.max(...t);
    return [t.indexOf(m), m / k];
  };

  const S = [
    {
      t: 'The data',
      d: 'Three labelled classes. A new unlabelled point (large, grey) arrives. KNN has no training phase: it simply stores the data and looks at neighbours when asked.',
      pts: [...P, q]
    },
    {
      t: 'Measure every distance',
      d: 'Compute the straight-line (Euclidean) distance from the new point to every stored point.',
      pts: [...P, q],
      lines: P.map(p => ({ a: [p.x, p.y], b: [q.x, q.y], col: '--mu', w: 0.15 }))
    },
    {
      t: `Pick the ${k} nearest`,
      d: `Keep only the k = ${k} closest points. The circle reaches the k-th neighbour. Change k with the slider to see the effect.`,
      pts: [...P, q],
      lines: N.map(n => ({ a: [n.p.x, n.p.y], b: [q.x, q.y], col: '--p' + n.p.c, w: 0.7 })),
      circles: [{ x: q.x, y: q.y, rx: N[k - 1].d, ry: N[k - 1].d, col: '--tx' }]
    },
    {
      t: 'Neighbours vote',
      d: `Votes: orange ${v[0]}, blue ${v[1]}, green ${v[2]}. The majority wins, so the new point is classified as ${nm[win]}.`,
      pts: [...P, { ...q, c: win }],
      lines: N.map(n => ({ a: [n.p.x, n.p.y], b: [q.x, q.y], col: '--p' + n.p.c, w: 0.7 }))
    },
    {
      t: 'Decision regions',
      d: 'Repeating this vote at every location paints the decision regions. Small k gives jagged, over-fitted borders; large k gives smooth ones that may blur small classes.',
      pts: [...P, { ...q, c: win }],
      field: cls
    }
  ];

  const loo = kk => {
    let e = 0;
    P.forEach((p, i) => {
      const t = [0, 0, 0];
      P.map((o, j) => ({ c: o.c, d: j === i ? 1e9 : dist(p, o) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, kk)
        .forEach(n => t[n.c]++);
      if (t.indexOf(Math.max(...t)) !== p.c) e++;
    });
    return e / P.length;
  };

  S.curve = {
    t: 'Leave-one-out error vs k',
    xl: 'k',
    yl: 'error rate',
    x: Array.from({ length: 15 }, (_, i) => i + 1),
    s: [{ n: 'error', y: Array.from({ length: 15 }, (_, i) => loo(i + 1)) }],
    hi: k
  };

  return S;
}

export const knn = {
  slug: 'knn',
  n: 'k-Nearest Neighbours',
  g: 'Supervised',
  gen: knnEngine,
  pm: ['k', 1, 15, 5],
  i: 'Classifies a point by a vote among its k closest labelled points.'
};
