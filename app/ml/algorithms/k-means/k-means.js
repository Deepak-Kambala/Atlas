import { blobs, dist, mean } from '../common';

/**
 * K-Means Clustering Simulation Engine
 * Alternates between Voronoi assignment to nearest centroids and centroid coordinate updates to minimize inertia.
 */
export function kmeansEngine(r, K) {
  const P = blobs(r, [[24, 28], [70, 30], [48, 74]], 20, 9);
  const g = P.map(p => ({ ...p, c: 5 }));
  let C = [];
  const ids = new Set();
  while (C.length < K) {
    const i = Math.floor(r() * P.length);
    if (!ids.has(i)) {
      ids.add(i);
      C.push({ x: P[i].x, y: P[i].y });
    }
  }

  const cen = c => c.map((o, k) => ({ x: o.x, y: o.y, c: k, big: 1 }));
  const S = [
    {
      t: 'The data',
      d: `Unlabelled points: there are no answers to learn from. K-Means will try to discover K = ${K} groups on its own.`,
      pts: g
    },
    {
      t: 'Pick starting centroids',
      d: `Choose ${K} random data points as the first centroids (large dots). A different random start can give a different result, so try “New data”.`,
      pts: [...g, ...cen(C)]
    }
  ];

  let prev = '';
  for (let it = 1; it <= 12; it++) {
    const as = P.map(p => ({
      ...p,
      c: C.map((o, k) => [dist(p, o), k]).sort((a, b) => a[0] - b[0])[0][1]
    }));
    const key = as.map(p => p.c).join('');
    const inr = as.reduce((s, p) => s + dist(p, C[p.c]) ** 2, 0);

    if (key === prev) {
      S.push({
        t: 'Converged',
        v: inr,
        x: it,
        d: `Assignments did not change, so the centroids would not move either. Final inertia (sum of squared distances) = ${Math.round(
          inr
        )}. K-Means always stops, but maybe at a local optimum.`,
        pts: [...as, ...cen(C)]
      });
      break;
    }

    S.push({
      t: `Round ${it}: assign`,
      v: inr,
      x: it,
      d: `Every point joins its nearest centroid and takes its colour. Inertia (sum of squared distances to centroids) = ${Math.round(
        inr
      )}.`,
      pts: [...as, ...cen(C)],
      lines: as.map(p => ({
        a: [p.x, p.y],
        b: [C[p.c].x, C[p.c].y],
        col: '--p' + p.c,
        w: 0.25
      }))
    });

    const NC = C.map((o, k) => {
      const m = as.filter(p => p.c === k);
      return m.length ? { x: mean(m.map(p => p.x)), y: mean(m.map(p => p.y)) } : o;
    });

    S.push({
      t: `Round ${it}: update`,
      d: 'Each centroid moves to the average position of the points assigned to it (white lines show the move). Then we assign again.',
      pts: [...as, ...cen(NC)],
      lines: C.map((o, k) => ({
        a: [o.x, o.y],
        b: [NC[k].x, NC[k].y],
        col: '--tx',
        w: 1.2
      }))
    });

    prev = key;
    C = NC;
  }

  return S;
}

export const kmeans = {
  slug: 'k-means',
  n: 'K-Means',
  g: 'Unsupervised',
  gen: kmeansEngine,
  pm: ['K', 2, 5, 3],
  i: 'Splits data into K groups around moving centroids.'
};
