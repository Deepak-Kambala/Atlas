import { blobs, dist } from './common';

/**
 * Agglomerative Hierarchical Clustering Simulation Engine
 * Bottom-up clustering that iteratively merges the closest pair of clusters using single linkage.
 */
export function hierEngine(r) {
  const P = blobs(r, [[24, 30], [68, 26], [50, 76]], 5, 8).map(p => ({ ...p, c: 5 }));
  let CL = P.map((_, i) => [i]);
  const links = [];

  const col = () => {
    const c = P.map(() => 5);
    CL.forEach(m => {
      if (m.length > 1) m.forEach(i => (c[i] = Math.min(...m) % 5));
    });
    return P.map((p, i) => ({ ...p, c: c[i] }));
  };

  const S = [
    {
      t: 'The data',
      d: 'Unlabelled points. Agglomerative clustering starts with every point as its own cluster, then repeatedly merges the two closest clusters.',
      pts: P
    }
  ];

  while (CL.length > 1) {
    let B = null;
    for (let i = 0; i < CL.length; i++) {
      for (let j = i + 1; j < CL.length; j++) {
        CL[i].forEach(a =>
          CL[j].forEach(b => {
            const d = dist(P[a], P[b]);
            if (!B || d < B.d) B = { i, j, a, b, d };
          })
        );
      }
    }

    links.push({ a: [P[B.a].x, P[B.a].y], b: [P[B.b].x, P[B.b].y], col: '--tx', w: 0.5 });
    CL[B.i] = CL[B.i].concat(CL[B.j]);
    CL.splice(B.j, 1);
    const n = CL.length;

    S.push({
      t: `Merge ${S.length}`,
      v: B.d,
      x: S.length,
      d:
        `The two closest clusters join (gap ${B.d.toFixed(1)}, measured between their nearest members: “single linkage”). ${n} cluster${
          n > 1 ? 's' : ''
        } left.` +
        (n === 3 ? ' These are the 3 natural groups. The next merges must bridge big gaps.' : '') +
        (n === 1
          ? ' Everything is one cluster. The full merge history is the dendrogram; cutting it at any height gives that many clusters.'
          : ''),
      pts: col(),
      lines: links.map((l, k) => (k === links.length - 1 ? { ...l, w: 1.4, col: '--ac' } : l))
    });
  }

  return S;
}

export const hierarchicalClustering = {
  slug: 'hierarchical-clustering',
  n: 'Hierarchical',
  g: 'Unsupervised',
  gen: hierEngine,
  i: 'Builds clusters bottom-up by merging the closest pair each time.'
};
