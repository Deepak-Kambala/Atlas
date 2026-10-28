import { blobs, mean, f3 } from './common';

/**
 * Logistic Regression Simulation Engine
 * Learns a linear decision boundary using sigmoid probabilities and minimizes cross-entropy (log-loss).
 */
export function logreg(r) {
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

  const loss = () => mean(U.map((u, i) => Math.log(1 + Math.exp(-Y[i] * z(u)))));
  const acc = () => mean(U.map((u, i) => (z(u) * Y[i] > 0 ? 1 : 0)));

  const fr = (t, d) => ({
    t,
    d,
    v: loss(),
    x: it,
    pts: P.map((p, i) => ({ ...p, ring: z(U[i]) * Y[i] <= 0 })),
    lines: [{ ...lineAt(0), col: '--ac', w: 1.3 }],
    field: (x, y) => {
      const s = z([(x - 50) / 50, (y - 50) / 50]);
      return [s > 0 ? 1 : 0, Math.abs(2 / (1 + Math.exp(-s)) - 1)];
    }
  });

  const step = () => {
    let g = [0, 0], gb = 0;
    U.forEach((u, i) => {
      const y = Y[i], m = y * z(u), c = -y / (1 + Math.exp(m));
      g[0] += c * u[0];
      g[1] += c * u[1];
      gb += c;
    });
    const n = U.length;
    w = [w[0] - 1 * (g[0] / n), w[1] - 1 * (g[1] / n)];
    b -= 1 * gb / n;
    it++;
  };

  const S = [
    {
      t: 'The data',
      d: 'Two labelled classes (orange = 0, blue = 1). Logistic regression learns weights w and bias b so that σ(w·x + b) is the probability of class 1. The boundary is where that probability equals 0.5.',
      pts: P
    }
  ];

  [0, 2, 5, 15, 40, 100, 250].forEach((n, k) => {
    while (it < n) step();
    S.push(
      fr(
        k ? `After ${n} steps` : 'Random starting line',
        `Step ${it}: log-loss = ${f3(loss())}, accuracy = ${Math.round(acc() * 100)}%. Circled points are misclassified. Background shading shows what the model predicts there (darker = more confident).`
      )
    );
  });

  return S;
}

export const logisticRegression = {
  slug: 'logistic-regression',
  n: 'Logistic Regression',
  g: 'Supervised',
  gen: logreg,
  i: 'Predicts a class using a probability from a linear boundary.'
};
