import { cp, G, dist } from './common';

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise) Simulation Engine
 * Discovers clusters of arbitrary shape based on density connectivity and isolates noise.
 */
export function dbscanEngine(r, eps) {
  const P = [], MP = 4;
  for (let i = 0; i < 36; i++) {
    const t = (Math.PI * i) / 35;
    P.push({
      x: cp(35 + 25 * Math.cos(t) + G(r) * 1.8),
      y: cp(42 + 25 * Math.sin(t) + G(r) * 1.8),
      c: 5
    });
    P.push({
      x: cp(62 + 25 * Math.cos(t) + G(r) * 1.8),
      y: cp(58 - 25 * Math.sin(t) + G(r) * 1.8),
      c: 5
    });
  }
  for (let i = 0; i < 8; i++) {
    P.push({ x: cp(5 + r() * 90), y: cp(5 + r() * 90), c: 5 });
  }

  const nb = P.map(p => P.reduce((a, q, j) => (dist(p, q) <= eps ? a.concat(j) : a), []));
  const core = nb.map(a => a.length >= MP);
  const L = P.map(() => -1);
  let nc = 0;

  core.forEach((c, i) => {
    if (!c || L[i] >= 0) return;
    const q = [i];
    L[i] = nc;
    while (q.length) {
      const u = q.shift();
      if (!core[u]) continue;
      nb[u].forEach(v => {
        if (L[v] < 0) {
          L[v] = nc;
          q.push(v);
        }
      });
    }
    nc++;
  });

  const CC = [0, 1, 3, 2];
  const paint = u =>
    P.map((p, i) => (L[i] >= 0 && L[i] <= u ? { ...p, c: CC[L[i] % 4], h: !core[i] } : { ...p, c: 5 }));

  const s0 = Math.max(0, core.indexOf(true));
  const sz = j => L.filter(v => v === j).length;

  const S = [
    {
      t: 'The data',
      d: 'Unlabelled points in two interlocking crescents plus a few random stray points. K-Means would struggle with this shape.',
      pts: P
    },
    {
      t: 'The ε-neighbourhood',
      d: `DBSCAN asks one question per point: how many neighbours lie within distance ε = ${eps} (the circle)? This point has ${
        nb[s0].length
      }. With at least ${MP} neighbours it is a core point. Change ε with the slider.`,
      pts: P.map((p, i) => ({ ...p, c: nb[s0].includes(i) ? 1 : 5 })),
      circles: [{ x: P[s0].x, y: P[s0].y, rx: eps, ry: eps, col: '--tx' }]
    },
    {
      t: 'Core, border, noise',
      d: 'Green = core (dense neighbourhood). Amber rings = border (near a core point but not dense themselves). Red = noise (isolated).',
      pts: P.map((p, i) => ({ ...p, c: core[i] ? 2 : L[i] >= 0 ? 4 : 6, h: !core[i] && L[i] >= 0 }))
    }
  ];

  for (let j = 0; j < nc; j++) {
    S.push({
      t: `Grow cluster ${j + 1}`,
      d: `Start at an unvisited core point, add all its neighbours, and keep spreading through core points. This cluster now has ${sz(
        j
      )} points. It can follow any shape.`,
      pts: paint(j)
    });
  }

  S.push({
    t: 'Noise left over',
    d: `Final result: ${nc} cluster${
      nc !== 1 ? 's' : ''
    }, found without choosing K. Red points have too few neighbours to join any cluster, so DBSCAN labels them noise instead of forcing them in.`,
    pts: paint(nc).map((p, i) => (L[i] < 0 ? { ...p, c: 6 } : p))
  });

  const kd = P.map(p => P.map(o => dist(p, o)).sort((a, b) => a - b)[MP - 1]).sort((a, b) => a - b);
  S.curve = {
    t: 'Sorted k-distance plot (k = 4)',
    xl: 'points, sorted by distance',
    yl: 'distance to 4th nearest',
    x: kd.map((_, i) => i),
    s: [{ n: 'k-distance', y: kd }],
    hi: eps,
    hy: 1
  };

  return S;
}

export const dbscan = {
  slug: 'dbscan',
  n: 'DBSCAN',
  g: 'Unsupervised',
  gen: dbscanEngine,
  pm: ['ε (eps)', 4, 12, 7],
  i: 'Grows clusters from dense regions and flags outliers as noise.'
};
