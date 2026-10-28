import { blobs, dist } from './common';

/**
 * Hierarchical Clustering Simulation Engine
 * Supports Agglomerative bottom-up (Single, Complete, Average Linkage)
 * and Divisive top-down clustering strategies.
 */
export function hierEngine(r, linkageParam = 1) {
  const mode = Math.max(1, Math.min(4, Math.round(linkageParam || 1)));
  const modeNames = {
    1: 'Single Linkage (Min Distance)',
    2: 'Complete Linkage (Max Distance)',
    3: 'Average Linkage (Mean Distance)',
    4: 'Divisive Top-Down (Recursive Bisection)'
  };

  const P = blobs(r, [[24, 30], [68, 26], [50, 76]], 5, 8).map(p => ({ ...p, c: 5 }));

  // Mode 4: Divisive Top-Down Clustering
  if (mode === 4) {
    let clusters = [P.map((_, i) => i)];
    const S = [
      {
        t: 'Divisive Top-Down (All in 1 Cluster)',
        d: `Divisive clustering begins with the entire dataset in a single cluster and iteratively bisects the cluster with the largest diameter. Mode: ${modeNames[mode]}.`,
        pts: P.map(p => ({ ...p, c: 0 })),
        texts: [{ x: 50, y: 94, text: 'Top-down: 1 Root Cluster', col: '--mu', size: 3.2 }]
      }
    ];

    while (clusters.length < P.length) {
      // Find cluster with largest diameter
      let worstClusterIdx = 0, maxDiam = -1;
      clusters.forEach((cl, idx) => {
        if (cl.length <= 1) return;
        let dMax = 0;
        for (let i = 0; i < cl.length; i++) {
          for (let j = i + 1; j < cl.length; j++) {
            dMax = Math.max(dMax, dist(P[cl[i]], P[cl[j]]));
          }
        }
        if (dMax > maxDiam) {
          maxDiam = dMax;
          worstClusterIdx = idx;
        }
      });

      if (maxDiam <= 0) break;

      const target = clusters[worstClusterIdx];
      // Bisect by finding the two furthest points in target
      let seedA = target[0], seedB = target[1], maxD = -1;
      for (let i = 0; i < target.length; i++) {
        for (let j = i + 1; j < target.length; j++) {
          const d = dist(P[target[i]], P[target[j]]);
          if (d > maxD) {
            maxD = d;
            seedA = target[i];
            seedB = target[j];
          }
        }
      }

      const partA = [seedA], partB = [seedB];
      target.forEach(idx => {
        if (idx === seedA || idx === seedB) return;
        if (dist(P[idx], P[seedA]) < dist(P[idx], P[seedB])) partA.push(idx);
        else partB.push(idx);
      });

      clusters.splice(worstClusterIdx, 1, partA, partB);

      const colorMap = P.map(() => 5);
      clusters.forEach((cl, cIdx) => {
        cl.forEach(i => (colorMap[i] = cIdx % 5));
      });

      S.push({
        t: `Divisive Split: ${clusters.length} Clusters`,
        v: maxDiam,
        x: S.length,
        d: `Split cluster of diameter ${maxDiam.toFixed(1)} into two subgroups. Total clusters: ${clusters.length}.`,
        pts: P.map((p, i) => ({ ...p, c: colorMap[i] })),
        texts: [{ x: 50, y: 94, text: `Clusters: ${clusters.length}`, col: '--mu', size: 3 }]
      });
    }

    return S;
  }

  // Modes 1-3: Agglomerative Bottom-Up (Single, Complete, Average)
  let CL = P.map((_, i) => [i]);
  const links = [];

  const calcDist = (clA, clB) => {
    const pairDists = [];
    clA.forEach(a => {
      clB.forEach(b => {
        pairDists.push(dist(P[a], P[b]));
      });
    });

    if (mode === 1) return Math.min(...pairDists); // Single
    if (mode === 2) return Math.max(...pairDists); // Complete
    return pairDists.reduce((s, v) => s + v, 0) / pairDists.length; // Average
  };

  const col = () => {
    const c = P.map(() => 5);
    CL.forEach((m, cIdx) => {
      if (m.length > 1) m.forEach(i => (c[i] = cIdx % 5));
    });
    return P.map((p, i) => ({ ...p, c: c[i] }));
  };

  const S = [
    {
      t: '1. The Dataset (Bottom-Up)',
      d: `Agglomerative hierarchical clustering begins with every sample as an individual cluster, then successively merges the closest pair. Active strategy: ${modeNames[mode]}.`,
      pts: P,
      texts: [{ x: 50, y: 94, text: modeNames[mode], col: '--mu', size: 3.2 }]
    }
  ];

  while (CL.length > 1) {
    let bestDist = Infinity, bestI = 0, bestJ = 1;
    for (let i = 0; i < CL.length; i++) {
      for (let j = i + 1; j < CL.length; j++) {
        const d = calcDist(CL[i], CL[j]);
        if (d < bestDist) {
          bestDist = d;
          bestI = i;
          bestJ = j;
        }
      }
    }

    // Connect representative points for visualization
    const ptA = P[CL[bestI][0]];
    const ptB = P[CL[bestJ][0]];
    links.push({ a: [ptA.x, ptA.y], b: [ptB.x, ptB.y], col: '--tx', w: 0.5 });

    CL[bestI] = CL[bestI].concat(CL[bestJ]);
    CL.splice(bestJ, 1);
    const n = CL.length;

    S.push({
      t: `Merge ${S.length}: Distance ${bestDist.toFixed(1)}`,
      v: bestDist,
      x: S.length,
      d:
        `Joined two closest clusters with ${modeNames[mode]} gap = ${bestDist.toFixed(1)}. ${n} cluster${
          n > 1 ? 's' : ''
        } remaining.` +
        (n === 3 ? ' Reached the 3 natural foundational groups before major cross-cluster merges.' : '') +
        (n === 1 ? ' All samples merged into root. The sequence of heights builds the dendrogram.' : ''),
      pts: col(),
      lines: links.map((l, k) => (k === links.length - 1 ? { ...l, w: 1.4, col: '--ac' } : l)),
      texts: [{ x: 50, y: 94, text: `${n} clusters remaining`, col: '--mu', size: 3 }]
    });
  }

  return S;
}

export const hierarchicalClustering = {
  slug: 'hierarchical-clustering',
  n: 'Hierarchical Clustering',
  g: 'Unsupervised',
  gen: hierEngine,
  pm: ['Linkage (1:Single, 2:Complete, 3:Average, 4:Divisive)', 1, 4, 1],
  i: 'Builds nested clusters bottom-up or top-down with selectable linkage.'
};
