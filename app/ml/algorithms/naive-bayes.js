import { blobs, mean } from './common';

/**
 * Gaussian Naive Bayes Simulation Engine
 * Models features conditionally independent given the class with Gaussian distributions, predicting via Bayes' rule.
 */
export function naiveBayesEngine(r) {
  const P = blobs(r, [[35, 38], [65, 62]], 25, 13);
  const C = [0, 1].map(k => P.filter(p => p.c === k));
  const sd = (a, f) => {
    const m = mean(a.map(p => p[f]));
    return Math.sqrt(mean(a.map(p => (p[f] - m) ** 2)));
  };

  const st = C.map(a => ({
    mx: mean(a.map(p => p.x)),
    my: mean(a.map(p => p.y)),
    sx: sd(a, 'x'),
    sy: sd(a, 'y'),
    pr: a.length / P.length
  }));

  const lp = (s, x, y) =>
    Math.log(s.pr) - Math.log(s.sx * s.sy) - (x - s.mx) ** 2 / (2 * s.sx ** 2) - (y - s.my) ** 2 / (2 * s.sy ** 2);

  const post = (x, y) => {
    const a = lp(st[0], x, y),
      b = lp(st[1], x, y),
      m = Math.max(a, b),
      e0 = Math.exp(a - m),
      e1 = Math.exp(b - m);
    return e1 / (e0 + e1);
  };

  const q = { x: 44 + r() * 14, y: 46 + r() * 12, c: 5, big: 1 };
  const p1 = post(q.x, q.y);
  const mk = st.map((s, k) => ({ x: s.mx, y: s.my, c: k, big: 1 }));
  const el = st.flatMap((s, k) =>
    [1, 2].map(m => ({ x: s.mx, y: s.my, rx: s.sx * m, ry: s.sy * m, col: '--p' + k }))
  );

  const S = [
    {
      t: 'The data',
      d: 'Two labelled classes (orange and blue). Naive Bayes will model each class as a bell curve per feature, then use Bayes’ rule to score new points.',
      pts: P
    },
    {
      t: 'Learn each class',
      d: 'Training is just counting: for each class, compute the mean and standard deviation of x and of y, plus how common the class is. Ellipses show 1σ and 2σ. They are axis-aligned because “naive” means features are assumed independent given the class.',
      pts: [...P, ...mk],
      circles: el
    },
    {
      t: 'Score a new point',
      d: `Multiply each class’s prior by how likely the point’s x and its y are under that class’s bell curves, then normalise. P(blue) = ${(
        p1 * 100
      ).toFixed(0)}%, P(orange) = ${((1 - p1) * 100).toFixed(0)}%. The larger one wins.`,
      pts: [...P, ...mk, { ...q, c: p1 > 0.5 ? 1 : 0 }],
      circles: el
    },
    {
      t: 'Decision regions',
      d: 'Doing this everywhere gives the decision boundary. It curves slightly when the classes have different spreads.',
      pts: [...P, { ...q, c: p1 > 0.5 ? 1 : 0 }],
      field: (x, y) => {
        const p = post(x, y);
        return [p > 0.5 ? 1 : 0, Math.abs(2 * p - 1)];
      }
    }
  ];

  const gx = Array.from({ length: 41 }, (_, i) => i * 2.5);
  const pd = (s, x) => Math.exp(-((x - s.mx) ** 2) / (2 * s.sx ** 2)) / (s.sx * 2.5066);

  S.curve = {
    t: 'Class-conditional density of feature x',
    xl: 'x value',
    yl: 'density',
    x: gx,
    s: [
      { n: 'orange class', y: gx.map(x => pd(st[0], x)), col: '--p0' },
      { n: 'blue class', y: gx.map(x => pd(st[1], x)), col: '--p1' }
    ]
  };

  return S;
}

export const naiveBayes = {
  slug: 'naive-bayes',
  n: 'Naive Bayes',
  g: 'Supervised',
  gen: naiveBayesEngine,
  i: 'Uses Bayes’ rule with per-class bell curves and independent features.'
};
