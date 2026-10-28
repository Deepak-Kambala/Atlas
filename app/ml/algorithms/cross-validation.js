import { G, cp, f2, f3, mean } from './common';

/**
 * k-Fold Cross-Validation & LOO Simulation Engine
 * Demonstrates dataset partitioning, rotating validation folds, and out-of-sample aggregation.
 */
export function crossVal(r, kFolds = 5) {
  const K = Math.max(2, Math.min(10, kFolds));
  const N = 25;

  // Generate ground truth data points
  const P = Array.from({ length: N }, (_, idx) => {
    const x = 5 + (idx / (N - 1)) * 90;
    const y = cp(20 + 0.6 * x + G(r) * 7);
    return { id: idx, x, y };
  });

  // Assign points into K balanced folds
  const foldSize = Math.ceil(N / K);
  const folds = Array.from({ length: K }, (_, k) => {
    return P.slice(k * foldSize, Math.min(N, (k + 1) * foldSize));
  });

  // Helper: fit simple linear regression on training points
  const fitModel = trainPts => {
    const xm = mean(trainPts.map(p => p.x));
    const ym = mean(trainPts.map(p => p.y));
    let num = 0, den = 0;
    trainPts.forEach(p => {
      num += (p.x - xm) * (p.y - ym);
      den += (p.x - xm) ** 2;
    });
    const m = num / (den + 1e-9);
    const b = ym - m * xm;
    return { m, b };
  };

  const foldScores = [];

  const S = [
    {
      t: '1. Dataset Partitioning (K Folds)',
      d: `We have N = ${N} samples. In ${K}-fold cross-validation, the dataset is randomly partitioned into ${K} equal-sized subsets. Each subset takes a turn as the validation set while the remaining ${K - 1} subsets train the model.`,
      pts: P.map(p => ({ ...p, c: 5, big: true })),
      rects: Array.from({ length: K }, (_, k) => ({
        x: 6 + (k / K) * 88,
        y: 82,
        w: 88 / K - 1.5,
        h: 10,
        rx: 1.5,
        fill: '--cd',
        col: '--bd'
      })),
      texts: [
        { x: 50, y: 96, text: `${K}-Fold Partitioning (N=${N})`, col: '--mu', size: 3.2 },
        ...Array.from({ length: K }, (_, k) => ({
          x: 6 + (k / K) * 88 + (88 / K - 1.5) / 2,
          y: 87,
          text: `F${k + 1}`,
          col: '--mu',
          size: 2.5
        }))
      ]
    }
  ];

  for (let valFold = 0; valFold < K; valFold++) {
    const valPts = folds[valFold];
    const trainPts = folds.filter((_, k) => k !== valFold).flat();

    const { m, b } = fitModel(trainPts);
    const valMSE = mean(valPts.map(p => (m * p.x + b - p.y) ** 2));
    foldScores.push(valMSE);

    // Visual partition rectangles representing fold assignments
    const rects = Array.from({ length: K }, (_, k) => ({
      x: 6 + (k / K) * 88,
      y: 82,
      w: 88 / K - 1.5,
      h: 10,
      rx: 1.5,
      fill: k === valFold ? '--p0' : '--p1',
      opacity: k === valFold ? 0.9 : 0.45,
      col: k === valFold ? '--p0' : '--p1'
    }));

    // Data points colored by train vs validation role
    const pts = [
      ...trainPts.map(p => ({ x: p.x, y: p.y * 0.72 + 6, c: 1 })),
      ...valPts.map(p => ({ x: p.x, y: p.y * 0.72 + 6, c: 0, big: true, ring: true }))
    ];

    // Residual lines on validation points only
    const lines = [
      // Model line
      { a: [0, b * 0.72 + 6], b: [100, (m * 100 + b) * 0.72 + 6], col: '--ac', w: 1.1 },
      // Residuals
      ...valPts.map(p => ({
        a: [p.x, p.y * 0.72 + 6],
        b: [p.x, (m * p.x + b) * 0.72 + 6],
        col: '--p0',
        w: 0.6
      }))
    ];

    const texts = [
      { x: 50, y: 96, text: `Fold ${valFold + 1} of ${K} as Validation (Orange)`, col: '--mu', size: 3.2 },
      ...Array.from({ length: K }, (_, k) => ({
        x: 6 + (k / K) * 88 + (88 / K - 1.5) / 2,
        y: 87,
        text: k === valFold ? 'VAL' : 'TRAIN',
        col: k === valFold ? '--on' : '--tx',
        size: 2.2
      })),
      { x: 50, y: 4, text: `Fold ${valFold + 1} Validation MSE: ${f2(valMSE)}`, col: '--p0', size: 3 }
    ];

    S.push({
      t: `Iteration ${valFold + 1}: Validate on Fold ${valFold + 1}`,
      d: `Trained model on ${trainPts.length} points (blue folds). Evaluating on the ${valPts.length} unseen points of Fold ${valFold + 1} (orange dots with rings). Validation MSE = ${f2(valMSE)}.`,
      v: valMSE,
      x: valFold + 1,
      pts,
      lines,
      rects,
      texts
    });
  }

  // Final Aggregation Step
  const cvMean = mean(foldScores);
  const cvVar = mean(foldScores.map(s => (s - cvMean) ** 2));
  const cvStd = Math.sqrt(cvVar);

  S.push({
    t: 'Aggregated Cross-Validation Result',
    d: `All ${K} folds completed. Overall Cross-Validation Score CV_(${K}) = ${f2(cvMean)} ± ${f2(cvStd / Math.sqrt(K))}. This gives an honest estimate of generalization error on completely unseen data.`,
    v: cvMean,
    x: K + 1,
    pts: P.map(p => ({ x: p.x, y: p.y * 0.72 + 6, c: 2, big: true })),
    rects: Array.from({ length: K }, (_, k) => ({
      x: 6 + (k / K) * 88,
      y: 82,
      w: 88 / K - 1.5,
      h: 10,
      rx: 1.5,
      fill: '--p2',
      opacity: 0.8,
      col: '--p2'
    })),
    texts: [
      { x: 50, y: 96, text: `Aggregated Over ${K} Folds`, col: '--mu', size: 3.2 },
      ...Array.from({ length: K }, (_, k) => ({
        x: 6 + (k / K) * 88 + (88 / K - 1.5) / 2,
        y: 87,
        text: f2(foldScores[k]),
        col: '--on',
        size: 2.2
      })),
      { x: 50, y: 4, text: `Mean CV Score = ${f2(cvMean)}  (Std: ±${f2(cvStd)})`, col: '--p2', size: 3.2 }
    ]
  });

  return S;
}

export const crossValidation = {
  slug: 'cross-validation',
  n: 'k-Fold Cross-Validation',
  g: 'Supervised',
  gen: crossVal,
  pm: ['k (number of folds)', 2, 10, 5],
  i: 'Partitions data into k folds to evaluate out-of-sample performance.'
};
