import { G, cp, f2, f3, mean } from '../common';

/**
 * Bias-Variance Trade-off Simulation Engine
 * Demonstrates how model capacity (polynomial degree) shifts error between bias and variance.
 */
export function biasVariance(r) {
  // Underlying ground truth function: y = 20 + 55 * sin(pi * x / 100)
  const trueFn = x => 20 + 55 * Math.sin((Math.PI * x) / 100);

  // Training set (16 points with noise)
  const trainPts = [
    10, 16, 22, 28, 35, 42, 48, 55, 62, 68, 75, 82, 88, 92
  ].map(x => ({
    x,
    y: cp(trueFn(x) + G(r) * 9),
    c: 1
  }));

  // Held-out test set (12 points) to evaluate out-of-sample variance
  const testPts = [
    13, 25, 38, 50, 60, 72, 80, 85, 90
  ].map(x => ({
    x,
    y: cp(trueFn(x) + G(r) * 9),
    c: 0,
    h: true
  }));

  // Polynomial least-squares solver for degree d (using normal equations)
  const fitPoly = d => {
    const N = trainPts.length;
    // Build Vandermonde system X^T X w = X^T y
    const A = Array.from({ length: d + 1 }, () => new Float64Array(d + 1));
    const B = new Float64Array(d + 1);

    for (let r = 0; r <= d; r++) {
      for (let c = 0; c <= d; c++) {
        let s = 0;
        for (let i = 0; i < N; i++) s += (trainPts[i].x / 100) ** (r + c);
        A[r][c] = s;
      }
      let sy = 0;
      for (let i = 0; i < N; i++) sy += (trainPts[i].y / 100) * ((trainPts[i].x / 100) ** r);
      B[r] = sy;
    }

    // Solve via Gaussian elimination with partial pivoting
    const n = d + 1;
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]), maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < n; k++) {
        const tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      const tmpB = B[maxRow];
      B[maxRow] = B[i];
      B[i] = tmpB;

      for (let k = i + 1; k < n; k++) {
        const c = -(A[k][i] / (A[i][i] + 1e-12));
        for (let j = i; j < n; j++) {
          if (i === j) A[k][j] = 0;
          else A[k][j] += c * A[i][j];
        }
        B[k] += c * B[i];
      }
    }

    const w = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let s = B[i];
      for (let k = i + 1; k < n; k++) s -= A[i][k] * w[k];
      w[i] = s / (A[i][i] + 1e-12);
    }

    const predict = x => {
      let val = 0;
      const xNorm = x / 100;
      for (let i = 0; i <= d; i++) val += w[i] * (xNorm ** i);
      return val * 100;
    };

    return predict;
  };

  const degrees = [1, 2, 3, 5, 8];
  const results = degrees.map(deg => {
    const fn = fitPoly(deg);
    const trainMSE = mean(trainPts.map(p => (fn(p.x) - p.y) ** 2));
    const testMSE = mean(testPts.map(p => (fn(p.x) - p.y) ** 2));
    return { deg, fn, trainMSE, testMSE };
  });

  const S = [
    {
      t: 'Ground Truth & Data',
      d: 'Solid dots: 14 noisy training samples from a non-linear process. Hollow orange dots: held-out test points. Our goal is to balance model flexibility so it learns the true pattern without memorizing noise.',
      pts: [...trainPts, ...testPts],
      lines: Array.from({ length: 40 }, (_, i) => {
        const x1 = (i / 40) * 100;
        const x2 = ((i + 1) / 40) * 100;
        return { a: [x1, trueFn(x1)], b: [x2, trueFn(x2)], col: '--bd', w: 0.6, dash: '3 2' };
      }),
      texts: [{ x: 50, y: 88, text: 'Dashed line: Ground truth function', col: '--mu', size: 3 }]
    }
  ];

  results.forEach((res, idx) => {
    // Generate curved line segments for the fitted polynomial
    const polyLines = Array.from({ length: 48 }, (_, i) => {
      const x1 = 2 + (i / 48) * 96;
      const x2 = 2 + ((i + 1) / 48) * 96;
      return {
        a: [x1, cp(res.fn(x1))],
        b: [x2, cp(res.fn(x2))],
        col: res.deg === 3 ? '--p2' : res.deg > 3 ? '--p6' : '--p1',
        w: 1.4
      };
    });

    const isOptimal = res.deg === 3;
    const isUnderfit = res.deg <= 2;
    const isOverfit = res.deg >= 5;

    S.push({
      t: `Degree ${res.deg}: ${isUnderfit ? 'High Bias (Underfit)' : isOptimal ? 'Optimal Trade-off' : 'High Variance (Overfit)'}`,
      d:
        isUnderfit
          ? `Degree ${res.deg} lacks capacity to capture curvature. High bias. Train MSE = ${f2(res.trainMSE)}, Test MSE = ${f2(res.testMSE)}.`
          : isOptimal
          ? `Degree 3 captures the true signal without fitting noise. Balanced bias and variance: minimum Test MSE = ${f2(res.testMSE)}.`
          : `Degree ${res.deg} has too much freedom: it wiggles to hit training points (Train MSE = ${f2(res.trainMSE)}), but explodes on unseen test points (Test MSE = ${f2(res.testMSE)})!`,
      v: res.testMSE,
      x: idx + 1,
      pts: [...trainPts, ...testPts],
      lines: [
        // Ground truth ghost
        ...Array.from({ length: 30 }, (_, i) => {
          const x1 = (i / 30) * 100;
          const x2 = ((i + 1) / 30) * 100;
          return { a: [x1, trueFn(x1)], b: [x2, trueFn(x2)], col: '--bd', w: 0.4, dash: '2 2' };
        }),
        ...polyLines
      ],
      texts: [
        { x: 30, y: 92, text: `Train MSE: ${f2(res.trainMSE)}`, col: '--p1', size: 3 },
        { x: 70, y: 92, text: `Test MSE: ${f2(res.testMSE)}`, col: res.deg >= 5 ? '--p6' : '--p0', size: 3 }
      ]
    });
  });

  // Summary curve for the chart
  S.curve = {
    t: 'Bias-Variance Trade-off Curve (Model Complexity vs MSE)',
    xl: 'complexity (degree)',
    yl: 'MSE',
    x: degrees,
    s: [
      { n: 'Train MSE (Bias drops)', y: results.map(r => r.trainMSE) },
      { n: 'Test MSE (Variance explodes)', y: results.map(r => r.testMSE) }
    ],
    hi: 3
  };

  return S;
}

export const biasVarianceTradeoff = {
  slug: 'bias-variance',
  n: 'Bias–Variance Trade-off',
  g: 'Supervised',
  gen: biasVariance,
  i: 'Balances model capacity to minimize generalization error.'
};
