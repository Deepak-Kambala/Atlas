import { G, cp, f2, f3, mean } from './common';

/**
 * Ridge Regression Simulation Engine (L2 Regularization)
 * Minimizes MSE + λ ||w||² to prevent overfitting and shrink coefficients.
 */
export function ridgereg(r, paramLambda = 2) {
  // Collinear noisy data with an extreme high-leverage outlier
  const P = [
    { x: 12, y: 16, c: 1 },
    { x: 20, y: 24, c: 1 },
    { x: 28, y: 27, c: 1 },
    { x: 38, y: 39, c: 1 },
    { x: 46, y: 44, c: 1 },
    { x: 55, y: 52, c: 1 },
    { x: 64, y: 59, c: 1 },
    { x: 74, y: 66, c: 1 },
    { x: 82, y: 72, c: 1 },
    { x: 88, y: 22, c: 0 } // High-leverage outlier that misleads OLS
  ];

  // Helper to compute closed-form ridge slope m and intercept b:
  // w = (X^T X + λ I)^(-1) X^T y
  const solveRidge = lam => {
    const xbar = mean(P.map(p => p.x / 100));
    const ybar = mean(P.map(p => p.y / 100));
    let num = 0, den = 0;
    P.forEach(p => {
      const x = p.x / 100 - xbar;
      const y = p.y / 100 - ybar;
      num += x * y;
      den += x * x;
    });
    const m = num / (den + lam);
    const b = ybar - m * xbar;
    return { m, b };
  };

  const ols = solveRidge(0);
  const lams = [0, 0.05, 0.18, 0.5, 1.2, 3.0, 8.0];

  const S = [
    {
      t: 'The Problem with OLS',
      d: 'Ordinary Least Squares (OLS) minimizes MSE without constraints. A single outlier or collinear feature can pull the slope wildly off-track, causing massive variance on new data.',
      pts: P,
      lines: [
        { a: [0, ols.b * 100], b: [100, (ols.m + ols.b) * 100], col: '--p6', w: 1.2 }
      ],
      texts: [
        { x: 50, y: 88, text: 'OLS line (steeped by outlier)', col: '--p6', size: 3.2 }
      ]
    }
  ];

  lams.forEach((lam, idx) => {
    const { m, b } = solveRidge(lam);
    const mse = mean(P.map(p => (m * p.x / 100 + b - p.y / 100) ** 2));
    const l2Norm = m ** 2;
    const totalLoss = mse + lam * l2Norm;

    const lines = [
      // Ghost of unregularized OLS for visual comparison
      { a: [0, ols.b * 100], b: [100, (ols.m + ols.b) * 100], col: '--mu', w: 0.5, dash: '3 3' },
      // Residuals to ridge line
      ...P.map(p => ({
        a: [p.x, p.y],
        b: [p.x, (m * p.x / 100 + b) * 100],
        col: '--p0',
        w: 0.35
      })),
      // Active Ridge line
      { a: [0, b * 100], b: [100, (m + b) * 100], col: '--p1', w: 1.4 }
    ];

    const circles = [
      // L2 penalty budget visualization (shrinkage circle at corner)
      { x: 18, y: 82, rx: Math.max(3, 14 - idx * 1.6), ry: Math.max(3, 14 - idx * 1.6), col: '--p1', w: 0.5 }
    ];

    const texts = [
      { x: 18, y: 82, text: `||w||²=${f2(l2Norm)}`, col: '--p1', size: 2.6 },
      { x: 75, y: 90, text: `λ = ${lam.toFixed(2)}`, col: '--tx', size: 3.4 }
    ];

    S.push({
      t: idx === 0 ? 'λ = 0 (Unregularized OLS)' : `Regularization: λ = ${lam.toFixed(2)}`,
      d:
        idx === 0
          ? `With λ = 0, Ridge is identical to OLS. Slope m = ${f2(m)}, ||w||² = ${f2(l2Norm)}. The outlier pulls the model down at the right.`
          : `Increasing λ penalizes large coefficients. Slope shrinks to m = ${f2(m)} (MSE = ${f3(mse)}, L2 norm = ${f2(l2Norm)}). The line becomes more horizontal, resilient, and stable.`,
      v: totalLoss,
      x: idx,
      pts: P,
      lines,
      circles,
      texts
    });
  });

  return S;
}

export const ridgeRegression = {
  slug: 'ridge-regression',
  n: 'Ridge Regression',
  g: 'Supervised',
  gen: ridgereg,
  pm: ['λ (penalty)', 0, 8, 2],
  i: 'Shrinks coefficients with an L2 penalty to guard against overfitting.'
};
