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
      t: 'Unlabeled Data',
      d: `We start with unlabelled observations scattered in feature space. Without any target labels, K-Means will discover K = ${K} natural clusters purely by analyzing the spatial distances between points.`,
      pts: g
    },
    {
      t: 'Initialize Starting Centroids',
      d: `Pick ${K} random data points to serve as our initial centroids (represented by the larger dots). Centroid placement is crucial: different random seeds can lead to completely different clusterings.`,
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
        t: 'Convergence Reached',
        v: inr,
        x: it,
        d: `Points did not switch clusters between rounds, so the centroids remain stationary. The iterative process has completed. Final inertia (sum of squared distances to centroids) = ${Math.round(
          inr
        )}.`,
        math: 'J = \\sum_{k=1}^{K} \\sum_{\\mathbf{x} \\in C_k} \\lVert\\mathbf{x} - \\boldsymbol{\\mu}_k\\rVert^2',
        pts: [...as, ...cen(C)]
      });
      break;
    }

    S.push({
      t: `Round ${it}: Assign Points to Closest Centroid`,
      v: inr,
      x: it,
      d: `Every point measures its Euclidean distance to all ${K} centroids and joins whichever one is closest, adopting its cluster color. Total squared distance (inertia) is currently ${Math.round(
        inr
      )}.`,
      math: 'C_k = \\{\\mathbf{x} : \\lVert\\mathbf{x} - \\boldsymbol{\\mu}_k\\rVert \\le \\lVert\\mathbf{x} - \\boldsymbol{\\mu}_j\\rVert \\quad \\forall j\\}',
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
      t: `Round ${it}: Move Centroids to Cluster Averages`,
      d: 'Now that clusters are assigned, each centroid moves to the average position of the points belonging to it. The white tracking lines show how far each centroid shifted.',
      math: '\\boldsymbol{\\mu}_k = \\frac{1}{|C_k|} \\sum_{\\mathbf{x} \\in C_k} \\mathbf{x}',
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
  pm: ['K', 1, 6, 3],
  i: 'Splits data into K groups around moving centroids.'
};
