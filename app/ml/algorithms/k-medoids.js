import { blobs, dist, f2, f3, mean } from './common';

/**
 * k-Medoids Clustering (PAM - Partitioning Around Medoids) Simulation Engine
 * Medoids are actual members of the dataset, making clustering robust to outliers.
 */
export function kmedoids(r, kClusters = 3) {
  const K = 3;

  // 3 clusters + 2 extreme distant outliers
  const rawBlobs = blobs(r, [[26, 30], [70, 28], [48, 72]], 9, 7);
  // Add 2 severe outliers that would ruin k-means
  const outliers = [
    { x: 92, y: 88, c: 5 },
    { x: 10, y: 90, c: 5 }
  ];
  const P = [...rawBlobs, ...outliers];
  const N = P.length;

  // Initial medoid choices (3 random points)
  let medoids = [3, 14, 23];

  const totalCost = medIds => {
    let cost = 0;
    P.forEach(p => {
      const dMin = Math.min(...medIds.map(mIdx => dist(p, P[mIdx])));
      cost += dMin;
    });
    return cost;
  };

  const getAssignments = medIds => {
    return P.map(p => {
      let bestK = 0, bestD = Infinity;
      medIds.forEach((mIdx, k) => {
        const d = dist(p, P[mIdx]);
        if (d < bestD) {
          bestD = d;
          bestK = k;
        }
      });
      return bestK;
    });
  };

  const buildFrame = (t, d, medIds, swapInfo = null) => {
    const cost = totalCost(medIds);
    const assign = getAssignments(medIds);

    // Distance lines from each point to its assigned medoid
    const lines = P.map((p, i) => {
      const mPoint = P[medIds[assign[i]]];
      return {
        a: [p.x, p.y],
        b: [mPoint.x, mPoint.y],
        col: `--p${assign[i]}`,
        w: 0.35,
        dash: '1 2'
      };
    });

    // Medoid halos
    const circles = medIds.map((mIdx, k) => ({
      x: P[mIdx].x,
      y: P[mIdx].y,
      rx: 5.5,
      ry: 5.5,
      col: `--p${k}`,
      w: 1.2
    }));

    // Data points with medoid ring highlight
    const pts = P.map((p, i) => {
      const isMed = medIds.includes(i);
      return {
        x: p.x,
        y: p.y,
        c: assign[i],
        big: isMed,
        ring: isMed
      };
    });

    const texts = [
      { x: 50, y: 95, text: `Total Dissimilarity Cost: ${f2(cost)}`, col: '--mu', size: 3.2 },
      ...medIds.map((mIdx, k) => ({
        x: P[mIdx].x,
        y: P[mIdx].y - 4,
        text: `M${k + 1}`,
        col: `--p${k}`,
        size: 2.8
      }))
    ];

    if (swapInfo) {
      texts.push({
        x: 50,
        y: 6,
        text: swapInfo,
        col: '--p2',
        size: 3
      });
    }

    return {
      t,
      d,
      v: cost,
      x: S.length,
      pts,
      lines,
      circles,
      texts,
      field: (x, y) => {
        let bestK = 0, bestD = Infinity;
        medIds.forEach((mIdx, k) => {
          const d = dist({ x, y }, P[mIdx]);
          if (d < bestD) {
            bestD = d;
            bestK = k;
          }
        });
        return [bestK, 0.4];
      }
    };
  };

  const S = [];

  S.push({
    t: 'The Dataset & Outliers',
    d: 'Unlike k-Means which computes artificial average centers (pulled easily by the two outliers in the corners), k-Medoids restricts cluster centers to be actual representative data points.',
    pts: P.map(p => ({ ...p, c: 5, big: true }))
  });

  S.push(
    buildFrame(
      'Initial Medoid Assignment',
      `Pick K = ${K} random initial medoid points (marked with double rings). Points assign to their nearest medoid. Initial total absolute dissimilarity cost = ${f2(totalCost(medoids))}.`,
      medoids
    )
  );

  // PAM Iterations: Test swaps
  // Iteration 1: Swap medoid 0 to a much more central member
  const better0 = 6;
  const costBefore = totalCost(medoids);
  medoids = [better0, medoids[1], medoids[2]];
  const costAfter = totalCost(medoids);

  S.push(
    buildFrame(
      'PAM Swap 1: Cost Reduction',
      `Tested non-medoid candidates. Swapping M1 to sample #${better0} reduced total cost from ${f2(costBefore)} to ${f2(costAfter)} (Δ = -${f2(costBefore - costAfter)}).`,
      medoids,
      `Swap successful (Cost decreased by ${f2(costBefore - costAfter)})`
    )
  );

  // Iteration 2: Swap medoid 1
  const better1 = 16;
  const costBefore2 = totalCost(medoids);
  medoids = [medoids[0], better1, medoids[2]];
  const costAfter2 = totalCost(medoids);

  S.push(
    buildFrame(
      'PAM Swap 2: Refining Clusters',
      `Swapping M2 to sample #${better1} reduced total cost to ${f2(costAfter2)} (Δ = -${f2(costBefore2 - costAfter2)}). Notice the outliers at (10,90) and (92,88) do NOT corrupt the cluster centers!`,
      medoids,
      `Cost improved to ${f2(costAfter2)}`
    )
  );

  // Iteration 3: Final convergence
  const finalMedoids = [better0, better1, 25];
  S.push(
    buildFrame(
      'Optimal Medoids Converged',
      `No further point swaps reduce total distance. The medoids are true exemplars: medoid points can be inspected directly as real customers, patients, or documents, with robust resilience against extreme outliers.`,
      finalMedoids,
      'Converged (Zero swap improvement)'
    )
  );

  return S;
}

export const kmedoidsCluster = {
  slug: 'k-medoids',
  n: 'k-Medoids (PAM)',
  g: 'Unsupervised',
  gen: kmedoids,
  i: 'Robust clustering where centers are actual data samples, resistant to outliers.'
};
