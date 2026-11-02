import { cp, G, dist } from '../common';

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
 * Theoretical foundations from Ester, Kriegel, Sander, Xu (KDD 1996) and Schubert et al. (ACM TODS 2017).
 *
 * Key Concepts:
 * 1. ε-Neighborhood: N_ε(p) = { q ∈ D | dist(p, q) ≤ ε }
 * 2. Core Point: |N_ε(p)| ≥ MinPts
 * 3. Border Point: |N_ε(p)| < MinPts, but falls in N_ε of some Core point
 * 4. Noise Point: Neither Core nor Border
 * 5. Direct Density-Reachability: p is directly density-reachable from q iff p ∈ N_ε(q) and q is Core (asymmetric)
 * 6. Density-Reachability: Transitive chain of directly density-reachable points (asymmetric for border points)
 * 7. Density-Connectivity: p and q are density-connected iff ∃ o such that o ~> p and o ~> q (symmetric equivalence relation)
 * 8. Parameter Selection (§4.2 of Ester et al.): Sorted k-distance plot knee determines optimal ε
 */

// 1. StatQuest 74-point Reference Coordinates
export const STATQUEST_C1_BLOB = [
  { x: 35, y: 72 }, { x: 39, y: 74 }, { x: 43, y: 76 }, { x: 47, y: 75 }, { x: 51, y: 74 }, { x: 55, y: 75 }, { x: 59, y: 76 },
  { x: 34, y: 66 }, { x: 38, y: 68 }, { x: 42, y: 70 }, { x: 46, y: 69 }, { x: 50, y: 69 }, { x: 54, y: 68 }, { x: 58, y: 68 },
  { x: 36, y: 60 }, { x: 40, y: 62 }, { x: 44, y: 64 }, { x: 48, y: 63 }, { x: 52, y: 62 }, { x: 56, y: 62 }, { x: 58, y: 58 },
  { x: 34, y: 54 }, { x: 38, y: 55 }, { x: 42, y: 57 }, { x: 46, y: 56 }, { x: 50, y: 56 }, { x: 54, y: 55 },
  { x: 32, y: 48 }, { x: 36, y: 49 }, { x: 40, y: 50 }, { x: 44, y: 49 }, { x: 47, y: 48 }
];

export const STATQUEST_C1_TAIL = [
  { x: 49, y: 42 }, { x: 52, y: 45 },
  { x: 53, y: 38 }, { x: 56, y: 40 }, { x: 58, y: 43 },
  { x: 57, y: 33 }, { x: 60, y: 36 }, { x: 63, y: 38 },
  { x: 61, y: 28 }, { x: 64, y: 31 }, { x: 68, y: 34 }, { x: 72, y: 35 }, { x: 76, y: 34 },
  { x: 66, y: 24 }, { x: 70, y: 27 }, { x: 74, y: 29 }, { x: 78, y: 29 }, { x: 82, y: 30 },
  { x: 72, y: 21 }, { x: 76, y: 23 }, { x: 80, y: 24 }
];

export const STATQUEST_C2 = [
  { x: 74, y: 73 }, { x: 78, y: 70 }, { x: 82, y: 70 },
  { x: 70, y: 69 }, { x: 74, y: 67 }, { x: 78, y: 65 }, { x: 81, y: 64 },
  { x: 68, y: 63 }, { x: 72, y: 62 }, { x: 76, y: 60 }, { x: 80, y: 59 }, { x: 83, y: 57 },
  { x: 67, y: 56 }, { x: 71, y: 54 }, { x: 75, y: 54 }, { x: 79, y: 53 }
];

export const STATQUEST_NOISE = [
  { x: 13, y: 80 },
  { x: 32, y: 85 },
  { x: 13, y: 35 },
  { x: 36, y: 12 },
  { x: 93, y: 45 }
];

// 2. Canonical Datasets for Interactive Benchmarking
export const DATASETS = {
  statquest: {
    name: 'StatQuest Hook & Blob',
    desc: '74 points: large sweeping curved tail + separate compact circular cluster + 5 isolated noise outliers.',
    defaultEps: 8.5,
    defaultMinPts: 4,
    points: [
      ...STATQUEST_C1_BLOB.map((p, i) => ({ ...p, id: i, group: 'c1' })),
      ...STATQUEST_C1_TAIL.map((p, i) => ({ ...p, id: i + STATQUEST_C1_BLOB.length, group: 'c1' })),
      ...STATQUEST_C2.map((p, i) => ({ ...p, id: i + STATQUEST_C1_BLOB.length + STATQUEST_C1_TAIL.length, group: 'c2' })),
      ...STATQUEST_NOISE.map((p, i) => ({ ...p, id: i + STATQUEST_C1_BLOB.length + STATQUEST_C1_TAIL.length + STATQUEST_C2.length, group: 'noise' }))
    ]
  },
  moons: {
    name: 'Two Interlocking Moons',
    desc: '61 points: non-convex crescent arcs illustrating non-spherical clusters where K-Means fails catastrophically.',
    defaultEps: 7.0,
    defaultMinPts: 4,
    points: (() => {
      const pts = [];
      let id = 0;
      // Upper crescent
      for (let i = 0; i < 28; i++) {
        const theta = (i / 27) * Math.PI;
        pts.push({
          id: id++,
          x: +(32 + 22 * Math.cos(theta)).toFixed(1),
          y: +(58 + 18 * Math.sin(theta)).toFixed(1),
          group: 'c1'
        });
      }
      // Lower crescent
      for (let i = 0; i < 28; i++) {
        const theta = (i / 27) * Math.PI;
        pts.push({
          id: id++,
          x: +(52 + 22 * Math.cos(theta)).toFixed(1),
          y: +(44 - 18 * Math.sin(theta)).toFixed(1),
          group: 'c2'
        });
      }
      // Noise outliers
      const noise = [
        { x: 12.0, y: 78.0 },
        { x: 88.0, y: 22.0 },
        { x: 48.0, y: 88.0 },
        { x: 20.0, y: 26.0 },
        { x: 84.0, y: 74.0 }
      ];
      noise.forEach(p => pts.push({ id: id++, ...p, group: 'noise' }));
      return pts;
    })()
  },
  rings: {
    name: 'Concentric Rings (Bullseye)',
    desc: '85 points: inner dense circle wrapped inside an outer concentric ring, separated by an empty density chasm.',
    defaultEps: 7.5,
    defaultMinPts: 4,
    points: (() => {
      const pts = [];
      let id = 0;
      // Inner ring
      for (let i = 0; i < 24; i++) {
        const theta = (i / 24) * 2 * Math.PI;
        pts.push({
          id: id++,
          x: +(50 + 12 * Math.cos(theta)).toFixed(1),
          y: +(50 + 12 * Math.sin(theta)).toFixed(1),
          group: 'c1'
        });
      }
      // Outer ring
      for (let i = 0; i < 56; i++) {
        const theta = (i / 56) * 2 * Math.PI;
        pts.push({
          id: id++,
          x: +(50 + 30 * Math.cos(theta)).toFixed(1),
          y: +(50 + 30 * Math.sin(theta)).toFixed(1),
          group: 'c2'
        });
      }
      // Noise
      const noise = [
        { x: 50.0, y: 50.0 },
        { x: 14.0, y: 14.0 },
        { x: 86.0, y: 86.0 },
        { x: 14.0, y: 86.0 },
        { x: 86.0, y: 14.0 }
      ];
      noise.forEach(p => pts.push({ id: id++, ...p, group: 'noise' }));
      return pts;
    })()
  },
  densities: {
    name: 'Varying Densities (Limitation)',
    desc: '53 points: one ultra-dense compact cluster and one loose sparse cluster. Demonstrates the single global ε bottleneck.',
    defaultEps: 5.0,
    defaultMinPts: 4,
    points: (() => {
      const pts = [];
      let id = 0;
      // High density cluster (left)
      for (let i = 0; i < 26; i++) {
        const r = 1.5 + 6.5 * Math.sqrt((i + 1) / 26);
        const th = i * 2.39996;
        pts.push({
          id: id++,
          x: +(28 + r * Math.cos(th)).toFixed(1),
          y: +(50 + r * Math.sin(th)).toFixed(1),
          group: 'c1'
        });
      }
      // Low density cluster (right)
      for (let i = 0; i < 22; i++) {
        const r = 4.0 + 15.0 * Math.sqrt((i + 1) / 22);
        const th = i * 2.39996;
        pts.push({
          id: id++,
          x: +(72 + r * Math.cos(th)).toFixed(1),
          y: +(50 + r * Math.sin(th)).toFixed(1),
          group: 'c2'
        });
      }
      // Noise
      const noise = [
        { x: 10.0, y: 82.0 },
        { x: 48.0, y: 18.0 },
        { x: 48.0, y: 82.0 },
        { x: 92.0, y: 14.0 },
        { x: 92.0, y: 86.0 }
      ];
      noise.forEach(p => pts.push({ id: id++, ...p, group: 'noise' }));
      return pts;
    })()
  }
};

/**
 * DBSCAN Simulation Engine for the Atlas Algorithm Workspace
 */
export function dbscanEngine(r, epsParam) {
  const eps = typeof epsParam === 'number' ? epsParam : 8.5;
  const MP = 4; // MinPts = 4 other points (5 total including self)

  const jitter = (pt, isOutlier) => ({
    x: cp(pt.x + (isOutlier ? G(r) * 0.5 : G(r) * 0.4)),
    y: cp(pt.y + (isOutlier ? G(r) * 0.5 : G(r) * 0.4)),
    c: 5
  });

  const c1Blob = STATQUEST_C1_BLOB.map(p => jitter(p, false));
  const c1Tail = STATQUEST_C1_TAIL.map(p => jitter(p, false));
  const c2 = STATQUEST_C2.map(p => jitter(p, false));
  const noise = STATQUEST_NOISE.map(p => jitter(p, true));

  const c1 = [...c1Blob, ...c1Tail];
  const P = [...c1, ...c2, ...noise];
  const N = P.length;

  // Neighbors calculation: point itself + neighbors within radius eps
  const nb = P.map(p => P.reduce((acc, q, j) => (dist(p, q) <= eps ? acc.concat(j) : acc), []));
  const isCore = nb.map(a => a.length >= MP + 1);

  // Connected components of core points
  const L = P.map(() => -1);
  let nc = 0;
  P.forEach((_, i) => {
    if (!isCore[i] || L[i] >= 0) return;
    const q = [i];
    L[i] = nc;
    while (q.length) {
      const u = q.shift();
      if (!isCore[u]) continue;
      P.forEach((_, v) => {
        if (dist(P[u], P[v]) <= eps) {
          if (L[v] < 0) {
            L[v] = nc;
            q.push(v);
          }
        }
      });
    }
    nc++;
  });

  const sampleIndices = [10, 17, 37, 42, 49, 73];
  const coreSamples = [10, 17, 37, 42];

  const orangeCircle = (p, rx = eps) => ({
    x: p.x,
    y: p.y,
    rx,
    ry: rx,
    rawFill: 'rgba(255, 175, 55, 0.42)',
    rawCol: '#f59f00',
    w: 1.2
  });

  const S = [];

  // Frame 0: The Raw Dataset
  S.push({
    t: '1. The Unlabelled Data (Non-Convex Clusters + Outliers)',
    d: `We have ${N} data points: a large sweeping hook cluster on the left, a compact circular cluster on the right, plus 5 isolated background outliers. Traditional K-Means fails here because it forces every outlier into a cluster and assumes spherical partitions. DBSCAN discovers clusters naturally based on local density neighborhoods.`,
    math: `\\text{Parameters: } \\varepsilon = ${eps}, \\quad \\text{MinPts} = ${MP} \\text{ (neighbors)}`,
    pts: P.map(p => ({ ...p, c: 5, big: false, ring: false }))
  });

  // Frame 1: Define ε-Neighborhoods
  S.push({
    t: '2. The ε-Neighborhoods (MinPts = 4 Neighbors)',
    d: `We draw an ε-neighborhood circle of radius ε = ${eps} around candidate points. According to Ester et al. (1996), a point is dense enough to be a Core Point if its neighborhood contains at least MinPts other points (|N_ε(p)| ≥ 4). Notice dense interior circles overlap many points, while boundary and noise points overlap fewer.`,
    math: `N_\\varepsilon(\\mathbf{p}) = \\{ \\mathbf{q} \\in D \\mid \\|\\mathbf{p} - \\mathbf{q}\\| \\le \\varepsilon \\}, \\quad |N_\\varepsilon(\\mathbf{p})| \\ge 4`,
    pts: P.map((p, i) => {
      const isCenter = sampleIndices.includes(i);
      const isCovered = sampleIndices.some(s => dist(P[s], p) <= eps);
      return {
        ...p,
        c: 5,
        big: isCenter,
        ring: isCenter
      };
    }),
    circles: sampleIndices.map(idx => orangeCircle(P[idx]))
  });

  // Frame 2: Core Points Identified
  S.push({
    t: '3. Core Points Identified (Turn Red)',
    d: `These 4 points meet the Core Point condition because their ε-circles overlap at least 4 other points. Their centers turn RED to designate them as cluster seeds. Edge points and noise outliers fail the density threshold and cannot expand clusters.`,
    math: `\\mathbf{p} \\in \\text{Core}(D) \\iff |N_\\varepsilon(\\mathbf{p})| \\ge 4 \\implies \\text{Marked Red}`,
    pts: P.map((p, i) => {
      const isCoreSample = coreSamples.includes(i);
      const isNonCoreSample = sampleIndices.includes(i) && !isCoreSample;
      return {
        ...p,
        c: isCoreSample ? 0 : 5,
        big: isCoreSample || isNonCoreSample,
        ring: isCoreSample
      };
    }),
    circles: sampleIndices.map(idx => orangeCircle(P[idx]))
  });

  // Frame 3: Direct Density-Reachability Seed
  const seedIdx = 10;
  const seedNeighbors = nb[seedIdx].filter(j => j !== seedIdx);
  S.push({
    t: '4. Direct Density-Reachability & Seed Expansion',
    d: `DBSCAN picks Core Point #10 as the initial cluster seed (Green). Every point within its ε-neighborhood is directly density-reachable from #10. Core neighbors turn red as they join the BFS expansion queue to continue propagating the density chain outward.`,
    math: `\\mathbf{q} \\in N_\\varepsilon(\\mathbf{p}) \\land \\mathbf{p} \\in \\text{Core} \\implies \\mathbf{q} \\text{ is directly density-reachable from } \\mathbf{p}`,
    pts: P.map((p, i) => {
      if (i === seedIdx) return { ...p, c: 2, big: true, ring: true };
      if (seedNeighbors.includes(i)) return { ...p, c: 0, big: true };
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[seedIdx])]
  });

  // Frame 4: Border Points on the Perimeter
  const edgeCoreIdx = 27;
  const borderPtIdx = 31;
  S.push({
    t: '5. Non-Core (Border) Points on Cluster Perimeter',
    d: `When expanding along the cluster perimeter, we encounter Non-Core points. Point #31 overlaps only 2 points (< MinPts), so it is not a Core point. However, because it falls inside Core Point #27's ε-circle, it joins Cluster 1 as a Border Point without adding its own neighbors to the queue.`,
    math: `|N_\\varepsilon(\\mathbf{p})| < 4 \\ \\land \\ \\mathbf{p} \\in N_\\varepsilon(\\mathbf{core}) \\implies \\text{Border Point (Non-Expanding)}`,
    pts: P.map((p, i) => {
      if (i < 28) return { ...p, c: 2, big: false };
      if (i === edgeCoreIdx) return { ...p, c: 2, big: true, ring: true };
      if (i === borderPtIdx) return { ...p, c: 5, big: true, ring: true, h: true };
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[edgeCoreIdx])]
  });

  // Frame 5: Cluster 1 Fully Formed
  S.push({
    t: '6. Cluster 1 Fully Formed: Non-Convex Sweeping Hook',
    d: `By chaining across overlapping Core Point neighborhoods, DBSCAN flows seamlessly through the dense blob and all the way down the sweeping curved tail. All ${c1.length} points on the left are unified into Cluster 1 (Green) purely via density-connectivity!`,
    math: `C_1 = \\{ \\mathbf{p} \\mid \\mathbf{p} \\text{ is density-connected to seed } \\mathbf{p}_{10} \\}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: false };
    })
  });

  // Frame 6: Discover Cluster 2
  const c2SeedIdx = c1.length + 4;
  S.push({
    t: '7. Discover Cluster 2 Across the Density Gap',
    d: `The BFS queue for Cluster 1 is now empty. DBSCAN visits the next unvisited Core Point in the upper-right group. Because the spatial gap between the two groups exceeds ε, the density chain terminates! A new, separate Cluster 2 (Blue) is initiated.`,
    math: `\\text{dist}(C_1, C_2) > \\varepsilon \\implies \\text{New Cluster } C_2 \\text{ Created}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: false };
      if (i < c1.length + c2.length) return { ...p, c: 1, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[c2SeedIdx])]
  });

  // Frame 7: Final Result & Noise Isolation
  S.push({
    t: '8. Final Result: 2 Arbitrary Clusters + 5 Noise Outliers',
    d: `Final output: DBSCAN discovered exactly 2 natural clusters without specifying K! The 5 isolated grey points never overlapped any Core Point's ε-circle, so they are cleanly flagged as NOISE (label = -1) rather than corrupting cluster boundaries.`,
    math: `\\text{Result: } 2 \\text{ Clusters (Green & Blue)} \\ + \\ 5 \\text{ Noise Outliers } (\\text{Label} = -1)`,
    pts: P.map((p, i) => {
      if (L[i] === 0) return { ...p, c: 2, big: isCore[i], h: !isCore[i] };
      if (L[i] === 1) return { ...p, c: 1, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: true, ring: true };
    })
  });

  // Diagnostic sorted k-distance curve (Ester et al. Section 4.2)
  const kd = P.map(p => P.map(o => dist(p, o)).sort((a, b) => a - b)[MP]).sort((a, b) => a - b);
  S.curve = {
    t: 'Sorted k-distance plot (k = 4, Ester et al. §4.2)',
    xl: 'points, sorted by k-distance',
    yl: 'distance to 4th nearest neighbor',
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
  pm: ['ε (eps)', 4, 15, 8.5],
  i: 'Grows clusters from dense regions and flags outliers as noise.'
};
