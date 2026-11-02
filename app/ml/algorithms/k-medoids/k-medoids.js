import { blobs, dist, f2, cp } from '../common';

/**
 * k-Medoids Clustering (PAM - Partitioning Around Medoids) Simulation Engine
 * Medoids are actual members of the dataset (team captains), making clustering robust to outliers.
 */
export function kmedoids(r, kClusters = 3) {
  const K = Math.max(2, Math.min(4, Math.round(kClusters || 3)));

  // Define natural cluster centers based on chosen K
  let centers;
  if (K === 2) {
    centers = [
      [28, 42],
      [72, 58]
    ];
  } else if (K === 4) {
    centers = [
      [26, 32],
      [74, 32],
      [28, 72],
      [72, 72]
    ];
  } else {
    // Default K = 3
    centers = [
      [26, 32],
      [74, 32],
      [50, 72]
    ];
  }

  const ptsPerCluster = 9;
  const rawBlobs = blobs(r, centers, ptsPerCluster, 6.2);

  // 2 extreme distant outliers in opposite corners
  const outliers = [
    { x: 92, y: 90, isOutlier: true },
    { x: 10, y: 88, isOutlier: true }
  ];

  const P = [...rawBlobs, ...outliers];
  const N = P.length;

  // Initial medoid choices: pick non-central samples from each cluster to show PAM improvement
  let medoids = Array.from({ length: K }, (_, k) => k * ptsPerCluster + 1);

  // Dissimilarity helper: total sum of distances from every point to its closest medoid
  const totalCost = medIds => {
    let cost = 0;
    for (let i = 0; i < N; i++) {
      let minD = Infinity;
      for (let k = 0; k < K; k++) {
        const d = dist(P[i], P[medIds[k]]);
        if (d < minD) minD = d;
      }
      cost += minD;
    }
    return cost;
  };

  // Cluster assignment: find nearest medoid index (0 to K-1) for each point
  const getAssignments = medIds => {
    return P.map(p => {
      let bestK = 0;
      let minD = Infinity;
      medIds.forEach((mIdx, k) => {
        const d = dist(p, P[mIdx]);
        if (d < minD) {
          minD = d;
          bestK = k;
        }
      });
      return bestK;
    });
  };

  // Helper to construct a clean simulation frame without text-graphic collisions
  const buildFrame = (t, d, medIds, options = {}) => {
    const {
      cost = totalCost(medIds),
      math = null,
      candidateIdx = null,
      testedMedIdx = null,
      isOverview = false,
      isConverged = false
    } = options;

    const assign = isOverview ? P.map(() => 5) : getAssignments(medIds);

    // Clean assignment lines connecting points to their assigned medoid
    const lines = isOverview
      ? []
      : P.map((p, i) => {
          const mPoint = P[medIds[assign[i]]];
          return {
            a: [p.x, p.y],
            b: [mPoint.x, mPoint.y],
            col: p.isOutlier ? '--p6' : `--p${assign[i]}`,
            w: p.isOutlier ? 0.35 : 0.22,
            dash: '1.5 2'
          };
        });

    // If candidate swap is currently under evaluation, draw crisp dashed line
    if (candidateIdx !== null && testedMedIdx !== null) {
      lines.push({
        a: [P[medIds[testedMedIdx]].x, P[medIds[testedMedIdx]].y],
        b: [P[candidateIdx].x, P[candidateIdx].y],
        col: '--tx',
        w: 0.85,
        dash: '2 2'
      });
    }

    // Circles: clean halos around active medoids, candidate under test & warning halos around outliers
    const circles = [];
    if (!isOverview) {
      medIds.forEach((mIdx, k) => {
        circles.push({
          x: P[mIdx].x,
          y: P[mIdx].y,
          rx: 4.8,
          ry: 4.8,
          col: `--p${k}`,
          w: 1.0
        });
      });
    }

    // Highlight candidate point under swap testing
    if (candidateIdx !== null) {
      circles.push({
        x: P[candidateIdx].x,
        y: P[candidateIdx].y,
        rx: 5.2,
        ry: 5.2,
        col: '--tx',
        w: 1.1,
        dash: '2 1.5'
      });
    }

    // Warning dashed circle around distant outliers
    outliers.forEach(o => {
      circles.push({
        x: o.x,
        y: o.y,
        rx: 4.2,
        ry: 4.2,
        col: '--p6',
        w: 0.8,
        dash: '1.5 1.5'
      });
    });

    // Point representation: medoids have distinct double rings, outliers colored red
    const pts = P.map((p, i) => {
      const isMed = !isOverview && medIds.includes(i);
      const isCand = i === candidateIdx;
      return {
        x: p.x,
        y: p.y,
        c: p.isOutlier ? 6 : isOverview ? 5 : assign[i],
        big: isMed || isCand || p.isOutlier,
        ring: isMed || isCand
      };
    });

    return {
      t,
      d,
      v: cost,
      x: S.length,
      math,
      pts,
      lines,
      circles,
      texts: [], // Canvas stays 100% clean and collision-free; metrics are in telemetry cards
      field: isOverview
        ? null
        : (x, y) => {
            let bestK = 0;
            let minD = Infinity;
            medIds.forEach((mIdx, k) => {
              const d = dist({ x, y }, P[mIdx]);
              if (d < minD) {
                minD = d;
                bestK = k;
              }
            });
            return [bestK, 0.22];
          }
    };
  };

  const S = [];

  // Frame 0: The Dataset & Outliers Overview
  const initialCost = totalCost(medoids);
  S.push(
    buildFrame(
      '1. The Data & Extreme Outliers',
      `We have ${N} data points in natural clusters, plus 2 extreme outliers in the far corners (shown in red). If we used standard K-Means, those two outliers would pull the cluster centers far out into empty space. K-Medoids fixes this by requiring centers to be actual real data points (medoids).`,
      medoids,
      {
        cost: initialCost,
        math: '\\mathbf{m}_k \\in \\{\\mathbf{x}_1, \\dots, \\mathbf{x}_n\\} \\quad (\\text{Centers are real points})',
        isOverview: true
      }
    )
  );

  // Frame 1: Initial Medoid Selection
  S.push(
    buildFrame(
      `2. Pick Starting Medoids (Team Captains)`,
      `We pick ${K} real data points to start as cluster centers (marked with double rings). Think of a medoid as an elected "team captain"—an actual representative member of the group, not an imaginary average coordinate.`,
      medoids,
      {
        cost: initialCost,
        math: `K = ${K} \\text{ initial medoids chosen}`
      }
    )
  );

  // Frame 2: Initial Voronoi Distance Assignment
  S.push(
    buildFrame(
      '3. Connect Points to Nearest Medoid',
      `Every point joins whichever medoid is closest to it (shown by the dashed lines). The total walking distance for all points is ${f2(initialCost)}. Next, PAM will search for point swaps that reduce this total distance.`,
      medoids,
      {
        cost: initialCost,
        math: `\\text{Total Distance } J = ${f2(initialCost)}`
      }
    )
  );

  // PAM SWAP Search Iterations
  let curCost = initialCost;
  const maxIterations = 5;

  for (let iter = 1; iter <= maxIterations; iter++) {
    let bestDelta = 0;
    let bestSwap = null;

    // Search all medoids and all candidate non-medoids
    for (let k = 0; k < K; k++) {
      for (let h = 0; h < N; h++) {
        if (medoids.includes(h)) continue;

        const candMedoids = [...medoids];
        candMedoids[k] = h;
        const candCost = totalCost(candMedoids);
        const delta = candCost - curCost;

        if (delta < bestDelta - 0.4) {
          bestDelta = delta;
          bestSwap = {
            k,
            oldMedIdx: medoids[k],
            newMedIdx: h,
            candMedoids,
            candCost,
            delta
          };
        }
      }
    }

    // If no swap achieves a reduction (ΔJ >= 0), PAM has converged
    if (!bestSwap || bestDelta >= -0.4) {
      break;
    }

    // Step A: Evaluate Candidate Swap
    S.push(
      buildFrame(
        `Round ${iter}: Test Swapping Medoid ${bestSwap.k + 1}`,
        `PAM tests replacing Medoid ${bestSwap.k + 1} with candidate point #${bestSwap.newMedIdx} (connected by the white dashed line). Swapping reduces total walking distance from ${f2(curCost)} down to ${f2(bestSwap.candCost)} (saving ${f2(-bestSwap.delta)}). Since distance decreases, this swap is approved!`,
        medoids,
        {
          cost: curCost,
          candidateIdx: bestSwap.newMedIdx,
          testedMedIdx: bestSwap.k,
          math: `\\Delta J = ${f2(bestSwap.delta)} < 0 \\quad (\\text{Distance Reduced})`
        }
      )
    );

    // Step B: Execute Swap and Reassign
    medoids = bestSwap.candMedoids;
    curCost = bestSwap.candCost;

    S.push(
      buildFrame(
        `Round ${iter}: Swap Complete — New Medoid ${bestSwap.k + 1}`,
        `Point #${bestSwap.newMedIdx} is now the official medoid for Cluster ${bestSwap.k + 1}. Cluster members reconnect to this more central representative, lowering total distance to ${f2(curCost)}.`,
        medoids,
        {
          cost: curCost,
          math: `\\mathbf{m}_{${bestSwap.k + 1}} \\leftarrow \\mathbf{x}_{${bestSwap.newMedIdx}} \\quad (J = ${f2(curCost)})`
        }
      )
    );
  }

  // Final Frame: Convergence Reached
  S.push(
    buildFrame(
      'Optimal Medoids Found (Converged)',
      `PAM tested swapping with every other point, and no swap reduced the total distance. The clustering is complete! Notice that the two far-corner outliers had ZERO pull on the medoids—the centers stayed purely focused on the real clusters.`,
      medoids,
      {
        cost: curCost,
        math: '\\Delta J \\ge 0 \\quad (\\text{Optimal clustering achieved})',
        isConverged: true
      }
    )
  );

  return S;
}

export const kmedoidsCluster = {
  slug: 'k-medoids',
  n: 'k-Medoids (PAM)',
  g: 'Unsupervised',
  gen: kmedoids,
  pm: ['K', 2, 4, 3],
  i: 'Robust clustering where centers are actual data samples, resistant to outliers.'
};
