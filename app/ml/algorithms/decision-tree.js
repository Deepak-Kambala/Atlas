import { blobs, f3 } from './common';

/**
 * Decision Tree Simulation Engine
 * Recursively selects orthogonal feature splits that minimize weighted Gini impurity.
 */
export function decisionTreeEngine(r, maxD) {
  const P = blobs(r, [[25, 30], [72, 28], [50, 76], [75, 70]], 14, 10);

  const gini = a => {
    if (!a.length) return 0;
    const c = {};
    a.forEach(p => (c[p.c] = (c[p.c] || 0) + 1));
    return 1 - Object.values(c).reduce((s, v) => s + (v / a.length) ** 2, 0);
  };

  const best = a => {
    let B = null;
    ['x', 'y'].forEach(f => {
      const v = a.map(p => p[f]).sort((p, q) => p - q);
      for (let i = 1; i < v.length; i++) {
        if (v[i] === v[i - 1]) continue;
        const t = (v[i] + v[i - 1]) / 2;
        const L = a.filter(p => p[f] <= t);
        const Q = a.filter(p => p[f] > t);
        const g = (L.length * gini(L) + Q.length * gini(Q)) / a.length;
        if (!B || g < B.g) B = { f, t, g, L, R: Q };
      }
    });
    return B;
  };

  const maj = a => {
    const c = [0, 0, 0, 0, 0];
    a.forEach(p => c[p.c]++);
    return c.indexOf(Math.max(...c));
  };

  let LV = [{ a: P, r: [0, 0, 100, 100], d: 0 }];
  const seg = [], S = [];

  const fr = (t, d) => {
    const L = LV;
    return {
      t,
      d,
      v: L.reduce((s, l) => s + l.a.length * gini(l.a), 0) / P.length,
      x: S.length,
      pts: P,
      lines: seg.map(s => ({ ...s, col: '--tx', w: 1 })),
      field: (x, y) => {
        const l = L.find(l => x >= l.r[0] && x < l.r[2] && y >= l.r[1] && y < l.r[3]) || L[0];
        return [maj(l.a), 0.85 - gini(l.a)];
      }
    };
  };

  S.push(
    fr(
      'No splits yet',
      `Four labelled classes. With no questions asked, the best guess everywhere is the majority class. Gini impurity = ${f3(
        gini(P)
      )} (0 means perfectly pure, higher means more mixed).`
    )
  );

  const q = [LV[0]];
  while (q.length) {
    const n = q.shift();
    if (n.d >= maxD || n.a.length < 4 || gini(n.a) < 0.02) continue;
    const s = best(n.a);
    if (!s) continue;

    const [x0, y0, x1, y1] = n.r;
    const vx = s.f === 'x';
    const c1 = { a: s.L, r: vx ? [x0, y0, s.t, y1] : [x0, y0, x1, s.t], d: n.d + 1 };
    const c2 = { a: s.R, r: vx ? [s.t, y0, x1, y1] : [x0, s.t, x1, y1], d: n.d + 1 };

    LV = LV.filter(l => l !== n).concat(c1, c2);
    q.push(c1, c2);
    seg.push({ a: vx ? [s.t, y0] : [x0, s.t], b: vx ? [s.t, y1] : [x1, s.t] });

    S.push(
      fr(
        `Split ${S.length}: ${s.f} ≤ ${s.t.toFixed(0)}?`,
        `This region had Gini ${f3(gini(n.a))}. The tree tries every threshold on x and y and keeps the question that makes the two halves purest (weighted Gini ${f3(
          s.g
        )}). Each region predicts its majority class.`
      )
    );
  }

  S.push(
    fr(
      'Finished',
      `The tree stopped because regions are pure enough or max depth (${maxD}) was reached. Every new point follows the questions to a region and takes its class. Deeper trees fit the training data more tightly but risk over-fitting.`
    )
  );

  return S;
}

export const decisionTree = {
  slug: 'decision-tree',
  n: 'Decision Tree',
  g: 'Supervised',
  gen: decisionTreeEngine,
  pm: ['max depth', 1, 4, 3],
  i: 'Learns a series of yes/no questions that split the data into pure regions.'
};
