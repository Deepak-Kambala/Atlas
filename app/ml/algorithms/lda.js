import { G, cp, f2, f3, mean, dist } from './common';

/**
 * Linear Discriminant Analysis (LDA) Simulation Engine
 * Finds the projection axis that maximizes between-class variance relative to within-class variance.
 */
export function lda(r) {
  // Two correlated 2D Gaussian classes
  const c1 = Array.from({ length: 18 }, () => ({
    x: cp(30 + G(r) * 8 + G(r) * 6),
    y: cp(65 + G(r) * 8 - G(r) * 4),
    c: 1
  }));

  const c2 = Array.from({ length: 18 }, () => ({
    x: cp(68 + G(r) * 8 + G(r) * 5),
    y: cp(36 + G(r) * 8 - G(r) * 5),
    c: 0
  }));

  const P = [...c1, ...c2];

  // 1. Calculate class means
  const mu1 = { x: mean(c1.map(p => p.x)), y: mean(c1.map(p => p.y)) };
  const mu2 = { x: mean(c2.map(p => p.x)), y: mean(c2.map(p => p.y)) };

  // 2. Calculate within-class scatter matrix S_W (2x2)
  let sw11 = 0, sw12 = 0, sw22 = 0;
  c1.forEach(p => {
    const dx = p.x - mu1.x, dy = p.y - mu1.y;
    sw11 += dx * dx; sw12 += dx * dy; sw22 += dy * dy;
  });
  c2.forEach(p => {
    const dx = p.x - mu2.x, dy = p.y - mu2.y;
    sw11 += dx * dx; sw12 += dx * dy; sw22 += dy * dy;
  });

  // 3. Inverse of S_W: [sw22 -sw12; -sw12 sw11] / det
  const det = sw11 * sw22 - sw12 * sw12 + 1e-9;
  const inv11 = sw22 / det;
  const inv12 = -sw12 / det;
  const inv22 = sw11 / det;

  // 4. w = S_W^(-1) * (mu1 - mu2)
  const dmuX = mu1.x - mu2.x;
  const dmuY = mu1.y - mu2.y;
  let wx = inv11 * dmuX + inv12 * dmuY;
  let wy = inv12 * dmuX + inv22 * dmuY;
  const wNorm = Math.hypot(wx, wy);
  wx /= wNorm;
  wy /= wNorm;

  // Midpoint between projected means for decision threshold
  const midX = (mu1.x + mu2.x) / 2;
  const midY = (mu1.y + mu2.y) / 2;

  // Project points onto line passing through (midX, midY) along (wx, wy)
  const project = p => {
    const dot = (p.x - midX) * wx + (p.y - midY) * wy;
    return {
      x: midX + dot * wx,
      y: midY + dot * wy,
      score: dot
    };
  };

  // Separation axis end points across canvas
  const axisP1 = [midX - wx * 60, midY - wy * 60];
  const axisP2 = [midX + wx * 60, midY + wy * 60];

  // Perpendicular boundary line through midpoint
  const bndP1 = [midX - wy * 50, midY + wx * 50];
  const bndP2 = [midX + wy * 50, midY - wx * 50];

  const S = [
    {
      t: '1. Two Overlapping Classes',
      d: 'LDA models the distribution of data for each class. Unlike PCA (which looks for total spread), LDA specifically seeks an axis that separates the classes with minimal internal overlap.',
      pts: P,
      texts: [
        { x: 25, y: 88, text: 'Class 1 (Blue)', col: '--p1', size: 3.2 },
        { x: 75, y: 15, text: 'Class 2 (Orange)', col: '--p0', size: 3.2 }
      ]
    },
    {
      t: '2. Class Centroids & Within-Class Scatter',
      d: `Centroids computed: μ₁ = (${f2(mu1.x)}, ${f2(mu1.y)}), μ₂ = (${f2(mu2.x)}, ${f2(mu2.y)}). Ellipses indicate within-class covariance (S_W).`,
      pts: P,
      circles: [
        { x: mu1.x, y: mu1.y, rx: 12, ry: 8, col: '--p1', w: 0.8 },
        { x: mu2.x, y: mu2.y, rx: 12, ry: 8, col: '--p0', w: 0.8 }
      ],
      lines: [
        { a: [mu1.x, mu1.y], b: [mu2.x, mu2.y], col: '--mu', w: 0.6, dash: '2 2' }
      ],
      texts: [
        { x: mu1.x, y: mu1.y - 4, text: 'μ₁', col: '--p1', size: 3.5 },
        { x: mu2.x, y: mu2.y + 4, text: 'μ₂', col: '--p0', size: 3.5 }
      ]
    },
    {
      t: '3. Optimal Fisher Projection Axis',
      d: `Fisher criterion maximizes between-class variance S_B over within-class variance S_W: w = S_W⁻¹(μ₁ - μ₂). Direction w = [${f2(wx)}, ${f2(wy)}].`,
      pts: P,
      lines: [
        { a: axisP1, b: axisP2, col: '--ac', w: 1.2 }
      ],
      texts: [
        { x: axisP2[0] + 2, y: axisP2[1] + 2, text: 'Discriminant Axis (w)', col: '--ac', size: 3 }
      ]
    },
    {
      t: '4. Projecting Data onto Discriminant Vector',
      d: 'Points are orthogonally projected onto w. Notice that in 1D along this axis, the two classes are cleanly partitioned with minimal overlap.',
      pts: [
        ...P.map(p => ({ ...p, h: true })), // ghost original
        ...P.map(p => {
          const pr = project(p);
          return { x: pr.x, y: pr.y, c: p.c, big: true };
        })
      ],
      lines: [
        { a: axisP1, b: axisP2, col: '--ac', w: 1.2 },
        // projection droplines
        ...P.map(p => {
          const pr = project(p);
          return { a: [p.x, p.y], b: [pr.x, pr.y], col: p.c === 1 ? '--p1' : '--p0', w: 0.25, dash: '1 2' };
        })
      ]
    },
    {
      t: '5. Decision Boundary & Classification Threshold',
      d: 'A threshold at the midpoint along w defines the optimal separating hyperplane (perpendicular to w). Any new point x is classified by sign(w·x - threshold).',
      pts: P,
      field: (x, y) => {
        const dot = (x - midX) * wx + (y - midY) * wy;
        return [dot > 0 ? 1 : 0, Math.min(1, Math.abs(dot) / 25)];
      },
      lines: [
        { a: axisP1, b: axisP2, col: '--mu', w: 0.6, dash: '2 2' },
        { a: bndP1, b: bndP2, col: '--ac', w: 1.5 }
      ],
      texts: [
        { x: bndP1[0] - 2, y: bndP1[1] + 3, text: 'LDA Decision Boundary', col: '--ac', size: 3.2 }
      ],
      v: 1.0,
      x: 5
    }
  ];

  return S;
}

export const ldaClassifier = {
  slug: 'lda',
  n: 'Linear Discriminant Analysis (LDA)',
  g: 'Supervised',
  gen: lda,
  i: 'Finds a linear projection that maximizes class separability.'
};
