import { cp, G, mean } from './common';

/**
 * Principal Component Analysis (PCA) Simulation Engine
 * Computes covariance matrix, calculates eigenvectors for maximum variance axes, and projects data.
 */
export function pcaEngine(r) {
  const a = 0.6;
  const P = Array.from({ length: 40 }, () => {
    const t = G(r) * 20, n = G(r) * 4.5;
    return {
      x: cp(50 + t * Math.cos(a) - n * Math.sin(a)),
      y: cp(50 + t * Math.sin(a) + n * Math.cos(a)),
      c: 5
    };
  });

  const mx = mean(P.map(p => p.x)),
    my = mean(P.map(p => p.y)),
    cxx = mean(P.map(p => (p.x - mx) ** 2)),
    cyy = mean(P.map(p => (p.y - my) ** 2)),
    cxy = mean(P.map(p => (p.x - mx) * (p.y - my)));

  const th = 0.5 * Math.atan2(2 * cxy, cxx - cyy),
    tr = (cxx + cyy) / 2,
    df = Math.sqrt(((cxx - cyy) / 2) ** 2 + cxy ** 2),
    l1 = tr + df,
    l2 = tr - df,
    u = [Math.cos(th), Math.sin(th)],
    v = [-u[1], u[0]];

  const ax = (w, s, col, wd) => ({
    a: [mx - w[0] * s, my - w[1] * s],
    b: [mx + w[0] * s, my + w[1] * s],
    col,
    w: wd
  });

  const pr = P.map(p => {
    const t = (p.x - mx) * u[0] + (p.y - my) * u[1];
    return { x: mx + t * u[0], y: my + t * u[1] };
  });

  const ev = Math.round((l1 / (l1 + l2)) * 100);
  const M = { x: mx, y: my, c: 3, big: 1 };

  const S = [
    {
      t: 'The data',
      d: 'Unlabelled points with two features (x and y). They are correlated: when x grows, y tends to grow too. PCA finds the directions along which the data varies most.',
      pts: P
    },
    {
      t: 'Centre the data',
      d: 'First find the mean (purple dot) and treat it as the origin. PCA describes spread around the centre.',
      pts: [...P, M],
      lines: [
        { a: [mx, 0], b: [mx, 100], col: '--mu', w: 0.2, dash: '2 2' },
        { a: [0, my], b: [100, my], col: '--mu', w: 0.2, dash: '2 2' }
      ]
    },
    {
      t: 'Find the principal components',
      d: `The covariance matrix captures how x and y vary together. Its eigenvectors are the principal components: PC1 (white) points along the greatest spread, PC2 (green) is perpendicular. PC1 carries ${ev}% of the variance, PC2 ${100 -
        ev}%.`,
      pts: [...P, M],
      lines: [ax(u, 2.2 * Math.sqrt(l1), '--ac', 1.5), ax(v, 2.2 * Math.sqrt(l2), '--p2', 1.5)]
    },
    {
      t: 'Project onto PC1',
      d: `Dropping each point onto PC1 turns 2 dimensions into 1 while keeping ${ev}% of the variance. The dashed lines show the information thrown away. This is dimensionality reduction.`,
      pts: [...P, ...pr.map(p => ({ ...p, c: 0, r: 1.2 }))],
      lines: [
        ax(u, 2.2 * Math.sqrt(l1), '--ac', 1.5),
        ...P.map((p, i) => ({ a: [p.x, p.y], b: [pr[i].x, pr[i].y], col: '--p0', w: 0.3, dash: '1 1' }))
      ]
    }
  ];

  S.curve = {
    t: 'Variance explained by each component',
    xl: 'component',
    yl: '% of variance',
    bar: 1,
    x: ['PC1', 'PC2'],
    s: [{ n: 'variance', y: [ev, 100 - ev] }]
  };

  return S;
}

export const pca = {
  slug: 'pca',
  n: 'PCA',
  g: 'Unsupervised',
  gen: pcaEngine,
  i: 'Finds the directions of greatest variance to reduce dimensions.'
};
