import { cp, G, dist } from '../common';

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
 * Theoretical foundations from Ester, Kriegel, Sander, Xu (KDD 1996) and Schubert et al. (ACM TODS 2017).
 *
 * Core Intuition:
 * 1. Neighborhood Circle: Circle of radius ε drawn around every point.
 * 2. Core Point: A crowded point with at least MinPts neighbors inside its circle.
 * 3. Border Point: Sits on the edge. Has fewer neighbors, but touches a Core point, so it joins the cluster.
 * 4. Noise Point: Lonely outlier. Too far from any crowded point.
 * 5. Chain Reaction: Core points pull in their neighbors; crowded neighbors pull in theirs, growing any shape!
 */

// 1. Benchmark 74-point Reference Coordinates
export const C1_BLOB = [
  { x: 35, y: 72 }, { x: 39, y: 74 }, { x: 43, y: 76 }, { x: 47, y: 75 }, { x: 51, y: 74 }, { x: 55, y: 75 }, { x: 59, y: 76 },
  { x: 34, y: 66 }, { x: 38, y: 68 }, { x: 42, y: 70 }, { x: 46, y: 69 }, { x: 50, y: 69 }, { x: 54, y: 68 }, { x: 58, y: 68 },
  { x: 36, y: 60 }, { x: 40, y: 62 }, { x: 44, y: 64 }, { x: 48, y: 63 }, { x: 52, y: 62 }, { x: 56, y: 62 }, { x: 58, y: 58 },
  { x: 34, y: 54 }, { x: 38, y: 55 }, { x: 42, y: 57 }, { x: 46, y: 56 }, { x: 50, y: 56 }, { x: 54, y: 55 },
  { x: 32, y: 48 }, { x: 36, y: 49 }, { x: 40, y: 50 }, { x: 44, y: 49 }, { x: 47, y: 48 }
];

export const C1_TAIL = [
  { x: 49, y: 42 }, { x: 52, y: 45 },
  { x: 53, y: 38 }, { x: 56, y: 40 }, { x: 58, y: 43 },
  { x: 57, y: 33 }, { x: 60, y: 36 }, { x: 63, y: 38 },
  { x: 61, y: 28 }, { x: 64, y: 31 }, { x: 68, y: 34 }, { x: 72, y: 35 }, { x: 76, y: 34 },
  { x: 66, y: 24 }, { x: 70, y: 27 }, { x: 74, y: 29 }, { x: 78, y: 29 }, { x: 82, y: 30 },
  { x: 72, y: 21 }, { x: 76, y: 23 }, { x: 80, y: 24 }
];

export const C2_BLOB = [
  { x: 74, y: 73 }, { x: 78, y: 70 }, { x: 82, y: 70 },
  { x: 70, y: 69 }, { x: 74, y: 67 }, { x: 78, y: 65 }, { x: 81, y: 64 },
  { x: 68, y: 63 }, { x: 72, y: 62 }, { x: 76, y: 60 }, { x: 80, y: 59 }, { x: 83, y: 57 },
  { x: 67, y: 56 }, { x: 71, y: 54 }, { x: 75, y: 54 }, { x: 79, y: 53 }
];

export const NOISE_PTS = [
  { x: 13, y: 80 },
  { x: 32, y: 85 },
  { x: 13, y: 35 },
  { x: 36, y: 12 },
  { x: 93, y: 45 }
];

// 2. Canonical Datasets for Interactive Benchmarking
export const DATASETS = {
  hook: {
    name: 'Curved Hook & Blob',
    desc: '74 points: a sweeping curved hook + separate round cluster + 5 lonely outliers.',
    defaultEps: 8.5,
    defaultMinPts: 4,
    points: [
      ...C1_BLOB.map((p, i) => ({ ...p, id: i, group: 'c1' })),
      ...C1_TAIL.map((p, i) => ({ ...p, id: i + C1_BLOB.length, group: 'c1' })),
      ...C2_BLOB.map((p, i) => ({ ...p, id: i + C1_BLOB.length + C1_TAIL.length, group: 'c2' })),
      ...NOISE_PTS.map((p, i) => ({ ...p, id: i + C1_BLOB.length + C1_TAIL.length + C2_BLOB.length, group: 'noise' }))
    ]
  },
  moons: {
    name: 'Two Interlocking Moons',
    desc: '61 points: two curved crescents. K-Means fails completely, but DBSCAN traces both effortlessly.',
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
    desc: '85 points: an inner circle inside an outer ring, separated by an empty density gap.',
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
    desc: '53 points: one tightly packed group and one loosely spread group. Shows how a single radius struggles.',
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
  const MP = 4; // MinPts = 4 other points

  const jitter = (pt, isOutlier) => ({
    x: cp(pt.x + (isOutlier ? G(r) * 0.5 : G(r) * 0.4)),
    y: cp(pt.y + (isOutlier ? G(r) * 0.5 : G(r) * 0.4)),
    c: 5
  });

  const c1Blob = C1_BLOB.map(p => jitter(p, false));
  const c1Tail = C1_TAIL.map(p => jitter(p, false));
  const c2 = C2_BLOB.map(p => jitter(p, false));
  const noise = NOISE_PTS.map(p => jitter(p, true));

  const c1 = [...c1Blob, ...c1Tail];
  const P = [...c1, ...c2, ...noise];
  const N = P.length;

  // Neighbors calculation
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

  const sampleIndices = [10, 17, 37, 42, 27, 73];
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
    t: '1. The Raw Data: Any Shape + Outliers',
    d: `We have ${N} data points: a large sweeping hook on the left, a compact circle on the right, and 5 lonely outliers. K-Means struggles here because it assumes round spherical blobs and forces every outlier into a group. DBSCAN instead discovers groups naturally by looking for crowded neighborhoods.`,
    math: `\\text{Parameters: } \\varepsilon = ${eps} \\text{ (circle radius)}, \\quad \\text{MinPts} = ${MP} \\text{ (neighbors needed)}`,
    pts: P.map(p => ({ ...p, c: 5, big: false, ring: false }))
  });

  // Frame 1: Define ε-Neighborhoods
  S.push({
    t: '2. Drawing the Neighborhood Circle (Radius ε)',
    d: `Imagine drawing an orange circle of radius ε = ${eps} around each point. If a point's circle contains at least ${MP} other points, it is crowded enough to be a "Core Point". Notice that points deep inside a cluster have crowded circles, while edge points and outliers do not.`,
    math: `\\text{Core Point Rule: Circle must touch at least } ${MP} \\text{ other points}`,
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
    t: '3. Crowded Centers Turn Red (Core Points)',
    d: `These 4 points have at least ${MP} neighbors inside their circle, so their centers turn RED! They are verified Core Points that can start and expand clusters. Edge points and stray outliers don't have enough neighbors, so they cannot start clusters.`,
    math: `\\text{Core Points: } |N_\\varepsilon(\\mathbf{p})| \\ge 4 \\implies \\text{Turn Red (Cluster Seeds)}`,
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
    t: '4. Starting the Chain Reaction (Cluster 1)',
    d: `We start Cluster 1 at Core Point #10 (Green). It pulls in all neighbors inside its circle. Any neighbor that is ALSO a crowded Core Point turns red, ready to pull in its own neighbors next!`,
    math: `\\text{Neighbors inside Core circle join Cluster 1}`,
    pts: P.map((p, i) => {
      if (i === seedIdx) return { ...p, c: 2, big: true, ring: true };
      if (seedNeighbors.includes(i)) return { ...p, c: 0, big: true };
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[seedIdx])]
  });

  // Frame 4: Border Points on the Perimeter
  const edgeCoreIdx = 28; // Core Point { x: 36, y: 49 } in the blob
  const borderPtIdx = 27; // Border Point { x: 32, y: 48 } on the blob edge
  S.push({
    t: '5. Edge Points (Border Points) Join In',
    d: `As the cluster spreads to the boundary, it reaches edge points like #27. Point #27 has only 3 neighbors (not enough to be a crowded Core Point). But because it sits directly inside Core Point #28's orange circle, it gets to join Cluster 1 as an edge (Border) point! Border points do not expand the search further.`,
    math: `\\text{Touches Core circle, but } < 4 \\text{ neighbors} \\implies \\text{Border Point}`,
    pts: P.map((p, i) => {
      if (i === edgeCoreIdx) return { ...p, c: 2, big: true, ring: true };
      if (i === borderPtIdx) return { ...p, c: 2, big: true, ring: true, h: true };
      if (i < 32) return { ...p, c: 2, big: false }; // Entire blob is part of Cluster 1 (Green)
      return { ...p, c: 5, big: false }; // Tail, C2, and noise remain unvisited (Grey)
    }),
    circles: [orangeCircle(P[edgeCoreIdx])]
  });

  // Frame 5: Cluster 1 Fully Formed
  S.push({
    t: '6. Cluster 1 Fully Assembled (Green Hook)',
    d: `Like falling dominoes, DBSCAN chained from circle to circle all the way through the dense blob and down the long curved tail. All ${c1.length} points on the left are unified into Cluster 1 (Green) purely by following density!`,
    math: `\\text{Cluster 1 Formed: } ${c1.length} \\text{ points connected}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: false };
    })
  });

  // Frame 6: Discover Cluster 2
  const c2SeedIdx = c1.length + 4;
  S.push({
    t: '7. Jumping Across the Empty Gap (Cluster 2)',
    d: `Cluster 1 has no more neighbors to add. DBSCAN jumps across the empty gap to another unvisited crowded point in the upper-right. Because the gap between the two groups is wider than the circle radius ε, they stay separate! Cluster 2 (Blue) is born.`,
    math: `\\text{Gap between groups} > \\varepsilon \\implies \\text{Separate Cluster 2 Created}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: false };
      if (i < c1.length + c2.length) return { ...p, c: 1, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[c2SeedIdx])]
  });

  // Frame 7: Final Result & Noise Isolation
  S.push({
    t: '8. Final Result: Natural Shapes & Isolated Noise',
    d: `DBSCAN found both natural clusters without being told how many to look for! The 5 isolated grey points never touched any crowded circle, so they are cleanly flagged as NOISE (label = -1) rather than pulling clusters off course.`,
    math: `\\text{Result: } 2 \\text{ Natural Clusters} + 5 \\text{ Isolated Outliers (Noise)}`,
    pts: P.map((p, i) => {
      if (L[i] === 0) return { ...p, c: 2, big: isCore[i], h: !isCore[i] };
      if (L[i] === 1) return { ...p, c: 1, big: isCore[i], h: !isCore[i] };
      return { ...p, c: 5, big: true, ring: true };
    })
  });

  // Diagnostic sorted k-distance curve
  const kd = P.map(p => P.map(o => dist(p, o)).sort((a, b) => a - b)[MP]).sort((a, b) => a - b);
  S.curve = {
    t: 'Sorted k-distance plot (k = 4)',
    xl: 'points, sorted by distance to neighbor',
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
