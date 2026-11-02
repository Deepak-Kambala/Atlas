import { cp, G, dist } from '../common';

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise) Simulation Engine
 * 2-Cluster example demonstrating ε-neighborhood circles, Core points, Border points,
 * Noise isolation, and density-connected cluster formation.
 */
export function dbscanEngine(r, epsParam) {
  const eps = typeof epsParam === 'number' ? epsParam : 7.5;
  const MP = 4; // MinPts threshold

  // Define 2 distinct natural clusters + isolated noise points
  // Cluster 1 (Left cluster, centered around x=31, y=50)
  const baseC1 = [
    { x: 28, y: 50 }, { x: 32, y: 52 }, { x: 30, y: 46 }, { x: 34, y: 48 },
    { x: 26, y: 46 }, { x: 31, y: 56 }, { x: 36, y: 53 }, { x: 27, y: 54 },
    { x: 35, y: 44 }, { x: 24, y: 50 }, { x: 38, y: 49 }, { x: 33, y: 40 },
    { x: 22, y: 45 }, { x: 39, y: 57 }, { x: 29, y: 62 }, { x: 42, y: 46 }
  ];

  // Cluster 2 (Right cluster, centered around x=71, y=50)
  const baseC2 = [
    { x: 68, y: 50 }, { x: 72, y: 52 }, { x: 70, y: 46 }, { x: 74, y: 48 },
    { x: 66, y: 46 }, { x: 71, y: 56 }, { x: 76, y: 53 }, { x: 67, y: 54 },
    { x: 75, y: 44 }, { x: 64, y: 50 }, { x: 78, y: 49 }, { x: 73, y: 40 },
    { x: 62, y: 45 }, { x: 79, y: 57 }, { x: 69, y: 62 }, { x: 82, y: 46 }
  ];

  // 5 isolated noise points
  const baseNoise = [
    { x: 12, y: 82 }, { x: 88, y: 85 }, { x: 50, y: 88 }, { x: 15, y: 18 }, { x: 85, y: 16 }
  ];

  // Slight jitter with random seed r for "New Data" variation while preserving structure
  const jitter = (pt, isOutlier) => ({
    x: cp(pt.x + (isOutlier ? G(r) * 1.0 : G(r) * 0.8)),
    y: cp(pt.y + (isOutlier ? G(r) * 1.0 : G(r) * 0.8)),
    c: 5
  });

  const c1 = baseC1.map(p => jitter(p, false));
  const c2 = baseC2.map(p => jitter(p, false));
  const noise = baseNoise.map(p => jitter(p, true));

  const P = [...c1, ...c2, ...noise];
  const N = P.length;

  // 1. Calculate ε-neighborhood for all points
  const nb = P.map(p => P.reduce((acc, q, j) => (dist(p, q) <= eps ? acc.concat(j) : acc), []));

  // 2. Identify Core Points (|N_ε(p)| >= MinPts)
  const core = nb.map(a => a.length >= MP);

  // 3. Density-Connected Components of Core Points
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

  // Identify Border points (not core, but in neighborhood of a core point)
  const isBorder = P.map((p, i) => !core[i] && L[i] >= 0);
  const isNoise = P.map((p, i) => L[i] < 0);

  // Pick representative example indices for the single-circle inspection steps
  const sCore = 1; // Point in Cluster 1 core
  const sBorder = 15; // Perimeter point touching Cluster 1 core
  const sNoise = 34; // Isolated point (50, 88)

  const clusterColors = [1, 2, 0, 4]; // Blue, Green, Orange, Purple

  const S = [];

  // Frame 0: The 2 Clusters & Noise Overview
  S.push({
    t: '1. The Unlabelled Data (2 Clusters + Noise)',
    d: `We have ${N} data points in two natural groups, plus 5 isolated stray points. Standard K-Means would struggle here: it forces every outlier into a cluster and requires guessing K=2 upfront. DBSCAN uses density circles to discover the 2 clusters and isolate noise.`,
    math: `\\text{Parameters: } \\varepsilon = ${eps}, \\quad \\text{MinPts} = ${MP}`,
    pts: P.map(p => ({ ...p, c: 5, big: false, ring: false }))
  });

  // Frame 1: The ε-Neighborhood Circle Explained
  S.push({
    t: '2. The ε-Neighborhood Circle',
    d: `DBSCAN draws a circle of radius ε = ${eps} around each point to count neighbors. A point needs at least MinPts = ${MP} points inside its circle to be considered a dense CORE POINT.`,
    math: `N_\\varepsilon(\\mathbf{p}) = \\{\\mathbf{q} : d(\\mathbf{p}, \\mathbf{q}) \\le \\varepsilon\\}`,
    pts: P.map((p, i) => ({
      ...p,
      c: i === sCore ? 1 : nb[sCore].includes(i) ? 1 : 5,
      big: i === sCore,
      ring: i === sCore
    })),
    circles: [
      { x: P[sCore].x, y: P[sCore].y, rx: eps, ry: eps, col: '--tx', w: 1.0, dash: '2 2' }
    ],
    lines: nb[sCore]
      .filter(j => j !== sCore)
      .map(j => ({
        a: [P[sCore].x, P[sCore].y],
        b: [P[j].x, P[j].y],
        col: '--p1',
        w: 0.35,
        dash: '1.5 1.5'
      }))
  });

  // Frame 2: Core Point Marked
  S.push({
    t: '3. Core Point: Dense Neighborhood',
    d: `This green point has ${nb[sCore].length} points inside its circle (≥ MinPts = ${MP}). Because its neighborhood is dense, DBSCAN marks it as a CORE POINT. Core points form the internal backbone of clusters.`,
    math: `|N_\\varepsilon(\\mathbf{p})| = ${nb[sCore].length} \\ge ${MP} \\implies \\text{Core Point}`,
    pts: P.map((p, i) => ({
      ...p,
      c: i === sCore ? 2 : nb[sCore].includes(i) ? 2 : 5,
      big: i === sCore,
      ring: i === sCore
    })),
    circles: [
      { x: P[sCore].x, y: P[sCore].y, rx: eps, ry: eps, col: '--p2', w: 1.2 }
    ],
    lines: nb[sCore]
      .filter(j => j !== sCore)
      .map(j => ({
        a: [P[sCore].x, P[sCore].y],
        b: [P[j].x, P[j].y],
        col: '--p2',
        w: 0.4
      }))
  });

  // Frame 3: Border Point Marked
  const borderTouchingCore = nb[sBorder].filter(j => core[j]);
  S.push({
    t: '4. Border Point: Edge of the Cluster',
    d: `This amber point on the perimeter has only ${nb[sBorder].length} points in its circle (< ${MP}, so it cannot be a core point). But it touches a Core Point! Because it is within reach of a core point, it is marked as a BORDER POINT.`,
    math: `|N_\\varepsilon(\\mathbf{p})| = ${nb[sBorder].length} < ${MP} \\ \\land \\ \\text{touches Core} \\implies \\text{Border Point}`,
    pts: P.map((p, i) => ({
      ...p,
      c: i === sBorder ? 3 : core[i] ? 2 : 5,
      big: i === sBorder,
      ring: i === sBorder,
      h: i === sBorder
    })),
    circles: [
      { x: P[sBorder].x, y: P[sBorder].y, rx: eps, ry: eps, col: '--p3', w: 1.1, dash: '2 1.5' }
    ],
    lines: borderTouchingCore.map(j => ({
      a: [P[sBorder].x, P[sBorder].y],
      b: [P[j].x, P[j].y],
      col: '--p3',
      w: 0.6,
      dash: '2 2'
    }))
  });

  // Frame 4: Noise Point Marked
  S.push({
    t: '5. Noise Point: Isolated Outlier',
    d: `This distant point has only ${nb[sNoise].length} point in its circle (itself, < ${MP}), and NO core points anywhere near it. DBSCAN labels it as NOISE / OUTLIER instead of forcing it into a cluster.`,
    math: `|N_\\varepsilon(\\mathbf{p})| = 1 < ${MP} \\ \\land \\ \\text{no Core} \\implies \\text{Noise}`,
    pts: P.map((p, i) => ({
      ...p,
      c: i === sNoise ? 6 : core[i] ? 2 : isBorder[i] ? 3 : 5,
      big: i === sNoise,
      ring: i === sNoise,
      h: isBorder[i]
    })),
    circles: [
      { x: P[sNoise].x, y: P[sNoise].y, rx: eps, ry: eps, col: '--p6', w: 1.1, dash: '2 2' }
    ]
  });

  // Frame 5: All Points Classified (Core, Border, Noise)
  const coreCount = core.filter(Boolean).length;
  const borderCount = isBorder.filter(Boolean).length;
  const noiseCount = isNoise.filter(Boolean).length;

  S.push({
    t: '6. All Points Classified (Core, Border, Noise)',
    d: `Every point in the dataset is now categorized: Green = Core points (dense interiors). Amber hollow rings = Border points (cluster boundaries). Red = Noise (isolated outliers). Next, DBSCAN connects the core points to form the clusters.`,
    math: `\\text{Classification: } ${coreCount} \\text{ Core}, \\ ${borderCount} \\text{ Border}, \\ ${noiseCount} \\text{ Noise}`,
    pts: P.map((p, i) => ({
      ...p,
      c: core[i] ? 2 : isBorder[i] ? 3 : 6,
      big: core[i] || isNoise[i],
      h: isBorder[i]
    }))
  });

  // Frame 6: Grow Cluster 1 (Left Cluster)
  const c1CoreLines = [];
  c1.forEach((_, i) => {
    if (!core[i]) return;
    nb[i].forEach(j => {
      if (j > i && core[j] && j < c1.length) {
        c1CoreLines.push({
          a: [P[i].x, P[i].y],
          b: [P[j].x, P[j].y],
          col: '--p1',
          w: 0.35
        });
      }
    });
  });

  S.push({
    t: '7. Grow Cluster 1: Density-Reachable Chain',
    d: `Starting at a core point in the left group, DBSCAN hops through overlapping ε-circles to connect density-reachable core points, and pulls in the touching border points. Cluster 1 is fully formed!`,
    math: `\\text{Cluster 1 Formed: } ${c1.length} \\text{ points}`,
    pts: P.map((p, i) => {
      if (i < c1.length) {
        return { ...p, c: 1, big: core[i], h: isBorder[i] };
      }
      return {
        ...p,
        c: core[i] ? 2 : isBorder[i] ? 3 : 6,
        big: core[i] || isNoise[i],
        h: isBorder[i]
      };
    }),
    lines: c1CoreLines
  });

  // Frame 7: Grow Cluster 2 (Right Cluster)
  const c2CoreLines = [];
  c2.forEach((_, idx) => {
    const i = idx + c1.length;
    if (!core[i]) return;
    nb[i].forEach(j => {
      if (j > i && core[j] && j < c1.length + c2.length) {
        c2CoreLines.push({
          a: [P[i].x, P[i].y],
          b: [P[j].x, P[j].y],
          col: '--p2',
          w: 0.35
        });
      }
    });
  });

  S.push({
    t: '8. Grow Cluster 2: Second Density Region',
    d: `DBSCAN jumps to an unvisited core point in the right group. Because the gap between Group 1 and Group 2 exceeds ε = ${eps}, the circles do not touch and the clusters stay distinct. Cluster 2 is fully formed!`,
    math: `\\text{Cluster 2 Formed: } ${c2.length} \\text{ points}`,
    pts: P.map((p, i) => {
      if (i < c1.length) {
        return { ...p, c: 1, big: core[i], h: isBorder[i] };
      } else if (i < c1.length + c2.length) {
        return { ...p, c: 2, big: core[i], h: isBorder[i] };
      }
      return { ...p, c: 6, big: true };
    }),
    lines: [...c1CoreLines, ...c2CoreLines]
  });

  // Frame 8: Final Clustered Result (2 Clusters + Isolated Noise)
  S.push({
    t: '9. Final Clustering: 2 Clusters + Noise Isolated',
    d: `Both clusters are cleanly discovered! The border points are safely attached to their clusters, while the 5 red noise points remain isolated outliers. DBSCAN discovered the 2 natural clusters with zero contamination.`,
    math: `\\text{Result: } 2 \\text{ Clusters Discovered} + 5 \\text{ Noise Outliers Isolated}`,
    pts: P.map((p, i) => {
      if (L[i] === 0) {
        return { ...p, c: 1, big: core[i], h: isBorder[i] };
      } else if (L[i] === 1) {
        return { ...p, c: 2, big: core[i], h: isBorder[i] };
      }
      return { ...p, c: 6, big: true };
    })
  });

  // Sorted k-distance diagnostic curve
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
  pm: ['ε (eps)', 4, 12, 7.5],
  i: 'Grows clusters from dense regions and flags outliers as noise.'
};
