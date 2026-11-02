import { cp, G, dist } from '../common';

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise) Simulation Engine
 * Recreates the classic StatQuest 2-cluster tutorial:
 * - Cluster 1: Large sweeping hook cluster (Green)
 * - Cluster 2: Separate compact circular cluster (Blue)
 * - Noise: 5 isolated points (Grey)
 * - Step-by-step orange circle neighbor inspection, Core points, Non-Core border points, and final clustering.
 */

// Exact 74-point coordinates from the StatQuest reference
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
  { x: 13, y: 80 }, // Top-left
  { x: 32, y: 85 }, // Upper-left
  { x: 13, y: 35 }, // Far-left
  { x: 36, y: 12 }, // Bottom-left
  { x: 93, y: 45 }  // Far-right
];

export function dbscanEngine(r, epsParam) {
  const eps = typeof epsParam === 'number' ? epsParam : 8.5;
  const MP = 4; // MinPts = 4 other points

  // Slight jitter with random seed r for "New Data" variation
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
  const isCore = nb.map(a => a.length >= MP + 1); // 4 other points + self = >= 5 total

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

  // Sample points for the StatQuest demonstration steps
  // 6 sample points for Image 2:
  // - 2 in blob: index 10 (46, 69) and index 17 (48, 63)
  // - 2 in tail: index 37 (57, 33) and index 42 (68, 34)
  // - 1 edge point: index 49 (82, 30)
  // - 1 noise point: index 73 (93, 45)
  const sampleIndices = [10, 17, 37, 42, 49, 73];
  const coreSamples = [10, 17, 37, 42]; // The 4 that have >= 4 neighbors (Image 3)

  const S = [];

  // Helper for orange circle styling exactly matching StatQuest images
  const orangeCircle = (p, rx = eps) => ({
    x: p.x,
    y: p.y,
    rx,
    ry: rx,
    rawFill: 'rgba(255, 175, 55, 0.42)',
    rawCol: '#f59f00',
    w: 1.2
  });

  // Frame 0: The Raw Dataset (2 Clusters + Outliers)
  S.push({
    t: '1. The Unlabelled Data (2 Clusters + Noise)',
    d: `We have ${N} data points: a large sweeping hook cluster on the left, a compact circular cluster on the right, plus isolated stray points in the background. K-Means would struggle here: it forces every outlier into a cluster and assumes spherical shapes. DBSCAN discovers clusters naturally based on density circles.`,
    math: `\\text{Parameters: } \\varepsilon = ${eps}, \\quad \\text{MinPts} = ${MP}`,
    pts: P.map(p => ({ ...p, c: 5, big: false, ring: false }))
  });

  // Frame 1: Define ε and MinPts (Show Orange Circles!) — Image 2
  S.push({
    t: '2. The Orange ε-Circles (MinPts = 4)',
    d: `We define an orange circle of radius ε = ${eps}. A Core Point is defined as any point that is close to at least 4 other points (its orange circle overlaps ≥ 4 neighbors). Notice how some circles overlap many points, while edge and noise points overlap fewer.`,
    math: `\\text{Core Point Condition: } |N_\\varepsilon(\\mathbf{p})| \\ge 4 \\text{ other points}`,
    pts: P.map((p, i) => {
      const isCenter = sampleIndices.includes(i);
      const isCovered = sampleIndices.some(s => dist(P[s], p) <= eps);
      return {
        ...p,
        c: isCenter ? 5 : isCovered ? 5 : 5,
        big: isCenter,
        ring: isCenter
      };
    }),
    circles: sampleIndices.map(idx => orangeCircle(P[idx]))
  });

  // Frame 2: Core Points Identified (Turn RED!) — Image 3
  S.push({
    t: '3. Core Points Identified (Turn Red)',
    d: `These 4 points are Core Points because their orange circles overlap at least 4 other points! Their centers turn RED to mark them as verified Core Points. The edge point and noise point do not have enough neighbors, so they are not Core Points.`,
    math: `\\text{Core Points: } |N_\\varepsilon(\\mathbf{p})| \\ge 4 \\implies \\text{Marked Red}`,
    pts: P.map((p, i) => {
      const isCoreSample = coreSamples.includes(i);
      const isNonCoreSample = sampleIndices.includes(i) && !isCoreSample;
      return {
        ...p,
        c: isCoreSample ? 0 : 5, // Red for core points, grey for others
        big: isCoreSample || isNonCoreSample,
        ring: isCoreSample
      };
    }),
    circles: sampleIndices.map(idx => orangeCircle(P[idx]))
  });

  // Frame 3: Expand Cluster 1 (Core Points Chaining) — Image 4
  // Starting point: index 10 (green center)
  // Neighbors within orange circle turn RED
  const seedIdx = 10;
  const seedNeighbors = nb[seedIdx].filter(j => j !== seedIdx);
  S.push({
    t: '4. Expand Cluster 1: Chaining Core Points',
    d: `Next, the Core Points that are close to the first cluster (meaning they overlap its orange circle) are linked in! The center point starts Cluster 1 (green), and all overlapping core points turn red as they join the growing cluster chain.`,
    math: `\\mathbf{p} \\in N_\\varepsilon(\\mathbf{seed}) \\land \\mathbf{p} \\text{ is Core} \\implies \\text{Linked into Cluster 1}`,
    pts: P.map((p, i) => {
      if (i === seedIdx) return { ...p, c: 2, big: true, ring: true }; // Green starter
      if (seedNeighbors.includes(i)) return { ...p, c: 0, big: true }; // Red recruits
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[seedIdx])]
  });

  // Frame 4: Non-Core / Border Points on the Edge — Image 5
  // Edge core point: index 27 (32, 48). Overlaps perimeter non-core point: index 27 or 31 (47, 48)
  const edgeCoreIdx = 27;
  const borderPtIdx = 31;
  S.push({
    t: '5. Non-Core (Border) Points on the Edge',
    d: `Eventually, we will add this Non-Core Point (black dot on edge), but right now we only connect Core Points. Border points have fewer than 4 neighbors, but because they overlap a Core Point's orange circle, they will join the cluster when core chaining finishes!`,
    math: `|N_\\varepsilon(\\mathbf{p})| < 4 \\ \\land \\ \\mathbf{p} \\text{ touches Core} \\implies \\text{Border Point}`,
    pts: P.map((p, i) => {
      if (i < 28) return { ...p, c: 2, big: false }; // Already in Cluster 1 (Green)
      if (i === edgeCoreIdx) return { ...p, c: 2, big: true, ring: true };
      if (i === borderPtIdx) return { ...p, c: 5, big: true, ring: true, h: true }; // Non-core border point
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[edgeCoreIdx])]
  });

  // Frame 5: Cluster 1 Fully Formed (Green Hook + Tail)
  S.push({
    t: '6. Cluster 1 Fully Formed (Green)',
    d: `DBSCAN followed the chain of overlapping circles through the dense blob and all the way down the sweeping curved tail. All core points and border points in the left group are now completely assembled into Cluster 1 (Green)!`,
    math: `\\text{Cluster 1 (Left Hook): } ${c1.length} \\text{ points assembled}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: isCore[i], h: !isCore[i] }; // Cluster 1 Green
      return { ...p, c: 5, big: false };
    })
  });

  // Frame 6: Cluster 2 Formed (Upper-Right Blue Cluster)
  const c2SeedIdx = c1.length + 4; // Point in C2
  S.push({
    t: '7. Discover Cluster 2 Across the Gap (Blue)',
    d: `DBSCAN jumps to an unvisited core point in the upper-right group. Because the gap between Cluster 1 and Cluster 2 is larger than the orange circle, the clusters do NOT merge! DBSCAN chains through the second region, forming Cluster 2 (Blue)!`,
    math: `\\text{Distance(C1, C2)} > \\varepsilon \\implies \\text{Separate Cluster 2 Created}`,
    pts: P.map((p, i) => {
      if (i < c1.length) return { ...p, c: 2, big: false }; // Cluster 1 Green
      if (i < c1.length + c2.length) return { ...p, c: 1, big: isCore[i], h: !isCore[i] }; // Cluster 2 Blue
      return { ...p, c: 5, big: false };
    }),
    circles: [orangeCircle(P[c2SeedIdx])]
  });

  // Frame 7: Final Result (Cluster 1 Green, Cluster 2 Blue, Noise Grey) — Image 1
  S.push({
    t: '8. Final Result: 2 Clusters + Noise Isolated',
    d: `Final result: DBSCAN found exactly 2 natural clusters without choosing K! Cluster 1 is Green (hook & tail), Cluster 2 is Blue (compact upper-right). The 5 isolated grey points never overlapped any core point's orange circle, so they remain isolated as NOISE!`,
    math: `\\text{Result: } 2 \\text{ Clusters (Green & Blue)} + 5 \\text{ Noise Points (Grey)}`,
    pts: P.map((p, i) => {
      if (L[i] === 0) return { ...p, c: 2, big: isCore[i], h: !isCore[i] }; // Cluster 1 Green
      if (L[i] === 1) return { ...p, c: 1, big: isCore[i], h: !isCore[i] }; // Cluster 2 Blue
      return { ...p, c: 5, big: true, ring: true }; // Noise Grey
    })
  });

  // Diagnostic k-distance curve
  const kd = P.map(p => P.map(o => dist(p, o)).sort((a, b) => a - b)[MP]).sort((a, b) => a - b);
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
  pm: ['ε (eps)', 5, 14, 8.5],
  i: 'Grows clusters from dense regions and flags outliers as noise.'
};
