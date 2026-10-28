import { G, cp, f2, f3, mean } from './common';

/**
 * Linear Regression Simulation Engine
 * Fits a straight line ŷ = m*x + b by minimizing Mean Squared Error (MSE) using gradient descent.
 */
export function linreg(r) {
  const P = Array.from({ length: 30 }, () => {
    const x = 5 + r() * 90;
    return { x, y: cp(0.6 * x + 15 + G(r) * 8), c: 5 };
  });

  let m = 0, b = 0.5, it = 0;
  const mse = () => mean(P.map(p => (m * p.x / 100 + b - p.y / 100) ** 2));
  const fr = (t, d) => ({
    t,
    d,
    v: mse(),
    x: it,
    pts: P,
    lines: [
      ...P.map(p => ({ a: [p.x, p.y], b: [p.x, (m * p.x / 100 + b) * 100], col: '--p0', w: 0.35 })),
      { a: [0, b * 100], b: [100, (m + b) * 100], col: '--ac', w: 1.3 }
    ]
  });

  const S = [
    {
      t: 'The data',
      d: 'Supervised regression: every point has an input x (horizontal) and a known answer y (vertical). Goal: learn a line ŷ = m·x + b that predicts y for new values of x.',
      pts: P
    },
    fr('A poor first guess', `We start with m = 0 and b = 0.5, a flat line (axes scaled 0–1). Orange segments are residuals: how far the line is from each real point. Mean squared error (MSE) = ${f3(mse())}.`)
  ];

  [1, 3, 8, 20, 50, 120, 300].forEach(n => {
    while (it < n) {
      const e = P.map(p => m * p.x / 100 + b - p.y / 100);
      m -= 0.5 * 2 * mean(e.map((v, i) => v * P[i].x / 100));
      b -= 0.5 * 2 * mean(e);
      it++;
    }
    S.push(
      fr(
        n === 300 ? 'Converged' : `After ${n} step${n > 1 ? 's' : ''}`,
        `m = ${f2(m)}, b = ${f2(b)}, MSE = ${f3(mse())}. Each gradient-descent step nudges m and b in the direction that shrinks the squared error.` +
          (n === 300 ? ' The line now sits through the middle of the cloud: the best least-squares fit.' : '')
      )
    );
  });

  return S;
}

export const linearRegression = {
  slug: 'linear-regression',
  n: 'Linear Regression',
  g: 'Supervised',
  gen: linreg,
  i: 'Predicts a number by fitting the best straight line.'
};
