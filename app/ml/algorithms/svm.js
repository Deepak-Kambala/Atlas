import { blobs, mean, f3 } from './common';

/**
 * Support Vector Machine (SVM) Simulation Engine
 * Finds the maximum margin hyperplane between two classes using subgradient descent on hinge loss with L2 regularization.
 */
export function svmEngine(r) {
  const P = blobs(r, [[32, 38], [68, 62]], 25, 12);
  const U = P.map(p => [(p.x - 50) / 50, (p.y - 50) / 50]);
  const Y = P.map(p => (p.c ? 1 : -1));

  let w = [0.3, -0.2], b = 0, it = 0;
  const z = u => w[0] * u[0] + w[1] * u[1] + b;

  const lineAt = o => {
    const n = w[0] ** 2 + w[1] ** 2;
    const k = (o - b) / n;
    const p = [k * w[0], k * w[1]];
    const q = Math.sqrt(n);
    const d = [-w[1] / q, w[0] / q];
    return {
      a: [50 + 50 * (p[0] - 3 * d[0]), 50 + 50 * (p[1] - 3 * d[1])],
      b: [50 + 50 * (p[0] + 3 * d[0]), 50 + 50 * (p[1] + 3 * d[1])]
    };
  };

  const loss = () => mean(U.map((u, i) => Math.max(0, 1 - Y[i] * z(u)))) + 0.05 * (w[0] ** 2 + w[1] ** 2);
  const acc = () => mean(U.map((u, i) => (z(u) * Y[i] > 0 ? 1 : 0)));

  const fr = (t, d) => ({
    t,
    d,
    v: loss(),
    x: it,
    pts: P.map((p, i) => ({ ...p, ring: z(U[i]) * Y[i] <= 0 })),
    lines: [
      { ...lineAt(0), col: '--ac', w: 1.3 },
      { ...lineAt(1), col: '--ac', w: 0.5, dash: '2 2' },
      { ...lineAt(-1), col: '--ac', w: 0.5, dash: '2 2' }
    ],
    field: (x, y) => {
      const s = z([(x - 50) / 50, (y - 50) / 50]);
      return [s > 0 ? 1 : 0, Math.min(1, Math.abs(s))];
    }
  });

  const step = () => {
    let g = [0, 0], gb = 0;
    U.forEach((u, i) => {
      const y = Y[i], m = y * z(u), c = m < 1 ? -y : 0;
      g[0] += c * u[0];
      g[1] += c * u[1];
      gb += c;
    });
    const n = U.length, lr = 0.3;
    w = [w[0] - lr * (g[0] / n + 0.1 * w[0]), w[1] - lr * (g[1] / n + 0.1 * w[1])];
    b -= lr * gb / n;
    it++;
  };

  const S = [
    {
      t: 'The data',
      d: 'Two labelled classes (orange = 0, blue = 1). A Support Vector Machine looks for the straight boundary with the widest possible margin between them.',
      pts: P
    }
  ];

  [0, 2, 5, 15, 40, 100, 250].forEach((n, k) => {
    while (it < n) step();
    S.push(
      fr(
        k ? `After ${n} steps` : 'Random starting line',
        `Step ${it}: hinge loss = ${f3(loss())}, accuracy = ${Math.round(acc() * 100)}%. Circled points are misclassified. Background shading shows what the model predicts there; dashed lines mark the margin, and only points near or inside it move the line.`
      )
    );
  });

  return S;
}

export const svm = {
  slug: 'svm',
  n: 'SVM',
  g: 'Supervised',
  gen: svmEngine,
  i: 'Finds the boundary with the widest margin between classes.'
};
