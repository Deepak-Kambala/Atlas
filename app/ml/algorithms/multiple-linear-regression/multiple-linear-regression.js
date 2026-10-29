import { G, cp, f2, f3, mean } from '../common';

/**
 * Multiple Linear Regression Simulation Engine
 * Fits a 2-feature plane ŷ = w1*x1 + w2*x2 + b in 3D space by minimizing MSE.
 * Visualized using an isometric 3D perspective projection.
 */
export function multilinreg(r) {
  // Generate 3D data points: x1 in [0.1, 0.9], x2 in [0.1, 0.9], y = 0.5*x1 + 0.4*x2 + 0.1 + noise
  const rawP = Array.from({ length: 28 }, () => {
    const x1 = 0.12 + r() * 0.76;
    const x2 = 0.12 + r() * 0.76;
    const y = Math.max(0.05, Math.min(0.95, 0.48 * x1 + 0.38 * x2 + 0.08 + G(r) * 0.06));
    return { x1, x2, y };
  });

  // Isometric projection helper from 3D (x1, x2, y) in [0, 1] to 2D canvas [0, 100]
  // origin at (50, 20), x1 goes down-right, x2 goes down-left, y goes vertically up
  const proj = (x1, x2, y) => {
    const px = 50 + (x1 - x2) * 42;
    const py = 24 + (x1 + x2) * 22 + y * 46;
    return [Math.max(2, Math.min(98, px)), Math.max(2, Math.min(98, py))];
  };

  let w1 = 0.0, w2 = 0.0, b = 0.5, it = 0;
  const mse = () => mean(rawP.map(p => (w1 * p.x1 + w2 * p.x2 + b - p.y) ** 2));
  const r2 = () => {
    const yMean = mean(rawP.map(p => p.y));
    const ssTot = rawP.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
    const ssRes = rawP.reduce((s, p) => s + (p.y - (w1 * p.x1 + w2 * p.x2 + b)) ** 2, 0);
    return Math.max(0, 1 - ssRes / (ssTot + 1e-9));
  };

  const buildFrame = (t, d) => {
    // 3D Plane wireframe mesh (4 corners + center lines)
    const corners = [
      proj(0.1, 0.1, w1 * 0.1 + w2 * 0.1 + b),
      proj(0.9, 0.1, w1 * 0.9 + w2 * 0.1 + b),
      proj(0.9, 0.9, w1 * 0.9 + w2 * 0.9 + b),
      proj(0.1, 0.9, w1 * 0.1 + w2 * 0.9 + b)
    ];

    const mid1 = proj(0.5, 0.1, w1 * 0.5 + w2 * 0.1 + b);
    const mid2 = proj(0.5, 0.9, w1 * 0.5 + w2 * 0.9 + b);
    const mid3 = proj(0.1, 0.5, w1 * 0.1 + w2 * 0.5 + b);
    const mid4 = proj(0.9, 0.5, w1 * 0.9 + w2 * 0.5 + b);

    // Ground grid axes
    const g00 = proj(0.1, 0.1, 0);
    const g10 = proj(0.9, 0.1, 0);
    const g11 = proj(0.9, 0.9, 0);
    const g01 = proj(0.1, 0.9, 0);

    const lines = [
      // Ground plane reference grid (dashed)
      { a: g00, b: g10, col: '--bd', w: 0.25, dash: '2 2' },
      { a: g10, b: g11, col: '--bd', w: 0.25, dash: '2 2' },
      { a: g11, b: g01, col: '--bd', w: 0.25, dash: '2 2' },
      { a: g01, b: g00, col: '--bd', w: 0.25, dash: '2 2' },

      // Residual droplines from point to fitted plane
      ...rawP.map(p => {
        const pt2d = proj(p.x1, p.x2, p.y);
        const plane2d = proj(p.x1, p.x2, w1 * p.x1 + w2 * p.x2 + b);
        return { a: pt2d, b: plane2d, col: '--p0', w: 0.35 };
      }),

      // Fitted plane wireframe outline
      { a: corners[0], b: corners[1], col: '--ac', w: 0.9 },
      { a: corners[1], b: corners[2], col: '--ac', w: 0.9 },
      { a: corners[2], b: corners[3], col: '--ac', w: 0.9 },
      { a: corners[3], b: corners[0], col: '--ac', w: 0.9 },
      { a: mid1, b: mid2, col: '--mu', w: 0.4 },
      { a: mid3, b: mid4, col: '--mu', w: 0.4 }
    ];

    // Points on canvas
    const pts = rawP.map(p => {
      const [px, py] = proj(p.x1, p.x2, p.y);
      return { x: px, y: py, c: 1, big: true };
    });

    // Subdued plane fill polygon
    const polys = [
      {
        pts: corners,
        fill: '--cd',
        opacity: 0.35,
        col: '--bd'
      }
    ];

    // Axis labels
    const texts = [
      { x: g10[0] + 3, y: g10[1] - 2, text: 'x₁', col: '--mu', size: 3.2 },
      { x: g01[0] - 3, y: g01[1] - 2, text: 'x₂', col: '--mu', size: 3.2 },
      { x: 50, y: 92, text: 'y (target)', col: '--mu', size: 3 }
    ];

    return {
      t,
      d,
      v: mse(),
      x: it,
      pts,
      lines,
      polys,
      texts
    };
  };

  const S = [
    {
      t: 'Multiple Features',
      d: 'Multiple linear regression models y with p features: ŷ = w₁x₁ + w₂x₂ + ... + b. In 2D input space, the model is a tilted 2D plane fitting through the 3D point cloud.',
      pts: rawP.map(p => {
        const [px, py] = proj(p.x1, p.x2, p.y);
        return { x: px, y: py, c: 1, big: true };
      })
    },
    buildFrame(
      'Initial Plane (w₁=0, w₂=0, b=0.5)',
      `We initialize with a flat horizontal plane. Orange segments are 3D vertical residuals (ŷ - y). Starting MSE = ${f3(mse())}, R² = ${f2(r2())}.`
    )
  ];

  [2, 6, 18, 45, 100, 220].forEach(n => {
    while (it < n) {
      const e = rawP.map(p => w1 * p.x1 + w2 * p.x2 + b - p.y);
      const gradW1 = 2 * mean(e.map((err, k) => err * rawP[k].x1));
      const gradW2 = 2 * mean(e.map((err, k) => err * rawP[k].x2));
      const gradB = 2 * mean(e);
      w1 -= 0.45 * gradW1;
      w2 -= 0.45 * gradW2;
      b -= 0.45 * gradB;
      it++;
    }
    S.push(
      buildFrame(
        n === 220 ? 'Optimal Least-Squares Plane' : `After ${n} iterations`,
        `Fitted equation: ŷ = ${f2(w1)}·x₁ + ${f2(w2)}·x₂ + ${f2(b)}. MSE = ${f3(mse())}, R² = ${f2(r2())}.` +
          (n === 220 ? ' The plane minimizes the sum of squared vertical distances across both dimensions simultaneously.' : '')
      )
    );
  });

  return S;
}

export const multipleLinearRegression = {
  slug: 'multiple-linear-regression',
  n: 'Multiple Linear Regression',
  g: 'Supervised',
  gen: multilinreg,
  i: 'Predict a numeric target from two or more correlated features.'
};
