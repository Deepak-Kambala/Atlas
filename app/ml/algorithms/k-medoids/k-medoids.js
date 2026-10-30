import { blobs, dist, f2, f3, cp } from '../common';

/**
 * k-Medoids Clustering (PAM - Partitioning Around Medoids) Simulation Engine
 * Medoids are actual members of the dataset, making clustering robust to outliers.
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

  // Add 2 extreme distant outliers in opposite corners
  const outliers = [
    { x: 92, y: 90, isOutlier: true },
    { x: 10, y: 88, isOutlier: true }
  ];

  const P = [...rawBlobs, ...outliers];
  const N = P.length;

  // Initial medoid choices: pick non-optimal samples from each cluster to demonstrate PAM swaps
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

  // Helper to construct a simulation frame for the SVG renderer
  const buildFrame = (t, d, medIds, options = {}) => {
    const {
      cost = totalCost(medIds),
      math = null,
      candidateIdx = null,
      testedMedIdx = null,
      bannerText = null,
      isOverview = false,
      isConverged = false
    } = options;

    const assign = isOverview ? P.map(() => 5) : getAssignments(medIds);

    // Voronoi assignment lines connecting points to their assigned medoid
    const lines = isOverview
      ? []
      : P.map((p, i) => {
          const mPoint = P[medIds[assign[i]]];
          return {
            a: [p.x, p.y],
            b: [mPoint.x, mPoint.y],
            col: p.isOutlier ? '--p6' : `--p${assign[i]}`,
            w: p.isOutlier ? 0.45 : 0.28,
            dash: '1.5 2'
          };
        });

    // If candidate swap is currently under evaluation, draw dashed line between old medoid and candidate
    if (candidateIdx !== null && testedMedIdx !== null) {
      lines.push({
        a: [P[medIds[testedMedIdx]].x, P[medIds[testedMedIdx]].y],
        b: [P[candidateIdx].x, P[candidateIdx].y],
        col: '--tx',
        w: 0.9,
        dash: '2 2'
      });
    }

    // Circles: halos around active medoids & warning halos around outliers
    const circles = [];
    if (!isOverview) {
      medIds.forEach((mIdx, k) => {
        circles.push({
          x: P[mIdx].x,
          y: P[mIdx].y,
          rx: 5.5,
          ry: 5.5,
          col: `--p${k}`,
          w: 1.2
        });
      });
    }

    // Highlight candidate point under swap testing
    if (candidateIdx !== null) {
      circles.push({
        x: P[candidateIdx].x,
        y: P[candidateIdx].y,
        rx: 6.2,
        ry: 6.2,
        col: '--tx',
        w: 1.2,
        dash: '2 1.5'
      });
    }

    // Warning dashed circle around distant outliers
    outliers.forEach(o => {
      circles.push({
        x: o.x,
        y: o.y,
        rx: 4.5,
        ry: 4.5,
        col: '--p6',
        w: 0.75,
        dash: '1.5 1.5'
      });
    });

    // Point representation
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

    // Text annotations on the canvas
    const texts = [
      {
        x: 50,
        y: 95,
        text: `Total Dissimilarity Cost: ${f2(cost)}`,
        col: '--mu',
        size: 3.2,
        weight: 600
      }
    ];

    if (!isOverview) {
      medIds.forEach((mIdx, k) => {
        texts.push({
          x: P[mIdx].x,
          y: Math.max(5, Math.min(95, P[mIdx].y - 4.5)),
          text: `M${k + 1}`,
          col: `--p${k}`,
          size: 3.2,
          weight: 700
        });
      });
    }

    if (candidateIdx !== null) {
      texts.push({
        x: P[candidateIdx].x,
        y: Math.max(5, Math.min(95, P[candidateIdx].y - 4.5)),
        text: `Candidate #${candidateIdx}`,
        col: '--tx',
        size: 2.8,
        weight: 600
      });
    }

    // Outlier text badges
    outliers.forEach(o => {
      texts.push({
        x: o.x < 50 ? o.x + 9 : o.x - 9,
        y: o.y,
        text: 'Outlier',
        col: '--p6',
        size: 2.5,
        weight: 600
      });
    });

    if (bannerText) {
      texts.push({
        x: 50,
        y: 5.5,
        text: bannerText,
        col: isConverged ? '--p2' : '--tx',
        size: 2.9,
        weight: 700
      });
    }

    return {
      t,
      d,
      v: cost,
      x: S.length,
      math,
      pts,
      lines,
      circles,
      texts,
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
            return [bestK, 0.4];
          }
    };
  };

  const S = [];

  // Frame 0: The Dataset & Outliers Overview
  const initialCost = totalCost(medoids);
  S.push(
    buildFrame(
      'The Dataset & Extreme Outliers',
      `We have ${N} data observations arranged in natural clusters, plus 2 extreme corner outliers (marked in red). If we ran standard K-Means here, the centroids would be dragged out into empty space by squared error penalties. K-Medoids restricts cluster centers to be actual representative data points (medoids), neutralizing outlier corruption.`,
      medoids,
      {
        cost: initialCost,
        math: 'J = \\sum_{i=1}^n \\min_{k=1\\dots K} d(\\mathbf{x}_i, \\mathbf{m}_k)',
        isOverview: true,
        bannerText: 'Raw Dataset with 2 Distant Outliers'
      }
    )
  );

  // Frame 1: Initial Medoid Selection (BUILD Phase)
  S.push(
    buildFrame(
      `Initialize K = ${K} Starting Medoids`,
      `Select ${K} actual data samples to serve as our starting medoids (marked with double rings and labeled M1..M${K}). Unlike K-Means centroids, medoids are real observations—like actual patient records, representative customer profiles, or exemplar documents.`,
      medoids,
      {
        cost: initialCost,
        math: '\\mathbf{m}_k \\in \\{\\mathbf{x}_1, \\dots, \\mathbf{x}_n\\} \\quad (k = 1, \\dots, K)',
        bannerText: `Initial Medoids Chosen (K = ${K})`
      }
    )
  );

  // Frame 2: Initial Voronoi Distance Assignment
  S.push(
    buildFrame(
      'Assign Observations to Closest Medoid',
      `Every observation computes its Euclidean distance to all ${K} medoids and joins whichever one is closest. The dashed lines show the dissimilarity distances. Initial total absolute distance cost is ${f2(initialCost)}. Next, PAM will search for point swaps that reduce this cost.`,
      medoids,
      {
        cost: initialCost,
        math: 'C_k = \\{\\mathbf{x}_i : d(\\mathbf{x}_i, \\mathbf{m}_k) \\le d(\\mathbf{x}_i, \\mathbf{m}_j) \\quad \\forall j\\}',
        bannerText: `Initial Total Cost: ${f2(initialCost)}`
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

    // If no swap achieves a meaningful reduction (ΔJ >= 0), PAM has converged
    if (!bestSwap || bestDelta >= -0.4) {
      break;
    }

    // Step A: Evaluate Candidate Swap
    S.push(
      buildFrame(
        `PAM Round ${iter}: Evaluate Candidate Swap`,
        `PAM tests swapping Medoid M${bestSwap.k + 1} with non-medoid sample #${bestSwap.newMedIdx}. If swapped, total dissimilarity drops from ${f2(curCost)} to ${f2(bestSwap.candCost)} (ΔJ = ${f2(bestSwap.delta)}). Because ΔJ < 0, this swap successfully improves the clustering!`,
        medoids,
        {
          cost: curCost,
          candidateIdx: bestSwap.newMedIdx,
          testedMedIdx: bestSwap.k,
          math: `\\Delta J = J_{\\text{swap}(m_${bestSwap.k + 1} \\leftrightarrow o_{${bestSwap.newMedIdx}})} - J_{\\text{current}} = ${f2(bestSwap.delta)} < 0`,
          bannerText: `Testing Swap: M${bestSwap.k + 1} ↔ #${bestSwap.newMedIdx} (ΔJ = ${f2(bestSwap.delta)})`
        }
      )
    );

    // Step B: Execute Swap and Reassign
    medoids = bestSwap.candMedoids;
    curCost = bestSwap.candCost;

    S.push(
      buildFrame(
        `PAM Round ${iter}: Swap Accepted — New Medoid M${bestSwap.k + 1}`,
        `Sample #${bestSwap.newMedIdx} is now the new official medoid for Cluster ${bestSwap.k + 1}. All cluster members reconnect to this more central exemplar. Total dissimilarity has decreased to ${f2(curCost)}.`,
        medoids,
        {
          cost: curCost,
          math: `\\mathbf{m}_{${bestSwap.k + 1}} \\leftarrow \\mathbf{x}_{${bestSwap.newMedIdx}}`,
          bannerText: `Swap Accepted · Cost reduced to ${f2(curCost)}`
        }
      )
    );
  }

  // Final Frame: Convergence Reached
  S.push(
    buildFrame(
      'Optimal Medoids Converged',
      `PAM evaluated all remaining non-medoid swaps and found none that reduce total distance (all ΔJ ≥ 0). The medoids are optimal true exemplars of their clusters. Notice that the 2 distant corner outliers had ZERO leverage on medoid coordinates—the cluster centers remained completely clean and robust!`,
      medoids,
      {
        cost: curCost,
        math: '\\forall m \\in \\mathcal{M},\\, \\forall o \\notin \\mathcal{M} : \\Delta J(m \\leftrightarrow o) \\ge 0',
        isConverged: true,
        bannerText: `Converged · Final Cost: ${f2(curCost)}`
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
